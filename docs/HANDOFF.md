# Development handoff — 11 October 2026

Branch: `codex/auth`. Local browser: http://127.0.0.1:5173. API: loopback port 3001.

## Completed and checked

- Better Auth / Drizzle / Neon development account foundation, illustrated responsive account pages and original K branding.
- Student classroom login, generated picture/text credentials and private PDF cards; assigned-course dashboard, student-scoped code/results/position saving and Continue learning.
- Teacher reports, individual student management, reviewed CSV import, bulk credential resets/PDF booklets and staged course assignment saving.
- Five-question quizzes at the end of every shipped coding module, with age-banded topic questions, explanations, retry, protected best result, autosaved drafts and separate teacher quiz reports.
- Conditional encrypted recovery of unsynced student work. See BACKEND_SETUP.md for online-key, expiry, shared-device and competing-tab limitations.
- Routine save feedback is now a compact toast, disappearing after three seconds without reserving a row or taking focus. Save errors and conflicts remain actionable. Both reduced-motion preferences are supported.
- Separate personal/school workspaces, school administrator/teacher roles, email-bound private staff invitation links, class staff assignments, role changes/removal and last-administrator protection. No existing classes are moved. Invitation email is not automated.
- Reversible class archive/restore, with class-bound student session revocation, paused writes/login and retained reports, code, stars and quiz results. See SCHOOL_ADMINISTRATION.md.
- Public **For schools** navigation and `/#/for-schools` feature page. **Sign up your school** preserves school setup intent through verification/sign-in/MFA and opens the explicit school creation form; it does not automatically create a school or grant access. Existing adults can sign in from the same page; invited staff use their invitation.

Verification: 1,019 frontend tests, 109 backend tests, build and server typecheck passed. The school/archive increment passed 30 initial mocked browser checks across desktop/phone/tablet and 18 evidence recapture checks. Nine new recovery checks passed in the final 39-check matrix; one tablet archive check had a trace-artifact cleanup collision with a concurrent live run, then both tablet archive checks passed in isolation. A live synthetic school invitation → acceptance → assignment → removal → personal-class preservation → archive/restore API/database journey passed, including repeated creation-key reconciliation, and deleted its exact fixtures. Migrations 0003/0004 are applied to development. Earlier quiz/teacher work passed 39 mocked browser checks, six final toast/quiz checks, three recovery checks and a live classroom/student/quiz/report journey. Real adult/student records were preserved. Independent school/archive review returned `ship` after scoring both recovery fixes resolved; the verdict pass is limited to those findings. These checks are not production security certification.

## Resume next time

Public school-entry verification: 43 mocked browser checks passed across the new entry/auth-intent flow and existing adult journeys, with two intentional compact-desktop test skips on phone/tablet. Three further capture checks passed. The final production build and 1,019 frontend tests passed. Accessibility checks on the feature page found no WCAG 2 A/AA violations in the tested states. The independent scoped design review returned `ship` with no material fixes; no new live account, email or school was created by this increment’s tests.

1. Review the public **For schools** entry → sign up or sign in → create a separate school → invite staff. The existing local adult account can use the page’s sign-in link. Only create a real school when authorized. Do not reset real student credentials unless explicitly requested.
2. Prioritize remaining administration policies or the family portal with the owner. School transfers/rollover/deletion and family/guardian linking are not implemented.
3. Before hosting: production sender/domain, least-privilege runtime DB role, trusted proxy/deployment configuration, consent/retention jobs, durable mail, backup/restore and operational ownership still need work. Results are formative client submissions, not secure exams.

Local secrets stay in ignored `.env`; never copy them into this document or GitHub. Generated private PDFs, test output, review screenshots and temporary review build files are excluded from Git.

If servers are not available after resuming, run `npm run dev:server` and `npm run dev -- --port 5173 --strictPort` in separate terminals. Preserve the existing configured development database. Other environments must apply additive migrations 0003/0004 with the guarded migration workflow before school/archive routes are used.
