import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountError, accountErrorMessage, accountRequest, accountRoute, callbackParameter } from './account-api';
afterEach(() => vi.unstubAllGlobals());
describe('account routing and API boundary', () => {
  it('keeps public learning separate from account routes', () => {
    expect(accountRoute('#/learn/grade-6')).toBeUndefined();
    expect(accountRoute('#/learners')).toBe('learners');
    expect(accountRoute('#/adult-login?role=teacher')).toBe('adult-login');
    expect(accountRoute('#/not-a-route')).toBeUndefined();
  });
  it('reads recovery callbacks in both supported URL positions', () => {
    expect(callbackParameter('?token=before', '#/reset-password', 'token')).toBe('before');
    expect(callbackParameter('', '#/reset-password?token=after', 'token')).toBe('after');
    expect(callbackParameter('', '#/reset-password', 'token')).toBeNull();
  });
  it('uses same-origin, cache-free credentials and never exposes raw server errors', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ code: 'EMAIL_NOT_VERIFIED', message: 'provider-secret' }, { status: 403 }));
    vi.stubGlobal('fetch', fetch);
    const error = await accountRequest('auth/sign-in/email', { email: 'test@example.com', password: 'synthetic' }).catch(e => e);
    expect(fetch).toHaveBeenCalledWith('/api/auth/sign-in/email', expect.objectContaining({ method: 'POST', credentials: 'same-origin', cache: 'no-store', redirect: 'error' }));
    expect(accountErrorMessage(error)).toContain('Verify your email');
    expect(accountErrorMessage(error)).not.toContain('provider-secret');
  });
  it('handles unavailable API and throttling without leaking details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sensitive internal URL')));
    await expect(accountRequest('account/')).rejects.toMatchObject({ status: 0 });
    expect(accountErrorMessage(new AccountError(429, 'LIMIT'))).toContain('wait');
    expect(accountErrorMessage(new AccountError(500, 'secret'))).not.toContain('secret');
  });
});
