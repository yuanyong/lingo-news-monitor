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
  
  // Concise logging
  console.log(`[${body.type}]`, body.data);

  // Handle webset.item.enriched events
  if (body.type === 'webset.item.enriched') {
    try {
      const itemData = body.data;
      
      // First, ensure the webset exists
      await prisma.webset.upsert({
        where: { websetId: itemData.websetId },
        update: {},
        create: {
          websetId: itemData.websetId,
          name: `Webset ${itemData.websetId}`, // Default name, can be updated later
        }
      });

      // Extract image from the URL
      const imageUrl = await extractImagesFromUrl(itemData.properties.url);
      
      // Save the enriched item
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
      console.error('Error saving to database:', error);
    }
  }

  return NextResponse.json({ 
    received: true,
    type: body.type,
    timestamp: new Date().toISOString()
  });
}