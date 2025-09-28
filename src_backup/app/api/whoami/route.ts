import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust import if needed

export async function GET() {
  const result = await prisma.$queryRaw`SELECT current_user, session_user`;
  return NextResponse.json(result);
}
