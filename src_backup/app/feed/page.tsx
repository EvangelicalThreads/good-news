"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface NicheTag {
  id: string;
  name: string;
}

interface Reflection {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  mood: string | null;
  niche_tags: NicheTag[];
}

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export default function FeedPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [likes, setLikes] = useState<Record<string, { liked: boolean; likeCount: number }>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  const [newReflectionText, setNewReflectionText] = useState("");
  const [newReflectionMood, setNewReflectionMood] = useState<string | null>(null);
  const [selectedTagIdForNewReflection, setSelectedTagIdForNewReflection] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nicheTags, setNicheTags] = useState<NicheTag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>("");

  const isAdmin = session?.user?.is_admin ?? false; // <-- admin check

  useEffect(() => {
    if (session?.user?.id) {
      fetchReflections();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchNicheTags() {
      try {
        const res = await fetch("/api/niche-tags");
        if (!res.ok) throw new Error("Failed to fetch niche tags");
        const data: NicheTag[] = await res.json();
        setNicheTags(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchNicheTags();
  }, []);

  useEffect(() => {
    fetchReflections();
  }, [selectedTagId]);

  async function fetchReflections() {
    try {
      let url = "/api/feed";
      if (selectedTagId) {
        url = `/api/reflections/by-tag/${selectedTagId}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch reflections");
      const data: Reflection[] = await res.json();
      setReflections(data);

      data.forEach((r) => {
        fetchLikeStatus(r.id);
        fetchComments(r.id);
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchLikeStatus(reflectionId: string) {
    try {
      if (!session?.user?.id) return;
      const res = await fetch(
        `/api/likes/status?reflection_id=${reflectionId}&user_id=${session.user.id}`
      );
      if (!res.ok) throw new Error("Failed to fetch like status");
      const data = await res.json();
      setLikes((prev) => ({ ...prev, [reflectionId]: data }));
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleLike(reflectionId: string) {
    try {
      if (!session?.user?.id) return;
      const current = likes[reflectionId];
      const res = await fetch("/api/likes/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection_id: reflectionId, user_id: session.user.id }),
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      const data = await res.json();
      setLikes((prev) => ({
        ...prev,
        [reflectionId]: {
          liked: data.liked,
          likeCount:
            current?.likeCount != null
              ? current.likeCount + (data.liked ? 1 : -1)
              : data.likeCount ?? 0,
        },
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchComments(reflectionId: string) {
    try {
      const res = await fetch(`/api/reflection_comments?reflection_id=${reflectionId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data: Comment[] = await res.json();
      setComments((prev) => ({ ...prev, [reflectionId]: data }));
    } catch (err) {
      console.error(err);
    }
  }

  async function submitComment(reflectionId: string, commentText: string) {
    if (!commentText.trim() || !session?.user?.id) return;
    try {
      const res = await fetch("/api/reflection_comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection_id: reflectionId, comment: commentText, user_id: session.user.id }),
      });
      if (!res.ok) throw new Error("Failed to submit comment");
      fetchComments(reflectionId);
    } catch (err) {
      console.error(err);
    }
  }

  async function submitReflection() {
    if (!newReflectionText.trim() || !session?.user?.id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newReflectionText,
          mood: newReflectionMood,
          user_id: session.user.id,
          tagIds: selectedTagIdForNewReflection ? [selectedTagIdForNewReflection] : [],
        }),
      });
      if (!res.ok) throw new Error("Failed to submit reflection");
      setNewReflectionText("");
      setNewReflectionMood(null);
      setSelectedTagIdForNewReflection("");
      fetchReflections();
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  }

  async function handleDeleteReflection(reflectionId: string) {
    try {
      const res = await fetch(`/api/reflections/${reflectionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete reflection");
      setReflections((prev) => prev.filter((r) => r.id !== reflectionId));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading user...</p>;
  }

  if (!session?.user) {
    return (
      <main className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view the feed</h1>
        <a href="/login" className="text-purple-600 underline">
          Go to Login
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pt-12 pb-20">
      <h1 className="text-3xl font-bold mb-6 text-center">Reflections Feed</h1>

      {/* New Reflection Form */}
      <section className="mb-8 p-4 border rounded shadow bg-white">
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          placeholder="Write a new reflection..."
          value={newReflectionText}
          onChange={(e) => setNewReflectionText(e.target.value)}
          disabled={isSubmitting}
        />
        <select
          value={newReflectionMood ?? ""}
          onChange={(e) => setNewReflectionMood(e.target.value || null)}
          className="mt-2 border rounded p-1"
          disabled={isSubmitting}
        >
          <option value="">Select mood (optional)</option>
          <option value="Happy">Happy</option>
          <option value="Sad">Sad</option>
          <option value="Thoughtful">Thoughtful</option>
          <option value="Excited">Excited</option>
        </select>

        <select
          value={selectedTagIdForNewReflection}
          onChange={(e) => setSelectedTagIdForNewReflection(e.target.value)}
          className="mt-2 border rounded p-1"
          disabled={isSubmitting}
        >
          <option value="">Select topic tag (optional)</option>
          {nicheTags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>

        <button
          onClick={submitReflection}
          disabled={isSubmitting}
          className="mt-3 bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Post Reflection"}
        </button>
      </section>

      {/* Tag Filter Dropdown */}
      <div className="mb-6">
        <label htmlFor="tagFilter" className="block font-semibold mb-1">
          Filter by Topic Tag:
        </label>
        <select
          id="tagFilter"
          className="border rounded p-2 w-full max-w-xs"
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(e.target.value)}
        >
          <option value="">All</option>
          {nicheTags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reflections List */}
      {reflections.length === 0 ? (
        <p className="text-center text-gray-400">No reflections yet.</p>
      ) : (
        <ul className="space-y-8">
          {reflections.map(({ id, text, created_at, mood, niche_tags }) => (
            <li
              key={id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <p className="text-gray-800 whitespace-pre-wrap">{text}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(created_at).toLocaleString()}
              </p>
              {mood && (
                <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  {mood}
                </span>
              )}
              {/* Admin Delete Button */}
{isAdmin && (
  <button
    onClick={() => handleDeleteReflection(id)}
    className="ml-2 text-red-600 text-sm"
  >
    Delete
  </button>
)}


              {/* Display niche tags */}
              {niche_tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {niche_tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Like Button */}
              <button
                className={`mt-2 inline-flex items-center gap-2 text-sm font-medium ${
                  likes[id]?.liked ? "text-purple-600" : "text-gray-400"
                }`}
                onClick={() => toggleLike(id)}
              >
                {likes[id]?.liked ? "❤️" : "🤍"} Like ({likes[id]?.likeCount ?? 0})
              </button>

              {/* Comments */}
              <div className="mt-4 border-t pt-3">
                <h4 className="font-semibold mb-2">Comments</h4>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {(comments[id] || []).map(({ id: cId, comment, created_at }) => (
                    <li key={cId} className="text-sm text-gray-700">
                      {comment}{" "}
                      <span className="text-gray-400 text-xs">
                        ({new Date(created_at).toLocaleString()})
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Add Comment Form */}
                <CommentForm onSubmit={(text) => submitComment(id, text)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function CommentForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await onSubmit(text);
    setText("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 w-full">
      <input
        type="text"
        className="w-full border rounded px-2 py-1 mb-2"
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitting}
      />
      <button
        type="submit"
        className="w-full bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={submitting}
      >
        Send
      </button>
    </form>
  );
}