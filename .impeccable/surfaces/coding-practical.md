# Coding curriculum phase one — 21 October 2026

Mode: Operate. Owner requested resuming the approved V3 coding curriculum enhancement and removing attempt-based star penalties. They confirmed app-checked practical tasks only, not teacher-reviewed submissions. This implements the plan's two pilots before replacing all grades; it is not a claim that all 48 proposed units are delivered or learner-piloted.

## Direction contract

THESIS: Make practice safe to repeat and turn concrete program behavior, repair and transfer into separate app-checked evidence.

OWN-WORLD: Inherit the KodeArcade learning shell: violet header/action, lavender ground, Fredoka headings, system reading text, white work panels, Lucide icons and existing character/sport assets. Native editing controls remain explicit and accessible. No identity redesign or concept tournament for this specified extension.

STORY: Open a Grade 2 or Grade 4 practical unit from the course chooser or assigned dashboard; predict with a supplied reason, run, modify, repair and adapt; earn fixed practice stars in a popup; then try a fresh app-checked task with a separate status/check popup on success. Narration/input alternatives are access support. An explicit hint makes that check supported, never removes practice stars, and a later check cannot erase previously demonstrated evidence.

FIRST VIEWPORT: Unit title and separate practice/mastery state, a six-step navigation strip, reading brief on the left, live scene/editable instructions/tests on the right. Phone/tablet reflow without horizontal page overflow; learning content may scroll. Success opens a centred native modal over a dimmed backdrop, with readable reward/status copy and visible Close/Keep exploring actions. Preserve keyboard navigation, modal focus/return and safe stopping on release/cancel/focus loss. Line numbering belongs beside editable instruction rows. No learner writing/project uploads are collected.

FORM: A precisely scoped code-led extension of the existing learning interface, using restricted guided instruction editors, not a new full programming language or a replacement for Byte Lab. Grade 2 models held events versus tap-only movement; Grade 4 models two callers of a visible resetRound function. Tests execute the same bounded kernels as Run. Selected explanations and bounded variants are evidence for these tasks only, not proof of general coding competence.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Reward boundary

Future successful coding/drawing practice receives five stars regardless of attempts, hints or guided examples. Stars are a best-per-activity total, not unlimited points for repeating submissions. Existing legacy values are not recomputed or promoted to mastery. A new completion may improve that activity to five. Additive versioned practice metadata and practical evidence retain old-reader compatibility through the shared server contract; no migration or live data mutation. Existing quiz history, old course/mission IDs, saved projects and typing policy remain intact. The approved shared star animation is reused unchanged.

## Implementation record — 21 October 2026

Implemented scope is exactly G2-U2 Tap, hold, release (`g2-controls-v1`) and G4-U6 Basketball bounce: reusable actions (`g4-basketball-v1`). The first bridges tap/held/release behavior into a small guided editor; the second exposes `resetRound()` and two call sites with real behavior tests. Six separately saved stage programs support predict/explain, investigate, modify/reuse, repair, adapt and a fresh check. Five completed practice stages award one five-star completion; independent/transfer evidence is a separate monotonic bounded status. Conceptual hints support the current fresh check; local narration and input alternatives do not. No free-form learner submissions, raw voice, arbitrary JavaScript, private-project grading or replacement of the full Byte Lab is introduced.

The implementation inherits learning action/navigation violet, lavender ground, Fredoka headings, system reading text and white border-led work panels. A 1280px workbench uses a brief beside the scene/editor on desktop and stacks at 850px; phone controls wrap and the six-step strip scrolls natively. Active-step selection/restoration brings the whole selected button into view. Entry-card metadata follows the title. The owner's follow-up replaces the initial inline celebration with a centred native `dialog`: the white surface is bounded to 540px and viewport height, uses the existing dark backdrop, focuses its labelled title, closes through Escape/Close/Keep exploring and restores prior focus. Native labelled fields, visible keyboard focus and at least 44px primary controls retain the incumbent access approach. These are scoped surface rules, not new global tokens.

Public work uses an isolated `kodearcade-practical-v1:grade-X` browser namespace. Private work remains within assigned course access and the existing additive versioned progress/recovery pipeline; malformed original saves remain recoverable. Existing course totals and personal work are preserved, with separate practical summary counts. Deploy frontend/backend together; no migration, push, deployment or live database rewrite occurred.

Verification/report: `.impeccable/review/coding-practical-verification.md`; documentation comparison: `.impeccable/review/coding-practical-documentation.md`. All 18 practical browser cases passed after the modal update, with modal/focus/viewport/access assertions and private/corrupt/retry flows; these confirm existing cases rather than inflate the 39-distinct-case total. Twelve modal viewport captures and three entry-card crops are valid, with corrected 55px phone art containment. Build/server types passed again. Final built-preview popup smoke, using a synthetic prior-step seed, confirmed an open modal, Escape focus return and no page errors.

The fresh follow-up disposition in `.impeccable/review/coding-practical-finish.md` is `ship` for the revised practical modal surface, original navigation/title fixes and bounded phone card-art containment fix, with no material fixes remaining. It supersedes the initial fix disposition for that scope only; it does not approve all proposed V3 units or establish learner outcomes. Existing DESIGN.md and sidecar are preserved; no global palette/type advisory is canonized to silence the detector.
