# Coding curriculum phase one — verification

21 October 2026. Story: an assigned learner opens a Grade 2/4 practical unit, edits/runs/tests a bounded program, completes supported practice and a separate fresh app-checked task, and saves the versioned results through the existing private course-progress API. Public preview work remains browser-only. Existing coding/drawing practice now welcomes retries without reducing completion rewards.

## Evidence

| Boundary | Result and scope |
| --- | --- |
| Frontend logic | 50 files / 1,989 tests passed, including six new practical kernel/schema/cloud-merge tests and retry-friendly reward cases. |
| Student UI → API | Browser fixtures verified the assigned dashboard entry, private POST payload, acknowledgement, untouched public namespace and denied unassigned grade. These are synthetic account responses, not a production account. |
| API → database → response | 25 progress API tests passed against isolated PGlite, including bounded practical/practice persistence, cross-grade validation, other-learner isolation and preservation through old-client omission. No live database was mutated. |
| Saved response → client | Cloud collection/hydration round-trip and monotonic historical practice/mastery preservation passed in the frontend suite. Public reload preserves the demonstrated status. Corrupt original saves remain recoverable and are not replaced with empty work. |
| Interaction/access | 36 browser checks passed across desktop, phone and tablet: both full practical flows; failed repair; held/opposing input; release, focus loss, settings and pointer cancellation; supported attempts preserving prior evidence; reward reveals/chimes; stopping; saved/system reduced motion; and accessibility scans. |
| Production build | `npm run build` and `npm run check:server` passed. The practical route is lazy-loaded. Existing non-failing large-bundle and Zod comment-annotation warnings remain. |

Twelve additional browser checks passed across the same three device classes: repeat practical flows with valid document-top captures, and a legacy two-star completed save remaining unchanged until successful retry, improving to five and never accumulating duplicate rewards. Together with the earlier36 run, this is39 distinct browser cases (nine practical cases were repeated for corrected captures).

Built-preview smoke test at `http://127.0.0.1:4173`: course chooser → Tap, hold, release → prediction/reason → Check this step → reload. Saved first step was `true`; `pageErrors: []`. The existing preview server was reused after a new start reported port4173 already occupied; no unrelated process was stopped.

All15 required capture files were opened and validated: Grade2 workspace and result, Grade4 function workspace and result, plus the shared reward-dialog crop, each on desktop, phone and tablet. A fresh finish review is recorded separately in `coding-practical-finish.md`.

First reviewer fix batch: the active step now scrolls fully within the horizontal strip on selection and draft restoration, and course-card grade metadata follows the title. All12 targeted practical/input/reward-reveal browser checks passed after these changes, including active-button bounds and zero page overflow. Production build/server types passed again. The same15 captures were reopened and validated, plus three explicitly scoped entry-card crops. The final progress API rerun also passed25/25. A phone card-art sizing issue observed in the new direct crop is handled through the reviewer's bounded verdict, not an unrelated polish pass.

Card follow-up: the reviewer confirmed the phone art overflow as part of the card readability finding. Character and basketball art now fit the55px phone column. Final built-preview assertions passed on allthree device classes for art containment, grade below title, course-entry→prediction→check→reload result retention and no page errors. Card crops were replaced at their existing paths. No new raster or detector pass was needed; provenance rescan remained44/0.

Owner's subsequent screenshot requested popup success feedback instead of the initial inline section. Both practice and mastery now use a native modal dialog, with dimmed backdrop, title focus, explicit Close/Keep exploring, Escape dismissal and return to the invoking check button. Practice retains the approved animated five stars; mastery retains the separate check/status. Modal-specific cross-device assertions and final finish disposition are recorded after confirmation.

Modal confirmation: all18 practical browser checks passed across desktop, phone and tablet, including `:modal`, dialog viewport containment, accessibility scans, Tab staying inside the popup, Escape/Close dismissal and focus returning to the respective check button. All12 practice/mastery modal screenshots and the three final card crops were opened and validated. Final frontend build/server typecheck passed. The fresh scoped reviewer disposition is `ship` for the revised modal surface and listed card/navigation fixes; see the finish report for its exact boundaries. No further polishing or second detector followed.

## Boundaries

The frontend-only development test server can log refused `/api/session` proxy requests in the older reward suite; assertions complete successfully. New practical and reward-star tests use explicit session/capability fixtures. This is not evidence of a running local account backend. No environment values changed and no credentials were read or printed. No new environment variable, database migration, production deployment, push or hibernation was performed. Frontend/backend must deploy together for additive shared schema fields.

App-checked mastery is scoped to two bounded configurations, selected prediction/reason and a fresh transfer requirement. It does not validate free-form explanation, general programming competence, authorship or classroom learning outcomes. The remaining V3 units still need authoring and learner/teacher pilots.

## Design and implementation checks

Impeccable guided the incumbent learning-shell extension, accessibility controls, one scoped detector pass and fresh finish/documentation handoffs. React review checked lazy initialization/loading, bounded versioned local storage, cleaned-up animation/global listeners, stable program-reset dependencies, native labels, no arbitrary code execution and no per-frame persistence. Provenance scan covered 44 reused rasters, zero missing; no new raster was generated. Global DESIGN.md and its sidecar are not rewritten to silence advisory local palette/type findings.
