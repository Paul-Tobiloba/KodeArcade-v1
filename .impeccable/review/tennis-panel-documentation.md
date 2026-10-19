# Tennis and lesson panel — documentation comparison

Date: 18 October 2026. Scope: the incumbent Operate surface extension defined in `.impeccable/surfaces/tennis-lesson-panel.md`, the current opening entry in `PRODUCT.md`, and `docs/TENNIS_LESSON_PANEL_2026_10_18.md`.

## Verdict

The scoped implementation and documentation agree. Tennis is an editable Byte Lab starter, and the guided lesson panel changes only on wide desktop. The existing visual system remains recognizable. No replacement visual world, new global token scale or global component library is needed for this extension.

Preserve `DESIGN.md` and `.impeccable/design.json`. Their older desktop-column description and guide preview have drifted from this extension; report that difference without repairing it as a side effect. The dated surface contract and implementation note state the current behavior precisely.

## Comparison

| Contract | Representative implementation and evidence | Result |
| --- | --- | --- |
| Existing violet/lilac learning shell, system reading type, bordered white workspaces and native Blockly geometry | `src/learning-world.css` retains the learning colors, 16px workspace corners and shared visible focus rule. Existing desktop and phone captures retain these treatments. Tennis uses normal connected Blockly blocks. | Consistent with incumbent design primitives. |
| Narrower desktop guide, with a recoverable lesson rail | The media rule at `src/learning-world.css:210` applies at width ≥1101px and height ≥601px. It uses `clamp(240px,20vw,288px)`, a 56px collapsed column, and a 2:3 ratio for the remaining stage/editor columns. Expanded and collapsed desktop captures show the reclaimed space. | Matches current surface contract. |
| Reachable minimize/expand control and retained reading state | `src/ActivityGuide.tsx` uses a native button with changing accessible label, `aria-expanded` and `aria-controls`; CSS gives it a 44×44px target. Content remains mounted with `hidden`, rather than being conditionally removed. Hint and Read lesson requests clear collapse. `src/App.tsx:304` keys the guide by mission ID, resetting it for a new challenge. | Implementation supports the documented state model; behavior testing is supplied evidence below. |
| Explicit mobile/tablet constraint: retain current view | The new rail styling sits inside the wide-desktop media query; the compact accordion branch remains in `ActivityGuide`. Existing folded/stacked CSS remains outside that new rule. The phone capture shows the incumbent Lesson & instructions accordion, Ask Byte and stacked stage. | No mobile redesign documented or observed in the representative evidence. |
| Tour help must target something visible | `src/WorkspaceTour.tsx` targets `.activity-guide-header, .activity-guide-toggle` for the help step. | Matches the visible desktop header/rail and compact accordion. |
| Tennis is an inspectable arcade sample | `src/studioGameStarters.ts:33` creates the ball, bottom player racket and top opponent racket with generic position, touching, condition, variable, wait and stop blocks. Opponent misses add score and relaunch; player misses stop the rally. `src/studioStarters.ts:7` explains movement and editable speed. The desktop capture shows 55/64 ball blocks and the read-only JavaScript-style learning view. | Documentation correctly avoids claiming a full tennis match or executable standalone JavaScript. |
| Add two sports choices without changing guided mascots or backgrounds | `src/studioCatalog.ts` adds TennisBall and TennisRacket to the free-build catalog and reuses the existing tennis-court reference. Current product/implementation notes record 35 choices and 19 backgrounds. | Correctly scoped as catalog choices, not simultaneous actor capacity. |
| Asset provenance and native transparency | `docs/assets/byte-lab-tennis-prompts.md` records exact prompts, original generated paths, final 384×384 PNG paths, alpha validation and light/dark QA paths. The tennis capture shows coherent ball/racket art against the court and white sprite choices. | Provenance is documented; this pass did not regenerate or transform assets. |

## Global documentation drift — reported only

1. `DESIGN.md` Overview and Layout still describe wide-desktop lesson/stage/editor columns as 25/30/45. The current local contract supersedes that arrangement with the bounded guide width, optional 56px rail and 2:3 remainder. The underlying desktop breakpoint, palette, typography, focus treatment and workspace shape remain applicable.
2. `.impeccable/design.json` repeats the 25/30/45 layout in `extensions.learningWorld.layout.desktop` and `narrative.overview`. Its “Learning activity guide” example is a static 340px preview without the new minimize/expand control. It therefore illustrates the earlier guide, not the current desktop behavior.
3. The global files contain historical product-availability statements and do not describe the newer Byte Lab library in full. This task's dated product entry and implementation note carry current tennis/catalog facts. These historical passages are not evidence of a new implementation regression and were not refreshed here.

No global overwrite, merge, sidecar refresh, drift repair or qualitative-language interview was undertaken. This is a comparison report for an ordinary extension, not a request to regenerate the design system.

## Evidence and verification limits

Independent documentation inspection covered the surface contract, current product/implementation entries, global design guidance, the representative source paths above and the tennis prompt manifest. This pass opened four existing captures: `lesson-panel-expanded-desktop.png`, `lesson-panel-collapsed-desktop.png`, `lesson-panel-unchanged-phone.png` and `games-tennis-desktop.png`. They are valid rendered evidence with readable interface content. This was a representative documentation comparison, not a new defect hunt or a new browser run.

The builder separately supplied eight opened current captures, including the 1308px collapsed guide and unchanged tablet view, plus tennis on desktop/phone/tablet. Supplied checks: 1711 frontend tests across 39 files, a 54-test focused subset, 22 synthetic progress-backend tests, server compilation and production build. The focused subset is not an additional 54 unique tests to add to the full frontend total. Backend evidence includes the tennis gallery save/read path, assignment/ownership rejection and report exclusion, using synthetic PGlite/HTTP data.

Supplied browser coverage spans 27 unique scoped cases across split game, sidebar and library runs. An initial desktop test asserted during speech before the following Stop block; its assertion was corrected to wait for Run to re-enable. One tablet function case encountered a trace-artifact ENOENT in teardown when parallel processes shared `test-results`; the isolated rerun passed in 7.9 seconds. The other 26 scoped cases passed. These are supplied results, not checks rerun by this documentation pass.

The builder reports one scoped detector pass: a pre-existing byte-bounce warning plus incumbent/reused palette, type and radius advisories. The supplied image-provenance scan found 62 rasters with zero missing prompts. Neither scan was repeated here.

Read the completed independent finish report, `tennis-panel-finish.md`: disposition **ship**, with no material finding or correction required. That reviewer inspected all eight current captures, the original user screenshot, both asset QA sheets and representative source. Its scoped verdict agrees with this documentation comparison and preserves the same global-document drift boundary. The builder additionally supplied a final successful production build and read-only live UI HTTP 200/API health checks, without account writes.

Broader platform regression remains user-paused. Work is local, uncommitted and unpushed on `codex/auth`; frontend/backend must deploy together for shared tennis/art validation. There is no database migration. Supplied account/browser responses and backend data were synthetic; no live pupil-data or damage-state claim is made. This report does not certify the whole platform, curriculum or accessibility.

## Preservation check

SHA-256 hashes read during this pass match the provided baselines exactly:

- `DESIGN.md`: `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`
- `.impeccable/design.json`: `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`

Only `.impeccable/review/tennis-panel-documentation.md` was written by this pass. Source, assets, product documentation and both global design files were preserved.
