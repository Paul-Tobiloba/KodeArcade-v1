# Byte Lab starters and tour — 17 October 2026

## Try it

- Public/device-only preview: http://127.0.0.1:5173/#/learn/grade-6/lab (also Grades 3–5).
- Signed-in learner: My courses → assigned grade → Byte Lab, or /#/student-play/grade-6/lab when that grade is assigned.
- Existing project: New project opens the three starters and a blank-project choice. Help → Replay Byte Lab tour opens the optional tour without replacing the project.

## Implemented

Space friends has independently programmed Byte/Dash speech and click scripts. Arrow-key adventure has four editable key-event scripts, coordinate reporters, arithmetic, safe boundary checks and on-screen arrow buttons for touch devices. Bounce around has a cooperative forever script and a native border-event bounce response; Stop ends it. These are ordinary serialized Blockly projects, not a special demo runtime. Children can change code, sprite art, scene, properties and title as in other projects.

Only an untouched blank project without onboarding metadata shows the first-use choice. Older nonblank or migrated work never gets replaced with an example. New/Open keep their confirmation and backup protection; cancellation retains the current slot. Replacement also remounts the actual native Blockly editor even when the next project reuses a sprite ID, avoiding a new title with an old canvas.

The five-step tour points at real Run/Stop/Reset, sprite selection, code area, art tabs and naming/save controls. It is nonmodal, skippable, replayable, keyboard operable, and offers opt-in device-local narration. Full-height callouts reuse the established target-adjacent positioning; narrow screens use above/below placement and ordinary page scrolling rather than internal card scrolling. Existing lesson tour defaults remain unchanged.

Optional `starter` and `onboarding` fields live in the validated version-1 private project. They round-trip through the existing workspace progress and JSON backup format. Old projects without these fields remain valid; an unfinished first tour may restart, but completed/skipped tours do not reopen automatically. Nothing imports public preview state into an account. No extra account, analytics, external AI request, database table or migration is added. Starter runs award no attempts, stars or challenge completion.

Deploy frontend and backend together: the shared strict project schema must recognize the two optional fields before the updated client sends them.

Small-screen first use hides the unused blank stage until a project is chosen; normal stage/editor layout returns immediately afterward. Reduced-motion rendering retains authored speech and wait timings instead of shortening them to animation timing.

## Design and boundaries

Impeccable onboarding guidance shaped the real editable examples, first-use-only cadence, easy skip and Help replay. The polish pass preserves the incumbent violet editor, approved Fredoka/system typography and existing character/scenery assets. No new raster, logo, global token or brand direction was created. DESIGN.md and .impeccable/design.json remain unchanged. The single scoped detector found no primary issues; its advisories concern the existing studio's compact type/color/radius differences, already recorded in studio-documentation.md.

Still one saved lab slot per assigned grade. Switching projects requests a browser backup download; the app cannot guarantee that the user retains that file. A multi-project gallery, public sharing, uploads and full Scratch compatibility are not implemented here. Broader browser regression remains paused; scoped tests are not whole-platform or educational/accessibility/security certification. No live child records, production database, VPS, n8n or AI gateway were modified. Work remains local on codex/auth, not committed/pushed.

## Verification

Frontend: 1,643 tests across 35 files passed, including eight new starter cases. Isolated synthetic progress API: 18 tests passed, including the new metadata round-trip in the existing private-project case. Production build and server TypeScript check passed; existing nonfatal bundle-size/dependency annotation warnings remain. Browser verification and capture inspection are recorded after the final scoped run below.

Scoped browser confirmation: 27 successful checks in total—12 starter/tour checks across desktop, phone and tablet; 13 existing editor checks across those devices; an additional older-unmarked-draft/blank-choice check; and the shared lesson tour's account-isolation/dismissal regression. Two short-wide desktop checks were intentionally skipped on phone/tablet. One tablet art test completed its assertions but failed on trace cleanup because a second run reused the output directory; its isolated sequential rerun passed. The initial pass found reduced-motion speech timings and buried mobile first-use choices; both were corrected before confirmation. A test-only position expectation was corrected to match the stage's actual coordinate-to-percentage mapping; decorative callout arrows were excluded from internal-scroll checks.

Desktop/phone/tablet chooser and first-step tour captures were opened and inspected, including refreshed small-screen choices after the fix. Native dragging, private reload, independent scripts, libraries, drawing/undo/redo, import/backup protection, malformed backups, replacement with the same sprite ID, optional tour completion/replay/focus, scoped axe checks and page width are covered. No new independent finish-review verdict is claimed for this refinement. The prior dedicated editor verdict remains scoped to that earlier work.
