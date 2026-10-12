export const adultIdleWarningMs = 55 * 60_000;
export const adultIdleExpiryMs = 60 * 60_000;
export const sessionLifetimeMs = 24 * 60 * 60_000;
export function sessionDeadline(kind: string, created: string | Date, active: string | Date) {
  const absolute = new Date(created).getTime() + sessionLifetimeMs;
  return kind === 'learner' ? absolute : Math.min(absolute, new Date(active).getTime() + adultIdleExpiryMs);
}
