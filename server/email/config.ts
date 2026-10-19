import { z } from 'zod';

export type EmailConfig = Readonly<{
  apiKey: string;
  from: string;
  mode: 'development' | 'production';
  testRecipient?: string;
}>;

export function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!z.email().safeParse(email).success || /[\r\n]/.test(value)) throw new Error('Invalid email address');
  return email;
}

export function loadEmailConfig(env: NodeJS.ProcessEnv): EmailConfig | undefined {
  const mode = env.EMAIL_DELIVERY_MODE ?? 'development';
  if (mode === 'disabled') return undefined;
  if (!env.RESEND_API_KEY && !env.EMAIL_FROM) return undefined;
  if (!['development', 'production'].includes(mode) ||
      !/^re_[A-Za-z0-9_-]{8,}$/.test(env.RESEND_API_KEY ?? '') ||
      /REPLACE|placeholder|example/i.test(env.RESEND_API_KEY ?? '')) {
    throw new Error('Invalid email configuration');
  }
  const from = env.EMAIL_FROM?.trim() ?? '';
  const mailbox = /^(?:[^<>\r\n]+ <([^<>]+)>|([^<>\r\n]+))$/.exec(from);
  if (!mailbox) throw new Error('Invalid EMAIL_FROM');
  const address = normalizeEmail(mailbox[1] ?? mailbox[2]);
  const domain = address.split('@')[1];
  if (domain === 'invalid' || domain.endsWith('.invalid')) throw new Error('Invalid EMAIL_FROM');
  const testRecipient = env.EMAIL_TEST_RECIPIENT ? normalizeEmail(env.EMAIL_TEST_RECIPIENT) : undefined;
  if (mode === 'production') {
    if (env.NODE_ENV !== 'production' || domain === 'resend.dev' || domain.endsWith('.resend.dev') || testRecipient) {
      throw new Error('Production email requires a verified custom sender and no test recipient');
    }
  } else if (env.NODE_ENV === 'production') {
    throw new Error('Development email is not permitted in production');
  }
  // Missing test recipient is allowed at startup but blocks every send. Never reroute
  // another adult's verification/reset token into the developer's inbox.
  return Object.freeze({ apiKey: env.RESEND_API_KEY!, from, mode: mode as EmailConfig['mode'], testRecipient });
}
