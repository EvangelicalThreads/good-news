// src/app/api/daily-tasks/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description } = await request.json();
    if (!title?.trim())
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });

    const task = await prisma.dailyTask.create({
      data: {
        user_id: session.user.id,
        title,
        description: description ?? '',
        is_recurring: false,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
