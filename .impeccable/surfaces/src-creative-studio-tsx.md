---
version: 1
slug: src-creative-studio-tsx
primary_target: src/CreativeStudio.tsx
related_targets: [src/StudioEditor.tsx, src/StudioArt.tsx, src/studio.css, src/studioEngine.ts, src/studioProject.ts]
---

# Byte Lab dedicated project editor

Mode: Operate. Owner rejected the lesson-shaped first implementation and supplied six Code.org Sprite Lab captures plus Scratch as reference. Confirmed scope: the full editor, multiple programmable sprites, visual costume/background libraries and basic drawing tools; preserve KodeArcade branding and saved work. No public sharing. Keep PC awake during work and hibernate only after completion and verification.

## Direction contract

THESIS: a place to make a project, not a challenge page with extra fields. The scene, draggable blocks and open scripting canvas are the work.

OWN-WORLD: incumbent KodeArcade mark, violet project toolbar, system control type, white canvas, quiet lilac panels; category colors identify block families. Reuse approved character/scenery artwork; never ship Code.org or Scratch trademarks or screenshot pixels.

STORY: name a project, choose a character/backdrop, connect code, run, select another sprite and make it react. Save ownership remains private to the learner; public previews stay separate.

FIRST VIEWPORT: compact project toolbar above Code/Costumes/Backgrounds tabs. Left stage and Run/Stop with a visual sprite strip and selected sprite properties. A visible category rail and flyout lead into the large right scripting canvas. Art tabs replace the coding area with an asset list and drawing workspace. Mobile keeps the stage and coding/art controls reachable through structural stacking.

FORM: code-led implementation of the owner-pinned Code.org/Scratch editor topology, not an open direction tournament. Supplied captures are structural references, not a pixel-identical comp or permission to replace the brand. Per-sprite selection and its real script are the signature interaction.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Gallery finish evidence: the independent source/screenshot review issued FIX for capacity/rename errors hidden behind native dialogs. The correction closes the active dialog and focuses visible recovery without modifying previous work; the reviewer scored this single finding RESOLVED and issued SHIP at that scope. Verification: 1,650 frontend, 139 synthetic backend and 58 unique scoped browser checks passed; two desktop-specific skips. Build/server checks passed. Documentation comparison and correction recheck preserved DESIGN.md/sidecar byte-for-byte. No new raster; read-only public/images scan26/zero missing. Full details: docs/BYTE_LAB_GALLERY_2026_10_17.md and .impeccable/review/gallery-finish.md / gallery-documentation.md. Broader browser regression remains paused; local codex/auth work is not committed/pushed.

## Boundaries and states

Multiple independent sprite scripts, private autosave, new/name project, sprites and backgrounds, bounded child-authored drawing, code/category switching, selection, event handlers, run/stop/reset, errors and recovery. Do not simulate working controls for unavailable sharing/history. Preserve older Byte Lab code through a one-way validated import with the original workspace retained in the saved project. Guided curriculum tasks and their grading remain untouched.

## Finish evidence

Independent review initially requested numeric-entry drafts and clean atlas isolation. Both were fixed and scored resolved; final disposition ship covers those corrections. Scoped verification is recorded in ../review/studio-verification.md. The documenter compared the completed extension to the incumbent authority, preserved DESIGN.md and its sidecar, and recorded scoped departures/pre-existing drift in ../review/studio-documentation.md. No new raster was generated; provenance scan39/zero missing.

## First-use refinement — 17 October 2026

Owner approved starters and a replayable first-use tour before a later project gallery. Three ordinary editable projects (two-sprite story, key-controlled character, border-bouncing animation) replace only an explicitly chosen draft. Fresh untouched work sees the choice; returning nonblank work opens directly. Optional tour metadata saves inside the project; Skip and Help replay remain available. Target-adjacent full-content callouts reuse WorkspaceTour. On stacked screens the first-use choice comes before the unused empty stage. Existing art and global visual authority are preserved. Replacement confirms and requests a backup, and native Blockly reloads even with a reused sprite ID. Reduced motion does not shorten speech/wait semantics. Scope and verification: ../../docs/BYTE_LAB_ONBOARDING_2026_10_17.md. Gallery remains deferred. The earlier power-management instruction above described the prior completed rebuild, not this refinement.

## Private gallery extension — 17 October 2026

Mode: Operate. Owner approved multiple private projects, thumbnails/edited dates, create/open/rename/duplicate and recoverable deletion; no sharing. This is a precisely scoped extension of the existing code-led Byte Lab, not a new visual identity or open composition exercise.

THESIS: preserve a child's creations while making another one; refuse the single replaceable draft slot.

OWN-WORLD: retain the violet KodeArcade toolbar, Fredoka project titles, system controls, pale lilac ground and approved sprites/scenery. Thumbnails render the real authored stage and private artwork.

STORY: My projects opens from the editor; select a stage thumbnail, edit, return, create or duplicate without losing another creation. Recently deleted restores mistakes.

FIRST VIEWPORT: compact incumbent toolbar, Course navigation, My projects heading and primary New project action; compact gallery/Recently deleted/import/backup row; a three-column thumbnail collection, two on tablet and one on phone. Empty and error states have concrete recovery actions.

FORM: local gallery state inside the approved editor world, no seed required for this pinned narrow extension. Existing course-scoped private progress, revision conflicts and offline recovery carry the versioned gallery; twenty slots including trash and a bounded storage budget are disclosed. No database or auth redesign.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Private image import and expanded libraries — 17 October 2026

Mode: Operate. Narrow owner-requested extension: import background images; aerial 2D football/basketball and other sports backgrounds; boy/girl, more animals, balls and a car. The current request to keep the PC on applies during this work; it does not request hibernation afterwards.

THESIS: children choose a scene and cast inside the existing editor, without losing private work or going through an external asset service.

OWN-WORLD: preserve violet/lilac controls and real image thumbnails. Extend the warm cartoon mascot world with transparent single-pose cutouts; exact flat sports-court geometry is native SVG, not a simulated raster illustration.

STORY: Backgrounds → Import image decodes and resizes local pixels, then autosaves a private still-image copy with the project. Choose background and Choose sprite expose the expanded visual libraries. Saved artwork travels through project/gallery backups and remains out of teacher reports.

FIRST VIEWPORT: unchanged editor topology. The Backgrounds asset rail adds Import image and concise format/privacy help above Paint new; the existing four-column chooser uses real previews, two columns on phone. Imported artwork appears on the stage, asset preview and gallery thumbnail.

FORM: code-led extension of the pinned editor, no seed or composition tournament. Existing guided mascots and backgrounds remain separate. Native-alpha rasters and exact prompts carry provenance. Validate before mutation; failed imports leave the project unchanged and errors receive focus after rendering.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Finish evidence: `.impeccable/review/assets-finish.md` records F1 (rejected library selections hiding errors behind the modal), the correction and RESOLVED/SHIP verdict at that correction scope. The documenter comparison and correction recheck preserve global DESIGN.md/sidecar byte-for-byte. Verification: 1,665 frontend, 140 synthetic backend and 76 unique scoped browser checks passed; two intentional desktop-only skips. Build/server checks passed, one detector had no primary findings, final public/images scan34/zero missing. Smaller person-sprite visual fill remains advisory. Implementation/limits/prompts: docs/BYTE_LAB_ASSETS_2026_10_17.md. Full platform regression remains paused; local codex/auth work is uncommitted/unpushed. Latest keep-awake request uses the temporary six-hour guard; no hibernation is scheduled.

## Family and story-making library — 17 October 2026

Mode: Operate. Owner asked for adults, Grandma, Grandpa, house, an actual city, country home and more fun materials for children. This precisely scoped library extension inherits the existing editor and private-save boundaries, not a new visual world.

THESIS: enough cast, scenery and objects to tell a child's own story, with simple ways to find them instead of an undifferentiated long list.

OWN-WORLD: retain violet/lilac controls and the warm outlined cartoon world. Native-alpha full-body adult/family sprites and readable objects join real illustrated scenes; earlier artwork/references are not replaced.

STORY: Choose sprite/Choose costume → People, Animals or Things, or search a familiar word; choose a scene through Places, Nature, Sports or Fantasy. Selection changes only project artwork, not code or other projects.

FIRST VIEWPORT: the existing labelled chooser gains a sticky close/title/search/category area above the four-column image library (two on phone), a live result count and a recoverable empty search state. All earlier controls remain in the editor's established positions. Twenty new assets extend the total to 27 sprites/props and 17 backgrounds.

FORM: code-led narrow expansion, no composition tournament or identity change. Every asset uses the existing validated library refs and private persistence. Search/category state is transient, resets on reopen, and never alters a saved project. Real rasters carry exact prompts; global design authority is preserved.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Finish evidence: `.impeccable/review/story-finish.md` records SHIP at this extension's scope with no mandatory corrections; full-body people thumbnail optical fill remains advisory. Main inspected fifteen current desktop/phone/tablet captures and three artwork QA sheets in one batch. Verification: 1,689 frontend, 141 synthetic backend and forty scoped browser checks passed, with two intentional desktop-only skips; production build/server TypeScript passed. Backend passed on a full rerun with a 30-second setup allowance after concurrent database-setup hook timeouts, without assertion/config/source changes. One detector returned zero primary findings/32 incumbent advisories; shipping raster scan54/zero missing. Independent documentation comparison preserves global DESIGN.md/sidecar. Implementation, exact prompts and release boundaries: docs/BYTE_LAB_STORY_LIBRARY_2026_10_17.md. Full platform regression remains paused; local codex/auth work is uncommitted/unpushed. The temporary six-hour keep-awake guard remains active; no hibernation is scheduled.
