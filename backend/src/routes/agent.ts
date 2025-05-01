import express from 'express';
import {Prisma, PrismaClient} from '@prisma/client';
import {encryptMessage} from '../utils/Encryption.ts';
import {createAgentHCSHederaClient, createHCSHederaClient} from "../utils/HederaClient.js";
import {AgentBuilder, AIAgentCapability, HCS10Client} from "@hashgraphonline/standards-sdk";
import fs from "fs";
import path from "path";

const router = express.Router();
const prisma = new PrismaClient();

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import MessageMonitor from "../utils/MessageMonitor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


router.get('/agents/filter-options', async (req, res) => {
    try {
        const models = await prisma.agent.groupBy({
            by: ['model'],
            _count: { model: true },
            orderBy: { _count: { model: 'desc' } },
            take: 10,
        });

        const purposes = await prisma.agent.groupBy({
            by: ['purpose'],
            _count: { purpose: true },
            orderBy: { _count: { purpose: 'desc' } },
            take: 10,
        });

        const tagsRaw = await prisma.agentTag.groupBy({
            by: ['value'],
            _count: { value: true },
            orderBy: { _count: { value: 'desc' } },
            take: 10,
        });

        const tagList = tagsRaw
            .map(tag => tag.value)
            .filter(value => value && value.trim() !== '');

        return res.json({
            models: models.map(m => m.model),
            purposes: purposes.map(p => p.purpose),
            tags: tagList,
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Server error fetching filter options' });
    }
});

// GET all agents
router.get('/agents', async (req, res) => {
    try {
        const agents = await prisma.agent.findMany({
            include: { tags: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(agents);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single agent
router.get('/agents/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const agent = await prisma.agent.findUnique({
            where: { slug },
            include: { tags: true },
        });
        if (!agent) return res.status(404).json({ error: 'Agent not found' });
        res.json(agent);
    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create agent
router.post('/agents', async (req, res) => {
    const {
        name,
        slug,
        description,
        instructions,
        purpose,
        model,
        creditsPerTask,
        imageUrl,
        network,
        walletAddress,
        apiKey,
        tags = [],
    } = req.body;

    try {

        /**
         * Set Defaults
         */
        let encryptedKey = null;


        /**
         * Create Hedera Agent
         */
        const client = createHCSHederaClient();

        const capabilities = [
            AIAgentCapability.TEXT_GENERATION
        ];

        if( model == 'dalle-e' ){
            capabilities.push([
                AIAgentCapability.IMAGE_GENERATION
            ]);
        }

        // Profile picture
        const imagePath = path.join(__dirname, '../../public/profile.png');
        const imageBuffer = fs.readFileSync(imagePath);
        const fileName = imagePath.split('/').pop() || 'profile.png';

        // Create a standard agent
        const agentBuilder = new AgentBuilder()
            .setName( name )
            .setBio( description )
            // .setProfilePicture( imageBuffer, fileName)
            .setType('manual') // 'manual' or 'autonomous'
            .setCapabilities( capabilities )
            .setModel( model ) // AI model used
            .setNetwork( process.env.HEDERA_NETWORK ) // Must match client network
            .setMetadata({
                // Optional metadata
                creator: walletAddress,
                properties: {
                    specialization: purpose,
                    supportedLanguages: ['en'],
                },
            });

        // Create and register the agent
        const result = await client.createAndRegisterAgent(agentBuilder, {
            progressCallback: (progress: { stage: any; progressPercent: any; }) => {
                console.log(`${progress.stage}: ${progress.progressPercent}%`);
            },
        });


        if (result.success) {
            console.log('Result: ', result );
            console.log('Result Metadata: ', result.metadata )

            console.log(`Agent created: ${result.metadata.accountId}`);
            console.log(`Inbound Topic: ${result.metadata.inboundTopicId}`);
            console.log(`Outbound Topic: ${result.metadata.outboundTopicId}`);
            console.log(`Profile Topic: ${result.metadata.profileTopicId}`);

            // Store these securely - they're needed to operate the agent
            const agentPrivateKey = result.metadata.privateKey;

            encryptedKey = agentPrivateKey ? encryptMessage( agentPrivateKey ) : null;

            const agent = await prisma.agent.create({
                data: {
                    name,
                    slug,
                    description,
                    instructions,
                    purpose,
                    model,
                    creditsPerTask,
                    imageUrl,
                    network,
                    walletAddress,

                    accountId: result.metadata.accountId,
                    inboundTopicId: result.metadata.inboundTopicId,
                    outboundTopicId: result.metadata.inboundTopicId,
                    profileTopicId: result.metadata.profileTopicId,
                    privateKeyEncrypted: encryptedKey,
                    tags: {
                        create: tags.map((tag: string) => ({ value: tag })),
                    },
                },
                include: { tags: true },
            });

            res.status(201).json(agent);

            return;
        }


        res.status(500);
    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT update agent
router.put('/agents/:slug', async (req, res) => {
    const { slug } = req.params;
    const {
        name,
        description,
        instructions,
        purpose,
        model,
        creditsPerTask,
        imageUrl,
        apiKey,
        tags = [],
    } = req.body;

    try {
        const existing = await prisma.agent.findUnique({ where: { slug } });
        if (!existing) return res.status(404).json({ error: 'Agent not found' });

        const updated = await prisma.agent.update({
            where: { slug },
            data: {
                name,
                description,
                instructions,
                purpose,
                model,
                creditsPerTask,
                imageUrl,
                apiKeyEncrypted: apiKey ? encryptMessage(apiKey) : existing.apiKeyEncrypted,
                tags: {
                    deleteMany: {},
                    create: tags.map((tag: string) => ({ value: tag })),
                },
            },
            include: { tags: true },
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE agent
router.delete('/agents/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        await prisma.agent.delete({ where: { slug } });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/my-agents/:walletAddress
router.get('/my-agents/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const agents = await prisma.agent.findMany({
            where: { walletAddress },
            include: {
                AgentRating: true,
                CreditTransaction: true,
                tags: true,
                _count: { select: { AgentRating: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const enhancedAgents = agents.map((agent) => {
            const tasksDone = agent.CreditTransaction.filter(tx => tx.type === 'revenue_share').length;

            const lifetimeValue = agent.CreditTransaction
                .filter(tx => tx.type === 'revenue_share')
                .reduce((sum, tx) => sum + parseFloat(tx.credits.toString()), 0);

            const avgRating = agent.AgentRating.length > 0
                ? agent.AgentRating.reduce((sum, r) => sum + r.rating, 0) / agent.AgentRating.length
                : 0;

            return {
                ...agent,
                tasksDone,
                avgRating: parseFloat(avgRating.toFixed(2)),
                lifetimeValue: parseFloat(lifetimeValue.toFixed(2)),
            };
        });

        return res.json(enhancedAgents);
    } catch (error) {
        console.error('Error loading user agents:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


/**
 * POST /api/agent/pay
 * Body: { walletAddress: string, agentId: number }
 */
router.post('/agent/pay', async (req, res) => {
    const { walletAddress, agentId } = req.body;

    if (!walletAddress || !agentId) {
        return res.status(400).json({ error: 'Missing walletAddress or agentId' });
    }

    try {
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
        });

        if (!agent) return res.status(404).json({ error: 'Agent not found' });

        if (agent.creditsPerTask === 0) {
            return res.json({ success: true });
        }

        const user = await prisma.user.findUnique({
            where: { walletAddress },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.credits < agent.creditsPerTask) {
            return res.status(400).json({ error: 'Insufficient credits. Please recharge your account.' });
        }

        const platformPercent = parseInt(process.env.REVENUE_SHARE_PERCENT || '20', 10);
        const ownerPercent = 100 - platformPercent;

        const agentOwnerWallet = agent.walletAddress;
        const ownerShare = parseFloat(((ownerPercent / 100) * agent.creditsPerTask).toFixed(2));
        const platformShare = parseFloat(((platformPercent / 100) * agent.creditsPerTask).toFixed(2));

        // Start a transaction (important for consistency)
        await prisma.$transaction(async (tx) => {
            // 1. Deduct total credits from user
            await tx.user.update({
                where: { walletAddress },
                data: { credits: { decrement: agent.creditsPerTask } },
            });

            // 2. Record usage
            await tx.creditTransaction.create({
                data: {
                    walletAddress,
                    credits: -agent.creditsPerTask,
                    type: 'usage',
                    agentId: agent.id,
                    network: 'testnet',
                },
            });

            // 3. Give the agent owner their share
            if (agentOwnerWallet && ownerShare > 0) {
                await tx.user.update({
                    where: { walletAddress: agentOwnerWallet },
                    data: { credits: { increment: new Prisma.Decimal(ownerShare) } },
                });

                await tx.creditTransaction.create({
                    data: {
                        walletAddress: agentOwnerWallet,
                        credits: new Prisma.Decimal(ownerShare),
                        type: 'revenue_share',
                        agentId: agent.id,
                        network: 'testnet',
                    },
                });
            }

            // 4. Record that a task has started (new ChatHistory)
            await tx.chatHistory.create({
                data: {
                    agentId: agent.id,
                    walletAddress: walletAddress,
                    messages: [], // Initially empty chat
                },
            });
        });

        return res.json({ success: true });

    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});








export default router;
