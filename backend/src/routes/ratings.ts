// src/routes/agentRatings.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/agent/ratings/:slug', async (req, res) => {
    const { slug } = req.params;
    const { walletAddress } = req.query;

    try {
        const agent = await prisma.agent.findUnique({ where: { slug } });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        const ratings = await prisma.agentRating.findMany({
            where: { agentId: agent.id },
        });

        const totalRatings = ratings.length;
        const averageRating =
            totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;

        let myRating = null;
        if (walletAddress) {
            const existing = await prisma.agentRating.findUnique({
                where: {
                    agentId_walletAddress: {
                        agentId: agent.id,
                        walletAddress: walletAddress.toString(),
                    },
                },
            });
            if (existing) myRating = existing.rating;
        }

        return res.json({ averageRating, totalRatings, myRating });
    } catch (error) {
        console.error('Error fetching agent ratings:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/agent/feedback', async (req, res) => {
    const { agentId, walletAddress, rating, comment } = req.body;

    if (!agentId || !walletAddress || !rating) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existing = await prisma.agentRating.findUnique({
            where: {
                agentId_walletAddress: { agentId, walletAddress },
            },
        });

        if (existing) {
            await prisma.agentRating.update({
                where: { agentId_walletAddress: { agentId, walletAddress } },
                data: { rating, comment },
            });
        } else {
            await prisma.agentRating.create({
                data: { agentId, walletAddress, rating, comment },
            });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// src/routes/agentRatings.ts (continued)

router.delete('/agent/feedback/:agentId/:walletAddress', async (req, res) => {
    const { agentId, walletAddress } = req.params;

    try {
        await prisma.agentRating.delete({
            where: {
                agentId_walletAddress: {
                    agentId: parseInt(agentId),
                    walletAddress: walletAddress.toString(),
                },
            },
        });

        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


export default router;

