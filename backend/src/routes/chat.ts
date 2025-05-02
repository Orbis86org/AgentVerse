import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getAgentExecutor } from '../agent';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {createAgentExecutorFromDb} from "../utils/createAgentExecutor.ts";
import {HCS10Client} from "@hashgraphonline/standards-sdk";
import {createAgentHCSHederaClient} from "../utils/HederaClient.js";
import {decryptMessage, encryptMessage} from "../utils/Encryption.js";

const router = express.Router();
const prisma = new PrismaClient();

export async function waitForAgentResponse(
    client: HCS10Client,
    connectionTopicId: string,
    requestId: number,
    maxAttempts: number = 15,
    delayMs: number = 2000
): Promise<any | null> {
    let attempts = 0;
    let lastSeenTimestamp = 0; // Start at 0 to capture earliest messages

    while (attempts < maxAttempts) {
        console.log('Running attempt: ', attempts);
        const { messages } = await client.getMessages(connectionTopicId);

        console.log(messages);

        for (const message of messages) {
            if (message.op !== 'message') continue;

            const consensusTs = Number(message.consensus_timestamp);
            if (consensusTs <= lastSeenTimestamp) continue;

            console.log('ConsensusTs passed')

            let content = message.data;
            if (typeof content === 'string') {
                try {
                    content = await client.getMessageContent(content);

                    console.log( 'Content: ', content);
                } catch (err) {
                    console.warn('Failed to fetch inscribed content:', err);
                    continue;
                }
            }

            let parsed;
            try {
                parsed = typeof content === 'string' ? JSON.parse(content) : content;
            } catch {
                continue;
            }

            console.log('Parsed Content: ', parsed )

            if (parsed?.type === 'response' && parsed.requestId === requestId) {
                return parsed;
            }

            lastSeenTimestamp = Math.max(lastSeenTimestamp, consensusTs);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        attempts++;
    }

    return null; // No matching response received in time
}



// POST /chat
router.post('/chat', async (req, res) => {
    const { input, agentSlug, walletAddress } = req.body;
    if (!input || !agentSlug || !walletAddress) {
        return res.status(400).json({ error: 'Missing input, agentSlug, or walletAddress' });
    }

    try {
        const agent = await prisma.agent.findUnique({ where: { slug: agentSlug } });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });


        const agentExecutor = await createAgentExecutorFromDb(agent);

        const result = await agentExecutor.invoke({ input });

        const chatHistory = await prisma.chatHistory.create({
            data: {
                agentId: agent.id,
                walletAddress,
                messages: [],
            },
        });

        const baseTimestamp = new Date();
        const messagesToCreate = [];

        if (agent.instructions) {
            messagesToCreate.push({
                id: crypto.randomUUID(),
                chatHistoryId: chatHistory.id,
                role: 'system',
                content: agent.instructions,
                timestamp: baseTimestamp,
            });
        }

        messagesToCreate.push(
            {
                id: crypto.randomUUID(),
                chatHistoryId: chatHistory.id,
                role: 'user',
                content: input,
                timestamp: baseTimestamp,
            },
            {
                id: crypto.randomUUID(),
                chatHistoryId: chatHistory.id,
                role: 'assistant',
                content: result.output,
                timestamp: new Date(),
            }
        );

        await prisma.chatMessage.createMany({ data: messagesToCreate });

        res.json({ output: result.output });
    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/chat-hcs', async (req, res) => {
    const { input, agentSlug, walletAddress } = req.body;

    if (!input || !agentSlug || !walletAddress) {
        return res.status(400).json({ error: 'Missing input, agentSlug, or walletAddress' });
    }

    try {
        const agent = await prisma.agent.findUnique({ where: { slug: agentSlug } });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        /**
         * Get default agent
         */
        const defaultAgentClient = new HCS10Client({
            network: process.env.HEDERA_NETWORK, // Network: 'testnet' or 'mainnet'
            operatorId: process.env.TODD_ACCOUNT_ID, // Your Hedera account ID
            operatorPrivateKey: process.env.TODD_PRIVATE_KEY, // Your Hedera private key
            logLevel: 'info', // Optional: 'debug', 'info', 'warn', 'error'
            prettyPrint: true, // Optional: prettier console output
            guardedRegistryBaseUrl: 'https://moonscape.tech', // Optional: registry URL
            // feeAmount: 1, // Optional: default fee in HBAR
        });

        /**
         * Connect to agent
         */
        // Prepare connection request
        const targetInboundTopicId = agent.inboundTopicId; // Target agent's inbound topic
        const memo = input;

        // Submit connection request
        const result = await defaultAgentClient.submitConnectionRequest(
            targetInboundTopicId,
            memo
        );

        // Get connection request ID
        const requestId = result.topicSequenceNumber.toNumber();

        // Wait for connection confirmation
        const confirmation = await defaultAgentClient.waitForConnectionConfirmation(
            targetInboundTopicId,
            requestId,
            60, // Maximum wait time (seconds)
            2000, // Polling interval (milliseconds)
            true // Optional: Record confirmation on outbound topic (default: true)
        );

        // Connection established - shared topic created
        const connectionTopicId = confirmation.connectionTopicId;


        console.log('Sending message to HCS-10 agent.........')
        console.log( input );

        await defaultAgentClient.sendMessage(
            connectionTopicId,
            JSON.stringify({
                type: 'query',
                question: encryptMessage( input ),
                requestId: requestId,
                parameters: {
                    agent: agent,
                    walletAddress: walletAddress,
                },
            })
        );


        const response = await waitForAgentResponse(
            defaultAgentClient,
            connectionTopicId,
            requestId
        );

        let agent_response;

        if (response) {
            console.log('Agent replied:', response.response);

            agent_response = decryptMessage( response.response );
        } else {
            console.warn('No response received in time.');

            agent_response = 'No response received in time.';
        }

        const chatHistory = await prisma.chatHistory.create({
            data: {
                agentId: agent.id,
                walletAddress,
                messages: [],
            },
        });

        const baseTimestamp = new Date();
        const messagesToCreate = [];

        if (agent.instructions) {
            messagesToCreate.push({
                id: crypto.randomUUID(),
                chatHistoryId: chatHistory.id,
                role: 'system',
                content: agent.instructions,
                timestamp: baseTimestamp,
            });
        }


        messagesToCreate.push(
            {
                id: crypto.randomUUID(),
                chatHistoryId: chatHistory.id,
                role: 'user',
                content: input,
                timestamp: baseTimestamp,
            },
            {
                id: crypto.randomUUID(),
                chatHistoryId: chatHistory.id,
                role: 'assistant',
                content: agent_response,
                timestamp: new Date(),
            }
        );

        await prisma.chatMessage.createMany({ data: messagesToCreate });

        res.json({ output: agent_response });

    }catch (error: any) {
        console.error('HCS Chat Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// POST /chat/history/:slug
router.get('/chat/history/:slug', async (req, res) => {
    const { slug } = req.params;
    const { walletAddress } = req.query;

    if (!slug || !walletAddress) {
        return res.status(400).json({ error: 'Missing slug or walletAddress' });
    }

    try {
        const agent = await prisma.agent.findUnique({ where: { slug } });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        const history = await prisma.chatHistory.findFirst({
            where: {
                agentId: agent.id,
                walletAddress: walletAddress as string,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                ChatMessage: {
                    orderBy: { timestamp: 'asc' },
                    select: {
                        id: true,
                        role: true,
                        content: true,
                        timestamp: true,
                    },
                },
            },
        });

        if (!history) {
            return res.json({ messages: [] });
        }

        res.json({ messages: history.ChatMessage });
    } catch (err) {
        console.error('History fetch error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// DELETE /chat/history/:slug
router.delete('/chat/history/:slug', async (req, res) => {
    const { slug } = req.params;
    const { walletAddress } = req.body;

    if (!slug || !walletAddress) {
        return res.status(400).json({ error: 'Missing slug or walletAddress' });
    }

    try {
        const agent = await prisma.agent.findUnique({ where: { slug } });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        await prisma.chatHistory.deleteMany({
            where: {
                agentId: agent.id,
                walletAddress,
            },
        });

        res.status(204).end();
    } catch (err) {
        console.error('History delete error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
