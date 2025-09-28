// src/app/devotional-goals/[goalId]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DevotionalTaskList from '@/components/DevotionalTaskList';
interface Params {
  params: Promise<{
    goalId: string;
  }>;
}

export default async function DevotionalPlanPage({ params }: Params) {
  const { goalId } = await params;

  const goal = await prisma.devotionalGoal.findUnique({
    where: { id: goalId },
  });

  if (!goal) {
    notFound();
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{goal.title}</h1>
      {goal.description && <p className="mb-8 text-gray-700">{goal.description}</p>}

      <DevotionalTaskList goalId={goalId} />
    </main>
  );
}
