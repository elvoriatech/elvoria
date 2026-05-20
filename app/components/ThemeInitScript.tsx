'use client';

/**
 * Apply saved theme before paint (SSR only). On the client we render nothing so React 19
 * does not warn about <script> in the component tree.
 */
export function ThemeInitScript() {
  if (typeof window !== 'undefined') return null;
  return <script src="/theme-init.js" suppressHydrationWarning />;
}
