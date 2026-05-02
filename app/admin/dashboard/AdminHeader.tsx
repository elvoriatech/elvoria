'use client';

export function AdminHeader() {
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-border dark:bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-foreground">Admin dashboard</h1>
          <p className="text-xs text-slate-600 dark:text-muted-foreground">Proposal PDF queue and support leads</p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:border-border dark:bg-transparent dark:text-foreground dark:hover:bg-muted/60"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
