# Workspace onboarding — 14 October 2026

Owner-approved direction: replace the duplicated standalone first-lesson page with lessons in the existing left panel and a short guided tour of real controls. Preserve KodeArcade's identity, responsive workspace, saved programs, module overviews, drawing and quizzes.

## Implementation

- `WorkspaceTour.tsx` spotlights the real mission, palette/command reference, editor, run controls and help heading. It uses a nonmodal dialog, clear skip/back/next actions and the existing opt-in device narration. Spotlight layers never intercept pointer events. No new media assets were created.
- Callouts size to their content and anchor next to the target: right/left when space permits, otherwise directly above/below, with a pointer identifying that relationship. Stacked screens bring targets below the header; large palettes/canvases use their visible upper section when a full-height callout cannot fit beside the entire target. Very short windows or enlarged text use ordinary document scrolling, never an internal card scrollbar. Resize/scroll observers are cleaned up on exit. The tour introduces no animated scrolling or forced practice gate.
- Grade 5–6 wording follows Blocks/Text mode. A real added instruction is acknowledged without implying successful execution. Arrival feedback can appear normally; the tour preserves its step behind it.
- First entry goes directly to the workspace. Manual Read lesson expands/focuses the existing guide; overview navigation retains topic journeys, lists, drawing and quizzes without the generic duplicate prose article.
- Tour dismissal is optional bounded progress metadata (`completed` or `skipped`) on the course's first mission. It round-trips through public saves and validated cloud snapshots. Student/public state stays separate. No migration, new database table or live-data operation is required.

## Evidence and boundaries

- 1,031 frontend tests passed, including four new storage/validation/cloud round-trip cases.
- Twelve dedicated onboarding browser cases passed across desktop Chromium, emulated Pixel 7 and emulated iPad (1.8 minutes). They exercise all six grade entries, skip/reload, module/quiz discovery, real block edits/runs, Back/Next, completed/replayed tours, typed code, lesson focus and synthetic student cloud save isolation.
- Initial verification was disrupted by browser/network suspension, and one first API attempt timed out in fixture setup. Those results are not counted as clean passes. The first browser batch also identified a quiz-label mismatch in the new test and a genuine hidden-panel focus timing issue; both were corrected before the passing confirmation.
- Screenshots for all five steps at all three device sizes were captured and inspected in a bounded batch. Impeccable onboarding guidance kept the tour contextual, optional and replayable; React review checked state, focus and observer cleanup without adding dependencies or telemetry.
- The scoped detector reported seven advisory findings and no primary findings. Existing global design-metadata drift remains untouched.
- Production build and server typecheck passed; existing Zod annotation/chunk-size warnings remain. No live Neon, email, VPS or AI changes were made.

The older broad browser suite remains paused at the owner's request. Tests that assume the removed standalone Start challenge page need alignment before that suite resumes; its previous results do not certify this new flow. Browser emulation is not physical-device/Safari or screen-reader verification. Automated tour accessibility checks do not certify Blockly editing accessibility.

Additional verification: all 12 progress API tests passed against in-memory PGlite, including saved tour dismissal without completion/stars and isolation from another pupil. All six updated course-entry/read-aloud browser checks passed across the three emulated layouts (45.5 seconds). That entry batch ran without a local account API and logged expected session-proxy connection failures; it is public-preview/narration evidence, not live adult authentication evidence. The dedicated student tour tests used synthetic API responses.

A final navigation guard prevents another course's drawing/quiz state from carrying into a newly selected course. Existing course-less drawing saves remain resumable. The all-six-course test additionally switches from Grade 1 drawing to Grade 2 and checks for its real workspace and tour; all three strengthened desktop/phone/tablet cases passed (1.1 minutes).

Scoped finish verdict: workspace-first entry and the five-step tour pass their dedicated three-device browser checks, and API persistence passes with an isolated in-memory test database. Changes remain local on `codex/auth`; no push or deployment is implied.

## Callout placement correction

Owner feedback identified an unnecessary scrollbar and detached bottom docking at a short-wide viewport. Removed both height caps and internal overflow; the card is 400px wide where space permits and 460px on short-wide screens. Placement now depends on actual free space around the target, not on a short-screen breakpoint. Six pure geometry tests cover side placement, full-width headers, bottom-edge targets, tall phone canvases and document-scroll fallback. A new 1308 × 590 browser case checks all five steps for content fit, viewport containment and 8–20px target adjacency. Existing three-device tour cases also assert no internal overflow. The complete frontend suite now passes 1,037 tests; production build passes with the known warnings. The final scoped layout detector reports no findings. No save, credential, backend or curriculum behavior changed in this correction.

Browser confirmation across the bounded batches: 13 unique cases passed and two desktop-only-case skips were intentional. The initial batch passed ten cases before a tablet assertion counted the decorative pointer as content overflow (`overflow-y` was visible; all content was inside the card). After separating content-fit checks from pseudo-element bounds, the three outstanding tablet cases passed in 31.3 seconds. The short-wide five-step capture, normal desktop, phone and tablet evidence confirms target-adjacent placement with no internal card scrollbar. Extremely short-window document scrolling is covered by the geometry test, not a physical-device claim.
