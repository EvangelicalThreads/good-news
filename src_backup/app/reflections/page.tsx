"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type NicheTag = {
  id: string;
  name: string;
};

type Reflection = {
  id: string;
  user_id: string;
  text: string;
  mood: string | null;
  created_at: string;
  niche_tags: NicheTag[];
};

export default function ReflectionsPage() {
  const { data: session, status } = useSession();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReflections = async () => {
      const res = await fetch("/api/reflections");
      if (res.ok) {
        const data = await res.json();
        setReflections(data);
      }
      setLoading(false);
    };

    if (status === "authenticated") {
      fetchReflections();
    }
  }, [status]);

  if (status === "loading" || loading) return <div className="text-center mt-20">Loading...</div>;
  if (status === "unauthenticated")
    return <div className="text-center mt-20 text-red-600 font-semibold">You must be logged in to view reflections.</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-12">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Your Reflections</h1>
      {reflections.length === 0 ? (
        <p className="text-center text-gray-500 italic">No reflections yet. Start sharing your thoughts!</p>
      ) : (
        <ul className="space-y-6">
          {reflections.map(({ id, text, mood, created_at, niche_tags }) => (
            <li
              key={id}
              className="border border-purple-200 rounded-lg p-5 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <p className="text-gray-800 whitespace-pre-wrap mb-3">{text}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {niche_tags.length > 0 ? (
                  niche_tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-800 select-none"
                    >
                      #{tag.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-gray-400">No topics</span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span className="italic">{mood ?? "No mood"}</span>
                <time dateTime={created_at}>{new Date(created_at).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
