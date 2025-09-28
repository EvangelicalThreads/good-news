// src/app/api/devotional-tasks/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goal_id");

    if (!goalId) {
      return NextResponse.json({ error: "Missing goal_id" }, { status: 400 });
    }

    // Fetch all tasks for this goal
    const tasks = await prisma.devotionalTask.findMany({
      where: { goal_id: goalId },
      orderBy: { day_number: "asc" },
    });

    // If user is logged in, fetch completed tasks
    let completedIds: string[] = [];
    if (session?.user?.id) {
      const completed = await prisma.userTaskProgress.findMany({
        where: { user_id: session.user.id, devotional_task_id: { in: tasks.map(t => t.id) } },
        select: { devotional_task_id: true },
      });
      // Filter out nulls to satisfy string[] type
      completedIds = completed
        .map(c => c.devotional_task_id)
        .filter((id): id is string => id !== null);
    }

    // Return tasks with completion status
    const response = tasks.map(task => ({
      id: task.id,
      day_number: task.day_number,
      task_text: task.task_text,
      completed: completedIds.includes(task.id),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching devotional tasks:", error);
    return NextResponse.json({ error: "Failed to fetch devotional tasks" }, { status: 500 });
  }
}
