import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ tagId: string }> }) {
  const params = await context.params;
  const { tagId } = params;

  try {
    const reflections = await prisma.reflection.findMany({
      where: {
        reflectionNicheTags: {
          some: {
            niche_tag_id: tagId,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        text: true,
        created_at: true,
        user_id: true,
        mood: true,
        reflectionNicheTags: {
          select: {
            nicheTag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formatted = reflections.map((r) => ({
      ...r,
      niche_tags: r.reflectionNicheTags.map((rnt) => rnt.nicheTag),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching reflections by tag:', error);
    return NextResponse.json({ error: 'Failed to fetch reflections by tag' }, { status: 500 });
  }
}
