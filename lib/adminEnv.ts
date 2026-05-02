/**
 * Admin dashboard credentials (set in `.env.local`). Supports common casing variants.
 *
 * Next.js expands `$VAR` in env values (dotenv-expand). For a literal `$` in a password, use a
 * backslash in `.env.local`, e.g. `pa\$ss` is read as `pa$ss`.
 */
export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || process.env.Admin_Email || '').trim();
}

export function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || process.env.Admin_Password || '').trim();
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminEmail() && getAdminPassword());
}
