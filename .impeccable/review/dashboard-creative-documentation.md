# Dashboard creative access — documentation comparison

18 October 2026. Ordinary Operate extension of the incumbent **Build & Play** world. This record covers the assigned-grade dashboard links, direct art entry and the reviewed return-label correction. It does not approve the separately developing drag-to-resize request.

## Evidence and boundary

Read `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `.impeccable/surfaces/dashboard-creative-links.md`, `src/StudentCourses.tsx`, `src/student-dashboard.css`, the art-entry/navigation/drawing/free-build branches of `src/App.tsx`, and the optional `backLabel` uses in `src/DrawingLab.tsx`. Compared the relevant dashboard/DrawingLab source changes with their Git base; the larger App diff contains unrelated prior extensions and is not treated as this change's scope. Read `docs/DASHBOARD_CREATIVE_2026_10_18.md`, `docs/BYTE_LAB_BLOCK_COVERAGE_2026_10_18.md` and the fresh `dashboard-creative-finish.md` review.

Independently opened all six `dashboard-{creative,art}-{desktop,phone,tablet}.png` captures. They are valid rendered images. Desktop art visibly says “Back to dashboard”; phone/tablet art has the guide collapsed, so its hidden return label is supported by shared code and the supplied browser results, not visible pixels. Art captures show the existing white-paper stage, Dash, native blocks and Play below the stage. The phone art image is a viewport capture with the editor continuing below it, not evidence of the entire editor fitting onscreen.

The older-named `student-dashboard-desktop.png` and `student-dashboard-phone.png` were also opened, but now already contain Creative spaces. They are not an immutable before baseline. Incumbent identity comparison therefore relies on the preserved design artifacts, existing dashboard documentation and narrow source diff, rather than claiming a historical pixel comparison.

## Agreement with the incumbent

- Identity remains the approved violet/teal/yellow K, Fredoka heading voice, deep-purple header, lavender ground and white surfaces. Existing adventure artwork stays in the welcome/course areas; the new links introduce no raster, alternate identity or Code.org imitation.
- Creative spaces occupies a distinct section after welcome/account context and before course/help columns. Grade labels frame two plain linked choices; their title, explanatory caption and arrow make destinations legible without adding a navigation framework. Existing course progress, help and profile remain present.
- Links reuse incumbent account colors (`#372066`, `#575472`, white and `#f5f1ff`) and rounded form. The local 12px corners agree with the documented panel radius. The 64px minimum link height exceeds the incumbent 44px control minimum. At 700px the grade row becomes one column; wrapped choices stack without changing the lesson-panel breakpoint behavior. These are surface dimensions, not new global tokens.
- The dashboard derives choices from known assigned courses with drawing activities, deduplicates each course, and offers Byte Lab only at Grade 3 or above. `StudentActivity` still denies unassigned courses before loading work. Home/classroom learners use the same assignment path; no public-preview fallback or new permission is introduced.
- Direct art overrides stale lesson/quiz/navigation state, opens the existing `create` / Make it yours drawing, and exposes the grade's drawing choices. Drawing selects its own module and suppresses the free-build branch even when the saved mission was Byte Lab. Save IDs and the existing account/cloud path are reused. Reloading the explicit art route starts Make it yours; it does not promise to restore a different drawing selection.
- Direct student art supplies “Back to dashboard” to both the guide and final-drawing feedback, matching `backFromDrawing`'s destination. Ordinary course drawing retains the module fallback; the direct preview branch uses “Back to courses”. The fresh finish report resolves the single scored label/destination mismatch and records `disposition: ship`, with no material regression observed in that fix. Its verdict is limited to that correction.
- The block comparison is explicit about absent runtime capabilities, equivalent primitives, manually composed routines, editor controls and guided-only topics. It does not imply every pictured Code.org block exists, nor turn a comparison into authorization to implement all missing blocks. Drawing & Art remains code drawing; the separate costume/background paint tools are not presented as a new full paint application.

## Existing drift and limits

The dashboard already uses supporting purple/link/focus colors outside the global frontmatter and smaller utility type. The new divider (`#d7cee9`) and .8rem caption reuse those local conventions. The supplied detector reported zero primary findings and ten advisories; that is not a claim that the whole application has no design drift.

Global documentation still describes older learning proportions and a persistent guide while later product entries document the narrower desktop lesson rail. Its module-return drawing rule describes ordinary course entry; the direct dashboard return is a scoped extension, not a replacement for it. The sidecar is dated 9 October and its narrative omits some later Markdown Do rules. Historical PRODUCT paragraphs retain superseded local-only/backend and single-draft descriptions, with newer entries providing the current boundaries. These discrepancies predate this extension and were not repaired or promoted into new global guidance.

Implementation evidence supplied in the handoff and feature note: 1,713 frontend tests across 39 files, production build, server TypeScript check, 22 synthetic local PGlite progress tests and 18 browser checks across desktop/phone/tablet passed. Browser coverage includes destinations, saved ink/reload/return, stale quiz override, ordinary resume, younger/home learners, unassigned/empty cases and dashboard accessibility checks. These are supplied results; this documentation pass did not rerun tests, browser automation, detector or provenance scanning. They do not certify live Neon, production, complete keyboard/screen-reader Blockly editing or learning outcomes. Known bundle-size and upstream Zod PURE-comment warnings remain.

The supplied shipping-image scan reports 62 rasters and zero missing provenance prompts. This extension adds no imagery. Existing raster provenance was not independently rescanned here.

## Disposition and preservation

The completed extension agrees with the incumbent identity, palette roles, responsive dashboard hierarchy and existing drawing workflow, subject to the scoped choices and evidence limits above. No source, global design or sidecar repair is required for this documentation handoff. The separate resize work and any evolving files for it are outside this comparison.

Verified SHA-256 before this report: `DESIGN.md` = `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`; `.impeccable/design.json` = `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`. Both remain byte-for-byte unchanged. This documentation report is the only file written by this pass.
