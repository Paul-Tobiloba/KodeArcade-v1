# Activity chat, sessions and private filenames — verification

2026-10-12. Branch: codex/auth. Synthetic tests; no live mail or child identities used.

## Implemented scope

- Server-generated name prefixes for single classroom/home PDFs, transported into download filenames; class prefixes for multi-child booklets.
- Minimal session metadata, fixed 24-hour maximum grants, adult human-activity idle enforcement at 60 minutes and warning at 55. Learners have no idle expiry. Background polling does not extend grants.
- Session-aware marketing/account navigation and login-entry redirects. Native expiry protection retains mounted work for same-account reauthentication; it is current-tab memory only, not durable form saving.
- Byte activity widget with typed questions, starters, local code checks, read-aloud, cancellation, clear and off-topic redirection. Child/public help remains explicitly authored and on-device. Verified allowlisted adults alone can test the existing private AI pilot; no new child model access.

## Automated evidence

| Check | Result |
| --- | --- |
| npm test | 25 files, 1,027 tests passed |
| npm run test:server | 14 files, 131 tests passed; synthetic PGlite/Better Auth |
| npm run check:server | Passed |
| npm run build | Passed before and after final reviewed header fix; existing Zod annotation and bundle-size warnings remain |
| Playwright Byte + session | 24 passed across desktop, phone and tablet |
| Playwright accounts, family, teacher workflows, cloud progress and school security | Initial 84/87 passed; three family recovery assertions still expected the discarded-dashboard expiry behavior |
| Playwright family + session after updating recovery expectations and header fix | All 27 passed across desktop, phone and tablet; all three previously failing cases now pass |
| Scoped axe | Byte panel and idle warning have no violations in the targeted browser checks |
| Impeccable detector, once | Zero primary findings; advisory component type steps/error tone and pre-existing lab border color |
| Existing world-art provenance scan | Seven rasters, zero missing; no rasters created or changed |

The Windows sandbox initially prevented Vitest workers from reading temporary compiled modules; reruns outside that sandbox passed. Existing regression fixtures that do not mock the new session endpoint emitted expected local API proxy errors while the live API was stopped. New session tests explicitly mock that endpoint. These were fixture/network messages, not live database tests.

## Responsive and review evidence

Two bounded builder rounds captured and opened Byte chat, warning and expiry on desktop, phone and tablet. The independent finish reviewer found one material issue: the account header still offered Log in on authenticated onboarding. It was corrected from the layout flag to the active session; the same session capture paths were recaptured and validated. The reviewer scored that finding resolved with disposition **ship**, scoped to the navigation fix. See activity-chat-session-finish.md. No second detector or unrelated redesign was performed.

## Local handoff and limits

Hidden local frontend and API processes were restarted, plus the existing strict-host-key-verified, loopback-only SSH gateway tunnel. Frontend 5173, direct API health 3001, proxied capabilities and anonymous session returned 200; anonymous gateway request returned 401. This did not modify .env, gateway credentials, VPS services, n8n, Docker resources or the firewall. No new live-model answer was generated in this verification pass; adult widget inference/fallback/cancellation were tested with synthetic responses. Previous supervised warm-model evidence remains separate in docs/ASK_BYTE_LIVE_VERIFICATION.md.

Children's live AI rollout, production private connectivity, cold-start reliability, educator evaluation and broader child-safety/privacy approval are still pending. This report does not certify the whole platform or guarantee uninterrupted n8n performance. Closing/refreshing a tab can lose unsaved forms; existing encrypted learner recovery remains subject to its separate limits.
