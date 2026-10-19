# Byte Lab block comparison — 18 October 2026

Historical baseline: **Byte Lab did not include every block in the 21 supplied Code.org screenshots when this comparison was written.** The owner subsequently asked “So can you add them?” and authorized the implementation. The missing text/input, timing/sensing, locations, runtime sprite/group, behavior, math and world capabilities have now been added with explicit bounds; see [the current implementation inventory](BYTE_LAB_BLOCKS_2026_10_18.md). The table below is retained as the before-state, not a current missing-feature list. Neither document implies complete Code.org/Scratch compatibility or parity.

Available means an equivalent executable building block exists, not identical names, coordinates, editor shapes or visual design. Composable means the result can be assembled from existing blocks but the dedicated convenience block is absent. UI-only is not a runtime code block. Guided-only is not part of the free-build palette.

| Screenshot capability | Current Byte Lab status | Evidence / limitation |
| --- | --- | --- |
| Set background image | Available | World: switch background to an asset; library/import/drawing managed through Backgrounds. |
| Set background color; random color | Missing as code blocks | Background paper/color can be authored in the art UI, not changed by these runtime blocks. |
| Play sound | Missing as a programmable block | Platform audio/settings do not count as a child-programmable sound block. |
| Show/hide title screen, title/subtitle | Missing | No runtime title overlay. Sprite speech is not a substitute for a title-screen block. |
| Print arbitrary text to stage | Partial | Say literal text, timed speech and say-number exist; Output shows numbers/Booleans. No general text-print block. |
| Prompt user; prompt with choices | Missing | No user-answer variables or asynchronous prompt controls. |
| Reset timer; elapsed seconds/milliseconds | Missing | Wait + a numeric counter can compose a logical clock, but is not a real elapsed-time reporter/reset block. |
| Key is pressed reporter | Partial | Key-press event hats exist for arrows/space; no held-key Boolean reporter. |
| Mouse location | Missing | No pointer-coordinate reporter. |
| Make a sprite at runtime; make N sprites; burst; create using a grid | Missing as code blocks | Choose sprite/duplicate/remove exist in the editor before running; fixed authored cast of up to4 sprites. No runtime cloning/spawn/particle system. |
| Named sprite, this sprite, all sprites / costume-based group | Partial | Every authored sprite has its own program; sensing can select another sprite. No first-class sprite/group reporter or all-sprites action target. |
| Remove sprite during run | Missing | Editor Remove is not a runtime removal block. Show/hide preserves an existing actor. |
| Set size / read size | Available | Looks set-size plus size reporter. |
| Change size by N | Composable | Set size to size + N; no separate increment-size block. |
| Move north/east/south/west | Composable | Set/change x/y; x/y reporters and arithmetic. Coordinates are−100…100, not Code.org pixel positions. |
| Move forward/back; turn left/right by degrees | Available | Motion forward/back with numeric distance; turn0–360°; point in direction. |
| Say literal text; timed say; say numeric value | Available | Looks blocks; text field max120, timed speech existing bounded duration. |
| Face a direction | Available equivalent | Point in direction using a numeric heading. No separate named-cardinal face dropdown. |
| Jump to random location | Composable | Go to x=random… y=random… using random-number blocks. |
| Change/remove sprite color | Missing | Costume changes are supported; runtime tint effects are not. |
| Costume-is predicate | Missing | Switch/next costume exists, but no Boolean costume-match reporter. |
| Touching edges / chosen sprite | Available | Sensing includes edge/any-character and selected-other-sprite Boolean reporters. Size-based proximity, not pixel masks. |
| Location literal / location of sprite | Partial | Go to numeric x/y; selected other sprite's x/y reporters. No first-class location object/socket. |
| Offset N pixels north of a location | Composable | Numeric x/y arithmetic; no location-valued offset block. |
| When key pressed / this sprite clicked / touches border or character | Available | Events hats; crossing/new-contact semantics. No named group-targeted event object. |
| At N seconds / repeat every N seconds | Composable | Run→wait→actions; forever→wait→actions. No dedicated clock event hat. |
| When prompt answered / all prompts answered / sprite created | Missing | Corresponding prompt and runtime-spawn primitives are absent. |
| Start/stop a reusable behavior, create behavior | Missing as a subsystem | Personal functions exist; no independently attachable named behaviors with start/stop lifecycle. |
| Draggable behavior | Missing | No runtime pointer drag behavior. |
| Driving/moving with arrow keys | Composable | Key hats and movement; Arrow-key adventure demonstrates this. Not a behavior token. |
| Moving east/north/south/west and looping; patrol; spin; grow/shrink; wander/wobble/flutter/swim | Mostly composable | Forever/repeat, movement, variables, random, wait, size and turn allow manually authored routines. Not a complete shipped behavior library. Only spin_right and hop are built-in inspectable helpers. |
| Repeat N | Available | Finite repeat and forever exist; free-build repeat1–100. Drawing repeat has separate execution budgets. |
| Count with counter from A to B by step C | Missing dedicated block | Repeat + numeric set/change variable can compose a fixed-count form, not a general counted-loop block. |
| Create, set, change, read variable | Available for numbers | Typed name fields, up to8 local numeric variables per sprite. No string-valued variable or sprite-group value. |
| Show/hide variable at chosen location | Partial | Show/hide numeric counter; stage counter layout is fixed, not arbitrary x/y positioning. |
| Arithmetic + − × ÷ remainder; random integer; number literal | Available | Operators blocks, with finite/bounded values and divide-by-zero validation. |
| Number of matching sprites | Missing | No runtime sprite-group/count reporter. |
| Round / floor / ceiling / square root | Missing | No dedicated rounding or advanced-math block. |
| If / if-else, numeric comparisons, AND/OR/NOT, Boolean literals | Available | Control and Operators; equivalent semantics, not identical Code.org mutation controls. |
| If N% chance | Composable | If random integer1…100 <= chance. No dedicated chance statement. |
| Create/call function | Available | Editable personal definitions; optional numeric parameter/return. Built-in helpers read-only/inspectable; not arbitrary text/multiple-input functions. |
| Text literals as reporter values, join strings, text-valued variables | Missing / partial | Literal speech text fields exist; general string expressions, concatenation, string variables and text output do not. |
| Dedicated comment block | Missing | No executable standalone comment block in the free-build palette; editor metadata comments, where present, are not the shown block. |

## Separate lab capabilities

Drawing & Art is an existing code-drawing workspace: forward/turn/repeat, pen up/down and saved positions; Grades5–6 also have bounded Python-style drawing text, including variable-based patterns. Tools offer limited ink colors and widths. Byte Lab's costume/background editor also provides pen/eraser/line/rectangle/ellipse and image import; that is not a standalone full paint application.

Lists/objects are taught in guided Grade3–6 activities (`dataProgram.ts`, `dataBlocks` and corresponding topic palettes), but are not general-purpose free-build Byte Lab values. Do not claim that teaching a topic means the sandbox exposes its full data model.

## Current source evidence

- `src/studioBlocks.ts`, `src/spriteBlocks.ts`, `src/conceptBlocks.ts`: free-build palette, field/socket definitions and block categories.
- `src/studioEngine.ts`: executable values/actions/events, primitive limits, local variables and scheduler semantics.
- `src/studioFunctions.ts`, `src/StudioFunctionEditor.tsx`: the two inspectable helpers and personal-definition editing.
- `src/studioCode.ts`: read-only learning translation, not an execution engine or standalone JavaScript output.
- `src/studioGameStarters.ts`, `src/studioStarters.ts`: editable sample compositions, not proof of absent convenience blocks.
- `src/drawingBlockly.ts`, `src/textCoding.ts`, `src/DrawingLab.tsx`, `src/StudioArt.tsx`: distinct drawing/code-art and costume/background paint capabilities.
- `src/dataProgram.ts`: guided-only list/object activities.

## Original suggested work (subsequently implemented with the bounds linked above)

Start with real timers/key-state and pointer sensing, text expressions/variables and prompt handling, and programmable sound/background color. Runtime cloning/group targets and behavior lifecycle need a separately bounded runtime/save design. Add convenience blocks as inspectable compositions where possible; do not conceal complete games in one hard-coded block.
