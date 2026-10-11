import { existsSync } from 'node:fs';
import { serve } from '@hono/node-server';
import { loadConfig } from './config.js';
import { connectDatabase } from './db/client.js';
import { createAuth } from './auth.js';
import { createApp } from './app.js';
import { loadEmailConfig } from './email/config.js';
import { createResendMailer } from './email/mailer.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const config = loadConfig(process.env);
const email = loadEmailConfig(process.env);
const { db, pool } = connectDatabase(config.DATABASE_URL);
const auth = createAuth(db, config, email ? createResendMailer(email) : undefined, {
  adultAccounts: Boolean(email),
  emailAllowed: address => Boolean(email && (email.mode === 'production' || email.testRecipient === address)),
});
const app = createApp(auth, config, email ? { auth, db } : undefined);
const server = serve({ fetch: app.fetch, port: config.PORT, hostname: '127.0.0.1' }, () => {
  console.info(`KodeArcade API listening on loopback port ${config.PORT}`);
});
let closing = false;
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => {
  if (closing) return;
  closing = true;
  server.close(() => { void pool.end().then(() => process.exit(0)); });
});
