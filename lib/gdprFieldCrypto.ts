import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const KEY_LEN = 32;
const SCRYPT_SALT = 'elvoria-gdpr-field-v1';

function parseKeyMaterial(raw: string, label: string): Buffer {
  const trimmed = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }
  try {
    const b64 = Buffer.from(trimmed, 'base64');
    if (b64.length === KEY_LEN) return b64;
  } catch {
    /* fall through */
  }
  return scryptSync(trimmed, SCRYPT_SALT, KEY_LEN);
}

function encryptionKey(): Buffer {
  const raw = process.env.DATA_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error(
      'DATA_ENCRYPTION_KEY is required for GDPR field encryption (64-char hex or 44-char base64 from openssl rand -base64 32)'
    );
  }
  return parseKeyMaterial(raw, 'DATA_ENCRYPTION_KEY');
}

function lookupPepper(): Buffer {
  const raw = process.env.GDPR_LOOKUP_PEPPER?.trim() || process.env.DATA_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error('GDPR_LOOKUP_PEPPER or DATA_ENCRYPTION_KEY is required for email lookup hashes');
  }
  return parseKeyMaterial(raw, 'GDPR_LOOKUP_PEPPER');
}

/** Normalized email HMAC for indexed lookup without storing plaintext email. */
export function emailLookupHash(email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHmac('sha256', lookupPepper()).update(normalized).digest('hex');
}

export function encryptField(plaintext: string): string {
  if (!plaintext) return '';
  const key = encryptionKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64'), tag.toString('base64'), ciphertext.toString('base64')].join(':');
}

export function decryptField(payload: string): string {
  if (!payload) return '';
  const parts = payload.split(':');
  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new Error('Invalid encrypted field format');
  }
  const iv = Buffer.from(parts[1], 'base64');
  const tag = Buffer.from(parts[2], 'base64');
  const ciphertext = Buffer.from(parts[3], 'base64');
  const key = encryptionKey();
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString('utf8');
}

export function encryptJson(value: unknown): string {
  return encryptField(JSON.stringify(value));
}

export function decryptJson<T>(payload: string): T {
  return JSON.parse(decryptField(payload)) as T;
}

/** Constant-time compare for admin/session checks if needed later. */
export function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
