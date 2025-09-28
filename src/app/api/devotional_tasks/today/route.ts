// src/app/api/devotional_tasks/today/route.ts
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

    // Get user with their chosen devotional goal id
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { devotional_goal_id: true },
    });

    if (!user?.devotional_goal_id) {
      return NextResponse.json(
        { error: 'User has not selected a devotional goal' },
        { status: 400 },
      );
    }

    // Get all progress (completion dates) for this user on tasks of this goal
    const completedTasks = await prisma.userTaskProgress.findMany({
      where: { user_id: session.user.id },
      select: { devotional_task_id: true, completion_date: true },
    });

    // Find all tasks for this goal ordered by day_number
    const allTasks = await prisma.devotionalTask.findMany({
      where: { goal_id: user.devotional_goal_id },
      orderBy: { day_number: 'asc' },
    });

    // Determine which task is next (first not completed)
    const completedTaskIds = new Set(completedTasks.map((t) => t.devotional_task_id));
    const nextTask = allTasks.find((task) => !completedTaskIds.has(task.id));

    if (!nextTask) {
      return NextResponse.json({ message: 'All devotional tasks completed!' });
    }

    return NextResponse.json(nextTask);
  } catch (error) {
    console.error("Error getting today's devotional task:", error);
    return NextResponse.json({ error: "Failed to fetch today's devotional task" }, { status: 500 });
  }
}
