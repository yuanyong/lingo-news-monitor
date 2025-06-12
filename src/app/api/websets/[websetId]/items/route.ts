import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { websetId: string } }
) {
  try {
    const items = await prisma.websetItem.findMany({
      where: {
        websetId: params.websetId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch webset items:', error);
    return NextResponse.json({ error: 'Failed to fetch webset items' }, { status: 500 });
  }
}