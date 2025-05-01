import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/credits/purchase', async (req, res) => {
    const { walletAddress, credits, network, txHash } = req.body;

    if (!walletAddress || !credits || !txHash) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    let floatCredits = parseFloat(credits);

    try {
        // Create user if they don't exist
        await prisma.user.upsert({
            where: { walletAddress },
            update: {}, // no update needed if found
            create: {
                walletAddress,
                credits: floatCredits,
            },
        });

        // Log the transaction
        const transaction = await prisma.creditTransaction.create({
            data: {
                walletAddress,
                credits: floatCredits,
                network,
                txHash,
            },
        });

        // Increment credits
        await prisma.user.update({
            where: { walletAddress },
            data: {
                credits: {
                    increment: floatCredits,
                },
            },
        });

        return res.status(200).json({ success: true, transactionId: transaction.id });
    } catch (err) {
        console.error('Purchase error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/credits/history/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Missing walletAddress' });
    }

    try {
        const history = await prisma.creditTransaction.findMany({
            where: { walletAddress },
            orderBy: { createdAt: 'desc' },
            include: { agent: true }
        });

        res.json(history);
    } catch (err) {
        console.error('Failed to fetch credit history:', err);
        res.status(500).json({ error: 'Server error' });
    }
});



export default router;