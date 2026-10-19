# Home learning and the family portal

## Parent journey

Sign in via Parent on the account chooser (`/#/adult-login?role=parent`). Verification, recovery and MFA preserve that parent intent and open `/#/family`. Existing teachers can open Family portal from their workspace sidebar without converting or moving their personal/school classes.

Confirm the adult password (and authenticator code when enabled) to unlock management for 30 minutes, tied to the current sign-in. Two-step verification is optional for parents; accounts that enable it still require it at sign-in and management unlock. Create a family workspace with a parent/guardian responsibility acknowledgement. Add a child using a first name or family nickname, Grade 1–6 and picture/text login method. No child email or date of birth is requested. A family supports up to ten home profiles including paused profiles.

Creation assigns the selected grade course and returns a private, no-store PDF. Usernames use lowercase first name, then full name, then random digits on collision. Text passwords contain three random words; picture passwords contain four randomly selected pictures, allowing repeats. A card uses a Home code and `/#/home-login`, not the classroom login route.

Download the PDF immediately. Plaintext credentials and PDF files are not retained server-side. Losing a card requires generating a replacement password/card, invalidating old credentials and signing the child out everywhere. The child's username and saved progress remain unchanged. The parent can rename a profile, choose courses, pause/resume access, and inspect saved challenge/quiz/drawing progress. Removing a course stops access but retains its work for re-assignment.

## Child journey and saves

Use Sign out & open child sign-in before handing over the same browser. There is no parent impersonation or silent account switching. Home login uses the child's home code, username and selected credential. Public code lookup exposes no roster or names. Classroom codes and home codes are accepted only in their respective login scope.

The child dashboard identifies home learning and directs help to the parent/guardian. Continue learning, scoped cloud snapshots, protected best achievements, quiz drafts, Blockly/text drafts and encrypted device recovery reuse the existing student saving implementation. Wait for Saved to your account. Public preview saves remain separate and are never imported.

## Boundaries and persistence

No schema migration is needed. A private single-child learning context uses the existing `classroom`/`enrollment` storage primitives inside a `family` organization. It is not a school class, has no teaching staff, and is not returned in the adult classroom list. Each newly created child receives an approved guardian link to its creating parent. Family APIs require both a parent membership in that family organization and that guardian link for the child. A guardian link alone cannot authorize school-pupil access.

`/api/family/setup`, `/api/family/:familyId`, and scoped child creation/profile/course/reset endpoints enforce verified adult sessions and recent management proof for mutations. Transactions serialize family limits, child changes and global username allocation. They use the same context→learner locking order as learner login/progress. PDF failure rolls back creation/reset. Operation keys prevent request replays; profile/course updates reject stale state. Audits contain resource/actor IDs, not child names, plaintext credentials or code.

The parent report returns saved completion, stars, tries/hints, last activity, drawings and best quiz results. It omits raw code, Blockly workspace, recovery keys, hashes and credentials. These are formative, client-reported practice results, not proctored grades or diagnoses. Refresh progress loads a new server snapshot.

School-pupil linking is deliberately not implemented. Institutional/guardian verification, consent/legal review, lifecycle deletion/export, retention operations and production deployment remain separate work. Do not treat development verification as certification for a real-child pilot.

## Verification

- `npm run test:server` — isolated PGlite/Drizzle/Better Auth tests, including family ownership, PDF failure rollback, home scope, sibling isolation, real saves/resume/reports, access pause/reset and retained course work.
- `npx playwright test e2e/family.spec.ts` — deterministic desktop/tablet/phone forms, selection, reports, course edits, parent MFA routing, picture home login, and accessibility checks.
- `RUN_LIVE_FAMILY_E2E=1` with `PDF_TEST_PYTHON` pointing to Python with pypdf, then `npx playwright test e2e/family-live.spec.ts --project=desktop` — opt-in localhost/development Neon journey. Creates synthetic fixture accounts, renders/reads private PDF cards, runs a real challenge, resumes, checks the parent report and cleans up exact fixture IDs. Never run against production.
- `npx tsx scripts/verify-home-card.ts` — fixed synthetic two-page PDF in ignored `output/family-card/`; render and inspect both pages before changing card layout.

Final development results: 117 backend tests, 1,019 frontend tests and 18 family browser checks passed; server typecheck and production build passed. The opt-in live journey passed with exact synthetic records removed. Browser recovery checks also cover initial unauthorized loading and a previously loaded home session expiring; both offer direct home and classroom sign-in choices without guessing the child's identity.
