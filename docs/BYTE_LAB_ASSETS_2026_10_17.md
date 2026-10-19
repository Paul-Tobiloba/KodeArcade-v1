# Byte Lab background imports and artwork — 17 October 2026

## Try it

Public/device-only preview: http://127.0.0.1:5173/#/learn/grade-6/lab. Account saves: http://127.0.0.1:5173/#/student-play/grade-6/lab with an assigned Grade 6 student signed in. Grades 3–5 use the corresponding course routes. Choose a starter or blank project on first use.

- Backgrounds → Import image selects a local PNG, JPEG or WebP, up to 5 MiB. Cancel does nothing. A resized still image becomes the selected background. Rename, duplicate, remove or Edit a copy to paint on it.
- Backgrounds → Choose background adds top-down Football field, Basketball court, Tennis court, Race track and Volleyball court to the four existing scenes.
- Choose sprite / Costumes → Choose costume adds Boy, Girl, Cat, Dog, Lion, Football, Basketball and Car alongside the original seven mascots. New sprites have independent editable scripts. Existing four-sprite/24-asset bounds remain.

The feature is local work on `codex/auth`, not a deployed release or pushed commit.

## Privacy and storage

Images are decoded locally and drawn onto a clean canvas. The original bytes, metadata and filename are not stored. Transparent input is flattened onto white for background use. Animated inputs are reduced to a still frame; GIF and SVG imports are refused. External URLs cannot be imported. The stage uses a centred cover crop; the saved resized source retains its full aspect ratio. Drawing copies use the same square canvas as other background artwork.

The saved JPEG is at most 768 pixels on its longest side. Fixed quality/size attempts (768/512/384 pixels, .8/.6/.4 quality) must produce at most 80,000 Data URL characters. Images above 16 megapixels or 8,192 pixels on an edge are refused. Failed decode, unsupported format, too-large input, or project/gallery capacity rejection leaves previous artwork intact. Input resets for retry; leaving the editor while decoding prevents a late save into another project.

`image` assets require `purpose: background` and a bounded base64 PNG/JPEG/WebP Data URL. Drawing backgrounds may use a validated image base. Library references are allowlisted in the separate studio catalog; guided lesson choices are unchanged. No arbitrary URL, SVG/HTML payload, executable script, or original file attachment is supported. Browser import re-encoding strips metadata; a manually edited JSON backup remains subject to the same schema/source/size validation, but is not claimed to receive the browser re-encoding step.

The validated single-project size bound increases from 90,000 to 240,000 JSON characters to accommodate embedded images. The twenty-entry gallery retains its 600,000 UTF-8 byte budget, including Recently deleted; a large image collection can reach that budget before twenty entries. Existing course/API/recovery payload limits remain. Native project import accepts files up to 2 MiB before compact schema validation, matching gallery import. No new storage bucket or database migration is needed. Deploy frontend and backend together because shared persistence validation now recognizes the new catalog and image assets.

Private assets reuse learner/class/course-scoped saves, revision checks, browser drafts and encrypted device recovery. They travel in downloaded project/gallery backups. Reports do not include images or project artwork, and free builds remain unscored. Public preview stays device-only. There is no public sharing; children are reminded not to include personal photos/details.

## Block selection repair

Testing found that static asset dropdowns could reject a saved asset ID before the later configuration pass, silently losing a costume/background choice. Editor and runtime now register a per-workspace asset context before deserializing. Missing IDs remain labelled Missing asset so execution can reject them instead of substituting different artwork. Actual image backgrounds are available to background-switching blocks. Reopening/running does not mutate authored asset choices.

## Shipping artwork and provenance

Eight sprites are 384×384 PNGs with true alpha, generated with the built-in image-generation tool, one call per distinct asset. Native transparency was preserved and checked on light/dark grounds. Exact prompts are embedded in the PNGs and recorded in:

- [People prompts](assets/byte-lab-people-prompts.md)
- [Animal prompts](assets/byte-lab-animal-prompts.md)
- [Ball/car prompts](assets/byte-lab-play-prompts.md)

Shipping files: `public/images/studio/{boy,girl,cat,dog,lion,football,basketball,car}.png`. Five `*-court.svg` files in that folder are authored countable flat court geometry, with no imported screenshot/brand assets. Existing rasters remain unchanged. Read-only Impeccable provenance scan: 34 rasters, zero missing.

## Verification

Frontend tests: 1,665 passed in 37 files. Synthetic PGlite backend tests: 140 passed in 14 files, including authenticated image roundtrip, wrong-pupil rejection, invalid-source rejection and private report isolation. Production build and server TypeScript checks passed; existing nonfatal Zod annotation and large-chunk warnings remain.

Browser verification: 76 unique scoped checks passed across desktop, phone and tablet: 58 existing editor/gallery/onboarding checks plus eighteen asset checks. Two wide-short-desktop cases are intentionally skipped on phone/tablet. These are combined unique results across scoped runs, not one full-platform run. Asset coverage includes all visual choices, real image decoding/resizing, filename removal, imported-pixel roundtrips, editable image copies, PNG/JPEG/WebP, corrupt/SVG/oversized/dimension failures, cancellation, retained script asset IDs, repeated local and parent capacity rejection, exact project retention and successful retries after freeing space. Shell/chooser Axe checks pass with Blockly excluded. The broader platform browser regression remains paused; this feature does not claim to finish that suite.

The Impeccable independent finish review initially issued FIX for capacity errors hidden behind the native asset chooser. The correction closes the chooser before attempting its commit, then focuses the visible local or gallery recovery even when the same error repeats. The reviewer inspected the source, four desktop/phone failure captures and the regression evidence, scored F1 RESOLVED and issued SHIP at that correction scope. Smaller person-sprite visual fill remains advisory, not a blocked requirement. See `.impeccable/review/assets-finish.md`; no whole-platform certification is implied.

The independent documenter compared the completed extension and rechecked the final correction against the incumbent visual system. `DESIGN.md` and `.impeccable/design.json` remain byte-for-byte unchanged; existing editor tonal/type/radius drift was recorded rather than refreshed. See `.impeccable/review/assets-documentation.md`. The React checklist informed async unmount cleanup, post-render failure focus and retained event-handler/latest-project references. The single detector run found no primary issues; final read-only provenance scan remained 34 rasters/zero missing.

Temporary system wakefulness uses a separate Windows execution-state guard with a six-hour safety sunset from its launch, without changing stored power settings. The guard remains running at handoff in response to “keep pc on”; it is not an indefinite power-policy change. No hibernation is scheduled by this task.
