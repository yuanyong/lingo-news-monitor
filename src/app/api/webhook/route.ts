import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/webhook';
import { extractImagesFromUrl } from '@/lib/exa';

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
  } else if (isDevelopment && webhookSecret) {
    console.log('[Dev] Skipping webhook signature verification');
  }

  const body = JSON.parse(rawBody);

  switch (body.type) {
    case 'webset.created': {
      try {
        const websetData = body.data;
        const websetName = websetData.metadata?.name;
        if (!websetName) {
          console.error(`webset.created event missing metadata.name for websetId ${websetData.id}`);
          return NextResponse.json({ error: 'Missing webset name' }, { status: 400 });
        }
        await prisma.webset.upsert({
          where: { websetId: websetData.id },
          update: {},
          create: {
            websetId: websetData.id,
            name: websetName,
          }
        });
        console.log(`Created webset ${websetData.id} with name '${websetName}' in DB`);
      } catch (error) {
        console.error('Error handling webset.created:', error);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }
      break;
    }
    case 'webset.item.enriched': {
      try {
        const itemData = body.data;
        // Ensure the webset exists in our DB
        const dbWebset = await prisma.webset.findUnique({ where: { websetId: itemData.websetId } });
        if (!dbWebset) {
          console.error(`webset.item.enriched: Webset ${itemData.websetId} does not exist in DB`);
          return NextResponse.json({ error: 'Webset does not exist in DB' }, { status: 400 });
        }
        const imageUrl = await extractImagesFromUrl(itemData.properties.url);
        await prisma.websetItem.upsert({
          where: { itemId: itemData.id },
          update: {
            url: itemData.properties.url,
            title: itemData.properties.article?.title || null,
            description: itemData.properties.description || null,
            content: itemData.properties.content || null,
            author: itemData.properties.article?.author || null,
            publishedAt: itemData.properties.article?.publishedAt ? new Date(itemData.properties.article.publishedAt) : null,
            imageUrl: imageUrl,
            enrichments: itemData.enrichments || null,
            evaluations: itemData.evaluations || null,
            updatedAt: new Date(),
          },
          create: {
            itemId: itemData.id,
            websetId: itemData.websetId,
            url: itemData.properties.url,
            title: itemData.properties.article?.title || null,
            description: itemData.properties.description || null,
            content: itemData.properties.content || null,
            author: itemData.properties.article?.author || null,
            publishedAt: itemData.properties.article?.publishedAt ? new Date(itemData.properties.article.publishedAt) : null,
            imageUrl: imageUrl,
            enrichments: itemData.enrichments || null,
            evaluations: itemData.evaluations || null,
          }
        });
        console.log(`Saved enriched item ${itemData.id} to database`);
      } catch (error) {
        console.error('Error handling webset.item.enriched:', error);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }
      break;
    }
    default:
      // Optionally handle other event types
      break;
  }

  return NextResponse.json({ 
    received: true,
    type: body.type,
    timestamp: new Date().toISOString()
  });
}