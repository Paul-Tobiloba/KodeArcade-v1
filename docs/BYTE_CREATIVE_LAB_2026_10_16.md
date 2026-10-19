# Creative projects and Byte Lab — 16 October 2026

## Dedicated editor follow-up — current free-build implementation

This section supersedes the single-programmable-sprite free-lab description below. The three assessed mini-projects keep the original bounded lesson workspace and grading; only the separate free-build slot uses the new project editor.

- Compact KodeArcade project toolbar, name, truthful save status, New/Open/Download/help/account controls, Code/Costumes/Backgrounds tabs.
- Stage and Run/Stop/Reset on the left; visual sprite selection and properties; visible category rail, native Blockly flyout and a large scripting canvas. Wide short desktops remain side by side; tablet and phone layouts stack.
- Up to four independently programmed sprites. Real event hats for Run, sprite click, arrow/space key, edge and another sprite; cooperative scheduling, per-sprite numeric variables, typed operators/Boolean logic, functions, repeat 1–100 and bounded forever.
- Categories: Events, Motion, Looks, World, Control, Sensing, Variables, Operators, Functions and Output. Actions include movement, turns, size, show/hide, speech/timed speech, costume/background switching, waits and numeric output.
- Seven approved character costumes and four approved background images. Painting supports pencil, eraser, line, rectangle and ellipse, filled/outlined shapes, color/width, undo/redo and keyboard coordinate entry. Edit a copy starts from approved library artwork without modifying its source asset.
- A validated version-1 project in progress.workspace.byteStudio stores title, sprites and independent code, costumes/backgrounds and drawing strokes. Existing authenticated course-private saves/recovery are reused; preview drafts stay local and separate. Old saved registrations become event hats while the original workspace is retained under legacy.
- JSON backup download and Open project validate format and size. New/Open request a current-project backup and confirm before replacing the one saved slot. Invalid saved projects/imports are preserved, not silently reset.
- Runtime resets on Run; selecting sprites changes the script being edited. Runtime position, speech, variables and pending events are not resumed after reload. Stop disposes execution and ignores events until Run again.
- Limits: 4 sprites, 24 assets, 12 costumes/sprite, 40 strokes/asset, 2,000 total drawing points, 90 KB project data, 64 non-start blocks/sprite, 32 queued tasks, 10,000 scheduled steps per run, 500 operations without yielding, 4 definitions/sprite and no recursive calls. Coordinates remain ±100, numeric values ±1000, movement ±200; contact is bounded centre-distance sensing, not pixel/physics collision.
- Free building remains unscored: no stars, completion, attempts or quiz requirement. No public sharing, external image uploads, arbitrary code execution, broadcast, physics, sound composition or live child AI. This is a bounded project editor, not full Scratch/ScratchJr compatibility.

No new raster was generated; approved incumbent artwork is reused. A read-only provenance scan found 39 rasters and zero missing prompts/origins. No production/VPS/n8n/database/account changes or GitHub publication were performed.

## Shipped scope

Owner-approved extension of the Operators, Boolean logic and Functions work: Grades 3–6 each have three integrated mini-projects and a separate free-build draft. Creative coding sits after Objects, before the retained route project. Each older grade now has 89 required core activities plus its route project and 13 current quizzes. Byte Lab does not add a completion, stars or a quiz requirement.

The studio reuses the existing activity guide, Blockly editor, keyboard builder, account menu, Play/Stop/Reset, hints and save feedback. It is a bounded Scratch-style creative environment, not Scratch/ScratchJr compatibility. There is one programmable main character and one selectable, positionable touch target. Multiple independently scripted sprites, costumes, uploads, public sharing, sound composition, broadcast messages, keyboard events, physics, arbitrary named variables and complete games remain future work. The existing adult-only private AI lab at `/#/byte-lab` is unchanged and separate.

## Entry and save ownership

- Student dashboard: **Open Byte Lab · Grade N** for assigned Grades 3–6 courses, opening `/#/student-play/grade-N/lab` through the existing enrolled-learner and course-assignment checks.
- In any Grade 3–6 activity: open the module drawer and choose **Open Byte Lab**.
- Public preview: `/#/learn/grade-N/lab`; preview work stays device-local and separate from private learner work.
- Three scored tasks use `grade-N-creative-1` through `-3`; the unscored draft is `grade-N-creative-4`. Original mission positions and saved tasks are untouched; sixteen new missions append to the catalog.
- One free draft per grade/course. Block layout, speech fields and initial scene settings save together through the existing private cloud/offline-recovery pipeline. Scene settings are serialized as validated JSON in the start block's `data` field; no database schema migration or new account store.
- Play always resets runtime state. Subsequent clicks retain position, score, output and executed constructs from that run. Reload restores the draft and scene choices, not the running animation or transient event state.
- Free runs do not increment attempts, set completion, award stars or open the reward dialog. Even a forged sandbox completion does not enter the catalog's scored challenge denominator. Existing achievements and historical quiz banks remain protected.
- Backend and frontend catalogs must deploy together. No live deployment, database mutation, n8n or VPS change was performed.

## Blocks and stage

The native **Block category** selector changes the real draggable flyout; the keyboard builder can insert and edit every available block. Categories: Events, Motion, Looks, Control, Sensing, Variables, Operators, Functions and Output.

Actions include forward/backward with numeric expressions, turns of 0–360°, GO TO, border bounce, say text, say number, switch character, switch backdrop, show/hide and bounded wait. Sensing returns Boolean border/character touch results. Operators, `score`, IF/ELSE, repeat and functions compose with actions. Grades 3–4 use no-input functions; Grades 5–6 expose numeric parameters and returns, with composed/nested calls limited to Grade 6. Creative work uses Blocks at every grade; its bounded teaching-text compiler is used for authored reference and runtime tests, not presented as full Python or a new text editor feature.

Seven existing characters and four existing scene images are reused: Byte, Dash, Gigi, Fix, Milo, Nova and Pip; sky, city, meadow and horizon. No new raster asset was generated. Sprite artwork remains upright while a labelled arrow communicates heading. Speech is React-rendered text, not HTML, with a 120-printable-character bound; children are reminded not to include personal details. Authored Ask Byte creative help stays on-device, with live AI disabled for this topic.

Coordinates range from −100 to 100 with centre (0, 0); right increases x and up increases y. Heading begins right at 0°. Forward follows heading; backward does not turn the sprite. Turns are not restricted to the grid route's quarter turns. MOVE walks the path in increments of at most ten units, so crossing the other character triggers a touch even without landing there. Touching is a bounded centre-distance check (20 units), not pixel-alpha collision or physics. GO TO teleports and checks only its destination. Movement stops at a border; bounce reflects heading for the next MOVE.

## Event semantics and bounds

An event registration is an instruction connected directly below Play, with a response inside DO. This is intentionally not a free-floating Scratch hat. It registers a handler rather than executing its body. Register handlers before the actions that should trigger them. Supported events are sprite click, border contact and other-character contact, one handler per event.

Click/tap/keyboard activation of the main character fires its click handler after Play. Declarations are reconstructed without rerunning initialization and without disconnecting or rewriting the child's blocks. Touch handlers fire on a transition into contact, not every frame while overlapping. Moving away and entering again can trigger again. Event chains are bounded, including recursive contact handlers.

Per run/click: 64 non-start blocks including input values; 500 operations; 120 trace steps; 16 triggered events; 24 numeric/Boolean outputs; repeat counts 2–5; four function definitions; no recursion; at most three nested instruction groups. Numbers remain finite within ±1000, MOVE distance within ±200, stage coordinates within ±100, waits between 0.1 and 2 seconds. Stop/reset cancel scheduled playback; reduced motion removes sprite sliding.

## Integrated tasks and assessment

1. **A character with a plan:** calculate score, compare it, choose a branch and call a reusable function; senior grades use a numeric return to supply movement distance.
2. **Meet another character:** combine a touch event, Boolean AND, score equality and a greeting function.
3. **Bounce and respond:** combine multiplication, a comparison, loop, function and border event.

Hints are more guided in Grades 3–4 and decomposition-oriented in Grades 5–6. A five-question Creative coding bank checks event registration, bounce, sensing, Boolean logic and function reuse/inputs. Old quiz content and answer ordering are not rewritten. The maximum retained records rises from 31 to 32 for seniors to include this new topic; only current bank IDs count in reports.

The runtime checks required executed constructs, target score, final x/speech, event occurrence and minimum calls. It is practice feedback, not proctored proof of the exact intended source program or formal curriculum validation.

## Verification

Local unit and synthetic API evidence covers authored references, categories, grade bands, turns/backward, crossing/re-entry, border bounce, repeated clicks retaining state, non-mutating declaration reconstruction, event bounds, type/errors, metadata sanitation, speech-as-data, private save roundtrip and report exclusion. Browser checks cover dashboard entry, guided completion/quiz, category selection, scene choices, repeated clicks, keyboard editing, reload, no awards, scoped accessibility and document width on desktop, phone and tablet. See the final task response for completed batch counts. Broader browser regression remains paused.
