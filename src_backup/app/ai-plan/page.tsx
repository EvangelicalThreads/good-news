"use client";

import { useState, useEffect } from "react";
import "../../components/LuxuryDevotional.css";

interface DevotionalTask {
  id: string;
  day_number: number;
  task_text: string;
}

interface AiPlanResponse {
  savedPlanId: string;
  tasks: DevotionalTask[];
}

export default function LuxuryDevotional() {
  const [goalText, setGoalText] = useState("");
  const [plan, setPlan] = useState<AiPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [markingCompleteId, setMarkingCompleteId] = useState<string | null>(null);
  const [taskErrorMessages, setTaskErrorMessages] = useState<Record<string, string>>({});
  const [streak, setStreak] = useState<number>(0);

  // Fetch last saved plan and completed tasks on mount
  useEffect(() => {
    async function fetchLastUserPlan() {
      try {
        const res = await fetch("/api/ai-plan"); // GET last plan for user
        if (!res.ok) return;

        const data: AiPlanResponse | null = await res.json();
        if (data?.savedPlanId && data.tasks.length) {
          setPlan(data);
          await fetchProgress(data.savedPlanId);
        }
      } catch (err) {
        console.error("Failed to fetch last user plan:", err);
      }
    }

    fetchLastUserPlan();
    fetchUserStreak();
  }, []);

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

  async function fetchUserStreak() {
    try {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setStreak(data.streak || 0);
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

      const data: {
        savedPlanId?: string;
        tasks?: DevotionalTask[];
        error?: string;
      } = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate plan");
      if (!data.savedPlanId || !data.tasks) throw new Error("No tasks returned from API");

      // Update plan state and reset completed tasks
      setPlan({ savedPlanId: data.savedPlanId, tasks: data.tasks });
      setCompletedTaskIds([]);
      await fetchProgress(data.savedPlanId);
    } catch (err: any) {
      setPlanError(err.message || "Unknown error");
    } finally {
      setLoadingPlan(false);
    }
  }

  function isCompleted(taskId: string) {
    return completedTaskIds.includes(taskId);
  }

  // Only unlock the **first incomplete task**
  function isUnlocked(tasks: DevotionalTask[], index: number) {
    // If this task is already completed, it's unlocked
    if (isCompleted(tasks[index].id)) return true;
    // Only the first incomplete task is unlocked
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
        await fetchUserStreak();
      }
    } catch (err) {
      console.error(err);
      setTaskErrorMessages((prev) => ({ ...prev, [taskId]: "Network error" }));
    } finally {
      setMarkingCompleteId(null);
    }
  }

  return (
    <div className="luxuryContainer">
      <header className="luxuryHeader">
        <h1>✨ Your 30-Day AI Devotional Plan</h1>
        <p className="subHeader">
          Enter your goal below and receive a gentle, day-by-day plan.
        </p>

        <div className="goalInputContainer">
          <input
            type="text"
            placeholder="Enter your goal..."
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            className="goalInput"
          />
          <button
            onClick={generatePlan}
            disabled={loadingPlan}
            className="generateButton"
          >
            {loadingPlan ? "Generating..." : "Generate Plan"}
          </button>
        </div>

        <p className="streakDisplay">
          🔥 Current Streak: {streak} day{streak !== 1 ? "s" : ""}
        </p>

        {planError && <p className="errorText">{planError}</p>}
      </header>

      {plan && (
        <ol className="taskList">
          {plan.tasks.map((task, i) => {
            const unlocked = isUnlocked(plan.tasks, i);
            const completed = isCompleted(task.id);

            return (
              <li
                key={task.id}
                className={`taskCard ${completed ? "completed" : unlocked ? "" : "locked"}`}
              >
                <div className="taskContent">
                  <h3 className="taskDay">Day {task.day_number}</h3>
                  <p className="taskText">{task.task_text}</p>
                </div>
                <div className="taskAction">
                  {completed ? (
                    <span className="completedLabel">Completed ✓</span>
                  ) : unlocked ? (
                    <>
                      <button
                        onClick={() => markComplete(task.id)}
                        disabled={markingCompleteId === task.id}
                        className="completeButton"
                      >
                        {markingCompleteId === task.id ? "Saving..." : "Mark Complete"}
                      </button>
                      {taskErrorMessages[task.id] && (
                        <p className="errorText">{taskErrorMessages[task.id]}</p>
                      )}
                    </>
                  ) : (
                    <span className="lockedLabel">Locked 🔒</span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
