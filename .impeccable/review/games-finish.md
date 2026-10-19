# Byte Lab games/functions finish review — 18 October 2026

## 1. Disposition

**fix** — one material gap remains in the personal-function authoring workflow. The captured extension otherwise carries the confirmed request within the established KodeArcade editor. This is a full review of the bounded games/functions extension, not platform certification. No rebuild or recapture is required for the supplied evidence.

## 2. Scope and evidence

Independent review used `PRODUCT.md`, the `.impeccable/surfaces/byte-lab-games.md` contract, incumbent `DESIGN.md`, the Impeccable skill, craft floor and new-work finish contract. This is a precisely specified, code-led extension in an existing Operate surface; a new identity, concept tournament, approved comp or QUALITY BAR card does not apply. No context or detector was rerun, and no agent definition was read.

I opened every current required capture, individually, under `.impeccable/review/`:

| State | Desktop | Phone | Tablet |
| --- | --- | --- | --- |
| Racing and code | `games-racing-code-desktop.png` | `games-racing-code-phone.png` | `games-racing-code-tablet.png` |
| Basketball | `games-basketball-desktop.png` | `games-basketball-phone.png` | `games-basketball-tablet.png` |
| Personal function | `games-function-edit-desktop.png` | `games-function-edit-phone.png` | `games-function-edit-tablet.png` |
| System function | `games-system-function-desktop.png` | `games-system-function-phone.png` | `games-system-function-tablet.png` |
| Starter choices | `games-starters-desktop.png` | `games-starters-phone.png` | `games-starters-tablet.png` |

These are valid viewport captures of their named states. Relevant mobile/tablet panels are intentionally scrolled into view; the starter dialog and native Blockly/code regions intentionally scroll. The captures contain loaded content and settled save acknowledgements, without blank/black regions or a mismatched state. Device-pixel density does not make them oversized CSS layouts. I also opened both `output/byte-lab-games/contact-sheet-light.png` and `contact-sheet-dark.png`.

Source inspection covered `studioGameStarters.ts`, `studioStarters.ts`, `studioBlocks.ts`, `studioEngine.ts`, `studioFunctions.ts`, `studioCode.ts`, `StudioEditor.tsx`, `StudioFunctionEditor.tsx`, `CreativeStudio.tsx`, `studio.css` and `studioProject.ts`, with relevant browser/unit test definitions. The preservation hashes independently match the supplied values: DESIGN `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`; sidecar `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`.

Test/build/provenance results are supplied evidence from `docs/BYTE_LAB_GAMES_2026_10_18.md` and `.impeccable/review/games-verification.md`, not tests I reran: 1,707 frontend tests, 142 synthetic backend tests, seventy unique scoped browser checks with two intentional desktop-only skips, latest fifteen game/function cases passing, targeted Axe checks, production build/server compiler, and sixty shipping rasters with zero missing provenance. The latest fifteen are a subset of seventy. I inspected the saved detector artifact; its zero primary findings and 36 tonal/type/radius advisories are not an independent detector run.

## 3. Findings

### Material F1 — P2: Broadcast cannot be authored in personal functions

`src/StudioFunctionEditor.tsx:60` removes the entire Events category from the function category selector. `src/studioBlocks.ts:64` places the ordinary `ka_studio_broadcast` statement exclusively in that category. The flyout and keyboard builder both derive their available block types from the selected category, so neither gives a child a way to add broadcast to a new personal function or replace the last broadcast removed from an existing function.

This affects the extension's central story/function task, rather than optional decoration: both Garden greetings and Rocket rescue demonstrate a personal function whose body broadcasts the next part of the story. Their supplied broadcasts can be inspected and edited, but their behavior cannot be reconstructed through the function editor's ordinary authoring controls. Filtering event hats is appropriate; filtering the usable statement along with them leaves the requested generic building block unavailable at the point it is taught.

### Confirmed strengths and nonblocking observations

- Racing has a legible three-lane road and three visually distinct, nose-up overhead cars. Both player artwork choices and the hoop retain clean silhouettes, transparent gaps and opaque white details on light/dark sheets.
- Basketball's top hoop, bottom player, ball and left/right instructions are clear. Source encodes falling movement, player bounce, hoop scoring/reset and miss/stop using ordinary variables, sensing, arithmetic and conditional blocks. Racing rules and both story message flows likewise remain serialized editable blocks; the engine has no game-specific hidden mode.
- Desktop preserves stage/controls on the left and the native Blockly workspace on the right. Phone function editing uses a horizontal palette and a usable full-width definition area; tablet keeps the same hierarchy. New function/code controls have explicit labels and 44px sizing in CSS. The captured body, input and save/cancel controls remain legible without overlap.
- Personal editing and built-in inspection are visually distinct. System helpers use the same literal block definitions for display and normal interpreter execution, are injected read-only, and omit Save/Delete. Personal names cannot override them. Show code sits beneath the canvas, leads with the selected program and labels the supplied runtime APIs and learning-only translation honestly.
- The starter chooser uses real scene/cast previews, short actions and clear preservation copy. Native scrolling is appropriate for eight choices. No global identity replacement is warranted.
- Detector tonal/type/radius departures are advisory reuse of the incumbent compact editor vocabulary. They do not justify rewriting the global design authority. Small repeated explanatory comments in Show code and the incumbent mobile header density are also nonblocking at this extension's scope; they are not a new polish list.

## 4. Directions and fixes

Resolve F1 in one focused batch: expose Events in the personal-function category selector when it contains usable statement blocks, while continuing to filter `ka_event_*` hats from the function palette and keyboard builder. This should make broadcast available through both authoring paths without allowing nested event roots.

Verify one representative new personal function can receive an authored broadcast, save, reopen and trigger the matching receive script. Include the phone authoring path, where the horizontal palette must retain its width. Recapture the same review viewports after the batch and return the result to this reviewer for a verdict pass scoring F1. No additional builder-led defect hunt, new detector run, source-wide redesign or global design refresh is requested.

## 5. Residual QA and release boundary

The reported browser API fixtures and separate synthetic PGlite HTTP/database checks exercise complementary boundaries; they do not establish live-pupil behavior or a complete platform regression. The broader platform browser regression remains user-paused. Targeted Axe results do not constitute complete assistive-technology certification. Existing nonfatal bundle-size/Zod warnings remain outside this finding.

Frontend/backend need to release together for shared artwork/starter allowlists; no database migration is reported. Preserve the existing private project/gallery save separation and runtime bounds: four sprites, 64 non-start blocks per sprite, eight numeric variables, four personal definitions, three nested calls without recursion, 32 tasks and 10,000 scheduler steps. Runtime game scores remain outside achievements and teacher reports. Local `codex/auth` work is uncommitted and unpushed; this review authorizes no deployment, commit or push. Only this review file was written.

## Verdict pass — F1 correction

**Disposition: ship. F1: resolved.** This supersedes the initial `fix` disposition for the listed finding only; it is a verdict pass, not a new full-surface review or platform certification.

Independent source inspection confirms `StudioFunctionEditor.tsx:60` now includes any category containing a non-event-hat block. Events therefore becomes selectable because it contains `ka_studio_broadcast`. The existing `ka_event_*` filters remain in workspace initialization, category changes and keyboard block types, so broadcast is available through both authoring paths while event hats remain excluded.

I read the new browser test, which removes the supplied personal definition, creates `celebrate` through the visible function controls, selects Events, asserts a single palette block and keyboard option, adds broadcast to the definition body, sets `garden_time`, saves, reopens and verifies it, then runs the click caller and checks the receiving sprites' speech. Its desktop/phone/tablet passes, the resulting eighteen game-file passes, production build pass, updated seventy-three unique scoped browser passes with two existing skips, and unchanged sixty-raster/zero-missing provenance result are supplied execution evidence; I did not rerun them. The eighteen overlap the former fifteen and are not eighteen additional unique checks.

I opened the refreshed personal-function captures for desktop, phone and tablet. They retain the prior valid composition, including the full-width phone definition area; Motion remains selected as in the original evidence. Those screenshots establish retained layout, while source and the new executed authoring test establish the corrected Events path. The builder reports recapturing and validating all fifteen original viewport paths. No new defect hunt or detector run was performed.

No further correction is owed for F1. The original residual QA and release boundaries still apply, including the user-paused broader platform regression, synthetic verification boundary and coupled frontend/backend release. Proceed to the documentation handoff.
