import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Call the new function to get current user role
    const { data: userData, error: userError } = await supabaseAdmin.rpc('get_current_user');

    // Test simple query on "likes" table
    const { data: testData, error: testError } = await supabaseAdmin
      .from('likes')
      .select('*')
      .limit(1);

    return NextResponse.json({
      currentUser: userData,
      currentUserError: userError,
      testData,
      testError,
    });
  } catch (e: unknown) {
    let message = 'Unknown error';
    if (e instanceof Error) {
      message = e.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
