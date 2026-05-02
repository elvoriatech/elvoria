'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) throw new Error('Empty response');
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON');
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const data = (await readJsonBody(res)) as { error?: string };
      if (!res.ok) {
        setError(data?.error || 'Login failed');
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-shadow ' +
    'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 ' +
    'focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/35 ' +
    'dark:border-white/15 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 ' +
    'dark:focus:border-cyan-400 dark:focus:ring-cyan-400/30';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-background">
      <div className="admin-login-panel w-full max-w-md rounded-2xl border border-slate-300 bg-white p-8 shadow-xl dark:border-slate-600 dark:bg-slate-900 dark:shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tight">Admin sign in</h1>
        <p className="admin-login-intro mt-2 text-sm leading-relaxed">
          Email and password are required to sign in.
        </p>
        <form onSubmit={onSubmit} className="admin-login-form mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold">
              Email <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold">
              Password <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={1}
              aria-required="true"
              className={inputClass}
            />
          </div>
          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 dark:from-(--brand-accent) dark:to-(--brand-primary) dark:hover:opacity-95"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
