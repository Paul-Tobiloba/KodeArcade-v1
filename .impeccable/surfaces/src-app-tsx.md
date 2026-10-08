---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/LearningEntry.tsx","src/BlockEditor.tsx","src/FeedbackDialog.tsx","src/MissionStage.tsx","src/VoiceSettings.tsx","src/course.css"]
---

# Grade learning workspace — 8 October 2026

Mode: Operate. Ordinary code-led extension of Build & Play, preserving local progress, concept-once lessons and mouse/touch/keyboard affordances. This current contract supersedes the earlier proposal-only grade boundary and obsolete 100px phone toolbar/280–440px board measurements.

## Direction contract

THESIS: Choose Grade 1–6, then build a readable program and watch its character-led world react. Keep the desktop task, board and editor together, with supportive rewards after execution.

OWN-WORLD: Preserve the block K, violet actions, Fredoka headings, plain reading/control type, deep ink drawer and topic scenery. Byte guides sequences/projects; Dash directions, Gigi loops, Fix debugging, Milo conditionals and Nova variables. Semantic playable cells and controls stay above decorative artwork. No replacement identity or concept seed.

STORY: Choose a grade, meet an idea once, build, run, notice, revise and celebrate briefly. Lessons can be reopened. Challenge stars remain separate from future conceptual assessments.

FIRST VIEWPORT: Course entry exposes six grade choices, suggested ages, board sizes and actual coverage without redundant grade eyebrows. Larger-screen challenge mode owns 100dvh beneath a 56px toolbar: board and editor stay visible, with Play beneath the board and no document scrolling. At widths ≤950px or heights ≤600px, stack the board above the editor and allow page scrolling beneath the sticky toolbar. Portrait phones use a 108px toolbar; small-screen board surround is 320–480px and editor is 480–640px. Long tablet course titles truncate with an ellipsis. Lessons retain normal reading scroll.

FORM: Extend the incumbent entry and three-area Blockly workspace. One palette supports drag or tap-to-append, independently sized from the program and constrained by natural height and 43% of host width. Move by score wraps over two lines. Ordinary programs fit; below .55 Blockly scale, an editable readable overview exposes ancestor Repeat and IF DO / ELSE scope, direction/count/value editing, selection, ordering, deletion and execution highlighting. Changes edit the existing saved Blockly program. Keyboard helpers sit beyond measured palette width. Navigation, preferences, lessons and hints open on demand.

SIGNATURE: After successful execution, reveal earned stars with optional soft character cues and a 30-piece confetti burst lasting 2.8 seconds; reduced motion removes confetti. Original device-local synth profiles and sparse eight-note themes have separate effect/music controls, with music off by default and gesture-unlocked. Music pauses for narration, hidden tabs and success feedback. Retry feedback lasts three seconds with its explanation retained in the accessible run log.

FINISH: Unreviewed and undocumented is unfinished. Record the finish verdict and provenance evidence; preserve incumbent DESIGN.md and its sidecar for this ordinary extension.

## Current implementation boundary

Grade 1 has sequences, directions and debugging: 30 challenges + one project. Grade 2 adds loops: 40 + one project. Grades 3–6 include all six topics, adding conditionals and variables: 60 + one project each. Boards are 5, 5, 6, 7, 8 and 10 squares per side. Grades 1–2 use arrows, Grades 3–6 text blocks. The 316 new activities are generated variants with distinct IDs/progress, not independently authored or educationally validated curriculum tasks. The 61 legacy activities, arrows/words/builder routes and saves remain accessible; Computer Explorers retains twenty activities.

IF and IF / ELSE evaluate adjacent clearance from the current square. SET, CHANGE and Move by score use a number initialized each run; the number is separate from reward stars. Grade/topic lessons reuse existing concept teaching. No formal standards alignment, typed language, quizzes, separate assessment gates, badges, per-topic projects or videos are supplied. Neon, Better Auth and Resend remain the chosen deferred backend stack.

Opt-in read-aloud uses installed local English voices. Automatic selection prefers child-related names, then known female names, with no API age/gender guarantee. Settings offers manual voice selection and Preview voice; the URI is saved under a separate key. No child text is sent to cloud speech.

## System preservation and finish status

DESIGN.md and .impeccable/design.json remain unchanged. The eleven shipping rasters retain provenance with zero missing prompts reported. Topic atlases and scenery extend the incumbent world without becoming replacement global tokens.

Pre-existing drift is reported, not repaired or canonized: recorded 72/64px headers, .8:1.5 proportions and 750px stacking predate challenge mode's responsive exception; Fredoka roles, mint/gold workspace surfaces, drawer states and overlays have expanded beyond older records. The sidecar retains older samples/breakpoints and a nine-raster provenance statement. See docs/TOPIC_MODULES.md.

Earlier compact-workspace and topic-extension ship verdicts cover their original four-fix and two-fix scopes only. The current grade reviewer disposition is ship at the three scored fixes: stale landing availability/count, PRODUCT.md truth and the redundant grade eyebrow. All three are resolved, with no material regressions in fix captures. This verdict covers those fixes, not global platform, curriculum or accessibility certification. Supplied evidence: 444 unit tests across eleven files passed; production build passed with the known Blockly chunk-size warning; 32 browser checks passed with one intentional tablet skip; six entry/read-aloud checks passed after review fixes. This documentation pass inspected source and records, without independently rerunning those checks. Exact grade/audio boundaries live in docs/GRADE_COURSES.md.
