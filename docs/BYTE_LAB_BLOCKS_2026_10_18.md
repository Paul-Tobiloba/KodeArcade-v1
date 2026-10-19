# Expanded Byte Lab blocks — 18 October 2026

The owner authorized implementing the missing capabilities after the screenshot comparison. This extends the existing private, free-build Byte Lab for Grades 3–6. It does not replace guided course palettes, Drawing & Art or the existing mobile layout, and does not promise Code.org/Scratch file or API compatibility.

## Where to test

Open the student dashboard → Creative spaces → Byte Lab for an assigned Grade 3–6 course. Local Grade 6 route: `http://127.0.0.1:5173/#/student-play/grade-6/lab`; the existing preview route also works at `/#/learn/grade-6/lab`. Refresh an already-open tab. Choose a new blank project to explore without replacing an earlier project, and wait for “Saved to your account” after editing.

| Category | Added executable building blocks |
| --- | --- |
| World / Output | Background color and random color; title/subtitle overlay and hide; four synthesized sound cues; text print at a location; asynchronous question and three-choice question; reset timer and elapsed seconds/milliseconds. |
| Events | At N seconds, every N seconds, this answer received, all currently pending answers received, sprite created. Existing run/click/key/border/contact/message hats remain. |
| Sensing | Held arrows/space; pointer down and touching this sprite. Keys clear when the page loses focus. |
| Locations | Coordinate value, random location, pointer location, named/current sprite location, cardinal offset, x/y component and go-to-location. |
| Sprites | Named/current/all sprite selection, costume group, count, touching selected group, last-created group, for-each sprite, bounded creation from a template and runtime removal. |
| Looks | Costume-is predicate, tint and clear tint. |
| Control / Operators | Inclusive ascending/descending counted loop with an explicit step, chance statement, round/floor/ceiling/square-root/absolute-value reporters. |
| Variables / Text | Bounded text values, join, text variables, equals/contains, say expression, and a numeric counter at a chosen location. Existing numeric operations remain. |
| Behaviors / Functions | Start/stop a named no-input body, stop this sprite’s behaviors, draggable on/off, editable personal behavior definitions, and inspectable read-only helper definitions. |
| Comments | Standalone explanatory comment, with no execution side effect. |

## Inspectable compositions, not hidden games

The Behaviors shelf includes cardinal motion and wrapping, held-key movement/driving, spinning, growing/shrinking, jittering, fluttering, wandering, forward motion, wobbling, patrolling and swimming. They repeat ordinary movement, conditional, arithmetic and sensing blocks. Functions calls the same body once. Children create their own bodies using **Create behavior** or **Create function**, then use the definition name in a start-behavior block. Personal bodies remain editable and rename/delete checks include behavior references.

Sprites includes **make grid** and **make burst** calls with a numeric count. View their definitions through **Built-in definition → View definition**. Grid uses a counted loop, arithmetic and spawn; burst uses spawn, last-created iteration, random headings and the ordinary forward behavior. The grid is a fixed five-column composition, not a painted grid-picker tool.

New built-ins have `@`-prefixed internal names, outside the valid personal-name grammar. This avoids reserving formerly valid names such as `sys_moving_east`. The pre-existing `spin_right` and `hop` names are unchanged. Built-in definitions cannot be saved over; personal functions retain the existing four-definition limit and optional numeric input/return model. Runtime helper tasks are bounded independently of authored block counts.

**Show code** translates every added block and includes referenced built-in definitions, including nested helpers. It is an escaped, read-only JavaScript-style learning view, not standalone JavaScript and not an alternate execution path. Scripts are interpreted from validated blocks; no eval, external requests or external image loading is added.

## Execution, privacy and limits

- Four authored sprites and the existing project schema remain unchanged. Created actors are temporary: at most 32 on stage, 1–20 per creation block and 128 creations per run. They share their template’s source and run created/timer hats, not its Run hat. Reset restores the authored cast.
- Group iteration retargets the body’s current sprite; it does not create a new persistent program. Selection values cannot be stored in variables. Existing contact hats still use aggregate new-contact semantics; combine group predicates/iteration for named group responses.
- Questions use an in-stage form or three native choice buttons, not blocking browser prompts. At most four may wait concurrently. Answers are printable strings of at most 120 characters and are never written into the project or account snapshot. Runtime answers can be displayed by the child’s code, so the form explicitly discourages personal details. Stop discards waiting questions; Reset/Run discards the transient run.
- Number/text variables share eight slots per actor (including initial `score`). Text joins and output use the same 120-character bound. Twelve printed labels, eight retained sound requests, 32 cooperative tasks and 64 timer schedules bound transient work.
- The monotonic elapsed timer uses real time; reset affects its reporter only. At/every events use 0.1–3600 seconds relative to run/creation, skip missed repeat intervals, and do not duplicate a still-running event body. Other scripts can run while a script waits for time or an answer.
- Coordinates remain −100…100, up is positive y, not reference-editor pixels. Movement/size retain existing local bounds. General arithmetic accepts finite values up to ±1 billion. A counted loop uses whole numbers and a nonzero step, up to 1,001 iterations. Ordinary literal repeat remains 1–100. The run stops at 10,000 executed scheduler steps; nesting and recursion protections remain.
- Sound uses existing local synthesized effects and the learner’s sound preference (off by default in synthetic checks), not an external audio library. Stop cancels program audio. Tint is a CSS hue/filter effect preserving detail, not an exact pixel recoloring tool. Title screens are visual overlays, not automatic pause/stop instructions.
- Existing asset-reference validation retains missing IDs instead of silently selecting a different costume. Existing image import, private saves, libraries, starters and mobile stack are preserved. No backend/database change, deployment, public sharing or computer-power action is part of this implementation.

## Verification

Runtime and code-view checks cover the new primitives, helper compositions, private transient answers/actors, reference validation, monotonic timers and personal-name compatibility. Browser checks cover question/answer/Stop/Reset, held input, drag offsets, keyboard construction, source save/reload and read-only/personal definition flows across desktop, phone and tablet. Final counts and review evidence are recorded in `.impeccable/review/blocks-verification.md`.

The original screenshot comparison is a historical baseline, not the current implementation inventory. Lists/objects remain guided-only; convenience changes such as “change size by” are still built from arithmetic and set-size. This is capability coverage with explicit bounds, not identical block shapes, names or complete reference-platform parity.
