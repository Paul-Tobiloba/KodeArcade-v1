# KodeArcade master curriculum brief

Approved planning source supplied by the owner on 8 October 2026. This is the target curriculum, not a claim that all modules are implemented. Current course names remain Little Explorers, Code Adventurers and Independent Builders; the source's Little Coders, Code Explorers and Code Creators are working curriculum labels, not an automatic product rename. Overlapping age bands are guidance; readiness determines placement.

## Curriculum source

Absolutely. I’d build KodeArcade as a **spiral curriculum**: learners encounter the same core ideas at increasing levels of abstraction.

- **6–8:** symbols, arrows, animations, almost no typing.
- **8–10:** readable word blocks and proper programming vocabulary.
- **10–14:** advanced blocks → block/code view → increasingly typed Python/JavaScript-style code.

Every module below assumes **10 required challenges + 2 bonus/mastery tasks + 1 project**.

## KodeArcade Curriculum Architecture

| Track | Experience | Programming representation | Typical module length |
|---|---|---|---|
| **6–8: Little Coders** | Cartoon adventures and visual puzzles | Icons, arrows, colours, numbers | 15–30 min |
| **8–10: Code Explorers** | Missions, games and structured challenges | Word-based blocks | 25–45 min |
| **10–14: Code Creators** | Programming projects and problem solving | Advanced blocks → typed code | 40–90 min |

---

# Track 1 — Ages 6–8: Little Coders

The objective here is **computational thinking before syntax**.

| # | Module | Learning objective | Character / World | Prerequisite | End project |
|---|---|---|---|---|---|
| 1 | **Follow the Steps** | Understand that instructions must happen in order | **Byte — Robot City** | None | Guide Byte from the workshop to the charging station |
| 2 | **Which Way?** | Use forward, left and right correctly | **Dash the Rabbit — Compass Canyon** | Sequences | Build a route through a carrot maze |
| 3 | **Do It Again!** | Recognize repetition and use simple repeat commands | **Gigi the Gecko — Looping Jungle** | Sequences + movement | Help Gigi climb a vine using repeated moves |
| 4 | **Oops! Fix It** | Spot an incorrect instruction and replace it | **Fix the Fox — Bug Workshop** | Sequences | Repair a broken robot delivery route |
| 5 | **Ready, Set, Go!** | Understand that actions can start after an event | **Pip the Parrot — Party Island** | Sequences | Make characters move when buttons are pressed |
| 6 | **Choose a Path** | Introduce simple IF-style decisions visually | **Milo the Monkey — Jungle Junction** | Movement + events | Guide Milo around obstacles using visual choices |
| 7 | **Count It!** | Understand that computers can remember changing numbers | **Nova the Squirrel — Treasure Grove** | Basic repetition | Build an acorn/star counter |
| 8 | **Patterns Everywhere** | Recognize and create repeating patterns | **Gigi + Nova — Pattern Peaks** | Loops + counting | Create an animated repeating pattern |
| 9 | **Plan Before You Go** | Think through a solution before running it | **Byte — Puzzle Planet** | Modules 1–8 | Design a route before giving Byte commands |
| 10 | **My First Adventure** | Combine sequence, movement, repeats, events and simple decisions | **Full cast — Creator Island** | Modules 1–9 | Create a playable mini adventure |

### Example 6–8 interface

A program could visually appear as:

**↑ → ↑ ↑**

Then later:

**↻ 3 × ↑**

There should always be an animated execution: as each block activates, the corresponding character performs the action.

---

# Track 2 — Ages 8–10: Code Explorers

Here we introduce **real programming vocabulary**, while keeping the block environment.

| # | Module | Learning objective | Character / World | Prerequisite | End project |
|---|---|---|---|---|---|
| 1 | **Sequences & Algorithms** | Explain and create ordered algorithms | **Byte — Robot City** | None / Track 1 recommended | Program Byte through a delivery mission |
| 2 | **Movement & Direction** | Use commands, orientation and route planning | **Dash — Compass Canyon** | Sequences | Build an obstacle-course algorithm |
| 3 | **Repeat Loops** | Replace repeated commands with repeat blocks | **Gigi — Looping Jungle** | Sequences | Create an efficient climbing program |
| 4 | **Debugging** | Identify, explain and repair logical mistakes | **Fix — Bug Workshop** | Sequences + loops | Debug a malfunctioning factory |
| 5 | **Events** | Use events such as click, key press, touch and collision | **Pip — Event Carnival** | Basic blocks | Build an interactive carnival game |
| 6 | **Conditionals** | Use `IF` and `IF / ELSE` logic | **Milo — Decision Jungle** | Events | Build a branching jungle adventure |
| 7 | **Variables** | Store and change score, lives, coins and counters | **Nova — Treasure Grove** | Loops | Build a treasure-collecting game |
| 8 | **Operators** | Use arithmetic and comparison operators | **Professor Pixel — Number Lab** | Variables | Build a score and level system |
| 9 | **Nested Logic** | Combine conditionals and loops | **Milo + Gigi — Logic Temple** | Loops + conditionals | Solve a multi-condition temple puzzle |
| 10 | **Functions** | Create reusable groups of instructions | **Byte — Function Factory** | Loops + logic | Build reusable robot actions |
| 11 | **Coordinates** | Understand X/Y position and screen movement | **Orbit the Owl — Sky Grid** | Movement | Build a coordinate treasure hunt |
| 12 | **Game Builder** | Combine events, variables, loops, functions and conditions | **Full cast — Creator Arcade** | Modules 1–11 | Build a complete block-based game |

### Example 8–10 representation

Instead of:

**↻ 4 × →**

they see:

**REPEAT 4 TIMES**  
 **MOVE FORWARD**

And conditions become:

**IF obstacle ahead**  
 **TURN RIGHT**

At this age, I would allow learners to toggle an optional **“See the code”** panel so they begin connecting blocks with text programming.

---

# Track 3 — Ages 10–14: Code Creators

This becomes a real introductory programming curriculum.

I would begin with blocks where needed, but progressively expose actual code.

| # | Module | Learning objective | Character / World | Prerequisite | End project |
|---|---|---|---|---|---|
| 1 | **Algorithms & Pseudocode** | Break problems into precise steps before coding | **Byte — Algorithm Academy** | None | Design and implement a route-planning algorithm |
| 2 | **Variables & Data Types** | Work with numbers, strings and booleans | **Nova — Data Vault** | Algorithms | Build a player profile and score system |
| 3 | **Input & Output** | Accept user input and display program output | **Echo the Bot — Console Station** | Variables | Build an interactive quiz |
| 4 | **Operators & Expressions** | Use arithmetic, comparisons and expressions | **Professor Pixel — Logic Lab** | Variables | Build a points and rewards calculator |
| 5 | **Boolean Logic** | Understand `AND`, `OR`, `NOT` and truth values | **Milo — Logic Temple** | Comparisons | Build a security-gate logic puzzle |
| 6 | **Conditionals** | Write `if`, `elif`, `else` logic | **Milo — Decision Depths** | Boolean logic | Create a branching story |
| 7 | **For Loops** | Repeat code a known number of times | **Gigi — Looping Jungle** | Variables | Generate patterns and animations |
| 8 | **While Loops** | Repeat while a condition remains true | **Gigi — Endless Caverns** | Conditionals + loops | Build a survival/escape challenge |
| 9 | **Nested Loops** | Use loops inside other loops | **Gigi + Orbit — Pattern Galaxy** | For loops | Generate grids, patterns or pixel art |
| 10 | **Functions** | Define and call reusable functions | **Byte — Function Factory** | Loops + conditions | Refactor a game into reusable actions |
| 11 | **Parameters & Return Values** | Pass data into functions and return results | **Byte — Function Factory II** | Functions | Build a reusable game utility library |
| 12 | **Lists / Arrays** | Store and process multiple values | **Nova — Data Cavern** | Variables + loops | Build an inventory system |
| 13 | **Strings** | Manipulate and analyze text | **Pip — Message Tower** | Variables + loops | Build a word puzzle or text adventure |
| 14 | **Coordinates & Game Movement** | Work with position, velocity and boundaries | **Orbit — Space Grid** | Functions + variables | Build player movement |
| 15 | **Collision & Game State** | Detect interactions and manage win/lose states | **Dash — Arcade Arena** | Coordinates + conditions | Build a collectible or obstacle game |
| 16 | **Events & State Machines** | Model changing game/application states | **Pip — Event Station** | Events + variables | Build menus, levels and game states |
| 17 | **Algorithms** | Introduce searching, sorting and efficiency | **Fix — Algorithm Workshop** | Lists + loops | Build a leaderboard/search tool |
| 18 | **Testing & Debugging** | Test assumptions, trace code and isolate bugs | **Fix — Debugger HQ** | Most fundamentals | Repair several broken programs |
| 19 | **Objects & Basic OOP** | Understand objects, properties and behaviours | **Byte — Robot Factory** | Functions + data | Create multiple game characters from one model |
| 20 | **Data & APIs Intro** | Understand structured data and simple API concepts | **Orbit — Data Spaceport** | Lists + objects | Display information from sample JSON/API-style data |
| 21 | **Capstone Planning** | Plan a larger program using decomposition | **Full cast — Creator Studio** | Modules 1–20 | Produce design, pseudocode and technical plan |
| 22 | **Capstone Build** | Combine the curriculum into a substantial project | **Learner chooses world/characters** | Capstone planning | Complete original game/app |

---

# Progression between the tracks

The same concept should visibly mature.

| Concept | Ages 6–8 | Ages 8–10 | Ages 10–14 |
|---|---|---|---|
| Sequence | `↑ ↑ →` | `MOVE → MOVE → TURN` | algorithm / pseudocode |
| Loop | `↻ 4 × ↑` | `REPEAT 4 TIMES` | `for i in range(4)` |
| Conditional | obstacle picture → choose route | `IF obstacle THEN turn` | `if obstacle:` |
| Variable | star counter | `SET score TO 0` | `score = 0` |
| Function | reusable action icon | `DEFINE jump_gap` | `def jump_gap():` |
| List | — | optional visual inventory | `inventory = [...]` |

That makes advancement between age groups feel natural rather than forcing children to restart.

---

# Standard module structure

Every KodeArcade module should follow the same learning rhythm:

**Discover → Watch → Build → Run → Notice → Fix → Practice → Master → Create**

And the challenge allocation can remain consistent:

| Challenge | Function |
|---|---|
| 1 | Animated demonstration |
| 2 | Heavily guided practice |
| 3 | Guided practice |
| 4 | Independent application |
| 5 | New variation |
| 6 | Combine with an earlier concept |
| 7 | Predict what the code will do |
| 8 | Debug broken code |
| 9 | Optimization / fewer blocks |
| 10 | Mastery challenge |
| Bonus 11 | Hard puzzle |
| Bonus 12 | Creative/open-ended challenge |

This means the full curriculum contains roughly **440 core challenges** before even counting the projects: 10 modules × 10 for ages 6–8, 12 × 10 for ages 8–10, and 22 × 10 for ages 10–14.

## Character system

I’d keep a relatively small recurring cast rather than introducing a new mascot every lesson:

| Character | Personality | Main concepts |
|---|---|---|
| **Byte the Robot** | Curious guide | Algorithms, sequences, functions |
| **Gigi the Gecko** | Energetic and repetitive | Loops |
| **Fix the Fox** | Detective/problem solver | Debugging, testing |
| **Dash the Rabbit** | Fast explorer | Movement and coordinates |
| **Milo the Monkey** | Decision maker | Conditionals and logic |
| **Nova the Squirrel** | Collector/organizer | Variables and data |
| **Pip the Parrot** | Reactive and expressive | Events and strings |
| **Orbit the Owl** | Analytical navigator | Coordinates, grids, data |
| **Professor Pixel** | Puzzle-loving mentor | Math and operators |
| **Echo the Bot** | Communicator | Input/output |

Byte remains the **main KodeArcade mascot**, while the others become concept specialists.

The important part is exactly what you suggested: when code runs, **the cartoon world should react**. Gigi physically repeats a jump when a loop executes; Milo visibly checks two routes during a conditional; Nova's bag fills as a variable increases; Fix pauses at the failing instruction during debugging. That turns execution itself into teaching.

This matrix is strong enough to become the **master curriculum specification for Codex**, with the individual challenge sets built underneath each module.

## Core assessment and reward requirements

**5-Star Mastery Reward System:** Every required challenge is worth up to 5 stars. Learners earn the highest reward for solving independently with fewer attempts and less assistance. Repeated attempts, stronger hints, or guided solutions may gradually reduce the available stars, but successfully completing a challenge always earns at least 1 star. Stars contribute to topic mastery, badges, world progression and optional rewards.

Challenge stars and assessment scores are separate measures. Stars measure independence, not intelligence or quiz understanding. No child needs perfect stars to advance. No leaderboard, speed race, or zero-star completed task.

| Track | Assessment after 10 core challenges | Next step |
|---|---|---|
| 6–8 | Visual “Show what you know” mastery mission, no formal quiz | Mini-project and celebratory mastery badge |
| 8–10 | 5–8 visual questions: predict, choose a sequence, spot a bug, match concepts, efficiency | Mini-project and mastery badge |
| 10–14 | 8–12 questions/tasks: concepts, code reading, debugging, small programs | Mini-project and mastery badge |

Target flow: Animated Lesson → Guided Example → Challenges 1–10 → Optional Bonus Challenges → Topic Quiz (8+) or Visual Mastery Mission (6–8) → Mini Project → Mastery Badge. The demonstration is an unscored introduction outside the ten required scored tasks, clarifying challenge 1 in the source table. Bonus tasks are optional and never inflate the core 50-star denominator.

Suggested progression: complete all ten core challenges and demonstrate minimum understanding (at least 70% for quizzes). Below threshold, recommend targeted practice and allow a fresh quiz attempt; show what to revisit, not “Failed.” Young learners demonstrate understanding through the mastery mission instead. A completed project is required for the mastery badge. Track quiz best score, latest score, question-level feedback and attempts separately from stars; support multiple equivalent forms to avoid rote retries.

Topic summary example (illustrative): Loops — Challenges 43/50 stars; Quiz 8/10; Project completed; Badge Loop Explorer. Perfect-topic collectible target: at least 45/50 challenge stars, strong assessment performance (proposed 90%), and completed project. This reward is optional and never gates required progression. These thresholds are product defaults to validate with children, not validated educational cutoffs.

## Initial scoring policy for the playable prototype

Count finished executions, not interrupted runs. Attempts 1–2: 5 stars; 3–4: 4; 5–7: 3; 8–11: 2; 12+: 1. Hint caps: first nudge 5, second hint 4, third 3, fourth/strongest hint 2. Guided solutions cap at 1 when such assistance is explicitly provided. Reward is the lower of the attempt band and assistance cap, never below 1 on success. Blank or disconnected runs still finish with feedback and count; no elapsed-time penalty. Explain the rules before help is used. Preserve the highest already-earned reward, so later exploration never takes stars away. Old completions retain their completed status but receive no invented historical star score.

Ages 6–8 see stars and warm celebration rather than a grade. Ages 8+ may see topic totals; do not label a star total “mastery” without the assessment and project. Milestones, unlocks and collectibles must reflect actual implemented state.

## Current implementation boundary

Playable today: four shared Byte modules, ten challenges each, one shared creative project, and twenty Computer Explorers activities. This iteration adds star rewards, persistent best scores, synchronized star/chime celebration, a three-second retry notice, and the meadow workspace direction. The 44-module spiral, specialist characters/worlds, two bonuses per topic, age-specific quizzes/mastery missions, per-topic mini-projects, badges/unlocks, block/code view, typed language work and video/animated lessons are required roadmap work—not shipped capabilities. The sample game screenshot is inspiration, not a request to copy or advertise another product's games or AI builder.

Success feedback: only earned stars appearing one by one with a gentle sound per star, a short encouraging write-up, and Next challenge (or final completion action). Keep a keyboard-accessible close action and reduced-motion option. Retry feedback: non-modal notice at the top of the challenge area after Byte finishes, dismissed after three seconds. Preserve the explanation in an accessible expandable run log so slower readers can revisit it. Do not obscure the board during execution.
