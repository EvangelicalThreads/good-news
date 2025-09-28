import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all UserTaskProgress for this user
    const progressList = await prisma.userTaskProgress.findMany({
      where: { user_id: session.user.id },
      include: {
        devotional_task: {
          select: {
            id: true,
            day_number: true,
            task_text: true,
            goal: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        devotional_task: {
          day_number: "asc",
        },
      },
    });

    // Get user's streak info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        streak: true,
        streak_last_date: true,
      },
    });

    return NextResponse.json(
      { progress: progressList, streak: user?.streak ?? 0, streak_last_date: user?.streak_last_date ?? null },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET user_progress error:", error);
    return NextResponse.json({ error: "Failed to fetch user progress" }, { status: 500 });
  }
}
