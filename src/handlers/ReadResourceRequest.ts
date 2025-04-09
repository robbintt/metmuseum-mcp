import { ReadResourceRequest } from "@modelcontextprotocol/sdk/types.js";
import { imageByTitle } from "../tools/getObject";

export async function handleReadResource(request: ReadResourceRequest) {
  const uri = request.params.uri;
  if (uri.startsWith('met-image://')) {
    const title = uri.split('://')[1];
    const image = imageByTitle.get(title);
    if (image) {
      return {
        contents: [{
          uri,
          mimeType: 'image/jpeg',
          blob: image,
        }],
      };
    }
  }
  return {
    content: [{ type: 'text', text: `Resource not found: ${uri}` }],
    isError: true,
  };
}