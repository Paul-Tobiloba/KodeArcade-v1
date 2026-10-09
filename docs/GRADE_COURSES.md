# Grade courses, audio and celebration — 8 October 2026

This ordinary extension implements grade selection and larger boards within the existing Build & Play identity. It supersedes the earlier proposal-only grade boundary in the topic and curriculum notes.

| Grade | Suggested age | Blocks | Board | Topics | Activities |
|---|---|---|---|---|---|
| 1 · First Adventures | 6–7 | Arrows | 5×5 | Sequences, directions, debugging | 30 challenges + 1 project |
| 2 · Pattern Explorers | 7–8 | Arrows | 5×5 | Above + loops | 40 + 1 project |
| 3 · Code Adventurers | 8–9 | Text | 6×6 | Above + conditionals, variables | 60 + 1 project |
| 4 · World Builders | 9–10 | Text | 7×7 | All six | 60 + 1 project |
| 5 · Logic Explorers | 10–11 | Text | 8×8 | All six | 60 + 1 project |
| 6 · Independent Creators | 11–12+ | Text | 10×10 | All six | 60 + 1 project |

`src/courses.ts` maps the grades; `src/gradeMissions.ts` generates 316 activities with grade-specific IDs, board dimensions, route lengths/orientations, reference solutions and topic requirements. These are generated variants, not 316 independently authored or educationally validated curriculum tasks. Concept lessons are reused and scoped by grade/topic in `src/curriculum.ts`. Ages are guidance, not collected birth dates or assessment gates. This is KodeArcade progression, without formal school-standard alignment.

`src/storage.ts` retains the version-1 save and separate course progress. Existing arrows, words and builder routes, the 61 legacy coding activities, saved programs, completion, protected star bests and project destinations remain accessible. New grade IDs keep their own progress; earlier completion is not invented for a new grade. Computer Explorers retains its twenty mouse/touch and keyboard activities.

## Audio and rewards

`src/sound.ts` supplies original local synthesized movement/retry/success/star cues and an eight-note motif for each of Byte, Dash, Gigi, Fix, Milo and Nova. These are synthesized profiles, not recorded animal sounds. Character effects default on; background music defaults off and has an independent saved control. Audio unlocks through a user gesture. Music pauses for narration, hidden tabs and success feedback; optional audio failures do not block activities.

`src/narration.ts` restricts read-aloud to installed local English voices. Automatic selection prefers a child-related voice name, then a known female voice name, then the first local English voice. The browser exposes no reliable age/gender field, so availability is device-dependent. `src/VoiceSettings.tsx` provides manual selection, unavailable-voice guidance and Preview voice. The selected URI uses the separate `kodearcade-narration-voice` key. No learner text is sent to a cloud speech service.

`src/FeedbackDialog.tsx` reveals earned stars only after successful execution. Its decorative burst contains 30 pieces and ends after 2.8 seconds; reduced motion removes confetti. Retry feedback and the persistent run log retain the earlier behavior. Stars measure the existing attempt/help policy, not quiz understanding or certified mastery.

## Layout, boundary and evidence

Desktop challenge mode remains fixed to 100dvh beneath the 56px toolbar, with Play below the board. At width ≤950px or height ≤600px it stacks and scrolls; portrait phones use the 108px toolbar. Tablet course titles truncate with an ellipsis. The current small-screen board surround is 320–480px and the editor is 480–640px. The palette remains independent of program scale, with the compact overview editing the saved Blockly workspace.

The 9 October extension adds bounded Python-style Text alongside Blocks for Grades 5–6, with independent saves. It supports route movement, repeats of 2–5, path-clear conditions and score assignment/update; it has no full Python runtime, imports, user functions or arbitrary expressions. The 32-objective V2 map is a curriculum target, not executable coverage or formal school-standard alignment.

Grade 1 Sequences is the first complete-flow topic journey: a captioned original silent 16-second diagram video with text/read-aloud equivalent, three-step guided example, ten retained generated core IDs with purpose prompts, two optional new bonus routes, repair, three visual arrow mastery items, a destination mini-project and a derived badge. Perfect stars and bonuses do not gate its badge. This is not a video library, ten newly authored lessons or formal educational validation. Other topic journeys remain planned. Media provenance is in SEQUENCE_LESSON.md.

Drawing practice supplies 34 activities (5/5/6/6/6/6) across Grades 1–6, including free creation, polygons, stars and stylised stellar dendrites. Grades 1–2 use arrow-led Blockly controls with numerals, Grades 3–4 readable drawing blocks and Grades 5–6 Blocks/Text. The stage becomes smooth white paper with the generated Dash pencil sprite; navigation, Blockly palette/code canvas, shared editors and Play below the stage remain consistent. Drawing supports bounded repeats of 2–12, three nested groups and at most 500 operations; advanced work uses distance, saved branch positions and pen lifting. Its independent drafts, tool choices, completion and protected best 1–5 practice stars do not confer core mastery, core stars or a topic badge.

Neon, Better Auth and Resend remain deferred. The current provenance scan reports 13 rasters and zero missing prompts; DRAWING_ASSET.md records the new sprite. `DESIGN.md` and `.impeccable/design.json` remain byte-for-byte preserved; older header/grid/breakpoint records and sidecar samples are pre-existing drift, reported in TOPIC_MODULES.md and the surface contract without repair.

Evidence supplied by the implementation pass: 444 unit tests across eleven files passed; production build passed with the known Blockly chunk-size warning; 32 browser checks passed with one intentional tablet skip across 33 checks. Six entry/read-aloud checks passed after the review fixes. The grade-extension reviewer disposition is ship at the three scored fixes: stale landing availability/count, PRODUCT.md truth and a redundant grade eyebrow. All three are resolved, with no material regressions in fix captures. The verdict covers that fix list, not platform, curriculum or accessibility certification. Earlier topic/workspace ship verdicts remain limited to their original scopes. This documentation pass inspected implementation and records; it did not independently rerun those checks.

Final V2 reviewer disposition: SHIP; all three original fixes are resolved with no material regression in the scoped batch. Initial fixes covered drawing overview ranges/scope, empty-example validity and documentation truth; follow-up overflow was addressed with list scrolling at all breakpoints and an automatic-height control row with a 44px Keys control. Supplied evidence: 30 curriculum-v2/grades/stable-canvas/rewards browser checks passed across desktop, phone and tablet in 3.1 minutes. Three stronger overview checks passed in 16.1 seconds, including scrolling to step 24, editing 130, reordering and deleting; captures were refreshed. Latest production build passed with the known 831KB Blockly chunk warning. The earlier 617 unit tests in thirteen files passed before subsequent UI-only changes. The original ten-pass/five-failure regression batch had stale character-label/mobile-height assertions, now updated and covered by the passing batch. The latest detector's 239 findings lack retained classifications and cannot support a zero-primary claim. These are supplied results, not independently rerun by this documentation pass; the ship verdict covers the three fixes only, not whole-platform, curriculum or accessibility certification.
