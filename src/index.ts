#!/usr/bin/env node

import process from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { handleCallTool } from './handlers/CallToolHandler';
import { listDepartments } from './tools/listDepartments';
import { search } from './tools/search';
import { getMuseumObject } from './tools/getObject';
import { serverService } from './services/serverService';

class MetMuseumServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer(
      {
        name: 'met-museum-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      },
    );
    serverService.setServer(this.server)
    this.setupErrorHandling();
    this.setupTools();
    this.setupRequestHandlers();
  }

  private setupTools(): void {
    this.server.tool(
      listDepartments.name,
      listDepartments.description,
      listDepartments.inputSchema.shape,
      listDepartments.execute,
    );
    this.server.tool(
      search.name,
      search.description,
      search.inputSchema.shape,
      search.execute,
    );
    this.server.tool(
      getMuseumObject.name,
      getMuseumObject.description,
      getMuseumObject.inputSchema.shape,
      getMuseumObject.execute,
    )
  }

  private setupRequestHandlers(): void {
    this.server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await handleCallTool(request);
    });
  }

  private setupErrorHandling(): void {
    this.server.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Met Museum MCP server running on stdio');
  }
}

const server = new MetMuseumServer();
server.run().catch((error) => {
  console.error('[MCP Server Error]', error);
  process.exit(1);
});
