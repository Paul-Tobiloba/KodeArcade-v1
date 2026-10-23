# KodeArcade revised grade-by-grade curriculum map

Version: V3 proposal, 20 October 2026. Scope: Grades 1–6, with readiness-based placement for older beginners.

**Status: planning document, not a release or an implementation claim.** The owner approved the direction of this revision. The units, assessments and reward model below still require content authoring, technical validation and learner/teacher pilots. This document changes no live lessons, project saves, progress records or stars.

## First implementation amendment — 21 October 2026

The proposal and 20 October baseline below remain historical. The owner subsequently approved resuming V3 with app-checked practical tasks only. The first implementation phase now provides G2-U2 **Tap, hold, release** and G4-U6 **Basketball bounce: reusable actions**, using bounded guided instruction editors and fresh behavior/prediction/reason checks. These two units are an early event bridge and a deeper two-caller function/reuse task; the other proposed units remain authoring work. The six stages are predict/explain, investigate, modify/reuse, repair, adapt and independent check. The five practice stages award one fixed five-star completion; fresh independent evidence is separate, scoped and monotonic. A hint makes that check supported. No teacher-reviewed or free-form submission workflow was added.

The retry-friendly policy applies to new successful coding/drawing practice throughout the existing courses: five stars regardless of help or attempts, protected best-per-activity totals, and no duplicate points for repeats. Historical stars are preserved until a successful retry; they are never retrospectively converted to independent mastery. Typing retains its separate accuracy-based rewards. Public work stays browser-only; private work follows assigned course scope and additive versioned progress/recovery. All 48 proposed units have not been implemented or learner-piloted. See [the exact first-phase scope and verification](CODING_CURRICULUM_PHASE_ONE_2026_10_21.md); later App Lab applications there are next-authoring proposals.

## Grade 3 App Lab implementation amendment — 21 October 2026

Following the first phase, the owner-approved **Build a greeting app and click counter** unit is implemented locally for Grade 3. This advances the greeting/counter App Lab application previously described as next authoring; it does not replace the historical baseline, redefine a proposed V3 unit ID or complete the remaining map. The six stages are predict/explain, investigate, modify greeting, repair counter, adapt points and a fresh independent check with changed IDs and requirements. The actual editable App Lab blocks/text subset and runtime connect input, events, a count variable and reset in a supplied one-screen app. Tests exercise different/empty inputs, repeated clicks, initialization and reset/next click, rather than accepting one source string.

Completing the five practice stages earns one five-star result regardless of hints/retries. The fresh check records separate bounded app-checked evidence; conceptual hints make that attempt supported, and later attempts cannot erase demonstrated evidence. A separate version-1 Grade 3 `appPractical` field preserves six authored drafts and selected prediction/reason responses, without replacing Grade 2/4 `practical`, personal App Lab galleries or core results. Public storage is browser-only; assigned private work uses the existing course progress/recovery path. Preview input is transient, while authored code and control text persist. This adds neither teacher-reviewed submissions nor a general competence claim.

The scoped fresh finish review is `ship`. Supplied verification includes 30 passing practical browser checks across desktop/phone/tablet, passing frontend build/server types, focused/unit coverage and 26 isolated progress API tests. Synthetic account fixtures and isolated API storage are not production-account or learner-pilot evidence. No deployment, push or database migration occurred. See [the exact Grade 3 scope and verification](GRADE_3_APP_LAB_UNIT_2026_10_21.md). Other proposed units and their delivery gates below remain planning work unless separately amended.

## 1. What changes and what stays

The aim is a progression from following and explaining small programs to independently planning, testing and adapting a useful game, story or creative tool. A bigger board or a new character is not, by itself, a new learning outcome.

| Review finding | V3 decision | Evidence we will look for |
|---|---|---|
| Repeated introductory tasks across grades | Revisit concepts with a new application, less scaffolding and a more demanding explanation | A learner can transfer a concept without copying the earlier solution |
| Too much route-based learning | Keep routes as one useful model; add stories, art, inventories, scoreboards, simulations and games | Each grade has assessed work outside route navigation |
| Events arrive late | Introduce cause-and-response in Grade 1; held controls and independent event scripts in Grade 2 | Learners distinguish starting an action, holding a control and responding to contact |
| Quizzes dominate assessment | Use prediction, repair, modification and explanation alongside short knowledge checks | Saved work and a brief explanation show what the learner can do |
| Attempts/hints reduce available stars | Make supported practice safe to repeat; assess independence separately | Help use does not reduce practice rewards, and previously earned stars remain intact |

Preserve the original objectives, creative freedom, age-appropriate representations, accessibility and private saves. Preserve existing course/lesson identities and historical achievement. This is a revision of the learning sequence, not permission to discard earlier work.

The original [V2 reference](KodeArcade_V2_Master_Curriculum_Objectives.docx) remains unchanged. V3 deliberately proposes replacing its universal ten-task unit rule with evidence-led unit design, and replacing attempt/hint-based reward reduction in new practice. The [V2 objective map](V2_OBJECTIVE_MAP.md) remains a historical planning reference.

## 2. Starting point: what exists today

This baseline was checked against the repository on 20 October 2026, commit `c133869b04ab87164402f04311cb47731ce5c05e`. It is not a claim that every feature is deployed or equally available in every teaching mode.

- Grades 1 and 2 focus on sequences, debugging and, in Grade 2, loops. Grades 3–6 share the same broad topic list, including functions, lists, objects and creative tasks. Grade 4+ relative movement and later parameter/return work provide some genuine progression already.
- Grade 3 and Grade 4 currently share six introductory function activities. The early operator and Boolean activities also overlap considerably.
- Existing numeric-list and `robot.speed`/`robot.energy` object-property exercises mostly use values to control a route. These are not a general text inventory or an object-oriented programming system.
- Current required activity counts, including the route project, are 21 in Grade 1, 31 in Grade 2 and 90 in each of Grades 3–6. Formal quiz banks currently cover 3, 4 and 13 topics respectively, normally using five questions. These are implementation counts, not recommended V3 workload targets.
- Grade 1 Sequences already has a richer topic journey with explanation, practice, repair and visual mastery questions. Use its useful scaffolding patterns; do not copy its all-ten-core-task assessment gate into every new unit.
- Computer Explorers has 20 mouse/touch and keyboard activities. Drawing has 34 grade-distributed activities. These are useful foundations and project media, not substitutes for demonstrating programming concepts.
- Grades 3–6 have a private Byte Lab with editable game/story starters, including basketball, three-lane racing and tennis, plus guided tutorials. Events, held controls, timers, messages, simple text operations, local variables, behaviors and bounded personal functions already exist there. This does not make them automatically available in the Grade 1–2 guided editor.
- Current rewards do not penalize time, successful completion earns at least one star, and saved best stars do not decrease. However, attempts and hints cap the stars available on a new completion. The concern about discouraging experimentation is a design risk to test, not an observed learner-outcome claim.

Implementation evidence: `src/courses.ts`, `src/gradeMissions.ts`, `src/conceptMissions.ts`, `src/dataMissions.ts`, `src/creativeMissions.ts`, `src/rewards.ts`, `src/TopicJourneyView.tsx`, `shared/curriculum-topics.ts`, `shared/progress-catalog.ts`, `shared/quizzes.ts`, `src/studioTutorials.ts` and the [Lab capability notes](BYTE_LAB_BLOCKS_2026_10_18.md).

## 3. How to read the map

### Progression and pacing

Eight units per grade are proposed as planning containers, not eight fixed-length topics or a compulsory number of tasks. Combine or split lessons after pilots. As an initial scheduling assumption, budget roughly 2–4 sessions per unit, using shorter sessions for younger learners; these timings are not validated. A school timetable, home-learning pace and learner readiness should determine the final delivery plan.

Use a short entry task rather than age alone to choose support. A Grade 5 beginner may need an earlier sequence/event bridge without being placed in a younger-looking course. Provide an extension inside the same context for experienced learners.

Each unit follows a small cycle: **predict → run → investigate → modify → make**. Fade support within the cycle. Children should read and discuss a small program before being asked to invent a large one. The PRIMM approach informs this sequence; it does not prescribe our exact units or assessments. [Raspberry Pi Foundation, PRIMM](https://www.raspberrypi.org/blog/using-primm-to-teach-programming-a-new-short-course-for-educators/)

### Delivery labels

All rows are proposed content. The labels describe the technical work needed, not whether a lesson is finished.

- **R — reuse:** relevant primitives exist in an appropriate current mode; author and verify the new learning activities.
- **B — bridge:** a capability exists elsewhere, usually in Lab, but needs an age-appropriate guided surface, onboarding or assessment integration.
- **E — engine/content extension:** the proposed executable outcome needs additional interpreter/editor support. Do not release it as runnable mastery until that support is tested.
- **T — teacher-led/stretch:** an explicitly conceptual or offline extension. It does not demonstrate mastery of executable code.

Combined labels mean the unit has both reusable material and a specific gap. The minimum prerequisite column gives the direct learning dependency; normal teaching still follows the listed sequence. New IDs are proposal identifiers, not replacements for existing persisted IDs.

## 4. Grade-by-grade map

### Grade 1 — Make something happen

**Exit outcome:** assemble and explain a short sequence; predict a simple event response; find and repair one error; make a small interactive scene with support.

Representation: icons, spoken instructions, visible previews and very short labels. Use movement, art, sound and unplugged play. No requirement to read code-heavy quizzes or type explanations. Counting and change are concrete; formal variables are not a Grade 1 mastery requirement.

| Proposed unit | Prerequisite | Observable objective | Meaningful application | Practical evidence | Delivery |
|---|---|---|---|---|---|
| G1-U1 Meet the computer | None | Select, drag, start and stop deliberately; ask before sharing personal information | Computer Explorers and a digital art postcard | Complete an input task and explain which control starts/stops an action | R |
| G1-U2 First, next, last | G1-U1 | Order 3–5 actions and predict their result | Help a character reach a friend; sequence a greeting | Arrange cards/blocks and tell or show the order | R |
| G1-U3 Tap and react | G1-U2 | Identify the event and the response in a one-event scene | Tap an animal to hear a greeting or change its appearance | Predict the response, then change one action | B |
| G1-U4 Pattern artist | G1-U2 | Recognize a repeating pattern and describe its repeated part | Stamp a border, movement dance or sound pattern | Build the pattern and identify its repeated chunk; a repeat block is supported exploration | R/B |
| G1-U5 Code detective | G1-U3 | Find and repair one wrong, missing or misplaced action | A character greets too soon or goes the wrong way | Show before/after behavior and identify the fix | R/B |
| G1-U6 A tiny choice | G1-U3 | Explain a concrete yes/no decision with support | If a friend is near, say hello; otherwise keep waiting | Choose a case where the response happens and one where it does not | B |
| G1-U7 My interactive picture | G1-U5 | Break a scene into two small jobs and assemble them from familiar pieces | A drawing with two clickable characters | Build with a picture plan; demonstrate each response | B |
| G1-U8 Show and change | G1-U7 | Explain a personal creation and make a requested small change | A mini story, greeting or pattern scene | Independently change one familiar detail after supported practice | B |

Support fades from modeled → paired → picture checklist. Independence means making a familiar small change, not writing a whole scene unaided. Unplugged tinkering, making and collaboration are useful methods for young learners; this is not a claim of formal early-years standards alignment. [Barefoot, early-years research](https://www.barefootcomputing.org/my-barefoot/research-zone/early-years)

### Grade 2 — Control, repeat and respond

**Exit outcome:** combine events, repeated actions and a simple condition; explain tap versus hold; test an interactive story or collection game in more than one situation.

Representation: icons with short words, narration and a small guided event palette. Introduce a visible counter as “a number that changes”; do not demand abstract variable vocabulary before the concrete model makes sense.

| Proposed unit | Prerequisite | Observable objective | Meaningful application | Practical evidence | Delivery |
|---|---|---|---|---|---|
| G2-U1 Read and repair | G1-U8 or entry check | Predict and repair a short sequence without rebuilding it from scratch | A lost delivery or mixed-up greeting | Explain the first point where actual and expected behavior differ | R |
| G2-U2 Tap, hold, release | G2-U1 | Distinguish a one-time event from continuous control | Move a collector with held arrows or on-screen controls | Move continuously while held; stop on release; explain the difference | B |
| G2-U3 Repeat a useful chunk | G2-U2 | Replace duplicated actions with a counted repeat | Dance, patterned art or a collection animation | Predict repeat count and adapt the repeated body | R/B |
| G2-U4 Touch and choose | G2-U2 | Connect contact to a simple conditional response | Catch a fruit, greet a friend or bounce at a border | Demonstrate touching/not-touching cases and repair a wrong response | B |
| G2-U5 Count what happened | G2-U4 | Initialize, increase and reset a visible counter with support | Count catches or audience clicks | Show zero at a new run, two increments and a reset | B |
| G2-U6 Story scenes | G2-U3 | Plan a beginning, response and ending; reuse a repeated sequence | A two-scene interactive picture story | Explain which event advances the story and adapt its ending | B |
| G2-U7 Plan, make, test | G2-U5 | Use a small plan and three example tests | A collector game or interactive art toy | Test start, ordinary action and restart; fix one issue | B |
| G2-U8 A new challenge | G2-U7 | Transfer a familiar idea to a different object or rule | Change catches into greetings, or add a different contact response | Make a small transfer change without a step-by-step solution | B |

Grade 2 goes beyond Grade 1 by coordinating repeated behavior with events, using a changing count and checking restart behavior. It does not merely add more arrows to a route.

### Grade 3 — Build a small interactive world

**Exit outcome:** build and explain a small game/story using events, score, conditions and named actions; interpret simple numeric collections and object properties with support.

Representation: word blocks, a gradual introduction to Lab and optional read-only Show code. Use fixed screen directions first, then explicitly teach Lab's coordinate model. Text shown by Show code is a learning translation, not a runnable JavaScript editor.

| Proposed unit | Prerequisite | Observable objective | Meaningful application | Practical evidence | Delivery |
|---|---|---|---|---|---|
| G3-U1 From plan to scene | G2-U8 or entry check | Decompose a scene and connect positions to a coordinate model | Design a greeting scene or art stage | Place characters, predict a position change and explain the axes | R/B |
| G3-U2 Events are starting points | G3-U1 | Give different sprites independent click, key or contact responses | Catch-a-fish or a conversation with Grandma and Grandpa | Predict which script runs and repair a wrong event/action connection | R |
| G3-U3 Score and reset | G3-U2 | Initialize a local variable and update it using arithmetic | Scoreboard for catches or clicks | Trace three score changes and prove a new run starts correctly | R |
| G3-U4 Rules with evidence | G3-U3 | Use a comparison and a simple Boolean condition to choose an action | Reward a catch only when it is valid; stop at a target | Test one true and one false case; explain the comparison | R |
| G3-U5 Name a useful action | G3-U4 | Define, call and reuse a no-parameter action; distinguish definition from call | A reusable greeting, celebration or reset action | Predict two calls, repair a missing call and change the definition once | R |
| G3-U6 Ordered information | G3-U3 | Read and update an ordered numeric list; explain order/index using a visual model | Daily catches, score history or three basket quantities | Predict a read/update and explain why changing the order changes its meaning | R/B |
| G3-U7 Properties describe things | G3-U4 | Read/change a named numeric property and distinguish it from a separate variable | A character's speed and energy in a short simulation | Trace an energy or speed update; describe the modeled object | R/B |
| G3-U8 Make it yours | G3-U5, G3-U6, G3-U7 | Combine events, state and one reusable action in a personal project | Small collector, rocket rescue or interactive story | Demonstrate, explain, repair one fault and make one transfer change | R/B |

Collections and properties are concrete introductions. A general string inventory or freely designed record is an extension, not a requirement disguised as an existing list lesson. The capstone needs meaningful data use but does not have to combine every concept in one crowded program.

### Grade 4 — Design reusable systems

**Exit outcome:** design and test a multi-script game/story, reuse functions deliberately, manage meaningful data and explain state changes and boundary cases.

Representation: word blocks, relative movement where useful, Lab coordinates and read-only code comparison. Expect design decisions from a short brief rather than a near-complete solution.

| Proposed unit | Prerequisite | Observable objective | Meaningful application | Practical evidence | Delivery |
|---|---|---|---|---|---|
| G4-U1 Responsive controls | G3-U8 or entry check | Coordinate held input, contact and separate event scripts | Tennis rally or a two-character scene | Test held/released input, contact and restarting; locate the responsible script | R |
| G4-U2 State and rules | G4-U1 | Combine conditions, variables and a small nested decision without contradictory rules | Ready/playing/finished game or branching story | Trace state transitions and test true, false and boundary cases | R |
| G4-U3 Design a reusable function | G3-U5, G4-U2 | Choose a cohesive repeated job, extract it and test its callers | Reset round, celebrate a point or change scene | Refactor duplicated blocks; demonstrate one definition change affects both intended calls | R |
| G4-U4 Inventories and score tables | G3-U6, G4-U2 | Choose an ordered collection for a purpose; add, replace and inspect entries | Numeric score table first; named story inventory as an extension | Explain index/item meaning and repair an off-by-one error; demonstrate add/use for the extension | R/B/E |
| G4-U5 Properties, local state and messages | G3-U7, G4-U2 | Separate per-character values from coordinated messages | Two characters with different energy or speed | Show one local change does not change the other sprite; explain a message response | R/B |
| G4-U6 Basketball bounce | G4-U3, G4-U5 | Adapt a playable game by changing rules through visible blocks | Move a player continuously; return a ball; score at the hoop | Test hold/release, score, miss and reset; explain one function and one event | R |
| G4-U7 Repair and improve | G4-U4, G4-U6 | Use a prediction and test log to isolate and repair two different faults | Fix a score/reset bug and a movement or collection bug | Record expected/actual results, make targeted fixes and rerun affected tests | R/B |
| G4-U8 Independent remix | G4-U7 | Plan a project, choose data and reuse actions with limited support | Sports remix, story inventory or interactive exhibit | Present a plan, working artifact, tests and an unfamiliar small modification | R/B/E |

This is intentionally different from Grade 3 functions: children select the abstraction, remove duplication and test its effects across callers. Numeric parameters are a stretch here; arbitrary multi-parameter functions are not assumed available.

### Grade 5 — Explain the code behind the game

**Exit outcome:** trace and adapt bounded text-style and block programs, use parameters/returns in their supported scope, represent useful collections and test a stateful game at exact boundaries.

Representation: blocks plus the existing bounded Python-style text teaching mode. Teach syntax, execution order and tracing explicitly. Lab Show code and the typed teaching mode are different tools, not a guaranteed round-trip editor.

| Proposed unit | Prerequisite | Observable objective | Meaningful application | Practical evidence | Delivery |
|---|---|---|---|---|---|
| G5-U1 Blocks to readable text | G4-U8 or entry check | Match sequence, assignment and a simple condition across representations | Reconstruct a familiar score calculation or short route | Predict both versions and repair one syntax/logic error | R/B |
| G5-U2 Iteration that terminates | G5-U1 | Trace counted/nested loops; explain why a bounded condition-controlled loop stops | Pattern generator or countdown simulation | Trace iterations, test zero/one/many and fix an incorrect stopping condition | R/B/E |
| G5-U3 Inputs and results | G4-U3, G5-U1 | Use a numeric parameter and return value; distinguish local input from stored state | Calculate a reward or movement distance from a supplied number | Test two inputs and explain the returned value; stay within current `value` parameter restrictions | R/B |
| G5-U4 Text is data | G5-U1 | Join and compare text; extend to traversing a string only with supported tooling | Space-hero interview or a personalized story | Predict output for two answers; explain text versus number; traversal is separately assessed if enabled | R/E |
| G5-U5 Choose a collection | G4-U4, G5-U3 | Justify a list versus a named property; modify data without hard-coding every use | Shop quantities, scoreboard or extended inventory | Read/update entries, handle an empty/invalid choice and explain the chosen representation | R/B/E |
| G5-U6 Racer: speed after 50 | G4-U5, G5-U3 | Coordinate a threshold, one-time message and local speed updates | Existing three-lane traffic-dodging racer | Prove scores 49 and 50 stay normal, 51 boosts once, and restart restores normal speed | R |
| G5-U7 Compare algorithms | G5-U2, G5-U5 | Trace a linear search and compare simple strategies using evidence | Find a score/item; order a small hand-worked table | Trace found/not-found cases and compare step counts; runnable collection algorithms need an extension | B/E/T |
| G5-U8 Make, justify, adapt | G5-U4, G5-U6, G5-U7 | Design a stateful artifact and justify its data and function choices | Racing remix, story system or useful interactive tool | Explain decisions, demonstrate tests and complete a new rule change | R/B/E |

Condition-controlled loops, text traversal and general collection algorithms require explicit technical delivery gates. Until they exist, use labeled teacher-led traces; do not award executable-programming mastery for those substitutes. Recursion is not a required Grade 5 outcome.

### Grade 6 — Engineer, evaluate and communicate

**Exit outcome:** plan a multi-part program, manage state and responsibilities, reason about structured data and algorithms, test systematically and explain a substantial independent project. Distinguish conceptual knowledge from features actually programmed.

Representation: blocks/text selected by readiness, with explicit tracing and representation bridges. Full Python, unrestricted JavaScript, network access and object-oriented classes are not implied by the current platform.

| Proposed unit | Prerequisite | Observable objective | Meaningful application | Practical evidence | Delivery |
|---|---|---|---|---|---|
| G6-U1 Brief, users and design | G5-U8 or entry check | Translate a brief into requirements, a data sketch and acceptance examples | Plan a game, exhibit, story tool or local simulation | Explain the intended user, inputs, outputs and success criteria | R/B |
| G6-U2 Architecture and state | G6-U1 | Allocate responsibilities, compose supported helpers and track state transitions | Menu/playing/finished experience or multi-scene story | Trace a transition and show how a component/helper change affects its consumers | R/B |
| G6-U3 Search, sort and compare | G5-U7, G6-U2 | Trace linear search and a simple sort; compare correctness and work on small inputs | Leaderboard or item catalogue | Test empty, one-item, duplicate and missing cases; explain a strategy trade-off | E/T |
| G6-U4 Structured records | G5-U5, G6-U2 | Distinguish lists from records and validate a small structured data example | Offline game configuration or museum catalogue | Interpret fields/types and reject or repair a malformed example; executable JSON is gated | B/E/T |
| G6-U5 Connected systems safely | G6-U4 | Explain request/response, validate a supplied response and handle unavailable data | Curated weather/story-data fixture; never child-entered credentials | Trace success/failure responses; use a tested fixture reader only if implemented | E/T |
| G6-U6 Test like a developer | G6-U2 | Derive tests from requirements, investigate a defect and rerun regression checks | Basketball, tennis, racer or capstone prototype | Cover normal/boundary/failure/restart cases; explain cause and verify the repair | R/B |
| G6-U7 Build the capstone | G6-U1, G6-U2, G6-U6 | Build an organized artifact that meets a self-authored, reviewed brief | Game, interactive story, creative tool or simulation | Demonstrate requirements, reusable code, meaningful data and a test record | R/B/E |
| G6-U8 Defend, transfer, publish safely | G6-U7 | Explain design choices, respond to a change request and prepare safe sharing | Portfolio demonstration and private export | Make an unseen small change, explain limitations and check that shared work contains no personal data | R/B |

G6-U3–U5 include a staged advanced strand. Before the required executable tools exist, deliver the explicitly labeled conceptual/offline version, report that evidence separately and offer a current-engine capstone path. Do not make unavailable features a graduation gate. Classes/inheritance and live APIs remain optional future extensions, not mandatory Grade 6 programming claims.

## 5. Spiral progression: the expected difference each year

| Strand | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Grade 5 | Grade 6 |
|---|---|---|---|---|---|---|
| Events and input | Identify tap → response | Tap versus hold/release; contact | Independent event scripts | Coordinate contact, controls and state | Messages, thresholds and repeated events | Responsibilities, event flow and failure paths |
| Repetition and decisions | Describe a pattern; concrete yes/no | Counted repeat and simple condition | Comparison and Boolean rule | Combined/nested rules with cases | Counted/nested loops; bounded while when supported | Choose and justify a control structure; test termination |
| Functions | Name a repeated job informally | Plan/reuse a chunk with support | Define/call no-parameter action | Extract cohesive jobs and test callers | Supported numeric parameter/return | Compose supported helpers and explain scope/contracts |
| Data | Observe/count concrete things | Change/reset a visible count | Local score, numeric list, fixed properties | Purposeful collection, local state/messages | Data representation choices and text operations | Structured records, validation and algorithms; gated JSON strand |
| Debugging | Spot one wrong action | Compare expected/actual; restart | Isolate an event/value error | Repair interacting scripts and collection mistakes | Trace state and exact boundaries | Requirement-led regression tests and reasoned trade-offs |
| Independence | Model and picture scaffold | Familiar small change | Brief with partial scaffold | Plan from a short brief | Justify a design and transfer a rule | Defend an artifact and respond to a new requirement |

Do not infer independence from grade, task volume, speed or a five-star legacy score. Keep advanced learners challenged through transfer, not more copies of the same introductory task.

## 6. Assessment design

### Evidence collected in every unit

1. **Predict:** point, speak, select or trace what a short program will do. Record the reason, not just a guessed option.
2. **Repair:** diagnose a bounded fault and explain why the change addresses it.
3. **Adapt or make:** change a working program for a new requirement, then test it.
4. **Explain:** identify the event/control/data relationship that makes the result happen.

Use a small, representative evidence set. More tasks are available for practice when useful, but completing a fixed ten is not the automatic proof of learning. A learner may request a mastery check after the prerequisite evidence is present; offer targeted practice after a gap is identified.

| Grade | Example assessment beyond a quiz | Reasonable support for independent evidence |
|---|---|---|
| 1 | Predict a tap response; fix a swapped action; change which character speaks | Narrated brief, icons, ordinary access support; no exact solution demonstration |
| 2 | Explain hold/release; repair a counter that fails to reset; change a contact response | Picture checklist and input alternative; no supplied answer blocks |
| 3 | Trace score changes; repair an uncalled function; adapt the celebration | Concept glossary and interface reminders; no code-generating hint |
| 4 | Extract duplicated reset code; repair the affected callers; test the remix | Short written/spoken brief and test template |
| 5 | Test racer at 49/50/51; diagnose repeated boosts; transfer the threshold rule | Reference syntax sheet; record conceptual help separately |
| 6 | Derive tests from a brief; repair a defect; implement an unseen change | Normal development references; disclose substantive assistance |

Accessibility support, narration, extra time and assistive input do not count as conceptual help. Peer/teacher help that supplies the algorithm or fix belongs in supported practice. A brief explanation may be spoken or teacher-observed; do not require recording or storing children's voices.

### A small practical rubric

Use four dimensions, each described as **not yet evidenced / demonstrated with support / demonstrated independently**:

- Behavior: the artifact meets the stated requirement, including its defined restart/end behavior.
- Explanation: the learner connects a block/value/event to an observed result.
- Testing and repair: the learner selects useful cases and verifies a targeted correction.
- Transfer: the learner adapts the idea to a different rule or context.

Do not average these into a misleading pass when a required concept is absent. For unit mastery, require the unit-specific behavior, explanation and test evidence. Record transfer separately. Mark an inaccessible or unavailable task as **not assessed**, not failed. Attractive art, fast typing, number of blocks and task completion volume are not programming mastery criteria.

Short knowledge checks remain useful for vocabulary and misconceptions. They supplement artifact-based evidence; a quiz score alone neither grants nor removes practical mastery. Preserve existing versioned quiz history.

## 7. Rewards: practice without penalty, mastery with evidence

### Proposed learner experience

- **Practice:** unlimited attempts, hints, examples and retries. Celebrate completion and useful debugging; these actions do not reduce available practice rewards. Avoid rewarding repeated submissions with unlimited points.
- **Mastery:** a separate status: **not assessed → developing → demonstrated**. Record **transfer demonstrated** as an additional distinction supported by a new-context task, not by repeating the same answer.
- **Feedback:** “You completed this with support. Try a fresh challenge when you're ready” rather than “You lost stars because you asked for help.”
- **Progression:** no perfect-star requirement. Use relevant prerequisites and offer bridges/support; let teachers make documented readiness decisions.

### Preserving existing achievement

- Keep all saved legacy stars and best scores intact. Do not recompute old attempts under the new policy or silently reinterpret old stars as mastery.
- Display existing stars as earned achievement, with clear labeling where the new mastery status is also shown. A new unassessed status must not look like removal of an old achievement.
- Store future practice completion separately from mastery evidence. A legacy completion can support placement, but is not automatic proof of the new practical task.
- A later unsuccessful check does not erase a demonstrated achievement. Use a separate “revisit recommended” note if needed. A materially changed assessment must have a new version; keep the old version's result.
- Show assistance honestly to teachers without making hint counts a public ranking. Keep essential accessibility support out of that classification.

This is a proposed product/data contract, not an implemented scoring change. The exact teacher review workflow, evidence retention policy and parent-facing labels need design and validation before rollout. Do not turn private Lab projects into automatically scored submissions without a separate, reviewed workflow.

## 8. Two pilot units before a full rewrite

### Pilot A: Grade 2, G2-U2 — Tap, hold, release

Purpose: validate an early, age-appropriate event/control bridge, not expose the entire older Lab palette.

1. Predict: compare a single-tap greeting with moving while a direction is held. Use narration and an animated example.
2. Investigate: run a tiny collector scene. Identify start, direction, release and stop. Explain that a tap is not the same as holding.
3. Modify: change the direction or a supported movement amount. Keep the event/control structure visible.
4. Repair: fix a supplied tap-only movement script or a missing release/stop response. Keep the fault narrow.
5. Make/transfer: control a different character or an interactive art object using the same idea. Explain it using words, pointing or an input demonstration.

Acceptance checks before learner use:

- Keyboard and on-screen controls move continuously while held, and stop on release without requiring repeated taps.
- Movement is frame/time-based rather than faster because a device repeats keydown more often.
- Pointer cancellation, lost focus, opening a blocking dialog and stopping/restarting the project do not leave a control stuck.
- Two-direction behavior is explicitly defined and demonstrated; accessible control alternatives are available.
- The starter, its changed version and a saved/reopened version behave consistently. Children can inspect the blocks responsible for control.
- Input handling does not cause scrolling while the game intentionally has focus, and normal keyboard navigation still works outside it.

Evidence: one correct prediction with reason, a working hold/release demonstration, and a small transfer. Measure where learners confuse the event with the repeated action. **Gate:** build/test the younger guided bridge first; existing Lab functionality alone does not satisfy this pilot.

### Pilot B: Grade 4, G4-U6 — Basketball bounce

Purpose: make function progression, game rules and practical assessment visible in an existing game context.

1. Predict: trace the existing editable starter's player controls, ball movement and hoop response.
2. Investigate: identify separate event scripts, local variables and the reset job. Sketch ready/playing/finished behavior without claiming a hidden physics engine.
3. Modify: change a permitted player/ball movement value and predict the effect. Hold left/right to compare continuous control with repeated clicking.
4. Refactor: extract an appropriate repeated reset/celebration job into a personal no-parameter function. Keep the function body visible and test each caller.
5. Repair: fix a deliberately incorrect score/reset or movement rule. Explain cause, not just the changed number.
6. Transfer: meet a new brief, such as a different target score, a different starting position or a new point celebration. Select only extensions that fit tested block/call limits.

Acceptance checks before learner use:

- Left/right hold works on keyboard and pointer controls; release/focus loss stops movement.
- A hoop encounter produces one intended score update before reset; an invalid encounter does not score.
- A miss has a clear end response. New Run restores initial positions, velocities, score and any round flags defined by the lesson.
- The refactored function is called in the intended places; changing it affects those callers without unrelated effects.
- Save/reopen retains the editable program, and source-defined initial values are restored on Run. Do not promise that transient runtime scores are persisted.
- Tests use the engine's size-based circular contact model. The lesson describes this as an arcade bounce game, not realistic gravity or pixel-perfect collision physics.

Evidence: a functional remix, prediction/explanation, targeted repair and one transfer change. Observe whether children can explain why the function is reusable, rather than just reproduce its name.

### Reuse the racer as the next boundary-testing example

G5-U6 can build on the existing [racing-speed implementation](RACING_SPEED_2026_10_18.md): the current starter uses traffic speed 4, then 7 when score is **greater than 50**. At 50 it stays normal; at 51 it boosts. A one-time flag prevents repeated boosts, a message tells other scripts to update their local speed, and a new Run resets the state. Assess all three boundary values, repeated checks after 51 and restart. These values are the current example, not universal curriculum constants. Do not rewrite children's already saved racers automatically.

## 9. Technical delivery gates and honest limitations

| Capability / boundary | Current position | Curriculum action before claiming delivery |
|---|---|---|
| Early events and continuous controls | Available in Lab; not automatically in Grade 1–2 guided teaching | Build the restricted guided bridge, accessible controls and practical evidence flow for G1/G2 |
| Different coordinate/movement models | Route grids use downward-positive y; Lab uses −100…100 and upward-positive y; drawing/relative turns have their own semantics | Teach a specific transition task. Lab units are not automatically screen pixels; do not assume identical movement across modes |
| Numeric lists versus inventories | Numeric list lessons exist; Lab sprite groups select actors, not arbitrary list items | Reuse numeric contexts first. Add a general text-list model and safe add/read/update/remove/iteration before claiming a programmable named inventory |
| Object properties versus general records/OOP | Fixed numeric robot properties and per-sprite values exist; these are not arbitrary records/classes | Use concrete properties now. Gate learner-defined records; defer classes/inheritance to a separately scoped extension |
| Variables and coordination | Lab variables are local to a sprite | Teach messages and local state. Do not invent shared global score semantics or assume receivers share the sender's values |
| Functions and text mode | No-parameter Lab functions and bounded helpers exist; numeric concept modules have a restricted `value` parameter/return model | Teach within these contracts. Arbitrary names, multiple parameters/types, recursion and cross-mode conversion require explicit extensions |
| Loops and syntax | Counted loops exist; modes support different subsets | Add/test bounded condition-controlled iteration, termination feedback and supported `if/elif/else` syntax before advertising full typed coverage |
| Strings and algorithms | Lab supports literals, join, comparisons and prompts; full string traversal/general list algorithms are not implied | Separate supported text tasks from engine work for traversal/search/sort; report offline trace evidence honestly |
| JSON and APIs | No general child-script network/JSON teaching environment | Start with curated offline examples. A future fixture reader needs schema/type/error handling; do not expose credentials, arbitrary URLs or live personal data |
| Runtime limits | Lab has four authored sprites, bounded temporary actors, 64 blocks per authored sprite, eight local variables and four personal definitions per sprite, plus scheduler/call limits | Validate starters and intended extensions within budgets; keep understandable code. Tennis ball logic is already close to its block budget, so test extensions before assigning them |
| Show code | Read-only JavaScript-style learning translation | Label it accurately; never call it full runnable JavaScript or an editable blocks/text round trip |
| Runtime input and project persistence | Prompt answers/counters are runtime state, not automatically account-stored evidence | Use deliberate initial/reset values. Define a separate consent/retention workflow before collecting assessment artifacts or answers |
| Title overlays and game state | A visible title screen does not automatically pause scripts | Teach an explicit state/guard if the design needs waiting/paused behavior |
| Assessment/rewards integration | Existing progress schemas, fixed quiz banks and protected legacy bests are in use | Version new evidence/reward contracts; test old-record compatibility and teacher reporting before any rollout |

The first pilots should reuse safe current capabilities plus the narrow early-event bridge. They do not depend on finishing JSON, APIs, full OOP or a general-purpose language engine.

## 10. Traceability to the 32 original objectives

Primary units are planning locations, not a claim that an objective is fully implemented. Practice recurs elsewhere. “Deferred executable” means conceptual teaching may occur, but programming mastery must wait for the stated delivery gate.

| Original code | Objective | Primary V3 location and expected depth |
|---|---|---|
| SEQ | Sequences | G1-U2; independently predict/repair by G2-U1 and trace text by G5-U1 |
| ALG | Algorithms | G2-U7 plans; G5-U7 compares strategies; G6-U3 evaluates small algorithms |
| MOV | Movement and direction | G1-U2, G2-U2; coordinate/relative model bridges in G3-U1 and G4-U1 |
| DEC | Decomposition | G1-U7 two jobs; G4-U3 reusable responsibilities; G6-U2 architecture |
| LOP | Loops | G2-U3 counted repeats; G5-U2 nested/bounded condition-controlled loops, gated by mode support |
| DBG | Debugging | G1-U5, G2-U1; systematic repair in G4-U7 and G6-U6 |
| EVT | Events | G1-U3 first response; G2-U2 hold/release; G3-U2 scripts and G5-U6 messages |
| CON | Conditionals | G1-U6 concrete choice; G3-U4 comparisons; G4-U2 nested rules |
| VAR | Variables | G2-U5 visible count; G3-U3 formal local state; G4-U5 scope/coordination |
| PAT | Patterns | G1-U4 and G2-U3; algorithmic patterns revisited in G5-U2 |
| OPR | Operators | G3-U3 and G3-U4 useful arithmetic/comparison; G5-U3 calculated results |
| BOL | Boolean logic | G3-U4 single rule; G4-U2 combined rules and G5-U6 thresholds |
| NST | Nested logic | G4-U2 nested decisions; G5-U2 nested iteration with explicit trace evidence |
| FUN | Functions | G3-U5 definition/call; G4-U3 design/refactor/test; G6-U2 composition |
| PAR | Parameters | G5-U3 supported numeric input; broader signatures deferred executable |
| RET | Return values | G5-U3 numeric returns; G6-U2 supported helper composition; broader types deferred |
| XY | Coordinates | G3-U1 explicit Lab axes; G4-U1 movement-model comparison |
| IO | Input and output | G1-U1/G1-U3; G5-U4 prompts/text and G6-U1 input/output design |
| LST | Lists | G3-U6 numeric order; G4-U4 purposeful updates; general text inventories gated |
| STR | Strings | G5-U4 join/compare first; traversal deferred executable until supported |
| GAM | Game mechanics | G2-U7 small collector; G4-U6 basketball; G5-U6 racer; G6-U7 capstone |
| COL | Collisions | G2-U4 contact; G4-U1/G4-U6 tested arcade contact rules |
| STA | State | G2-U5 reset; G4-U2 ready/playing/finished; G6-U2 state/responsibilities |
| SRC | Searching | G5-U7 introductory trace; G6-U3 tests/comparison; runnable general-list search gated |
| SRT | Sorting | G5-U7 hand-worked ordering; G6-U3 one simple algorithm; executable version gated |
| TST | Testing | G2-U7 example tests; G4-U7 targeted repair; G6-U6 regression evidence |
| OBJ | Objects / OOP | G3-U7 fixed properties; G4-U5 local state; G6-U4 records. Classes/inheritance explicitly deferred/stretch, not satisfied by sprite properties |
| JSON | Structured JSON data | G6-U4 curated conceptual examples; executable parsing/validation deferred to a tested fixture environment |
| API | APIs | G6-U5 conceptual request/response and safe fixture extension; live network programming deferred |
| ARC | Program architecture | G4-U3/G4-U5 responsibilities; G6-U2/G6-U7 designed components and state |
| PLN | Planning | G1-U7 picture plan; G2-U7 test plan; G6-U1 requirements and acceptance criteria |
| CRT | Creativity | G1-U7 through each capstone; assessed concept use remains separate from artistic polish |

The advanced track in the original reference extends to age 14. It is reasonable to continue deferred advanced programming beyond Grade 6 rather than compress full OOP, JSON and live APIs into the final primary-grade project.

## 11. Rollout without disrupting existing learners

1. **Review this map:** confirm grade exit outcomes, local teaching needs and the practical-assessment/rewards direction. Select named content/technical reviewers; this document does not assume approval of every implementation detail.
2. **Author the two pilots:** prepare teacher notes, narrated learner briefs, inspectable starters, repair variants, transfer briefs, rubrics and manual acceptance scripts. Validate the early-event bridge separately from the existing older Lab.
3. **Pilot with permission:** use a small, consented group spanning different reading/input needs. Observe predictions, help use, misconceptions and transfer. Do not collect extra personal data merely to evaluate the map.
4. **Revise before scaling:** decide whether support, task difficulty or tooling caused a gap. Agree realistic success criteria before interpreting results; no learning-effectiveness claim follows from a passing software test.
5. **Version delivery contracts:** introduce additive lesson/assessment versions and reviewed mappings from existing IDs. Keep old completions, best scores, quiz-bank versions and saved projects readable. Do not reorder persisted numeric mission indices or silently remap a completion to a different objective.
6. **Roll out one grade/unit at a time:** verify course availability, prerequisite rules, teacher reporting, legacy results and accessibility. Keep the older path recoverable while the replacement is evaluated.

Engineering changes must cover frontend, shared validation and backend contracts together where new course/evidence types are needed. Do not add unsupported course keys, automatically migrate production data or switch database environments as a side effect of content work. Existing imported/private projects must remain usable; new starter versions do not overwrite personal copies.

### Pilot observations and release evidence

Record whether learners can predict with a reason, repair a fault, explain an event/data relationship and transfer the idea. Also record where they need conceptual help versus interface/access support, and whether practice feels safe to repeat. Keep software defects separate from learning gaps.

Before release, demonstrate both functional tests and human review: correct starter behavior, correct reset/save behavior, readable/narrated instructions, accurate rubric judgments and unchanged legacy achievement. The reward proposal's effect on confidence and experimentation needs learner observation; it cannot be established by unit tests alone.

## 12. Reference and review boundaries

- Owner-supplied [V2 master objectives](KodeArcade_V2_Master_Curriculum_Objectives.docx) and [V2 objective map](V2_OBJECTIVE_MAP.md): objective continuity, with V3 departures stated above.
- [Concept-module scope](CONCEPT_MODULES_2026_10_16.md), [Lab blocks](BYTE_LAB_BLOCKS_2026_10_18.md), [Lab games](BYTE_LAB_GAMES_2026_10_18.md), [racer threshold](RACING_SPEED_2026_10_18.md) and [tennis/lesson-panel work](TENNIS_LESSON_PANEL_2026_10_18.md): repository capability evidence, not evidence of learner effectiveness.
- [Raspberry Pi Foundation: PRIMM](https://www.raspberrypi.org/blog/using-primm-to-teach-programming-a-new-short-course-for-educators/): informs reading, predicting, discussing and modifying before independent creation.
- [CSTA PK–12 standards overview](https://csteachers.org/pk12standards/about/): a useful external outcome/progression reference. Standards are not a prescribed curriculum; this map is not a certified or complete CSTA alignment. A formal standards crosswalk would be a separate task.
- [Barefoot early-years research](https://www.barefootcomputing.org/my-barefoot/research-zone/early-years): informs concrete, playful approaches for younger learners, without equating school grade systems.

**Next authoring step:** turn G2-U2 and G4-U6 into complete, tested pilot lesson packs. Do not bulk-generate all 48 units or change reward records before validating those pilots and their evidence workflow.
