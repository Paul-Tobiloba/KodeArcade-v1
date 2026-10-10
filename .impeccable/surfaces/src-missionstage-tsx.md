---
version: 1
slug: "src-missionstage-tsx"
primary_target: "src/MissionStage.tsx"
related_targets: ["src/App.tsx","src/ActivityGuide.tsx","src/BlockEditor.tsx","src/LearningEntry.tsx","src/CharacterSprite.tsx","src/DrawingLab.tsx","src/learning-world.css"]
---

# Playable 2D learning worlds — 9 October 2026

Scope: the learning platform only. Owner approved the Byte tile-world sample and confirmed purple navigation, the shared Blockly/Text workspace and mascot worlds. Landing pages, curriculum objectives, account/backend scope and saved progress remain unchanged. Main/V1 is not overwritten; work stays on `codex/new-visual-direction`.

## Direction contract

THESIS: a coding activity is a playable 2D world, not a board floating above unrelated scenery. Byte and his destination are visible before Play; obstacles match actual collision cells.

OWN-WORLD: the approved purple header, white editor, violet primary action, Fredoka headings and teal movement blocks frame authored top-down tile artwork. Preserve Blockly's real default connected silhouettes, not hand-built imitation blocks. Each mascot has its own terrain, sprite and destination.

STORY: choose a grade, review the concept once, build a program and watch the character advance one cell at a time while the executing block highlights. Retry briefly, or celebrate arrival. Existing music, narration, hints and protected best rewards stay functional.

FIRST VIEWPORT: compact purple navigation above a lesson/instructions/hints guide, challenge stage and editor in 25/30/45 desktop columns. Compact screens fold the guide over a 44/56 stage/editor row; narrow/short screens stack all three and scroll. Play stays below the stage. The live character, destination and square map sit on plain white without decorative scenery strips. The course drawer overlays the workspace. Course selection and lesson surfaces share the learning shell. Drawing retains smooth white paper and Dash's pencil.

FORM: user-pinned extension of the existing three-area learning workspace, no concept seed or new composition tournament. The approved Byte image is the tile-art and gameplay reference, not a static background to paste beneath unrelated coordinates. Generated six-slot packs provide path, hedge, rock, water, character and destination. Paths and collision data are semantic, variable by challenge. Do not manufacture a new Events curriculum; Pip can guide existing computer interaction practice while formal Events remains planned.

FINISH: implemented and documented in `DESIGN.md`, `.impeccable/design.json` and `docs/TILE_WORLD_REDESIGN.md`. Prior review shipped the sole scored start-block contrast correction: white on `#a16908` (4.626:1), with native geometry preserved; all 17 recaptures were valid without visible correction regression. Latest reviewer disposition is ship for the article-space correction and drawer-overlay addition only: readable prose, complete narration and reachable instructions/hints in refreshed Byte/Grade 2/Text/Drawing, with overlay geometry confirmed across desktop/phone/tablet and no material fix regressions observed. Neither verdict certifies the whole platform, curriculum or accessibility.

## Approved responsive workspace

MODE: Operate. The learner needs readable teaching, a useful execution stage and native Blockly targets inside one clean workspace.

Desktop width >1100px and height >600px: fixed 100dvh, 68px toolbar, main maximum 1440px, 12px padding/gaps, three `minmax(0,25fr) minmax(0,30fr) minmax(0,45fr)` columns for guide / challenge / editor. The concept article expands at its natural height and pushes instructions and hints down within one scrollable guide column, without a nested article scrollbar. First challenge concept auto-opens only here; later concepts start closed.

Width 951–1100px and height >600px: full-row folded guide with a 44px header and expanded scroll content capped at 180px; stage/editor use 44/56 proportions. Width <=950px or height <=600px: guide, stage and editor form three stacked rows with page scroll; stage clamp and 560px editor remain. Folded guides stay collapsed until opened or a hint request. Drawing retains the same shell and its smooth white paper with Dash.

The guide retains authored instructions, suppresses generic generated grade context already present in the toolbar and renders identical instruction/goal text once within the guide. Progressive hints retain existing star accounting and protected bests. Narration is opt-in and reads complete concept prose.

The actual square map is centred on white with a thin outline, no map shadow and no decorative `.world-scenery` strips. Native Blockly flyout blocks stay at .95 scale instead of height-fitting to tiny targets; long palettes scroll natively and reflow on resize. Existing program overview and held-pointer/drag stability remain.

Drawer-open learning main keeps margin-left 0 and width 100%; desktop's reserved 280px is removed. Desktop remains a nonmodal navigation overlay; mobile's existing backdrop and focus trap are unchanged. No new drawer semantics, landing/curriculum/backend/save changes or raster assets belong to this layout turn. Main/V1 is not overwritten.

Supplied evidence: initial final browser batch 30 passed; article correction batch 21 passed; drawer geometry 3 passed across desktop/phone/tablet. Latest unit rerun: 935 passed across fourteen files after all UI corrections. Latest build passed with the known 837.08KB app/Blockly chunk warning. Scoped detector returned `[]` before/after the initial layout work, before the final review fix; not rerun by the documenter. Captures and full scoped review history are in `docs/TILE_WORLD_REDESIGN.md`.

## Character motion and sound — 10 October

The board and editor remain fixed while a keyed inner sprite wrapper bobs/hops/scampers for each 460ms step. Byte, Dash, Gigi, Fix, Milo and Nova each use a distinct motion, with ground shadow, brief dust and active-run goal/water ripples. Successful route arrival is visible for 900ms before the stars: bounded mascot dance, destination light and four sparks. Byte and its charging station brighten. Character startup calls and happy arrivals obey the existing local sound preference; Milo's oo/ah chatter is synthesized with a bandpass vowel resonance, not a recording. Drawing has a tiny pencil-tip-anchored sway. Offscreen/hidden stages pause decorative loops, and reduced motion retains static success colour/status without spatial effects. Stop/reset cancels pending feedback without altering existing attempt accounting.

The shared initial/lazy-route loading screen uses the approved K's exact path geometry, in three 1800ms assembly cycles, then settles. System reduced motion shows a static mark; readiness removes the loader immediately without a forced delay. No raster assets changed.

Verification for this motion/loading pass: production build passed (known Blockly chunk warning); 937 unit tests passed across fourteen files. Browser coverage: 36 mascot/reward/sound/loading checks passed in the initial desktop/phone/tablet batch, six typed-code/drawing regression checks passed, and two corrected full-offscreen pause/resume checks passed. One desktop offscreen check is intentionally skipped because the desktop layout keeps all columns visible. The first pause test scrolled to the editor while part of the stage was still visible; its corrected fixture scrolls the entire stage out of view. Byte/Milo movement and arrival captures and K-loader captures were inspected at desktop and phone sizes. These are scoped functional/visual checks, not whole-platform certification.

## Asset production contract

Each PNG is a transparent 3-column by 2-row sprite sheet of six equal square slots, with no gaps. First row: full-square walkable ground, full-square impassable hedge/terrain, full-square impassable rocks/crate. Second row: full-square impassable water/obstacle, isolated full-body mascot, isolated destination object. Each slot is independently drawn; there is no complete scene baked in. Terrain viewed straight down, sprites readable flat 2D. Character and destination have real transparent margins. No lettering, labels, UI, borders, arrows or false checkerboard. Each generation prompt is retained beside and embedded in the PNG. Full image width/height must be 3:2 for CSS atlas indexing.

Characters: Byte robot / Robot City / lightning charging dock; Dash rabbit / Compass Canyon / carrot basket; Gigi gecko / Looping Jungle / glowing golden leaf; Fix fox / Bug Workshop / repaired tool chest; Milo monkey / Decision Jungle / banana basket; Nova squirrel / Treasure Grove / acorn basket; Pip parrot / Sound Garden / musical bell. Goals are explicit visual destinations; underlying completion rules are not replaced with new collecting mechanics.
