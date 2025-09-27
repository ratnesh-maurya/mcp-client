// MCP (Model Context Protocol) Type Definitions
// Based on the MCP specification: https://modelcontextprotocol.io/specification/

export interface MCPMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPRequest extends MCPMessage {
  method: string;
  params?: any;
}

export interface MCPResponse extends MCPMessage {
  id: string | number;
  result?: any;
  error?: MCPError;
}

export interface MCPNotification extends MCPMessage {
  method: string;
  params?: any;
}

// Initialization
export interface InitializeRequest {
  protocolVersion: string;
  capabilities: ClientCapabilities;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface InitializeResponse {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface ClientCapabilities {
  elicitation?: {};
  sampling?: {};
}

export interface ServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: {};
}

// Tools
export interface MCPTool {
  name: string;
  title?: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface ToolsListRequest {
  cursor?: string;
}

export interface ToolsListResponse {
  tools: MCPTool[];
  nextCursor?: string;
}

export interface ToolCallRequest {
  name: string;
  arguments?: Record<string, any>;
}

export interface ToolCallResponse {
  content: MCPContent[];
  isError?: boolean;
}

// Resources
export interface MCPResource {
  uri: string;
  name: string;
  title?: string;
  description?: string;
  mimeType?: string;
}

export interface ResourcesListRequest {
  cursor?: string;
}

export interface ResourcesListResponse {
  resources: MCPResource[];
  nextCursor?: string;
}

export interface ResourceReadRequest {
  uri: string;
}

export interface ResourceReadResponse {
  contents: MCPResourceContent[];
}

export interface MCPResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

// Prompts
export interface MCPPrompt {
  name: string;
  title?: string;
  description?: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPPromptArgument {
  name: string;
  title?: string;
  description?: string;
  required?: boolean;
}

export interface PromptsListRequest {
  cursor?: string;
}

export interface PromptsListResponse {
  prompts: MCPPrompt[];
  nextCursor?: string;
}

export interface PromptGetRequest {
  name: string;
  arguments?: Record<string, string>;
}

export interface PromptGetResponse {
  description?: string;
  messages: MCPPromptMessage[];
}

export interface MCPPromptMessage {
  role: "user" | "assistant" | "system";
  content: MCPContent;
}

// Content types
export type MCPContent = MCPTextContent | MCPImageContent | MCPResourceContent;

export interface MCPTextContent {
  type: "text";
  text: string;
}

export interface MCPImageContent {
  type: "image";
  data: string;
  mimeType: string;
}

// Connection status
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface MCPServerInfo {
  url: string;
  name?: string;
  version?: string;
  status: ConnectionStatus;
  capabilities?: ServerCapabilities;
  error?: string;
}

// Client state
export interface MCPClientState {
  servers: Record<string, MCPServerInfo>;
  activeServer?: string;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
}
