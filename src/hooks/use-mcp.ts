"use client";

import { useState, useCallback, useEffect } from "react";
import { MCPClient, mcpClientManager } from "@/lib/mcp-client";
import {
  MCPTool,
  MCPResource,
  MCPPrompt,
  MCPServerInfo,
  ConnectionStatus,
  ToolCallResponse,
  ResourceReadResponse,
  PromptGetResponse,
} from "@/types/mcp";

export interface UseMCPReturn {
  // Connection management
  servers: MCPServerInfo[];
  activeServer: string | null;
  connectToServer: (url: string, headers?: Record<string, string>) => Promise<void>;
  disconnectFromServer: (url: string) => void;
  setActiveServer: (url: string | null) => void;
  
  // Data
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  
  // Actions
  refreshTools: () => Promise<void>;
  refreshResources: () => Promise<void>;
  refreshPrompts: () => Promise<void>;
  callTool: (name: string, args?: Record<string, any>) => Promise<ToolCallResponse>;
  readResource: (uri: string) => Promise<ResourceReadResponse>;
  getPrompt: (name: string, args?: Record<string, string>) => Promise<PromptGetResponse>;
  
  // State
  loading: boolean;
  error: string | null;
}

export function useMCP(): UseMCPReturn {
  const [servers, setServers] = useState<MCPServerInfo[]>([]);
  const [activeServer, setActiveServerState] = useState<string | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [prompts, setPrompts] = useState<MCPPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateServers = useCallback(() => {
    const clients = mcpClientManager.getAllClients();
    const serverInfos = clients.map(client => client.getServerInfo()).filter(Boolean) as MCPServerInfo[];
    setServers(serverInfos);
  }, []);

  const connectToServer = useCallback(async (url: string, headers?: Record<string, string>) => {
    setLoading(true);
    setError(null);

    try {
      await mcpClientManager.connectToServer(url, headers);
      updateServers();

      // Set as active server if it's the first one
      if (!activeServer) {
        setActiveServerState(url);
      }
    } catch (err) {
      let errorMessage = 'Failed to connect to server';
      if (err instanceof Error) {
        if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to reach the server. Please check the URL and your internet connection.';
        } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = 'Authentication failed: Invalid or missing authentication credentials.';
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = 'Access denied: You do not have permission to access this server.';
        } else if (err.message.includes('404') || err.message.includes('Not Found')) {
          errorMessage = 'Server not found: The MCP server URL does not exist or is not accessible.';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'CORS error: The server does not allow cross-origin requests from this domain.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Connection timeout: The server took too long to respond.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeServer, updateServers]);

  const disconnectFromServer = useCallback((url: string) => {
    mcpClientManager.disconnectFromServer(url);
    updateServers();
    
    if (activeServer === url) {
      const remainingServers = mcpClientManager.getAllClients();
      setActiveServerState(remainingServers.length > 0 ? remainingServers[0].getServerInfo()?.url || null : null);
    }
  }, [activeServer, updateServers]);

  const setActiveServer = useCallback((url: string | null) => {
    setActiveServerState(url);
  }, []);

  const getActiveClient = useCallback((): MCPClient | null => {
    if (!activeServer) return null;
    return mcpClientManager.getClient(activeServer) || null;
  }, [activeServer]);

  const refreshTools = useCallback(async () => {
    const client = getActiveClient();
    if (!client) {
      setTools([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await client.listTools();
      setTools(response.tools);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [getActiveClient]);

  const refreshResources = useCallback(async () => {
    const client = getActiveClient();
    if (!client) {
      setResources([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await client.listResources();
      setResources(response.resources);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch resources");
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [getActiveClient]);

  const refreshPrompts = useCallback(async () => {
    const client = getActiveClient();
    if (!client) {
      setPrompts([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await client.listPrompts();
      setPrompts(response.prompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prompts");
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, [getActiveClient]);

  const callTool = useCallback(async (name: string, args?: Record<string, any>): Promise<ToolCallResponse> => {
    const client = getActiveClient();
    if (!client) {
      throw new Error("No active server connection");
    }

    return client.callTool(name, args);
  }, [getActiveClient]);

  const readResource = useCallback(async (uri: string): Promise<ResourceReadResponse> => {
    const client = getActiveClient();
    if (!client) {
      throw new Error("No active server connection");
    }

    return client.readResource(uri);
  }, [getActiveClient]);

  const getPrompt = useCallback(async (name: string, args?: Record<string, string>): Promise<PromptGetResponse> => {
    const client = getActiveClient();
    if (!client) {
      throw new Error("No active server connection");
    }

    return client.getPrompt(name, args);
  }, [getActiveClient]);

  // Refresh data when active server changes
  useEffect(() => {
    if (activeServer) {
      refreshTools();
      refreshResources();
      refreshPrompts();
    } else {
      setTools([]);
      setResources([]);
      setPrompts([]);
    }
  }, [activeServer, refreshTools, refreshResources, refreshPrompts]);

  // Initialize servers on mount
  useEffect(() => {
    updateServers();
  }, [updateServers]);

  return {
    servers,
    activeServer,
    connectToServer,
    disconnectFromServer,
    setActiveServer,
    tools,
    resources,
    prompts,
    refreshTools,
    refreshResources,
    refreshPrompts,
    callTool,
    readResource,
    getPrompt,
    loading,
    error,
  };
}
