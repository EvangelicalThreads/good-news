'use client';

import { useState } from 'react';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Signup successful! You can now login.');
      setForm({ name: '', email: '', password: '' });
    } else {
      setMessage(data.error || 'Signup failed.');
    }
  }

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
        Create an Account
      </h1>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              width: '100%',
              padding: 10,
              marginTop: 6,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16,
            }}
            placeholder="Your name"
          />
        </label>

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
            placeholder="you@example.com"
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
          Sign Up
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
    </main>
  );
}
