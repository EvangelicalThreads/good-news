// src/app/api/daily-tasks/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/daily-tasks
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all manual (non-recurring) tasks for this user
    const tasks = await prisma.dailyTask.findMany({
      where: {
        user_id: session.user.id,
        is_recurring: false, // only manual tasks
      },
      include: { completions: true },
      orderBy: { created_at: "asc" },
    });

    const todayStr = new Date().toISOString().slice(0, 10);

    const response = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      completed: task.completions.some(
        (c) => c.completion_date.toISOString().slice(0, 10) === todayStr
      ),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching manual tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/daily-tasks/complete
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId } = body;
    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const today = new Date();

    // Upsert a completion for this task today
    const completion = await prisma.dailyTaskCompletion.upsert({
      where: {
        task_id_completion_date: {
          task_id: taskId,
          completion_date: today,
        },
      },
      update: {}, // nothing to update, just mark as complete
      create: {
        task_id: taskId,
        user_id: session.user.id,
        completion_date: today,
      },
    });

    return NextResponse.json({ success: true, completion });
  } catch (error) {
    console.error("Error completing manual task:", error);
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 });
  }
}

// POST /api/daily-tasks/create
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await prisma.dailyTask.create({
      data: {
        user_id: session.user.id,
        title,
        description: description ?? "",
        is_recurring: false, // manual task
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Error creating manual task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
