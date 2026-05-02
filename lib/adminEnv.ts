/** Admin dashboard credentials (set in `.env.local`). Supports common casing variants. */
export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || process.env.Admin_Email || '').trim();
}

export function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || process.env.Admin_Password || '').trim();
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminEmail() && getAdminPassword());
}
