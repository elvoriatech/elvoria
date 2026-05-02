import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

export function conversationsDir() {
  return path.join(DATA_DIR, 'conversations');
}

export function proposalsDir() {
  return path.join(DATA_DIR, 'proposals');
}

export function conversationPath(conversationId: string) {
  return path.join(conversationsDir(), `${conversationId}.json`);
}

export function proposalPdfPath(versionId: string) {
  return path.join(proposalsDir(), `${versionId}.pdf`);
}

