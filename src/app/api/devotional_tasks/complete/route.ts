// src/app/api/devotional_tasks/complete/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { devotional_task_id } = body;

    if (!devotional_task_id) {
      return NextResponse.json({ error: 'Missing devotional_task_id' }, { status: 400 });
    }

    // Check if the user already completed a task today (one task per day)
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const existingProgress = await prisma.userTaskProgress.findUnique({
      where: {
        user_id_completion_date: {
          user_id: session.user.id,
          completion_date: todayDateOnly,
        },
      },
    });

    if (existingProgress) {
      return NextResponse.json({ error: 'Task already completed today' }, { status: 400 });
    }

    // Validate the task belongs to the user's devotional goal and is the next task (optional for strictness)

    // Insert a new progress record
    await prisma.userTaskProgress.create({
      data: {
        user_id: session.user.id,
        devotional_task_id,
        completion_date: todayDateOnly,
      },
    });

    // TODO: Optionally update streak here

    return NextResponse.json({ message: 'Task marked completed for today' });
  } catch (error) {
    console.error('Error completing devotional task:', error);
    return NextResponse.json({ error: 'Failed to mark task as completed' }, { status: 500 });
  }
}
