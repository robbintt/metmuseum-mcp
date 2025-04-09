import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { listDepartments } from '../tools/listDepartments';
import { search, SearchInputSchema } from '../tools/search';

export async function handleCallTool(request: CallToolRequest) {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case listDepartments.name:
        return await listDepartments.execute();
      case search.name: {
        const parsedArgs = SearchInputSchema.safeParse(args);
        if (!parsedArgs.success) {
          throw new Error(`Invalid arguments for search: ${JSON.stringify(parsedArgs.error.issues, null, 2)}`);
        }
        const { q, hasImages, title, departmentId } = parsedArgs.data;
        return await search.execute({ q, hasImages, title, departmentId });
      }
      default:
        throw new Error(`Unknown tool name: ${name}`);
    }
  }
  catch (error) {
    console.error(`Error handling tool call: ${error}`);
    return {
      content: [{ type: 'text', text: `Error handling tool call: ${error}` }],
      isError: true,
    };
  }
}
