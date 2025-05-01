// src/routes/user.ts
import express from 'express';
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create new user if wallet doesn't exist
router.post('/profile', async (req, res) => {
    const { walletAddress, name, email } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress is required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { walletAddress },
        });

        if (existingUser) {
            return res.status(200).json(existingUser); // already exists, return it
        }

        const newUser = await prisma.user.create({
            data: {
                walletAddress,
                name: name || null,
                email: email || null,
            },
        });

        return res.status(201).json(newUser);
    } catch (error: any) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Update profile
router.put('/profile/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;
    const { name, email } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { walletAddress },
            data: {
                name,
                email,
            },
        });
        return res.json(updatedUser);
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Get profile
router.get('/profile/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { walletAddress },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json(user);
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

export default router;
