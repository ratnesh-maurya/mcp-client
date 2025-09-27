"use client";

import { useState } from "react";
import { Plus, Server, Trash2, Wifi, WifiOff, AlertCircle, Loader2, Key, Eye, EyeOff, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingCard } from "@/components/ui/background-gradient";
import { useMCP } from "@/hooks/use-mcp";
import { isValidUrl, getStatusColor } from "@/lib/utils";

export function ServerConnection() {
  const [newServerUrl, setNewServerUrl] = useState("");
  const [customHeaders, setCustomHeaders] = useState<Array<{ key: string, value: string }>>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const {
    servers,
    activeServer,
    connectToServer,
    disconnectFromServer,
    setActiveServer,
    loading,
    error,
  } = useMCP();

  const addHeader = () => {
    setCustomHeaders([...customHeaders, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customHeaders];
    updated[index][field] = value;
    setCustomHeaders(updated);
  };

  const handleConnect = async () => {
    if (!newServerUrl.trim() || !isValidUrl(newServerUrl)) {
      return;
    }

    setIsConnecting(true);
    try {
      const headers: Record<string, string> = {};

      // Add custom headers
      customHeaders.forEach(header => {
        if (header.key.trim() && header.value.trim()) {
          headers[header.key.trim()] = header.value.trim();
        }
      });

      await connectToServer(newServerUrl.trim(), Object.keys(headers).length > 0 ? headers : undefined);
      setNewServerUrl("");
      setCustomHeaders([]);
      setShowAdvanced(false);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = (url: string) => {
    disconnectFromServer(url);
  };

  const handleSetActive = (url: string) => {
    setActiveServer(url === activeServer ? null : url);
  };

  const handleQuickConnect = (url: string, needsAuth: boolean = false) => {
    setNewServerUrl(url);
    if (needsAuth) {
      setCustomHeaders([{ key: "Authorization", value: "Bearer " }]);
      setShowAdvanced(true);
    } else {
      setCustomHeaders([]);
      setShowAdvanced(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-600" />;
      case "connecting":
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "disconnected":
      default:
        return <WifiOff className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <GlowingCard containerClassName="w-full">
      <Card className="w-full border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            MCP Server Connection
          </CardTitle>
          <CardDescription>
            Connect to Model Context Protocol servers to access tools, resources, and prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new server */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter MCP server URL (e.g., https://api.githubcopilot.com/mcp/)"
                value={newServerUrl}
                onChange={(e) => setNewServerUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !showAdvanced) {
                    handleConnect();
                  }
                }}
                disabled={isConnecting}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={isConnecting}
              >
                <Key className="h-4 w-4" />
                {showAdvanced ? (
                  <ChevronDown className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </Button>
              <Button
                onClick={handleConnect}
                disabled={!newServerUrl.trim() || !isValidUrl(newServerUrl) || isConnecting}
                size="sm"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Connect
              </Button>
            </div>

            {/* Advanced authentication options */}
            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Key className="h-4 w-4" />
                  Custom Headers (Optional)
                </div>

                <div className="space-y-3">
                  {customHeaders.map((header, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Header name (e.g., Authorization)"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        disabled={isConnecting}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Header value (e.g., Bearer token123)"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        disabled={isConnecting}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHeader(index)}
                        disabled={isConnecting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addHeader}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Header
                  </Button>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Common examples:</strong></p>
                    <p>• Authorization: Bearer your_token_here</p>
                    <p>• X-API-Key: your_api_key</p>
                    <p>• Content-Type: application/json</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick connect chips */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Quick Connect:</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickConnect("http://localhost:8080")}
                  disabled={isConnecting}
                >
                  Local Server
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickConnect("https://api.githubcopilot.com/mcp/", true)}
                  disabled={isConnecting}
                >
                  GitHub Copilot
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickConnect("https://mcp.openai.com/", true)}
                  disabled={isConnecting}
                >
                  OpenAI MCP
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickConnect("https://mcp.anthropic.com/", true)}
                  disabled={isConnecting}
                >
                  Anthropic MCP
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickConnect("https://enterprise-mcp.company.com/", true)}
                  disabled={isConnecting}
                >
                  Enterprise MCP
                </Button>
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          {/* Server list */}
          <div className="space-y-2">
            {servers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No servers connected</p>
                <p className="text-sm">Add a server URL above to get started</p>
              </div>
            ) : (
              servers.map((server) => (
                <div
                  key={server.url}
                  className={`p-3 rounded-md border transition-colors cursor-pointer ${activeServer === server.url
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                    } ${getStatusColor(server.status)}`}
                  onClick={() => handleSetActive(server.url)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getStatusIcon(server.status)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {server.name || "Unknown Server"}
                          </p>
                          {server.version && (
                            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                              v{server.version}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {server.url}
                        </p>
                        {server.error && (
                          <p className="text-xs text-red-600 mt-1">{server.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeServer === server.url && (
                        <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">
                          Active
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisconnect(server.url);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Server capabilities */}
                  {server.capabilities && activeServer === server.url && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium mb-2">Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {server.capabilities.tools && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                            Tools
                          </span>
                        )}
                        {server.capabilities.resources && (
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            Resources
                          </span>
                        )}
                        {server.capabilities.prompts && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                            Prompts
                          </span>
                        )}
                        {server.capabilities.logging && (
                          <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                            Logging
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </GlowingCard>
  );
}
