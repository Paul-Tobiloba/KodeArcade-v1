import { loadConfig } from './config.js';
import { connectDatabase } from './db/client.js';
import { createAuth } from './auth.js';
import { createApp } from './app.js';
import { loadEmailConfig } from './email/config.js';
import { createResendMailer } from './email/mailer.js';
import { loadBytePilotConfig } from './byte.js';

/** Shared composition only: no dotenv loading, listener, migrations or live probes. */
export function createRuntime(env: NodeJS.ProcessEnv, attachPool?: (pool: ReturnType<typeof connectDatabase>['pool']) => void) {
  const config = loadConfig(env);
  const email = loadEmailConfig(env);
  const bytePilot = loadBytePilotConfig(env);
  const { db, pool } = connectDatabase(config.DATABASE_URL);
  try {
    const auth = createAuth(db, config, email ? createResendMailer(email) : undefined, {
      adultAccounts: Boolean(email),
      emailAllowed: address => Boolean(email && (email.mode === 'production' || email.testRecipient === address)),
    });
    const app = createApp(auth, config, email ? { auth, db } : undefined, bytePilot);
    attachPool?.(pool);
    return { app, pool, config };
  } catch (error) {
    void pool.end().catch(() => undefined);
    throw error;
  }
}
