import {
  MCPMessage,
  MCPRequest,
  MCPResponse,
  InitializeRequest,
  InitializeResponse,
  ToolsListResponse,
  ResourcesListResponse,
  PromptsListResponse,
  ToolCallRequest,
  ToolCallResponse,
  ResourceReadRequest,
  ResourceReadResponse,
  PromptGetRequest,
  PromptGetResponse,
  MCPServerInfo,
  ConnectionStatus,
} from "@/types/mcp";

export class MCPClient {
  private url: string;
  private requestId: number = 1;
  private status: ConnectionStatus = "disconnected";
  private serverInfo?: MCPServerInfo;
  private headers: Record<string, string> = {};

  constructor(url: string, headers?: Record<string, string>) {
    this.url = url;
    this.headers = headers || {};
  }

  private async sendRequest<T = any>(
    method: string,
    params?: any
  ): Promise<T> {
    const request: MCPRequest = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method,
      params,
    };

    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.headers,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: MCPResponse = await response.json();

      if (data.error) {
        throw new Error(`MCP Error ${data.error.code}: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error("MCP request failed:", error);
      throw error;
    }
  }

  async initialize(): Promise<InitializeResponse> {
    this.status = "connecting";

    try {
      const request: InitializeRequest = {
        protocolVersion: "2025-03-26",
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        clientInfo: {
          name: "MCP Web Client",
          version: "1.0.0",
        },
      };

      const response = await this.sendRequest<InitializeResponse>(
        "initialize",
        request
      );

      this.status = "connected";
      this.serverInfo = {
        url: this.url,
        name: response.serverInfo.name,
        version: response.serverInfo.version,
        status: this.status,
        capabilities: response.capabilities,
      };

      // Send initialized notification
      await this.sendNotification("notifications/initialized");

      return response;
    } catch (error) {
      this.status = "error";
      throw error;
    }
  }

  private async sendNotification(method: string, params?: any): Promise<void> {
    const notification: MCPMessage = {
      jsonrpc: "2.0",
      method,
      params,
    };

    try {
      await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.headers,
        },
        body: JSON.stringify(notification),
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  async listTools(): Promise<ToolsListResponse> {
    return this.sendRequest<ToolsListResponse>("tools/list");
  }

  async callTool(name: string, args?: Record<string, any>): Promise<ToolCallResponse> {
    const request: ToolCallRequest = {
      name,
      arguments: args,
    };
    return this.sendRequest<ToolCallResponse>("tools/call", request);
  }

  async listResources(): Promise<ResourcesListResponse> {
    return this.sendRequest<ResourcesListResponse>("resources/list");
  }

  async readResource(uri: string): Promise<ResourceReadResponse> {
    const request: ResourceReadRequest = { uri };
    return this.sendRequest<ResourceReadResponse>("resources/read", request);
  }

  async listPrompts(): Promise<PromptsListResponse> {
    return this.sendRequest<PromptsListResponse>("prompts/list");
  }

  async getPrompt(name: string, args?: Record<string, string>): Promise<PromptGetResponse> {
    const request: PromptGetRequest = {
      name,
      arguments: args,
    };
    return this.sendRequest<PromptGetResponse>("prompts/get", request);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getServerInfo(): MCPServerInfo | undefined {
    return this.serverInfo;
  }

  disconnect(): void {
    this.status = "disconnected";
    this.serverInfo = undefined;
  }
}

// Utility function to create and manage MCP clients
export class MCPClientManager {
  private clients: Map<string, MCPClient> = new Map();

  async connectToServer(url: string, headers?: Record<string, string>): Promise<MCPClient> {
    const clientKey = `${url}:${JSON.stringify(headers || {})}`;

    if (this.clients.has(clientKey)) {
      return this.clients.get(clientKey)!;
    }

    const client = new MCPClient(url, headers);

    try {
      await client.initialize();
      this.clients.set(clientKey, client);
      return client;
    } catch (error) {
      console.error(`Failed to connect to MCP server at ${url}:`, error);
      throw error;
    }
  }

  getClient(url: string): MCPClient | undefined {
    return this.clients.get(url);
  }

  getAllClients(): MCPClient[] {
    return Array.from(this.clients.values());
  }

  disconnectFromServer(url: string): void {
    const client = this.clients.get(url);
    if (client) {
      client.disconnect();
      this.clients.delete(url);
    }
  }

  disconnectAll(): void {
    for (const client of this.clients.values()) {
      client.disconnect();
    }
    this.clients.clear();
  }
}

export const mcpClientManager = new MCPClientManager();
