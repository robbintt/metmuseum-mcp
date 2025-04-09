import { DepartmentsSchema } from '../types/types';

export const listDepartments = {
  name: 'list-departments',
  description: 'List all departments in the Met Museum',
  inputSchema: {},
  execute: async () => {
    try {
      const response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      const parseResult = DepartmentsSchema.safeParse(jsonData);
      if (!parseResult.success) {
        throw new Error(`Invalid response shape: ${JSON.stringify(parseResult.error.issues, null, 2)}`);
      }
      const text = parseResult.data.departments.map((department) => {
        return `Department ID: ${department.departmentId}, Display Name: ${department.displayName}`;
      }).join('\n');
      return {
        content: [{ type: 'text', text }],
        isError: false,
      };
    }
    catch (error) {
      console.error('Error listing departments:', error);
      return {
        content: [{ type: 'text', text: `Error listing departments: ${error}` }],
        isError: true,
      };
    }
  },
};
