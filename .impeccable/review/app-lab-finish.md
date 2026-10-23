# App Lab independent finish review — 20 October 2026

## 1. Disposition

**ship** — verdict pass: F1 and F2 are both resolved. This disposition scores the two material fixes listed below, using inspected implementation, regression-test definitions, supplied passing results and refreshed captures. It is not a new whole-surface audit or production certification. The original review supported the established Operate direction and required no composition rebuild or capture repair.

## 2. Material findings

| Finding | Verdict | Evidence |
| --- | --- | --- |
| F1: dropdown display/read inconsistency | Resolved | `src/appLabRuntime.ts:31` rejects text absent from dropdown options before mutation. Both block assignment (`:95`) and UI input (`:150`) use that guard. `src/appLab.test.ts:59` covers valid assignment/read agreement; `:64` covers invalid assignment and input without selection drift. The builder reports all 41 focused App Lab tests passing. |
| F2: skip-link changes the route | Resolved | `src/AppLab.tsx:128` prevents default navigation and focuses the existing main. `e2e/app-lab.spec.ts:13` and `:122` activate the link with Enter and assert preserved public/assigned URLs plus main focus. The builder reports the App Lab browser cases passing across desktop, phone and tablet. |

Original findings are retained below as the audit trail; they are not open work.

**F1 · P2 · Dropdown can display a different value from the one its blocks read.** `src/appLabRuntime.ts:90` accepts any text in `al_set_text`. `src/AppLabPreview.tsx:19` then displays the first dropdown option when that text is absent from the options, while `src/appLabRuntime.ts:59` returns the unmatched `e.text` to a read block. For example, setting `choice` to `Missing` with options `Option 1`/`Option 2` displays `Option 1`, but Print/read returns `Missing`. A learner can therefore see one input while their condition evaluates another. Reject a non-option dropdown assignment with an actionable runtime error before mutating the control, or apply a single documented normalization in the runtime so the displayed and read values agree. Preserve successful assignment of an existing option. Add focused regression coverage for valid and invalid assignments and verify the preview/read agreement. The constructor's normalization at line 15 already handles the initial value; the fix must also cover later writes.

**F2 · P2 · Skip-link activation leaves the App Lab route.** `src/AppLab.tsx:128` uses `href="#app-lab-main"` without preventing navigation. `src/main.tsx:20`–`24` subscribes to hash changes and recognizes public App Lab only at `#/app-lab`; the anchor therefore changes the route rather than simply moving focus into the workspace. The same fragment also replaces an assigned student's activity route. Prevent the default anchor navigation, focus the existing `tabIndex={-1}` main element and optionally scroll it into view, following the established `StudentCourses` pattern. Verify keyboard activation preserves the public/assigned route and focuses `app-lab-main`.

No further material issue established by the supplied screenshots and inspected UI code. The detector's seven palette and eighteen type-ramp findings are advisories; their existence does not prove a contrast or layout defect.

## 3. Direction and scope fidelity

The named project and save state lead the header. Desktop puts the preview and Run controls left of the actual Design/Code/Data tools. Design exposes controls, screens and properties; Code gives native blocks the main working area; Data explicitly identifies tables as project-local. Phone and tablet stack these roles consistently. The violet navigation, lavender ground, bordered white workspaces, K mark, Fredoka headings and system controls follow `DESIGN.md` and `.impeccable/surfaces/app-lab.md`.

The signature design → event blocks → same-preview Run path is represented in implementation. Multi-screen design, editable event blocks, project save/import/download and project tables are present. The copy distinguishes browser preview storage from private account work and authored data from temporary runtime changes. Existing revision/recovery persistence is reused. No supplied evidence suggests an unintended curriculum change, copied Code.org branding, fake unavailable feature buttons or a new shared-data service. This code-led extension does not require a generated comp or a replacement visual world.

## 4. Screenshot and craft evidence

Opened all nine required captures: `app-lab-design-desktop.png`, `app-lab-code-desktop.png`, `app-lab-data-desktop.png`, `app-lab-design-phone.png`, `app-lab-code-phone.png`, `app-lab-data-phone.png`, `app-lab-design-tablet.png`, `app-lab-code-tablet.png`, and `app-lab-data-tablet.png` in `.impeccable/review/`. Each is a populated full-page view of its named state, without blank or half-loaded regions. Desktop hierarchy and spacing are clear, forms remain readable, and the collapsed console has a consistent location. Narrow forms stack without document-wide horizontal clipping. Data uses a contained horizontal table scroller, and compact Blockly uses the intended horizontal native flyout and pannable workspace. Clipping inside those deliberate scroll surfaces is not missing content.

The visible skip link in Code/Data phone and tablet captures is a legitimate focused accessibility state. Its appearance does not conceal the editing tools or invalidate the named views, and is not a reason to recapture on its own. Its activation behavior is a separate material finding, F2 above. Native Blockly field selection, focus and flyout scrollbars remain recognizable. Primary controls, destructive actions and the active view are distinguishable. No new raster asset requires provenance. Static captures do not demonstrate every dynamic, error or keyboard state; those judgments also depend on implementation inspection and the supplied verification record.

## 5. Residual limits

Final supplied verification: full unit run 44 files/1,825 tests passed; focused App Lab suite 41 passed; server progress/recovery/deployment three files/29 passed; production build and server typecheck both exited 0. All 12 App Lab browser cases passed across desktop, phone and tablet. At packet time six of nine incumbent dashboard regression cases had passed and the remaining three tablet cases were finishing; their result is outside this two-finding verdict and must be reported accurately by the builder. Results were supplied by the builder, not independently rerun here. Browser API fixtures and local PGlite do not establish a production account session. Backend and frontend require coordinated deployment; none has occurred. Full nonvisual Blockly editing, publishing, shared databases, arbitrary JavaScript, media and curriculum integration remain outside this release.

Reopened all nine refreshed captures at the original paths for this verdict pass. Each still shows its named populated state. Static captures do not themselves prove route preservation or dropdown assignment behavior; inspected code and focused test evidence support those conclusions. No browser, detector rerun or additional defect hunt was performed. The two listed material fixes are resolved; no further fix round is owed under this verdict's scope.
