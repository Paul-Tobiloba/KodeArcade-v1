import { bigint, boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { check } from 'drizzle-orm/pg-core';

const date = (name: string) => timestamp(name, { withTimezone: true });
const timestamps = () => ({ createdAt: date('created_at').notNull().defaultNow(), updatedAt: date('updated_at').notNull().defaultNow().$onUpdate(() => new Date()) });

export const user = pgTable('auth_user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  username: text('username').unique(),
  displayUsername: text('display_username'),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  principalKind: text('principal_kind', { enum: ['adult', 'learner'] }).notNull().default('adult'),
  ...timestamps(),
}, t => [check('auth_user_principal_kind', sql`${t.principalKind} in ('adult', 'learner')`)]);

export const session = pgTable('auth_session', {
  id: text('id').primaryKey(), token: text('token').notNull().unique(),
  expiresAt: date('expires_at').notNull(), ...timestamps(),
  ipAddress: text('ip_address'), userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, t => [index('auth_session_user_idx').on(t.userId)]);

export const account = pgTable('auth_account', {
  id: text('id').primaryKey(), accountId: text('account_id').notNull(), providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'), refreshToken: text('refresh_token'), idToken: text('id_token'),
  accessTokenExpiresAt: date('access_token_expires_at'), refreshTokenExpiresAt: date('refresh_token_expires_at'),
  scope: text('scope'), password: text('password'), ...timestamps(),
}, t => [index('auth_account_user_idx').on(t.userId), uniqueIndex('auth_account_provider_idx').on(t.providerId, t.accountId)]);

export const verification = pgTable('auth_verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(),
  expiresAt: date('expires_at').notNull(), ...timestamps(),
}, t => [index('auth_verification_identifier_idx').on(t.identifier)]);

// Match all fields in the pinned Better Auth 1.7.7 two-factor plugin.
export const twoFactor = pgTable('auth_two_factor', {
  id: text('id').primaryKey(), secret: text('secret').notNull(), backupCodes: text('backup_codes').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  verified: boolean('verified').default(true), failedVerificationCount: integer('failed_verification_count').default(0),
  lockedUntil: date('locked_until'),
}, t => [index('auth_two_factor_user_idx').on(t.userId), index('auth_two_factor_secret_idx').on(t.secret)]);

export const rateLimit = pgTable('auth_rate_limit', {
  id: text('id').primaryKey(), key: text('key').notNull().unique(), count: integer('count').notNull(),
  lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
});
