import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.nicheTag.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch niche tags' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid tag name' }, { status: 400 });
    }

    const existing = await prisma.nicheTag.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 400 });
    }

    const newTag = await prisma.nicheTag.create({ data: { name } });
    return NextResponse.json(newTag);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
