import z from 'zod';
import { SearchResponseSchema } from '../types/types';

export const SearchInputSchema = z.object({
  q: z.string().describe(`Returns a listing of all Object IDs for objects that contain the search query within the object’s data`),
  hasImages: z.boolean().optional().default(true).describe(`Only returns objects that have images`),
  title: z.boolean().optional().default(false).describe(`Returns objects that match the query, specifically searching against the title field for objects.`),
  departmentId: z.number().optional().describe(`Returns objects that are in the specified department. The departmentId should come from the 'list-departments' tool.`),
});

type SearchInput = z.infer<typeof SearchInputSchema>;

const searchDescription
  = `Search for objects in the Met Museum. Will return Total objects found, `
    + `followed by a list of Object Ids. By default only objects with images are returned`;

export const search = {
  name: 'search-museum-objects',
  description: searchDescription,
  inputSchema: SearchInputSchema,
  execute: async ({ q, hasImages, title, departmentId }: SearchInput) => {
    try {
      const url = new URL('https://collectionapi.metmuseum.org/public/collection/v1/search');
      url.searchParams.set('q', q);
      url.searchParams.set('hasImages', hasImages ? 'true' : 'false');
      if (title) {
        url.searchParams.set('title', 'true');
      }
      if (departmentId) {
        url.searchParams.set('departmentId', departmentId.toString());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      const parseResult = SearchResponseSchema.safeParse(jsonData);
      if (!parseResult.success) {
        throw new Error(`Invalid response shape: ${JSON.stringify(parseResult.error.issues, null, 2)}`);
      }
      if (parseResult.data.total === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No objects found' }],
          isError: false,
        };
      }
      const text = `Total objects found: ${parseResult.data.total}\nObject IDs: ${parseResult.data.objectIDs.join(', ')}`;
      return {
        content: [{ type: 'text' as const, text }],
        isError: false,
      };
    }
    catch (error) {
      console.error('Error searching museum objects:', error);
      return {
        content: [{ type: 'text' as const, text: `Error searching museum objects: ${error}` }],
        isError: true,
      };
    }
  },
};
