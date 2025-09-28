import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { reflection_id, user_id } = await req.json();

    if (!reflection_id || !user_id) {
      return NextResponse.json({ error: "Missing reflection_id or user_id" }, { status: 400 });
    }

    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from("likes")
      .select("*")
      .eq("reflection_id", reflection_id)
      .eq("user_id", user_id)
      .limit(1)
      .single();

    // Ignore not found error (code PGRST116) - no like yet
    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking like:", checkError);
      return NextResponse.json({ error: "Failed to check like" }, { status: 500 });
    }

    if (existingLike) {
      // Unlike: delete the like row
      const { error: deleteError } = await supabaseAdmin
        .from("likes")
        .delete()
        .eq("reflection_id", reflection_id)
        .eq("user_id", user_id);

      if (deleteError) {
        console.error("Error unliking:", deleteError);
        return NextResponse.json({ error: "Failed to unlike" }, { status: 500 });
      }
      return NextResponse.json({ liked: false });
    } else {
      // Like: insert a new like row
      const { error: insertError } = await supabaseAdmin.from("likes").insert({
        reflection_id,
        user_id,
      });

      if (insertError) {
        console.error("Error liking:", insertError);
        return NextResponse.json({ error: "Failed to like" }, { status: 500 });
      }
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
