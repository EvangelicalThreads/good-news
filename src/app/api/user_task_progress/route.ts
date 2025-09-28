import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goal_id');
    if (!goalId) {
      return NextResponse.json({ error: 'goal_id query param required' }, { status: 400 });
    }

    // Get all completed devotional_task_ids for this user & goal
    const completedTasks = await prisma.userTaskProgress.findMany({
      where: {
        user_id: session.user.id,
        devotional_task: {
          goal_id: goalId,
        },
      },
      select: {
        devotional_task_id: true,
      },
    });

    return NextResponse.json(
      completedTasks.map((t) => t.devotional_task_id),
      { status: 200 },
    );
  } catch (error) {
    console.error('GET user_task_progress error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { devotional_task_id } = await request.json();
    if (!devotional_task_id) {
      return NextResponse.json({ error: 'devotional_task_id is required' }, { status: 400 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check if user has completed ANY task today
    const existingAny = await prisma.userTaskProgress.findFirst({
      where: {
        user_id: session.user.id,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingAny) {
      return NextResponse.json(
        { error: 'Task already completed today. Great job! Please try again tomorrow.' },
        { status: 400 },
      );
    }

    const now = new Date();
    const completion_date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Mark the new task complete
    const newProgress = await prisma.userTaskProgress.create({
      data: {
        user_id: session.user.id,
        devotional_task_id,
        completedAt: now,
        completion_date,
      },
    });

    // Fetch user streak data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        streak: true,
        streak_last_date: true,
      },
    });

    let newStreak = 1; // default new streak

    if (user?.streak_last_date) {
      const lastDate = new Date(user.streak_last_date);
      const diffTime = completion_date.getTime() - lastDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        newStreak = (user.streak ?? 0) + 1; // consecutive day
      } else if (diffDays > 1) {
        newStreak = 1; // missed days, reset streak
      } else {
        newStreak = user.streak ?? 1; // same day or unexpected case
      }
    }

    // Update user streak
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        streak: newStreak,
        streak_last_date: completion_date,
      },
    });

    return NextResponse.json({ progress: newProgress, streak: newStreak }, { status: 201 });
  } catch (error) {
    console.error('POST user_task_progress error:', error);
    return NextResponse.json({ error: 'Failed to mark task complete' }, { status: 500 });
  }
}
