import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string; action: string }>; // 👈 params is a Promise
}

// POST /api/reflection_comments/[id]/approve or /reject
export async function POST(req: Request, { params }: Params) {
  const { id, action } = await params; // 👈 await params

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const updatedComment = await prisma.reflectionComment.update({
      where: { id },
      data: { status: action === "approve" ? "approved" : "rejected" },
    });

    return NextResponse.json({ message: `Comment ${action}d`, comment: updatedComment });
  } catch (error) {
    console.error("Comment action error:", error);
    return NextResponse.json(
      { error: "Failed to update comment status" },
      { status: 500 }
    );
  }
}
