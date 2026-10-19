# Dedicated Byte Lab verification — 16 October 2026

- Frontend: 1,617 tests passed across 33 files, including independent sprite scheduling, event routing, private project schema/backups, old-work migration and repeat-count preservation.
- Synthetic backend: 137 tests passed across 14 files. The new authenticated API case roundtrips independent scripts and painted library-copy artwork, excludes private drafts from reports and preserves unscored lab totals. A prior resource-contended setup timeout was resolved by rerunning with one worker.
- Final scoped Playwright batch: 19 passed, 2 intentional skips in 3.7 minutes. The desktop-only 1310×654 check is skipped on phone/tablet. Coverage includes native drag/snap/run, per-sprite keyboard editing, click/border behavior, two scripts, reload, private saves, library selection, drawing/undo/redo, editable library copies, malformed/valid backup import, negative/range property entry, dashboard entry, guided completion/quiz, scoped accessibility and document width.
- Production build and server TypeScript check passed. Known non-fatal dependency annotation and >500KB bundle warnings remain.
- One scoped detector: no primary findings; compact editor design-token advisories recorded separately. Read-only raster provenance: 39 scanned, zero missing.
- Independent finish review: initial fix, then ship for both scored numeric-editing and atlas-isolation corrections. Global design comparison is recorded in studio-documentation.md.

All learner data was synthetic. No live accounts, private child records, production database, email, n8n, VPS or AI gateway were modified. Broader browser regression remains paused. Changes remain local on codex/auth, uncommitted/unpushed. These checks are not whole-platform or educational/security/accessibility certification.
