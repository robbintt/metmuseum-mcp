import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

class ServerService {
  private _server: McpServer | null = null;
  
  setServer(server: McpServer): void {
    this._server = server;
  }
  
  getServer(): McpServer {
    if (!this._server) {
      throw new Error('Server not initialized');
    }
    return this._server;
  }
}

export const serverService = new ServerService();