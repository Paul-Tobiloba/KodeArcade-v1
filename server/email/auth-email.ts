import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Mailer } from './mailer.js';
const brandAttachment = { content: readFileSync(new URL('../../public/brand/mark-email.png', import.meta.url)).toString('base64'), filename: 'kodearcade.png', content_type: 'image/png', content_id: 'kodearcade-mark' };

export const VERIFICATION_SECONDS = 60 * 60;
export const RESET_SECONDS = 15 * 60;
export type AuthEmail = Readonly<{
  kind: 'verification' | 'reset';
  user: { email: string; principalKind?: unknown };
  url: string;
}>;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

export function createAuthEmailSender(mailer: Mailer, appOrigin: string) {
  return async ({ kind, user, url }: AuthEmail): Promise<void> => {
    if (user.principalKind !== 'adult') throw new Error('Adult email required');
    const link = new URL(url);
    const permittedPath = kind === 'verification' ? link.pathname === '/api/auth/verify-email' : /^\/api\/auth\/reset-password\/[^/]+$/.test(link.pathname);
    const callback = link.searchParams.get('callbackURL');
    if (link.origin !== appOrigin || link.username || link.password || !permittedPath ||
        (callback && new URL(callback, appOrigin).origin !== appOrigin)) throw new Error('Invalid auth email link');
    const action = kind === 'verification' ? 'Verify your email' : 'Reset your password';
    const expiry = kind === 'verification' ? '1 hour' : '15 minutes';
    const explanation = kind === 'verification'
      ? 'Confirm this email address to use your KodeArcade adult account.'
      : 'Use this link to choose a new password for your KodeArcade adult account.';
    const note = 'If you did not request this email, you can ignore it. Do not share this link.';
    await mailer.send({
      to: user.email, subject: `${action} for KodeArcade`,
      eventId: `${kind}-${createHash('sha256').update(url).digest('hex')}`,
      text: `${action}\n\n${explanation}\n\n${url}\n\nThis link expires in ${expiry}.\n\n${note}`,
      attachments: [brandAttachment],
      html: `<!doctype html><html lang="en" dir="ltr"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${action} for KodeArcade</title></head><body style="margin:0;padding:24px;background:#f5f3ff;color:#20124d;font-family:Arial,sans-serif;font-size:16px;line-height:1.6"><main lang="en" dir="ltr" style="max-width:540px;margin:auto;padding:24px;background:#fff;border-radius:12px"><p style="font-size:24px;font-weight:bold"><img src="cid:kodearcade-mark" alt="" width="41" height="40" style="vertical-align:middle;margin-right:10px">KodeArcade</p><h1 style="font-size:24px">${action}</h1><p>${explanation}</p><p>This link expires in ${expiry}.</p><p><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;background:#5423d6;color:#fff;border-radius:8px;font-weight:bold;text-decoration:none">${action}</a></p><p>Or copy this link into your browser:</p><p style="overflow-wrap:anywhere;word-break:break-all">${escapeHtml(url)}</p><p>${note}</p></main></body></html>`,
    });
  };
}
