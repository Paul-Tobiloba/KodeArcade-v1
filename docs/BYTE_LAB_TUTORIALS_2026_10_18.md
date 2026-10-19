# Editable Byte Lab tutorials — 18 October 2026

The owner accepted the recommended next step after the block expansion: short, editable tutorials that make questions, timers, sprite groups and custom behaviors discoverable. This adds four self-paced projects to the existing free-build Byte Lab; it does not change guided curriculum, automatic grading or the mobile composition.

## Try it locally

Student dashboard → Creative spaces → Byte Lab → **New project → Block tutorials**. The same chooser is available from My projects and the first-use choice. Games & stories remains the default chooser section with its nine existing starters; blank projects are still available. Refresh an already-open tab to load the new code.

| Tutorial | Working project | Edits taught |
| --- | --- | --- |
| My space hero | A made-up hero answer becomes joined speech; a three-choice question sets the destination. | Change the greeting text and planet choices; inspect the learning code. |
| Beat the countdown | Click Byte to score before a real five-second deadline. An every-second event updates elapsed seconds; an at-time event ends the game. | Change both the clock event and click comparison to eight seconds; change points per click; try three seconds. |
| Butterfly swarm | Make six temporary butterflies from one saved template, iterate over last-created sprites, randomize their locations, change size, enable dragging and count the costume group. | Change creation count and group size; use Space to remove the last-created group and see the count return to one. |
| Dance with Byte | A personal `my_dance` turn/wait body repeats alongside the inspectable arrow-moving built-in. Clicking Byte stops only the dance; Space starts it again. | Edit/save the personal turn angle, inspect the built-in ordinary blocks and compare independent behavior lifecycles. |

Every game/story rule is ordinary serialized source. No tutorial-specific interpreter instruction or hidden whole-game function was added. All templates use one authored sprite and remain within the existing 64 non-start block limit. The runtime bounds from `BYTE_LAB_BLOCKS_2026_10_18.md` apply unchanged. Butterfly count can be 1–20 in this example; the costume-group count includes the original, so its initial value is seven.

## Guidance and controls

The compact **Project tutorial** guide sits above Code only in tutorial projects. It shows one of four steps with instructions, what to notice, Previous/Next, and **Find [category] blocks**. Find selects the existing category; it does not edit, run, stop or grade the program. It is disabled during a run with “Stop to find blocks.” Step navigation focuses the new step heading for keyboard users.

**Minimize tutorial / Show steps** preserves the current step while mounted. The guide starts expanded above the existing 950px stack breakpoint and minimized at or below it, leaving the established stage/properties/code order intact. The narrow viewport can scroll to Code as before. The swarm/dance projects also expose a native **Space** button for their space-key event, so a physical keyboard is not required. Arrows retain existing pointer/keyboard controls.

Steps are suggestions, not automated completion checks or a graded course lesson. The last step offers **Start steps again**; no completion claim, star, attempt or curriculum progress is created. Step index and minimized state are session UI state, not saved progress; reopening begins at step one with the viewport's default expansion. The project source and tutorial identity do save.

Switching away from Code unmounts the guide, so returning starts its steps again. Personal definition editing, read-only built-ins, keyboard building, costumes/backgrounds, Show code, stage resize and Run/Stop/Reset remain the existing mechanisms. An untouched first-use project still has the existing optional editor tour.

## Saves and compatibility

Four validated tutorial identifiers extend the existing optional `starter` enum: `tutorialQuestions`, `tutorialTimers`, `tutorialSprites`, `tutorialBehaviors`. This is an additive current-code save contract; old projects without these values remain valid. Gallery entries, backups and the current client/server validator all retain the identifier and edited blocks. No database migration or schema-version rewrite is required. An older app binary that predates these identifiers cannot be promised to open a new tutorial backup; use the current version.

Selecting a tutorial in the normal library-backed editor creates another private gallery entry, preserving earlier project bytes. Canceling the chooser creates nothing. Existing limits remain 20 slots including Recently deleted and 600kB for the gallery; rejection closes the modal and exposes recovery while keeping the earlier gallery unchanged. The editor's existing non-library fallback still asks for replacement confirmation and requests a backup before replacing its one slot; the tutorial does not bypass that safeguard.

Questions discourage real names/personal details; answers and temporary actors are transient, not saved project data. Children can display answers during the run. The existing student account transport and staff-report exclusions are reused. There is no tutorial analytics or new external request, account permission, public sharing or automatic publication.

## Evidence and remaining release steps

Template/runtime tests verify actual answers, clocks, deadline/bonus edits, group actions, dragging/removal, independent behavior stop/restart, block budgets, backup metadata and preservation of old gallery entries. Browser tests exercise all four projects, keyboard source edits, minimized/expanded steps, private source reload, no course grading and full-gallery recovery on desktop, phone and tablet. Synthetic backend tests round-trip all four tutorials through the existing student API/database test harness and keep their content out of staff summaries.

Final execution totals, responsive captures, detector/provenance results and independent review/documentation are recorded in `.impeccable/review/tutorials-verification.md`. Tests use synthetic fixtures, not a real-child account or new live Neon journey. No shipping art was generated or replaced. Existing global DESIGN.md and sidecar are preserved. This is local implementation only; an actual student-account check and publishing an approved preview remain separate next steps, not completed or inferred from this task.
