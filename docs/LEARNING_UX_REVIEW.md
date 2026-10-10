# Learning-flow UX review — 10 October 2026

Scope: lesson/topic overview, activity selection, continuation, and discovery of existing drawing practice. The learning shell, landing pages, curriculum objectives, backend and saved-work schemas are preserved. This is a scoped implementation review, not a usability study or accessibility certification.

## Findings and implemented changes

| Finding | Resolution |
| --- | --- |
| Grade 1 journey buttons inherit centered alignment, giving each title a different left edge. | A shared semantic ordered list with fixed number/check column, left-aligned title and description, and explicit action/status. Whole rows are targets at least 44px high. Mobile status wraps below the description. |
| Completing ten core challenges leaves an ambiguous “Start challenge” action and no direct module continuation. | Completed journey says all ten are complete and offers practice again. Every available module overview ends with “Next module”, naming its destination. The final module offers “Explore courses”. Perfect stars and optional drawing are not new gates. |
| Core challenge lists outside Grade 1 are only discoverable through the drawer. | The same activity list now appears after each module lesson, showing real completion and attempts. Explicitly selected unfinished challenges are preserved when reviewing their lesson. Completed challenges suggest the next unfinished activity, or practice again when all are complete. |
| Drawing appears as a generic banner unrelated to the current topic. | Existing drawings are placed by their code: Grade 1 trail → Sequences; turns, square and stairs → Direction; repeated polygons, stars and crystals → Loops; changing-distance spirals → Variables; saved-position branching → Direction; free creation → Build project. No activities or objectives are removed. |
| A flat drawing carousel crosses topics and the final drawing has no meaningful exit. | Drawing progress and next-drawing actions stay within the originating module. The final drawing offers “Back to module”; the guide also names that return destination. Saved IDs, code, workspace, ink, stars and completion remain unchanged. |
| The final core challenge can bypass other activities in its module. | Its success action returns to the module overview, with optional drawing and Next module available. Ordinary challenges still advance to the next challenge. |
| A disabled mastery button does not explain what remains. | Grade 1 mastery now states the remaining core challenge count and/or repair prerequisite. Badge eligibility is unchanged. |

## Existing patterns retained

- Desktop first activity in each module opens the lesson article; later activities start with it collapsed. Desktop here is wider than 1100px and taller than 600px.
- Mobile/compact layouts start with the entire guide collapsed, even on activity 1. Learners may expand it. A hint request opens help intentionally.
- Desktop remains the 25/30/45 guide/world/code split with an overlay drawer. Smaller screens scroll normally.
- Local-save failures remain visible, text/blocks keep separate saves, and typed practice continues to disclose that it is a bounded teaching language rather than full Python.
- Drawing completion remains practice evidence, not a replacement for core mastery or a badge requirement.

## Guidance consulted

- [Nielsen Norman Group: Visibility of system status](https://www.nngroup.com/articles/visibility-system-status/): communicate the current state and the result of actions so learners can choose their next step. Applied as text completion states, honest continuation labels and named destinations.
- [W3C WAI: Content structure](https://www.w3.org/WAI/tutorials/page-structure/content/): use headings and semantic lists for meaningful structure. Activities are an ordered learning sequence, not tabular data, so no layout table was introduced.
- [Code.org: Drawing with Loops](https://studio.code.org/courses/coursee-2022/units/1/lessons/6): drawing can practise repetition and distinguish commands inside and outside loops. KodeArcade's mapping is our decision based on existing activity code; it does not claim Code.org curriculum alignment or copy their materials.

## Next improvements, not claimed as implemented

1. Author differentiated topic journeys and grade-appropriate worked examples beyond the existing Grade 1 sequence journey. Generated routes are not equivalent to individually authored lessons.
2. Test discoverability and language with children: find the next activity, ask for a hint, recover from an error and return from drawing. Include touch and keyboard-only use.
3. Validate colour, focus, touch targets and narration across the remaining settings and computer activities. Scoped automated accessibility checks do not cover the whole platform.
4. Before introducing accounts, design guardian/child ownership, consent, recovery and saved-work migration. Backend/auth remain deferred.

Implementation used Impeccable Operate/layout guidance to preserve the existing interface while clarifying hierarchy, and the Vercel React best-practices checklist to review derived state, controlled navigation and component semantics.

## Verification

- Production build passed; the existing large Blockly/application chunk warning remains (approximately 845KB before gzip).
- 944 unit tests across 15 files passed, including seven drawing-placement/save-key checks.
- 45 distinct browser checks passed across desktop, phone and tablet: curriculum/drawing, ordinary coding and saved work, module selection, topic runtimes, three-column/help defaults, and the new module UX flows. The initial regression batch caught two continuation regressions; both were fixed and verified in an 18-check confirmation batch.
- Scoped automated WCAG A/AA checks passed for the tested topic/module views and incumbent workspace checks. The layout detector returned no findings for the changed list/overview surfaces. Neither result is a full-platform accessibility claim.
- Captures: `.impeccable/review/module-list-{desktop,phone,tablet}.png`, `module-next-*` and `module-loops-*`. Captures use isolated test saves; the user's browser progress was not changed.
- Changes stay on `codex/new-visual-direction`; Main/V1 is not modified. The owner subsequently requested a GitHub push.
