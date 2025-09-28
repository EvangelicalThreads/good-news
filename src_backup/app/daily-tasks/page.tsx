"use client";

import { useEffect, useState } from "react";

type DailyTask = {
  id: string;
  title: string;
  description: string;
  is_recurring: boolean;
  completed: boolean;
};

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await fetch("/api/daily-tasks");
    let data: DailyTask[] = await res.json();
    // filter out recurring tasks
    data = data.filter((task) => !task.is_recurring);
    setTasks(data);
    setLoading(false);
  };

  const toggleComplete = async (taskId: string) => {
    const res = await fetch("/api/daily-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });

    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t
        )
      );
    }
  };

  const createTask = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch("/api/daily-tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDescription }),
    });
    const data = await res.json();
    if (data?.task) {
      // only add non-recurring tasks
      if (!data.task.is_recurring) {
        setTasks((prev) => [...prev, { ...data.task, completed: false }]);
      }
      setNewTitle("");
      setNewDescription("");
    }
    setCreating(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading tasks...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Today's Tasks</h1>

      {/* Create Task Form */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
        <input
          type="text"
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <textarea
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <button
          onClick={createTask}
          disabled={creating}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md"
        >
          {creating ? "Adding..." : "Add Task"}
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex justify-between items-center p-4 rounded-xl shadow-md transition-all duration-200 ${
              task.completed
                ? "bg-green-50 border border-green-300"
                : "bg-white border border-gray-200 hover:shadow-lg"
            }`}
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {task.title}
              </h2>
              {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
              {task.completed && !task.is_recurring && (
                <p className="text-xs text-red-500 mt-1 italic">Task will be gone in 24 hours</p>
              )}
            </div>
            <button
              onClick={() => toggleComplete(task.id)}
              disabled={task.completed}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                task.completed
                  ? "bg-green-400 cursor-not-allowed text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {task.completed ? "Completed" : "Mark Done"}
            </button>
          </div>
        ))}
      </div>

      {tasks.length === 0 && <p className="text-center text-gray-500 mt-6">No tasks for today!</p>}
    </div>
  );
}
