# Simple typing verification — 21 October 2026

Latest owner approval: simple EdClub-style lesson canvas, no large metric cards or Byte bubble, moving finger guide and keyboard clicks. This supersedes the previous typing visual signoff, not curriculum or saved-progress contracts.

- 42 browser tests passed across desktop, phone and tablet: typing-simple, typing-redesign and typing suites. Includes exact fingertip/key bounds, opposite Shift, correction history, mute/no-extra-audio-source behavior, focus-scoped keyboard navigation, larger text, completion, private/public storage separation, corrupt-save handling and original writing/repair flows.
- 13 focused unit tests passed across typingGuide, typingPractice and typing. Initial sandbox temporary-file error was rerun with the same tests outside the sandbox; the successful count is from that rerun.
- Production frontend build and server TypeScript checks passed. Existing large-chunk and upstream Zod annotation warnings remain.
- Final nine screenshots were opened: typing-simple-fingers, typing-simple-senior and typing-redesign-large, each desktop/phone/tablet. Desktop scenes use 1311×685 and 1306×656. Final desktop keyboard/hands/footer fit checks passed. One first screenshot round exposed hand length and footer height; the single correction batch precedes this final set.
- Six supplied-video reference frames were decoded and inspected. The extracted recording audio could not be auditioned in this harness. The local synthesized clicks are original, not an exact EdClub sonic-match claim.
- One detector pass is recorded separately. Independent visual review is pending; tests do not certify hand appearance or owner acceptance.

No EdClub frames or extracted audio ship in public assets. SVG hand geometry follows actual measured key rectangles; the stills alone cannot prove motion. Chromium interaction tests prove target updates; Firefox/Safari and real-device listening remain unverified.

Built production-preview smoke on port4173 typed `q w `, observed the next fingertip on E, toggled the sound button to its muted state and reported zero page errors. Provenance scan of public/images/typing, public/images/auth and public/images/rewards: 8 rasters, 0 missing metadata.

## First review-fix batch

The independent full review returned `fix`: hand contours, sliced next-line preview and superseding documentation. The batch joins fingers/palm into one continuous contour and deliberately hides inactive visual lines without shrinking the current type. Documentation was updated by the fresh documenter. Post-batch rerun: all 42 browser tests and 13 focused unit tests passed; frontend production build and server types passed. Repeated provenance scan: 8 rasters, 0 missing. Same nine scene captures were refreshed and opened. Three added Space-state captures were recaptured with animations disabled after the initial timing-invalid Space stills were rejected; the capture-only rerun passed 3 tests, and the replacement Space stills were opened and validated. The same reviewer's scoped verdict remains pending. No second detector was run.

## Second, Shift-only review-fix batch

The first verdict resolved text clipping and superseding records, while leaving Shift-finger form partial. The only further runtime edit deepens that finger's palm joint; measured tip coordinates, radius and other poses remain. Final rerun: 42/42 browser tests, 13 focused unit tests, frontend production build and server TypeScript passed. All12 same-view scene/Space captures were refreshed and opened as valid. Provenance scan remains 8/0missing. Production4173 smoke typed `Our `, advanced the active fingertip to G, muted sound and observed zero page errors. An initial immediate Shift count ran before the measured guide mounted; a settled visible-locator check was then used rather than treating that timing sample as a failure or verification. Final scoped review verdict pending; no second detector or unrelated source changes.

Final same-reviewer verdict: `ship`, all three listed fixes resolved. This verdict covers the scored fixes, not a new whole-surface audit, exact audio match or owner acceptance. The settled production-preview check confirmed one visible opposite-Shift target after the measured guide mounted. Documentation reconciliation follows this verdict.
