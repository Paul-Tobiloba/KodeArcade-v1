# Challenge reward stars

Mode: Operate. Narrow refinement of the existing success dialog, approved 12 October 2026.

## Direction contract

THESIS: Make earning stars feel rewarding without delaying the next challenge or changing scoring.

OWN-WORLD: Keep the white success dialog, Fredoka heading, violet action and existing copy. Replace plain star icons with an approved shiny 2D golden raster sprite, not a new illustration system.

STORY: Finish a challenge, see earned stars light up in sequence, then continue immediately. Unearned stars remain clearly subdued. Preserve the 1–5 score, retry/hint rules and saved best scores.

FIRST VIEWPORT: Five upright stars form the approved gentle arch; centre is largest, positions two/four medium, ends small. Ratio .58/.8/1/.8/.58. Centre sits highest; paired neighbours and ends step down symmetrically. The group fits the dialog on phone, tablet and desktop. No rotated stars or extra decorative stars.

FORM: Precisely user-specified local asset/layout refinement, implemented in the incumbent dialog. The approved reference is the right-hand option in C:/Users/USER/.codex/generated_images/01a100b3-40c1-7263-b63a-2bf67ab4d1cb/exec-0a839fe6-d368-47fb-972e-ad538c9d9b1f.png; it is a star arrangement reference, not a full-page comp. One earned-star pop and brief masked shine per reveal; bounded CSS effects with no dependency, looping shimmer or new audio. Reduced motion shows the final reward immediately without movement or shine. Close and Next remain available throughout.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation record

Scoped finish review: ship. Documentation: `.impeccable/review/reward-stars-documentation.md`. All six settled dialog crops were inspected. Existing DESIGN.md and `.impeccable/design.json` are preserved; this contract records the permitted local asset/layout expansion without global drift repair. The built-in image tool generated the sprite at C:/Users/USER/.codex/generated_images/01a100b3-40c1-7263-b63a-2bf67ab4d1cb/exec-9dc01a4b-54de-4f30-8db4-6d96bc1c6f6a.png. Its shipping copy is `public/images/rewards/golden-star.png`, with the exact prompt embedded and retained in `.impeccable/assets/reward-star-prompt.txt`.

## Approved motion amendment — 21 October 2026

The owner requested a video-style sequential star arrival for the typing release and shared coding success dialog. This amendment supersedes the 12 October upright-only/no-extra-stars constraint and its earlier local proportions, while preserving that record as history. The existing approved golden raster remains the material; no video pixels or new reward sprite are used. `src/RewardStars.tsx` and `src/reward-stars.css` now supply the shared celebration.

Five positions form an arc with grid proportions `.83fr .95fr 1fr .95fr .83fr`, a maximum width of 520px, and paired settled rotations of −12°/−6°/0°/6°/12°. Earned images arrive from above with rotation and an oversized start, overshoot and settle over 720ms; each receives one brief masked shine and a bounded burst of seven small gold SVG stars. Reveal remains sequential, with a 330ms interval for typing; the existing coding dialog retains its bounded reveal cadence. No loop, forced wait or new audio is added. Unearned positions remain distinguishable.

Saved/system reduced motion shows the final earned reward immediately and removes arrivals, shine and sparks. Continue, Close and Next remain available during celebration. The accessible group announces the earned count once. This visual amendment changes neither typing's protected best-star merge nor coding's existing retry/hint grading and saved achievements.

Fresh finish review: `ship`, with no material fixes in `.impeccable/review/typing-finish.md`. Current documentation: `.impeccable/review/typing-documentation.md`. Twelve separate reward browser checks passed across desktop, phone and tablet; shared coding reward captures were inspected alongside typing's result/motion captures. Global DESIGN.md and sidecar were preserved by this documentation pass. The owner's requested retry-friendly coding grading and curriculum enhancement remain the next planned topic.

## Coding/drawing grading amendment — 21 October 2026

The owner has now approved and implemented that next phase. This amendment supersedes the earlier preserved retry/hint grading and next-topic statements for coding/drawing practice; the approved shared star artwork, sequential arrival/rotation, reduced-motion behavior and typing grading remain as recorded above.

Every new successful coding or drawing practice completion earns five stars regardless of attempts, hints, guided examples or extra time. Existing saved stars remain until another successful completion can improve that activity to five. Protected best-per-activity totals prevent duplicate points, and failed/stopped runs do not grant completion. Versioned practice metadata records completion/support history, not independent mastery. The two Grade 2/4 practical pilots award one five-star completion for all five practice stages; a separate check/status records bounded app-checked mastery, and a later supported or unsuccessful check never erases prior evidence. At the owner's follow-up request, both practical successes use a native modal popup with Close/Keep exploring, Escape dismissal and focus return; practice retains this shared star animation while mastery uses the separate check/status. No reward is added for playing a personal Byte Lab/App Lab project.

Scope and evidence: `docs/CODING_CURRICULUM_PHASE_ONE_2026_10_21.md`, `.impeccable/review/coding-practical-verification.md` and `.impeccable/review/coding-practical-finish.md`. The first-phase finish disposition is recorded in those current records; this amendment does not extend the earlier typing verdict to the new work. Global DESIGN.md and `.impeccable/design.json` remain preserved.
