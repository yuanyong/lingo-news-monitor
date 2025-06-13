import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { websetId: string } }
) {
  try {
    const items = await prisma.websetItem.findMany({
      where: {
        websetId: params.websetId,
        NOT: [
          { imageUrl: null },
          { imageUrl: "" },
          { faviconUrl: null },
          { faviconUrl: "" },
          { publishedAt: null },
        ],
      },
      orderBy: { publishedAt: "desc" },
    })

    // Check that we really excluded items without images or favicons
    for (const item of items) {
      if (!item.imageUrl || !item.faviconUrl || !item.publishedAt) {
        console.error(`Item ${item.itemId} is missing required fields:`, {
          imageUrl: item.imageUrl,
          faviconUrl: item.faviconUrl,
          publishedAt: item.publishedAt,
        });
        return NextResponse.json({ error: 'Some items are missing required fields' }, { status: 500 });
      }
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch webset items:', error);
    return NextResponse.json({ error: 'Failed to fetch webset items' }, { status: 500 });
  }
}