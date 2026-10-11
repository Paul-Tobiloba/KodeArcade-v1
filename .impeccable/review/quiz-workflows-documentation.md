# Quiz, teacher workflow and save-feedback comparison

11 October 2026. Bounded Impeccable documentation pass for an ordinary extension of Build & Play. This file records local decisions; it does not regenerate DESIGN.md or .impeccable/design.json.

## Authority and evidence

Compared PRODUCT.md, DESIGN.md, the schemaVersion 2 sidecar and the module-quizzes, teacher-workflows and save-feedback surface briefs against ModuleQuiz.tsx, module-quiz.css, ClassProgress.tsx, TeacherBatch.tsx, ClassroomManager.tsx, SaveFeedback.tsx and save-feedback.css.

The supplied independent fresh-review verdict is SHIP for the reviewed quiz, teacher-workflow, recovery and save-feedback additions after inspection of all 27 desktop, phone and tablet evidence images. The reviewer reported no material fixes. This documentation pass checked source and recorded that supplied visual verdict; it did not independently repeat screenshots, tests, detector execution or runtime security verification.

## Comparison with the incumbent system

- Quiz reading uses the incumbent white surface, learning ink, violet action/selection, lavender borders and system reading voice. Its bounded 820px column, semantic fieldsets, native radio groups, labelled read-aloud controls and in-flow explanations fit the existing learning reading surfaces. The 14px container, 8px options and 7px code panel follow established shape roles. Options have a 48px minimum height and explicit focus-within outlines. At 600px, padding reduces, entry content stacks and action buttons fill the row; code samples scroll within their own panel.
- Submission requires all five answers. A new result moves focus to its result heading; retry clears the current answer draft while retaining best answers and attempt history. Quiz results remain distinct from coding challenge stars in teacher tables. These are topic learning checks, with no claim of curriculum validation or proctored assessment.
- Teacher operations reuse account tables, native file/select/checkbox controls, progressive details, notices and existing primary/secondary actions. CSV import presents local validation and a preview before confirmation. Roster selection leads to an explicit credential-reset warning and a private PDF download. Course choices stage until Save assignments, with Cancel changes and an explanation of removed access. No new global component identity is introduced.
- Routine save feedback uses an existing lavender border and 8px control radius in a compact fixed bottom-corner toast. Its zero-height slot avoids moving lesson content and pointer-events:none allows interaction through the routine notification. A successful save hides after 3000ms; the effect cleans its timer on status change/unmount. Opacity/translation exit takes 180ms, with spatial movement removed by both reduced-motion settings. The status region is polite by role and hidden from accessibility APIs after dismissal; it never takes focus. Errors/conflicts retain the in-flow status and relevant Retry, Download and Reload actions.

## Scoped local exceptions

The single scoped detector run recorded three nonblocking advisories in module-quiz.css; see [detector evidence](quiz-workflows-detector.md). Retain them as local quiz decisions, not additions to the global token contract:

1. Question legends use 1.125rem at weight 650 and line-height 1.5 for readable question emphasis. Answer options keep inherited system body typography. This does not establish a new application-wide type scale step.
2. Correct answers use the local pale-green tint #edf9f5 with incumbent functional teal #08796e. A check icon and the explicit “Correct answer” label convey the state alongside color. The tint is not a new brand accent.
3. Incomplete submission uses local error text #9c233a with a role=alert instruction explaining which answers remain. It is an assessment validation state, not a new global error palette.

The detector was not rerun. Its note records that the subsequent toast placement correction uses an incumbent border color and shape; the supplied final visual review covers the resulting placement.

## Preservation and limits

DESIGN.md and .impeccable/design.json remain unchanged. Pre-existing global drift is reported rather than repaired: the sidecar retains older compatibility/backend-scope prose and does not mirror every later DESIGN.md guardrail. Current account/backend availability is described in PRODUCT.md; this extension does not promote stale design narrative into product truth.

No new visual world, raster or artwork was created, so this pass adds no raster provenance requirement. The supplied SHIP disposition applies only to the reviewed additions and evidence, not whole-platform accessibility, educational validation, production readiness or security certification. No secrets or real learner records were accessed.
