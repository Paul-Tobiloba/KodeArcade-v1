# Byte Lab block expansion verification — 18 October 2026

Scope: owner-authorized missing-block capability expansion of existing Byte Lab; ordinary Operate extension, not a new visual world. No deployment, data migration, real-child records, external script access or power action.

## Checks completed

- `npx vitest run src/studioExtensions.test.ts src/studioEngine.test.ts src/studioGames.test.ts src/studioStarters.test.ts`: 100 passed, four files. Includes all new registered palette types/code translations, 21 ordinary-block behavior bodies, grid/burst compositions, transitive Show code helpers, transient answers/actors, timing, input, bounds and preserved `sys_moving_east` personal functions.
- `npm test`: 1,758 passed, 40 files.
- `npm run build`: passed, 1,830 modules. Existing Zod PURE-annotation and >500kB bundle warnings remain; no new build failure.
- `npm run check:server`: passed. No server/schema change.
- Initial new browser suite: 12/12 passed across desktop 1440×1000, Pixel 7 and iPad Chromium. It exercises question privacy, Stop/Reset, sprite creation/dragging, held input, keyboard block construction, private source save/reload, built-in inspection and editable personal behaviors. Question form scoped axe: zero violations on desktop. Early test-only assertions were corrected for existing `Byte:` speech prefixes, vector sprites and human-readable arrow labels.
- Strict final new-browser checks: 13/15 passed initially; actual sustained mouse input exposed a stage-to-arrow focus transition clearing the key state on desktop/phone. The fix focuses the arrow before setting its state and treats stage/arrow controls as one input region while retaining release/blur/window cleanup. The physical hold/drag case then passed on all three devices (3/3), completing all 15 unique new scenarios. No browser pageerrors. Final captures wait for save acknowledgement; this is synthetic API verification, not a live-account claim.
- Existing games/editor + timed-choice regression: 40 passed, two intentional desktop-only short-screen checks skipped on phone/tablet. All racing (including >50 speed), basketball, tennis, function editing/cancellation/deletion/broadcast, library, legacy migration, backups and private save/reopen checks passed. Across this regression and the new suite there are 52 distinct passing browser scenarios and two intentional skips (the three timed-choice cases occur in both runs and are counted once).
- Final `npx tsc -b` and `git diff --check` passed after the held-input fix (Git emitted only incumbent line-ending notices). Temporary strict-run and held-input traces are retained under ignored `output/blocks-browser-2026-10-18/`, not shipped.

## Bounded visual evidence

Code-led extension; no approved comp/tournament. First and final batched inspections each opened `blocks-question-{desktop,1308,phone,tablet}.png` and `blocks-behavior-{desktop,phone,tablet}.png`. All show the named settled editor/run state, with existing stacked mobile layout and independent desktop sidebar scrolling. Initial desktop question captures caught transient save status; final confirmation waits for the account-save fixture acknowledgement, and brings the question into view on phone/short desktop without changing production layout. Captures are viewport images; mobile/tablet behavior captures intentionally scroll to the inspected definition, not full-page claims. No malformed/black assets were observed. Two main inspection rounds used; no additional polishing loop.

One detector run: `detect --json src/CreativeStudio.tsx src/StudioEditor.tsx src/StudioRuntimeOverlay.tsx src/studio.css` → `blocks-detector.json`. 36 advisory findings: 15 incumbent palette colors, 19 incumbent type sizes and two incumbent 3px radii; no primary findings. New overlay/question styles use incumbent colors and scales and introduce no new detector advisory. Do not repair global pre-existing drift in this scoped task.

Shipping provenance: `embed-prompt --scan public/images` → 62 rasters, zero missing. No shipping raster created or replaced. Native Blockly geometry and existing cutouts remain.

Incumbent global-system hashes remain:

- DESIGN.md: `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`
- .impeccable/design.json: `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`

## Evidence limits

Browser checks use synthetic assigned-course/API fixtures; no new live Neon round trip is asserted. Existing account transport is reused unchanged. No live real-child answers, production deployment, external browser/runtime compatibility or exact reference-platform parity is claimed. Four authored sprites remain; 32 actors are a transient runtime bound. Appearance tint is an approximate CSS filter; grid is a visible five-column helper, not a visual grid painter. Existing contact hats remain aggregate, guided list/object palettes remain separate. Full capability/limit inventory: `docs/BYTE_LAB_BLOCKS_2026_10_18.md`.

Fresh independent finish review: `.impeccable/review/blocks-finish.md` records full `disposition: ship` for this scoped source/capture extension, with all seven captures valid and no mandatory corrections. Main read all five sections. Fresh ordinary-extension documentation comparison is complete in `.impeccable/review/blocks-documentation.md`; main read it and rechecked both global hashes. It agrees with the product/contract/inventory, preserves incumbent authority and records pre-existing drift without repair. Review and documentation are complete; no further polish or detector run is requested.
