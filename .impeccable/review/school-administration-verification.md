# School and class lifecycle verification — 11 October 2026

Branch: codex/auth. Existing Better Auth/Drizzle/Hono/Neon retained.

- Frontend: 1,019 tests passed, 22 files.
- Backend: 109 tests passed, 11 files. Actual Better Auth/Hono against isolated PGlite, including school authority boundaries, exact invited email, expiry/revocation/reissue, single acceptance, last administrator, stale role/staff edits, personal/school isolation, archive sessions/login/writes, saved-progress preservation and safe operation-key recovery.
- Server typecheck, production build, Drizzle migration check and git whitespace check passed. Existing large-bundle/Zod build warnings remain.
- Thirty mocked browser checks passed: school workflows, archive/restore and existing teacher CSV/cards/course/report workflows, desktop/phone/tablet.
- Eighteen evidence-only recapture checks passed after forcing top-of-document screenshots and allowing focus-induced scrolling to settle. No application redesign in the recapture.
- Final review corrections: nine additional responsive checks cover lost school creation responses, repeated lost invitation/replacement responses and revocation before saving. The combined 39-check run had 38 passes and one tablet archive trace-teardown ENOENT caused by concurrent Playwright runs sharing an output directory; its application assertions passed. Both tablet archive tests passed again using an isolated output directory. No code change was needed for that test artifact collision.
- Live development: opt-in schools-live.spec.ts desktop journey passed against localhost API and configured Neon. Synthetic verified adults were seeded without mail, authenticated normally, then created/joined a school, assigned/removed staff, preserved a personal class and archived/restored the school class. Exact fixture IDs were cleaned up. Private tokens/cookies are excluded from traces/screenshots. Real accounts/classes were not changed.
- Additive migrations 0003_class_archival and 0004_school_invitations applied using the guarded direct development migration connection. No production migration or data transfer.
- Detector: one class-lifecycle increment run returned []; one school increment run covering SchoolManager.tsx, AccountPortal.tsx and AccountWorkspace.tsx returned []. Not rerun.
- All screenshots use explicit synthetic Sample data. No new raster assets; existing approved account artwork/provenance retained. Fixed background full-page screenshot compositing is not a runtime scrolling-background failure.
- Independent review first returned FIX for ambiguous committed responses and revoked-access recovery. The verdict pass inspected six new recovery captures and targeted code/tests, scored both findings resolved and returned SHIP. That verdict is scoped to the two listed fixes, not a new whole-product audit.

Not certified here: production security/operations, email delivery of school invitations, institutional ownership verification, cross-workspace data transfers, retention/deletion, district hierarchy or family linking. Live school check is API/database coverage; the responsive UI checks use mocked API fixtures, not a full live multi-device school-browser journey.
