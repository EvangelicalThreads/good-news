"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface Journal {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  created_at: string;
}

export default function JournalsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [journals, setJournals] = useState<Journal[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userId) fetchJournals();
  }, [userId]);

  async function fetchJournals() {
    const res = await fetch(`/api/journals?user_id=${userId}`);
    if (res.ok) {
      const data: Journal[] = await res.json();
      setJournals(data);
    }
  }

  async function submitJournal() {
    if (!title.trim() || !content.trim() || !userId) return;
    setIsSubmitting(true);
    const res = await fetch("/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, title, content, mood }),
    });
    if (res.ok) {
      setTitle("");
      setContent("");
      setMood(null);
      fetchJournals();
    }
    setIsSubmitting(false);
  }

  if (!session) {
    return (
      <main className="p-4 max-w-md mx-auto text-center">
        <p>Please log in to view your journals.</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Your Journals</h1>

      <section className="mb-6 p-4 border rounded bg-white shadow">
        <input
          type="text"
          placeholder="Title"
          className="w-full mb-2 p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
        <textarea
          rows={4}
          placeholder="Write your journal entry here..."
          className="w-full mb-2 p-2 border rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
        />
        <select
          value={mood ?? ""}
          onChange={(e) => setMood(e.target.value || null)}
          className="mb-2 w-full p-2 border rounded"
          disabled={isSubmitting}
        >
          <option value="">Select mood (optional)</option>
          <option value="Happy">Happy</option>
          <option value="Sad">Sad</option>
          <option value="Thoughtful">Thoughtful</option>
          <option value="Excited">Excited</option>
        </select>
        <button
          onClick={submitJournal}
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Journal"}
        </button>
      </section>

      <section>
        {journals.length === 0 ? (
          <p className="text-center text-gray-400">No journal entries yet.</p>
        ) : (
          <ul className="space-y-4">
            {journals.map(({ id, title, content, mood, created_at }) => (
              <li
                key={id}
                className="p-4 border rounded shadow bg-white"
              >
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-gray-500">{new Date(created_at).toLocaleString()}</p>
                {mood && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    {mood}
                  </span>
                )}
                <p className="mt-2 whitespace-pre-wrap">{content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
