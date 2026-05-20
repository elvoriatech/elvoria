import { getProposalVersionMarkdown } from '@/lib/crmStore';

export async function loadProposalVersionMarkdown(versionId: string): Promise<string | null> {
  return getProposalVersionMarkdown(versionId);
}
