#!/usr/bin/env node

import process from 'node:process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequestHandler } from './handlers/CallToolHandler';

import { handleListResources } from './handlers/ListResourcesHandler';
import { handleReadResource } from './handlers/ReadResourceRequest';
import { serverService } from './services/serverService';
import { getMuseumObject } from './tools/getObject';
import { ListDepartmentsTool } from './tools/ListDepartmentsTool';
import { search } from './tools/search';

class MetMuseumServer {
  private server: McpServer;
  private callToolHandler: CallToolRequestHandler;
  private listDepartments: ListDepartmentsTool;

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
    this.listDepartments = new ListDepartmentsTool();
    this.callToolHandler = new CallToolRequestHandler(this.listDepartments);
    serverService.setServer(this.server);
    this.setupErrorHandling();
    this.setupTools();
    this.setupRequestHandlers();
  }

  private setupTools(): void {
    this.server.tool(
      this.listDepartments.name,
      this.listDepartments.description,
      this.listDepartments.inputSchema.shape,
      this.listDepartments.execute.bind(this.listDepartments),
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
    );
  }

  private setupRequestHandlers(): void {
    this.server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await this.callToolHandler.handleCallTool(request);
    });
    this.server.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return await handleListResources();
    });
    this.server.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return await handleReadResource(request);
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
