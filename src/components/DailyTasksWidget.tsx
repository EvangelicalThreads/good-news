// src/components/DailyTasksWidget.tsx
'use client';

import { useEffect, useState } from 'react';

type DailyTask = {
  id: string;
  title: string;
  description: string;
  is_recurring: boolean;
  completed: boolean;
};

export default function DailyTasksWidget() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleComplete = async (taskId: string) => {
    const res = await fetch('/api/daily-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });

    if (res.ok) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)));
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch('/api/daily-tasks');
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-3">Today's Tasks</h2>
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex justify-between items-center p-3 mb-2 rounded-lg border transition-colors ${
            task.completed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div>
            <p className="font-medium">{task.title}</p>
            {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
            {!task.is_recurring && task.completed && (
              <p className="text-xs text-gray-400 mt-1">Task will be gone in 24 hours</p>
            )}
          </div>
          {!task.completed && (
            <button
              onClick={() => toggleComplete(task.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Mark Done
            </button>
          )}
        </div>
      ))}
      {tasks.length === 0 && <p className="text-gray-500 text-sm">No tasks for today!</p>}
    </div>
  );
}
