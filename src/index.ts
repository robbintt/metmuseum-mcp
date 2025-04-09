#!/usr/bin/env node

import process from 'node:process';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { handleCallTool } from './handlers/CallToolHandler';
import { listDepartments } from './tools/listDepartments';
import { search } from './tools/search';

class MetMuseumServer {
  private server: Server;

  constructor() {
    this.server = new Server(
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

    this.setupErrorHandling();
    this.setupRequestHandlers();
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [listDepartments, search],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await handleCallTool(request);
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
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
