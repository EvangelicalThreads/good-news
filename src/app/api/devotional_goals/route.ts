import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const goals = await prisma.devotionalGoal.findMany();
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching devotional goals:', error);
    return NextResponse.json({ error: 'Failed to fetch devotional goals' }, { status: 500 });
  }
}
