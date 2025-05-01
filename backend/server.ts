// backend/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRoutes from './src/routes/user.ts';
import agentRoutes from './src/routes/agent.ts';
import chatRoutes from './src/routes/chat.ts';
import creditRoutes from './src/routes/credits.ts';
import ratingRoutes from './src/routes/ratings.ts';
import https from 'https';

import { initializeAgent, getAgentExecutor } from './src/agent';
import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// HTTPS options
/**
 * If you want to use SSL, ensure that you have added the certificates in the crt directory and uncomment
 * the following code.
const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'crt', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'crt', 'server.crt')),
};
 */


app.use(cors());
app.use(bodyParser.json());

/**
 * Routes
 */
app.use('/api', userRoutes);
app.use('/api', agentRoutes);
app.use('/api', chatRoutes);
app.use('/api', creditRoutes);
app.use('/api', ratingRoutes);


(async () => {
    await initializeAgent();

    app.post('/api/chat', async (req, res) => {
        const { input } = req.body;
        if (!input) return res.status(400).json({ error: 'Missing input' });

        try {
            const agentExecutor = getAgentExecutor();
            const result = await agentExecutor.invoke({ input });
            res.json({ output: result.output });
        } catch (error: any) {
            console.error('Error during agent execution:', error);
            res.status(500).json({ error: 'Agent error: ' + error.message });
        }
    });

    /**
     * If you want to use SSL, ensure that you have added the certificates in the crt directory and uncomment
     * the following code.
     */
    https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log(`🔐 AgentVerse HTTPS server running at https://localhost:${PORT}`);
    });

    app.listen(PORT, () => {
        console.log(`🚀 AgentVerse server running on http://localhost:${PORT}`);
    });
})();