import { prisma } from '@/lib/prisma';
import { openai } from "./openai";
import { generateObject } from 'ai';
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import outdent from "outdent";
import { fa } from 'zod/v4/locales';

/**
 * Find similar items using vector similarity search
 * @param queryVector - The embedding vector to search against
 * @param websetId - Webset ID to filter results
 * @param limit - Number of similar items to return (default: 10)
 * @returns Array of similar items with distance scores
 */
async function getSimilarItems(queryVector: number[], websetId: string, limit: number = 10) {
  const query = outdent`
    SELECT id, title, "publishedAt", embedding <+> $1::vector AS distance
    FROM "WebsetItem"
    WHERE "websetId" = $2 AND "publishedAt" >= NOW() - INTERVAL '7 days'
    ORDER BY embedding <+> $1::vector
    LIMIT $3;
  `;
  return await prisma.$queryRawUnsafe<Array<{
    id: string;
    title: string;
    publishedAt: Date;
    distance: number;
  }>>(query, queryVector, websetId, limit);
}

// Define your schema (assuming this was your original schema)
const DuplicateCheck = z.object({
  isDuplicate: z.boolean(),
  reason: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

/**
 * Check if a title is semantically a duplicate using LLM
 * @param titleQuery - The title to check
 * @param similarTitles - Array of similar titles to compare against
 * @returns True if the title is a duplicate
 */
export async function checkSemanticDuplicate(titleQuery: string, similarTitles: string[]): Promise<boolean> {
  return false;
  const { object: response } = await generateObject({
    model: openai('glm-4.5'), // or 'gpt-4', 'gpt-3.5-turbo'
    system: outdent`
      You are a news deduplication assistant. Determine if a given news story is a duplicate of any stories in a provided list.
      Stories are considered duplicates if they are about the same event or topic, even if they are worded differently.
      The stories will end up in a news aggregator, and we don't want to show users highly related stories.
    `,
    prompt: outdent`
      Is this story a duplicate of any in the list below?
      
      Query story: "${titleQuery}"
      
      Similar stories:
      ${similarTitles.join('\n')}
    `,
    schema: DuplicateCheck,
  });

  if (response == null) {
    console.error("Failed to parse LLM response:", response);
    throw new Error("LLM response parsing error");
  }
  
  return response.isDuplicate;
}

/**
 * Check if a title is a duplicate based on vector similarity and semantic analysis
 * @param titleQuery - The title to check for duplicates
 * @param websetId - The webset ID to search within
 * @param embedding - The embedding vector for the title
 * @returns True if duplicates found, false otherwise
 */
export async function isDuplicate(titleQuery: string, websetId: string, embedding: number[]): Promise<boolean> {
  // Verify webset exists
  const webset = await prisma.webset.findUnique({ where: { websetId: websetId } });
  if (!webset) {
    console.error(`Webset ${websetId} not found`);
    return false;
  }

  // Search for similar items using the provided embedding
  const results = await getSimilarItems(embedding, websetId, 10);

  if (results.length === 0) {
    return false;
  }

  // Use LLM to determine if it's truly a duplicate
  const similarTitles = results.map(item => item.title).filter(Boolean) as string[];
  return await checkSemanticDuplicate(titleQuery, similarTitles);
}