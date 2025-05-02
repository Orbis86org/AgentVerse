// utils/MessageMonitor.ts
import { EventEmitter } from 'events';
import { HCS10Client, Logger } from '@hashgraphonline/standards-sdk';
import { loadLastSequenceNumber, saveLastSequenceNumber } from './SequenceTracker.js';

class MessageMonitor extends EventEmitter {
    private client: HCS10Client;
    private topicId: string;
    private running = false;
    private lastProcessedSequenceNumber: number;
    private pollInterval = 3000;
    private Logger = Logger.getInstance({ module: 'MessageMonitor' });

    constructor(client: HCS10Client, topicId: string) {
        super();
        this.client = client;
        this.topicId = topicId;
        this.lastProcessedSequenceNumber = loadLastSequenceNumber(topicId);
    }

    start(): MessageMonitor {
        if (this.running) return this;

        this.running = true;
        this.Logger.info(`Starting message monitor for topic ${this.topicId}`);
        this.poll();
        return this;
    }

    stop(): void {
        this.running = false;
        this.Logger.info(`Stopped message monitor for topic ${this.topicId}`);
    }

    setPollInterval(ms: number): MessageMonitor {
        this.pollInterval = ms;
        return this;
    }

    setLastProcessedSequenceNumber(sequenceNumber: number): MessageMonitor {
        this.lastProcessedSequenceNumber = sequenceNumber;
        return this;
    }

    private async poll(): Promise<void> {
        if (!this.running) return;

        try {
            const { messages } = await this.client.getMessages(this.topicId);

            const newMessages = messages
                .filter((msg) => msg.sequence_number > this.lastProcessedSequenceNumber)
                .sort((a, b) => a.sequence_number - b.sequence_number);

            for (const message of newMessages) {
                if (message.op === 'message') {
                    const processedMessage = await this.processMessage(message);
                    if (!processedMessage) continue;

                    this.emit('message', processedMessage);
                }

                this.lastProcessedSequenceNumber = Math.max(
                    this.lastProcessedSequenceNumber,
                    message.sequence_number
                );
                saveLastSequenceNumber(this.topicId, this.lastProcessedSequenceNumber);
            }
        } catch (error) {
            this.Logger.error(`Error polling for messages: ${error}`);
            this.emit('error', error);
        }

        if (this.running) {
            setTimeout(() => this.poll(), this.pollInterval);
        }
    }

    private async processMessage(message: any) {
        let data = message.data;
        let isHcs1Reference = false;

        if (typeof data === 'string' && data.startsWith('hcs://1/')) {
            isHcs1Reference = true;
            this.Logger.debug(`Resolving large content reference: ${data}`);

            try {
                data = await this.client.getMessageContent(data);
            } catch (error) {
                this.Logger.warn(
                    `Skipping message ${message.sequence_number}: failed to resolve HRL: ${error.message}`
                );
                return null;
            }
        }

        if (
            typeof data === 'string' &&
            (data.startsWith('{') || data.startsWith('['))
        ) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // Keep as raw string
            }
        }

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
