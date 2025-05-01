import { StructuredTool, ToolParams } from '@langchain/core/tools';
import { z } from 'zod';
import { HCS10Client } from '../hcs10/HCS10Client';
import { IStateManager } from '../state/open-convai-state';
import { Logger, HCSMessage } from '@hashgraphonline/standards-sdk';

export interface ManageConnectionRequestsToolParams extends ToolParams {
  hcsClient: HCS10Client;
  stateManager: IStateManager;
}

/**
 * A tool for managing incoming connection requests in a LangChain-compatible way.
 * This tool allows an agent to list, view details of, and accept/reject incoming connection requests.
 */
export class ManageConnectionRequestsTool extends StructuredTool {
  name = 'manage_connection_requests';
  description =
    'Manage incoming connection requests. List pending requests, view details about requesting agents, and reject connection requests. Use the separate "accept_connection_request" tool to accept.';
  schema = z.object({
    action: z
      .enum(['list', 'view', 'reject'])
      .describe(
        'The action to perform: list all requests, view details of a specific request, or reject a request'
      ),
    requestId: z
      .number()
      .optional()
      .describe(
        'The ID of the specific request to view or reject (required for view and reject actions)'
      ),
  });

  private hcsClient: HCS10Client;
  private stateManager: IStateManager;
  private logger: Logger;
  private lastRefreshTime: number = 0;
  private refreshIntervalMs = 30000;

  constructor({
    hcsClient,
    stateManager,
    ...rest
  }: ManageConnectionRequestsToolParams) {
    super(rest);
    this.hcsClient = hcsClient;
    this.stateManager = stateManager;
    this.logger = Logger.getInstance({
      module: 'ManageConnectionRequestsTool',
      level: 'debug',
    });
  }

  protected async _call({
    action,
    requestId,
  }: z.infer<this['schema']>): Promise<string> {
    const currentAgent = this.stateManager.getCurrentAgent();
    if (!currentAgent) {
      return 'Error: Cannot manage connection requests. No agent is currently active. Please register or select an agent first.';
    }

    if ((action === 'view' || action === 'reject') && requestId === undefined) {
      return `Error: Request ID is required for the "${action}" action. Use the "list" action first to see available requests.`;
    }

    try {
      await this.refreshRequestsIfNeeded();

      switch (action) {
        case 'list':
          return this.listRequests();
        case 'view':
          return this.viewRequest(requestId!);
        case 'reject':
          return this.rejectRequest(requestId!);
        default:
          return `Error: Unsupported action: ${action}`;
      }
    } catch (error) {
      this.logger.error(`Error in ManageConnectionRequestsTool: ${error}`);
      return `Error managing connection requests: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  private async refreshRequestsIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRefreshTime > this.refreshIntervalMs) {
      await this.refreshRequests();
      this.lastRefreshTime = now;
    }
  }

  private async refreshRequests(): Promise<void> {
    try {
      const inboundTopicId = await this.hcsClient.getInboundTopicId();
      const outboundTopicId = await this.hcsClient.getOutboundTopicId();
      if (!inboundTopicId || !outboundTopicId) {
        throw new Error(
          'Could not find inbound or outbound topic ID for the current agent'
        );
      }

      const outboundMessagesResult = await this.hcsClient.getMessages(
        outboundTopicId
      );
      const outboundConfirmations = outboundMessagesResult.messages.filter(
        (msg) => msg.op === 'connection_created' && msg.connection_request_id
      );
      const confirmedRequestIds = new Set(
        outboundConfirmations.map((conf) => conf.connection_request_id)
      );

      const inboundMessagesResult = await this.hcsClient.getMessages(
        inboundTopicId
      );
      const incomingRequests = inboundMessagesResult.messages.filter(
        (msg) => msg.op === 'connection_request' && msg.sequence_number
      );

      this.stateManager.clearConnectionRequests();

      const profilePromises = incomingRequests.map(async (request) => {
        const requestId = request.sequence_number;
        if (!requestId) {
          return;
        }

        if (confirmedRequestIds.has(requestId)) {
          return;
        }

        const requestorId = this.extractAccountId(request);
        if (!requestorId) {
          return;
        }

        let profile = undefined;
        try {
          const profileResult = await this.hcsClient.getAgentProfile(
            requestorId
          );
          if (profileResult.success && profileResult.profile) {
            profile = {
              name:
                profileResult.profile.display_name ||
                profileResult.profile.alias,
              bio: profileResult.profile.bio,
              avatar: profileResult.profile.profileImage,
              type: profileResult.profile.type,
            };
          }
        } catch (profileError) {
          this.logger.warn(
            `Could not fetch profile for ${requestorId}: ${profileError}`
          );
        }

        this.stateManager.addConnectionRequest({
          id: requestId,
          requestorId,
          requestorName: profile?.name || `Agent ${requestorId}`,
          timestamp: new Date(request.created || Date.now()),
          memo: request.m,
          profile,
        });
      });

      await Promise.allSettled(profilePromises);
      this.logger.info(
        `Found ${
          this.stateManager.listConnectionRequests().length
        } pending connection requests`
      );
    } catch (error) {
      this.logger.error(`Error refreshing connection requests: ${error}`);
      throw error;
    }
  }

  private listRequests(): string {
    const requests = this.stateManager.listConnectionRequests();
    if (requests.length === 0) {
      return 'No pending connection requests found.';
    }

    let output = `Found ${requests.length} pending connection request(s):\n\n`;
    const sortedRequests = [...requests].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    sortedRequests.forEach((request, index) => {
      output += `${index + 1}. Request ID: ${request.id}\n`;
      output += `   From: ${request.requestorName} (${request.requestorId})\n`;
      output += `   Received: ${request.timestamp.toLocaleString()}\n`;
      if (request.memo) {
        output += `   Memo: ${request.memo}\n`;
      }
      output += '\n';
    });

    output +=
      'To view more details about a request, use action="view" with the specific requestId.\n';
    output +=
      'To reject a request, use action="reject" with the specific requestId.';
    return output;
  }

  private viewRequest(requestId: number): string {
    const request = this.stateManager.getConnectionRequestById(requestId);
    if (!request) {
      return `Error: Request ID ${requestId} not found or no longer pending.`;
    }

    let output = `Details for connection request #${requestId}:\n\n`;
    output += `Requestor ID: ${request.requestorId}\n`;
    output += `Requestor Name: ${request.requestorName}\n`;
    output += `Received: ${request.timestamp.toLocaleString()}\n`;

    if (request.memo) {
      output += `Memo: ${request.memo}\n`;
    }

    if (request.profile) {
      output += '\nAgent Profile Information:\n';

      if (request.profile.name) {
        output += `Name: ${request.profile.name}\n`;
      }

      if (request.profile.type) {
        output += `Type: ${request.profile.type}\n`;
      }

      if (request.profile.bio) {
        output += `Bio: ${request.profile.bio}\n`;
      }
    }

    output += '\nActions:\n';
    output += `- To reject this request: action="reject", requestId=${requestId}\n`;
    output +=
      'Use the separate "accept_connection_request" tool to accept requests.';
    return output;
  }

  private async rejectRequest(requestId: number): Promise<string> {
    const request = this.stateManager.getConnectionRequestById(requestId);
    if (!request) {
      return `Error: Request ID ${requestId} not found or no longer pending.`;
    }

    this.stateManager.removeConnectionRequest(requestId);
    return `Connection request #${requestId} from ${request.requestorName} was rejected locally (removed from pending list).`;
  }

  private extractAccountId(request: HCSMessage): string | undefined {
    if (request.operator_id) {
      return this.hcsClient.standardClient.extractAccountFromOperatorId(
        request.operator_id
      );
    }
    return undefined;
  }
}
