// src/app/api/good-news/route.ts
import { prisma } from "@/lib/prisma"; // adjust path if needed
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Find the Good News card for today
    const card = await prisma.good_news.findFirst({
      where: {
        date: new Date(formattedToday),
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: "No Good News card for today" },
        { status: 404 }
      );
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Failed to fetch today's good news card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
