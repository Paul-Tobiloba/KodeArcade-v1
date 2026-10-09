# V2 curriculum objective map

Version: V2.0 planning baseline, 9 October 2026. Source: [Master Curriculum Objectives](KodeArcade_V2_Master_Curriculum_Objectives.docx). This maps the owner's age-track objectives into Grades 1–6; it is not a national school-standard alignment. Grades 1–2 correspond broadly to Little Coders, Grades 3–4 to Code Explorers, Grades 5–6 to Code Creators. Readiness can override placement, including learners aged 12–14.

The table is the target, not an availability claim. I = introduce with support; R = reinforce independently; A = apply in a combined project; — = not required yet. A topic can recur without repeating its original lesson. Each occurrence needs a track-appropriate objective, vocabulary, representation and assessment.

| Stable objective | Topic | G1 | G2 | G3 | G4 | G5 | G6 |
|---|---|---|---|---|---|---|---|
| SEQ | Sequences | I | R | R | A | A | A |
| ALG | Algorithms | I | R | R | A | R | A |
| MOV | Movement and direction | I | R | R | A | A | A |
| DEC | Decomposition | I | R | R | A | R | A |
| LOP | Loops | I | R | R | A | R | A |
| DBG | Debugging | I | R | R | A | R | A |
| EVT | Events | I | R | R | A | R | A |
| CON | Conditionals | I | R | R | A | R | A |
| VAR | Variables | I | R | R | A | R | A |
| PAT | Patterns | I | R | R | A | A | A |
| OPR | Operators | — | — | I | R | R | A |
| BOL | Boolean logic | — | — | I | R | R | A |
| NST | Nested logic | — | — | I | R | R | A |
| FUN | Functions | — | — | I | R | R | A |
| PAR | Parameters | — | — | — | — | I | R |
| RET | Return values | — | — | — | — | I | R |
| XY | Coordinates | — | — | I | R | R | A |
| IO | Input and output | — | — | I | R | R | A |
| LST | Lists and arrays | — | — | I | R | R | A |
| STR | Strings | — | — | — | — | I | R |
| GAM | Game mechanics | — | — | I | R | R | A |
| COL | Collision detection | — | — | I | R | R | A |
| STA | State management | — | — | — | — | I | R |
| SRC | Searching | — | — | — | — | I | R |
| SRT | Sorting | — | — | — | — | I | R |
| TST | Testing | — | — | — | — | I | R |
| OBJ | Objects and OOP | — | — | — | — | I | R |
| JSON | Structured data | — | — | — | — | I | R |
| API | APIs | — | — | — | — | I | R |
| ARC | Game and app architecture | — | — | — | — | I | R |
| PLN | Planning and design | I | R | R | A | R | A |
| CRT | Creative project and capstone | I | A | R | A | R | A |

## What increasing depth means

- Grade 1: icon instructions; act out a short sequence, predict one move, correct one error. Events are button/touch triggers; conditionals are picture-based choices; values are small visible counts. Break a route into two parts with adult/narration support.
- Grade 2: choose and explain repeat patterns; combine an event with a short route, a simple decision and a changing counter. Independently plan, test and repair a small adventure. No formal quiz.
- Grade 3: readable blocks and authentic vocabulary; introduce expressions/comparisons, reusable functions, X/Y positions, simple input/output and visual collections. Use guided game mechanics rather than only navigation.
- Grade 4: combine events, conditions, loops, variables, functions and collections into a complete block game. Predict, trace and compare solutions. A code-view bridge is a later deliverable, not currently available.
- Grade 5: advanced blocks → pseudocode → supported typed code; explicit numbers/text/booleans, AND/OR/NOT, for/while/nested loops, parameters/returns and lists/strings. Introduce testing, state, objects and structured data through small controlled examples.
- Grade 6: apply and deepen these concepts; searching/sorting, game architecture, sample JSON/API exchange, decomposition and original capstone planning/build. Projects become more independent, not merely larger grids.

## Release sequence and honest coverage

1. This objective map establishes the traceability baseline. Current executable coverage remains the six existing grid topics; algorithm/planning/pattern practice is incidental, not proof of the full objective.
2. First vertical slice: Grade 1 Sequences (SEQ), with movement (MOV), planning (PLN) and debugging (DBG) as supporting objectives. Complete the learning rhythm and prove persistence before replicating it.
3. Next: Grade 1/2 loops, then events, picture decisions and counting. Do not advertise these youngest-track modules until their authored content and age-appropriate assessments work.
4. Next: Grade 3 operators/Boolean logic/functions/coordinates and Grade 4 integrated game creation; then Grade 5/6 code transition and advanced topics. Larger boards alone never satisfy an advanced objective.

## Typed code and drawing — first implementation

Grades 5–6 now offer a Python-style text editor alongside Blockly on their existing six-topic routes. New work starts in Text; an existing saved Blockly workspace keeps Blocks. Both versions are saved independently, with no automatic translation. The bounded language supports movement, `for … in range(2–5)`, `if path_clear(...)` / `else`, numeric `score` assignment/update and movement by score. It is not a full Python runtime: functions, while, expressions, collections and the remaining advanced objectives are still planned. Passing an old route in text does not certify those objectives.

Optional drawing practice reinforces MOV/PAT/LOP and supporting mathematics through 34 activities (5/5/6/6/6/6), including free creation in every grade. Grade 1 has trails, corners, a square and stairs using arrow controls; Grade 2 adds repeating squares, triangles, rectangles and zigzags. Grade 3 explores polygons, a five-point star and nested square-petal patterns. Grade 4 combines exterior/interior angles, octagons, stars, six-arm snowflakes and triangle rosettes. Grade 5 uses typed loops, variable-driven spirals, saved branch positions and a branching ice crystal. Grade 6 adds rotated stars, a longer variable-driven spiral, a stylised stellar dendrite and separate pen-lifted shapes. Grades 1–2 use arrow-led Blockly with numerals, Grades 3–4 readable drawing blocks, Grades 5–6 Blocks/Text. Drawing's bounded language additionally supports `distance`, `push`/`pop`, `pen_up`/`pen_down`, repeats of 2–12, at most three nested groups and 500 operations; these are not arbitrary Python functions or a physics simulation. It reuses the shared navigation, editors, palette/code canvas and under-stage Play, changing the stage to white paper with Dash's pencil and animated ink. Programs, modes, tools, completion and protected best 1–5 practice stars save independently per grade/activity. Practice stars do not add core challenge stars or confer formal assessment, core mastery or topic badges.

The Grade 1 Sequences journey adds a captioned original silent video, narrated text alternative, step-through example, two bonuses, a repair task, three visual arrow assessment items, a choose-your-destination mini-project and a derived badge. It retains the ten existing generated core tasks, with learning-purpose prompts; it is the first complete-flow implementation, not ten newly authored or learner-validated lessons. Required stages—not perfect stars or bonus tasks—control its badge. Other topic journeys remain incomplete.

## Content contract and upgrades

Every released topic references the source-track objective and a versioned topic ID. It needs an intro video with text equivalent, guided example, ten scored required challenges, two optional bonuses outside the 50-star denominator, debugging/mastery task, age-appropriate assessment, topic mini-project and derived achievement. Grade 1/2 assessment is a visual mastery mission; Grade 3/4 uses an interactive quiz; Grade 5/6 includes code reading/debugging/programming tasks.

A manifest records: objective IDs, prerequisites, representation, learning outcome, activity purpose, help, evidence of understanding and release status. Planned content is never represented as playable. Stars show independence; assessment and project evidence are separate. Core completion plus assessment understanding permits progress; perfect stars and optional bonuses do not gate it.

Keep objective IDs stable. Add a new content revision when an objective or assessed task changes substantially; do not reinterpret historical completion as success on new tasks. Preserve old saved programs and best stars. An upgrade may add a lesson or practice recommendation without deleting prior work. Record migration rules, content changes and validation evidence alongside each release. The retained DOCX remains unchanged unless the owner supplies or approves a replacement.
