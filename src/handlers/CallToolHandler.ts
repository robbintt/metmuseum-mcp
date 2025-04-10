import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import type { ListDepartmentsTool } from '../tools/ListDepartmentsTool';
import type { SearchMuseumObjectsTool } from '../tools/SearchMuseumObjectsTool';
import { getMuseumInputSchema, getMuseumObject } from '../tools/getObject';

export class CallToolRequestHandler {
  private listDepartments: ListDepartmentsTool;
  private search: SearchMuseumObjectsTool;

  constructor(listDepartments: ListDepartmentsTool, search: SearchMuseumObjectsTool) {
    this.listDepartments = listDepartments;
    this.search = search;
  }

  public async handleCallTool(request: CallToolRequest) {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case this.listDepartments.name:
          return await this.listDepartments.execute();
        case this.search.name: {
          const parsedArgs = this.search.inputSchema.safeParse(args);
          if (!parsedArgs.success) {
            throw new Error(`Invalid arguments for search: ${JSON.stringify(parsedArgs.error.issues, null, 2)}`);
          }
          const { q, hasImages, title, departmentId } = parsedArgs.data;
          return await this.search.execute({ q, hasImages, title, departmentId });
        }
        case getMuseumObject.name: {
          const parsedArgs = getMuseumInputSchema.safeParse(args);
          if (!parsedArgs.success) {
            throw new Error(`Invalid arguments for getMuseumObject: ${JSON.stringify(parsedArgs.error.issues, null, 2)}`);
          }
          const { objectId } = parsedArgs.data;
          return await getMuseumObject.execute({ objectId });
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
}
