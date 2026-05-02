import { createHmac, timingSafeEqual } from 'node:crypto';

function requiredEnv(name: string) {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(
      `${name} is not set (or is empty). Add a long random string to .env.local, e.g. PDF_TOKEN_SECRET=$(openssl rand -hex 32)`
    );
  }
  return v;
}

export function signDownloadToken(versionId: string) {
  const secret = requiredEnv('PDF_TOKEN_SECRET');
  const mac = createHmac('sha256', secret).update(versionId).digest('hex');
  return mac;
}

export function verifyDownloadToken(versionId: string, token: string) {
  try {
    const expected = signDownloadToken(versionId);
    const a = Buffer.from(expected);
    const b = Buffer.from(token || '');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

