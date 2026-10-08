# Topic specialists and executable topics — 8 October 2026

This records the topic foundation and its current grade extension within Build & Play. It preserves the approved block K, violet actions, Fredoka heading voice, system reading/control text and local progress. Grades 1–6 are now mapped; previous age-course routes and saved work remain accessible. The full spiral curriculum remains a target.

## Implemented content

The legacy coding curriculum retains six topics with ten challenges each and one shared creative route project: 61 activities. Grades 1–6 now add 316 generated variant activities with distinct IDs and progress: Grade 1 has three topics/30 challenges + one project, Grade 2 four/40 + one project, and Grades 3–6 six/60 + one project each. These are not 316 independently authored or educationally validated curriculum tasks. Computer Explorers retains twenty activities. See GRADE_COURSES.md for the exact mapping and audio/voice/reward extension.

| Topic | Guide | World | Activities |
|---|---|---|---|
| Sequences | Byte the Robot | Robot City | 10 challenges |
| Direction & order | Dash the Rabbit | Compass Canyon | 10 challenges |
| Loops | Gigi the Gecko | Looping Jungle | 10 challenges |
| Debugging | Fix the Fox | Bug Workshop | 10 challenges |
| Conditionals | Milo the Monkey | Decision Jungle | 10 challenges |
| Variables | Nova the Squirrel | Treasure Grove | 10 challenges |
| Build project | Byte the Robot | Robot City | 1 shared project |

Topic specialists appear on the execution board and in concept lessons. Lessons open once per course/topic and can be reopened. Challenges retain four progressive hints, opt-in read-aloud, saved programs/completion and protected best star rewards. Specialist copy substitutes the appropriate character and star goal for Byte/charging-station wording. The project remains Byte's editable-destination route project, not one project per topic.

## Runtime teaching

`src/topicMissions.ts` authors ten conditional and ten variable missions and their reference block solutions. `src/blockly.ts` exposes the real blocks and delegates these missions to `src/dynamicProgram.ts`; neither topic is a static illustration of code.

IF checks whether the adjacent square in the selected direction is clear from the character's current position. Rocks and board edges are blocked. DO runs when clear; IF / ELSE runs ELSE when blocked. Checks execute again after movement or on each Repeat iteration. Runtime notes and highlighted blocks show the decision. Missions require IF, and designated missions require IF / ELSE, rather than accepting a plain route alone.

SET score replaces a named numeric value; CHANGE score adds or subtracts; Move by score reads the current value without changing it. Score begins unset on every run, so CHANGE and Move by score require a preceding SET. Frames animate value changes and movement, and the stage shows current and target score. A successful variable mission must reach the destination with the required score and use its specified operations. Runtime score is separate from the 1–5-star reward and is not retained between runs. Execution remains bounded: at most 24 instruction blocks, repeat counts 2–5, limited nesting, and operation/frame limits; no eval or typed-code execution is introduced.

The compact long-program overview edits the existing Blockly workspace and saved format. Its visible scope labels and accessible step names now include the full ancestor chain, including Repeat and IF DO / ELSE membership. This fixes the misleading assumption that every nested step was merely “inside Repeat.” Numeric values and directions can be edited through the overview, with execution highlighting and editing disabled during a run.

## Layout and assets

Larger screens retain the fixed two-panel challenge workspace beneath a 56px toolbar, with Play beneath the board. At viewport widths up to 950px or heights up to 600px, panels stack and the page scrolls beneath a sticky toolbar. Portrait phones use the refined 108px toolbar. The small-screen board surround is now 320–480px tall; the editor is 480–640px tall. World/character labels have reserved space outside grid cells. Palette scale is constrained by natural height and 43% of host width, independently of program scale. Move by score wraps over two lines to preserve room for the canvas.

`public/images/topic-cast.png` contains five actual specialist sprite cells, and `public/images/topic-worlds.png` contains five corresponding scenery cells. Both use a 3×2 atlas with one unused cell; Byte retains the existing application-rendered robot. Exact generation prompts are retained in `docs/TOPIC_CAST_ARTWORK.txt` and `docs/TOPIC_WORLDS_ARTWORK.txt` and embedded in the rasters. The implementation provenance scan reports eleven shipping rasters and zero missing prompts. Artwork is decorative; the board, cells, character position, goals, controls and text remain application-rendered elements.

## Grade progression boundary

Mission.size drives grid rows/columns, character sizing/position and the accessible board description. Grades 1–6 now use 5×5, 5×5, 6×6, 7×7, 8×8 and 10×10 respectively. Grade selection and generated topic variants supersede the earlier proposal-only boundary. Grades 1–2 use arrows and Grades 3–6 text blocks. Legacy missions remain 5×5 with their original IDs and progress. This mapping is KodeArcade progression, not formal school-standard alignment or delivery of the complete spiral.

No typed-code view, quizzes, separate mastery assessments, badges, per-topic projects, videos, accounts or backend ship in this extension. The future account/backend stack decision in PRODUCT.md remains deferred implementation work.

## Comparison with the incumbent system

`DESIGN.md` and `.impeccable/design.json` remain unchanged. The block K, violet/functional teal accents, plain reading/control type, rounded bordered workspaces and dark navigation remain consistent with that system. Local canyon, jungle, workshop and grove colors and the two atlases extend topic scenery; they are not replacement global palette tokens.

Pre-existing recorded drift remains: the generic 72/64px header, .8:1.5 workspace proportions and 750px container stacking in DESIGN.md predate challenge mode's 56px/108px toolbar and current responsive exception. Fredoka already extends to scoped scene/editor and reward headings beyond the narrower recorded principal-heading role. Mint scene/editor surfaces, gold reward styling, current drawer selection colors and workspace overlays also predate this topic extension. The sidecar retains older component samples, breakpoints, narrative and a nine-public-raster provenance statement rather than the complete current workspace inventory. Historical workspace notes also contain superseded 100px toolbar, 280–440px board and earlier raster counts. Their follow-ups and this document explain the current boundary; these differences are reported, not canonized as global rules or incidentally repaired.

## Evidence and finish status

Final evidence supplied by the implementation pass: 120 unit tests across nine files passed, including all twenty new reference solutions and renderer checks for five board dimensions. After the scope-label patch, topic flows passed across all three device projects (3/3), and dedicated branch-construction/overview checks passed on desktop and phone (2/2). Earlier compact checks passed across three projects (3/3), and actual touch-tap/laptop Nova checks passed (2/2). These are separate scoped batches, not one aggregate suite count. The production build passed after all source/CSS edits with the known Blockly chunk-size warning. Diff checking passed with CRLF warnings only; the provenance scan reported eleven shipping rasters and zero missing prompts.

The earlier topic reviewer disposition was ship at its two scored fixes: accurate compact branch membership and truthful PRODUCT.md scope. That verdict covers that earlier fix list only. Current grade-extension evidence is 444 unit tests across eleven files, a passing build with the known Blockly chunk warning, 32 browser passes with one intentional tablet skip, and six entry/read-aloud passes after review fixes. Its reviewer disposition is ship at three resolved fixes (landing availability/count, PRODUCT.md truth and the redundant grade eyebrow), with no material regressions in fix captures; see GRADE_COURSES.md. This is not global platform, curriculum or accessibility certification. This documentation pass inspected source and records rather than independently rerunning tests. Publication authorization follows the current user request, not this historical topic verdict.
