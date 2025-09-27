"use client";

import { useState } from "react";
import {
  Database,
  Eye,
  RefreshCw,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  FileText,
  Image,
  File,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMCP } from "@/hooks/use-mcp";
import { formatJSON, copyToClipboard, downloadAsFile, truncateText } from "@/lib/utils";
import { MCPResource, ResourceReadResponse } from "@/types/mcp";

interface ResourceItemProps {
  resource: MCPResource;
  onRead: (uri: string) => Promise<ResourceReadResponse>;
}

function ResourceItem({ resource, onRead }: ResourceItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [content, setContent] = useState<ResourceReadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRead = async () => {
    if (content) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsReading(true);
    setError(null);

    try {
      const result = await onRead(resource.uri);
      setContent(result);
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read resource");
    } finally {
      setIsReading(false);
    }
  };

  const getResourceIcon = () => {
    if (resource.mimeType?.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    } else if (resource.mimeType?.startsWith("text/")) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const copyContent = () => {
    if (content) {
      const textContent = content.contents
        .map(c => c.text || c.blob || "")
        .join("\n");
      copyToClipboard(textContent);
    }
  };

  const downloadContent = () => {
    if (content) {
      const textContent = content.contents
        .map(c => c.text || c.blob || "")
        .join("\n");

      const filename = resource.name || resource.uri.split("/").pop() || "resource";
      const mimeType = resource.mimeType || "text/plain";

      downloadAsFile(textContent, filename, mimeType);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getResourceIcon()}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">
                {resource.title || resource.name}
              </CardTitle>
              <CardDescription className="text-sm">
                <div className="truncate">{resource.uri}</div>
                {resource.description && (
                  <div className="mt-1">{resource.description}</div>
                )}
                {resource.mimeType && (
                  <div className="mt-1">
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {resource.mimeType}
                    </span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleRead}
            disabled={isReading}
            size="sm"
            variant="outline"
          >
            {isReading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : content ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                View
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Read
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && content && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Content:</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyContent}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadContent}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {content.contents.map((item, index) => (
              <div key={index} className="border rounded-md">
                <div className="px-3 py-2 bg-muted border-b text-sm font-medium">
                  {item.uri}
                  {item.mimeType && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-background">
                      {item.mimeType}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {item.text && (
                    <pre className="text-sm whitespace-pre-wrap overflow-x-auto max-h-96">
                      {item.text}
                    </pre>
                  )}
                  {item.blob && (
                    <div className="text-sm text-muted-foreground">
                      <p>Binary content ({item.blob.length} characters)</p>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {truncateText(item.blob, 200)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {error && (
        <CardContent className="pt-0">
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function ResourcesExplorer() {
  const { resources, refreshResources, readResource, loading, activeServer } = useMCP();

  const handleReadResource = async (uri: string): Promise<ResourceReadResponse> => {
    return await readResource(uri);
  };

  if (!activeServer) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
          onClick={refreshResources}
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

      {resources.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No resources available</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {resources.map((resource) => (
            <ResourceItem
              key={resource.uri}
              resource={resource}
              onRead={handleReadResource}
            />
          ))}
        </div>
      )}
    </div>
  );
}
