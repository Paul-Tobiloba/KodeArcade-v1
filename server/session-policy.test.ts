import { describe, expect, it } from 'vitest';
import type { Auth } from './auth.js';
import { expiredSession, sessionView } from './session-policy.js';
import { sessionDeadline } from '../shared/session-policy.js';
type Actor = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;
describe('session time policy', () => {
  it('keeps learners for 24 hours regardless of idle time, but never slides the absolute deadline', () => {
    const created = new Date('2026-10-12T10:00:00Z');
    expect(sessionDeadline('learner', created, created)).toBe(created.getTime() + 24 * 3600_000);
    expect(sessionDeadline('learner', created, new Date(created.getTime() + 23 * 3600_000))).toBe(created.getTime() + 24 * 3600_000);
    expect(sessionDeadline('adult', created, created)).toBe(created.getTime() + 3600_000);
    const actor = { user: { id: 'synthetic', name: 'Learner', principalKind: 'learner' }, session: { id: 'opaque', createdAt: created, updatedAt: created, expiresAt: new Date(created.getTime() + 48 * 3600_000), token: 'never-expose' } } as Actor;
    expect(expiredSession(actor, created.getTime() + 23.99 * 3600_000)).toBe(false);
    expect(expiredSession(actor, created.getTime() + 24 * 3600_000)).toBe(true);
    expect(JSON.stringify(sessionView(actor))).not.toContain('never-expose');
  });
});
