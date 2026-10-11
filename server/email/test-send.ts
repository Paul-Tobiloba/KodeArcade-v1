import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { loadEmailConfig } from './config.js';
import { createResendMailer } from './mailer.js';

if (existsSync('.env')) process.loadEnvFile('.env');
try {
  const config = loadEmailConfig(process.env);
  if (!config || config.mode !== 'development' || !config.testRecipient) throw new Error('Configure development email and EMAIL_TEST_RECIPIENT first');
  await createResendMailer(config).send({
    to: config.testRecipient, subject: 'KodeArcade development email connection test',
    text: 'This is the requested KodeArcade development email connection test. No action is needed. This message contains no login credentials.',
    html: '<html lang="en"><body><h1>KodeArcade email connection test</h1><p>This is the requested development connection test. No action is needed.</p><p>This message contains no login credentials.</p></body></html>',
    eventId: `connection-test-${randomUUID()}`,
  });
  console.info('Resend accepted the connection-test email. Check the configured test inbox; API acceptance is not proof of inbox delivery.');
} catch {
  console.error('Email test failed. Check local email configuration, key permissions and Resend sender/recipient restrictions. No secrets were logged.');
  process.exitCode = 1;
}
