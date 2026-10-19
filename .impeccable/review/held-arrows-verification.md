# Held-arrow verification — 19 October 2026

Contract: `.impeccable/surfaces/byte-lab-held-arrows.md`. User's basketball hold failure supersedes earlier game-review approval. This is a fresh shared input correction, not a new visual world or a template/source migration.

## Execution

- Initial focused engine/extensions/games/starters/tutorials suite: 110 passed (five files); TypeScript passed.
- New shared-input runtime suite: 15 passed, including all directions, release, clear/stop/dispose, active-script deduplication, missed-interval skip, single-shot Space, and unchanged saved basketball/tennis/racing/catch/keyboard projects. First test-authoring run corrected timing assertions for authored 180 ms movement actions and selected the player rather than the ball; no production change was needed for those test errors.
- Full frontend suite: 1,783 passed, 42 files.
- Production build: passed, 1,833 modules; incumbent Zod annotation and large-chunk warnings. Server typecheck passed.
- First held-control browser batch: nine passed across desktop, phone and tablet. Actual pointer holding/release outside, tap, Enter hold, physical arrow holds in all directions, focus release, real Chromium touch cancellation, Stop, Run and Reset.
- All 13 existing desktop game/extension browser cases passed, including original held-key behavior, timer responsiveness, saved racing/tennis, speed escalation, functions and private gallery. The broad 51-case run was intentionally interrupted after those 13 plus two repeated held cases; it is not claimed as a full 51-case pass. Responsive verification is concentrated in the new held-control cases instead of repeating unrelated editor flows.
- Final focused 12-case all-device batch initially had ten passes and two basketball assertion failures: parallel load let the first hold reach the authored right boundary, and a later assertion requested more right movement beyond that boundary. The Enter-hold check now moves left away from the boundary; no production change was required. Final rerun: 12/12 passed across desktop, phone and tablet (57.1 seconds). Includes pointer hold/outside release, tap, Enter/Space hold, assistive click, all physical arrows, focus transfer, touch cancellation, Stop/Run/Reset and reload. The stage clears input whenever focus leaves it; arrow-button pointer handling focuses before beginning its own press, so this safely clears old physical input before a new button press.
- Final production build after the focus-loss correction passed again (1,833 modules); TypeScript and diff checks passed, with only incumbent CRLF notices. No execution gate remains pending.

## Interface and evidence

The native four-button group and responsive composition remain unchanged. React checks: input-transient state uses refs, ArrowButton is defined at module scope, global listeners have cleanup, existing timer/disposal generation guards are retained, native buttons have explicit type/accessible names and decorative SVGs are hidden from accessibility APIs. No data fetching, layout, token or asset changes.

First main capture inspection opened desktop/phone/tablet full-page files. All show the intended basketball stage, real art and four arrow buttons; captures were too early in the incumbent save lifecycle and showed pending-save notices. The harness now waits for “Saved to your account” before the one final confirmation capture batch; this is an evidence correction, not a new saving/UI change. Main opened all four final settled full-page captures: `held-arrows-desktop.png`, `held-arrows-1308.png`, `held-arrows-phone.png`, `held-arrows-tablet.png`. Artwork/save state and the unchanged control group are valid at every size. Normal test runs leave those evidence files intact; intentional capture uses `HELD_ARROWS_CAPTURE=1`. Two inspection rounds are complete, with no further polish loop.

Single scoped detector/provenance result: `held-arrows-detector.md`. No new raster. Global DESIGN.md SHA256 remains `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`; sidecar remains `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`.

Fresh independent full finish review is complete: `held-arrows-finish.md` records scoped SHIP, all four final captures valid and no material fixes. Main read all five sections. The fresh ordinary-extension documentation comparison is complete in `held-arrows-documentation.md`: scoped implementation/docs align, no new tokens/global refresh needed, and pre-existing global coverage gaps are reported without repair. Main read the full report and rechecked both preserved global hashes. Review and documentation gates are closed. No deployment, power action, save rewriting or live child data was involved.
