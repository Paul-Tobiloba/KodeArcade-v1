# Vercel Preview setup — 19 October 2026

The owner authorized isolated Preview configuration and redeployment. No production release, Git push/merge, DNS update, existing-data copy, or email send was performed.

## Deployment

- Team: `tobycodes-projects` (`team_4EeVqMojXsXGAU1Ip0HYL6qv`).
- Project: `kode-arcade` (`prj_Ll8dPk7rFot9MNpPuzn1ZRuSkReQ`).
- Branch/commit: `codex/vercel-backend`, `11d1816181ddf5c27921ec470e5f56d750a3a206`.
- Ready Preview deployment: `dpl_BNP1ZTpAgTam2dozgByiVcbJ6Txe`.
- Stable testing origin: https://kode-arcade-git-codex-vercel-backend-tobycodes-projects.vercel.app
- Deployment Protection remains enabled. Use the authenticated Vercel plugin to inspect/test it; do not publish temporary protection-bypass URLs.

## Isolation and configuration

Preview-only overrides are scoped specifically to `codex/vercel-backend`:

- `APP_ORIGIN`: the exact stable testing origin above.
- `NODE_ENV=production`, `EMAIL_DELIVERY_MODE=production` (hosted runtime modes, not a production release).
- `BYTE_PILOT_ENABLED=false`.
- `EMAIL_FROM`: the Preview display name and verified `mail.kodearcade.laelixsolutions.cloud` sender.
- Separate `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, and `DATABASE_URL`, stored as Secrets.

Production environment-variable IDs, targets and modification timestamps were compared before/after and remained unchanged. Never expose secret values or copy production credentials into this preview.

## Preview database

- New empty Neon project: **KodeArcade Vercel Preview**, `withered-shadow-58899946`, London (`aws-eu-west-2`).
- Branch: `preview`, `br-restless-river-zaq075ca`.
- Database: `kodearcade_preview`.
- Compute: `ep-hidden-bar-za9ziz0q`, fixed 0.25 CU.
- All five existing Drizzle migrations applied over the direct connection, after checking that the new database had no public tables.
- Runtime uses the pooled endpoint and `kodearcade_preview_runtime`, not the owner/migration login.
- Runtime permissions: CONNECT, public-schema USAGE and application-table DML, sequence USAGE/SELECT. No role memberships, database CREATE or public-schema CREATE. Migration-journal access is not granted.
- Verified runtime query: zero auth users, no inherited roles, no schema/table creation privileges.
- No existing development/production data was copied or modified.
- The temporary owner-only credential transfer file was deleted immediately after reading and its absence verified. No migration URL was added to Vercel.

The owner's compute-settings screenshot explicitly confirms **scale to zero after five minutes**. The Free plan fixes this setting. Earlier connector responses reported `suspend_timeout_seconds: 0` and rejected interval changes; those responses were not sufficient evidence of always-on compute. Do not upgrade the plan or disable suspension to proceed.

## Verified on the deployed stable Preview

- `/api/health`: HTTP 200, `{"status":"ok","phase":"foundation"}`.
- `/api/capabilities`: HTTP 200; adult accounts, classroom login, management, PDFs, cloud progress and home learning enabled.
- `/api/session`: HTTP 200, `null` while signed out.
- Unknown API route: JSON HTTP 404, not frontend HTML.
- Runtime error/fatal-log query for this deployment: no matching logs in the checked recent window.

Health is liveness, not proof of database or email delivery. The database connection/schema/permissions were checked separately; the deployed browser-to-database account workflow still needs its end-to-end test.

## Next verification

Use the stable Preview origin (not the per-commit URL) with a synthetic adult/test inbox: signup, email verification, login, password reset, then private classroom/family and project save/reload flows. No email or test account has been created by this setup. Production release remains a separate decision.
