import { StructuredTool, ToolParams } from '@langchain/core/tools';
import { z } from 'zod';
import { HCS10Client } from '../hcs10/HCS10Client';
import { IStateManager, ActiveConnection } from '../state/open-convai-state';
import { Logger, FeeConfigBuilder } from '@hashgraphonline/standards-sdk';

export interface AcceptConnectionRequestToolParams extends ToolParams {
  hcsClient: HCS10Client;
  stateManager: IStateManager;
}

/**
 * A tool specifically for accepting incoming connection requests.
 */
export class AcceptConnectionRequestTool extends StructuredTool {
  name = 'accept_connection_request';
  description =
    'Accepts a specific pending connection request from another agent, establishing a communication channel.';
  schema = z.object({
    requestId: z
      .number()
      .describe(
        'The ID of the specific request to accept. Use the "manage_connection_requests" tool with action="list" first to get valid IDs.'
      ),
    hbarFee: z
      .number()
      .optional()
      .describe(
        'Optional HBAR fee amount to charge the connecting agent per message on the new connection topic.'
      ),
    exemptAccountIds: z
      .array(z.string())
      .optional()
      .describe(
        'Optional list of account IDs to exempt from any configured fees on the new connection topic.'
      ),
  });

  private hcsClient: HCS10Client;
  private stateManager: IStateManager;
  private logger: Logger;

  constructor({
    hcsClient,
    stateManager,
    ...rest
  }: AcceptConnectionRequestToolParams) {
    super(rest);
    this.hcsClient = hcsClient;
    this.stateManager = stateManager;
    this.logger = Logger.getInstance({
      module: 'AcceptConnectionRequestTool',
    });
  }

  protected async _call({
    requestId,
    hbarFee,
    exemptAccountIds,
  }: z.infer<this['schema']>): Promise<string> {
    const currentAgent = this.stateManager.getCurrentAgent();
    if (!currentAgent) {
      return 'Error: Cannot accept connection request. No agent is currently active. Please register or select an agent first.';
    }

    const request = this.stateManager.getConnectionRequestById(requestId);
    if (!request) {
      return `Error: Request ID ${requestId} not found or no longer pending. Use the manage_connection_requests tool with action="list" to verify.`;
    }

    try {
      const inboundTopicId = await this.hcsClient.getInboundTopicId();
      let feeConfigBuilder = undefined;

      if (hbarFee && hbarFee > 0) {
        const collectorId = this.hcsClient.getAccountAndSigner().accountId;
        try {
          feeConfigBuilder = new FeeConfigBuilder({
            network: this.hcsClient.getNetwork(),
            logger: this.logger,
            defaultCollectorAccountId: collectorId,
          });

          const finalExemptions = [
            ...(exemptAccountIds || []),
            request.requestorId,
          ];
          feeConfigBuilder.addHbarFee(hbarFee, collectorId, finalExemptions);
          this.logger.info(
            `Setting HBAR fee: ${hbarFee} HBAR to be collected by ${collectorId}`
          );
        } catch (feeConfigError) {
          this.logger.error(
            `Error creating fee configuration: ${feeConfigError}`
          );

          feeConfigBuilder = undefined;
          this.logger.warn(
            'Proceeding to accept request without fees due to configuration error.'
          );
        }
      }

      this.logger.info(
        `Attempting to accept request ID: ${requestId} from ${request.requestorId}`
      );
      const result = await this.hcsClient.handleConnectionRequest(
        inboundTopicId,
        request.requestorId,
        requestId,
        feeConfigBuilder
      );

      if (!result?.connectionTopicId) {
        return `Error: Failed to accept connection request #${requestId}. The SDK did not return a connection topic ID.`;
      }
      this.logger.info(
        `Successfully created connection topic: ${result.connectionTopicId}`
      );

      const connectionTopicId = result.connectionTopicId;

      let targetInboundTopic = '';
      try {
        const targetProfileData = await this.hcsClient.getAgentProfile(
          request.requestorId
        );
        targetInboundTopic =
          targetProfileData?.['topicInfo']?.['inboundTopic'] || '';
        if (!targetInboundTopic) {
          this.logger.warn(
            `Could not resolve target inbound topic for ${request.requestorId}`
          );
        }
      } catch (e) {
        this.logger.warn(
          `Error fetching target profile/topic for ${request.requestorId}: ${e}`
        );
      }

      const newConnection: ActiveConnection = {
        targetAccountId: request.requestorId,
        targetAgentName: request.requestorName,
        targetInboundTopicId: targetInboundTopic,
        connectionTopicId,
        profileInfo: request.profile,
        created: new Date(),
        status: 'established',
      };

      this.stateManager.addActiveConnection(newConnection);
      this.stateManager.removeConnectionRequest(requestId);
      this.logger.info(`Removed request ${requestId} from pending requests`);

      let feeMessage = '';
      if (hbarFee && hbarFee > 0 && feeConfigBuilder) {
        feeMessage = ` with a ${hbarFee} HBAR fee per message`;
      }

      return `Successfully accepted connection request #${requestId} from ${request.requestorName}${feeMessage}. Connection established on topic: ${connectionTopicId}.`;
    } catch (error) {
      this.logger.error(
        `Error accepting connection request #${requestId}: ${error}`
      );

      return `Error accepting connection request #${requestId}: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }
}
