import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import { consumeLoginBudget, throttleKey } from './security/login-throttle.js';
import { pictureIds } from '../shared/pictures.js';
import { credentialWords } from './credential-words.js';

export { curriculumVersion as CURRICULUM_VERSION } from '../shared/progress.js';
export const assignedCourseKeys = ['grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'] as const;
export function randomCode(length: number) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join('');
}
export function generateCredential(method: 'picture' | 'text') {
  return method === 'text' ? Array.from({ length: 3 }, () => credentialWords[randomInt(credentialWords.length)]).join(' ') : Array.from({ length: 4 }, () => pictureIds[randomInt(pictureIds.length)]);
}
export function usernameBases(displayName: string) {
  const parts = displayName.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').split(/\s+/).map(part => part.replace(/[^a-z]/g, '')).filter(Boolean);
  const first = (parts[0] || 'student').slice(0, 40);
  return [first, (first + parts.slice(1).join('')).slice(0, 50)];
}
export function credentialPassword(secret: string, method: string, value: string | readonly string[]) {
  // Domain separation makes the low-entropy picture sequence unusable in other auth paths.
  // Keep previously issued 12-character credentials working; phrases ignore casing
  // and accidental extra spaces. Canonicalize only here, identically on issue/login.
  const normalized = method === 'text' && typeof value === 'string' ? (/^[a-z2-9]{12}$/i.test(value.trim()) ? value.trim().toUpperCase() : value.trim().toLowerCase().replace(/\s+/g, ' ')) : value;
  return createHmac('sha256', secret).update(JSON.stringify(['classroom-v1', method, normalized])).digest('base64url');
}
export async function budget(db: Database, secret: string, scope: string, identifier: string, limit: number, seconds: number) {
  return (await consumeLoginBudget(db, throttleKey(secret, scope, identifier), limit, seconds)).allowed;
}
export type AdultSession = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;
export const stepCookie = 'kodearcade_management';
export function stepGrant(secret: string, sessionId: string, expires = Date.now() + 5 * 60_000) {
  const payload = `${sessionId}:${expires}`;
  return `${expires}.${createHmac('sha256', secret).update(payload).digest('hex')}`;
}
export function validStepGrant(secret: string, sessionId: string, grant = '') {
  const [expires, signature] = grant.split('.');
  if (!/^\d{13}$/.test(expires ?? '') || !/^[a-f0-9]{64}$/.test(signature ?? '')) return false;
  const time = Number(expires);
  if (time <= Date.now() || time > Date.now() + 5 * 60_000) return false;
  const expected = stepGrant(secret, sessionId, time).split('.')[1];
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
