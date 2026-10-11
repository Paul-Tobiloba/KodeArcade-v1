# Backend foundation — 11 October 2026

Development implementation on `codex/auth`, not production-ready. Better Auth, Drizzle and Neon are connected. The owner verified signup/email verification/sign-in and created a real class/student; preserve those records. Public-preview progress stays local. Authenticated students now save code, results and activity position to Neon, using isolated memory for unsaved drafts.

## Stack and development database

- TypeScript/Hono API, bound to loopback for local development.
- Self-managed Better Auth 1.7.7 with the Drizzle adapter, Username and Two Factor plugins. This permits the planned application-controlled classroom credentials; it is not Neon Managed Auth or a built-in picture-password plugin.
- Drizzle ORM 0.45.4 and Drizzle Kit 0.31.11 own schema and reviewed SQL migrations; `pg` connects to Neon with remote TLS certificate verification.
- Neon project **KodeArcade Development** (`wispy-king-00138208`), London (`aws-eu-west-2`), PostgreSQL 17.
- Development branch `br-little-dream-za724gti`, database `kodearcade`, endpoint `ep-empty-king-za6mlam4`.
- Direct host `ep-empty-king-za6mlam4.c-2.eu-west-2.aws.neon.tech`; pooled host `ep-empty-king-za6mlam4-pooler.c-2.eu-west-2.aws.neon.tech`. Pooling is enabled in transaction mode.

The account rejected a custom auto-suspend interval. Its default is `0` (no automatic suspension), with 0.25–1 CU configured. After verification, the unused development compute was manually suspended; check its state before resuming development. Connections may wake it again, so check compute state and billing before leaving it running. Production hosting, region and operational budget are separate decisions.

## Implemented

Three applied migrations create 19 application tables: the original 15 plus learner session context, management-operation idempotency, audit events and learner progress. Learners have active state and versioned credentials.

Composite foreign keys reject cross-organization enrollment and staff/class membership combinations. Grade/login-method constraints are enforced in PostgreSQL. Management routes additionally check verified adult identity, organization membership and class staff authority. Writes require recent password proof and an authenticator code when enabled. Guardian linking/family services remain pending. RLS is not implemented or claimed.

Better Auth stores opaque database sessions; cookie caching is disabled. HTTPS uses Secure, HttpOnly, SameSite=Lax, host-only cookies. Identity kind is server-controlled, not a signup input. With valid email configuration, an explicit allowlist exposes adult registration, email verification, login, recovery and two-factor authentication. Learner principals cannot use those adult email flows. Without email configuration, only session read and sign-out are available and adult signup remains disabled.

The frontend includes adult forms/onboarding, teacher class/student management, assignments, private generated PDF cards and authenticator setup with one-time backup codes. Student login checks classroom code, username and configured picture/text method. A dedicated student dashboard shows the teacher-managed child name, own class and server-returned assignments; no public login/marketing links. Activity Settings uses that name rather than a nickname prompt.

The API also has a health route, no-store responses, security headers, exact-origin mutation checks, a 16 KiB body limit (1 MiB only for student progress) and generic HTTP errors without request-body/secret logging. Proxy trust remains unconfigured; do not expose the local API publicly.

Persistent login budgets use HMAC-digested identifiers and database time. Classroom wrappers apply global/class/individual limits before server-side Better Auth calls, including daily picture/text limits. Classroom code alone never returns a roster. Reset/disable revokes sessions; active state, credential version and enrollment are checked for course access. Expired throttle/verification cleanup and audit retention jobs remain required.

## Local setup

Use Node.js 24, then `npm install`. Copy `.env.example` to the gitignored `.env` using your editor and replace every placeholder locally. Never commit secrets or put them in `VITE_*` variables.

1. Obtain development connection details from Neon. `DATABASE_URL` uses the pooled hostname; `DATABASE_MIGRATION_URL` uses the direct hostname. Do not use production credentials.
2. Create a least-privilege runtime role before any shared/hosted pilot. Do not use the owner role as the production API identity. Runtime-role provisioning has not been performed in this slice.
3. Generate `BETTER_AUTH_SECRET` using a cryptographically secure generator (at least 32 random bytes), and keep it in the local environment or a deployment secret store.
4. Set `APP_ORIGIN=http://127.0.0.1:5173` for the browser application. It must be an exact origin without a trailing slash. Vite proxies same-origin `/api` requests to the loopback API on port 3001; do not add wildcard CORS or loosen origin checks.
5. Set `DATABASE_MIGRATION_HOST` to the exact direct hostname as a separate migration confirmation.

```sh
npm run db:generate
npm run db:check
npm run db:migrate
npm run dev:server
```

In a second terminal, run `npm run dev -- --host 127.0.0.1 --port 5173` and open `http://127.0.0.1:5173/#/login`. Both servers must remain running for account flows. The public activity preview remains available without an account.

The initial SQL was applied to the new, empty development database through the connected Neon tool in one transaction, including the standard Drizzle migration ledger. Its SHA-256 is `90c6d24ce0d97d31ddd9e22d73f3792fadc79c45da1c026ea7f6353c68c6b264`; one migration and 15 application tables were verified, with zero accounts. The regular migration runner recognizes that ledger. No local database password was fetched or written during this implementation.

`db:generate` and `db:check` work without database credentials. `db:migrate` requires the separate direct URL and exact hostname, refuses the pooler and refuses `NODE_ENV=production`. It never automatically runs on API startup. Reviewed production migration/deployment workflows remain pending.

## Adult email integration — 11 October 2026

Resend is now connected through a server-only transport and Better Auth verification/reset callbacks. Verification links expire after one hour; password-reset links after 15 minutes, with existing sessions revoked on a completed reset. Automatic sign-in after verification is disabled. Callbacks require the server-controlled `adult` principal; learner identifiers are never emailed.

Development delivery is restricted to the exact `EMAIL_TEST_RECIPIENT`. Other recipients are rejected, **not redirected** into the developer's inbox. This prevents someone else's verification/reset token from being forwarded to the test account. With `onboarding@resend.dev`, the recipient must be the email associated with the Resend account; a purchased domain is not needed for this development test. Production delivery requires explicit `EMAIL_DELIVERY_MODE=production`, `NODE_ENV=production`, no test-recipient setting and a custom sender verified with Resend. Local sender validation cannot itself prove domain verification.

The transport uses HTML and plain-text messages, a ten-second timeout per attempt, three attempts maximum for transient failures, and an opaque stable idempotency key across retries. Provider responses, tokens and credentials are not logged. Critical-email durable queuing, bounce/complaint handling and operational alerting remain pending; this synchronous transport is not a durable delivery guarantee.

`npm run email:test` sends one credential-free connection message to the configured development recipient. A live test was accepted by Resend using the locally configured key; inbox delivery still requires recipient confirmation. The API key and test address remain in the gitignored `.env`; no key was printed or committed.

The local database URLs and auth secret have since been configured. Read-only checks verified the expected development database, migration ledger and table count, and the API started successfully. This did not create real accounts or send further live verification/reset emails. Keep actual values in the gitignored `.env` only.

Adult signup/login/recovery and classroom credential flows are connected in development. Same-origin checks, persistent budgets and the development email-recipient restriction remain enforced. Student login, private PDF cards, assigned courses, cloud saving/resume and teacher reports work. PDF and auth-email headers include the original K logo. Email uses a CID PNG attachment, tested in the transport but not newly confirmed visually in an inbox.

## Verification commands

```sh
npm run check:server
npm run test:server
npm test
npm run build
```

100 backend tests passed, including migration/schema/auth/email/authorization/budget checks, real Better Auth credential verification, username collision allocation, reset/session invalidation, atomic CSV/bulk-card operations, assignment concurrency, progress isolation/revisions, encrypted-recovery scope, quiz validation and teacher report scope. Isolated tests use synthetic PGlite records and mocked mail. The owner separately verified live signup/email verification/sign-in.

1,019 frontend tests and the frontend production build passed; the existing large Blockly chunk warning remains. Server TypeScript checking passed. This is not production security certification.

27 account browser checks previously passed across desktop, phone and tablet, covering loading/fixed scenery, shared-device intent, errors, profile and sign-out. The latest clean progress run passed 24 browser checks: 9 student-dashboard checks, 12 cloud load/save failure, retry, conflict and drawing-restore checks, and 3 opt-in live journeys. Those live journeys cover synthetic adult → workspace/class → generated picture/text PDF → student login → challenge completion/save → refresh/re-login/resume → teacher report. Their exact fixture IDs are removed afterward. They do not send live mail.

## Student credentials and shared devices

New usernames use lowercase first name, then concatenated surname if occupied, then cryptographically random digits. Global allocation is serialized transactionally. New text passwords use three independent words from an app-owned 832-word vocabulary (about 29 bits); old issued credentials remain valid until reset. Picture passwords use four ordered independent choices from 16 symbols (repeats allowed), with strict online budgets and server-keyed hashing.

Plaintext credentials exist only during generation and the authorized private PDF response; they are not persisted. A lost card requires reset/new card. Student drafts stay separate from public-preview localStorage; memory clears on activity exit/sign-out, while acknowledged cloud work remains. An encrypted device recovery copy may remain until synchronized, expired or explicitly cleared, as described below. The K loading indicator supports reduced motion; fixed account scenery stays behind normal scrolling content.

## Cloud progress and teacher reports

Progress is keyed by classroom, learner, assigned course and curriculum version. Session context is resolved on the server; client identity fields are only an extra binding check, not authorization. Enrollment, active state, credential version and assignment are checked on reads and writes. A composite enrollment foreign key prevents cross-class persistence.

Snapshots save completion, highest stars, runs/hints, Blockly workspace, text code, drawing work, quiz drafts/submissions/best answers, preferences and the last lesson/challenge/drawing/quiz. Resume restores that activity; it does not resume a moving sprite mid-animation. Dashboard summaries count current curriculum challenges, including the project, with drawing and quiz completion reported separately. Regenerate `shared/progress-catalog.ts` using `npx tsx scripts/generate-progress-catalog.ts` when curriculum definitions change; a test checks it against shipped content.

Writes debounce and serialize, use revision checks, preserve earned achievements and allow identical retries after a lost response. Conflicting tabs cannot silently overwrite cloud work: the user can download unsaved JSON and reload the saved version. Network failures retain the draft with Retry/Download controls and a close warning. Routine success is a three-second, non-focus-stealing toast; errors/conflicts stay visible. Downloaded drafts are private and must be handled accordingly.

When Web Crypto and browser storage are available, unsynced snapshots are AES-GCM encrypted into an opaque student/class/credential-version/course-scoped slot. The recovery key is acquired only after authenticated online progress loading and stays in memory; plaintext code, names and the key are not written into that slot. Copies expire after seven days; there are at most twelve slots. Storage/private-mode/quota failures are reported rather than claiming protection. Refresh recovery requires online authentication to reacquire the key: this is not an offline cold-start application or a backup guarantee. Use one activity tab per learner/course: cloud revision checks protect server data, but competing unsynced tabs can replace the same local recovery slot. Sign-out clears that learner's recovery copies; credential resets rotate access and make old copies unusable.

## Module quizzes

Every shipped Grade 1–6 coding module ends with five real topic questions, also reachable from the module drawer. There are 37 graded module quizzes across sequences, directions, loops, debugging, conditionals, variables and the project, using 105 authored questions in three age bands (Grades 1–2, 3–4 and 5–6). There is no timer or pass gate. Draft answers autosave; submission requires all five answers. Students get correct-answer explanations, can retry and retain their best result. Dashboard counts and teacher best/latest/attempt reports are separate from challenge stars.

The server validates course membership and answer structure, computes scores from the shared question bank and preserves earned best results. These are formative, client-submitted learning checks, not secure/proctored exams. Answers are shipped in the client bundle. Future question-bank changes must version the records rather than silently reinterpret old answer indices.

## Teacher classroom workflows

Classes support individual student management, authorized credential resets/disable, CSV import, bulk reset/cards and staged course assignments. Download the CSV template (`name,grade,login_method`), select a file, review local validation and explicitly confirm import. Import accepts up to 50 rows per request and 100 enrolled students per class; invalid rows, replayed imports or PDF failure do not leave a partial batch. Generated credentials are delivered in one private PDF booklet.

Select up to 50 active students to reset their credentials and generate a new booklet. The explicit warning explains that old cards/sessions stop working. Existing plaintext credentials cannot be reprinted. Saved learning progress is preserved. Course checkboxes are only a draft until Save assignments; stale concurrent edits are rejected. Removing a course removes access, not saved work.

Verification: 39 mocked browser checks passed across desktop, phone and tablet for recovery/save states, quizzes and teacher batches/reports. A separate live desktop journey passed against the development backend: synthetic teacher → class → individual students → CSV batch/PDF → bulk reset/PDF → staged assignments → student picture/text login → cloud save/resume → quiz → teacher report. Exact fixture IDs were removed afterward; real records were not changed. The PDF booklet was parsed and both synthetic sample pages were visually inspected. No live mail was sent.

Teachers open Classes → class → Learning progress, select an assigned course, filter students and view per-challenge completion, stars, runs and hints. Reports require verified adult/class staff authority and never return raw code or credentials. An unfinished challenge with 3+ runs or 2+ hints suggests a check-in, not a judgement. Results come from the client activity runtime, with server shape/range/scope validation; they are not server-replayed or proctored grades.

Opt-in live test: set `RUN_LIVE_CLASSROOM_E2E=1` and `PDF_TEST_PYTHON` to Python with pypdf, then run `npx playwright test e2e/classroom-live.spec.ts`. Only use the configured localhost development environment. Never log or attach private passwords/PDFs to reports.

## Remaining work before a hosted pilot

1. Trusted versioned server completion replay/validation and durable offline synchronization. Client-reported stars remain non-authoritative.
2. Family profiles, guardian approval/linking and broader school administration policies.
3. Broader school administration (staff lifecycle, class transfers/archival and retention policy), beyond the completed classroom workflows above. Do not store plaintext credentials for card reprints; reset and issue a new card.
4. Production domain/sender verification, durable mail delivery, bounce/complaint operations and operational alerting.
5. Consent/retention, expired throttle/token cleanup and audit retention jobs.
6. Production hosting/proxy trust, runtime DB role, secrets isolation, consent/retention, backup/restore tests, incident ownership and an end-to-end pilot verification.

References: [Better Auth installation](https://better-auth.com/docs/installation), [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle), [Username](https://better-auth.com/docs/plugins/username), [Two Factor](https://better-auth.com/docs/plugins/2fa), [rate limits](https://better-auth.com/docs/concepts/rate-limit), [Drizzle with Neon](https://orm.drizzle.team/docs/connect-neon).
