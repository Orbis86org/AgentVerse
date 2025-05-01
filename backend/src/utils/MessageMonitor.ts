import { EventEmitter } from 'events';
import {HCS10Client, Logger} from "@hashgraphonline/standards-sdk";

/**
 * Message Monitor for real-time message processing
 */
class MessageMonitor extends EventEmitter {
    private client: HCS10Client;
    private topicId: string;
    private running: boolean = false;
    private lastProcessedTimestamp: number = 0;
    private Logger = Logger.getInstance({ module: 'MessageMonitor' });
    private pollInterval: number = 3000;

    constructor(client: HCS10Client, topicId: string) {
        super();
        this.client = client;
        this.topicId = topicId;
    }

    /**
     * Start monitoring for messages
     */
    start(): MessageMonitor {
        if (this.running) return this;

        this.running = true;
        this.Logger.info(`Starting message monitor for topic ${this.topicId}`);

        this.poll();
        return this;
    }

    /**
     * Stop monitoring
     */
    stop(): void {
        this.running = false;
        this.Logger.info(`Stopped message monitor for topic ${this.topicId}`);
    }

    /**
     * Set the polling interval
     */
    setPollInterval(ms: number): MessageMonitor {
        this.pollInterval = ms;
        return this;
    }

    /**
     * Set the last processed timestamp
     */
    setLastProcessedTimestamp(timestamp: number): MessageMonitor {
        this.lastProcessedTimestamp = timestamp;
        return this;
    }

    /**
     * Poll for new messages
     */
    private async poll(): Promise<void> {
        if (!this.running) return;

        try {
            const { messages } = await this.client.getMessages(this.topicId);

            // Filter for new messages
            const newMessages = messages.filter(
                (msg) => msg.consensus_timestamp > this.lastProcessedTimestamp
            ).sort((a, b) => a.consensus_timestamp - b.consensus_timestamp);

            // Process new messages
            for (const message of newMessages) {
                if (message.op === 'message') {
                    const processedMessage = await this.processMessage(message);
                    this.emit('message', processedMessage);
                }

                // Update last processed timestamp
                this.lastProcessedTimestamp = Math.max(
                    this.lastProcessedTimestamp,
                    message.consensus_timestamp
                );
            }
        } catch (error) {
            this.Logger.error(`Error polling for messages: ${error}`);
            this.emit('error', error);
        }

        // Schedule next poll if still running
        if (this.running) {
            setTimeout(() => this.poll(), this.pollInterval);
        }
    }

    /**
     * Process a raw message
     */
    private async processMessage(message: any) {
        let data = message.data;
        let isHcs1Reference = false;

        // Check if this is a large message reference (HCS-1)
        if (typeof data === 'string' && data.startsWith('hcs://1/')) {
            isHcs1Reference = true;
            this.Logger.debug(`Resolving large content reference: ${data}`);

            try {
                // Retrieve the content from HCS-1
                data = await this.client.getMessageContent(data);
            } catch (error) {
                this.Logger.error(`Failed to resolve content reference: ${error}`);
                throw error;
            }
        }

        // Try to parse JSON content
        if (
            typeof data === 'string' &&
            (data.startsWith('{') || data.startsWith('['))
        ) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // Not valid JSON, keep as string
            }
        }

        // Return processed message
        return {
            id: message.sequence_number,
            sender: message.operator_id,
            timestamp: message.consensus_timestamp,
            data,
            meta: {
                isLargeContent: isHcs1Reference,
                memo: message.m,
                raw: message,
            },
        };
    }
}

export default MessageMonitor;

/**
 * Start monitoring a connection and handle messages
 */
function startMessageMonitoring(
    client: HCS10Client,
    connectionTopicId: string
) {
    const monitor = new MessageMonitor(client, connectionTopicId).start();

    // Process different message types
    monitor.on('message', (message) => {
        const { id, sender, data } = message;

        Logger.info(`Received message #${id} from ${sender}`);

        // Handle based on message data
        if (typeof data === 'object') {
            // Handle structured data
            const messageType = data.type || 'unknown';

            switch (messageType) {
                case 'query':
                    handleQuery(data, sender, connectionTopicId);
                    break;

                case 'training_data':
                    handleTrainingData(data, sender, connectionTopicId);
                    break;

                case 'close_connection':
                    handleCloseRequest(data, sender, connectionTopicId);
                    break;

                default:
                    Logger.info(`Received message with type: ${messageType}`);
                // Handle other message types
            }
        } else {
            // Handle plain text
            Logger.info(`Text message: ${data}`);

            // Echo back for demonstration
            sendMessage(client, connectionTopicId, `Received your message: ${data}`);
        }
    });

    // Handle monitor errors
    monitor.on('error', (error) => {
        Logger.error(`Message monitor error: ${error}`);
    });

    return monitor;
}
