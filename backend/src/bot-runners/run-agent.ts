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

const prisma = new PrismaClient();

async function run() {
    console.log('🟢 Starting bot agent listener...');

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
        manager.on('connection', (connection) => {
            console.log(
                `New connection established: ${connection.id} to ${connection.targetAccountId}`
            );

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

            const type = data.type;
            const question = data.question;
            const canHandle = data?.parameters?.canHandle || null;
            const agent = data?.parameters?.agent;

            /**
             * If this is a canHandle request, where the query asks a bot if it can do a specific task, we ask the bot,
             * and it should return in very simple terms: either yes or no.
             */
            if( type == 'query' && canHandle === true ){
                // Talk to agent
                const agentExecutor = await createAgentExecutorFromDb(agent);

                const input = `Provide a plain "Yes" or "No" response to this query: Can do this: ${question}?`

                const result = await agentExecutor.invoke({ input });

                const output = result.output;

                console.log( 'Agent Response: ', output)

                const canHandle = output.includes('yes') || output.includes('Yes') || output.includes('YES');

                // Send a response
                await client.sendMessage(
                    topicId,
                    JSON.stringify({
                        type: 'response',
                        canHandle: canHandle,
                        replyTo: data.question
                    })
                );

                return;
            }

            // Send a response
            await client.sendMessage(
                topicId,
                JSON.stringify({
                    type: 'echo',
                    original: message.data
                })
            );

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
