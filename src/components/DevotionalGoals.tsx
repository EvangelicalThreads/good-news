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

interface DevotionalGoalsProps {
  onGoalSelected?: (goal: Goal) => void; // optional callback
}

export default function DevotionalGoals({ onGoalSelected }: DevotionalGoalsProps) {
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
        console.error(error);
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
      const newGoal = goals.find((g) => g.id === goalId) ?? null;
      setDevotionalGoal(newGoal);
      setTodayTask(null);

      const taskRes = await fetch('/api/devotional_tasks/today');
      if (taskRes.ok) {
        const taskData: DevotionalTask = await taskRes.json();
        setTodayTask(taskData);
      }

      if (onGoalSelected && newGoal) onGoalSelected(newGoal);
    } catch (error: any) {
      setSelectError(error.message);
    } finally {
      setSettingGoalId(null);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center p-6 text-gray-400 text-lg font-light">
        Loading devotional plans...
      </div>
    );

  return (
    <div className="flex flex-col space-y-8">
      {devotionalGoal ? (
        <section className="p-6 rounded-2xl bg-white shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Devotional Goal:</h2>
          <p className="text-lg text-gray-700 mb-4">{devotionalGoal.title}</p>

          {todayTask ? (
            <p className="text-gray-600 text-base italic">
              Day {todayTask.day_number}: {todayTask.task_text}
            </p>
          ) : (
            <p className="italic text-gray-400">No devotional task for today.</p>
          )}
          {taskError && <p className="mt-2 text-red-600 font-semibold">{taskError}</p>}
        </section>
      ) : (
        <p className="text-center text-gray-500 italic select-none">
          You have not selected a devotional goal yet.
        </p>
      )}

      {selectError && (
        <p className="text-center text-red-600 font-medium select-none">{selectError}</p>
      )}

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {goals.map((goal) => {
          const isSelected = devotionalGoal?.id === goal.id;
          const isLoadingThis = settingGoalId === goal.id;

          return (
            <motion.li
              key={goal.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              onClick={() => !isLoadingThis && handleSelectGoal(goal.id)}
              className={`cursor-pointer select-none rounded-2xl p-5 shadow hover:shadow-lg transition-shadow duration-300
                ${
                  isSelected
                    ? 'bg-purple-100 border border-purple-400'
                    : 'bg-white border border-gray-200'
                }
                flex flex-col justify-between`}
              aria-pressed={isSelected}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!isLoadingThis) handleSelectGoal(goal.id);
                }
              }}
            >
              <h3
                className={`text-lg font-semibold mb-1 ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}
              >
                {goal.title}
              </h3>
              {goal.description && <p className="text-gray-600 text-sm">{goal.description}</p>}
              <button
                className={`mt-3 self-start rounded-full px-4 py-1 text-sm font-semibold
                  ${
                    isSelected
                      ? 'bg-purple-600 text-white cursor-default'
                      : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                  }`}
                disabled={isLoadingThis}
              >
                {isLoadingThis ? 'Setting...' : isSelected ? 'Selected' : 'Select'}
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
