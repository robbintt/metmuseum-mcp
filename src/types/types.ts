import z from 'zod';

/**
 * https://metmuseum.github.io/#departments
 */
const DepartmentSchema = z.object({
  departmentId: z.number().describe(
    'Department ID as an integer. The departmentId is to be used as a query '
    + 'parameter on the `/objects` endpoint',
  ),
  displayName: z.string().describe('Display name for a department'),
});

export const DepartmentsSchema = z.object({
  departments: z.array(DepartmentSchema).describe(
    'An array containing the JSON objects that contain each department\'s '
    + 'departmentId and display name. The departmentId is to be used as a '
    + 'query parameter on the `/objects` endpoint',
  ),
});
