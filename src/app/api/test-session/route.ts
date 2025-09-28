import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No user ID found. Are you logged in?' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Session is working!',
      userId: session.user.id,
    });
  } catch (err) {
    console.error('Test session error:', err);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}
