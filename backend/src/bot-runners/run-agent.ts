/**
 * Run the script using
 * npx tsx src/bot-runners/run-agent.ts
 */

import {Prisma, PrismaClient} from '@prisma/client';
import {createAgentHCSHederaClient} from "../utils/HederaClient.js";
import {HCS10Client} from "@hashgraphonline/standards-sdk";
import ConnectionManager from '../utils/ConnectionManager.js';
import MessageMonitor from '../utils/MessageMonitor.js';
import {createAgentExecutorFromDb} from "../utils/createAgentExecutor.js";
import {decryptMessage, encryptMessage} from "../utils/Encryption.js";

const prisma = new PrismaClient();

async function run() {
    console.log('🟢 Starting bot agent listener...');

    const activeConnections = new Map<string, string>(); // accountId -> topicId

    // Clean up old connections every 10 minutes
    setInterval(() => {
        activeConnections.clear();
        console.log('Clear stale activeConnections cache');
    }, 10 * 60 * 1000);


    /**
     * Example usage of the connection manager
     */
    async function setupConnectionManager(
        client: HCS10Client,
        inboundTopicId: string
    ): Promise<ConnectionManager> {
        // Create and start the manager
        const manager = new ConnectionManager(
            client,
            inboundTopicId
        ).startMonitoring();

        // Listen for new connections
        manager.on('connection', async (connection) => {

            const accountId = connection.targetAccountId;

            // Skip if already connected
            if (activeConnections.has(accountId)) {
                console.log(`🔁 Duplicate connection for ${accountId}`);
                console.log('Connection: ', connection)

                return;
            }

            console.log(
                `New connection established: ${connection.id} to ${connection.targetAccountId}`
            );

            activeConnections.set(accountId, connection.topicId);

            // Set up message monitoring for this connection
            setupMessageMonitoring(client, connection.topicId, connection.id);
        });

        // Listen for connection close events
        manager.on('close', (info) => {
            console.log(`Connection closed: ${info.id} - Reason: ${info.reason}`);
        });

        // Listen for errors
        manager.on('error', (error) => {
            console.error('Connection manager error:', error);
        });

        return manager;
    }

    /**
     * Set up message monitoring for a specific connection
     */
    function setupMessageMonitoring(
        client: HCS10Client,
        topicId: string,
        connectionId: string
    ) {
        // Create a message monitor
        const monitor = new MessageMonitor(client, topicId).start();

        // Handle incoming messages
        monitor.on('message', async (message) => {
            console.log(`Message from connection ${connectionId}:`);
            // console.log(message.data);

            // Handle the message based on your application's logic
            let data;

            if (typeof message.data === 'string') {
                try {
                    data = JSON.parse(message.data);
                } catch (err) {
                    console.error('Invalid JSON string:', message.data);
                    throw err; // or handle it safely
                }
            } else if (typeof message.data === 'object') {
                // Already an object
                data = message.data;
            } else {
                console.warn('Unexpected message.data type:', typeof message.data);
            }

            // console.info('Message Data: ', data )

            const type = data.type;
            const question = data.question;
            const agent = data?.parameters?.agent;


            if( type == 'query' && agent ){
                // Talk to agent
                const agentExecutor = await createAgentExecutorFromDb(agent);

                const input = decryptMessage( question );

                console.log('Agent Question: ', input )

                const result = await agentExecutor.invoke({ input });

                const output = result.output;

                console.log( 'Agent Response: ', output)

                // Send a response
                await client.sendMessage(
                    topicId,
                    JSON.stringify({
                        type: 'response',
                        requestId: data.requestId,
                        replyTo: data.question,
                        response: encryptMessage( output )
                    })
                );

                return;
            }


        });

        // Handle monitor errors
        monitor.on('error', (error) => {
            console.error(
                `Message monitor error for connection ${connectionId}:`,
                error
            );
        });
    }

    const agents = await prisma.agent.findMany();

    for (const agent of agents) {
        try {
            const client = createAgentHCSHederaClient(agent);
            const inboundTopicId = agent.inboundTopicId;

            await setupConnectionManager( client, inboundTopicId);
        } catch (err) {
            console.error(`❌ Error handling agent ${agent.slug}:`, err);
        }
    }

}

run().catch((e) => {
    console.error('❌ Uncaught error in bot runner:', e);
});
