// Student drafts remain memory-only on the device; a scoped cloud controller syncs them.
// They never read/import the shared computer's public-preview localStorage.
let context = '';
const drafts = new Map<string, string>();
const listeners = new Set<() => void>();
export function studentDrafts() { return Object.fromEntries(drafts); }
export function hydrateStudentDrafts(entries: Record<string, string>) { drafts.clear(); for (const [key, value] of Object.entries(entries)) drafts.set(key, value); }
export function subscribeStudentDrafts(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function activateStudentStorage(identity: string) {
  if (identity !== context) drafts.clear();
  context = identity;
}
export function clearStudentStorage() { context = ''; drafts.clear(); }
const studentRoute = () => typeof location !== 'undefined' && location.hash.startsWith('#/student-play/');
export const activityStorage = {
  getItem(key: string): string | null { return studentRoute() ? context ? drafts.get(key) ?? null : null : localStorage.getItem(key); },
  setItem(key: string, value: string) { if (studentRoute()) { if (context && drafts.get(key) !== value) { drafts.set(key, value); listeners.forEach(listener => listener()); } } else localStorage.setItem(key, value); },
  removeItem(key: string) { if (studentRoute()) { drafts.delete(key); listeners.forEach(listener => listener()); } else localStorage.removeItem(key); },
};
