# Byte Lab assets — independent finish review

## 1. Disposition

FIX. The requested artwork and private-image path are visually ready at the supplied desktop, phone and tablet sizes. One material recovery defect remains: an asset-library selection rejected by project or gallery capacity leaves its native modal open over the error. Resolve F1 and return that correction for a bounded verdict check. No redesign or general recapture is requested.

## 2. Scope and evidence

This review covers only the 17 October 2026 Byte Lab extension: private background imports, five top-down sports scenes, eight new cutout sprites, their previews and saved asset choices. The final section of `.impeccable/surfaces/src-creative-studio-tsx.md`, PRODUCT.md and `docs/BYTE_LAB_ASSETS_2026_10_17.md` define the scope. It is a precisely pinned, code-led Operate extension; no approved composition or concept tournament applies. Guided curriculum, the broader platform, global visual-system refresh and power management are outside this verdict.

Independently inspected all twelve required captures: `assets-{sprites,backgrounds,stage,import}-{desktop,phone,tablet}.png` in this folder. Compared the incumbent `studio-editor-desktop.png`, `studio-editor-phone.png` and `studio-user-1310.png`. The full-page phone/tablet screenshots include document content outside the actual viewport; the native modal/backdrop was assessed within its viewport, not as a missing full-document overlay. Dialog max-height/overflow and two-column phone library rules agree with that behavior.

Read the implementation paths in CreativeStudio, StudioLibrary, StudioArt, StudioEditor, studioImageImport, studioCatalog, studioProject, studioBlocks and studioEngine, with studio.css and studio-gallery.css. Inspected `src/studioAssets.test.ts`, `e2e/studio-assets.spec.ts`, shared gallery validation and the image privacy case in `server/progress.test.ts`. The tests substantiate separate guided catalogs, safe source schemas, bounded import rejection, project/gallery/cloud serialization, backdrop block execution and preserved non-default costume IDs. Editor and runtime establish asset context before Blockly deserialization; stale IDs remain Missing asset rather than being silently reassigned.

Supplied implementation results, not independently rerun by this reviewer: 1,665 frontend tests, 140 synthetic backend tests, build/server TypeScript checks; 70 scoped browser checks passed with two intentional desktop-only skips. The final 15-case assets browser batch was still running at handoff. The single detector run exited 0 with no primary findings; 34 shipping rasters had zero missing provenance. Eight PNGs carry exact generation prompts; court SVGs are appropriate countable geometry.

## 3. Findings

| ID | Class | Finding and evidence | Effect |
| --- | --- | --- | --- |
| F1 | Material, P2 | `CreativeStudio.tsx` commit returns false on schema capacity failure or parent save rejection. `chooseCharacter` and `chooseBackground` close `chooser` only on success. The error is rendered outside the dialog; the error focus effect targets that outside element while `showModal()` keeps it inert. At 24 assets, open Choose background and select a new Football field, or choose a new costume: the selection appears to do nothing, and its recovery instructions remain behind the modal. A full gallery can reach the same path through `StudioLibrary.updateProject`/`commit`. | Children cannot see or focus the reason the requested library artwork was rejected until they discover that closing the chooser reveals it. Previous valid work is retained, but the failure/recovery path is inaccessible. |
| A1 | Advisory | Boy/Girl have less visual fill than the original mascots in library, sprite-strip and stage captures. Their transparent padding and slender figures make them noticeably smaller at the same size setting. | Names remain readable, whole tiles remain large targets and the figures remain identifiable. Acceptable for this extension; no asset regeneration or change to the existing sprite sizing contract is required. |
| A2 | Advisory, incumbent | Detector reports older global color/type/radius drift. Existing small helper copy, phone art-panel stacking and brief save-toast overlap match the incumbent editor. Context also reports stale sidecar/build-path metadata. | These do not justify a global refresh during this extension. Preserve DESIGN.md and sidecar; any documentation refresh is separate work. |

No other material issue was found in the scoped captures or source pass. The sports markings read clearly and leave usable play space. The warm cutouts sit coherently beside the existing mascots. Import progress, success, format/privacy help and non-personal naming are concise. Imported art renders consistently in the stage, editable-copy preview and gallery. Source schemas and validation-before-mutation protect previous artwork; decode cleanup revokes object URLs, and unmount protection prevents late import into another open project.

## 4. Direction and fixes

Resolve F1 at the narrow library-selection boundary. When a selection cannot commit, either show an actionable error inside the native chooser or close it and move focus to the now-visible project/gallery error after rendering. Cover both local project rejection and a parent/gallery false return. Ensure a repeated rejection with the same message also receives focus. Preserve the last valid project, current artwork, authored code and gallery entry.

Add a meaningful browser regression using a valid 24-asset project: choose a new sports background through the modal, assert that the recovery message is visible and focused, and assert exact previous project retention. Exercise a costume selection and gallery-budget rejection through the same failure path, including retry after freeing capacity. The current asset-capacity browser case exercises Import image outside a dialog and therefore does not cover F1. Capture the corrected failure state at desktop and phone for the verdict check; unchanged successful captures do not need repeating.

## 5. Residual limits and QA

This is a source-and-supplied-capture review, not a fresh interactive browser run or whole-platform/accessibility certification. The supplied Axe checks cover the chooser and imported-image editor shell while excluding Blockly; complete screen-reader/keyboard Blockly authoring remains an existing documented limit. Final assets browser results must finish successfully before release. Production deployment and real account/device recovery were not exercised here; frontend/backend must deploy together because shared asset validation changed. The broader platform browser regression remains paused.

After F1, return only its changed source, regression results and failure-state captures for a correction verdict. This review requests no new visual direction, raster regeneration, extra detector run or unrelated polishing cycle.

---

## F1 correction verdict — 17 October 2026

Disposition: SHIP at the F1 correction scope. F1 is RESOLVED. This supersedes the initial FIX disposition for the listed finding; it is not a new whole-platform or whole-surface audit.

| Finding | Score | Correction evidence |
| --- | --- | --- |
| F1: library capacity errors hidden behind native modal | RESOLVED | `finishAssetChoice` closes the chooser before commit and explicitly schedules focus to the visible parent `.studio-library-error` or local `.studio-error` on rejection. Both character/costume and background selection use it. The explicit rejection callback also covers an unchanged repeated error message, rather than depending only on a changed React error state. |

Independently read the changed source and expanded regressions, then inspected `assets-local-capacity-desktop.png`, `assets-local-capacity-phone.png`, `assets-capacity-desktop.png` and `assets-capacity-phone.png`. All show the chooser absent and readable recovery. The gallery error includes Download gallery. The phone gallery screenshot's sticky header is painted at the captured scroll position in a full-page image; source behavior and browser focus/visibility assertions establish the relevant viewport state. A further recapture is unnecessary for this correction.

The 24-asset regression now checks import rejection, new background rejection and repeated new costume rejection, exact saved-project retention, modal closure, visible/focused recovery, then successful background retry after removing an unused asset. The gallery-budget regression covers the parent false-return path, retained artwork, focused download recovery, permanent removal through Recently deleted and a successful retry. These exercise the failure paths named in F1 rather than merely testing the helper's structure.

Supplied final execution results: all 18 assets browser checks passed across desktop, phone and tablet; 58 existing editor/gallery/onboarding browser checks passed with two intentional desktop-only skips, for 76 unique scoped passes. The rerun frontend suite passed 1,665 tests; synthetic backend 140, final build/server checks and 34-raster/zero-missing provenance checks also passed. These execution results were supplied by the implementation pass, not independently rerun here.

No remaining correction is requested for F1. Earlier advisory observations and the original residual limits remain advisory/limits; this verdict does not reopen or enlarge that review.
