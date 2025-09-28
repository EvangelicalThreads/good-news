import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reflections = await prisma.reflection.findMany({
      where: { status: "approved" }, // ✅ only approved reflections
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        text: true,
        created_at: true,
        user_id: true,
        mood: true,
        reflectionNicheTags: {
          select: {
            nicheTag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Map to clean up the response: replace reflectionNicheTags with simple niche_tags array
    const formattedReflections = reflections.map((r) => ({
      id: r.id,
      text: r.text,
      created_at: r.created_at,
      user_id: r.user_id,
      mood: r.mood,
      niche_tags: r.reflectionNicheTags.map((rnt) => rnt.nicheTag),
    }));

    return NextResponse.json(formattedReflections);
  } catch (error) {
    console.error("Get all reflections error:", error);
    return NextResponse.json(
      { error: "Failed to get reflections" },
      { status: 500 }
    );
  }
}
