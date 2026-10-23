# Grade 3 App Lab verification — 21 October 2026

- Focused App Lab practical + existing practical unit tests: 14 passed.
- `npm test`: supplied completed output 93 files / 3,780 tests passed. This Vitest command is not a whole-platform browser/account certification.
- Isolated progress API suite: 26 passed, including Grade 3 save/read, wrong-grade rejection, unassigned denial and old-client omission preservation.
- `npx playwright test e2e/app-practical.spec.ts e2e/coding-practical.spec.ts --reporter=line`: **30 passed (4.2 minutes)** across desktop, phone and tablet. Includes actual blocks/text editing, live inputs/reset, re-run requirement, supported/independent checks, private navigation flush, unfinished/corrupt drafts, native dialog/Escape/focus/Axe, and Grade 2/4 regression paths.
- `npm run build` and `npm run check:server`: passed. Existing large-chunk and upstream Zod annotation warnings remain.
- Validated all nine `app-practical-{work,practice,mastery}-{desktop,phone,tablet}.png` captures. Initial desktop palette expanded the editor; one bounded CSS correction and refreshed batch confirmed internal toolbox/program scrolling. Phone/tablet retain natural vertical stacking with no page horizontal overflow. No further self-polish loop.
- One detector pass: three advisories, documented in `app-practical-detector.md`.
- Existing studio/world/reward asset provenance scan: 44 rasters, zero missing; no new raster for this unit.

Fresh finish review and documentation disposition are recorded separately. Public fixtures and mocked browser student APIs are synthetic; isolated API tests do not establish a production-account deployment. No push, deployment, DB migration or hibernation performed.

## Final lifecycle amendment

The built-preview cross-route smoke exposed a reused AppLabPreview ResizeObserver callback dereferencing a nulled ref after unmount. It now captures the mounted node and clears an active guard before observer disconnect. The added deliberately queued-resize navigation regression passed on desktop, phone and tablet: **3 passed (18.5s)**. The production build passed again, and an isolated browser against port4173 confirmed course entry, prediction save, real nickname greeting, same-document navigation to typing, physical keys/five-star local save and senior passage input with **zero page errors**. The fresh reviewer scored this one lifecycle fix resolved and appended a bounded `ship` verdict; it is not a new whole-platform review.
