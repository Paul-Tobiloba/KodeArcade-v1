# Coding curriculum V3 — first implementation phase

21 October 2026. Implements the approved V3 plan's retry-friendly practice rewards and two bounded practical units. The owner chose **app-checked tasks only**, not teacher-reviewed submissions. This is a first engineering/content release, not the completion of all 48 proposed units or evidence of classroom learning effectiveness.

## Practice rewards

Every new successful coding or drawing practice completion earns five stars, irrespective of attempts, hints, examples or elapsed time. Failed/stopped runs do not grant completion. Repeating the same activity does not add unlimited points: existing best-per-activity totals remain. Existing completed work, old 1–5 scores, absent historical scores, mission IDs, projects and quiz history are not rewritten. A later successful retry can improve that activity's saved best to five.

An optional versioned `practice` achievement records that the activity was completed under the new policy and whether conceptual hints were used. It is not an independence or mastery field. Existing hint/attempt counters remain useful history, not star caps. Help history is cumulative; narration, extra time, keyboard alternatives and reduced motion are not counted as conceptual help. Free Byte Lab behavior remains unchanged: no course reward is added for playing a personal project. Typing's separate accuracy-based policy is unchanged.

Stars, practical mastery and historic quiz/topic records remain different measures. No new perfect-star gate is introduced. No automatic promotion of legacy stars to independent mastery occurs.

## Two new practical units

Public course entry has a practical-unit section. Assigned students see only units for their assigned Grade 2/4; existing course access and private save rules apply. Grade 2 Sequences and Grade 4 Functions overviews also link to the relevant unit. Routes are `/#/learn/grade-2/practical` and `/#/learn/grade-4/practical`; private routes replace `learn` with `student-play`.

Both units use the same six-stage structure: predict with a supplied reason, investigate, modify/reuse, repair, adapt, independent check. Five practice stages earn one fixed five-star completion, with unlimited help/retries. Relevant prediction, test, repair and transfer evidence opens a fresh check; it is not a ten-route or perfect-star gate. Each stage retains its own editable program. Learners can revisit any practice stage without losing a result.

Practice completion and successful independent checks open native modal popups, as the owner requested. Practice shows the shared five-star animation; independent evidence shows a separate check/status. The centred dialog has a dimmed backdrop, labelled title, visible Close/Keep exploring actions, Escape dismissal, focus containment and return to the invoking check button. It does not require scrolling to a page-bottom celebration.

The workbench is a **restricted guided instruction editor**, not arbitrary JavaScript, Blockly or the full Byte Lab. Native selects/number fields edit the exact configurations consumed by Run and the behavior tests. The interface numbers instruction rows. There is no hidden solution-generated program submitted as the child's code. The existing full Byte Lab remains separately available to Grade 4, and personal projects are not overwritten or automatically graded.

### Grade 2 — Tap, hold, release (G2-U2 bridge)

Objective: distinguish a tap event from movement while held, explain stopping on release, repair a narrow event/stop fault and transfer controls to another character.

- Prediction: a held direction moves repeatedly and release stops it; the supplied explanation identifies the event and release rule.
- Investigation: use arrow keys or pointer/keyboard-operated hold buttons; compare one direction, release and both directions together.
- Modification: change speed from20 to40 units/second and compare the result.
- Repair: replace tap-only movement and continuing-on-release behavior with held movement and stopping.
- Adaptation: use Dash at speed30, with both directions and release functioning.
- Fresh check: a broken/reversed starting program, Dash and a speed requirement of50 or30, plus prediction/reason selections. Check variants alternate on subsequent check attempts.

Movement uses elapsed animation time, not repeated `keydown` frequency. Opposing directions are neutral. Bounds are5–95 on a0–100 horizontal track, starting at50. Native controls capture pointer release; pointer cancellation, focus/window loss, hidden tab, a blocking settings dialog, Stop and a new Run clear held input. Outside the stage, normal keyboard navigation/scrolling is preserved. A purposely incorrect release instruction can demonstrate continuing movement, but external safety cancellation always stops it.

### Grade 4 — Basketball bounce: reusable actions (G4-U6)

Objective: extract a cohesive repeated reset job into a visible no-parameter function, use it from two events, test callers, repair score/end-state faults and adapt the function once for both callers. This differs from Grade 3 definition/call introductions: the learner must select reuse, remove duplicated event resets and prove the effect across callers.

- Prediction: after two hoop events the score is2; a new Run initializes it to0. The reason connects scoring and initialization to their events.
- Investigation: a small playable arcade model uses held left/right input, a ball, a hoop and a miss/end response.
- Refactoring: enable `resetRound()`, replace both inline reset jobs with calls and set the shared x coordinate to30.
- Repair: restore score0 on Start, reset the ball after a hoop and stop on a miss.
- Adaptation: change the function's x coordinate to70 and demonstrate that Start and Hoop both use it.
- Fresh check: a different broken configuration and an x requirement of70 or25. Check real reset behavior, a defined function and both callers, score initialization, one-point hoop/reset behavior, invalid-contact behavior and stopping on miss. Select the relevant prediction/reason too.

The workshop uses0–100 coordinates with downward-positive y. The full Byte Lab uses−100…100 and upward-positive y; the link is an explicit move to a different environment, not a promise of identical units. The workshop has a fixed one-point rule, fixed movement/bounds and simple circular contact checks. `resetRound` exposes x, y45, dx14 and dy38. An inline reset has x50; editing the function must affect both call sites, which tests verify using an alternate definition as well. This is an arcade teaching model, not realistic gravity or pixel-perfect physics. It does not silently modify the existing Byte Lab basketball starter or claim to be its full editor.

## What app-checked mastery means

Checks execute the same pure movement/basketball kernels as the live scene, including valid/invalid contact and restart cases. A learner must run the edited program, meet the fresh behavioral brief and select a correct prediction with its supplied explanation. A visible hint marks that check supported; successful supported work remains practice and does not grant a new independent distinction. Access support does not do so. A fresh check clears the check's support flag, restores a broken program and uses a versioned bounded variant.

Successful independent evidence is labelled **App-checked mastery demonstrated**, scoped to this task. Transfer is recorded when the fresh changed brief also passes. This does not establish general programming competence, which physical finger/technique was used, a free-form verbal explanation or authorship without assistance outside the app. Multiple-choice reasoning alone is insufficient: actual editable program behavior must also pass. A later unsuccessful/supported check records its latest outcome but does not erase prior demonstrated evidence. Independent status uses a check icon/status, not another pile of repeatable star points.

## Data, privacy and release

`shared/codingPractical.ts` defines strict bounded version1 records for exactly `g2-controls-v1` and `g4-basketball-v1`: six program drafts, bounded selected answers, five practice-step results, support history, check count/latest outcome and preserved demonstrated/transfer flags. No free text, voice recordings, uploaded projects, real names or arbitrary executable code is collected. Backups export this bounded record.

Public work uses `kodearcade-practical-v1:grade-X`, separate from coding and account drafts. Private work uses an additive `practical` field in the existing assigned course document and the existing CloudSaver/encrypted device-recovery pipeline. Cross-grade/mismatched program kinds and unknown fields are rejected. Older clients omitting the field or practice metadata do not delete it. Malformed saves offer the original for recovery rather than replacing it; failed saves retain the open work and offer retry/export. Legacy course completion denominators remain unchanged; separate API summary counts describe the new unit.

Deploy frontend and backend together. No database migration, automatic production rewrite, push, deployment or hibernation is part of this work.

## Grade-by-grade continuation and App Lab

The V3 map remains the progression authority for Grades1–6. This phase adds one early event bridge and one deeper function/reuse unit; it does not relabel all existing introductory functions as a different curriculum. Subsequent unit replacements must preserve original work and use new versioned evidence where objectives change.

App Lab is now available and should join the next authored units, rather than forcing every data concept onto a route:

| Grade | Proposed application | Practical evidence to author next |
| --- | --- | --- |
| 1–2 | Keep the small guided event bridge and drawing; do not expose the full older App Lab palette | Predict a response, repair one action and make a familiar change |
| 3 | A greeting app or click counter with labelled input/output and Start reset | Trace input→event→output; repair an incorrect ID/event and verify reset |
| 4 | A multi-screen club app, with reset actions and project-local table quantities | Test both function callers and screen transitions; explain named columns/row index |
| 5 | A calculator or data explorer using bounded text/number operations and local table reads/updates | Test ordinary, empty and boundary input; explain text versus number and repair a data lookup |
| 6 | A useful multi-screen tool designed from a brief, with local tables and a regression checklist | Derive tests, justify state/data responsibilities, handle unavailable/invalid local data and adapt a requirement |

These App Lab rows are next-authoring proposals, not newly delivered guided lessons or mastery awards. Current App Lab allows click/change events, bounded arithmetic/text functions, screens/properties and project-local `getCell`/`setCell`/row operations. It is not arbitrary JavaScript, live network APIs, unrestricted JSON parsing, free-form records/classes or a general list/search/sort environment. Those V3 technical gates remain. App Lab design coordinates also differ from route and Byte Lab coordinates; teach each transition explicitly.

## Verification record

Current supplied evidence: 1,989 frontend tests in 50 files, 25 isolated-PGlite progress API tests, production build and server typechecks passed. The initial 36 browser checks plus 12 additional checks cover 39 distinct cross-device cases because nine practical cases were repeated to repair captures. Another 12 targeted checks passed after active-step navigation and card-title hierarchy fixes, including selected-button bounds and draft restoration; they are confirmation runs, not additional distinct cases. The built-preview course-entry → prediction/reason → check → reload smoke retained the completed first step with `pageErrors: []`. Private browser responses are synthetic account fixtures; no production account or live database was tested. The provenance scan covered 44 reused rasters with zero missing; no new raster was generated.

The owner's popup follow-up is implemented. All 18 practical browser cases passed across desktop, phone and tablet after the modal change, including native modal state, viewport containment, Axe checks, Tab containment, Escape/Close dismissal and focus return, plus private/corrupt/retry flows. These are expanded confirmations within the same 39 distinct cases, not 18 additional unique cases. Build/server types passed again. All 12 practice/mastery modal viewport captures and three corrected entry-card crops were opened and validated; card art fits the 55px phone column. Built-preview card-fit/entry-save assertions passed on all three device classes. A final built-preview popup smoke on port 4173, using a synthetic prior-step seed, returned `builtPopup: true`, `escapeFocusReturned: true` and `pageErrors: []`.

The fresh finish follow-up is `ship` for the revised practical modal surface, original navigation/title fixes and bounded phone card-art containment fix, with no material fixes remaining. It supersedes the initial fix verdict for that scope; it is not approval of all proposed V3 content or learner outcomes. See `.impeccable/review/coding-practical-verification.md` for the current full test/build boundaries and `.impeccable/review/coding-practical-finish.md` for the exact disposition. Passing software tests do not substitute for learner/teacher piloting. No standards alignment or confidence/learning-outcome claim is made.
