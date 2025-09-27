"use client";

import { useState } from "react";
import {
  MessageSquare,
  Play,
  RefreshCw,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  User,
  Bot,
  Settings,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMCP } from "@/hooks/use-mcp";
import { formatJSON, copyToClipboard, downloadAsFile } from "@/lib/utils";
import { MCPPrompt, PromptGetResponse } from "@/types/mcp";

interface PromptItemProps {
  prompt: MCPPrompt;
  onGet: (name: string, args: Record<string, string>) => Promise<PromptGetResponse>;
}

function PromptItem({ prompt, onGet }: PromptItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGetting, setIsGetting] = useState(false);
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PromptGetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGet = async () => {
    setIsGetting(true);
    setError(null);
    setResult(null);

    try {
      const processedArgs: Record<string, string> = {};
      Object.entries(args).forEach(([key, value]) => {
        if (value.trim()) {
          processedArgs[key] = value;
        }
      });

      const response = await onGet(prompt.name, processedArgs);
      setResult(response);
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get prompt");
    } finally {
      setIsGetting(false);
    }
  };

  const handleArgChange = (argName: string, value: string) => {
    setArgs(prev => ({ ...prev, [argName]: value }));
  };

  const copyPrompt = () => {
    if (result) {
      copyToClipboard(formatJSON(result));
    }
  };

  const downloadPrompt = () => {
    if (result) {
      downloadAsFile(
        formatJSON(result),
        `${prompt.name}-prompt.json`,
        "application/json"
      );
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "user":
        return <User className="h-4 w-4" />;
      case "assistant":
        return <Bot className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "user":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "assistant":
        return "text-green-600 bg-green-50 border-green-200";
      case "system":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <MessageSquare className="h-4 w-4" />
            <div>
              <CardTitle className="text-lg">{prompt.title || prompt.name}</CardTitle>
              <CardDescription className="text-sm">
                {prompt.description}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleGet}
            disabled={isGetting}
            size="sm"
          >
            {isGetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Get Prompt
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Arguments */}
          {prompt.arguments && prompt.arguments.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Arguments:</h4>
              <div className="space-y-2">
                {prompt.arguments.map((arg) => (
                  <div key={arg.name}>
                    <label className="block text-sm font-medium mb-1">
                      {arg.title || arg.name}
                      {arg.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <Input
                      placeholder={arg.description || `Enter ${arg.name}`}
                      value={args[arg.name] || ""}
                      onChange={(e) => handleArgChange(arg.name, e.target.value)}
                    />
                    {arg.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {arg.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Prompt Messages:</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPrompt}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPrompt}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {result.description && (
                <div className="mb-3 p-3 rounded-md bg-muted">
                  <p className="text-sm">{result.description}</p>
                </div>
              )}

              <div className="space-y-3">
                {result.messages.map((message, index) => (
                  <div key={index} className="border rounded-md">
                    <div className={`px-3 py-2 border-b text-sm font-medium flex items-center gap-2 ${getRoleColor(message.role)}`}>
                      {getRoleIcon(message.role)}
                      {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
                    </div>
                    <div className="p-3">
                      {typeof message.content === "string" ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </pre>
                      ) : message.content.type === "text" ? (
                        <pre className="text-sm whitespace-pre-wrap">
                          {message.content.text}
                        </pre>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          <p>Content type: {message.content.type}</p>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {formatJSON(message.content)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function PromptsExplorer() {
  const { prompts, refreshPrompts, getPrompt, loading, activeServer } = useMCP();

  const handleGetPrompt = async (name: string, args: Record<string, string>): Promise<PromptGetResponse> => {
    return await getPrompt(name, args);
  };

  if (!activeServer) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Connect to an MCP server</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={refreshPrompts}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No prompts available</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {prompts.map((prompt) => (
            <PromptItem
              key={prompt.name}
              prompt={prompt}
              onGet={handleGetPrompt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
