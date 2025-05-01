import {
    HCS10Client
} from '@hashgraphonline/standards-agent-kit';

import { ChatOpenAI } from '@langchain/openai';
import {
    AgentExecutor,
    createOpenAIToolsAgent
} from 'langchain/agents';
import { ConversationTokenBufferMemory } from 'langchain/memory';
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts';
import { StructuredToolInterface } from '@langchain/core/tools';

import { HCS11Profile, ProfileResponse } from '@hashgraphonline/standards-sdk';

import { ConnectionTool } from './tools/ConnectionTool';
import { ConnectionMonitorTool } from './tools/ConnectionMonitorTool';
import { AcceptConnectionRequestTool } from './tools/AcceptConnectionRequestTool';
import { ManageConnectionRequestsTool } from './tools/ManageConnectionRequestsTool';
import { CheckMessagesTool } from './tools/CheckMessagesTool';
import { RegisterAgentTool } from './tools/RegisterAgentTool';
import { FindRegistrationsTool } from './tools/FindRegistrationsTool';
import { InitiateConnectionTool } from './tools/InitiateConnectionTool';
import { ListConnectionsTool } from './tools/ListConnectionsTool';
import { SendMessageToConnectionTool } from './tools/SendMessageToConnectionTool';
import { SendMessageTool } from './tools/SendMessageTool';
import { RetrieveProfileTool } from './tools/RetrieveProfileTool';
import { HbarBalanceTool } from './tools/custom/HbarBalanceTool';

import { OpenConvaiState } from './state/open-convai-state';

let agentExecutor: AgentExecutor;

export async function initializeAgent() {
    const operatorId = process.env.HEDERA_OPERATOR_ID!;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY!;
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const openaiApiKey = process.env.OPENAI_API_KEY!;
    const registryUrl = process.env.REGISTRY_URL || 'https://moonscape.tech';
    const toddId = process.env.TODD_ACCOUNT_ID;
    const toddKey = process.env.TODD_PRIVATE_KEY;

    const hcsClient = new HCS10Client(operatorId, operatorKey, network, {
        useEncryption: false,
        registryUrl,
    });

    const monitoringHcsClient = new HCS10Client(operatorId, operatorKey, network, {
        useEncryption: false,
        registryUrl,
    });

    const stateManager = new OpenConvaiState();

    if (toddId && toddKey) {
        hcsClient.setClient(toddId, toddKey);
        monitoringHcsClient.setClient(toddId, toddKey);
        const profile = await hcsClient.getAgentProfile(toddId) as ProfileResponse;
        if (profile.success && profile.topicInfo) {
            stateManager.setCurrentAgent({
                name: (profile.profile as HCS11Profile).display_name,
                accountId: toddId,
                inboundTopicId: profile.topicInfo.inboundTopic,
                outboundTopicId: profile.topicInfo.outboundTopic,
            });
        }
    }

    const tools: StructuredToolInterface[] = [
        new RegisterAgentTool(hcsClient),
        new FindRegistrationsTool({ hcsClient }),
        new InitiateConnectionTool({ hcsClient, stateManager }),
        new ListConnectionsTool({ hcsClient, stateManager }),
        new SendMessageToConnectionTool({ hcsClient, stateManager }),
        new CheckMessagesTool({ hcsClient, stateManager }),
        new SendMessageTool(hcsClient),
        new ConnectionTool({ client: monitoringHcsClient, stateManager }),
        new ConnectionMonitorTool({ hcsClient: monitoringHcsClient, stateManager }),
        new ManageConnectionRequestsTool({ hcsClient, stateManager }),
        new AcceptConnectionRequestTool({ hcsClient, stateManager }),
        new RetrieveProfileTool(hcsClient),
        new HbarBalanceTool(hcsClient),
    ];

    const llm = new ChatOpenAI({
        apiKey: openaiApiKey,
        modelName: process.env.OPENAI_MODEL || 'gpt-4o',
        temperature: 0,
    });

    const memory = new ConversationTokenBufferMemory({
        llm,
        memoryKey: 'chat_history',
        returnMessages: true,
        outputKey: 'output',
        maxTokenLimit: 1000,
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', AGENT_PERSONALITY],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const agent = await createOpenAIToolsAgent({ llm, tools, prompt });

    agentExecutor = new AgentExecutor({
        agent,
        tools,
        memory,
        verbose: false,
    });
}

export function getAgentExecutor(): AgentExecutor {
    if (!agentExecutor) {
        throw new Error('Agent has not been initialized');
    }
    return agentExecutor;
}

const AGENT_PERSONALITY = `You are a helpful assistant managing Hedera HCS-10 connections and messages.
You have access to tools for registering agents, finding registered agents, initiating connections, listing active connections, sending messages over connections, and checking for new messages.
The current agent you are operating as is configured via environment variables (OPERATOR_ID), but can switch if a new agent is registered.
When asked to perform an action, use the available tools. Ask for clarification if needed.
Be concise and informative in your responses.

*** IMPORTANT TOOL SELECTION RULES ***
- To REGISTER a new agent, use 'register_agent'.
- To FIND existing registered agents in the registry, use 'find_registrations'. You can filter by accountId or tags.
- To START a NEW connection TO a specific target agent (using their account ID), ALWAYS use the 'initiate_connection' tool.
- To LISTEN for INCOMING connection requests FROM other agents, use the 'monitor_connections' tool (it takes NO arguments).
- To ACCEPT incoming connection requests, use the 'accept_connection_request' tool.
- To MANAGE and VIEW pending connection requests, use the 'manage_connection_requests' tool.
- To CHECK the HBAR balance of any Hedera account, use the 'check_hbar_balance' tool.
- Do NOT confuse these tools.

Remember the connection numbers when listing connections, as users might refer to them.`;
