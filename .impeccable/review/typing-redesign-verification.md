# Typing practice redesign verification — 21 October 2026

Story: existing course → focused displayed passage → real keyboard/correction/line progression → existing accuracy/stars → separate public or assigned private progress → result/retry/map. No backend schema or curriculum change.

- `npx tsc -b --pretty false`: passed.
- Focused feedback + existing typing tests: 2 files / 9 passed.
- `npm test`: **94 files / 3,783 tests passed** (85.84s). This Vitest command includes the project's matching test paths, not a whole-platform browser certification.
- `npx playwright test e2e/typing.spec.ts e2e/typing-redesign.spec.ts --reporter=line`: **36 passed (3.1 minutes)** across desktop, phone and tablet. Actual direct keys, all four states, retained amber, line boundary progression, pause/focus/Tab, paste support, default/reduced motion, larger text, game/story/repair/writing, best stars, private save separation, corruption recovery and navigation guard.
- Both short pattern and larger senior text desktop footer bounds pass at 1306×656; active line does not overflow. Nine final senior/short/large captures across all three device classes opened and validated from document top after fonts settled. Normal senior desktop is 1440×1000; short/large desktop1306×656. Browser interaction fixtures are synthetic, including their measured WPM.
- First screenshot batch found a 20px short-desktop overflow and palms spilling behind bottom controls. One bounded layout correction followed by final device captures confirms the task/metrics/actions fit and the hands stay within guidance. No further builder polishing loop.
- Axe has no violations in the exercised initial drill, senior activity and result states. This does not certify screen-reader software/IME or touchscreen keyboard entry; direct practice expects a physical US-English keyboard. Native repair/composition retain input/selection.
- `npm run build` and `npm run check:server`: passed. Existing large-chunk and upstream Zod annotation warnings remain.
- One detector pass: exit0, 50 advisory only (35 type steps, 13 colors, 2 radii), recorded in `typing-redesign-detector.md`; no second scan.
- Reused typing/auth/reward image provenance scan: 8 rasters, zero missing. No new generated/stock raster.
- React quality check: component boundaries retain save/curriculum ownership; ResizeObserver, interval and preference listeners clean up; wrapping/state helpers are pure; no extra request, dependency, document-wide typing listener or source-text persistence introduced. Global header component/CSS remains unchanged.

Production-build smoke and fresh finish/documentation disposition are recorded as final amendments below. Public/private mocked browser boundaries are not a live production child-account test. No push, deployment, DB migration or hibernation performed.

## Final production-preview evidence

After the separate AppLabPreview queued-resize lifecycle fix and successful rebuild, an isolated browser at port4173 passed Grade3 entry/prediction-save/actual input greeting → same-document typing navigation → physical-key drill/five-star local result → senior passage input. Zero page errors. The final extra lifecycle regression passed3/3 devices; no typing source changed after its36-case matrix or nine valid captures.

The fresh typing finish review disposition is `ship` at this redesign's scope, with all nine captures inspected and no material typing fixes. It explicitly accepts clipped upcoming lines under the owner's brief while confirming active glyph visibility; the unavailable separate quality card is disclosed rather than invented. Documentation is complete in `typing-redesign-documentation.md`, with a source/system comparison and accurate dated PRODUCT/surface amendments. Neither this scoped review nor its Axe checks certify whole-platform accessibility, curriculum outcomes or production accounts.
