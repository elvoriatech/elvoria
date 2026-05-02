import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getAdminEmail, getAdminPassword } from '@/lib/adminEnv';

export const ADMIN_SESSION_COOKIE = 'elvoria_admin_session';

function sessionSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  const email = getAdminEmail();
  const pass = getAdminPassword();
  if (!email || !pass) return '';
  return createHash('sha256').update(`${email}|${pass}`, 'utf8').digest('hex');
}

/** 7-day signed session token (HMAC). */
export function signAdminSession(): string {
  const secret = sessionSecret();
  if (!secret) return '';
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payload = JSON.stringify({ exp, v: 1 });
  const b64 = Buffer.from(payload, 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = sessionSecret();
  if (!secret) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!b64 || !sig) return false;
  const expectedSig = createHmac('sha256', secret).update(b64).digest('base64url');
  try {
    if (expectedSig.length !== sig.length) return false;
    if (!timingSafeEqual(Buffer.from(expectedSig, 'utf8'), Buffer.from(sig, 'utf8'))) return false;
  } catch {
    return false;
  }
  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

/** Constant-time enough comparison for login (same length check first). */
export function adminCredentialsMatch(email: string, password: string): boolean {
  const wantE = normalizeEmail(getAdminEmail());
  const wantP = getAdminPassword();
  const gotE = normalizeEmail(email);
  const gotP = password;
  if (!wantE || !wantP) return false;
  if (gotE.length !== wantE.length || gotP.length !== wantP.length) return false;
  try {
    return (
      timingSafeEqual(Buffer.from(gotE, 'utf8'), Buffer.from(wantE, 'utf8')) &&
      timingSafeEqual(Buffer.from(gotP, 'utf8'), Buffer.from(wantP, 'utf8'))
    );
  } catch {
    return false;
  }
}
