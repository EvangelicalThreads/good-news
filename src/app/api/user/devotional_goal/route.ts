import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch current devotional goal for user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { devotional_goal_id: true },
    });

    if (!user?.devotional_goal_id) {
      return NextResponse.json({ devotional_goal: null });
    }

    const devotionalGoal = await prisma.devotionalGoal.findUnique({
      where: { id: user.devotional_goal_id },
    });

    return NextResponse.json({ devotional_goal: devotionalGoal });
  } catch (error) {
    console.error('Error fetching devotional goal:', error);
    return NextResponse.json({ error: 'Failed to fetch devotional goal' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { devotional_goal_id } = body;

    if (!devotional_goal_id) {
      return NextResponse.json({ error: 'Missing devotional_goal_id' }, { status: 400 });
    }

    // Validate that devotional_goal_id exists
    const goalExists = await prisma.devotionalGoal.findUnique({
      where: { id: devotional_goal_id },
    });
    if (!goalExists) {
      return NextResponse.json({ error: 'Invalid devotional_goal_id' }, { status: 400 });
    }

    // Update user's devotional_goal_id
    await prisma.user.update({
      where: { id: session.user.id },
      data: { devotional_goal_id },
    });

    return NextResponse.json({ message: 'Devotional goal set successfully' });
  } catch (error) {
    console.error('Error setting devotional goal:', error);
    return NextResponse.json({ error: 'Failed to set devotional goal' }, { status: 500 });
  }
}
