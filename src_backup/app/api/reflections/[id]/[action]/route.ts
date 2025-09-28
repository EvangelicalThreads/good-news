import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string; action: string }>; // 👈 params is a Promise
}

// POST /api/reflections/[id]/approve or /reject
export async function POST(req: Request, { params }: Params) {
  const { id, action } = await params; // 👈 await params

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const updatedReflection = await prisma.reflection.update({
      where: { id },
      data: { status: action === "approve" ? "approved" : "rejected" },
    });

    return NextResponse.json({ message: `Reflection ${action}d`, reflection: updatedReflection });
  } catch (error) {
    console.error("Reflection action error:", error);
    return NextResponse.json(
      { error: "Failed to update reflection status" },
      { status: 500 }
    );
  }
}
