import { embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Create custom OpenAI provider with different base URL
const customOpenAI = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL, // Your custom base URL
  apiKey: process.env.OPENAI_API_BASE_KEY
});

export async function embedText(text: string): Promise<number[]> {
  // 'embedding' is a single embedding object (number[])
  const { embedding } = await embed({
    model: customOpenAI.textEmbeddingModel('embedding-2'),
    value: text,
  });
  return embedding;
}