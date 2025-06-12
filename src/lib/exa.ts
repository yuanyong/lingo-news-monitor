import Exa from 'exa-js';

const exaApiKey = process.env.EXA_API_KEY;

if (!exaApiKey) {
  throw new Error('EXA_API_KEY environment variable is not set');
}

export const exa = new Exa(exaApiKey);

export async function extractImagesFromUrl(url: string) {
  try {
    const result = await exa.getContents(
      [url],
      {
        livecrawl: "fallback",
        livecrawlTimeout: 10000
      }
    );
    
    // Extract images from the crawled content
    const content = result.results[0];
    if (content && content.image) {
      return content.image;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting images from URL:', error);
    return null;
  }
}