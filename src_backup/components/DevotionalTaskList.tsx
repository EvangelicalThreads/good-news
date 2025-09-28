"use client";

import { useEffect, useState } from "react";
import "./DevotionalTaskList.css";

interface DevotionalTask {
  id: string;
  task_text: string;
  day_number: number;
}

interface DevotionalTaskListProps {
  goalId: string;
}

export default function DevotionalTaskList({ goalId }: DevotionalTaskListProps) {
  const [tasks, setTasks] = useState<DevotionalTask[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingCompleteId, setMarkingCompleteId] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!goalId) {
      setError("Missing goal ID");
      setLoading(false);
      return;
    }

    async function fetchTasksAndProgress() {
      setLoading(true);
      setError(null);
      try {
        const tasksRes = await fetch(`/api/devotional_tasks?goal_id=${goalId}`);
        if (!tasksRes.ok) throw new Error("Failed to load tasks");
        const tasksData: DevotionalTask[] = await tasksRes.json();
        setTasks(tasksData);

        const progressRes = await fetch(`/api/user_task_progress?goal_id=${goalId}`);
        if (!progressRes.ok) throw new Error("Failed to load progress");
        const completedIds: string[] = await progressRes.json();
        setCompletedTaskIds(completedIds);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchTasksAndProgress();
  }, [goalId]);

  function isCompleted(taskId: string) {
    return completedTaskIds.includes(taskId);
  }

  function isUnlocked(index: number) {
    if (index === 0) return true;
    return isCompleted(tasks[index - 1].id);
  }

  async function markComplete(taskId: string) {
    setMarkingCompleteId(taskId);
    setErrorMessages((prev) => ({ ...prev, [taskId]: "" }));
    try {
      const res = await fetch("/api/user_task_progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devotional_task_id: taskId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error && data.error.includes("already completed today")) {
          setErrorMessages((prev) => ({ ...prev, [taskId]: data.error }));
        } else {
          throw new Error(data.error || "Failed to mark complete");
        }
      } else {
        setCompletedTaskIds((prev) => [...prev, taskId]);
      }
    } catch (err) {
      alert("Error marking task complete");
      console.error(err);
    } finally {
      setMarkingCompleteId(null);
    }
  }

  if (loading) return <p>Loading devotional tasks...</p>;
  if (error) return <p className="errorMessage">Error: {error}</p>;

  return (
    <div className="devotionalTasksContainer">
      <h2 className="heading">Devotional Tasks</h2>
      <ol className="taskList">
        {tasks.map((task, i) => {
          const unlocked = isUnlocked(i);
          const completed = isCompleted(task.id);

          return (
            <li
              key={task.id}
              className={`taskItem ${completed ? "completed" : unlocked ? "" : "locked"}`}
            >
              <div className="taskContent">
                <h3 className="taskTitle">Day {task.day_number}</h3>
                <p className="taskDescription">{task.task_text}</p>
              </div>
              <div>
                {completed ? (
                  <span className="statusText">Completed ✓</span>
                ) : unlocked ? (
                  <>
                    <button
                      onClick={() => markComplete(task.id)}
                      disabled={markingCompleteId === task.id}
                      className="buttonPrimary"
                    >
                      {markingCompleteId === task.id ? "Saving..." : "Mark Complete"}
                    </button>
                    {errorMessages[task.id] && (
                      <p className="errorMessage">{errorMessages[task.id]}</p>
                    )}
                  </>
                ) : (
                  <span className="lockedText">Locked</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
