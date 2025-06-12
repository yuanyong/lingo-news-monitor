import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const websets = await prisma.webset.findMany();
    return NextResponse.json(websets);
  } catch (error) {
    console.error('Failed to fetch websets:', error);
    return NextResponse.json({ error: 'Failed to fetch websets' }, { status: 500 });
  }
}