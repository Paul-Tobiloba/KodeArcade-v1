import { eq, and, gt } from 'drizzle-orm';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import { session } from './db/schema.js';
import { adultIdleExpiryMs, sessionDeadline, sessionLifetimeMs } from '../shared/session-policy.js';

type Actor = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;
export function expiredSession(actor: Actor, now = Date.now()) {
  return now >= Math.min(new Date(actor.session.expiresAt).getTime(), sessionDeadline(actor.user.principalKind, actor.session.createdAt, actor.session.updatedAt));
}
export function sessionView(actor: Actor) {
  return { user: { id: actor.user.id, name: actor.user.name, principalKind: actor.user.principalKind }, sessionKey: actor.session.id,
    lastActiveAt: new Date(actor.session.updatedAt).getTime(), expiresAt: Math.min(new Date(actor.session.expiresAt).getTime(), sessionDeadline(actor.user.principalKind, actor.session.createdAt, actor.session.updatedAt)) };
}
export async function recordActivity(db: Database, actor: Actor) {
  const now = new Date();
  // An activity request must never resurrect a grant already removed by another tab.
  const rows = await db.update(session).set({ updatedAt: now }).where(and(eq(session.id, actor.session.id), gt(session.expiresAt, now), gt(session.createdAt, new Date(now.getTime() - sessionLifetimeMs)), gt(session.updatedAt, new Date(now.getTime() - adultIdleExpiryMs)))).returning({ id: session.id });
  return rows.length > 0;
}
