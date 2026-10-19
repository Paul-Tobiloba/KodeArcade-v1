# Workspace stage/code resizing — documentation comparison

Date: 18 October 2026. Scope: the incumbent Operate extension in `.impeccable/surfaces/workspace-stage-resize.md`, its implementation in the three existing workspaces, the dated Adjustable workspaces entry in `PRODUCT.md`, and `docs/WORKSPACE_RESIZE_2026_10_18.md`.

## Verdict

The scoped documentation agrees with the inspected implementation. Byte Lab, course challenges and Drawing & Art gain an adjustable desktop stage/code boundary while retaining their existing composition. The extension fits Build & Play's lavender ground, violet controls, white workspaces, plain reading type and native Blockly geometry. It does not establish a replacement visual world or require a new global token scale.

The latest `PRODUCT.md` entry accurately records desktop dragging, keyboard adjustment, reset, safe bounds, separate lesson minimization, mounted-only preference and preserved responsive layout. Its link to the dated implementation note supplies the exact interactions, verification and short-height scroll limitation.

Preserve `DESIGN.md` and `.impeccable/design.json`. The current local surface contract and dated implementation note capture the new utility precisely; existing global documentation drift is recorded below without repair. This pass writes only this comparison report.

## Contract and implementation

| Promise | Independently inspected evidence | Result |
| --- | --- | --- |
| A draggable boundary between the live stage and coding area | `src/WorkspaceDivider.tsx` overlays its parent instead of occupying a grid cell. `CreativeStudio.tsx`, `DrawingLab.tsx` and `App.tsx` place it between the existing stage and editor. Studio and learning CSS consume the local `--stage-width` override. | Matches the requested functional arrangement and preserves the panels. |
| Keep the incumbent visual identity | `src/workspace-divider.css` reuses learning muted ink, lavender ground and action violet. A drawn grip has a local 4px corner radius and a visible violet focus outline; hover/focus adds a translucent violet fill. The desktop studio capture retains existing artwork, controls, categories and connected blocks. | A compact utility treatment, not a new system primitive or decorative direction. |
| Protect usable coding space and allow reset | Source clamps the stage to 240–600px, further constrained by remaining space for 520px of studio tools or 400px of course/drawing editor. Left/Right changes 24px, Shift changes 64px, Home/End reaches bounds, and Enter or double-click clears the override. | The implementation note records the same limits and controls. |
| Keyboard and pointer interaction | The component exposes a named vertical separator, live numeric ARIA values, enabled-only tab focus, pointer capture, cancellation handling and a visible focus outline. | Source supports the documented interaction. Actual behavioral and scoped accessibility results are supplied evidence below. |
| Preserve lesson collapse and existing authored work | Learning media rules retain the bounded desktop guide/56px rail and compact full-row guide. The divider observes panel geometry; resize functions change a CSS property rather than editor/program data. The local requested width lives in a component ref. | No new saved layout/account field or editor remount is introduced by the divider. Source inspection does not independently prove runtime preservation. |
| Preserve phone/tablet layout | The shared component activates only at width ≥951px and height ≥601px; otherwise it hides, leaves tab order and removes the width override. Existing stacked learning and studio rules remain. The opened course phone capture has the incumbent toolbar, folded lesson area and stacked stage, without a divider. | Matches the explicit mobile constraint. |
| Keep controls reachable when a studio stage becomes tall | The stage/sprite panel retains `overflow: auto`; the implementation note discloses that a large stage can place Run below the visible fold. | Documented adaptation, also acknowledged in the independent finish review at 1308×656. |

The detector advisories about the new grip's 4px corners and translucent incumbent-violet fill are accurately disclosed as local utility details. They do not by themselves justify global token additions. The implementation adds no imagery; existing artwork remains authoritative.

## Existing global documentation drift — reported only

1. `DESIGN.md` Overview and Layout still describe wide-screen columns as 25/30/45. The earlier lesson-panel extension already replaced that default with a 240–288px guide or 56px rail and a 2:3 remainder. The divider now permits a mounted stage-width override within that incumbent arrangement. The prior column description must not be treated as a new resize regression.
2. `.impeccable/design.json` repeats the old 25/30/45 model in `extensions.learningWorld.layout.desktop` and `narrative.overview`. Its static Learning activity guide preview has no collapse/expand control. Neither global file currently illustrates the adjustable boundary; the dated contract and implementation note are the current scoped account.
3. Global guidance contains historical product-availability statements, including deferred account/backend language and older Byte Lab scope. `PRODUCT.md` carries later superseding implementation entries. Those historical statements and the sidecar's older component coverage are pre-existing drift, not authority to expand or revise this resize task.

The durable incumbent palette, typography, mark rules, white-paper drawing identity and native Blockly geometry remain applicable. No global overwrite, merge, sidecar refresh, qualitative-language interview or unrelated documentation repair was performed. The prior dashboard-link work and block-comparison audit are separately closed and were not re-audited here.

## Evidence and limits

Independent work in this documentation pass: read the document reference, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, the resize contract, dated implementation note and completed finish report; inspected the shared divider, its CSS, integration locations and relevant responsive grid rules; opened `resize-studio-desktop.png` and `resize-course-phone.png`; and checked both global-file SHA-256 values. These two captures show settled, readable interface content. The phone image is viewport evidence, not a claim that its entire scrollable document is visible. The other ten captures and original reference recording were not opened by this documentation pass.

Supplied implementation verification: 21 scoped browser checks passed (nine resize, three existing lesson-panel and nine dashboard creative checks), 1,713 frontend tests across 39 files passed, and the production build passed. Browser data used synthetic account fixtures. The builder reports one scoped detector pass with 142 advisories (95 color, 41 type, six radius) and one existing `byte-bounce` animation warning at `learning-world.css:164`. The supplied shipping-image provenance scan reports 62 rasters and zero missing prompts, with no assets added. Existing bundle-size and Zod PURE-comment warnings remain. This pass did not rerun browser tests, unit tests, build, detector or provenance scan.

The separate independent finish report, `.impeccable/review/workspace-resize-finish.md`, returns **ship**, with no material fix. That reviewer reports opening both reference endpoints and all twelve `resize-{studio,drawing,course}-{desktop,1308,phone,tablet}.png` captures, finding all valid. It did not replay the original video/intermediate frames or run the browser/detector. Its scoped visual verdict agrees with this documentation comparison; supplied behavioral results retain their stated limits.

This is local, uncommitted and unpushed work on `codex/auth`, not a deployment or whole-platform, curriculum, live-database or accessibility certification.

## Preservation check

The independently read SHA-256 values match the supplied baselines exactly:

- `DESIGN.md`: `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`
- `.impeccable/design.json`: `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`

Only `.impeccable/review/workspace-resize-documentation.md` was written by this pass. Source, assets, product documentation, both global design files and prior reports were preserved.
