"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import DevotionalGoals from "@/components/DevotionalGoals";
import { useUser } from "@/context/UserContext";

const avatarOptions: Record<string, string> = {
  lamb: "/lamb.jpg",
  bread: "/bread.jpg",
  dove: "/dove.jpg",
};

const avatars = Object.entries(avatarOptions).map(([key, url]) => ({
  label: key.charAt(0).toUpperCase() + key.slice(1),
  value: key,
  url,
}));

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const { avatar, setAvatar, name, setName } = useUser();
  const [localName, setLocalName] = useState(name || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user) {
      setLocalName(session.user.name || name || "");
      if (!avatar) setAvatar(session.user.avatar || "lamb");
    }
  }, [session, avatar, name, setAvatar]);

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: localName, avatar }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Name updated successfully!");
        setName(localName);
        await update?.();
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage(data.error || "Failed to update name.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An unexpected error occurred.");
    }
  }

  const handleAvatarChange = (newAvatar: string) => {
    setAvatar(newAvatar);
    fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: localName, avatar: newAvatar }),
    })
      .then((res) => res.ok && setMessage("Avatar updated successfully!"))
      .catch(() => setMessage("Failed to update avatar."));
    setTimeout(() => setMessage(""), 2000);
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>Please log in to view your profile.</p>;

  return (
    <main className="max-w-md mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center tracking-tight">Your Profile</h1>

      {/* Name Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg rounded-2xl p-6 border border-purple-100 transition-all hover:shadow-2xl">
        <form onSubmit={handleNameSubmit} className="space-y-3">
          <label className="block text-gray-700 font-medium">
            Name
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              required
              className="mt-2 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-sm"
            />
          </label>
          <button
            type="submit"
            className="w-full py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all shadow-md"
          >
            Update Name
          </button>
          {message && <p className="text-green-600 text-center mt-2 font-medium">{message}</p>}
        </form>
      </div>

      {/* Avatar Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg rounded-2xl p-6 border border-purple-100 transition-all hover:shadow-2xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 tracking-wide">Choose Avatar</h2>
        <div className="flex overflow-x-auto gap-4 py-2">
          {avatars.map(({ label, value, url }) => (
            <div
              key={value}
              onClick={() => handleAvatarChange(value)}
              className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                avatar === value
                  ? "border-2 border-purple-600 shadow-lg"
                  : "border border-transparent hover:shadow-md"
              }`}
            >
              <Image src={url} alt={label} width={64} height={64} className="rounded-full" />
              <span className="mt-2 text-sm font-medium text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
