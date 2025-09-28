import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reflections = await prisma.reflection.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' },
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

    // Format to include simple niche_tags array
    const formattedReflections = reflections.map((r) => ({
      id: r.id,
      text: r.text,
      created_at: r.created_at,
      user_id: r.user_id,
      mood: r.mood,
      niche_tags: r.reflectionNicheTags.map((rnt) => rnt.nicheTag),
    }));

    return NextResponse.json(formattedReflections);
  } catch (error) {
    console.error('Get reflections error:', error);
    return NextResponse.json({ error: 'Failed to get reflections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, mood, tagIds } = await request.json();

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ error: 'Reflection text is required' }, { status: 400 });
    }

    // Create new reflection
    const newReflection = await prisma.reflection.create({
      data: {
        text: text.trim(),
        mood: mood ?? null,
        user_id: session.user.id,
      },
    });

    // Link tags if any provided
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const linkData = tagIds.map((tagId: string) => ({
        reflection_id: newReflection.id,
        niche_tag_id: tagId,
      }));

      await prisma.reflectionNicheTag.createMany({
        data: linkData,
        skipDuplicates: true,
      });
    }

    return NextResponse.json(newReflection, { status: 201 });
  } catch (error) {
    console.error('Add reflection error:', error);
    return NextResponse.json({ error: 'Failed to add reflection' }, { status: 500 });
  }
}
