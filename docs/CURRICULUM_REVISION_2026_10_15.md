# Consolidated foundations and data modules — 15 October 2026

Owner request: combine Sequences with Direction & order to remove repetition, and introduce statements/arguments, objects and lists in Grades 3–6. This narrow revision supersedes the older six-topic availability/count statements and the original objects-introduction placement, not the retained master curriculum document.

## Released scope

All six current grade courses have one **Sequences, directions & order** module: five early sequence tasks followed by five obstacle/order tasks (original direction slots 3, 4, 6, 8 and 10). A single three-section lesson explains instructions, screen directions, safe ordering and prediction/testing. No second required direction module or direction quiz. The existing sequence quiz already assesses sequencing, direction and order; its question/answer ordering is unchanged so historical scores retain their meaning.

Grades 3–6 add three available modules with six authored activities and a five-question, age-banded quiz each:

- Statements & arguments: movement calls, direction/distance arguments, statement count versus executed steps, ordering inputs and (Grades 5–6) repeated calls. Parameters are distinguished in the lesson; defining functions is not implemented.
- Lists: ordered numeric values, zero-based indexes, repeated reads and append; indexed replacement from Grade 4, repeated reads in loops in Grades 5–6.
- Objects: a named robot record with speed/energy properties, reading and independent updates; repeated property reads in Grades 5–6 and list-to-property copying in Grade 6. These are introductory **data objects**, not full OOP, classes, methods or inheritance. Python-style text uses dictionary syntax.

Grade 1 has 20 core challenges plus a project; Grade 2 has 30 plus a project; Grades 3–6 have 68 plus a project. There are 72 new tasks (18 per older grade). Older grades share introductory tasks, with targeted increases in composition; this is not a claim of four completely independent curricula or educational validation. Events, expressions/Boolean operators, user-defined functions/returns, strings, searching/sorting, APIs and integrated games remain separate future work. The existing route project has not been upgraded into a data capstone.

## Runtime and interface

Native Blockly blocks and keyboard helpers expose argument, list and object fields. Grade 5–6 text supports explicit movement calls, list creation/append/index assignment/read and robot record creation/property assignment/read/copy. Interpretation is bounded: no eval, imports, arbitrary expressions or arbitrary object keys. Data values 0–9, lists 1–8 items, up to three nested groups; existing 120-frame/500-operation/instruction limits remain. Data resets each run and is visible in trace notes; reading alone never removes an item or consumes energy.

Existing workspace, responsive editor, saved code, rewards and module quiz UI are reused. Byte provides authored, on-device explanations for these concepts; the private adult AI gateway is not enabled for the added topic keys. Child AI access remains unchanged.

## Compatibility and reporting

Original generated missions remain in their original order, with original IDs, coordinates and semantics. New missions append after existing replacements. Public saves use numeric indices, so active-topic order never controls old mission generation. Retired practice maps to the merged module; saved retired work can be reopened from the optional Previous practice section and resumes without Challenge 0. Earlier Grade 1 badges stay earned without assigning completion/stars to new tasks.

Existing direction quiz records remain accepted and preserved, with their original question bank. They are not counted as a separate active quiz. New module quiz records persist through existing JSON progress. The initial per-course bound was ten including the retained direction record; the versioned-quiz follow-up below raises it to nineteen. Current active quiz totals: 3 / 4 / 9 / 9 / 9 / 9.

The generated shared progress catalog contains active required IDs for denominators and all historical missions for validation/resume. Existing attempts, code and best stars are not deleted. Course percentages can change because the required task set changed; historical optional achievements are not silently credited to different tasks. Teacher/parent summaries consume the shared catalog and active quiz IDs. No database migration or live data mutation is required. Frontend and backend should deploy together so their catalogs agree.

## Verification

- 1,126 frontend tests across 28 files passed, including 89 new block/text execution, invalid-input and compatibility checks. Every new reference program runs successfully in both representations.
- All 133 synthetic backend tests across 14 files passed. The targeted progress file has 13 passing cases, including saving data-module work and server-computed teacher quiz reporting. No live database/account was used.
- All 12 new browser journeys passed across desktop, phone and tablet: six-grade module discovery plus student execution, autosave/reload, Byte authored help and quiz persistence. Quiz regions passed scoped axe checks.
- Batched screenshots exposed a phone palette-width defect. Narrow-phone data-block palettes now scroll horizontally above the full-width code canvas. Four phone checks passed after the correction, including palette height/readable-program geometry. Desktop/tablet retain their existing vertical palette.
- Production build and server typecheck passed; existing chunk-size/Zod annotation warnings remain. Final frontend test pass is after the responsive correction.
- Scoped Impeccable scans returned no findings for the new instructional/editor components and the final layout scan. Source diff whitespace checks passed.

Initial browser assertions were corrected to wait for the full ten-frame trace plus arrival animation (rather than five seconds) and to exclude Blockly’s hidden trash palette from geometry measurement. A temporary malformed JSX edit was caught by the build and repaired before the successful final build/phone run.

The paused broad browser regression suite was not resumed. Older tests that expect standalone lesson entry, separate direction navigation or prior counts/selectors still need migration. These results do not certify the full master curriculum or live production deployment. Changes remain local on codex/auth, uncommitted/unpushed.

## Follow-up request

The owner clarified senior grades as **Grades 4–6** and explicitly requested real new code blocks for advanced concepts. Those grades now use forward/backward and 90° left/right route turns. Grades 5–6 also expose 90°/180°/270° degree turns on the square grid. Drawing keeps its existing arbitrary supported angle controls, including 45°/60° examples. Grades 1–3 retain screen-direction movement.

Every run starts facing right. Turns stay on the same square; backward does not reverse facing. A visible text readout and character-adjacent arrow show heading, which is included in runtime frames but never substituted for saved program data. Relative path checks and distance reads from score/lists/object properties use the current heading. Fresh debugging starters and reference hints use relative code; already saved absolute blocks/text are not converted and keep their original screen-relative meaning.

Advanced code palettes now introduce distance-argument, list creation/read/append/replace and object creation/read/update/list-copy blocks progressively. Append/replacement/property updates appear in the activities that require them. Senior IF/ELSE and score-change blocks also follow the task requirements. Runtime compatibility still accepts earlier saved instructions. This does not add functions, returns, general expressions or OOP.

Senior compact instruction budgets allow up to three times their earlier written-block budget (capped at 24) to accommodate explicit turns; execution/depth/data bounds remain. All 261 senior activities have passing converted relative block and text reference programs. The legacy quiz banks are unchanged to avoid reinterpreting saved answers; lessons explicitly explain their older absolute-code notation. Heading-specific assessment banks were deferred in this extension and implemented in the versioned follow-up below.

## Versioned senior quizzes — 15–16 October follow-up

All nine active module quizzes in Grades 4–6 now use explicitly versioned IDs, such as `grade-5-loops@2`. They provide five authored concept questions each, with answers and explanations covering facing, relative movement, turn angles, argument distances, loop state, relative checks, variables, lists, named properties and project reasoning. Grade 4 uses readable 90° turn concepts without degree-call syntax. Grades 5–6 use bounded Python-style examples and 90°/180°/270° grid turns; Grade 6 adds the taught list-to-property value-copy trace. These are learning checks, not proctored or educationally validated assessments. Grades 1–3 and legacy course banks are unchanged.

Plain quiz IDs always select their original bank and answer ordering. Record `version: 1` still identifies the JSON record format, not the question bank. No existing answers are moved, cleared or rescored against the new questions. Explicit navigation IDs preserve the exact old/new draft on reload. A previous quiz can be reopened from the module entry or version controls, continued or retried; its best result and attempts remain separate. Current quiz totals count only current bank IDs; teacher and parent reports disclose saved previous results separately, including drafts, without exposing answer arrays or code.

Shared validation accepts only the registered course/version combinations (up to nineteen banks per senior course: nine current, nine original and one retired direction bank). Public-device parsing uses the complete allowlist rather than truncating after sixty records, preserving work across all six public grades. Server scoring and best-result preservation use each record’s exact bank ID. No database migration, live account mutation or deployment is required for local verification; deploy frontend and backend together.

Verification: 1,447 frontend tests across 30 files and all 134 synthetic backend tests across 14 files passed; the final production build and server typecheck passed (known chunk-size/Zod annotation warnings remain). Fifty new version tests cover immutable whole-bank fingerprints, zero-vs-five score separation, old/new draft/navigation cloud round trips, independent protected bests, all-grade record retention, invalid revisions, question completeness and executable trace examples. One test exposed a list-replacement example that used an unavailable block in the object palette; the new example now recreates the list using the actual supported object-task palette.

All 24 distinct scoped browser journeys passed across desktop, phone and tablet: twelve data-module journeys in the first batch and twelve quiz/version/report journeys in the final confirmation batch. The initial 24-case run had 23 passes and one genuine phone accessibility failure: a parent challenge table with horizontal overflow could not receive keyboard focus. Both parent report table wrappers now have keyboard focus and descriptive labels; all twelve quiz/report cases passed in the single confirmation batch after that correction. Scoped axe checks passed for quiz regions and report tables. The test fixtures now mock the session endpoint as well, eliminating initial connection-refused proxy noise from the deliberately stopped account backend.

The bounded visual review inspected full quiz/report states plus readable control/history detail captures on desktop, phone and tablet. Existing controls, focus treatments and native history disclosures remain; narrow report tables retain keyboard-accessible horizontal scrolling instead of overflowing the page. The scoped Impeccable source scan exited zero with no primary findings. No new artwork or global design tokens were introduced; older design-sidecar drift remains outside scope.

Verification boundaries: learner clicks and radio changes saved exact bank IDs/answers through mocked student-progress requests; reload restored old or updated drafts and results; isolated PGlite API tests exercised authenticated writes, course/revision validation, server scoring and private reporting; teacher/parent browser fixtures rendered those shared report shapes with current totals separate from previous scores. No live Neon database, email, account, VPS or n8n instance was used or changed. The temporary Vite test server stopped after the run. This is scoped synthetic verification, not proof of a deployed production journey or formal curriculum validation.

Broad paused browser regression remains paused. Changes remain local on `codex/auth`, uncommitted/unpushed. Next curriculum work remains operators/Boolean logic, followed by user-defined functions; neither is implemented by this quiz update.

Earlier relative-control verification, before the quiz follow-up: 1,397 frontend tests across 29 files passed, including 271 relative-movement/reference/compatibility/progressive-palette tests. Build and server typecheck passed. The nine synthetic Byte boundary tests passed; relative activity help stays on-device, with no child AI activation. All 24 scoped browser checks passed across desktop/phone/tablet; after a teaching-copy correction, all 12 relative-movement checks passed again. Coverage includes grade boundaries, turn/facing behaviour, progressive palettes, saves/reloads, preserved code across responsive re-injection, scoped board accessibility and on-device Byte help. Refreshed screenshots confirm readable phone code and visible facing arrows. The first palette assertion was corrected to switch Grades 5–6 from their default Text mode to Blocks before inspecting the palette. Impeccable reported no primary findings; existing design-sidecar palette/type advisories remain, without a global design-system rewrite. The broad paused regression suite remains paused. No live database changes or pushes.
