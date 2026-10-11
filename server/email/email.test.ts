import { describe, expect, it, vi } from 'vitest';
import { loadEmailConfig, type EmailConfig } from './config.js';
import { createResendMailer, type EmailMessage } from './mailer.js';
import { createAuthEmailSender } from './auth-email.js';

const env = {
  NODE_ENV: 'test', RESEND_API_KEY: 're_synthetic_test_key_only',
  EMAIL_FROM: 'KodeArcade <onboarding@resend.dev>', EMAIL_TEST_RECIPIENT: 'adult@example.com',
};
const config = loadEmailConfig(env)!;
const message: EmailMessage = { to: 'adult@example.com', subject: 'Synthetic test', html: '<p>Test</p>', text: 'Test', eventId: 'test-event' };
const accepted = () => Response.json({ id: 'synthetic-message-id' });
const origin = 'https://learn.example.com';

describe('server-only email configuration', () => {
  it('is optional or explicitly disabled', () => {
    expect(loadEmailConfig({})).toBeUndefined();
    expect(loadEmailConfig({ ...env, EMAIL_DELIVERY_MODE: 'disabled' })).toBeUndefined();
    expect(Object.isFrozen(config)).toBe(true);
  });
  it.each([
    { RESEND_API_KEY: 'REPLACE_KEY' }, { EMAIL_FROM: 'bad\r\nBcc: injected@example.com' },
    { EMAIL_FROM: 'Name <person@example.com>, other@example.com' },
    { EMAIL_TEST_RECIPIENT: 'not an email' }, { EMAIL_DELIVERY_MODE: 'unexpected' },
    { EMAIL_FROM: 'person@example.invalid' }, { NODE_ENV: 'production' },
    { EMAIL_DELIVERY_MODE: 'production' },
    { NODE_ENV: 'production', EMAIL_DELIVERY_MODE: 'production' },
  ])('rejects unsafe configuration without echoing values (%j)', change => {
    expect(() => loadEmailConfig({ ...env, ...change })).toThrow();
  });
  it('requires an explicit production mode and custom sender', () => {
    expect(loadEmailConfig({ ...env, NODE_ENV: 'production', EMAIL_DELIVERY_MODE: 'production', EMAIL_FROM: 'KodeArcade <accounts@school.example>', EMAIL_TEST_RECIPIENT: '' })?.mode).toBe('production');
  });
});

describe('Resend transport', () => {
  it('sends HTML and text to the specified allowed inbox with a finite timeout', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(accepted());
    await createResendMailer(config, { fetch: request }).send(message);
    expect(request).toHaveBeenCalledOnce();
    const [url, options] = request.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options?.redirect).toBe('error');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(options!.body as string)).toMatchObject({ to: ['adult@example.com'], text: 'Test', html: '<p>Test</p>' });
    const headers = options!.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toMatch(/^kodearcade-[a-f0-9]{64}$/);
  });
  it('blocks other recipients, internal learner addresses and unconfigured inboxes before any request', async () => {
    const request = vi.fn<typeof fetch>();
    const mailer = createResendMailer(config, { fetch: request });
    await expect(mailer.send({ ...message, to: 'another@example.com' })).rejects.toThrow('unavailable');
    await expect(mailer.send({ ...message, to: 'pupil@learners.example.invalid' })).rejects.toThrow('unavailable');
    await expect(createResendMailer({ ...config, testRecipient: undefined }, { fetch: request }).send(message)).rejects.toThrow('unavailable');
    await expect(createResendMailer({ ...config, mode: 'production' }, { fetch: request }).send({ ...message, to: 'pupil@invalid' })).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });
  it('reuses the same payload and opaque idempotency key after transient HTTP and network failures', async () => {
    const request = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error('sensitive transport detail')).mockResolvedValueOnce(new Response('sensitive provider detail', { status: 503 })).mockResolvedValueOnce(accepted());
    const wait = vi.fn().mockResolvedValue(undefined);
    await createResendMailer(config, { fetch: request, wait }).send(message);
    expect(request).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenCalledTimes(2);
    const calls = request.mock.calls.map(([, options]) => [options!.body, (options!.headers as Record<string, string>)['Idempotency-Key']]);
    expect(calls[0]).toEqual(calls[1]);
    expect(calls[1]).toEqual(calls[2]);
    expect(JSON.stringify(calls.map(x => x[1]))).not.toContain(message.to);
  });
  it.each([400, 401, 403, 404, 422])('does not retry permanent HTTP %s or disclose its response', async status => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response('sensitive credentials and provider detail', { status }));
    await expect(createResendMailer(config, { fetch: request }).send(message)).rejects.toThrow('Email delivery unavailable');
    expect(request).toHaveBeenCalledOnce();
  });
  it('bounds 429 retries and redacts the final failure', async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(async () => new Response('private recipient', { status: 429 }));
    await expect(createResendMailer(config, { fetch: request, wait: async () => {} }).send(message)).rejects.toThrow('Email delivery unavailable');
    expect(request).toHaveBeenCalledTimes(3);
  });
  it('does not treat malformed successful responses as acceptance', async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(async () => Response.json({}));
    await expect(createResendMailer(config, { fetch: request, wait: async () => {} }).send(message)).rejects.toThrow('unavailable');
    expect(request).toHaveBeenCalledTimes(3);
  });
  it('permits different recipients only in explicit production mode', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(accepted());
    const production: EmailConfig = { ...config, mode: 'production', from: 'accounts@school.example' };
    await createResendMailer(production, { fetch: request }).send({ ...message, to: 'another@example.com' });
    expect(request).toHaveBeenCalledOnce();
  });
});

describe('adult authentication messages', () => {
  it.each(['verification', 'reset'] as const)('builds a short accessible %s email with matching text and expiry', async kind => {
    const send = vi.fn().mockResolvedValue(undefined);
    const url = `${origin}/api/auth/${kind === 'verification' ? 'verify-email?token=synthetic&callbackURL=%2F' : 'reset-password/synthetic?callbackURL=%2F'}`;
    await createAuthEmailSender({ send }, origin)({ kind, user: { email: message.to, principalKind: 'adult' }, url });
    const mail = send.mock.calls[0][0] as EmailMessage;
    expect(mail.to).toBe(message.to);
    expect(mail.text).toContain(url);
    expect(mail.html).toContain('lang="en"');
    expect(mail.html).toContain('src="cid:kodearcade-mark"');
    expect(mail.attachments).toHaveLength(1);
    expect(mail.attachments![0]).toMatchObject({ content_type: 'image/png', content_id: 'kodearcade-mark' });
    expect(Buffer.from(mail.attachments![0].content, 'base64').subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(mail.html).toContain(url.replace(/&/g, '&amp;'));
    expect(mail.text).toContain(kind === 'verification' ? '1 hour' : '15 minutes');
    expect(mail.eventId).not.toContain('token=');
  });
  it.each(['learner', undefined, 'teacher'])('fails closed for non-adult principal %s', async principalKind => {
    const send = vi.fn();
    await expect(createAuthEmailSender({ send }, origin)({ kind: 'verification', user: { email: message.to, principalKind }, url: `${origin}/api/auth/verify-email?token=synthetic` })).rejects.toThrow('Adult');
    expect(send).not.toHaveBeenCalled();
  });
  it.each([
    'https://evil.example/api/auth/verify-email?token=synthetic',
    `${origin}/api/auth/verify-email?token=synthetic&callbackURL=https://evil.example`,
    `${origin}/unexpected?token=synthetic`,
    'https://user:password@learn.example.com/api/auth/verify-email?token=synthetic',
  ])('rejects unsafe action links %s', async url => {
    const send = vi.fn();
    await expect(createAuthEmailSender({ send }, origin)({ kind: 'verification', user: { email: message.to, principalKind: 'adult' }, url })).rejects.toThrow('link');
    expect(send).not.toHaveBeenCalled();
  });
});
