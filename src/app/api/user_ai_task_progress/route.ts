import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// --- POST: mark a task complete ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { ai_plan_task_id } = body;

    if (!ai_plan_task_id)
      return NextResponse.json({ error: 'Missing ai_plan_task_id' }, { status: 400 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user has completed any task today
    const completedToday = await prisma.userAiTaskProgress.findFirst({
      where: { user_id: userId, completed_at: { gte: today } },
    });

    if (completedToday)
      return NextResponse.json(
        { error: 'You can only complete one task per day' },
        { status: 400 },
      );

    // Check if task already completed
    const exists = await prisma.userAiTaskProgress.findUnique({
      where: { user_id_ai_plan_task_id: { user_id: userId, ai_plan_task_id } },
    });

    if (exists) return NextResponse.json({ message: 'Already completed' });

    // Mark task complete
    const completion = await prisma.userAiTaskProgress.create({
      data: { user_id: userId, ai_plan_task_id, completed_at: new Date() },
    });

    // Streak logic
    const lastCompletion = await prisma.userAiTaskProgress.findFirst({
      where: { user_id: userId },
      orderBy: { completed_at: 'desc' },
    });

    let streakIncrement = 1;
    if (lastCompletion) {
      const lastDate = new Date(lastCompletion.completed_at!);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      streakIncrement = diffDays === 1 ? 1 : diffDays === 0 ? 0 : 1;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: streakIncrement === 0 ? undefined : { increment: streakIncrement },
        streak_last_date: today,
      },
    });

    return NextResponse.json({ completionId: completion.id });
  } catch (err) {
    console.error('POST /user_ai_task_progress error:', err);
    return NextResponse.json({ error: 'Failed to mark complete' }, { status: 500 });
  }
}

// --- GET: fetch completed task IDs ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const url = new URL(req.url);
    const planId = url.searchParams.get('plan_id');

    if (!planId) return NextResponse.json({ error: 'Missing plan_id' }, { status: 400 });

    const completed = await prisma.userAiTaskProgress.findMany({
      where: { user_id: userId, ai_plan_task_id: planId },
      select: { ai_plan_task_id: true },
    });

    const completedIds = completed.map((c) => c.ai_plan_task_id);
    return NextResponse.json(completedIds);
  } catch (err) {
    console.error('GET /user_ai_task_progress error:', err);
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 });
  }
}
