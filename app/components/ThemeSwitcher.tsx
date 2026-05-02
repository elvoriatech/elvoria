'use client';

import { Moon, Sun } from 'lucide-react';
import { useCallback, useLayoutEffect, useState } from 'react';

const STORAGE_KEY = 'elvoriatech:theme';

type ThemeMode = 'dark' | 'light';

function normalizeStoredId(raw: string | null): 'elvoria-dark' | 'elvoria-light' {
  if (raw === 'elvoria-light') return 'elvoria-light';
  return 'elvoria-dark';
}

function idToMode(id: ReturnType<typeof normalizeStoredId>): ThemeMode {
  return id === 'elvoria-light' ? 'light' : 'dark';
}

function modeToId(mode: ThemeMode): 'elvoria-dark' | 'elvoria-light' {
  return mode === 'light' ? 'elvoria-light' : 'elvoria-dark';
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.add('theme-elvoria');
  root.classList.toggle('dark', mode === 'dark');
}

function withThemeTransition(run: () => void) {
  const root = document.documentElement;
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    run();
    return;
  }
  root.classList.add('theme-transition');
  requestAnimationFrame(() => {
    run();
    window.setTimeout(() => root.classList.remove('theme-transition'), 260);
  });
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useLayoutEffect(() => {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'elvoria-system') {
      window.localStorage.setItem(STORAGE_KEY, 'elvoria-dark');
      raw = 'elvoria-dark';
    }
    const next = idToMode(normalizeStoredId(raw));
    setMode(next);
    applyMode(next);
  }, []);

  const toggle = useCallback(() => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    withThemeTransition(() => {
      applyMode(next);
      window.localStorage.setItem(STORAGE_KEY, modeToId(next));
      setMode(next);
    });
  }, [mode]);

  return (
    <div className="fixed bottom-4 left-4 z-70">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-800 shadow-lg backdrop-blur-md transition-[transform,box-shadow,background-color,color] duration-200 ease-out hover:bg-slate-50 hover:shadow-xl motion-safe:hover:scale-105 motion-safe:active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60 dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-100 dark:hover:bg-slate-900/90"
        aria-label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        <span
          key={mode}
          className="theme-switcher-icon-in inline-flex items-center justify-center"
          aria-hidden
        >
          {mode === 'dark' ? (
            <Sun className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Moon className="h-5 w-5" strokeWidth={2} />
          )}
        </span>
      </button>
    </div>
  );
}
