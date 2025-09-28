import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/reflection_comments?reflection_id=...
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const reflection_id = url.searchParams.get("reflection_id");

  if (!reflection_id) {
    return NextResponse.json({ error: "Missing reflection_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("reflection_comments")
    .select("*")
    .eq("reflection_id", reflection_id)
    .eq("status", "approved") // only approved comments
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Failed to get comments" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/reflection_comments
export async function POST(req: NextRequest) {
  try {
    const { reflection_id, user_id, comment } = await req.json();

    if (!reflection_id || !user_id || !comment) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Optional: auto-flagging
    const flaggedWords = ["self-harm", "suicide", "smoking"];
    const isFlagged = flaggedWords.some(word =>
      comment.toLowerCase().includes(word)
    );

    const { error } = await supabaseAdmin
      .from("reflection_comments")
      .insert({
        reflection_id,
        user_id,
        comment,
        status: isFlagged ? "pending" : "pending", // default pending
      });

    if (error) {
      console.error("Add comment error:", error);
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    return NextResponse.json({ message: "Comment added" });
  } catch (error) {
    console.error("Reflection comments POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
