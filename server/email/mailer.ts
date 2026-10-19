import { createHmac } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { normalizeEmail, type EmailConfig } from './config.js';

export type EmailMessage = Readonly<{ to: string; subject: string; html: string; text: string; eventId: string; attachments?: readonly { content: string; filename: string; content_type: string; content_id: string }[] }>;
export type Mailer = { send: (message: EmailMessage) => Promise<void> };

export class EmailDeliveryError extends Error {
  constructor() { super('Email delivery unavailable'); this.name = 'EmailDeliveryError'; }
}

export function createResendMailer(config: EmailConfig, dependencies: {
  fetch?: typeof fetch;
  wait?: (milliseconds: number) => Promise<unknown>;
} = {}): Mailer {
  const request = dependencies.fetch ?? fetch;
  const wait = dependencies.wait ?? sleep;
  return {
    async send(message) {
      const to = normalizeEmail(message.to);
      const domain = to.split('@')[1];
      if (domain === 'invalid' || domain.endsWith('.invalid') ||
          (config.mode === 'development' && (!config.testRecipient || to !== config.testRecipient))) {
        throw new EmailDeliveryError();
      }
      if (!message.eventId || !message.subject || /[\r\n]/.test(message.subject)) throw new EmailDeliveryError();
      // Stable across retries; does not disclose recipients or verification tokens.
      const key = createHmac('sha256', config.apiKey).update(JSON.stringify([
        message.eventId, to, message.subject, message.html, message.text, message.attachments,
      ])).digest('hex');
      const body = JSON.stringify({ from: config.from, to: [to], subject: message.subject, html: message.html, text: message.text, ...(message.attachments ? { attachments: message.attachments } : {}) });
      for (let attempt = 0; attempt < 3; attempt++) {
        let retryable = true;
        try {
          const response = await request('https://api.resend.com/emails', {
            method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
            headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `kodearcade-${key}` },
            body,
          });
          if (response.ok) {
            const result: unknown = await response.json();
            if (typeof result === 'object' && result !== null && 'id' in result && typeof result.id === 'string' && result.id) return;
            throw new EmailDeliveryError();
          }
          retryable = response.status === 429 || response.status >= 500;
          // Never surface provider response bodies: they can echo credentials/recipients.
          await response.body?.cancel();
        } catch {
          // Transport errors and timeouts are transient; their raw error is not logged.
        }
        if (!retryable || attempt === 2) throw new EmailDeliveryError();
        await wait(1000 * 2 ** attempt + Math.floor(Math.random() * 250));
      }
      throw new EmailDeliveryError();
    },
  };
}
