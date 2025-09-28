'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Goal {
  id: string;
  title: string;
  description?: string;
}

interface DevotionalTask {
  id: string;
  day_number: number;
  task_text: string;
}

export default function DevotionalGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const [devotionalGoal, setDevotionalGoal] = useState<Goal | null>(null);
  const [todayTask, setTodayTask] = useState<DevotionalTask | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [settingGoalId, setSettingGoalId] = useState<string | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/devotional_goals')
      .then((res) => res.json())
      .then((data: Goal[]) => setGoals(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    async function fetchDevotionalInfo() {
      try {
        const goalRes = await fetch('/api/user/devotional_goal');
        if (!goalRes.ok) throw new Error('Failed to fetch devotional goal');
        const goalData = await goalRes.json();
        setDevotionalGoal(goalData.devotional_goal ?? null);

        if (goalData.devotional_goal?.id) {
          const taskRes = await fetch('/api/devotional_tasks/today');
          if (!taskRes.ok) throw new Error("Failed to fetch today's devotional task");
          const taskData: DevotionalTask = await taskRes.json();
          setTodayTask(taskData);
          setTaskError(null);
        }
      } catch (error) {
        console.error('Error fetching devotional info:', error);
        setTaskError('Unable to load devotional tasks.');
      }
    }
    fetchDevotionalInfo();
  }, []);

  async function handleSelectGoal(goalId: string) {
    setSettingGoalId(goalId);
    setSelectError(null);
    try {
      const res = await fetch('/api/user/devotional_goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devotional_goal_id: goalId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to set devotional goal');
      }
      setDevotionalGoal(goals.find((g) => g.id === goalId) ?? null);
      setTodayTask(null);

      const taskRes = await fetch('/api/devotional_tasks/today');
      if (taskRes.ok) {
        const taskData: DevotionalTask = await taskRes.json();
        setTodayTask(taskData);
      }
    } catch (error: any) {
      setSelectError(error.message);
    } finally {
      setSettingGoalId(null);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-xl font-light">
        Loading devotional plans...
      </div>
    );

  return (
    <main className="max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-xl flex flex-col min-h-screen relative overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-serif font-extrabold mb-14 text-center text-green-800 tracking-wider select-none"
      >
        Walk with Christ ✨
      </motion.h1>

      {devotionalGoal ? (
        <section className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-green-100 via-green-50 to-green-100 shadow-lg border border-green-300">
          <h2 className="text-3xl font-semibold text-green-900 mb-4 tracking-wide">
            Your Devotional Goal:
          </h2>
          <p className="text-2xl font-medium text-green-800 mb-6">{devotionalGoal.title}</p>

          {todayTask ? (
            <p className="text-green-700 text-lg italic">
              Day {todayTask.day_number}: {todayTask.task_text}
            </p>
          ) : (
            <p className="italic text-gray-600">No devotional task for today.</p>
          )}
          {taskError && <p className="mt-4 text-red-600 font-semibold">{taskError}</p>}
        </section>
      ) : (
        <p className="text-center text-gray-500 italic mb-12 select-none">
          You have not selected a devotional goal yet.
        </p>
      )}

      {selectError && (
        <p className="mb-6 text-center text-red-600 font-medium select-none">{selectError}</p>
      )}

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {goals.map((goal: Goal) => {
          const { id, title, description } = goal;
          const isSelected = devotionalGoal?.id === id;
          const isLoadingThis = settingGoalId === id;

          return (
            <motion.li
              key={id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              onClick={() => !isLoadingThis && handleSelectGoal(id)}
              className={`cursor-pointer select-none rounded-3xl p-6 shadow-md transition-shadow duration-300
                ${
                  isSelected
                    ? 'bg-green-300 border-4 border-green-600 shadow-xl'
                    : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:shadow-2xl'
                }
                flex flex-col justify-between`}
              aria-pressed={isSelected}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!isLoadingThis) handleSelectGoal(id);
                }
              }}
            >
              <h2
                className={`text-2xl font-semibold mb-2 ${isSelected ? 'text-green-900' : 'text-green-800'}`}
              >
                {title}
              </h2>
              {description && (
                <p className="text-green-700 text-sm leading-relaxed">{description}</p>
              )}

              <button
                className={`mt-4 self-start rounded-full px-4 py-1 text-sm font-semibold
                  ${isSelected ? 'bg-green-600 text-white cursor-default' : 'bg-green-300 text-green-900 hover:bg-green-400'}`}
                disabled={isLoadingThis}
                aria-label={
                  isSelected ? 'Current devotional goal' : `Select ${title} as your devotional goal`
                }
                tabIndex={-1}
              >
                {isLoadingThis ? 'Setting...' : isSelected ? 'Selected' : 'Select'}
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </main>
  );
}
