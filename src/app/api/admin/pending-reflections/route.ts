import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/pending-reflections
export async function GET() {
  try {
    const reflections = await prisma.reflection.findMany({
      where: { status: 'pending' },
      include: {
        user: true,
        reflectionNicheTags: { include: { nicheTag: true } },
      },
      orderBy: { created_at: 'desc' },
    });

   const formatted = reflections.map((r: any) => ({
  ...r,
  niche_tags: r.reflectionNicheTags.map((t: any) => t.nicheTag),
}));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Pending reflections fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending reflections' }, { status: 500 });
  }
}
