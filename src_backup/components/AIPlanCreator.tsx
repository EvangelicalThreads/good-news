"use client";
import { useState } from "react";
import { useAIPlan } from "../hooks/useAIPlan";

interface AIPlanGeneratorProps {
  userId: string;
}

export const AIPlanGenerator = ({ userId }: AIPlanGeneratorProps) => {
  const { loading, plan, error, generatePlan } = useAIPlan();
  const [goal, setGoal] = useState("");
  const [name, setName] = useState("");

  const handleGenerate = () => {
    generatePlan({ userId, name, goal });
  };

  return (
    <div className="p-6 bg-lavender-50 rounded-2xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-purple-800">
        Generate Your 30-Day Plan
      </h2>

      <input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 rounded-lg border border-purple-200"
      />

      <input
        type="text"
        placeholder="Goal / Focus"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="w-full p-2 rounded-lg border border-purple-200"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 transition-colors"
      >
        {loading ? "Generating..." : "Generate Plan"}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ Null-safe check for plan */}
      {plan && plan.length > 0 && (
        <div className="space-y-2 mt-4">
          {plan.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl shadow-sm border-l-4 border-purple-400"
            >
              <p className="font-semibold">
                Day {item.day}: {item.title}
              </p>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
