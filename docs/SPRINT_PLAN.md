# Friday sprint: 5–9 October 2026

User-approved reduction: four missions and a creative project. Eight missions remain expansion work. Conditions are not part of the Friday learning claim. Mouse clicks on computers and touch on phones/iPads are explicitly supported input goals; keyboard operation remains part of accessibility.

| Day | Intended outcome |
|---|---|
| Monday 5 October | Record scope, implement the first complete learner loop, prepare additional missions, collect feedback if participants are available |
| Tuesday 6 October | Test and refine the editor and execution on computer, phone, and iPad; address observed confusion |
| Wednesday 7 October | Polish four missions, project, progressive hints, resume behaviour, and recommendation explanations |
| Thursday 8 October | Verify offline reopening, accessibility, privacy, curriculum/source credibility, and complete learner journey; add a reviewed sample translation only if feasible |
| Friday 9 October | Resolve submission-blocking defects, prepare demo and evidence, retain time for submission |

## Missions

1. **A little help for Byte:** three rightward steps; a sequence determines a result.
2. **The way around:** move around rocks; order affects the visited squares.
3. **Less code, same journey:** use a repeat block to move four squares; count controls repetition.
4. **A bug in the route:** run a supplied incorrect sequence, inspect the final movement, and repair it.
5. **Your route, your rules:** choose a destination and create one or more valid routes around a rock.

## Implementation choices

React/TypeScript with Vite and Blockly; bounded, data-driven execution without eval or generated code. The user specified a three-area drag-and-drop interface: robot stage, block palette, and code canvas. Blocks snap together; repeat blocks contain instructions with a count from 2–5. Execution is bounded to 24 instruction blocks, three levels of repeat nesting, and 120 steps. Mouse and touch are the primary input methods. Simple keyboard helpers are available, but complete keyboard/screen-reader editing is still under evaluation. No backend or public deployment is part of this first build.

Recommendations are provisional support rules: successful execution offers advancement regardless of hints; early unsuccessful runs suggest practice; three or more unsuccessful runs in a later mission offer optional review. Completion indicates meeting a puzzle goal, not proven conceptual mastery. All missions remain selectable.

## Remaining evidence

- Learner interviews and observed usability: pending.
- Physical mouse, phone, and iPad checks: pending until actually performed; emulation is not a substitute.
- Screen-reader checks and full WCAG assessment: pending.
- Offline reopening: not yet implemented in the initial build.
- Curriculum reference and reviewed learning content: pending.
- Curated source cards: pending.
- Translation language and fluent reviewer: pending. Do not show a non-functional language picker.
- Public deployment and capstone demo recording: pending.

The first build can be reviewed immediately while these checks continue. The prototype must not be presented as validated learning software or a completed production platform.
