import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Use `any` for params to satisfy App Router TypeScript checks
export async function GET(req: Request, { params }: any) {
  const reflectionId = params.id;

  try {
    const reflectionTags = await prisma.reflectionNicheTag.findMany({
      where: { reflection_id: reflectionId },
      include: { nicheTag: true },
    });

    return NextResponse.json(reflectionTags.map(rt => rt.nicheTag));
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: any) {
  const reflectionId = params.id;

  try {
    const { tagIds } = await req.json();

    if (!Array.isArray(tagIds)) {
      return NextResponse.json({ error: "tagIds must be an array" }, { status: 400 });
    }

    // Remove existing tags
    await prisma.reflectionNicheTag.deleteMany({
      where: { reflection_id: reflectionId },
    });

    // Add new tags
    const data = tagIds.map((tagId: string) => ({
      niche_tag_id: tagId,
      reflection_id: reflectionId,
    }));

    await prisma.reflectionNicheTag.createMany({ data });

    return NextResponse.json({ message: "Tags updated" });
  } catch (error) {
    console.error("Failed to update tags:", error);
    return NextResponse.json({ error: "Failed to update tags" }, { status: 500 });
  }
}
