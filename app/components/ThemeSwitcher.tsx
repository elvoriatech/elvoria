'use client';

import { Settings2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type ThemeChoice = {
  id: string;
  label: string;
  htmlClasses: string[];
};

const STORAGE_KEY = 'elvoriatech:theme';

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
  // Ensure the class is applied before we mutate tokens/classes.
  requestAnimationFrame(() => {
    run();
    window.setTimeout(() => root.classList.remove('theme-transition'), 260);
  });
}

function applyHtmlClasses(theme: ThemeChoice) {
  const el = document.documentElement;
  // Keep font variables and other existing classes; only manage theme classes.
  const managed = new Set(['dark', 'theme-elvoria']);
  el.classList.forEach((c) => {
    if (managed.has(c)) el.classList.remove(c);
  });
  theme.htmlClasses.forEach((c) => el.classList.add(c));
}

export function ThemeSwitcher() {
  const themes = useMemo<ThemeChoice[]>(
    () => [
      { id: 'elvoria-system', label: 'Elvoria (System)', htmlClasses: ['theme-elvoria'] },
      { id: 'elvoria-dark', label: 'Elvoria (Dark)', htmlClasses: ['theme-elvoria', 'dark'] },
      { id: 'elvoria-light', label: 'Elvoria (Light)', htmlClasses: ['theme-elvoria'] },
    ],
    []
  );

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('elvoria-dark');
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initial = themes.find((t) => t.id === saved) ?? themes[0]!;
    setActiveId(initial.id);
    applyHtmlClasses(initial);
  }, [themes]);

  useEffect(() => {
    if (activeId !== 'elvoria-system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const t = themes.find((x) => x.id === 'elvoria-system');
      if (!t) return;
      applyHtmlClasses(t);
      document.documentElement.classList.toggle('dark', media.matches);
    };
    apply();
    media.addEventListener?.('change', apply);
    return () => media.removeEventListener?.('change', apply);
  }, [activeId, themes]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node | null;
      if (panelRef.current && target && !panelRef.current.contains(target)) setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  function setTheme(id: string) {
    const t = themes.find((x) => x.id === id);
    if (!t) return;
    setActiveId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
    withThemeTransition(() => {
      applyHtmlClasses(t);
      if (id === 'elvoria-system') {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        document.documentElement.classList.toggle('dark', media.matches);
      }
    });
  }

  return (
    <div className="fixed right-4 bottom-4 z-70">
      <div ref={panelRef}>
        {open && (
          <div className="mb-3 w-[280px] rounded-2xl border border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="text-sm font-semibold text-foreground">Theme</div>
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                onClick={() => setOpen(false)}
                aria-label="Close theme menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={[
                    'w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    'hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60',
                    activeId === t.id ? 'bg-foreground/5 text-foreground' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  <span className="text-sm font-medium">{t.label}</span>
                  {activeId === t.id && (
                    <span className="text-xs text-muted-foreground">Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/65 shadow-lg hover:bg-foreground/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary)/60"
          aria-label="Theme settings"
          aria-expanded={open}
        >
          <Settings2 className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </div>
  );
}

