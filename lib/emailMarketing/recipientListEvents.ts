/** Fired after campaign send / recipient CRUD so all admin tabs reload lists. */
export const RECIPIENTS_CHANGED_EVENT = 'elvoria:recipients-changed';

export function notifyRecipientsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(RECIPIENTS_CHANGED_EVENT));
  }
}
