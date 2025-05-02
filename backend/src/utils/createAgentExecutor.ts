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

import { HbarBalanceTool } from '../tools/custom/HbarBalanceTool';
import { PrismaAgent } from '../types/custom-agent-type';
import OpenAI from "openai";
import {DallEImageTool} from "../tools/DallEImageTool.js"; // You can define this type manually or inline

export async function createAgentExecutorFromDb(agent: PrismaAgent): Promise<AgentExecutor> {
    const tools = [];

    if (agent.model === "dall-e-3") {
        tools.push(new DallEImageTool());
    }

    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
        modelName: "gpt-4o", // Chat model for text communication
        temperature: 0,
    });

    const memory = new ConversationTokenBufferMemory({
        llm,
        memoryKey: "chat_history",
        returnMessages: true,
        outputKey: "output",
        maxTokenLimit: 1000,
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", agent.instructions || "You are a helpful assistant."], // Prepend system message from agent.instructions if provided
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const langchainAgent = await createOpenAIToolsAgent({
        llm,
        tools,
        prompt,
    });

    return new AgentExecutor({
        agent: langchainAgent,
        tools,
        memory,
        verbose: false,
    });
}
