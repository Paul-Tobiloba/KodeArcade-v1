# Adjustable stage and code panels — 18 October 2026

The owner's recording shows dragging the divider between the stage and Code.org workspace. Byte Lab, course challenges and Drawing & Art now expose a similar desktop stage/code separator without replacing the existing editor composition or lesson minimize/expand control.

Drag the grip on the stage's right edge. With it focused, Left/Right adjusts by 24px (Shift: 64px), Home/End reaches the safe width limits, and Enter or double-click restores the default. The stage ranges from 240px up to 600px, further limited to preserve at least 520px of Byte Lab's tool area or 400px of a course/drawing editor. The Byte Lab stage/sprite column remains independently scrollable when a large square stage exceeds the window height.

At widths up to 950px or heights up to 600px the separator is hidden, unfocusable and inactive. Existing mobile/tablet stacked layouts are unchanged. At 951–1100px a course's existing lesson accordion stays above its two panels; the divider remains on the stage/code boundary. The wider desktop lesson rail can still collapse independently. Resizing across breakpoints clamps the last requested width to the available space.

The adjustment is a device-layout convenience held only in the mounted workspace, not new curriculum or account data. Resizing does not edit blocks, drawing ink, positions, progress or program state. Existing Blockly resize observers refit the coding canvas. A shared pointer-capture/keyboard component overlays the boundary instead of consuming a grid cell; observers, captures, layout overrides and event listeners are cleaned up with the workspace.

Implementation: `src/WorkspaceDivider.tsx`, `src/workspace-divider.css`, integrations in `CreativeStudio.tsx`, `DrawingLab.tsx`, `App.tsx`, and existing studio/learning grid definitions. The dashboard creative links and screenshot block comparison are documented separately.

## Verification and limits

Production build and 1,713 frontend tests across 39 files passed. All 21 scoped browser tests passed across desktop, phone and tablet: nine resize checks, three existing lesson-panel checks and nine dashboard creative checks. They exercise drag, keyboard bounds, reset, lesson collapse, viewport changes, retained work and running the existing code. Synthetic account API fixtures are used; no new live database or production certification is implied. Capture/report paths are `.impeccable/review/resize-{studio,drawing,course}-{desktop,1308,phone,tablet}.png`, `workspace-resize-finish.md` and `workspace-resize-documentation.md`. The independent finish reviewer returned `ship` for the resizing scope after opening all 12 captures, with no material fixes.

One design detector run over the changed targets reported 142 advisories (95 color, 41 type, six radius) and one existing `byte-bounce` animation warning in `learning-world.css:164`. Two advisories concern the new utility grip's 4px corners and translucent incumbent violet focus color. No global token changes were made. No new imagery; the shipping-image provenance scan still reports 62 rasters and zero missing. Existing bundle-size and Zod PURE-comment warnings remain. This is local work on `codex/auth`, not a commit, push or deployment.
