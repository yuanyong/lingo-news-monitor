import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/webhook';
import { exa } from '@/lib/exa';
import { embedText } from '@/lib/openai';
import { isDuplicate } from '@/lib/dedupe';

export async function POST(request: NextRequest) {
  // Get the raw body for signature verification
  const rawBody = await request.text();
  const signatureHeader = request.headers.get('exa-signature') || '';
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // Skip signature verification in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Verify webhook signature if secret is configured and not in development
  if (webhookSecret && !isDevelopment) {
    if (!verifyWebhookSignature(rawBody, signatureHeader, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  const body = JSON.parse(rawBody);

  switch (body.type) {
    case 'webset.created': {
      try {
        const websetData = body.data;
        
        // Only process websets created by our app
        if (websetData.metadata?.app !== 'websets-news-monitor') {
          console.log(`Ignoring webset ${websetData.id} - not created by websets-news-monitor app`);
          return NextResponse.json({ 
            received: true, 
            ignored: true,
            reason: 'Not a websets-news-monitor webset' 
          });
        }
        
        const websetName = websetData.metadata?.name;
        if (!websetName) {
          console.error(`webset.created event missing metadata.name for websetId ${websetData.id}`);
          return NextResponse.json({ error: 'Missing webset name' }, { status: 400 });
        }
        await prisma.webset.create({
          data: {
            websetId: websetData.id,
            name: websetName,
            data: websetData,
          }
        });
        console.log(`Created webset ${websetData.id} with name '${websetName}' in DB`);
      } catch (error) {
        console.error('Error handling webset.created:', error);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }
      break;
    }
    case 'webset.item.enriched':
      try {
        const itemData = body.data;
        // Check if this webset exists in our DB (skip if it's not ours)
        const dbWebset = await prisma.webset.findUnique({ where: { websetId: itemData.websetId } });
        if (!dbWebset) {
          // This is expected for websets not created by our app
          return NextResponse.json({ 
            received: true, 
            ignored: true,
            reason: 'Webset not managed by this app' 
          });
        }

        // TODO: Maybe different api for more reliable image and author
        const response = await exa.getContents(
            [itemData.properties.url],
            {
              livecrawl: "fallback",
              livecrawlTimeout: 10000
            }
        );
        const crawlData = response.results[0];

        const title = itemData.properties.article?.title;
        const embedding = await embedText(title);

        // Check if this is a duplicate before inserting
        if (await isDuplicate(title, itemData.websetId, embedding)) {
          console.log(`Skipping duplicate item: ${title}`);
          return NextResponse.json({
            received: true,
            type: body.type,
            timestamp: new Date().toISOString(),
          });
        }

        // Check if URL already exists
        const existingUrl = await prisma.websetItem.findUnique({
          where: { url: itemData.properties.url }
        });
        
        if (existingUrl) {
          console.log(`Skipping item - URL already exists: ${itemData.properties.url}`);
          return NextResponse.json({
            received: true,
            type: body.type,
            timestamp: new Date().toISOString(),
          });
        }

        const itemFields = {
          url: itemData.properties.url,
          title: title || null,
          description: itemData.properties.description || null,
          content: itemData.properties.content || null,
          author: itemData.properties.article?.author || crawlData?.author || null,
          publishedAt: itemData.properties.article?.publishedAt ? new Date(itemData.properties.article.publishedAt) : null,
          imageUrl: crawlData?.image || null,
          faviconUrl: crawlData?.favicon || null,
          enrichments: itemData.enrichments || null,
          evaluations: itemData.evaluations || null,
        };

        // First upsert without embedding
        await prisma.websetItem.upsert({
          where: { itemId: itemData.id },
          update: {
            ...itemFields,
            updatedAt: new Date(),
          },
          create: {
            itemId: itemData.id,
            websetId: itemData.websetId,
            ...itemFields,
          }
        });

        // Update with embedding using raw SQL if we have one
        await prisma.$executeRawUnsafe(`
          UPDATE "WebsetItem" 
          SET embedding = $1::vector 
          WHERE "itemId" = $2
        `, `[${embedding.join(',')}]`, itemData.id);
        console.log(`Saved enriched item ${itemData.id} to database`);
      } catch (error) {
        console.error('Error handling webset.item.enriched:', error);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }
      break;
    default:
      break;
  }

  return NextResponse.json({ 
    received: true,
    type: body.type,
    timestamp: new Date().toISOString()
  });
}