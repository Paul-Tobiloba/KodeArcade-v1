# Development handoff — 11 October 2026

Branch: `codex/auth`. Local browser: http://127.0.0.1:5173. API: loopback port 3001.

## Completed and checked

- Better Auth / Drizzle / Neon development account foundation, illustrated responsive account pages and original K branding.
- Student classroom login, generated picture/text credentials and private PDF cards; assigned-course dashboard, student-scoped code/results/position saving and Continue learning.
- Teacher reports, individual student management, reviewed CSV import, bulk credential resets/PDF booklets and staged course assignment saving.
- Five-question quizzes at the end of every shipped coding module, with age-banded topic questions, explanations, retry, protected best result, autosaved drafts and separate teacher quiz reports.
- Conditional encrypted recovery of unsynced student work. See BACKEND_SETUP.md for online-key, expiry, shared-device and competing-tab limitations.
- Routine save feedback is now a compact toast, disappearing after three seconds without reserving a row or taking focus. Save errors and conflicts remain actionable. Both reduced-motion preferences are supported.

Verification: 1,019 frontend tests, 100 backend tests, build and server typecheck passed. 39 mocked browser checks passed across desktop/phone/tablet; the final six toast/quiz checks and three refreshed recovery checks also passed. A live synthetic desktop classroom/student/quiz/report journey passed and deleted its exact fixtures. Real adult/student records were preserved. Independent UI review returned `ship` for the reviewed additions; this is not production security certification.

## Resume next time

1. Review the new quiz and teacher screens using the existing local accounts. Do not reset real credentials unless explicitly requested.
2. Prioritize the next product workflow with the owner. Broader school administration and family/guardian linking are not complete.
3. Before hosting: production sender/domain, least-privilege runtime DB role, trusted proxy/deployment configuration, consent/retention jobs, durable mail, backup/restore and operational ownership still need work. Results are formative client submissions, not secure exams.

Local secrets stay in ignored `.env`; never copy them into this document or GitHub. Generated private PDFs, test output, review screenshots and temporary review build files are excluded from Git.

If servers are not available after resuming, run `npm run dev:server` and `npm run dev -- --port 5173 --strictPort` in separate terminals. Preserve the existing configured development database; no migration is required for quiz JSON snapshot additions.
