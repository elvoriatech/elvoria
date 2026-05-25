import { CAMPAIGN_RECIPIENT_SELECTION_KEY } from '@/lib/emailMarketing/constants';

export function loadStoredRecipientSelection(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(CAMPAIGN_RECIPIENT_SELECTION_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

export function saveStoredRecipientSelection(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CAMPAIGN_RECIPIENT_SELECTION_KEY, JSON.stringify([...ids]));
}

export function clearStoredRecipientSelection(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CAMPAIGN_RECIPIENT_SELECTION_KEY);
}
