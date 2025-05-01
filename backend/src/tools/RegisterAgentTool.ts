import {
  AIAgentCapability,
  Logger,
  FeeConfigBuilder,
} from '@hashgraphonline/standards-sdk';
import {
  ensureAgentHasEnoughHbar,
  ENV_FILE_PATH,
  updateEnvFile,
} from '../utils/utils';
import { HCS10Client } from '../hcs10/HCS10Client';
import { AgentMetadata } from '../hcs10/types';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Interface for HCS10 registration result
 */
interface HCS10RegistrationResult {
  metadata?: {
    accountId?: string;
    inboundTopicId?: string;
    outboundTopicId?: string;
    profileTopicId?: string;
    privateKey?: string;
    capabilities?: number[];
    [key: string]: string | number | boolean | number[] | object | undefined;
  };
}

/**
 * Agent registration details returned when successful
 */
interface AgentRegistrationDetails {
  success: boolean;
  message: string;
  name: string;
  accountId: string;
  privateKey: string;
  inboundTopicId: string;
  outboundTopicId: string;
  profileTopicId: string;
  capabilities: number[];
  hasFees: boolean;
  hbarFee: number;
  tokenFee: { amount: number; tokenId: string } | null;
}

/**
 * RegisterAgentTool wraps the createAndRegisterAgent() function of HCS10Client.
 * It creates and registers an agent on Hedera using the HCS-10 standard SDK flow.
 * On success, returns a JSON string containing the new agent's details (including private key).
 */
export class RegisterAgentTool extends StructuredTool {
  name = 'register_agent';
  description =
    "Creates and registers the AI agent on the Hedera network. Returns JSON string with agent details (accountId, privateKey, topics) on success. Optionally supports fee configuration for the agent's inbound topic using HBAR or specific tokens.";
  private client: HCS10Client;

  schema = z.object({
    name: z.string().describe('The name of the agent to register'),
    description: z
      .string()
      .optional()
      .describe('Optional description of the agent'),
    type: z
      .enum(['autonomous', 'manual'])
      .optional()
      .describe('Optional agent type (default: autonomous)'),
    model: z
      .string()
      .optional()
      .describe('Optional model identifier for the agent'),
    capabilities: z
      .array(z.number())
      .optional()
      .describe(
        'Optional array of AIAgentCapability enum values (0-18). If not provided, defaults to just TEXT_GENERATION (0)'
      ),
    feeCollectorAccountId: z
      .string()
      .optional()
      .describe(
        "The account ID to collect fees. If not specified, the new agent's account ID will be used. Required if any fee is specified."
      ),
    hbarFee: z
      .number()
      .optional()
      .describe(
        'Optional: The fee amount in HBAR to charge per message on the inbound topic (e.g., 0.5). If specified, inboundTopicType will be set to FEE_BASED.'
      ),
    tokenFee: z
      .object({
        amount: z.number(),
        tokenId: z.string(),
      })
      .optional()
      .describe(
        'Optional: The fee amount and token ID to charge per message on the inbound topic (e.g., { amount: 10, tokenId: "0.0.12345" }). If specified, inboundTopicType will be set to FEE_BASED.'
      ),
    hbarFees: z
      .array(
        z.object({
          amount: z.number(),
          collectorAccount: z.string().optional(),
        })
      )
      .optional()
      .describe(
        'Optional: Array of HBAR fees with different collectors. If specified, inboundTopicType will be set to FEE_BASED.'
      ),
    tokenFees: z
      .array(
        z.object({
          amount: z.number(),
          tokenId: z.string(),
          collectorAccount: z.string().optional(),
        })
      )
      .optional()
      .describe(
        'Optional: Array of token fees with different collectors. If specified, inboundTopicType will be set to FEE_BASED.'
      ),
    exemptAccountIds: z
      .array(z.string())
      .optional()
      .describe(
        'Optional: Array of account IDs to exempt from ALL fees set for this agent.'
      ),
  });

  /**
   * Creates a new RegisterAgentTool instance
   * @param client - Instance of HCS10Client (already configured with operator/network)
   */
  constructor(client: HCS10Client) {
    super();
    this.client = client;
  }

  /**
   * Calls createAndRegisterAgent() with the provided metadata.
   * Returns a JSON string with agent details on success, or an error string.
   */
  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const logger = Logger.getInstance({
      level: 'debug',
    });

    const metadata: AgentMetadata = {
      name: input.name,
      description: input.description,
      type: input.type,
      model: input.model,
      capabilities: input.capabilities || [AIAgentCapability.TEXT_GENERATION],
      properties: {},
    };

    const hasHbarFee = input.hbarFee !== undefined && input.hbarFee > 0;
    const hasTokenFee = this.hasValidTokenFee(input.tokenFee);
    const hasHbarFees = input.hbarFees && input.hbarFees.length > 0;
    const hasTokenFees = input.tokenFees && input.tokenFees.length > 0;

    if (hasHbarFee || hasTokenFee || hasHbarFees || hasTokenFees) {
      const { accountId: operatorAccountId } =
        this.client.getAccountAndSigner();
      const collectorId = input.feeCollectorAccountId || operatorAccountId;

      if (!collectorId) {
        return 'Error: Fee collector account ID is required when specifying fees and could not be determined.';
      }

      let feeConfigBuilder = new FeeConfigBuilder({
        network: this.client.getNetwork(),
        logger,
      });

      try {
        const exemptAccountIds =
          input.exemptAccountIds?.filter(
            (id) => id !== collectorId && id.startsWith('0.0')
          ) || [];

        if (hasHbarFee) {
          logger.info(
            `Adding HBAR fee: ${input.hbarFee} HBAR to be collected by ${collectorId}`
          );
          feeConfigBuilder = feeConfigBuilder.addHbarFee(
            input.hbarFee!,
            collectorId,
            exemptAccountIds
          );
        }

        if (hasHbarFees) {
          for (const fee of input.hbarFees!) {
            const feeCollector = fee.collectorAccount || collectorId;
            logger.info(
              `Adding HBAR fee: ${fee.amount} HBAR to be collected by ${feeCollector}`
            );
            feeConfigBuilder = feeConfigBuilder.addHbarFee(
              fee.amount,
              feeCollector,
              exemptAccountIds
            );
          }
        }

        if (hasTokenFee) {
          logger.info(
            `Adding token fee: ${input.tokenFee!.amount} of token ${
              input.tokenFee!.tokenId
            } to be collected by ${collectorId}`
          );
          feeConfigBuilder = await feeConfigBuilder.addTokenFee(
            input.tokenFee!.amount,
            input.tokenFee!.tokenId,
            collectorId,
            undefined,
            exemptAccountIds
          );
        }

        if (hasTokenFees) {
          for (const fee of input.tokenFees!) {
            const feeCollector = fee.collectorAccount || collectorId;
            logger.info(
              `Adding token fee: ${fee.amount} of token ${fee.tokenId} to be collected by ${feeCollector}`
            );
            feeConfigBuilder = await feeConfigBuilder.addTokenFee(
              fee.amount,
              fee.tokenId,
              feeCollector,
              undefined,
              exemptAccountIds
            );
          }
        }

        metadata.feeConfig = feeConfigBuilder;
      } catch (error) {
        return `Error: Failed to configure fees. Reason: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }

    try {
      const result = (await this.client.createAndRegisterAgent(
        metadata
      )) as unknown as HCS10RegistrationResult;
      return this.processRegistrationResult(result, input);
    } catch (error) {
      return `Error: Failed to create/register agent "${input.name}". Reason: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  /**
   * Checks if the token fee configuration is valid
   */
  private hasValidTokenFee(tokenFee?: {
    amount: number;
    tokenId: string;
  }): boolean {
    return !!(
      tokenFee &&
      tokenFee.amount > 0 &&
      tokenFee.tokenId &&
      tokenFee.tokenId.trim() !== ''
    );
  }

  /**
   * Processes the registration result and returns formatted output
   */
  private async processRegistrationResult(
    result: HCS10RegistrationResult,
    input: z.infer<typeof this.schema>
  ): Promise<string> {
    const newAgentAccountId = result?.metadata?.accountId || '';
    const inboundTopicId = result?.metadata?.inboundTopicId || '';
    const outboundTopicId = result?.metadata?.outboundTopicId || '';
    const profileTopicId = result?.metadata?.profileTopicId || '';
    const privateKey = result?.metadata?.privateKey || '';

    if (privateKey && newAgentAccountId && inboundTopicId && outboundTopicId) {
      await this.updateEnvironmentFile(
        newAgentAccountId,
        privateKey,
        inboundTopicId,
        outboundTopicId
      );
      await this.ensureAgentHasFunds(newAgentAccountId, input.name);
    }

    this.validateRegistrationResult(
      newAgentAccountId,
      inboundTopicId,
      outboundTopicId,
      privateKey
    );

    const feeDescription = this.createFeeDescription(input);
    const feeMessage = feeDescription
      ? ` with ${feeDescription} fee on inbound topic`
      : '';

    const registrationDetails: AgentRegistrationDetails = {
      success: true,
      message: `Successfully registered agent '${input.name}'${feeMessage}.`,
      name: input.name,
      accountId: newAgentAccountId,
      privateKey: privateKey,
      inboundTopicId: inboundTopicId,
      outboundTopicId: outboundTopicId,
      profileTopicId: profileTopicId || 'N/A',
      capabilities: input.capabilities || [AIAgentCapability.TEXT_GENERATION],
      hasFees: !!(input.hbarFee || this.hasValidTokenFee(input.tokenFee)),
      hbarFee: input.hbarFee || 0,
      tokenFee: input.tokenFee || null,
    };

    return JSON.stringify(registrationDetails);
  }

  /**
   * Updates the environment file with the new agent details
   */
  private async updateEnvironmentFile(
    accountId: string,
    privateKey: string,
    inboundTopicId: string,
    outboundTopicId: string
  ): Promise<void> {
    await updateEnvFile(ENV_FILE_PATH, {
      TODD_ACCOUNT_ID: accountId,
      TODD_PRIVATE_KEY: privateKey,
      TODD_INBOUND_TOPIC_ID: inboundTopicId,
      TODD_OUTBOUND_TOPIC_ID: outboundTopicId,
    });
  }

  /**
   * Ensures the agent has enough HBAR for operations
   */
  private async ensureAgentHasFunds(
    accountId: string,
    agentName: string
  ): Promise<void> {
    try {
      await ensureAgentHasEnoughHbar(
        Logger.getInstance({
          module: 'RegisterAgentTool',
        }),
        this.client.standardClient,
        accountId,
        agentName
      );
    } catch (error) {
      Logger.getInstance().error('Failed to auto fund agent', error);
    }
  }

  /**
   * Validates that all required fields are present in the registration result
   */
  private validateRegistrationResult(
    accountId?: string,
    inboundTopicId?: string,
    outboundTopicId?: string,
    privateKey?: string
  ): void {
    if (!accountId || !inboundTopicId || !outboundTopicId || !privateKey) {
      const missingFields = [
        !accountId && 'accountId',
        !inboundTopicId && 'inboundTopicId',
        !outboundTopicId && 'outboundTopicId',
        !privateKey && 'privateKey',
      ]
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `Registration failed. The HCS client returned incomplete details (Missing: ${missingFields}).`
      );
    }
  }

  /**
   * Creates a description of the fees configured for the agent
   */
  private createFeeDescription(input: z.infer<typeof this.schema>): string {
    const hasHbarFee = input.hbarFee && input.hbarFee > 0;
    const hasTokenFee = this.hasValidTokenFee(input.tokenFee);
    if (!hasHbarFee && !hasTokenFee) {
      return '';
    }

    let description = '';
    if (hasHbarFee) {
      description += `${input.hbarFee} HBAR`;
    }
    if (hasTokenFee && input.tokenFee) {
      const tokenFeeText = `${input.tokenFee.amount} of token ${input.tokenFee.tokenId}`;
      description += description ? ` and ${tokenFeeText}` : tokenFeeText;
    }
    return description;
  }
}
