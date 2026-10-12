import { Hono } from 'hono';
import { z } from 'zod';
import type { Auth } from './auth.js';
import type { Database } from './db/client.js';
import { consumeLoginBudget, throttleKey } from './security/login-throttle.js';
import { byteTopics, byteQuestionAllowed, byteAnswerAllowed, byteRedirect } from '../shared/byte.js';

export type BytePilotConfig = Readonly<{ url: string; token: string; testers: readonly string[] }>;
/** Deliberately development-only: no environment flag enables learner AI access. */
export function loadBytePilotConfig(env: NodeJS.ProcessEnv): BytePilotConfig | undefined {
  if (env.BYTE_PILOT_ENABLED !== 'true') return undefined;
  if (env.NODE_ENV === 'production') throw new Error('Byte pilot is development-only');
  const url = new URL(env.BYTE_GATEWAY_URL ?? '');
  if (!['http:', 'https:'].includes(url.protocol) || (url.protocol === 'http:' && !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Invalid Byte gateway origin');
  const token = env.BYTE_GATEWAY_TOKEN ?? '';
  const testers = (env.BYTE_PILOT_ADULT_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean);
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(token) || /REPLACE|EXAMPLE/i.test(token) || !testers.length || testers.length > 20 || testers.some(id => !/^[A-Za-z0-9_-]{1,100}$/.test(id))) throw new Error('Invalid Byte pilot credentials');
  return Object.freeze({ url: new URL('/byte/generate', url).href, token, testers: Object.freeze(testers) });
}

export async function boundedJSON(response: Response, maxBytes = 8192): Promise<unknown> {
  if (!response.ok || !response.body || Number(response.headers.get('content-length') ?? 0) > maxBytes) { await response.body?.cancel(); throw new Error('Byte unavailable'); }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > maxBytes) throw new Error('Byte response too large'); chunks.push(value); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
const inputSchema = z.object({ topic: z.enum(['sequences', 'directions', 'loops', 'conditionals', 'debugging', 'variables', 'project', 'drawing']), question: z.string().trim().min(8).max(300) }).strict();
const outputSchema = z.object({ inScope: z.boolean(), answer: z.string().max(900) }).strict();
export function createByteRoutes(auth: Auth, db: Database, secret: string, pilot?: BytePilotConfig, request: typeof fetch = fetch) {
  const app = new Hono();
  app.use('*', async (c, next) => {
    const actor = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!actor) return c.json({ error: 'Sign in to continue' }, 401);
    if (actor.user.principalKind !== 'adult' || !actor.user.emailVerified) return c.json({ error: 'Verified adult account required' }, 403);
    if (c.req.method === 'GET' && c.req.path.endsWith('/pilot')) return c.json({ enabled: Boolean(pilot), allowed: Boolean(pilot?.testers.includes(actor.user.id)) });
    if (c.req.method !== 'POST') return c.json({ error: 'Not found' }, 404);
    if (!pilot?.testers.includes(actor.user.id)) return c.json({ error: 'Private AI testing is not enabled for this account' }, 403);
    const budget = await consumeLoginBudget(db, throttleKey(secret, 'byte-adult', actor.user.id), 5, 60);
    if (!budget.allowed) { c.header('Retry-After', String(budget.retryAfterSeconds)); return c.json({ error: 'Please wait before testing another question' }, 429); }
    await next();
  });
  app.post('/pilot', async c => {
    const input = inputSchema.safeParse(await c.req.json().catch(() => null));
    if (!input.success) return c.json({ error: 'Choose a coding topic and a short question' }, 400);
    if (!byteQuestionAllowed(input.data.question)) return c.json({ kind: 'redirect', answer: byteRedirect });
    const budget = await consumeLoginBudget(db, throttleKey(secret, 'byte-global', 'pilot'), 40, 3600);
    if (!budget.allowed) return c.json({ error: 'The private lab has reached its testing limit' }, 429);
    // Only authored context and the adult's question cross this boundary. No code,
    // learner identity, saved progress, route solutions, history or client prompts.
    try {
      const response = await request(pilot!.url, { method: 'POST', redirect: 'error', signal: AbortSignal.any([c.req.raw.signal, AbortSignal.timeout(45_000)]), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pilot!.token}` }, body: JSON.stringify({ topic: input.data.topic, context: byteTopics[input.data.topic], question: input.data.question }) });
      const output = outputSchema.safeParse(await boundedJSON(response));
      if (!output.success || !output.data.inScope || !byteAnswerAllowed(output.data.answer)) return c.json({ kind: 'blocked', answer: byteRedirect });
      return c.json({ kind: 'answer', answer: output.data.answer });
    } catch { return c.json({ error: 'Byte could not answer. Try again later; your work is unchanged.' }, 503); }
  });
  return app;
}
