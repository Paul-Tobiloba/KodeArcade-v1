import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';

const origin = 'https://learn.example.com';
const handler = vi.fn(async () => Response.json({ session: null }));
const app = createApp({ handler }, { APP_ORIGIN: origin });

describe('foundation API boundary', () => {
  it('has a cache-free health response with security headers', async () => {
    const response = await app.request('/api/health');
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(await response.json()).toEqual({ status: 'ok', phase: 'foundation' });
  });
  it.each(['/sign-up/email', '/sign-in/email', '/sign-in/username', '/update-user', '/change-password', '/request-password-reset', '/is-username-available', '/two-factor/disable'])('blocks unimplemented auth route %s', async path => {
    expect((await app.request(`/api/auth${path}`, { method: 'POST', headers: { Origin: origin } })).status).toBe(404);
  });
  it('only delegates session lookup and same-origin sign-out', async () => {
    expect((await app.request('/api/auth/get-session')).status).toBe(200);
    expect((await app.request('/api/auth/sign-out', { method: 'POST', headers: { Origin: origin } })).status).toBe(200);
  });
  it.each([undefined, 'https://attacker.example', 'null'])('rejects mutation origin %s', async Origin => {
    expect((await app.request('/api/auth/sign-out', { method: 'POST', headers: Origin ? { Origin } : {} })).status).toBe(403);
  });
  it('rejects cross-site fetch metadata even with matching Origin', async () => {
    expect((await app.request('/api/auth/sign-out', { method: 'POST', headers: { Origin: origin, 'Sec-Fetch-Site': 'cross-site' } })).status).toBe(403);
  });
  it('limits request bodies', async () => {
    expect((await app.request('/api/auth/sign-out', { method: 'POST', headers: { Origin: origin }, body: 'x'.repeat(17 * 1024) })).status).toBe(413);
  });
  it('does not expose exception contents', async () => {
    const failing = createApp({ handler: async () => { throw new Error('sensitive database URL'); } }, { APP_ORIGIN: origin });
    const response = await failing.request('/api/auth/get-session');
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('sensitive');
  });
});
