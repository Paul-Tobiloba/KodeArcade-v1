# Dedicated Byte Lab documentation comparison — 16 October 2026

Disposition: ordinary extension of the incumbent **Build & Play** identity. This is a source/documentation comparison, not an independent finish verdict or a platform, curriculum, privacy or accessibility certification. Subsequent handoff update: the independent verdict in `studio-finish.md` is ship for both scored corrections.

## Authority and scope

Read the shipped Impeccable `reference/document.md` in full and compared `DESIGN.md`, `.impeccable/design.json`, the dedicated surface contract, the current creative-project section of `PRODUCT.md`, the dedicated-editor section of `docs/BYTE_CREATIVE_LAB_2026_10_16.md`, and the finished studio source. No global design authority was regenerated, refreshed or merged. The owner approved the Code.org/Scratch editor topology within KodeArcade; the supplied references authorize arrangement and interactions, with KodeArcade artwork and identity retained.

Source inspected: `src/CreativeStudio.tsx`, `src/StudioEditor.tsx`, `src/StudioArt.tsx`, `src/studio.css`, `src/studioBlocks.ts`, `src/studioProject.ts`, `src/studioEngine.ts`, and the free-build dispatch in `src/App.tsx`. This pass did not run a browser, server, detector, raster scan or test suite.

The surface is Operate: project creation and editing. The direction contract owns its stage-left, category/flyout and large scripting-canvas composition. Its scope does not make that composition a global lesson-layout rule. `src/App.tsx:281` selects `CreativeStudio` only for `freeBuild`; assessed creative tasks continue through the existing activity-guide/lesson shell.

## Preserved visual system

| Incumbent authority | Finished-source evidence | Comparison |
| --- | --- | --- |
| Approved three-piece K, Fredoka wordmark, system reading/control type | `CreativeStudio.tsx` uses `/brand/mark-color.svg`; `studio.css:12` uses Fredoka for the brand and system type at `:1`, `:3`, `:44`; library dialog headings use Fredoka | The existing identity remains. No reference-site logo, mark or screenshot pixels appear in the inspected implementation. |
| Deep purple navigation, violet actions, white workspaces, lavender supporting surfaces | `studio.css:11` uses `#241259`; Run and selected tabs use `#6237df`; shell/scene use `#f7f4fe`, code is white; supporting text `#575472`, borders `#c6b6e8`/`#ded9ed` | Values reuse incumbent learning palette roles, though most are scoped literal values rather than shared custom-property references. |
| Native Blockly connected geometry and functional category fills | `StudioEditor.tsx` injects native Blockly with `geras` and the incumbent theme; `studioBlocks.ts` uses ochre events, teal motion/operators/sensing, violet looks/world/functions, amber control and berry variables | New event hats remain actual Blockly blocks. Family colors agree with the incumbent functional palette. |
| Border-led workspaces; shared dialog depth and rounded shape | `studio.css:100` uses a 16px dialog radius and `0 20px 80px #11182740`; rail/panels use lines and tonal fills | Dialog treatment matches incumbent authority; the working canvas stays quiet. |
| Visible focus, larger text and reduced-motion support | Studio CSS supplies 3px focus, yellow toolbar focus, 17px larger-text setting and saved/system reduced-motion rules; the editor receives existing profile preferences | The established accommodation mechanisms are present in source. This is not a claim of complete keyboard/screen-reader editing or conformance. |
| Approved character/scenery assets and transparent six-slot atlas | Seven library characters and four background references are selected through `spriteModel`/`studioProject`; sprite previews use 300%/200% atlas indexing | Reuses incumbent artwork. The final correction applies the same 4% horizontal frame inset to CSS previews and editable-copy canvas sampling. |

## Dedicated surface truth

The current product/documentation top sections accurately describe the dedicated implementation. It has a project title and autosave feedback, New/Open/Download, Code/Costumes/Backgrounds tabs, stage and Run/Stop/Reset, sprite selection/properties, category rail, native draggable flyout and open code canvas. Selection opens that sprite's independent code. The project schema permits one to four sprites; the engine constructs a separate workspace/context for each and schedules their actions cooperatively.

Run, click, arrow/space key, edge and other-sprite-touch responses are implemented. The dedicated repeat block is explicitly bounded at 1–100; legacy repeat blocks receive those constraints only through studio configuration. This does not revise the guided task's loop bounds. Per-sprite variables, expressions, functions, bounded forever and numeric/Boolean output are runtime behavior, not display-only controls.

Costume/background tabs show a visual asset list and either a library preview or basic painting. Pencil, eraser, line, rectangle, ellipse, fill, color, width, undo/redo and keyboard coordinate shape entry exist. Edit a copy stores an approved asset reference plus private drawing strokes; it does not rewrite the source raster. The library is bounded and does not accept arbitrary external image uploads.

Validated version-1 project data is wrapped in `byteStudio`. The project retains original legacy workspace data during migration; legacy registrations become event hats. Import validates format/size, and New/Open confirm replacement and request a download of the current project. Invalid initial saved data renders recovery and offers the original draft download without publishing an empty replacement. Private-account save feedback is passed through the existing course save pipeline; preview copy says device autosave. There is no public-sharing control or claim of full Scratch compatibility.

The numeric-property correction is visible in `SpriteNumber`: text drafts allow a leading minus/temporary incomplete input; valid finite values commit on blur or Enter; errors identify the allowed range while retaining the saved value; Escape restores the saved value. Coordinate, direction and size bounds agree with the project schema.

## Scoped departures and residual design-document drift

The following are recorded facts, not unapproved changes to global rules:

- **Dedicated composition:** the root design/sidecar document the guided 25/30/45 guide/stage/editor shell, folded guide, tile-map stage and lesson prose. The free editor uses a 260–300px stage/sprite column beside the code/art area, a 104px category rail, and no lesson guide. This is the approved surface-specific extension. Guided tasks keep their prior shell.
- **Responsive behavior:** the studio has a 72px project toolbar, hides the wordmark at 1150px, stacks at 950px, and uses a 110px two-row toolbar plus horizontal category rail at 700px. Wide short desktops retain side-by-side editing; the inherited learning height-at-600px stacking rule is not used here. These values belong to this surface, not the root learning breakpoints.
- **Compact controls and local tokens:** studio controls generally use 40px minimum height/7px radius, fields 36px/5px, and light-surface focus `#6237df` with a 2px offset. Phone controls use 44px. Root design describes 44px base/46px primary controls, 8px buttons/7px fields, and learning focus `#986cf5` with a 3px offset. This compact editor treatment is not represented by a studio component variant in global authority. It has not been promoted to a global default by this pass.
- **Blockly scale:** the dedicated canvas starts at `.9` with `.45–1.5` zoom and a horizontal flyout on phones. Root design's explicit `.95` flyout policy describes the incumbent lesson editor; the studio source does not include that same explicit flyout-scale lock. No rendered-scale or target-size claim was independently checked here.
- **Stage semantics:** free building uses a composited scene and bounded coordinate/contact sensing, rather than the incumbent semantic tile route and Rows & columns representation. The root prohibition on replacing saved route collision data is not permission to reinterpret this free scene as a route map. Atlas sampling now also carries a studio-only 4% horizontal inset that root authority does not describe.
- **Existing authority age/scope:** the sidecar declares `generatedAt: 2026-10-09T00:00:00Z`, while its narrative includes later movement/loading details. It has learningWorld/publicPages extensions but no dedicated-studio extension. Its compatibility prose still describes deferred backend/account scope and creative projects retaining original maps; those are historical statements alongside newer product/account and dedicated-studio implementation. This drift pre-existed this documentation comparison and was left intact.
- **Existing events wording:** root design correctly cautions that mascot art alone does not imply formal Events curriculum. That guardrail should not be read as denying the newly implemented bounded studio event hats. This pass does not claim full formal Events-objective coverage, arbitrary Python or curriculum validation.

`DESIGN.md` and `.impeccable/design.json` remain the incumbent global files. The surface brief and current dedicated-editor product notes carry this approved extension until an explicit design-authority refresh is requested. No small factual update to the dedicated-editor section was necessary during this comparison.

## Evidence limits and handoff

Supplied implementation verification at handoff: 1,617 frontend tests across 33 files; 137 synthetic backend tests across 14 files; production build and server typecheck passed. The final fix-batch browser matrix completed with 19 passes and two intentional skips because the 1310px wide-short desktop check does not apply to phone/tablet. Negative/replacement numeric draft checks passed on each device; all seven matching review captures were refreshed and opened, and clean atlas previews were confirmed. Native dragging additionally passed. These are supplied results, not tests rerun by this documentation pass. The independent final verdict remains pending.

Supplied detector report has no primary findings; remaining compact-editor color/type/radius advisories are recorded in `studio-detector.md`. Supplied read-only provenance report covers 39 rasters with zero missing prompts/origins and no new raster generated. Neither was rerun here. `studio-finish.md` records the two independent review corrections and their applied fix batch. Subsequent handoff update: the independent reviewer scored both resolved, disposition ship, with no batch-introduced regressions visible in the seven refreshed captures. This documentation report supplies no ship certification.

Preservation baseline at comparison: `DESIGN.md` SHA-256 `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`; `.impeccable/design.json` SHA-256 `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`.
