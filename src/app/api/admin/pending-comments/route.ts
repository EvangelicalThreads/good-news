import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const comments = await prisma.reflectionComment.findMany({
      where: { status: 'pending' },
      include: {
        user: true,
        reflection: true,
      },
      orderBy: { created_at: 'desc' },
    });

   const data = comments.map((c: any) => ({
      id: c.id,
      comment: c.comment, // ✅ use 'comment' column
      created_at: c.created_at,
      user: {
        id: c.user.id,
        email: c.user.email,
        name: c.user.name,
      },
      reflection: {
        id: c.reflection.id,
        text: c.reflection.text,
      },
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch pending comments:', error);
    return NextResponse.json({ error: 'Failed to fetch pending comments' }, { status: 500 });
  }
}
