// src/utils/HederaClient.ts
import {AccountId, Client, PrivateKey, TopicMessage, TopicMessageQuery} from '@hashgraph/sdk';
import * as dotenv from 'dotenv';
import {HCS10Message} from '../hcs10/types';
import {HCS10Client} from "@hashgraphonline/standards-sdk";
import {decryptMessage} from "./Encryption.js";

// Load environment variables from .env file
dotenv.config();

/**
 * Creates and returns a Hedera Client based on environment variables.
 */
export function createHederaClient(): Client {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
        throw new Error('HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set in env.');
    }

    const client = Client.forName(network);
    client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey));

    return client;
}

/**
 * Creates and returns a Hedera HCS10 Client based on environment variables.
 */
export function createHCSHederaClient(): HCS10Client {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
        throw new Error('HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set in env.');
    }

    // Basic configuration
    return new HCS10Client({
        network: network, // Network: 'testnet' or 'mainnet'
        operatorId: operatorId, // Your Hedera account ID
        operatorPrivateKey: operatorKey, // Your Hedera private key
        logLevel: 'info', // Optional: 'debug', 'info', 'warn', 'error'
        prettyPrint: true, // Optional: prettier console output
        guardedRegistryBaseUrl: 'https://moonscape.tech', // Optional: registry URL
        feeAmount: 1, // Optional: default fee in HBAR
    });
}

/**
 * Get Agent Hedera Client
 */
export function createAgentHCSHederaClient( agent ): HCS10Client {
    const privateKey = agent.privateKeyEncrypted ? decryptMessage(agent.privateKeyEncrypted) : null;

    const network = agent.network || 'testnet';
    const operatorId = agent.accountId;
    const operatorKey = privateKey;

    if (!operatorId || !operatorKey || ! privateKey) {
        throw new Error('Ensure all agent client variables are set.');
    }

    // Basic configuration
    return new HCS10Client({
        network: network, // Network: 'testnet' or 'mainnet'
        operatorId: operatorId, // Your Hedera account ID
        operatorPrivateKey: operatorKey, // Your Hedera private key
        logLevel: 'info', // Optional: 'debug', 'info', 'warn', 'error'
        prettyPrint: true, // Optional: prettier console output
        guardedRegistryBaseUrl: 'https://moonscape.tech', // Optional: registry URL
        // feeAmount: 1, // Optional: default fee in HBAR
    });
}

/**
 * HederaClient class for handling HCS-10 operations
 */
export class HederaClient {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     * Subscribe to messages from a topic
     * TODO: Update to use a mirror node
     */
    async subscribeToTopic(topicId: string, onMessage: (message: HCS10Message) => void, onError: (error: Error) => void): Promise<void> {
        const query = new TopicMessageQuery()
            .setTopicId(topicId)
            .setStartTime(0);

        try {
            const subscription = query.subscribe(
                this.client,
                (message: TopicMessage | null, error: Error) => {
                    if (error) {
                        onError(error);
                    }
                },
                (message: TopicMessage) => {
                    try {
                        const hcs10Message: HCS10Message = JSON.parse(message.contents.toString());
                        onMessage(hcs10Message);
                    } catch (error) {
                        onError(error instanceof Error ? error : new Error('Failed to parse message'));
                    }
                }
            );
        } catch (error) {
            onError(error instanceof Error ? error : new Error('Failed to subscribe to topic'));
        }
    }
}
