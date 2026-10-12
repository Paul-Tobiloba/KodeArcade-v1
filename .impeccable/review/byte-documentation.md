# Ask Byte documentation — 2026-10-12

## Outcome and authority

Documented as an ordinary scoped Operate extension of KodeArcade's incumbent **Build & Play** world. The finish review's disposition is **ship** for the supplied UI and trust-copy scope. No replacement world, system-wide token, new component primitive or new shipping raster is introduced by this documentation pass.

`DESIGN.md` remains the normative visual authority; `.impeccable/design.json` remains its existing extension layer. Both files are preserved unchanged. The Byte-specific patterns below stay local to this review and `.impeccable/surfaces/byte-help.md`; they are not promoted into global design rules. The document reference's full spec-generation workflow was narrowed to this comparison/report by the explicit write boundary and preserved-authority instruction.

## Evidence checked

Read `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, the Byte surface contract and the Impeccable document reference. Inspected `src/ByteHelp.tsx`, `src/ByteLab.tsx`, `src/byte.css`, `src/ActivityGuide.tsx`, `src/byteProgramHelp.ts`, the integration sites in `App.tsx`, `DrawingLab.tsx` and `AccountWorkspace.tsx`, and the inherited account CSS. Read the fresh finish review and verification packet.

Opened all seven final captures: `byte-help-desktop.png`, `byte-help-phone.png`, `byte-help-tablet.png`, `byte-lab-off-desktop.png`, `byte-lab-off-phone.png`, `byte-lab-off-tablet.png` and `byte-lab-result-desktop.png`. They show the named states with visible document tops and unobscured content. The phone/tablet full-page images preserve readable help, hints, stage and editor in the stacked page. The result capture is supplied synthetic response evidence, not a live model evaluation. These PNGs are review evidence, not shipping artwork.

The supplied verification packet reports 1,023 frontend tests, 126 backend tests, server typecheck, three gateway tests, nine help/lab browser checks and three drawing browser checks passed. The drawing checks completed after the finish-review handoff; the earlier review's pending-drawing caveat is superseded by that packet. Scoped learner-disclosure axe checks report no violations on the three device projects. The build and whitespace check passed. These checks were read, not rerun by the documenter.

## Local patterns and incumbent fit

| Local pattern | Observed behavior | Relationship to authority |
| --- | --- | --- |
| Placement and disclosure | Native `details`/`summary` labelled Ask Byte sits after Your activity and before progressive hints. The existing Byte sprite and subtitle identify its role. | Extends the incumbent guide without changing toolbar, stage/editor arrangement or Play placement. |
| Reading and controls | Fredoka labels the help heading at 1rem; controls and prose use system type at .875rem. Three vertically stacked actions have 44px minimum height and 8px corners. | Reuses the established display/reading roles, touch sizing and gently rounded controls. |
| Material and state | Border-led white controls use violet selection/hover, with a pale lavender answer at the existing panel radius. Selected action also exposes `aria-pressed`. | Fits the learning palette and flat workspace material without creating a new accent or ornamental layer. |
| Answer and focus | One answer replaces the previous answer. The action controls reference its ID; the answer is a polite atomic status and receives programmatic focus without forced scrolling. Listen to Byte reuses ReadAloud. | Keeps help in the learner's task flow and retains opt-in narration. The scoped visible focus rule is a 3px learning-violet outline with 3px offset. |
| Reflow | Answer text wraps anywhere and has no independent scrolling container. The outer guide remains persistent on wide desktop and starts folded on compact/stacked screens. Expanded narrow captures show actions, answer, Listen and hints reachable in page flow. | Preserves the existing guide's whole-content scrolling and responsive shell; no Byte breakpoint is added. |
| Motion | Only the disclosure chevron has a short transition; system reduced motion removes it. | Consistent with the incumbent restrained utility motion. |

Learner help is authored and local. Topic explanation, current-task explanation and structural program checking are explicit actions, not a free-text conversation. The structural checker identifies empty/unconnected/floating blocks, empty or missing required loops, over-budget block drafts and bounded text syntax reminders. It does not execute code or prove success. Movement passes the last-run outcome; drawing passes its draft structure and limits without a last-run outcome. Answers encourage prediction, comparison and another test without supplying a route solution.

The help actions do not call hint callbacks or change hint/star accounting. Existing hint requests still expand the guide and focus the hint heading; protected best-star copy remains separate. Learner copy states that this is lesson help and that no messages or code are sent to a model. Answer state is transient component state, with no chat-history persistence added.

## Adult lab disclosure and states

`AccountWorkspace` exposes the private lab through account settings and describes its default-off, explicit adult-tester approval boundary. `ByteLab` inherits the existing account shell and provides a return link. Its source includes access checking, access failure with retry, switched-off/not-a-tester status, allowed form, busy state with cancellation, request failure, withheld/redirected response and answer states. Disabled access has no question form.

The allowed form has visible topic/question labels and bounded question length. Its notice names experimental errors, excludes private information and explains gateway transfer and KodeArcade's history behavior. Results are headed Experimental AI response or Question redirected or response withheld, with a visible accuracy/suitability/filter-limit reminder. These are UI/trust-copy observations; this report does not establish server authorization, model safety, curriculum validity, live Qwen latency/concurrency, n8n impact or production readiness.

## Existing drift kept separate

The adult account shell already uses Baloo Bhai 2 headings and some Arial display rules rather than the global Fredoka/system pairing. Its navigation wraps into a substantial top region on phone/tablet captures. ByteLab inherits those existing choices; they are outside this help extension and were neither repaired nor adopted as new global guidance.

The context loader also reports that `DESIGN.md` is newer than the sidecar and that no `buildPath` is recorded. Both are inherited context findings. A separately authorized sidecar-only document refresh could reconcile the first while preserving `DESIGN.md`; a future visual-direction task can settle the second. Neither finding expands this report's scope.

## Preservation record

Only this documentation artifact was written. No implementation, surface brief, product context, global spec, sidecar or artwork was edited. Authority SHA-256 values checked for this pass:

- `DESIGN.md`: `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`
- `.impeccable/design.json`: `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`

The scoped ship verdict is retained with the review's evidence limits. Screen-reader behavior, zoom and real model behavior were not independently exercised by this documentation pass; no whole-platform accessibility or security certification is implied.
