---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/BlockEditor.tsx","src/FeedbackDialog.tsx","src/MissionStage.tsx","src/course.css"]
---

# Learning workspace rewards — 8 October 2026

Mode: Operate. Scope: current Byte workspace and feedback, preserving course selection, current-course drawer, block/touch/keyboard affordances, concept-once lessons and local progress.

## Direction contract

THESIS: Give the child a readable task, an inviting meadow board and a working program canvas; keep rewards supportive rather than turning practice into a grade screen.

OWN-WORLD: Retain the block K, Fredoka headings, deep ink rail and violet action buttons. Add a mint-and-green illustrated board surround, a pale violet editor heading and warm gold stars; all playable cells and controls remain semantic interactive elements.

STORY: Choose a course, meet a concept once, build and watch Byte, then either celebrate earned stars or adjust after a brief clue. Stars and future conceptual assessments remain separate.

FIRST VIEWPORT: The challenge owns the screen beneath one 56px toolbar. Hide duplicate course/breadcrumb/title/instructions, hint banner, star explainer and editor labels. The actual 1308×677 laptop viewport must retain a 300px-or-larger board and a 450px-or-taller editor, Play beneath the board, every available palette choice visible and no document or canvas scrollbars, wheel scrolling or panning. One real Blockly palette supports dragging or tapping to append; do not add a duplicate arrow inventory. Ordinary bounded programs automatically fit the canvas. When fitting would reduce Blockly below .55 scale, show readable ordered step tiles with a minimum 44px target, arrow/repeat/count/nesting cues, selection, earlier/later/delete actions, repeat-count editing and execution highlighting. These edit the underlying saved Blockly program. Keep palette sizing independent of program scale and position keyboard helpers beyond its measured width. Navigation, lessons, hints and preferences open on demand; disclosures never take workspace height. Phones stack the board and its Play controls above the editor beneath a two-row 100px toolbar. Lessons remain scrollable reading pages.

FORM: Existing three-area learning workspace extended from the user's pinned 8 October screenshots. Code-led local extension; no concept-seed or new composition round. Signature interaction: earned stars appear in sequence with one soft chime each, only after Byte's run completes. Retry notice lasts three seconds, with persistent text available in the run log.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

Latest responsive exception (8 October): the user explicitly replaced the no-scroll requirement on smaller screens. At widths up to 950px or heights up to 600px, allow normal vertical page scrolling, stack board above editor, retain a sticky toolbar, give the board surround 280–440px height and editor 480–640px height. Larger screens keep the fixed no-scroll workspace. This supersedes the phone portion of FIRST VIEWPORT above, without changing the established brand or larger-screen composition.

Latest navigation direction: replace toolbar stars with a physically centred course/topic label and challenge markers. Completed challenges show green checks; the current challenge has a violet outline. Markers navigate within the active topic. Smaller screens show a five-challenge window with the full list in the drawer. Earned stars remain in the success dialog, not the top navigation.

Mobile icon refinement: group lesson/listen/hint together beneath progress; separate the labelled Courses library link from these tools. Use the panel icon only for the sidebar toggle. Portrait mobile header and drawer inset are 108px after this refinement.

Do not invent quiz-ready state, locks, functions modules, avatars/accounts or unavailable games from the sample screenshots. Preserve Play beneath the board as explicitly requested earlier and shown in the retry reference. New curriculum requirements live in SPIRAL_CURRICULUM.md; this pass does not implement 440 tasks. Landing backgrounds remain deferred. Pre-existing design-sidecar drift is reported, not repaired incidentally.

## Finish status

Current compact-layout finish disposition: ship at the four scored fixes. The reviewer resolved the readable 24-step overview, the current violet outline around a completed green check across screen sizes, keyboard helpers offset beyond the measured palette, and updated documentation. Nine refreshed fix captures showed no material regressions. This verdict covers those fixes; implementation, final verification and provenance evidence live in `docs/WORKSPACE_REWARDS.md`. It is not a global platform or accessibility certification.
