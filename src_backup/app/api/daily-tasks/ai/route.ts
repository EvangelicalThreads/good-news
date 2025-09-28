// src/app/daily-tasks/ai/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AiDailyTaskResponse = {
  id: string;
  text: string;
  completed: boolean;
  is_recurring: boolean;
};

// GET /api/daily-tasks/ai?date=YYYY-MM-DD
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const today = dateParam ? new Date(dateParam) : new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Delete old one-time AI tasks before today
    await prisma.dailyTask.deleteMany({
      where: {
        user_id: session.user.id,
        is_recurring: false,
        title: { startsWith: "[AI]" },
        created_at: { lt: new Date(`${todayStr}T00:00:00.000Z`) },
      },
    });

    // Fetch all AI daily tasks for today
    const tasks = await prisma.dailyTask.findMany({
      where: {
        user_id: session.user.id,
        title: { startsWith: "[AI]" },
        created_at: {
          gte: new Date(`${todayStr}T00:00:00.000Z`),
          lte: new Date(`${todayStr}T23:59:59.999Z`),
        },
      },
      include: { completions: true },
      orderBy: { created_at: "asc" },
    });

    const response: AiDailyTaskResponse[] = tasks.map((task) => ({
      id: task.id,
      text: task.description ?? task.title,
      completed: task.completions.some(
        (c) => c.completion_date.toISOString().slice(0, 10) === todayStr
      ),
      is_recurring: task.is_recurring ?? false,
    }));

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error fetching AI daily tasks:", err);
    return NextResponse.json(
      { error: "Failed to fetch AI daily tasks" },
      { status: 500 }
    );
  }
}

// POST /api/daily-tasks/ai
// Body: { prompt: string, isRecurring?: boolean }
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, isRecurring } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // TODO: Replace this with a real AI call
    const aiTaskText = `[AI] ${prompt}`;

    // Create new AI daily task
    const task = await prisma.dailyTask.create({
      data: {
        user_id: session.user.id,
        title: aiTaskText,
        description: aiTaskText,
        is_recurring: !!isRecurring,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (err) {
    console.error("Error creating AI daily task:", err);
    return NextResponse.json({ error: "Failed to create AI daily task" }, { status: 500 });
  }
}
