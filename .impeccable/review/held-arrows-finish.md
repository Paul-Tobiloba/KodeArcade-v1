# Held arrows — fresh finish review, 19 October 2026

Disposition: **SHIP**, scoped to the shared Byte Lab held-arrow correction. No material source or visual finding in this review. The user's basketball failure supersedes the earlier game review; this verdict evaluates the new input path independently.

## Persistence

The surface contract is persisted in `.impeccable/surfaces/byte-lab-held-arrows.md` as Operate work: repeat ordinary arrow-key events across projects while retaining authored movement. `PRODUCT.md` and `docs/BYTE_LAB_HELD_ARROWS_2026_10_19.md` describe the cadence, release semantics, compatibility and local-only verification boundary accurately. No save schema, authored-project migration, art or token change is required. Independently checked DESIGN.md SHA256 `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE` and sidecar SHA256 `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D` agree with the preserved global system.

## Fidelity

Inspected `studioEngine.ts` setKey/poll/step/active, `CreativeStudio.tsx` input and scheduling, `StudioKeyControls.tsx`, the control CSS, the runtime tests and the browser tests. Initial press dispatches the existing key hat; arrows request repeats after 180 ms and every 80 ms thereafter. Existing active-script deduplication prevents overlapping response copies, and missed intervals skip forward. Held events keep otherwise idle execution active, and a new press wakes an existing wait promptly. Movement remains visible in project blocks. Release clears future repeats, while a previously authored multi-step response can finish.

Native buttons retain accessible names and decorative Lucide icons. Pointer capture covers release outside; cancel/lost capture/blur release the button. Stage focus loss clears engine input; button pointer-down focuses before starting its new press, avoiding a focus-transfer clear of that new input. Window blur, visibility change, Stop and Reset clear engine input. Enter/Space button holds and assistive click retain separate activation paths; repeated physical keydown does not add another cadence.

Opened all four final full-page captures with view_image: `held-arrows-desktop.png`, `held-arrows-1308.png`, `held-arrows-phone.png`, and `held-arrows-tablet.png`. Each shows loaded basketball artwork, the same four reachable arrows and settled “Saved to your account” status. The wide editor, scrollable block canvas, phone stack and tablet arrangement retain the incumbent composition. The large authored script continuing outside the visible Blockly canvas is intentional scrolling, not a new page-layout defect.

## Ceiling/evidence limits

This reviewer independently inspected source, test intent, documentation, hashes and the supplied final images; no additional browser session, capture, detector invocation, deployment or account journey was performed. The initial batch plus settled-save confirmation exhaust the planned visual ceiling. The captures establish static presentation, not held-input behavior or real account persistence; the browser harness mocks the student API.

Supplied execution evidence: 1,783 frontend tests across 42 files; 15 focused held-key tests; server typecheck; nine initial held-control browser cases across desktop/phone/tablet; and 13 existing desktop game/extension cases passed. The broader 51-case run was intentionally interrupted after those 13 existing cases plus two held-input cases; it is not a 51-case pass. The final focused run passed all 12 cases across desktop/phone/tablet in 57.1 seconds. Its preceding attempt passed ten and failed two basketball Enter-hold assertions that expected movement beyond the authored boundary; the assertion was changed to hold left away from the boundary, without a production-code change. The final production build passed with 1,833 modules in 13.13 seconds and the incumbent Zod annotation/large-chunk warnings. No production code or artwork changed after the reviewed captures. These execution results were supplied by the implementation owner, not rerun by this reviewer; their canonical record is `held-arrows-verification.md`.

The supplied single scoped detector reports 36 incumbent CSS advisories, zero primary findings and no new control findings. The supplied asset scan reports 62 rasters with zero missing provenance. Neither result certifies the whole interface, all browsers, every user-authored program or accessibility conformance. Existing execution budgets and authored script durations still govern response speed.

## Material fixes

None requested. The implementation addresses the shared input cause without adding game-specific movement or changing project source. No new visual defect warrants another inspection round. No production-code change was made by this reviewer.

## Keep

Keep the four native buttons and their responsive placement; shared bounded input repetition; held-key reporters and inspectable behaviors; ordinary editable key hats; immediate single-tap activation; single-shot stage Space; cancellation/focus lifecycle; timer and task budgets; and the documented distinction between releasing input and finishing an already-running script. Retain the global design, authored saves and current artwork.
