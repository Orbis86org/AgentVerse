export interface RegisteredAgent {
  name: string;
  accountId: string;
  inboundTopicId: string;
  outboundTopicId: string;
  profileTopicId?: string;
}

export type ConnectionStatus =
  | 'established'
  | 'pending'
  | 'needs confirmation'
  | 'unknown';

export interface AgentProfileInfo {
  name?: string;
  bio?: string;
  avatar?: string;
  type?: string;
}

export interface ConnectionRequestInfo {
  id: number;
  requestorId: string;
  requestorName: string;
  timestamp: Date;
  memo?: string;
  profile?: AgentProfileInfo;
}

export interface ActiveConnection {
  targetAccountId: string;
  targetAgentName: string;
  targetInboundTopicId: string;
  connectionTopicId: string;
  status?: ConnectionStatus;
  created?: Date;
  lastActivity?: Date;
  isPending?: boolean;
  needsConfirmation?: boolean;
  profileInfo?: AgentProfileInfo;
}

/**
 * Core state management interface for the standards agent toolkit.
 * All tools that need to maintain state should use an implementation of this interface.
 */
export interface IStateManager {
  /**
   * Sets the current active agent, clearing any previous connections.
   */
  setCurrentAgent(agent: RegisteredAgent | null): void;

  /**
   * Gets the current active agent.
   */
  getCurrentAgent(): RegisteredAgent | null;

  /**
   * Adds a new active connection to the state.
   * Will not add duplicates based on connectionTopicId.
   */
  addActiveConnection(connection: ActiveConnection): void;

  /**
   * Updates an existing connection or adds it if not found.
   * Preserves existing properties when updating.
   */
  updateOrAddConnection(connection: ActiveConnection): void;

  /**
   * Lists all active connections for the current agent.
   */
  listConnections(): ActiveConnection[];

  /**
   * Finds a connection by identifier, which can be:
   * - A 1-based index number as shown in the connection list
   * - A target account ID
   * - A connection topic ID
   */
  getConnectionByIdentifier(identifier: string): ActiveConnection | undefined;

  /**
   * Gets the last processed message timestamp for a connection.
   */
  getLastTimestamp(connectionTopicId: string): number;

  /**
   * Updates the last processed message timestamp for a connection.
   */
  updateTimestamp(connectionTopicId: string, timestampNanos: number): void;

  /**
   * Stores a connection request in the state.
   */
  addConnectionRequest(request: ConnectionRequestInfo): void;

  /**
   * Lists all pending connection requests.
   */
  listConnectionRequests(): ConnectionRequestInfo[];

  /**
   * Finds a connection request by its ID.
   */
  getConnectionRequestById(requestId: number): ConnectionRequestInfo | undefined;

  /**
   * Removes a connection request from the state.
   */
  removeConnectionRequest(requestId: number): void;

  /**
   * Clears all connection requests from the state.
   */
  clearConnectionRequests(): void;
}

/**
 * Implementation of the IStateManager interface for the OpenConvai system.
 * Manages agent state and connection information with thread safety and
 * proper timestamp tracking.
 */
export class OpenConvaiState implements IStateManager {
  private currentAgent: RegisteredAgent | null = null;
  private activeConnections: ActiveConnection[] = [];
  private connectionMessageTimestamps: Record<string, number> = {};
  private connectionRequests: Map<number, ConnectionRequestInfo> = new Map();

  /**
   * Sets the current active agent and clears any previous connection data.
   * This should be called when switching between agents.
   */
  setCurrentAgent(agent: RegisteredAgent | null): void {
    this.currentAgent = agent;
    this.activeConnections = [];
    this.connectionMessageTimestamps = {};
    this.connectionRequests.clear();
  }

  /**
   * Returns the currently active agent or null if none is set.
   */
  getCurrentAgent(): RegisteredAgent | null {
    return this.currentAgent;
  }

  /**
   * Adds a new connection to the active connections list.
   * Ensures no duplicates are added based on connectionTopicId.
   * Initializes timestamp tracking for the connection.
   */
  addActiveConnection(connection: ActiveConnection): void {
    if (this.findConnectionIndex(connection.connectionTopicId) !== -1) {
      return;
    }

    this.activeConnections.push({ ...connection });

    this.initializeTimestampIfNeeded(connection.connectionTopicId);
  }

  /**
   * Updates an existing connection or adds it if not found.
   * Preserves existing properties when updating by merging objects.
   */
  updateOrAddConnection(connection: ActiveConnection): void {
    const index = this.findConnectionIndex(connection.connectionTopicId);

    if (index !== -1) {
      this.activeConnections[index] = {
        ...this.activeConnections[index],
        ...connection,
      };
    } else {
      this.addActiveConnection(connection);
    }

    this.initializeTimestampIfNeeded(connection.connectionTopicId);
  }

  /**
   * Returns a copy of all active connections.
   */
  listConnections(): ActiveConnection[] {
    return [...this.activeConnections];
  }

  /**
   * Finds a connection by its identifier, which can be:
   * - A 1-based index as displayed in the connection list
   * - A target account ID string
   * - A connection topic ID string
   */
  getConnectionByIdentifier(identifier: string): ActiveConnection | undefined {
    const numericIndex = parseInt(identifier) - 1;
    if (
      !isNaN(numericIndex) &&
      numericIndex >= 0 &&
      numericIndex < this.activeConnections.length
    ) {
      return this.activeConnections[numericIndex];
    }

    return this.activeConnections.find(
      (conn) =>
        conn.targetAccountId === identifier ||
        conn.connectionTopicId === identifier
    );
  }

  /**
   * Gets the last processed message timestamp for a connection.
   * Returns 0 if no timestamp has been recorded.
   */
  getLastTimestamp(connectionTopicId: string): number {
    return this.connectionMessageTimestamps[connectionTopicId] || 0;
  }

  /**
   * Updates the last processed message timestamp for a connection,
   * but only if the new timestamp is more recent than the existing one.
   */
  updateTimestamp(connectionTopicId: string, timestampNanos: number): void {
    if (connectionTopicId in this.connectionMessageTimestamps) {
      const currentTimestamp =
        this.connectionMessageTimestamps[connectionTopicId];
      if (timestampNanos > currentTimestamp) {
        this.connectionMessageTimestamps[connectionTopicId] = timestampNanos;
      }
    }
  }

  /**
   * Helper method to find a connection's index by its topic ID.
   * Returns -1 if not found.
   */
  private findConnectionIndex(connectionTopicId: string): number {
    return this.activeConnections.findIndex(
      (conn) => conn.connectionTopicId === connectionTopicId
    );
  }

  /**
   * Helper method to initialize timestamp tracking for a connection
   * if it doesn't already exist.
   */
  private initializeTimestampIfNeeded(connectionTopicId: string): void {
    if (!(connectionTopicId in this.connectionMessageTimestamps)) {
      this.connectionMessageTimestamps[connectionTopicId] =
        Date.now() * 1_000_000;
    }
  }

  addConnectionRequest(request: ConnectionRequestInfo): void {
    this.connectionRequests.set(request.id, { ...request });
  }

  listConnectionRequests(): ConnectionRequestInfo[] {
    return Array.from(this.connectionRequests.values());
  }

  getConnectionRequestById(requestId: number): ConnectionRequestInfo | undefined {
    return this.connectionRequests.get(requestId);
  }

  removeConnectionRequest(requestId: number): void {
    this.connectionRequests.delete(requestId);
  }

  clearConnectionRequests(): void {
    this.connectionRequests.clear();
  }
}
