"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GoodNewsCard from "@/components/GoodNewsCard";
import Feed from "@/components/Feed";
import { useUser } from "@/context/UserContext";
import "../components/LuxuryDevotional.css";

const avatarOptions: Record<string, string> = {
  lamb: "/lamb.jpg",
  bread: "/bread.jpg",
  dove: "/dove.jpg",
};

type AiPlanTask = {
  id: string;
  day_number: number;
  task_text: string;
};

type AiPlanResponse = {
  savedPlanId: string;
  tasks: AiPlanTask[];
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const [streak, setStreak] = useState<number>(0);
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(null);

  const [goalText, setGoalText] = useState("");
  const [plan, setPlan] = useState<AiPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [markingCompleteId, setMarkingCompleteId] = useState<string | null>(null);
  const [taskErrorMessages, setTaskErrorMessages] = useState<Record<string, string>>({});
  const [planCollapsed, setPlanCollapsed] = useState(true);

  const [activeTab, setActiveTab] = useState<"today" | "community">("today");

  const { avatar, name: userName } = useUser();
  const avatarImg = avatarOptions[avatar] || avatarOptions["lamb"];

  // Fetch streak & AI plan
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchStreak = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        setStreak(data.streak ?? 0);
        setLastStreakDate(
          data.streak_last_date
            ? new Date(data.streak_last_date).toLocaleDateString()
            : null
        );
      } catch (err) {
        console.error(err);
      }
    };

    const fetchAiPlan = async () => {
      try {
        const res = await fetch("/api/ai-plan");
        if (!res.ok) return;
        const data: AiPlanResponse | null = await res.json();
        if (data?.savedPlanId && data.tasks.length) {
          setPlan(data);
          await fetchProgress(data.savedPlanId);
        }
      } catch (err) {
        console.error("Failed to fetch AI plan:", err);
      }
    };

    fetchStreak();
    fetchAiPlan();
  }, [session?.user?.id]);

  async function fetchProgress(savedPlanId: string) {
    try {
      const res = await fetch(`/api/user_ai_task_progress?plan_id=${savedPlanId}`);
      if (!res.ok) throw new Error("Failed to load progress");
      const completedIds: string[] = await res.json();
      setCompletedTaskIds(completedIds);
    } catch (err) {
      console.error(err);
    }
  }

  async function generatePlan() {
    if (!goalText.trim()) return;
    setLoadingPlan(true);
    setPlanError(null);

    try {
      const res = await fetch("/api/ai-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalText }),
      });

      const data: { savedPlanId?: string; tasks?: AiPlanTask[]; error?: string } =
        await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate plan");
      if (!data.savedPlanId || !data.tasks) throw new Error("No tasks returned");

      setPlan({ savedPlanId: data.savedPlanId, tasks: data.tasks });
      setCompletedTaskIds([]);
    } catch (err: any) {
      setPlanError(err.message || "Unknown error");
    } finally {
      setLoadingPlan(false);
    }
  }

  function isCompleted(taskId: string) {
    return completedTaskIds.includes(taskId);
  }

  function isUnlocked(tasks: AiPlanTask[], index: number) {
    if (isCompleted(tasks[index].id)) return true;
    return tasks.slice(0, index).every((t) => isCompleted(t.id));
  }

  async function markComplete(taskId: string) {
    setMarkingCompleteId(taskId);
    setTaskErrorMessages((prev) => ({ ...prev, [taskId]: "" }));

    try {
      const res = await fetch("/api/user_ai_task_progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai_plan_task_id: taskId }),
      });

      const data: { error?: string } = await res.json();

      if (!res.ok || data.error) {
        setTaskErrorMessages((prev) => ({
          ...prev,
          [taskId]: data.error ?? "Failed to mark complete",
        }));
      } else {
        setCompletedTaskIds((prev) => [...prev, taskId]);
      }
    } catch (err) {
      console.error(err);
      setTaskErrorMessages((prev) => ({ ...prev, [taskId]: "Network error" }));
    } finally {
      setMarkingCompleteId(null);
    }
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto p-6 text-center">
        <p className="text-lg text-gray-400 animate-pulse tracking-wide">Loading...</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">
          Welcome to Good News
        </h1>
        <p className="mb-6 text-gray-600 tracking-wide">
          Please{" "}
          <a
            href="/login"
            className="text-purple-600 underline hover:text-purple-800 transition-colors duration-200"
          >
            log in
          </a>{" "}
          to get started.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      {/* Hero */}
      <section className="flex flex-col items-center text-center mb-8">
        <motion.img
          src={avatarImg}
          alt={avatar}
          className="w-28 h-28 rounded-full border-4 border-gradient-to-tr from-purple-400 to-pink-400 shadow-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        />
        <h1 className="text-2xl font-bold mt-4 text-gray-900 tracking-tight">
          Welcome back, {userName || "Friend"}!
        </h1>
        {streak !== null && (
          <div className="mt-2 text-sm text-gray-600 font-medium flex gap-2 items-center">
            🔥 {streak} day{streak === 1 ? "" : "s"} streak
            {lastStreakDate && (
              <span className="text-gray-400">(last: {lastStreakDate})</span>
            )}
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6 gap-2">
        <button
          className={`flex-1 py-3 font-semibold rounded-t-lg transition-colors duration-200 ${
            activeTab === "today"
              ? "bg-white border-t-2 border-purple-600 text-purple-700 shadow-md"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("today")}
        >
          Today
        </button>
        <button
          className={`flex-1 py-3 font-semibold rounded-t-lg transition-colors duration-200 ${
            activeTab === "community"
              ? "bg-white border-t-2 border-purple-600 text-purple-700 shadow-md"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("community")}
        >
          Community
        </button>
      </div>

      {activeTab === "today" && (
        <div className="space-y-8">
          <GoodNewsCard />

          {/* AI Devotional Plan Section */}
          <section className="bg-white p-6 rounded-2xl shadow-xl space-y-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setPlanCollapsed(!planCollapsed)}
            >
              <h2 className="text-xl font-semibold text-gray-900">
                ✨ Your 30-Day AI Devotional Plan
              </h2>
              <span className="text-purple-600 font-bold">
                {planCollapsed ? "▼" : "▲"}
              </span>
            </div>
            <p className="text-gray-600">
              Enter your goal below and receive a gentle, day-by-day plan.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your goal..."
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="flex-1 border border-gray-300 p-3 rounded-xl"
              />
              <button
                onClick={generatePlan}
                disabled={loadingPlan}
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl"
              >
                {loadingPlan ? "Generating..." : "Generate"}
              </button>
            </div>

            {planError && <p className="text-red-600">{planError}</p>}

            {!planCollapsed && plan && (
              <ol className="space-y-3 mt-4">
                {/* Show only the first day initially */}
                {plan.tasks.slice(0, 1).map((task, i) => {
                  const unlocked = isUnlocked(plan.tasks, i);
                  const completed = isCompleted(task.id);

                  return (
                    <li
                      key={task.id}
                      className={`p-4 rounded-xl border ${
                        completed
                          ? "bg-gray-100 border-gray-200"
                          : unlocked
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-200 opacity-50"
                      }`}
                    >
                      <div>
                        <h3 className="font-semibold">Day {task.day_number}</h3>
                        <p className="text-gray-700">{task.task_text}</p>
                      </div>
                      <div className="mt-2">
                        {completed ? (
                          <span className="text-green-600 font-medium">✓ Completed</span>
                        ) : unlocked ? (
                          <button
                            onClick={() => markComplete(task.id)}
                            disabled={markingCompleteId === task.id}
                            className="px-3 py-1 rounded-lg bg-purple-600 text-white"
                          >
                            {markingCompleteId === task.id ? "Saving..." : "Mark Complete"}
                          </button>
                        ) : (
                          <span className="text-gray-400">Locked 🔒</span>
                        )}
                      </div>
                      {taskErrorMessages[task.id] && (
                        <p className="text-red-500 text-sm">{taskErrorMessages[task.id]}</p>
                      )}
                    </li>
                  );
                })}

                {/* Optional: expand remaining days if collapsed */}
                {!planCollapsed && plan.tasks.length > 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden"
                  >
                    {plan.tasks.slice(1).map((task, i) => {
                      const unlocked = isUnlocked(plan.tasks, i + 1);
                      const completed = isCompleted(task.id);
                      return (
                        <li
                          key={task.id}
                          className={`p-4 rounded-xl border ${
                            completed
                              ? "bg-gray-100 border-gray-200"
                              : unlocked
                              ? "bg-white border-gray-200"
                              : "bg-gray-50 border-gray-200 opacity-50"
                          }`}
                        >
                          <div>
                            <h3 className="font-semibold">Day {task.day_number}</h3>
                            <p className="text-gray-700">{task.task_text}</p>
                          </div>
                          <div className="mt-2">
                            {completed ? (
                              <span className="text-green-600 font-medium">✓ Completed</span>
                            ) : unlocked ? (
                              <button
                                onClick={() => markComplete(task.id)}
                                disabled={markingCompleteId === task.id}
                                className="px-3 py-1 rounded-lg bg-purple-600 text-white"
                              >
                                {markingCompleteId === task.id ? "Saving..." : "Mark Complete"}
                              </button>
                            ) : (
                              <span className="text-gray-400">Locked 🔒</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </motion.div>
                )}
              </ol>
            )}
          </section>
        </div>
      )}

      {activeTab === "community" && (
        <section className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-900 tracking-wide">
            Community Reflections
          </h2>
          <Feed />
        </section>
      )}
    </main>
  );
}
