"use client";

import { useState } from "react";
import {
  Wrench,
  Play,
  RefreshCw,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMCP } from "@/hooks/use-mcp";
import { formatJSON, copyToClipboard, downloadAsFile } from "@/lib/utils";
import { MCPTool, ToolCallResponse } from "@/types/mcp";

interface ToolItemProps {
  tool: MCPTool;
  onExecute: (name: string, args: Record<string, any>) => Promise<void>;
}

function ToolItem({ tool, onExecute }: ToolItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ToolCallResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      // Convert string args to appropriate types based on schema
      const processedArgs: Record<string, any> = {};
      Object.entries(args).forEach(([key, value]) => {
        if (value.trim()) {
          try {
            // Try to parse as JSON first
            processedArgs[key] = JSON.parse(value);
          } catch {
            // If not JSON, use as string
            processedArgs[key] = value;
          }
        }
      });

      await onExecute(tool.name, processedArgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleArgChange = (argName: string, value: string) => {
    setArgs(prev => ({ ...prev, [argName]: value }));
  };

  const copyResult = () => {
    if (result) {
      copyToClipboard(formatJSON(result));
    }
  };

  const downloadResult = () => {
    if (result) {
      downloadAsFile(
        formatJSON(result),
        `${tool.name}-result.json`,
        "application/json"
      );
    }
  };

  const requiredArgs = tool.inputSchema.required || [];
  const properties = tool.inputSchema.properties || {};

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
            <Wrench className="h-4 w-4" />
            <div>
              <CardTitle className="text-lg">{tool.title || tool.name}</CardTitle>
              <CardDescription className="text-sm">
                {tool.description}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            size="sm"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Execute
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Arguments */}
          {Object.keys(properties).length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Arguments:</h4>
              <div className="space-y-2">
                {Object.entries(properties).map(([argName, schema]: [string, any]) => (
                  <div key={argName}>
                    <label className="block text-sm font-medium mb-1">
                      {argName}
                      {requiredArgs.includes(argName) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <Input
                      placeholder={schema.description || `Enter ${argName}`}
                      value={args[argName] || ""}
                      onChange={(e) => handleArgChange(argName, e.target.value)}
                    />
                    {schema.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {schema.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schema */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Input Schema:</h4>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
              {formatJSON(tool.inputSchema)}
            </pre>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Result:
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyResult}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadResult}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                {result.content.map((content, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    {content.type === "text" && (
                      <pre className="text-sm whitespace-pre-wrap">
                        {content.text}
                      </pre>
                    )}
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

export function ToolsExplorer() {
  const { tools, refreshTools, callTool, loading, activeServer } = useMCP();

  const handleExecuteTool = async (name: string, args: Record<string, any>) => {
    const result = await callTool(name, args);
    return result;
  };

  if (!activeServer) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
          onClick={refreshTools}
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

      {tools.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No tools available</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tools.map((tool) => (
            <ToolItem
              key={tool.name}
              tool={tool}
              onExecute={handleExecuteTool}
            />
          ))}
        </div>
      )}
    </div>
  );
}
