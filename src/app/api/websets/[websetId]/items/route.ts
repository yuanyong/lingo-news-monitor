import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { websetId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get one extra item to check if there are more
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
      skip,
      take: limit + 1,
    })

    const hasMore = items.length > limit;
    const itemsToReturn = hasMore ? items.slice(0, limit) : items;

    // Check that we really excluded items without images or favicons
    for (const item of itemsToReturn) {
      if (!item.imageUrl || !item.faviconUrl || !item.publishedAt) {
        console.error(`Item ${item.itemId} is missing required fields:`, {
          imageUrl: item.imageUrl,
          faviconUrl: item.faviconUrl,
          publishedAt: item.publishedAt,
        });
        return NextResponse.json({ error: 'Some items are missing required fields' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      items: itemsToReturn, 
      hasMore,
      page,
      limit 
    });
  } catch (error) {
    console.error('Failed to fetch webset items:', error);
    return NextResponse.json({ error: 'Failed to fetch webset items' }, { status: 500 });
  }
}