import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor, username } from 'better-auth/plugins';
import type { ServerConfig } from './config.js';
import * as schema from './db/schema.js';
import { createAuthEmailSender, RESET_SECONDS, VERIFICATION_SECONDS } from './email/auth-email.js';
import type { Mailer } from './email/mailer.js';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { consumeLoginBudget, throttleKey, type Executor } from './security/login-throttle.js';

export function createAuth(db: Parameters<typeof drizzleAdapter>[0] & Executor, config: ServerConfig, mailer?: Mailer, access: { adultAccounts?: boolean; emailAllowed?: (email: string) => boolean } = {}) {
  const send = mailer ? createAuthEmailSender(mailer, config.APP_ORIGIN) : undefined;
  return betterAuth({
    appName: 'KodeArcade', baseURL: config.APP_ORIGIN, secret: config.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema, transaction: true }),
    trustedOrigins: [config.APP_ORIGIN],
    emailAndPassword: {
      enabled: true, disableSignUp: !access.adultAccounts, requireEmailVerification: true, minPasswordLength: 12, maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: RESET_SECONDS, revokeSessionsOnPasswordReset: true,
      sendResetPassword: send ? async ({ user, url }) => send({ kind: 'reset', user: user as typeof user & { principalKind?: unknown }, url }) : undefined,
    },
    emailVerification: {
      expiresIn: VERIFICATION_SECONDS, autoSignInAfterVerification: false,
      sendOnSignUp: true, sendOnSignIn: false,
      sendVerificationEmail: send ? async ({ user, url }) => send({ kind: 'verification', user: user as typeof user & { principalKind?: unknown }, url }) : undefined,
    },
    account: { accountLinking: { enabled: false } },
    user: { additionalFields: { principalKind: { type: ['adult', 'learner'], required: true, defaultValue: 'adult', input: false } } },
    plugins: [username({ immutableUsername: true, minUsernameLength: 1, maxUsernameLength: 60 }), twoFactor({ issuer: 'KodeArcade' })],
    disabledPaths: ['/is-username-available', ...(access.adultAccounts ? [] : ['/sign-up/email'])],
    hooks: { before: createAuthMiddleware(async ctx => {
      if (!['/sign-up/email', '/sign-in/email', '/request-password-reset', '/send-verification-email', '/reset-password'].includes(ctx.path)) return;
      const reject = () => { throw new APIError('BAD_REQUEST', { message: 'Unable to continue with these details. Students should use classroom login.' }); };
      for (const value of [ctx.body?.callbackURL, ctx.body?.redirectTo]) {
        if (value === undefined) continue;
        try {
          if (typeof value !== 'string') reject();
          const target = new URL(value, config.APP_ORIGIN);
          if (target.origin !== config.APP_ORIGIN || target.username || target.password) reject();
        } catch { reject(); }
      }
      if (ctx.path === '/reset-password') {
        const token = ctx.body?.token;
        if (typeof token !== 'string') return;
        const verification = await ctx.context.internalAdapter.findVerificationValue(`reset-password:${token}`);
        if (verification) {
          const user = await ctx.context.internalAdapter.findUserById(verification.value);
          if (user && (user as typeof user & { principalKind?: unknown }).principalKind !== 'adult') reject();
        }
        return;
      }
      const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim().toLowerCase() : '';
      if (!email || email.endsWith('.invalid') || email.endsWith('@invalid')) reject();
      const record = await ctx.context.internalAdapter.findUserByEmail(email);
      if (record && (record.user as typeof record.user & { principalKind?: unknown }).principalKind !== 'adult') reject();
      if (access.adultAccounts) {
        const mailRequest = ['/sign-up/email', '/request-password-reset', '/send-verification-email'].includes(ctx.path);
        const budget = await consumeLoginBudget(db, throttleKey(config.BETTER_AUTH_SECRET, ctx.path, email), mailRequest ? 3 : 10, mailRequest ? 3600 : 900);
        const global = await consumeLoginBudget(db, throttleKey(config.BETTER_AUTH_SECRET, 'adult-global', ctx.path), 100, 3600);
        if (!budget.allowed || !global.allowed) throw new APIError('TOO_MANY_REQUESTS', { message: 'Too many attempts. Please try again later.' });
        if (mailRequest && access.emailAllowed && !access.emailAllowed(email)) throw new APIError('FORBIDDEN', { message: 'Development email is restricted to the configured test inbox.' });
      }
    }) },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 15, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 30 },
    advanced: {
      useSecureCookies: config.APP_ORIGIN.startsWith('https:'),
      cookiePrefix: 'kodearcade',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax', path: '/' },
      crossSubDomainCookies: { enabled: false },
      // Hosting/proxy trust is not configured yet. Do not trust caller-supplied forwarded IPs.
      ipAddress: { ipAddressHeaders: [] },
    },
    logger: { disabled: true },
  });
}

export type Auth = ReturnType<typeof createAuth>;
