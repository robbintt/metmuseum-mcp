import { imageByTitle } from "../tools/getObject";

export async function handleListResources() {
  return {
    resources: [
      ...Array.from(imageByTitle.keys()).map(title => ({
        uri: `met-image://${title}`,
        mimeType: 'image/png',
        name: `${title}`,
      })),
    ],
  }
}