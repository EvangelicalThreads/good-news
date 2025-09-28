import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>; // params is a Promise in Next.js 13+
}

// GET /api/reflections/[id]
export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  const reflectionId = id;

  try {
    const reflection = await prisma.reflection.findUnique({
      where: { id: reflectionId },
      include: {
        reflectionComments: { where: { status: 'approved' } }, // only approved comments
        reflectionLikes: true,
        reflectionNicheTags: { include: { nicheTag: true } },
      },
    });

    if (!reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    // Optional: block access if reflection is not approved
    if (reflection.status !== 'approved') {
      return NextResponse.json({ error: 'Reflection not approved' }, { status: 403 });
    }

    return NextResponse.json(reflection);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch reflection' }, { status: 500 });
  }
}

// DELETE /api/reflections/[id]
export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  const reflectionId = id;

  try {
    // Optional: check admin auth here
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    const deletedReflection = await prisma.reflection.delete({
      where: { id: reflectionId },
    });

    return NextResponse.json({
      message: 'Reflection deleted',
      reflection: deletedReflection,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Reflection not found or failed to delete' },
      { status: 404 },
    );
  }
}
