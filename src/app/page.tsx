"use client";

import { useState } from "react";
import { Network, Github, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSpotlight, GlowingCard } from "@/components/ui/background-gradient";
import { Spotlight } from "@/components/ui/spotlight";
import { ServerConnection } from "@/components/server-connection";
import { ToolsExplorer } from "@/components/tools-explorer";
import { ResourcesExplorer } from "@/components/resources-explorer";
import { PromptsExplorer } from "@/components/prompts-explorer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GlowingCard className="rounded-lg p-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-foreground">
                  <Network className="h-5 w-5" />
                </div>
              </GlowingCard>
              <div>
                <h1 className="text-2xl font-bold">MCP Client</h1>
                <p className="text-sm text-muted-foreground">
                  Model Context Protocol Explorer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://modelcontextprotocol.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  MCP Docs
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Server Connection Section - Rectangular */}
        <div className="mb-8">
          <ServerConnection />
        </div>

        {/* Three Column Layout for Tools, Resources, Prompts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tools Section */}
          <CardSpotlight containerClassName="h-full">
            <div className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                <h2 className="text-lg font-semibold">Tools</h2>
              </div>
              <ToolsExplorer />
            </div>
          </CardSpotlight>

          {/* Resources Section */}
          <CardSpotlight containerClassName="h-full">
            <div className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <h2 className="text-lg font-semibold">Resources</h2>
              </div>
              <ResourcesExplorer />
            </div>
          </CardSpotlight>

          {/* Prompts Section */}
          <CardSpotlight containerClassName="h-full">
            <div className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <h2 className="text-lg font-semibold">Prompts</h2>
              </div>
              <PromptsExplorer />
            </div>
          </CardSpotlight>
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>About MCP Client</CardTitle>
              <CardDescription>
                A web-based client for exploring Model Context Protocol (MCP) servers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">🔧 Tools & Resources</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Discover and execute functions provided by MCP servers. Browse data sources and explore reusable prompt templates.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Execute tools with custom arguments</li>
                    <li>• Browse and read resources</li>
                    <li>• Generate prompts for AI interactions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🔐 Authentication Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect to authenticated MCP servers like GitHub Copilot with Bearer token support.
                  </p>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>For GitHub Copilot:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                      <li>Generate a new token with appropriate scopes</li>
                      <li>Use the token in the authentication field</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Built with Next.js and the Model Context Protocol</p>
            <div className="flex items-center gap-4">
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Learn about MCP
              </a>
              <a
                href="https://github.com/modelcontextprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                MCP on GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
