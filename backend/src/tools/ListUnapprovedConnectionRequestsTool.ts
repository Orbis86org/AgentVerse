import { StructuredTool, ToolParams } from '@langchain/core/tools';
import { z } from 'zod';
import {
  IStateManager,
  ConnectionRequestInfo,
  AgentProfileInfo,
} from '../state/open-convai-state';
import { HCS10Client } from '../hcs10/HCS10Client';
import {
  Logger,
  HCSMessage,
  HCS11Profile,
} from '@hashgraphonline/standards-sdk';
import { fetchConnectionMap, ConnectionMap } from '../utils/connectionUtils';

interface PendingRequest extends ConnectionRequestInfo {
  status: 'needs_confirmation' | 'pending_outbound';
}

type ListPendingRequestsToolParams = ToolParams & {
  hcsClient: HCS10Client;
  stateManager: IStateManager;
};

export class ListUnapprovedConnectionRequestsTool extends StructuredTool {
  name = 'list_unapproved_connection_requests';
  description =
    'Lists all connection requests that are not fully established, including incoming requests needing approval and outgoing requests waiting for confirmation.';
  schema = z.object({
    sortBy: z
      .enum(['time_asc', 'time_desc', 'name_asc', 'name_desc'])
      .optional()
      .describe(
        'Optional sorting criteria for the requests list (default: time_desc, newest first)'
      ),
    limit: z
      .number()
      .optional()
      .describe(
        'Optional limit on the number of requests to return (default: all)'
      ),
  });

  private hcsClient: HCS10Client;
  private stateManager: IStateManager;
  private logger: Logger;

  constructor({
    hcsClient,
    stateManager,
    ...rest
  }: ListPendingRequestsToolParams) {
    super(rest);
    this.hcsClient = hcsClient;
    this.stateManager = stateManager;
    this.logger = Logger.getInstance({
      module: 'ListPendingRequestsTool',
      level: 'debug',
    });
  }

  protected async _call({
    sortBy = 'time_desc',
    limit,
  }: z.infer<this['schema']>): Promise<string> {
    const currentAgent = this.stateManager.getCurrentAgent();
    if (!currentAgent) {
      return 'Error: Cannot list pending requests. No agent is currently active. Please register or select an agent first.';
    }

    try {
      const connectionMap = await fetchConnectionMap(this.hcsClient);
      const pendingRequests = this.findAllPendingRequests(connectionMap);
      return this.formatRequestsList(pendingRequests, sortBy, limit);
    } catch (error) {
      this.logger.error(`Error in ${this.name}: ${error}`);
      return `Error listing pending requests: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  /**
   * Processes the connection connectionMap to find all requests
   * that are not fully established (incoming unapproved and outgoing pending).
   */
  private findAllPendingRequests(
    connectionMap: ConnectionMap
  ): PendingRequest[] {
    const pending: PendingRequest[] = [];

    for (const [reqSeqNum, request] of Array.from(
      connectionMap.inboundRequests.entries()
    )) {
      if (connectionMap.confirmedRequestIds.has(reqSeqNum)) {
        continue;
      }

      const requestorAccountId = this.extractAccountIdFromMessage(request);
      if (!requestorAccountId) {
        continue;
      }

      const alreadyEstablishedInbound = Array.from(
        connectionMap.inboundConfirmations.values()
      ).some((conf) => conf.connection_id === reqSeqNum);
      if (alreadyEstablishedInbound) {
        continue;
      }

      const existingConnections = this.stateManager.listConnections();
      const alreadyConnectedState = existingConnections.some(
        (conn) =>
          conn.targetAccountId === requestorAccountId &&
          conn.status === 'established' &&
          !conn.isPending &&
          !conn.needsConfirmation
      );
      if (alreadyConnectedState) {
        continue;
      }

      const profile = connectionMap.profileMap.get(requestorAccountId);
      const profileInfo = profile
        ? this.mapSDKProfileToInfo(profile)
        : undefined;

      pending.push({
        id: reqSeqNum,
        requestorId: requestorAccountId,
        requestorName: profileInfo?.name || `Agent ${requestorAccountId}`,
        timestamp: new Date(request.created || Date.now()),
        memo: request.m || '',
        profile: profileInfo,
        status: 'needs_confirmation',
      });
    }

    for (const [reqSeqNum, request] of Array.from(
      connectionMap.outboundRequests.entries()
    )) {
      const confirmedInbound =
        connectionMap.inboundConfirmations.has(reqSeqNum);
      const confirmedOutbound =
        connectionMap.outboundConfirmations.has(reqSeqNum);

      if (confirmedInbound || confirmedOutbound) {
        continue;
      }

      const targetAccountId = this.extractTargetAccountIdFromOutbound(request);
      if (!targetAccountId) {
        this.logger.warn(
          `Could not determine target account for outbound request ${reqSeqNum}`
        );
        continue;
      }

      const existingConnections = this.stateManager.listConnections();
      const alreadyConnectedState = existingConnections.some(
        (conn) =>
          conn.targetAccountId === targetAccountId &&
          conn.status === 'established' &&
          !conn.isPending &&
          !conn.needsConfirmation
      );
      if (alreadyConnectedState) {
        continue;
      }

      const profile = connectionMap.profileMap.get(targetAccountId);
      const profileInfo = profile
        ? this.mapSDKProfileToInfo(profile)
        : undefined;

      pending.push({
        id: reqSeqNum,
        requestorId: targetAccountId,
        requestorName: profileInfo?.name || `Agent ${targetAccountId}`,
        timestamp: new Date(request.created || Date.now()),
        memo: request.m || '',
        profile: profileInfo,
        status: 'pending_outbound',
      });
    }

    return pending;
  }

  /**
   * Helper to attempt extracting target account ID from outbound request message.
   */
  private extractTargetAccountIdFromOutbound(
    message: HCSMessage
  ): string | undefined {
    if (!message.operator_id) {
      return undefined;
    }
    return this.hcsClient.standardClient.extractAccountFromOperatorId(
      message.operator_id
    );
  }

  /**
   * Maps HCS11Profile to the AgentProfileInfo used in state/display.
   */
  private mapSDKProfileToInfo(profile: HCS11Profile): AgentProfileInfo {
    return {
      name: profile.display_name || profile.alias,
      bio: profile.bio,
      avatar: profile.profileImage,
      type: profile.type === 1 ? 'AI Agent' : 'Personal',
    };
  }

  /**
   * Extracts the account ID from relevant fields in an HCSMessage.
   */
  private extractAccountIdFromMessage(message: HCSMessage): string | undefined {
    if (message.operator_id) {
      return this.hcsClient.standardClient.extractAccountFromOperatorId(
        message.operator_id
      );
    }
    return message.connected_account_id || undefined;
  }

  /**
   * Formats the list of pending requests for display.
   */
  private formatRequestsList(
    requests: PendingRequest[],
    sortBy: string,
    limit?: number
  ): string {
    if (requests.length === 0) {
      return 'No pending connection requests found (incoming or outgoing).';
    }

    const sortedRequests = this.sortRequests(requests, sortBy);
    const limitedRequests = limit
      ? sortedRequests.slice(0, limit)
      : sortedRequests;

    let output = `Found ${requests.length} pending connection request(s):\n\n`;

    limitedRequests.forEach((request, index) => {
      const statusIndicator =
        request.status === 'needs_confirmation'
          ? '🟠 Incoming'
          : '⚪️ Outgoing';
      output += `${index + 1}. ${statusIndicator} - ID: ${request.id}\n`;
      output += `   ${
        request.status === 'needs_confirmation' ? 'From:' : 'To:  '
      } ${request.requestorName} (${request.requestorId})\n`;
      output += `   Sent/Rcvd: ${request.timestamp.toLocaleString()}\n`;
      if (request.memo) {
        output += `   Memo: ${request.memo}\n`;
      }
      if (request.profile?.bio) {
        output += `   Bio: ${request.profile.bio.substring(0, 100)}${
          request.profile.bio.length > 100 ? '...' : ''
        }\n`;
      }
      output += '\n';
    });

    output +=
      'Use related tools (manage_requests, accept_request) to handle these items.';
    return output;
  }

  /**
   * Sorts connection requests based on the specified criteria.
   */
  private sortRequests(
    requests: PendingRequest[],
    sortBy: string
  ): PendingRequest[] {
    const requestsCopy = [...requests];

    switch (sortBy) {
      case 'time_asc':
        return requestsCopy.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
      case 'time_desc':
        return requestsCopy.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
      case 'name_asc':
        return requestsCopy.sort((a, b) =>
          a.requestorName.localeCompare(b.requestorName)
        );
      case 'name_desc':
        return requestsCopy.sort((a, b) =>
          b.requestorName.localeCompare(a.requestorName)
        );
      default:
        return requestsCopy.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
    }
  }
}
