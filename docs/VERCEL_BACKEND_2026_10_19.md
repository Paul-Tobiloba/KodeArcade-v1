# Vercel frontend + backend preparation — 19 October 2026

This change prepares deployment; it does not deploy, change DNS, send live email, provision a database, or run migrations. Existing private projects/saves and the Hostinger n8n subdomain are unchanged.

## Architecture

The Vite frontend still builds to `dist`. `api/index.ts` is a single Node.js Web Request/Response function for `/api/*`, using the same Hono/auth/Resend composition as the local listener. `server/runtime.ts` never loads dotenv, opens a listening port or migrates a database. The local `server/index.ts` still loads `.env`, listens on loopback port 3001 and closes its pool on shutdown.

One PostgreSQL pool is reused per warm function instance, with Vercel's `attachDatabasePool` suspension helper. Durable sessions, authorization, progress and login budgets remain in Postgres, not instance memory. Exact-origin mutation checks, host-only secure cookies, adult/learner separation and existing email restrictions are retained. Caller-supplied forwarded-IP headers are still not trusted.

`vercel.json` selects Vite, Node 24 (via package engines), Fluid compute, a 60-second API limit and London (`lhr1`) near the existing London database setup. Confirm the intended production database region before release; adjust the function region if different. Email retries are already bounded and awaited; this does not introduce a durable mail queue.

The API rewrite does not swallow API 404s into HTML. The frontend uses hash routing, so no catch-all SPA rewrite is needed. The email/PDF logo and PDFKit font data are explicitly included in the function bundle. `.vercelignore` excludes local env files, review output and tests from CLI source uploads; `.gitignore` also excludes `.vercel` and its pulled files.

## Vercel project settings

- Reuse the existing KodeArcade project; verify its team/project before any release.
- Root Directory: the folder containing this `package.json`, `api/` and `vercel.json` (repository root for `cybPaul/KodeArcade`).
- Framework: Vite. Install: `npm ci`. Build: `npm run build:vercel`. Output: `dist`. Node: 24.x.
- Retain the existing custom website domain `kodearcade.laelixsolutions.cloud`.
- Do not change Hostinger nameservers, n8n records or already-verified Resend DNS records.

## Required hosted configuration

Enter these in Vercel's environment-variable settings, not source code. Never use a `VITE_` prefix for a server secret.

| Name | Production value | Type |
| --- | --- | --- |
| `NODE_ENV` | `production` | Config |
| `APP_ORIGIN` | `https://kodearcade.laelixsolutions.cloud` (no trailing slash) | Config |
| `DATABASE_URL` | Intended **production runtime pooled** Postgres URL, TLS enabled | Secret |
| `BETTER_AUTH_SECRET` | Existing stable random secret, at least 32 characters | Secret |
| `EMAIL_DELIVERY_MODE` | `production` | Config |
| `RESEND_API_KEY` | Sending key authorized for the verified sending domain | Secret |
| `EMAIL_FROM` | `KodeArcade <no-reply@mail.kodearcade.laelixsolutions.cloud>` | Config |
| `BYTE_PILOT_ENABLED` | `false`, or absent | Config |

Remove `EMAIL_TEST_RECIPIENT` from hosted production-mode email configuration; do not copy the local development test-inbox restriction there. Keep `DATABASE_MIGRATION_URL`, `DATABASE_MIGRATION_HOST` and private Byte gateway credentials out of Vercel runtime settings. No new provider API key is needed for authored Ask Byte content.

The screenshot's verified sending domain is `mail.kodearcade.laelixsolutions.cloud`; use that full domain after `@`, not merely the website hostname. Domain verification is not proof that API credentials or app settings are correct. Store database URLs, Resend keys and the auth secret as Secret rather than Config. Reclassify an existing auth secret without changing its value; replacing it invalidates existing signed sessions. Do not paste secrets into chat.

With email disabled or entirely unconfigured, the existing app intentionally reports adult/classroom/cloud capabilities as unavailable. This is not a frontend bug. Invalid or conflicting email settings fail initialization with an uncacheable generic 503; runtime logs name the configuration problem category without printing secrets.

### Preview is a separate environment

Use a stable preview/staging URL and set `APP_ORIGIN` to that **exact** HTTPS origin for the preview branch. Use an isolated staging database, separate auth secret and narrowly authorized test sending key/domain. Hosted Vercel previews also run with `NODE_ENV=production`; do not use the local `development` email mode there. If sending is enabled in staging, use synthetic adult accounts/inboxes only. If sending is disabled, account workflows cannot be fully tested.

Do not copy the production origin onto an unrelated preview URL, allow wildcard origins, infer trusted origins from Host headers, or let previews use the production database. Authentication callbacks and mutation protection depend on the exact origin. Random per-commit preview URLs are not interchangeable with the configured stable origin; test through that stable URL. Keep deployment protection enabled for staging.

## Database readiness and migrations

The runtime uses the existing `pg`/Drizzle stack, not a new database or auth service. Select the correct database intentionally; do not point public production traffic at the local development branch by accident. Application traffic uses the pooled URL; migrations need the separate direct URL and a reviewed, explicit migration operation.

Build/startup never run `db:migrate`. Existing `server/db/migrate.ts` deliberately refuses production-mode migrations. Do not bypass that guard to make a deployment pass. If the target database lacks the current `drizzle/` schema, stop and plan a reviewed migration with a backup/restore strategy and isolated rehearsal before releasing the backend.

`GET /api/health` is **liveness only**, not a DB/schema/Resend readiness check. A 200 there alone does not prove login, saving or email work.

## Verification and release sequence

1. Local preparation checks: `npm run check:server`, `npm run test:server`, `npm test`, `npm run build:vercel`. New integration tests use an in-memory PGlite database and mocked Resend HTTP, never live credentials or recipients.
2. Review the exact diff and intended Vercel team/project/environment before authorizing a preview deployment. Local tests cannot establish that hosted secrets, DNS, schema or provider delivery are correct.
3. On the stable preview origin, check `/api/health`, `/api/capabilities` and JSON API 404s; sign up a synthetic adult, receive the verification email, follow its link, sign in and reset the password. Inspect Resend delivery status and Vercel runtime errors without exposing tokens.
4. Test role-protected routes, student login, save/reload of a synthetic Lab project, and an authorized private login-card PDF. Confirm static artwork still loads. Use existing classroom/family fixtures only in the isolated staging database.
5. After preview success, review production settings/schema and explicitly authorize production release. A push/merge to the configured production branch may trigger it automatically. This preparation is intentionally kept on a local feature branch until that decision.

## Troubleshooting

- API returns HTML: check project root, API function discovery and rewrite configuration; do not mask it with a SPA fallback.
- API 503 plus initialization log: check required server values, explicit email mode, verified sender and forbidden development-only flags. Raw secrets are never logged by the adapter.
- API 403 on writes or broken mail redirects: compare the browser's actual origin with `APP_ORIGIN` for that environment.
- Health succeeds but login/save fails: check the selected DB, TLS, applied schema and database permissions; health does not query Postgres.
- Mail rejected: inspect Resend delivery logs, key permissions/domain scope, exact sender domain and recipient. DNS verification alone is insufficient.
- PDF/email logo missing: inspect function bundle asset inclusion and PDFKit font data.

## Local verification completed

- Full frontend suite: 1,783 passed (42 files).
- Full backend suite: 156 passed (18 files), including 14 new runtime, adapter, configuration and auth-flow checks. Real Better Auth/Drizzle runs against temporary PGlite; mocked HTTP captures Resend requests without sending mail.
- `npm run build:vercel`: server typecheck and frontend production build passed. Existing Zod annotation and large-chunk warnings remain; they are not new backend errors.
- Official local builders `@vercel/node` 24.0.3 and `@vercel/build-utils` 14.21.3 produced a Node 24 function with 1,686 traced files. Logo and PDF fonts were present; local dotenv and the listening server entry were absent. Loading the emitted API returned health JSON and an API JSON 404; generating a synthetic private login-card PDF from the materialized bundle passed.
- Builder dependencies/output live only in the ignored local `.impeccable/build/` verification directory; they are not new application dependencies or deployment assets. Only the pinned `@vercel/functions` helper is added to application dependencies.
- No live database connection, migration, real email, DNS mutation, cloud deployment, push or merge was performed for this preparation. Hosted routing, environment values, database readiness and real provider delivery still require the preview checks above.

References: [Node.js function entry points](https://vercel.com/docs/functions/runtimes/node-js), [Vercel pool lifecycle](https://vercel.com/kb/guide/connection-pooling-with-functions), [project configuration](https://vercel.com/docs/project-configuration/vercel-json), [environment scoping](https://vercel.com/docs/environment-variables), [Neon pooling](https://neon.com/docs/connect/connection-pooling), [Resend sending domains](https://resend.com/docs/add-a-domain).
