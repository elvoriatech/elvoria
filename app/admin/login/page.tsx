'use client';

import Image from 'next/image';
import Link from 'next/link';
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
    'w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="admin-login-panel w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-xl ring-1 ring-border/50">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/" className="shrink-0 rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Image src="/elvoria.png" alt="Elvoria Technologies" width={48} height={48} className="h-12 w-12 rounded-lg" priority />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin sign in</h1>
            <p className="text-xs text-muted-foreground">
              <Link href="/" className="text-[#06B6D4] hover:underline">
                ← Back to site
              </Link>
            </p>
          </div>
        </div>
        <p className="admin-login-intro text-sm leading-relaxed text-muted-foreground">
          Email and password are required to sign in.
        </p>
        <form onSubmit={onSubmit} className="admin-login-form mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-foreground">
              Email <span className="text-destructive">*</span>
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
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-foreground">
              Password <span className="text-destructive">*</span>
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
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-linear-to-r from-[#06B6D4] to-[#3B82F6] py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
