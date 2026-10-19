import { createHmac } from 'node:crypto';
import { sql, type SQL } from 'drizzle-orm';

export type Executor = { execute(query: SQL): Promise<{ rows: Record<string, unknown>[] }> };

export function throttleKey(secret: string, scope: string, identifier: string): string {
  return createHmac('sha256', secret).update(JSON.stringify([scope, identifier])).digest('hex');
}

// One atomic upsert uses database time; concurrent API instances share the budget.
// Call separately for account/class/network budgets before calling auth.api.
export async function consumeLoginBudget(db: Executor, key: string, limit: number, windowSeconds: number) {
  if (!/^[a-f0-9]{64}$/.test(key) || !Number.isSafeInteger(limit) || limit < 1 || limit >= 2147483647 ||
      !Number.isSafeInteger(windowSeconds) || windowSeconds < 1 || windowSeconds > 86400) {
    throw new Error('Invalid login budget');
  }
  const result = await db.execute(sql`
    insert into login_throttle (key, count, window_ends_at)
    values (${key}, 1, now() + ${windowSeconds} * interval '1 second')
    on conflict (key) do update set
      count = case when login_throttle.window_ends_at <= now() then 1
        else least(login_throttle.count + 1, ${limit + 1}) end,
      window_ends_at = case when login_throttle.window_ends_at <= now()
        then now() + ${windowSeconds} * interval '1 second' else login_throttle.window_ends_at end
    returning count <= ${limit} as allowed,
      greatest(1, ceil(extract(epoch from (window_ends_at - now()))))::int as retry_after
  `);
  const row = result.rows[0];
  if (!row || typeof row.allowed !== 'boolean' || typeof row.retry_after !== 'number') throw new Error('Login budget unavailable');
  return { allowed: row.allowed, retryAfterSeconds: row.retry_after };
}
