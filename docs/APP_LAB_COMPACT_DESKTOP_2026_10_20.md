# App Lab compact desktop — 20 October 2026

The owner requested smaller buttons/items and a desktop-height editor instead of a long scrolling platform. This is a refinement of the approved shell, not another block redesign.

## Implementation

- At ≥951px width and ≥600px height, App Lab is a 100dvh flex workbench. Header/navigation and optional save/error feedback consume their natural height; the remaining space belongs to the workspace.
- Header shrinks from 108px to 76px. Pointer buttons are 32px; design tiles shrink from 88px to 60px. Branding, icons, spacing and property controls use compact, scoped desktop sizes. Preview controls authored by the child are not restyled.
- The phone frame occupies an independently sized container. Its width responds to available height and width; the existing ResizeObserver scales the real 320 × 480 canvas proportionally. Design coordinates, dragging and saved dimensions are unchanged.
- Run/reset remain under the phone. Property fields, design/code palettes, blocks, CodeMirror, table editing, starter selection and expanded console scroll within their panels. Long lists do not enlarge the shell. Category examples retain intrinsic row height so they never compress over one another.
- Touch-operated desktops retain 44px controls. At narrow widths or heights below 600px, the existing scrolling page remains so zoom/short windows do not trap content. Phone/tablet composition is preserved.
- The preview now has a group role for its existing accessible label, fixing the issue surfaced by the expanded Data-view accessibility check.

No runtime, parser, storage, API, database, curriculum or account behavior changes. Existing unrelated work is preserved. No push, merge or deployment.

## Verification

Before the change, the 1366 × 768 blank editor produced a 966px document. The final desktop regression passes at 1366 × 768, 1280 × 720, 1024 × 768, 1440 × 900 and 1280 × 600, checking Design/selected controls, blocks, long editable text, Run/output, long tables, starter selection, proportional canvas geometry and no document overflow. Short-height fallback and synthesized touch-operated desktop checks also pass: seven desktop cases total, one intentionally non-desktop case skipped.

The focused App Lab suite passes 193 tests across five files. The final production build passes with existing dependency-annotation/chunk-size warnings. The layout detector reports no findings. The two phone/tablet density cases pass, completing nine applicable density cases. The existing App Lab and expanded-toolbox journeys pass all nine cases per device class: 27 interaction cases across desktop, phone and tablet, covering design/dragging, block/text edits, diagnostics/completions, Run, local data, private synthetic account saves, reload, backup/import, confirmations, gutter geometry and accessibility. These totals combine the final applicable runs; device-inapplicable density cases are intentionally skipped.

Browser checks use local Chromium with synthetic preview/account fixtures; no production or live-account data is used. Physical devices and Safari are not tested. An initial test fixture exceeded the existing connection-depth limit and was corrected to several valid short stacks. A test selector was scoped to distinguish the Data view from its same-named block category, and the mobile size assertion was corrected to accept existing tablet targets larger than 44px. Initial sandbox worker temp-file access failed; the permitted outside-sandbox focused run passed without changing the test configuration.

Visual captures: `.impeccable/review/app-lab-compact-{design,blocks,text,data,phone,tablet}.png`. All six captures were opened and inspected after the bounded correction; the palette is no longer compressed and all primary desktop controls remain visible. Narrow screens retain the previous stacked flow. This is builder verification, not a new independent whole-surface ship verdict.

## Follow-up: taller preview, no footer tips

At the owner's request, removed the bulb tip and its Run/reset text, plus the Saving & design tips disclosure, on all screen sizes. Removed their unused styles and icon import. The existing Help dialog still explains Run/reset, keyboard movement, save scope and pretend-data privacy. Actionable draft/save/error feedback is unchanged.

The desktop preview column grows from 276px to 308px and the frame-width cap from 314px to 338px. Combined with the reclaimed footer height, this makes the actual canvas about 48px taller at 1366 × 768 while preserving its 2:3 ratio and original design coordinates. Short desktops still scale to available height; mobile retains its scrolling fallback. Run/reset keep 12px bottom padding.

The revised nine applicable density/responsive cases pass (15 device-inapplicable cases intentionally skipped), including all views at five desktop sizes, short-height fallback and touch desktop. The regression asserts the footer tips are absent and that the canvas is at least 380px tall at 1366 × 768. Build passes with the existing warnings; the layout detector reports no findings and the diff whitespace check passes. Updated desktop, phone and tablet captures were opened and inspected. Design/dragging, Run, and save/reopen journeys are also checked on all three device classes. No runtime/storage changes, push, merge or deployment.
