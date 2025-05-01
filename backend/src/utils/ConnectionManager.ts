import { HCS10Client } from '@hashgraphonline/standards-sdk';
import { EventEmitter } from 'events';
import { Logger } from '@hashgraphonline/standards-sdk';

/**
 * Connection Manager to handle multiple connections
 */
class ConnectionManager extends EventEmitter {
    private client: HCS10Client;
    private inboundTopicId: string;
    private connections: Map<
        string,
        {
            connectionTopicId: string;
            targetAccountId: string;
            isActive: boolean;
            lastActivity: number;
            metadata?: any;
        }
    >;
    private monitoring: boolean = false;
    private logger = Logger.getInstance({ module: 'ConnectionManager' });
    private lastProcessedMessage: number = 0;
    private pollInterval: number = 3000;

    constructor(client: HCS10Client, inboundTopicId: string) {
        super();
        this.client = client;
        this.inboundTopicId = inboundTopicId;
        this.connections = new Map();
    }

    /**
     * Start monitoring for incoming connection requests
     */
    startMonitoring(): ConnectionManager {
        if (this.monitoring) return this;

        this.monitoring = true;
        this.logger.info(
            `Starting connection monitoring for ${this.inboundTopicId}`
        );
        this.monitorInboundTopic();
        return this;
    }

    /**
     * Stop monitoring for requests
     */
    stopMonitoring(): void {
        this.monitoring = false;
        this.logger.info('Connection monitoring stopped');
    }

    /**
     * Get a list of all active connections
     */
    getConnections(): Array<{
        id: string;
        topicId: string;
        targetAccountId: string;
    }> {
        const result = [];
        this.connections.forEach((connection, id) => {
            if (connection.isActive) {
                result.push({
                    id,
                    topicId: connection.connectionTopicId,
                    targetAccountId: connection.targetAccountId,
                });
            }
        });
        return result;
    }

    /**
     * Get a specific connection by ID
     */
    getConnection(connectionId: string): any {
        return this.connections.get(connectionId);
    }

    /**
     * Get a connection by topic ID
     */
    getConnectionByTopicId(topicId: string): any {
        for (const [id, connection] of this.connections.entries()) {
            if (connection.connectionTopicId === topicId) {
                return { id, ...connection };
            }
        }
        return null;
    }

    /**
     * Initiate a connection to another agent
     */
    async initiateConnection(
        targetInboundTopicId: string,
        memo: string = 'Connection request'
    ): Promise<any> {
        try {
            this.logger.info(`Initiating connection to ${targetInboundTopicId}`);

            // Submit connection request
            const result = await this.client.submitConnectionRequest(
                targetInboundTopicId,
                memo
            );

            const requestId = result.topicSequenceNumber.toNumber();
            this.logger.info(`Connection request sent with ID: ${requestId}`);

            // Wait for connection confirmation
            const confirmation = await this.client.waitForConnectionConfirmation(
                targetInboundTopicId,
                requestId,
                60, // Maximum wait time (seconds)
                2000 // Polling interval (milliseconds)
            );

            const connectionTopicId = confirmation.connectionTopicId;
            const targetAccountId = confirmation.targetAccountId;

            // Generate a connection ID
            const connectionId = `conn-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`;

            // Store the connection
            this.connections.set(connectionId, {
                connectionTopicId,
                targetAccountId,
                isActive: true,
                lastActivity: Date.now(),
                metadata: {
                    initiator: true,
                    created: new Date().toISOString(),
                    requestId,
                },
            });

            this.logger.info(
                `Connection established: ${connectionId} -> ${connectionTopicId}`
            );
            this.emit('connection', {
                id: connectionId,
                topicId: connectionTopicId,
                targetAccountId,
            });

            return {
                connectionId,
                connectionTopicId,
                targetAccountId,
            };
        } catch (error) {
            this.logger.error('Failed to initiate connection:', error);
            throw error;
        }
    }

    /**
     * Monitor the inbound topic for connection requests
     */
    private async monitorInboundTopic(): Promise<void> {
        if (!this.monitoring) return;

        try {
            const { messages } = await this.client.getMessages(this.inboundTopicId);

            // Filter for connection requests
            const connectionRequests = messages
                .filter(
                    (msg) =>
                        msg.op === 'connection_request' &&
                        msg.sequence_number > this.lastProcessedMessage
                )
                .sort((a, b) => a.sequence_number - b.sequence_number);

            // Process new requests
            for (const request of connectionRequests) {
                this.lastProcessedMessage = Math.max(
                    this.lastProcessedMessage,
                    request.sequence_number
                );
                await this.handleConnectionRequest(request);
            }
        } catch (error) {
            this.logger.error('Error monitoring inbound topic:', error);
            this.emit('error', error);
        }

        // Schedule next poll if still monitoring
        if (this.monitoring) {
            setTimeout(() => this.monitorInboundTopic(), this.pollInterval);
        }
    }

    /**
     * Handle a single connection request
     */
    private async handleConnectionRequest(request: any): Promise<void> {
        try {
            const requestingAccountId = request.operator_id.split('@')[1];
            const connectionRequestId = request.sequence_number;

            this.logger.info(`New connection request from: ${requestingAccountId}`);

            // Handle the connection request (creates a connection topic)
            const response = await this.client.handleConnectionRequest(
                this.inboundTopicId,
                requestingAccountId,
                connectionRequestId
            );

            const connectionTopicId = response.connectionTopicId;

            // Generate a connection ID
            const connectionId = `conn-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`;

            // Store the connection
            this.connections.set(connectionId, {
                connectionTopicId,
                targetAccountId: requestingAccountId,
                isActive: true,
                lastActivity: Date.now(),
                metadata: {
                    initiator: false,
                    created: new Date().toISOString(),
                    requestId: connectionRequestId,
                },
            });

            this.logger.info(
                `Connection established: ${connectionId} -> ${connectionTopicId}`
            );
            this.emit('connection', {
                id: connectionId,
                topicId: connectionTopicId,
                targetAccountId: requestingAccountId,
            });
        } catch (error) {
            this.logger.error(`Failed to handle connection request:`, error);
            this.emit('error', error);
        }
    }

    /**
     * Close a connection
     */
    async closeConnection(
        connectionId: string,
        reason: string = 'Connection closed'
    ): Promise<boolean> {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            this.logger.warn(`Connection not found: ${connectionId}`);
            return false;
        }

        try {
            // Send a close notification message
            await this.client.sendMessage(
                connection.connectionTopicId,
                JSON.stringify({
                    type: 'close_connection',
                    reason,
                    timestamp: new Date().toISOString(),
                }),
                'Connection close'
            );

            // Mark connection as inactive
            connection.isActive = false;
            this.connections.set(connectionId, connection);

            this.logger.info(`Connection closed: ${connectionId}`);
            this.emit('close', { id: connectionId, reason });
            return true;
        } catch (error) {
            this.logger.error(`Failed to close connection: ${connectionId}`, error);
            return false;
        }
    }
}

export default ConnectionManager;

