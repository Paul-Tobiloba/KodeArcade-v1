# App Lab design documentation handoff — 20 October 2026

## Scope and authority

App Lab is an ordinary code-led, screenshot-directed extension of the existing KodeArcade application in Operate mode. The supplied Code.org references establish the preview/toolbox/workspace relationship; they do not establish a replacement identity or a compatibility promise. The owner-approved direction is recorded in `.impeccable/surfaces/app-lab.md`; functional scope is recorded in `docs/APP_LAB_2026_10_20.md` and the current App Lab entry in `PRODUCT.md`.

This handoff applies the Impeccable document reference as an inheritance and documentation review. It does not regenerate the global design system. Existing `DESIGN.md` and `.impeccable/design.json` were inspected and preserved. No source, product, curriculum or global design file was changed by this documentation pass; the only write is this review record.

## Evidence checked

Inspected `src/AppLab.tsx`, `src/AppLabEditor.tsx`, `src/AppLabPreview.tsx` and `src/app-lab.css` against the incumbent visual rules and the App Lab direction contract. Also read the scoped detector record and the initial independent finish review.

Opened all nine supplied captures in `.impeccable/review/`:

| State | Desktop | Phone | Tablet |
| --- | --- | --- | --- |
| Design | `app-lab-design-desktop.png` | `app-lab-design-phone.png` | `app-lab-design-tablet.png` |
| Code | `app-lab-code-desktop.png` | `app-lab-code-phone.png` | `app-lab-code-tablet.png` |
| Data | `app-lab-data-desktop.png` | `app-lab-data-phone.png` | `app-lab-data-tablet.png` |

The named states contain populated tools and preview content. Desktop places the phone preview and Run action beside the editing tools. Design shows the palette, screen choices and selected-control properties. Code shows connected native Blockly programs, category controls and workspace navigation. Data shows the example table, editable values and row/column actions. Each state retains the collapsed console in a consistent position.

Phone and tablet preserve these roles in a scrolling vertical arrangement. Phone Design stacks properties beneath the palette; tablet retains a compact palette beside properties. Narrow Data deliberately contains horizontal table scrolling, and compact Code uses a horizontal native flyout plus a pannable workspace. Their clipped inner content is part of those scroll surfaces. Some Code/Data captures include the focused skip link, consistent with the finish review's interpretation of that accessibility state.

These are the supplied snapshots opened during this pass. The builder owns the final browser refresh, verification results and final disposition. This document does not assert that a pending run passed or independently certify dynamic behavior from screenshots.

## Inherited visual system

The implementation follows the existing Build & Play identity: the approved three-piece K, Fredoka headings and wordmark, system text for controls and reading, deep purple navigation, lavender ground, dark purple ink, and white bordered workspaces. Action violet, darker hover violet, muted learning text, panel borders and pale editor headings correspond to incumbent learning roles. Native Blockly silhouettes and the existing theme are reused.

The important relationships also inherit the application workflow: the run control stays beneath the preview, workspace hierarchy is border-led, selected views remain explicit, labels stay visible, and toolbar focus uses the existing warm yellow. Help uses the incumbent white dialog, violet border, rounded form and dialog shadow. Destructive operations call the shared confirmation workflow rather than introducing a new dialog family.

## Intentional surface-local variations

These observed values describe App Lab's task and remain local; they are not new global tokens:

- The stage uses 320 × 480 authored interface coordinates and scales down with available width. It is a phone-like app preview rather than the learning tile stage. Learner-authored colors, geometry and font sizes are project data, not additions to KodeArcade's palette or type ramp.
- The desktop shell uses a 340px preview column with flexible tools and a 1900px content maximum. It changes to a 300px preview at 1100px, stacks at 950px, and stacks the internal Design/Data columns at 420px. The header has an 88px minimum and wraps project/save actions. These rules do not replace existing lesson or challenge breakpoints.
- Panels use the existing 12px panel radius; controls use the existing 7px field radius. Most editor controls retain a 44px minimum and Run a 48px minimum. Compact title and workspace utility controls have explicit local exceptions.
- App Lab uses smaller contextual headings and labels to fit the editor hierarchy. Light-surface focus uses action violet with a 3px outline and 3px offset; navigation retains warm yellow. Local disabled opacity is .55. These are implementation observations, not a request to revise global defaults.
- Selection and supporting surfaces add pale violet shades, and errors use a pale red ground with existing semantic danger text. Such values are scoped to editor state and feedback.

## Advisory values and pre-existing documentation drift

`app-lab-detector.json` records no primary findings: its 25 entries are advisory, comprising seven color findings and eighteen type-ramp findings. The unique flagged colors are `#ded3ff`, `#ad2435`, `#e6ddff`, `#e8e0ff`, `#fff4f5` and `#8c1d2b`. The unique flagged sizes are `1.4rem`, `1.12rem`, `.95rem`, `.75rem`, `.8rem`, `.78rem`, `1.1rem`, `.7rem` and `1.15rem`.

The danger colors `#ad2435` and `#8c1d2b` already appear in the incumbent DESIGN.md protected-confirmation guidance, although they are absent from the normative frontmatter palette. Several compact sizes also have existing contextual uses in DESIGN.md prose. The detector's frontmatter comparisons therefore do not establish that every advisory is a new design decision or a visual defect. The remaining pale state colors and contextual sizes are recorded here as App Lab observations without promoting them into the global system.

The sidecar still has `generatedAt: 2026-10-09T00:00:00Z` while its own content describes later work. Its component catalog/narrative does not cover all later DESIGN.md guidance, including the protected-action confirmation section, and its stored learning review/test figures describe an earlier learning task. That is pre-existing documentation freshness/coverage drift. It was not repaired as a side effect of App Lab, and those historical counts must not be treated as App Lab verification.

## Assets, finish finding and remaining limits

No new shipping raster artwork is introduced. The existing approved SVG K is reused directly; UI icons and native Blockly are code-rendered. The nine PNGs are review evidence, not new product artwork. No image generation, raster provenance repair or scan of unrelated incumbent artwork was needed.

The initial finish review requested a dropdown runtime/read consistency fix. The builder reports that the runtime fix and two focused tests have been added. It changes behavior rather than the visual system, so it does not justify changing DESIGN.md or its sidecar. The final verdict and verified test totals belong in the builder's final handoff; this documentation pass does not claim their result.

The scoped visual inheritance is documented. Remaining documentation concerns are the reported pre-existing global drift and keeping the final release verification/disposition distinct from the initial review's historical pending items. Full nonvisual Blockly editing, production account-session validation, publishing, shared data and curriculum integration are outside this first-release documentation claim.

## Behavior-only finish addendum

The finish review subsequently identified F2: activating the App Lab skip link could replace the application's hash route. Inspected the corrected `AppLab.tsx` handler: it prevents the default anchor navigation and focuses the existing `#app-lab-main` target, preserving the route. The builder added public-preview and student keyboard-activation assertions. This correction changes no CSS, assets, tokens or visual-system guidance; DESIGN.md and its sidecar remain preserved. The builder reports 1,825 unit tests, the final build and server typecheck passing. The final browser run is still underway at this addendum; no pass is claimed here.
