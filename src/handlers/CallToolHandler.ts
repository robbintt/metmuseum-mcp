import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { listDepartments } from '../tools/listDepartments';

export async function handleCallTool(request: CallToolRequest) {
  const { name, arguments: _args } = request.params;

  // Switch based on which tool was called
  switch (name) {
    case listDepartments.name:
      return await listDepartments.execute();
    default:
      throw new Error(`Unknown tool name: ${name}`);
  }
}
