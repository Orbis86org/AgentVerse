import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getAgentExecutor } from '../agent';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {createAgentExecutorFromDb} from "../utils/createAgentExecutor.ts";

const router = express.Router();
const prisma = new PrismaClient();

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
