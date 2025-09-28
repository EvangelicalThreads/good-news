'use client';

import { useEffect, useState } from 'react';

interface NicheTag {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name?: string | null;
}

interface Reflection {
  id: string;
  text: string;
  created_at: string;
  user: User;
  mood: string | null;
  niche_tags: NicheTag[];
}

interface ReflectionComment {
  id: string;
  comment: string;
  created_at: string;
  user: User;
  reflection: {
    id: string;
    text: string;
  };
}

export default function AdminModerationPage() {
  const [pendingReflections, setPendingReflections] = useState<Reflection[]>([]);
  const [pendingComments, setPendingComments] = useState<ReflectionComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  async function fetchPendingItems() {
    setLoading(true);
    try {
      const reflectionsRes = await fetch('/api/admin/pending-reflections');
      const reflectionsData: Reflection[] = await reflectionsRes.json();

      const commentsRes = await fetch('/api/admin/pending-comments');
      const commentsData: ReflectionComment[] = await commentsRes.json();

      setPendingReflections(reflectionsData);
      setPendingComments(commentsData);
    } catch (err) {
      console.error('Failed to fetch pending items', err);
    }
    setLoading(false);
  }

  async function handleAction(
    type: 'reflection' | 'comment',
    id: string,
    action: 'approve' | 'reject',
  ) {
    try {
      const url =
        type === 'reflection'
          ? `/api/reflections/${id}/${action}`
          : `/api/reflection_comments/${id}/${action}`;

      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to update status');
      fetchPendingItems(); // Refresh the list
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading pending items...</p>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pt-12 pb-20">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Moderation</h1>

      {/* Pending Reflections */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pending Reflections</h2>
        {pendingReflections.length === 0 ? (
          <p className="text-gray-400">No pending reflections.</p>
        ) : (
          <ul className="space-y-6">
            {pendingReflections.map((r) => (
              <li key={r.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">{r.text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  By {r.user.name || r.user.email} • {new Date(r.created_at).toLocaleString()}
                </p>
                {r.mood && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    {r.mood}
                  </span>
                )}
                {r.niche_tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.niche_tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleAction('reflection', r.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleAction('reflection', r.id, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pending Comments */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Pending Comments</h2>
        {pendingComments.length === 0 ? (
          <p className="text-gray-400">No pending comments.</p>
        ) : (
          <ul className="space-y-6">
            {pendingComments.map((c) => (
              <li key={c.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">{c.comment}</p>
                <p className="text-sm text-gray-500 mt-1">
                  By {c.user.name || c.user.email} on reflection: "{c.reflection.text}"
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleAction('comment', c.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleAction('comment', c.id, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
