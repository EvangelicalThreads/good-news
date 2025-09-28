import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const validAvatars = ['lamb', 'bread', 'dove'];

export async function POST(req: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, avatar } = await req.json();

    if (!name && !avatar) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    if (avatar && !validAvatars.includes(avatar)) {
      return NextResponse.json({ error: 'Invalid avatar choice' }, { status: 400 });
    }

    // Update user in the database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
