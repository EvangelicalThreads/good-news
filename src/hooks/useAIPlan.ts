'use client';
import { useState } from 'react';

export interface PlanItem {
  day: number;
  title: string;
  description: string;
}

interface GeneratePlanArgs {
  userId: string;
  name?: string;
  goal?: string;
  preferences?: string;
}

export function useAIPlan() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async ({ userId, name, goal, preferences }: GeneratePlanArgs) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, goal, preferences }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to generate plan');
      }

      const data = (await res.json()) as { plan?: PlanItem[] };

      if (Array.isArray(data.plan)) {
        setPlan(data.plan);
      } else {
        setError('AI did not return a valid plan');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error generating plan:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, plan, error, generatePlan };
}
