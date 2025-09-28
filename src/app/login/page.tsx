'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

const avatarMap: Record<string, string> = {
  lamb: '/lamb.jpg',
  bread: '/bread.jpg',
  dove: '/dove.jpg',
};

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const { data: session, update: updateSession } = useSession();
  const { avatar, setAvatar, name, setName } = useUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setMessage(res.error);
    } else {
      // Update context and refresh session
      if (session?.user) {
        setName(session.user.name || 'Friend');
        setAvatar(session.user.avatar || 'lamb');
      }
      await updateSession?.(); // refresh session from server
      setMessage('Login successful!');
      setForm({ email: '', password: '' });
    }
  }

  // If session exists, show welcome message with avatar from context
  if (session?.user) {
    return (
      <main
        style={{
          maxWidth: 400,
          margin: 'auto',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 10px rgba(128, 90, 213, 0.2)',
          background: 'white',
          fontFamily: "'Geist Sans', sans-serif",
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: '#805ad5',
            marginBottom: 24,
            fontWeight: '700',
            fontSize: '2rem',
          }}
        >
          Welcome back, {name || 'Friend'}!
        </h1>

        {avatar && (
          <img
            src={avatarMap[avatar] || '/avatars/default.png'}
            alt="Avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              margin: '0 auto 16px', // centers image
              display: 'block',
            }}
          />
        )}

        <p style={{ fontSize: 16, color: '#555', marginBottom: 16 }}>
          You’re logged in and ready to continue.
        </p>

        <p style={{ fontSize: 14 }}>
          To edit your profile, go to{' '}
          <Link href="/profile" style={{ color: '#805ad5', textDecoration: 'underline' }}>
            profile
          </Link>
        </p>
      </main>
    );
  }

  // Default login form
  return (
    <main
      style={{
        maxWidth: 400,
        margin: 'auto',
        padding: 24,
        borderRadius: 12,
        boxShadow: '0 4px 10px rgba(128, 90, 213, 0.2)',
        background: 'white',
        fontFamily: "'Geist Sans', sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          color: '#805ad5',
          marginBottom: 24,
          fontWeight: '700',
          fontSize: '2rem',
        }}
      >
        Welcome Back!
      </h1>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{
              width: '100%',
              padding: 10,
              marginTop: 6,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16,
            }}
            placeholder="your@email.com"
          />
        </label>

        <label style={{ display: 'block', marginBottom: 20, fontWeight: 600 }}>
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{
              width: '100%',
              padding: 10,
              marginTop: 6,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16,
            }}
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: 14,
            backgroundColor: '#805ad5',
            color: 'white',
            fontWeight: '700',
            fontSize: 18,
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#6b46c1';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#805ad5';
          }}
        >
          Log In
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: 16,
            textAlign: 'center',
            color: message.includes('successful') ? 'green' : 'red',
            fontWeight: 600,
          }}
        >
          {message}
        </p>
      )}

      <p
        style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 14,
          color: '#666',
        }}
      >
        Don’t have an account?{' '}
        <Link
          href="/signup"
          style={{
            color: '#15023fff',
            textDecoration: 'underline',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign Up
        </Link>
      </p>
    </main>
  );
}
