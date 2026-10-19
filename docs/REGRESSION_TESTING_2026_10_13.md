# Regression testing — 13 October 2026

Scope: resume the automated regression suite, repair the legacy-course blank screen and investigate the compact-workspace failure. Work remains on `codex/auth`; this record does not imply a push, deployment or real-account verification.

## Repairs and test maintenance

- Legacy courses have no drawing activities. Guarding drawing initialization/navigation and the drawing effect dependency prevents reading an absent activity's ID. Eighteen browser cases exercise arrows/words/builder with ordinary and stale drawing navigation across desktop, phone and tablet.
- Legacy-course tests now use retained direct routes rather than retired age-course links, and check the current obstacle map without changing saved routes.
- At 1308 × 677, the editor is 585px high and its canvas is 443px after the current 62px title, 33px keyboard helper, 45px reference row and borders. The old 450px absolute floor was stale. The test now requires more than 400px usable canvas, at most 144px surrounding chrome, no horizontal overflow and all desktop board/palette/Play controls inside the viewport.
- On stacked layouts, expanding the guide intentionally moves the board down. Tests preserve map dimensions/alignment, and retain the additional fixed vertical-position assertion on desktop.
- A real interaction defect was found: the floating Byte launcher blocked Clear code, and repositioning it blocked long-program editing instead. Byte now has one docked launcher below the guide heading. The test checks non-overlap with the editor and exercises clear/reorder/delete/undo without forced clicks.

## Verified after the compact repair

- All three compact-workspace journeys passed: desktop (1308 × 677 and 1366 × 768), emulated Pixel 7 and emulated iPad (Chromium).
- Six desktop Byte cases and five phone Byte cases passed in the targeted run; the desktop-only short-window case was skipped on phone. The targeted run then stopped at the stale stacked-guide position assertion, subsequently corrected and verified in both small-screen compact cases.
- 1,027 frontend tests across 25 files passed after the launcher change.
- TypeScript/Vite production build passed after the launcher change. Existing Zod annotation and large-chunk warnings remain.
- Desktop/phone/tablet screenshots were inspected together. Responsive guidance preserved the existing brand, board/editor geometry and Play placement. React review retained a single launcher ref, focus return and the existing cancellation/state lifecycle; no new network or identity behavior was introduced.
- The scoped design detector reported six advisory findings in existing Byte colors/type sizes, and no primary findings. Global design metadata drift was left untouched.

## Limits

Live classroom/family/school database journeys are explicitly disabled during this browser run. Browser account/API responses use synthetic fixtures where configured. Earlier backend tests used in-memory PGlite; no real user records, email delivery, VPS configuration or child-AI access were changed. Emulation is not physical-device or Safari verification; Blockly remains excluded from the broad automated accessibility scan.

## Full browser run outcome

The resumed 378-case run stopped at the next failure: **37 passed, 1 skipped, 1 failed, 339 did not run** (4.5 minutes). The repaired desktop compact journey passed in that run.

`e2e/curriculum-v2.spec.ts:31` waited for Read lesson after reloading a fixture. The captured page was already the Sequences topic journey, with the ten completed challenges and its mastery controls rendered. Read lesson is only rendered during challenge/drawing mode. The test now asserts the restored journey directly instead of clicking a control belonging to another screen; its targeted desktop rerun passed (8.3 seconds). No Grade 1 product regression was established by this timeout.

The remaining 339 cases are selected using a project-scoped exclusion list in `.impeccable/review/runtime/regression-completed-2026-10-13.txt`. This excludes only completed desktop groups and the corrected Grade 1 desktop case; phone/tablet coverage remains included, and the live database opt-ins remain disabled.

Scoped finish verdict: the compact repair passes at all three emulated device sizes and the production/frontend checks pass. The full browser suite remains incomplete; do not claim a whole-platform pass. Changes have not been committed or pushed by this test pass.

## User-requested pause checkpoint

The owner requested postponing the remaining tests. The active Playwright process was interrupted; do not automatically resume it.

Before the pause:

- The corrected Grade 1 desktop journey passed.
- The first 339-case continuation reached 16 passes, three intentional live-database skips and a stale drawer assertion. The drawer now verifies ten challenge entries plus the quiz, and uses the current four-block loop budget. Its targeted desktop rerun passed (4.2 seconds).
- The subsequent 319-case run was allowed to collect failures rather than stop at the first one. It reached test 89 (phone Fix motion) when interrupted. This is not a completed suite or final result count.
- Ten completed failures were observed: desktop landing CTA, desktop catalog count, desktop final-module quiz CTA, two desktop school-setup expectations, desktop conditionals character expectation, desktop branch-overview bounds, and phone Byte/Dash/Gigi motion geometry. The landing/catalog/module assertions reference superseded UI; the other failures still require investigation. Do not call them all product defects or all stale tests without checking.
- Remaining work includes unrun phone/tablet checks and failed-case investigation/reruns. The project-scoped exclusion list records completed early desktop groups, not the entire interrupted run; replaying that list will intentionally rerun later desktop checks.

No product source was changed during this continuation, no live database tests were enabled, and nothing was committed or pushed. Preserve `test-results/` traces until the next resume, as a new Playwright run may replace them.
