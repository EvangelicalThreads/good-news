import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const reflection_id = url.searchParams.get("reflection_id");
  const user_id = url.searchParams.get("user_id");

  if (!reflection_id || !user_id) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Get like status for this user/reflection
  const { data: likeData, error: likeError } = await supabaseAdmin
    .from("likes")
    .select("*")
    .eq("reflection_id", reflection_id)
    .eq("user_id", user_id);

  if (likeError) {
    console.error("Like status error:", likeError);
    return NextResponse.json({ error: "Failed to get like status" }, { status: 500 });
  }

  // Get total like count for this reflection
  const { count, error: countError } = await supabaseAdmin
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("reflection_id", reflection_id);

  if (countError) {
    console.error("Like count error:", countError);
    return NextResponse.json({ error: "Failed to get like count" }, { status: 500 });
  }

  const liked = (likeData?.length ?? 0) > 0;
  return NextResponse.json({ liked, likeCount: count ?? 0 });
}
