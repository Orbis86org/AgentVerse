import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getAgentExecutor } from '../agent';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {createAgentExecutorFromDb} from "../utils/createAgentExecutor.ts";
import { HCS10Client } from "@hashgraphonline/standards-sdk";
import { createAgentHCSHederaClient } from "../utils/HederaClient.js";
import { decryptMessage, encryptMessage } from "../utils/Encryption.js";
import fs from "fs";
import path from "path";
import messageMonitor from "../utils/MessageMonitor.js";
import connectionManager from "../utils/ConnectionManager.js";
import express from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const router = express.Router();
const prisma = new PrismaClient();

const CACHE_FILE = path.resolve("connection-cache.json");

interface CachedConnection {
    topicId: string;
    requestId: number;
}

let cache: Record<string, CachedConnection> = {};

if (fs.existsSync(CACHE_FILE)) {
    try {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    } catch (err) {
        console.warn("Failed to load cache file:", err);
    }
}

export function getConnectionKey(agentAccountId: string, walletAddress: string): string {
    return `${agentAccountId}:${walletAddress}`;
}

export function getCachedConnection(agentAccountId: string, walletAddress: string): CachedConnection | null {
    return cache[getConnectionKey(agentAccountId, walletAddress)] || null;
}

export async function waitForAgentResponse(
    client: HCS10Client,
    connectionTopicId: string,
    requestId: number | string,
    maxAttempts: number = 60,
    delayMs: number = 5000
): Promise<any | null> {
    let attempts = 0;
    let lastSeenTimestamp = 0;

    while (attempts < maxAttempts) {
        console.log("Running attempt:", attempts);
        const { messages } = await client.getMessages(connectionTopicId);

        for (const message of messages) {
            if (message.op !== "message") continue;

            const consensusTs = Number(message.consensus_timestamp);
            if (consensusTs <= lastSeenTimestamp) continue;

            let content = message.data;
            if (typeof content === "string") {
                try {
                    content = await client.getMessageContent(content);
                } catch (err) {
                    console.warn("Failed to fetch inscribed content:", err);
                    continue;
                }
            }

            let parsed;
            try {
                parsed = typeof content === "string" ? JSON.parse(content) : content;
            } catch {
                continue;
            }

            if (parsed?.type === "response" && parsed.requestId === requestId) {
                return parsed;
            }

            lastSeenTimestamp = Math.max(lastSeenTimestamp, consensusTs);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        attempts++;
    }

    return null;
}

router.post("/chat-hcs", async (req, res) => {
    const { input, agentSlug, walletAddress } = req.body;

    if (!input || !agentSlug || !walletAddress) {
        return res.status(400).json({ error: "Missing input, agentSlug, or walletAddress" });
    }

    try {
        const agent = await prisma.agent.findUnique({ where: { slug: agentSlug } });
        if (!agent) return res.status(404).json({ error: "Agent not found" });

        const defaultAgentClient = new HCS10Client({
            network: process.env.HEDERA_NETWORK,
            operatorId: process.env.TODD_ACCOUNT_ID,
            operatorPrivateKey: process.env.TODD_PRIVATE_KEY,
            logLevel: "info",
            prettyPrint: true,
            guardedRegistryBaseUrl: "https://moonscape.tech",
        });

        const memo = input;
        let connectionTopicId: string;
        let requestId: number;

        const targetInboundTopicId = agent.inboundTopicId;
        const result = await defaultAgentClient.submitConnectionRequest(targetInboundTopicId, memo);
        requestId = result.topicSequenceNumber.toNumber();

        console.log('Wait For Connection Confirmation: ', targetInboundTopicId,
            requestId );

        const confirmation = await defaultAgentClient.waitForConnectionConfirmation(
            targetInboundTopicId,
            requestId,
            60,
            2000,
            true
        );

        connectionTopicId = confirmation.connectionTopicId;

        await defaultAgentClient.sendMessage(
            connectionTopicId,
            JSON.stringify({
                type: "query",
                question: encryptMessage(input),
                requestId,
                parameters: {
                    agent,
                    walletAddress,
                },
            })
        );

        const response = await waitForAgentResponse(defaultAgentClient, connectionTopicId, requestId);

        let agent_response;

        if (response) {
            agent_response = decryptMessage(response.response);
        } else {
            agent_response = "No response received in time.";
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
                role: "system",
                content: agent.instructions,
                timestamp: baseTimestamp,
            });
        }

        messagesToCreate.push(
            {
                id: crypto.randomUUID(),
                chatHistoryId: chatHistory.id,
                role: "user",
                content: input,
                timestamp: baseTimestamp,
            },
            {
                id: crypto.randomUUID(),
                chatHistoryId: chatHistory.id,
                role: "assistant",
                content: agent_response,
                timestamp: new Date(),
            }
        );

        await prisma.chatMessage.createMany({ data: messagesToCreate });

        res.json({ output: agent_response });
    } catch (error: any) {
        console.error("HCS Chat Error:", error);
        return res.status(500).json({ error: error.message });
    }
});


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
