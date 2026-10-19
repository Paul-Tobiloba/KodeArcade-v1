# Student dashboard creative access — 18 October 2026

The signed-in student dashboard now places **Creative spaces** between the welcome area and assigned courses. Assigned Grades 3–6 offer Byte Lab and Drawing & Art; Grades 1–2 offer Drawing & Art only. Unknown/unassigned courses do not gain links or access. Classroom and home learners share the same assignment checks, existing account saves and return navigation.

Byte Lab opens the existing free-build editor. Drawing & Art opens the existing code-drawing workspace at **Make it yours**, with that grade's other drawing activities in the header. It is not a new general-purpose paint app. Explicit art entry ignores stale lesson/quiz/lab navigation, while ordinary course resume can restore a saved drawing even when the previous course mission was Byte Lab. Existing drawing code, workspaces, ink, width and results remain in the same per-activity save slots. Reloading the explicit art link starts Make it yours; it does not promise to restore another selected drawing from that route.

Routes: `/#/student-courses`, `/#/student-play/grade-N/lab` and `/#/student-play/grade-N/art`. Test locally at http://127.0.0.1:5173/#/student-courses after signing in as an assigned learner. No new public sharing, account permissions, data migration or deployment is included.

## Block comparison

The supplied 21 Code.org screenshots are feature references, not instructions to copy the interface or proof of block parity. See [the detailed comparison](BYTE_LAB_BLOCK_COVERAGE_2026_10_18.md). Many foundations exist; convenient compositions, editor-only controls, guided activities and absent runtime capabilities are explicitly distinguished. Missing blocks were audited, not silently implemented under a comparison question.

## Verification

- Frontend: 1,713 tests across 39 files passed; production build passed.
- Server: TypeScript check passed; 22 progress tests passed against synthetic local PGlite data.
- Browser: 18 tests passed across desktop, phone and tablet (`dashboard-creative.spec.ts`, `student-dashboard.spec.ts`). They cover assigned link destinations, both editor entries, saved drawing ink/reload, stale quiz override, ordinary drawing resume, younger/home learner choices, unassigned denial, empty assignments, profile/error behavior and scoped accessibility checks. API fixtures are synthetic; this run is not a new live Neon/browser certification.
- Six captures were opened and checked: dashboard full-page and art viewport at each device size, under `.impeccable/review/dashboard-{creative,art}-{desktop,phone,tablet}.png`. No mobile lesson layout redesign was made.
- One scoped design detector: zero primary findings, ten advisories in the dashboard stylesheet. The new divider and small caption reuse incumbent values; unrelated existing type/color drift is not repaired here.
- Shipping-image provenance scan: 62 rasters, zero missing. No new imagery.
- Independent review and documentation reports: `.impeccable/review/dashboard-creative-finish.md` and `.impeccable/review/dashboard-creative-documentation.md`.

Existing large-bundle and upstream Zod PURE-comment build warnings remain. The change is local on `codex/auth`; no commit, push or production deployment is implied.
