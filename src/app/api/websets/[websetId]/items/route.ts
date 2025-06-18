import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websetId: string }> }
) {
  try {
    const { websetId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get one extra item to check if there are more
    const items = await prisma.websetItem.findMany({
      where: {
        websetId: websetId,
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