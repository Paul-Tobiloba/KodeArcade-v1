# Typing first release — 21 October 2026

## Implemented scope

Typing is separate from Coding in the public course chooser and course catalogue. Six grade courses have ten units and twelve activities per unit (120 per grade; 720 stable activity records). `shared/typingCurriculum.ts` contains sixty original unit seeds expanded through twelve reusable activity roles. These are functional activities, not 720 bespoke game scenes or independently piloted lessons.

The main practice surface uses the approved KodeArcade direction: violet header, lavender ground, native text entry, the original model, next-key/finger guidance and transparent child-friendly hands. Hand guidance is a suggestion; the application does not detect which physical finger was used. US English QWERTY is the only layout in this release. Physical keyboards are the intended practice device; touchscreen entry is possible but not evidence of finger technique.

Activity behaviors differ: patterns and copying require exact final text; garden games advance through supplied words/patterns; stories reveal supplied parts; repair tasks start with an extra character and finish when repaired to the supplied model; composition accepts original writing with a grade-dependent minimum word count. Early Grade 1 uses copying rather than open composition. Reviews use the previous unit's vocabulary, not an adaptive weak-key algorithm. All units are available without a speed lock.

Pause keeps the current text and restores its caret on resume. The keyboard guide, hands, larger text and reduced motion are adjustable. Tab moves out of the native input normally; there is no document-wide letter interception. Free writing is session-only with an explicit text download and confirmation on visible navigation/retry controls. Browser closing/reload prompts protect unfinished composition where browser policy permits; arbitrary address-bar/hash changes cannot be guaranteed to retain session-only writing.

## Results and rewards

Inserted characters, including replacements, count toward attempt accuracy against their model positions. Deletion does not erase an earlier mistype. Active time excludes blur/pause/hidden time. Copy-like tasks may show secondary WPM only after at least forty attempted characters, at least one second and no paste. There is no WPM pass gate; editing and composition do not receive copy accuracy/WPM grades. Completion and independent evidence are different fields.

Accuracy-based stars: 98% earns five, 95% four, 90% three, 80% two, otherwise one. Editing/composition completion receives three participation stars, not a fabricated accuracy result. Retries and guides never reduce previously earned best stars. Checkpoints default to guide-off; guide/paste use records supported practice. Default independent-check goals are 85/90/92/95/95/95% by grade. These are provisional product defaults, not age norms, gates or teacher-configurable settings in this release.

The video-inspired shared `RewardStars` component uses KodeArcade's own existing gold-star image. Five stars form an arc; earned stars arrive sequentially from above, rotate, overshoot and settle, with bounded small-star bursts and a masked shine. Continue remains available throughout. System or saved reduced motion presents final rewards without movement, shine or particles. The shared coding success dialog receives the same visual motion update, without changing coding scoring or saved achievements.

## Access and persistence

Public routes: `/#/typing/grade-1` through `grade-6`, optionally followed by a stable activity ID. Public progress uses `kodearcade-typing-v1:grade-X` in local browser storage, separate from coding and account drafts. Invalid/corrupt saves are not silently replaced; recovery download is offered. Save failures retain open state and offer backup/retry.

Student routes: `/#/student-play/grade-X/typing[/activityId]`. Student dashboard typing cards follow existing assigned grades. This release does not add independently assignable typing courses or separate teacher/parent assignment controls. Access still fails closed for an unassigned grade.

The existing private course document has an optional strict, bounded `typing` field: version, current activity, at most 120 results and guide preferences. Only result summaries are retained, never raw typed writing. Cross-grade/fabricated IDs and unrecognized fields are rejected. The existing private CloudSaver and encrypted device-recovery pipeline handle account persistence. Older coding clients omitting typing do not delete it; best results survive merges. Coding counts/results remain separate. API summaries expose separate typing totals, stars and independent-check counts, but dedicated teacher trend reports/weak-key analytics are not included.

Deploy frontend and backend together. The optional JSON field needs no database migration. Nothing has been pushed or deployed by this implementation task.

## Deliberate first-release limits

No UK-layout selector, placement recommendation engine, adaptive weak-key review, spoken instructions, teacher-adjustable checkpoint goals, portfolio storage, public sharing, public leaderboards or standards-alignment claim. The original proposal remains a longer-term curriculum direction; classroom piloting and fuller bespoke content authoring are still appropriate before making curriculum effectiveness claims.

## Evidence

Final production build and frontend/server typechecks passed. The frontend suite passed 49 files / 1,983 tests; the progress API suite passed 24 tests against isolated PGlite. The final typing/dashboard/public-Labs browser run passed 60 checks (20 each on desktop, phone and tablet), and the separate shared reward run passed 12 checks across those devices. An earlier 33-check typing/reward run also passed but is not added to these final counts. `git diff --check` passed, with the existing CRLF warning. Existing build chunk/Zod annotation warnings were non-failing.

Functional evidence includes `src/typing.test.ts`, `e2e/typing.spec.ts`, `server/progress.test.ts`, shared-progress/cloud regression suites, existing reward and dashboard tests. Private browser account/API requests use synthetic fixtures; API tests use an isolated database. A separate production-build smoke at `http://127.0.0.1:4173` selected Grade 1, opened Start typing, physically entered `f j`, reached five stars and confirmed five saved stars in the public local namespace, with no page errors. This does not claim a live production account/backend test.

The fresh finish review in `.impeccable/review/typing-finish.md` records `disposition: ship` and no material fixes. Required lesson/result/map/motion captures across desktop, phone and tablet, the 1306×656 short-desktop capture and shared coding reward captures were opened and validated by the builder/reviewer. Still captures establish composition; source and browser assertions support motion behavior. The documentation comparison is `.impeccable/review/typing-documentation.md`; the full-flow environment boundary is `.impeccable/review/typing-verification.md`.

The scoped asset scan reports two referenced shipping rasters and zero missing provenance. Hand origin is retained in `.impeccable/assets/typing-hands-origin.txt` and `public/images/typing/child-hands.webp.json`; the existing star retains its embedded prompt and `.impeccable/assets/reward-star-prompt.txt`. No new star raster or video pixels were introduced. This is a local built preview on port 4173; nothing was pushed or deployed, and no production account/database was exercised.

## Next requested topic

After typing completion, return to coding curriculum enhancement and revise coding reward grading so repeated learning attempts do not penalise children. This is the next planned topic only. The typing release leaves coding curriculum, retry/hint grading and saved coding achievements unchanged.
