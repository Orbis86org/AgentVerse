import { HCS10Client } from '@hashgraphonline/standards-sdk';
import { EventEmitter } from 'events';
import { Logger } from '@hashgraphonline/standards-sdk';

/**
 * Connection Manager to handle multiple connections (no new topic creation)
 */
class ConnectionManager extends EventEmitter {
    private client: HCS10Client;
    private inboundTopicId: string;
    private connections = new Map<string, {
        connectionTopicId: string;
        targetAccountId: string;
        isActive: boolean;
        lastActivity: number;
        metadata?: any;
    }>();
    private monitoring = false;
    private lastProcessedMessage = 0;
    private pollInterval = 3000;
    private logger = Logger.getInstance({ module: 'ConnectionManager' });

    constructor(client: HCS10Client, inboundTopicId: string) {
        super();
        this.client = client;
        this.inboundTopicId = inboundTopicId;
    }

    startMonitoring(): ConnectionManager {
        if (this.monitoring) return this;

        this.monitoring = true;
        this.logger.info(`Starting connection monitoring for ${this.inboundTopicId}`);
        this.monitorInboundTopic();
        return this;
    }

    stopMonitoring(): void {
        this.monitoring = false;
        this.logger.info('Connection monitoring stopped');
    }

    getConnections(): Array<{ id: string; topicId: string; targetAccountId: string }> {
        const result = [];
        this.connections.forEach((conn, id) => {
            if (conn.isActive) {
                result.push({ id, topicId: conn.connectionTopicId, targetAccountId: conn.targetAccountId });
            }
        });
        return result;
    }

    getConnection(connectionId: string): any {
        return this.connections.get(connectionId);
    }

    getConnectionByTopicId(topicId: string): any {
        for (const [id, conn] of this.connections.entries()) {
            if (conn.connectionTopicId === topicId) return { id, ...conn };
        }
        return null;
    }

    private async monitorInboundTopic(): Promise<void> {
        if (!this.monitoring) return;

        try {
            const { messages } = await this.client.getMessages(this.inboundTopicId);

            const connectionRequests = messages
                .filter(msg => msg.op === 'connection_request' && msg.sequence_number > this.lastProcessedMessage)
                .sort((a, b) => a.sequence_number - b.sequence_number);

            for (const request of connectionRequests) {
                this.lastProcessedMessage = Math.max(this.lastProcessedMessage, request.sequence_number);
                await this.handleConnectionRequest(request);
            }
        } catch (error) {
            this.logger.error('Error monitoring inbound topic:', error);
            this.emit('error', error);
        }

        if (this.monitoring) {
            setTimeout(() => this.monitorInboundTopic(), this.pollInterval);
        }
    }

    private async handleConnectionRequest(request: any): Promise<void> {
        try {
            const requestingAccountId = request.operator_id.split('@')[1];
            const connectionRequestId = request.sequence_number;

            this.logger.info(`New connection request from: ${requestingAccountId}`);
            this.logger.debug('Request:', request);

            // ✅ Confirm the connection on the same inbound topic
            const sequenceNumber = await this.client.confirmConnection(
                this.inboundTopicId,
                this.inboundTopicId, // Confirm on same topic (no new topic)
                requestingAccountId,
                connectionRequestId,
                'Connection confirmed'
            );

            const connectionTopicId = this.inboundTopicId;
            const connectionId = `conn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            this.connections.set(connectionId, {
                connectionTopicId,
                targetAccountId: requestingAccountId,
                isActive: true,
                lastActivity: Date.now(),
                metadata: {
                    initiator: false,
                    confirmedAt: new Date().toISOString(),
                    requestId: connectionRequestId,
                    sequenceNumber,
                },
            });

            this.logger.info(`Connection confirmed: ${connectionId} -> ${connectionTopicId}`);
            this.emit('connection', {
                id: connectionId,
                topicId: connectionTopicId,
                targetAccountId: requestingAccountId,
            });
        } catch (error) {
            this.logger.error('Failed to confirm connection request:', error);
            this.emit('error', error);
        }
    }

    async closeConnection(connectionId: string, reason: string = 'Connection closed'): Promise<boolean> {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            this.logger.warn(`Connection not found: ${connectionId}`);
            return false;
        }

        try {
            await this.client.sendMessage(
                connection.connectionTopicId,
                JSON.stringify({
                    type: 'close_connection',
                    reason,
                    timestamp: new Date().toISOString(),
                }),
                'Connection close'
            );

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
