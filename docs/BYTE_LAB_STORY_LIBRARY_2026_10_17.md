# Byte Lab family and story-making library — 17 October 2026

## Try it

Open http://127.0.0.1:5173/#/learn/grade-6/lab for device-only preview, or http://127.0.0.1:5173/#/student-play/grade-6/lab for an assigned signed-in student. Grades 3–5 use the corresponding course route. Start a blank project or a starter on first use.

- Choose sprite / Costumes → Choose costume → People: Boy, Girl, Man, Woman, Grandma and Grandpa. The four adults are new.
- Animals adds Horse, Butterfly and Fish to the existing mascots, Cat, Dog and Lion.
- Things adds House, Tree, Bicycle, Bus and Rocket alongside Byte, the balls and Car. Houses/trees are ordinary programmable sprites, so children can leave them still or make them react to clicks/touches.
- Backgrounds → Choose background: eight new illustrated scenes—City street, Country home, Playground park, Sunny beach, Classroom, Outer space, Underwater and Forest clearing. These join the four original fantasy/nature scenes and five sports courts.

There are now 27 sprite/prop choices and seventeen backgrounds. This counts library choices, not simultaneous actors: the existing four-sprite, 24-asset, twelve-costume-per-sprite and runtime safety bounds are unchanged. Scenes are artwork, not new physics, obstacle maps or activities. Existing character/background IDs and image mappings remain intact; the real City street is a new ref, not a replacement of the earlier Adventure city fantasy scene.

## Finding artwork

The existing chooser now has a sticky title/close/search/category area, real image previews, a live result count and a recoverable empty state. Sprite/costume categories: All, People, Animals, Things. Background categories: All, Places, Nature, Sports, Fantasy. Familiar aliases include adult, granny/grandmother, grandfather, bike, home, countryside/farm and galaxy. Search and category work together. Show all artwork clears both; reopening a chooser resets them. These browsing preferences are transient and never enter saved projects.

The grid retains four columns on desktop/tablet and two on phone. Buttons keep their meaningful accessible names; decorative images inside labelled selection controls do not repeat the names for screen readers. The established capacity-error fix still closes a rejected chooser and focuses reachable local/gallery recovery, including repeated errors.

## Artwork and persistence

Twenty new assets were generated with the built-in image tool, one call per asset. Twelve transparent 384×384 PNG sprites preserve native alpha. Eight full-frame 768×768 PNG backgrounds use open central areas suitable for actors; the new scene set is fictional illustration, not photographs of real locations. All images are copied into `public/images/studio/`; nothing relies on a generator-cache path at runtime.

Exact tool prompts are embedded in each shipping raster and recorded in:

- [Family/house prompts](assets/byte-lab-family-prompts.md)
- [Nature/transport/animal prop prompts](assets/byte-lab-story-props-prompts.md)
- [Eight scene prompts](assets/byte-lab-scene-prompts.md)

PNG was chosen for the scenes because the provenance utility uses an external sidecar for WebP. Unused experimental WebP files/sidecar were moved recoverably into ignored `output/byte-lab-scenes/unused-webp/`; no earlier shipping asset was removed or replaced. New shipping files are `{man,woman,grandma,grandpa,house,tree,bicycle,bus,rocket,horse,butterfly,fish}.png` and `{city-street,country-home,park,beach,classroom,space,underwater,forest}-scene.png`.

New artwork uses the same allowlisted references in project schemas, editor/runtime, drawing-copy bases and private gallery previews. Reference-only catalog artwork does not embed image bytes in a child's project, so selecting a built-in scene does not consume the imported-image data budget. Account saves, backups, course/class/student ownership and report exclusion remain unchanged. Guided course mascots and scenery are untouched. Frontend and backend must deploy together for shared validation; no database migration is required. No public sharing, external asset service, new child AI access or additional telemetry is introduced.

## Verification and status

Full frontend suite: 1,689 checks passed in 38 files, including all new refs, stable prior mappings, category partitioning, aliases and backup roundtrips. Production build and server TypeScript checks passed with existing nonfatal Zod annotation/large-chunk warnings. The full synthetic backend suite passed 141 checks in fourteen files, including new authenticated family/scenery reference roundtrips and report isolation. Its first run had three 10-second database-setup hook timeouts during concurrent work (121 passed/20 skipped); the complete rerun with a 30-second setup allowance passed, with no changed assertions or test-config/source workaround.

Scoped browser verification passed forty checks across desktop, Pixel 7 phone and iPad-size tablet, with two intentional desktop-only skips. This covers the existing dedicated editor and all asset/import/capacity tests plus the new family/prop choices, all eight scene images, aliases, category/empty/reset/reopen behavior, private save/reload/gallery thumbnails, drawing copies and backup roundtrips. Axe passed for the People/Places choosers; this is not complete assistive-technology certification. The current UI's fifteen story-library captures were inspected in one batched round; no material correction was identified by the builder. Broad platform browser regression remains paused.

Shipping raster provenance scan: 54 rasters, zero missing. Light/dark alpha contact sheets and square/landscape scene crops were inspected. One scoped detector run found zero primary issues/32 incumbent color/type/radius advisories; no system refresh or suppressions. The independent documentation comparison preserved global DESIGN.md/sidecar byte-for-byte; see `.impeccable/review/story-documentation.md`. The independent [finish review](../.impeccable/review/story-finish.md) returned SHIP at this extension's scope, with no mandatory corrections. Smaller optical fill of full-body people within existing thumbnails remains advisory, not a blocker. This is not broader platform release or accessibility certification. Work remains local and uncommitted/unpushed on `codex/auth`.
