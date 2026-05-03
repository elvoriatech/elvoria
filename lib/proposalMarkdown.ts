import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, proposalsDir } from '@/lib/localStore';
import { getLogEntryByVersionId } from '@/lib/proposalFinalizeLog';

export type StoredProposalVersion = {
  id: string;
  conversationId: string;
  markdown: string;
};

function versionsFilePath(conversationId: string) {
  return path.join(proposalsDir(), `${conversationId}.versions.json`);
}

/** Resolve proposal markdown for a version id (finalize log → versions file, or scan). */
export async function loadProposalVersionMarkdown(versionId: string): Promise<string | null> {
  const log = await getLogEntryByVersionId(versionId);
  const tryConversation = async (conversationId: string) => {
    const list = await readJson<StoredProposalVersion[]>(versionsFilePath(conversationId), []);
    const v = list.find((row) => row.id === versionId);
    return v?.markdown ?? null;
  };

  if (log?.conversationId) {
    const md = await tryConversation(log.conversationId);
    if (md) return md;
  }

  try {
    const names = await fs.readdir(proposalsDir());
    for (const name of names) {
      if (!name.endsWith('.versions.json')) continue;
      const conversationId = name.replace(/\.versions\.json$/u, '');
      const md = await tryConversation(conversationId);
      if (md) return md;
    }
  } catch {
    return null;
  }
  return null;
}
