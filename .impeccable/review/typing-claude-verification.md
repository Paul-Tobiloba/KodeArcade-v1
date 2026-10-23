# Claude typing interface verification

## Superseding post-fix and mascot/background evidence — 22 October 2026

The owner added an animated Byte typing at a laptop and the subtle scenic hero background. Source now uses the transparent four-pose 2×2 Byte sprite and faint lesson-sky raster, each with exact adjacent prompt text and embedded provenance. The .9s discrete typing/blink cycle stops for Pause, offscreen/hidden state and OS/application reduced motion. Mascot arm motion does not reinstate instructional keyboard hands. Current provenance scan: ten rasters, zero missing origins.

The fresh full finish review (`typing-claude-finish.md`) returned `fix` for error-state desktop height and stale “follow the hands” display copy. CSS now reserves feedback space and adjusts tall/compact height budgets; display wording now says “follow highlighted keys”/“Follow key guide” without changing IDs, targets, ordering, grading or saved results. Current frontend build/server types and thirteen focused units pass.

The updated full browser matrix after fixes/art returned 66 passed, two intentional desktop-only regression skips and one new regression fixture failure. That fixture reused the same mounted route/attempt across sizes. A test-only reset via the actual Try again control corrected it; the focused desktop rerun passed in 9.7s. Total evidence is 67 applicable checks passing across matrix plus rerun, not a single all-69-pass run. The focused case verifies the real four-state mixed correction sequence, visible recovery feedback/footer bounds at both desktop sizes, four computed sprite positions, Pause/resume and app/OS reduced motion. No application fix is attributed to the fixture reset.

Final port-4173 production smoke: zero captured page errors/external requests, no horizontal overflow/instructional hands, footer bottom 918.34375px within 941px on the wide viewport and 644.1875px within 656px on the laptop, with error feedback visible. Main reports all 22 existing evidence captures refreshed/opened and four new actual rendered `byte-typing-frame-{0,1,2,3}.png` captures opened; corrected map copy is visible. These are named local viewport/state checks, not an all-content/all-browser or live-account guarantee.

The scoped `typing-claude-verdict.md` resolved the original two fixes and authorized Byte/background scope, then found a new phone/tablet background overflow regression from fixed -24px decoration insets. The source correction changes only decorative `inset-inline` to -18px at 1000px and -12px at 600px, matching responsive main padding; it does not clip the interactive page. Platform/simple post-correction suites: 19 passed, two intentional desktop-only skips across 21 cases, including decoration left ≥ 0/right ≤ viewport assertions on all three device classes and desktop height/motion. Main reports the same nine affected captures refreshed/opened, restored practice widths (1082px phone/1620px tablet) and no extra right strip. Final rebuild, server types and git diff check pass. The reviewer reopened all nine final affected captures and returned scoped `ship` in `typing-claude-verdict.md`, closing the two original fixes, authorized Byte/scenery addition and responsive correction. It is not a new whole-surface certification or owner acceptance.

Earlier full/scoped `fix`, ordinary-state 66/66 and first 53/63 history remain history; no first-run all-pass or owner acceptance is claimed. The one detector predates the new assets; no second run is claimed. No deployment, live-account, software-keyboard/IME or physical audio-output claim.

## Historical pre-extension implementation record

Scope: supplied `typing-design.html` adapted to existing KodeArcade behavior, navy account-aware platform header, light body, no hand artwork. No deployment, live-account or physical audio-output claim.

- Unit tests: 13 passed across typing, practice and guide suites.
- Production build and server TypeScript check: passed. Existing dependency annotation/chunk-size warnings remain.
- Browser matrix: 66 passed across typing-platform, typing-simple, typing-redesign, typing and learning-entry-labs suites, desktop/phone/tablet. Includes private student progress isolation, account navigation, corrections, rewards, keyboard sound/mute controls, settings and accessibility.
- Initial matrix: 53 passed, 10 failed. One bounded correction addressed short desktop fit, isolated synthetic principal fixtures and the cold Artist route test wait. The final 66 includes separate adult/learner fixture cases.
- Actual built preview on port 4173: correct navy header, forced light scheme under dark OS, no hand artwork, correct/corrected/incorrect/current states; no captured page errors or external HTTP requests.
- Historical additional built-preview defect: recovery feedback expanded the page; footer bottom 982.53 at 1672×941 and 675.375 at 1306×656. Baseline browser success did not establish all-state fit. The correction, final local evidence and scoped closure are recorded above.
- One detector pass: 81 findings (4 supplied-font warnings, 77 type/color/radius advisories); scoped supplied font choices documented. No second detector pass.
- Existing raster provenance: 7 scanned, 0 missing; no new raster assets. Supplied Baloo 2/Nunito fonts hosted locally with licenses/source record.

Main inspected all 22 current evidence files in `.impeccable/review/`: `typing-claude-practice`, `typing-claude-result`, `typing-claude-map`, `typing-claude-preview-adult`, `typing-claude-preview-learner`, and `typing-claude-private-menu`, each with desktop/phone/tablet suffix; `typing-claude-built-wide.png`, `typing-claude-built-laptop.png`, `typing-simple-senior-desktop.png`, and `typing-simple-senior-phone.png`. Captures are valid current evidence, not owner approval.
