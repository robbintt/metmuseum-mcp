import imageToBase64 from 'image-to-base64';
import z from 'zod';
import { serverService } from '../services/serverService';
import { ObjectResponseSchema } from '../types/types';

export const getMuseumInputSchema = z.object({
  objectId: z.number().describe(`The ID of the object to retrieve`),
});

const baseURL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

export const imageByTitle = new Map<string, string>();

export const getMuseumObject = {
  name: 'get-museum-object',
  description: 'Get a museum object by its ID',
  inputSchema: getMuseumInputSchema,
  execute: async ({ objectId }: z.infer<typeof getMuseumInputSchema>) => {
    try {
      const url = `${baseURL}${objectId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      const parseResult = ObjectResponseSchema.safeParse(jsonData);
      if (!parseResult.success) {
        throw new Error(`Invalid response shape: ${JSON.stringify(parseResult.error.issues, null, 2)}`);
      }
      const data = parseResult.data;
      const text = `Title: ${data.title}\n`
        + `${data.artistDisplayName ? `Artist: ${data.artistDisplayName}\n` : ''}`
        + `${data.artistDisplayBio ? `Artist Bio: ${data.artistDisplayBio}\n` : ''}`
        + `${data.department ? `Department: ${data.department}\n` : ''}`
        + `${data.medium ? `Medium: ${data.medium}\n` : ''}`
        + `${data.primaryImage ? `Primary Image URL: ${data.primaryImage}\n` : ''}`;

      const content = [];
      content.push({
        type: 'text' as const,
        text,
      });
      if (data.primaryImageSmall) {
        const imageBase64 = await imageToBase64(data.primaryImageSmall);
        content.push({
          type: 'image' as const,
          data: imageBase64,
          mimeType: 'image/jpeg',
        });
        imageByTitle.set(data.title!, imageBase64);
        serverService.getServer().server.notification({
          method: 'notifications/resources/list_changed',
        });
      }

      return { content };
    }

    catch (error) {
      console.error('Error getting museum object:', error);
      return {
        content: [{ type: 'text' as const, text: `Error getting museum object id ${objectId}: ${error}` }],
        isError: true,
      };
    }
  },
};
