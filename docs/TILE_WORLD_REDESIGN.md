# Playable 2D learning worlds — 9 October 2026

Scope: the learning platform only. Owner approved the Byte tile-world sample and confirmed purple navigation, the shared Blockly/Text workspace and mascot worlds. Landing pages, curriculum objectives, account/backend scope and saved progress remain unchanged. Main/V1 is not overwritten; work stays on `codex/new-visual-direction`.

## Direction contract

THESIS: a coding activity is a playable 2D world, not a board floating above unrelated scenery. Byte and his destination are visible before Play; obstacles match actual collision cells.

OWN-WORLD: the approved purple header, white editor, violet primary action, Fredoka headings and teal movement blocks frame authored top-down tile artwork. Preserve Blockly's real default connected silhouettes, not hand-built imitation blocks. Each mascot has its own terrain, sprite and destination.

STORY: choose a grade, review the concept once, build a program and watch the character advance one cell at a time while the executing block highlights. Retry briefly, or celebrate arrival. Existing music, narration, hints and protected best rewards stay functional.

FIRST VIEWPORT: compact purple navigation above a lesson/instructions/hints guide, challenge stage and editor in 20/35/45 desktop columns. Compact screens fold the guide over a 44/56 stage/editor row; narrow/short screens stack all three and scroll. Play stays below the stage. The live character, destination and square map sit on plain white without decorative scenery strips. The course drawer overlays the workspace. Course selection and lesson surfaces share the learning shell. Drawing retains smooth white paper and Dash's pencil.

FORM: user-pinned extension of the existing three-area learning workspace, no concept seed or new composition tournament. The approved Byte image is the tile-art and gameplay reference, not a static background to paste beneath unrelated coordinates. Generated six-slot packs provide path, hedge, rock, water, character and destination. Paths and collision data are semantic, variable by challenge. Do not manufacture a new Events curriculum; Pip can guide existing computer interaction practice while formal Events remains planned.

FINISH: the implemented learning extension is merged into the existing `DESIGN.md` and `.impeccable/design.json`. The prior tile-world review shipped its sole scored start-block contrast correction: white on `#a16908` (4.626:1), preserving native Blockly geometry. The latest layout reviewer disposition is ship for the article-space correction and drawer-overlay addition, as detailed below. Neither verdict certifies the whole platform.

## Asset production contract

Each PNG is a transparent 3-column by 2-row sprite sheet of six equal square slots, with no gaps. First row: full-square walkable ground, full-square impassable hedge/terrain, full-square impassable rocks/crate. Second row: full-square impassable water/obstacle, isolated full-body mascot, isolated destination object. Each slot is independently drawn; there is no complete scene baked in. Terrain viewed straight down, sprites readable flat 2D. Character and destination have real transparent margins. No lettering, labels, UI, borders, arrows or false checkerboard. Each generation prompt is retained beside and embedded in the PNG. Full image width/height must be 3:2 for CSS atlas indexing.

Characters: Byte robot / Robot City / lightning charging dock; Dash rabbit / Compass Canyon / carrot basket; Gigi gecko / Looping Jungle / glowing golden leaf; Fix fox / Bug Workshop / repaired tool chest; Milo monkey / Decision Jungle / banana basket; Nova squirrel / Treasure Grove / acorn basket; Pip parrot / Sound Garden / musical bell. Goals are explicit visual destinations; underlying completion rules are not replaced with new collecting mechanics.

## Implemented learning shell

The owner approved merging the learning-platform rules into the existing design system. Its identity primitives, master mark and illustrated public-page extension remain authoritative for their original scopes. Learning adds deep-purple navigation (`#241259`), Play violet (`#6237df`), lavender ground (`#eeebf8`) and dark purple ink (`#181339`), with white stage/editor panels. These and their supporting tokens are normative in `DESIGN.md` frontmatter. `.impeccable/design.json` extends them with layout, palette roles, shadows, breakpoints, scoped component previews and synchronized narrative.

`src/learning-world.css` scopes the extension to the learning shell and entry. Viewports wider than 1100px and taller than 600px keep a fixed 100dvh challenge workspace beneath a 68px toolbar. The main area has a 1440px maximum and 12px padding/gaps. Its three columns use `minmax(0,20fr) minmax(0,35fr) minmax(0,45fr)` for lesson/instructions/hints, challenge and editor. The desktop concept article scrolls within its own slot, with a 200px minimum; the whole guide can also scroll if long instructions and hints exceed the available height.

At widths 951–1100px and heights above 600px, the guide folds into a full-width row with a 44px header; expanded content scrolls within a 180px maximum. The stage/editor row uses 44/56 proportions. At widths up to 950px or heights up to 600px, guide, stage and editor stack in three rows and the page scrolls under a sticky toolbar. Folded/stacked guides begin collapsed until opened or a hint request. The existing tile-stage surround remains `clamp(320px,calc(100vw - 24px),560px)` and the editor remains 560px high when stacked. Portrait viewports up to 700px use the existing 108px toolbar; other narrow cases retain 56px, and wide short cases retain the 68px learning override. Lesson pages keep normal reading scroll.

The latest explicit owner request makes the drawer an overlay across all learning surfaces: `.learning-world.drawer-open .course-main` retains `margin-left: 0; width: 100%`. No desktop 280px space is reserved and no workspace panel is pushed or resized by opening it. Desktop remains nonmodal navigation; the existing mobile backdrop and focus trap are unchanged. This is a geometry correction, not new drawer semantics.

`ActivityGuide.tsx` retains concept prose and the worked example, authored activity instructions and progressive hints. Only the first challenge's concept auto-opens on wide desktop; later concepts start closed. Generated grade-context lines are not repeated because the toolbar already carries them. Authored instructions remain, with identical instruction/goal text rendered once within the guide. Hint requests expand the folded guide and bring the hint heading into view; progressive hint/star accounting and protected saved bests retain their existing behavior. Topic narration remains opt-in and reads the complete concept prose.

The live entry offers Grade 1–6 in a two-column card grid, becoming one column at 700px, with Computer Explorers across the full grid width. Suggested ages and board sizes guide choice; no birthday or account is collected. This supersedes the former age-grouped linked-row entry description.

The stage presents the mission and goal, mascot/world and named destination, a tile map, status and an optional Rows & columns overlay. Play and Reset stay below the stage; Reset keeps the code. The text-board alternative and live position description remain. The editor keeps Blockly's real draggable palette, connected canvas, native cap/notch/cavity shapes, execution highlighting, history, keyboard helpers and editable long-program overview. Footer command help and Clear code remain close to the canvas. Category colors are teal movement, violet loops, ochre start, amber conditionals and berry variables. Grades 5–6 can use the same workspace in Blocks or Text; Text remains a bounded interpreted teaching language, not full Python.

The square map is centred on white with a thin outline and no map shadow. Decorative `.world-scenery` strips are removed. The native Blockly flyout stays at .95 scale instead of shrinking its targets to fit the container height; longer palettes use native flyout scrolling and reflow on resize. Program-canvas fitting and the editable long-program overview remain separate. Held-pointer and drag guards retain gesture stability during fitting.

Drawing uses the same three-column/folded/stacked workspace, navigation, editor and Play position. Only its execution stage becomes smooth white paper with a dotted target, progressively revealed ink, Dash holding a pencil and a direction pointer. Drawing tools and independently saved practice progress retain their existing behavior.

## Mascot and curriculum boundaries

| Mascot | Current teaching role | World | Destination label |
| --- | --- | --- | --- |
| Byte the Robot | Sequences and projects | Robot City | Charging station |
| Dash the Rabbit | Directions/order and drawing | Compass Canyon | Carrot basket |
| Gigi the Gecko | Loops | Looping Jungle | Golden leaf |
| Fix the Fox | Debugging | Bug Workshop | Toolbox |
| Milo the Monkey | Conditionals | Decision Jungle | Banana basket |
| Nova the Squirrel | Variables | Treasure Grove | Acorn basket |
| Pip the Parrot | Computer Explorers | Sound Garden | Musical bell |

The Events lookup in `characters.ts` is not an implemented formal Events course. No new Events curriculum, collection/inventory mechanic, curriculum objective, account/backend integration or core progress scheme is introduced by the visual extension. Existing lessons, generated activities, topic journey, rewards, narration, sounds/music and local saved work remain in their established scope. Account/backend implementation remains deferred.

## Semantic maps and saved-work compatibility

`MissionStage.tsx` paints passable and blocked terrain from the same mission walls used for execution; hedge/rock/water choices are visual treatments of blocked cells. The current layout removes decorative strips outside the playable square. `worldMission.ts` creates route-shaped maps only for `tiles-v1` activities with a successful authored reference. It opens the reference route and destination, preserves the supplied debugging starter's valid wrong-turn evidence, and retains adjacent original clearance at conditional-test positions. It validates the reference against the transformed map and falls back to the original map when that cannot be proven. Activities without an authored reference and creative rescue projects retain original maps.

`storage.ts` adds optional per-activity `worldLayout` without changing save version or key. Fresh progress explicitly selects `tiles-v1`; old records with no value resolve to `open-v1` in `App.tsx`, preserving the collision map their programs were written for. Stored `tiles-v1` and `open-v1` values are retained during parsing. Per-grade progress, completed stars/bests, workspaces, text code and project endpoints keep the incumbent storage behavior. This is compatibility for existing saved programs, not a claim that old programs automatically translate to new layouts.

## Assets and provenance

Seven transparent world atlases ship at `public/images/worlds/byte.png`, `dash.png`, `gigi.png`, `fix.png`, `milo.png`, `nova.png` and `pip.png`. Each has its exact adjacent `.prompt.txt` source and embedded prompt provenance. Their 3:2 dimensions support the six-slot atlas contract above. This documentation pass did not rerun a raster scan. Dash's pencil drawing asset retains its separate provenance in `docs/DRAWING_ASSET.md`; the master SVG mark stays separate from generated artwork.

The three-column, palette and drawer correction adds no raster assets and changes no landing pages, curriculum objectives, backend/account implementation or save behavior. Main/V1 remains separate on the established branch arrangement.

## Verification and finish review

### Prior tile-world review

Supplied implementation verification: production build passed with the known Blockly bundle-size warning; 935 unit tests passed. A first browser batch passed 24 checks and the final browser batch passed 27 checks across desktop, phone and tablet. The contrast-fix recapture batch then passed all 18 browser checks. These are implementation results supplied to this documentation pass, not tests independently rerun by the documenter.

Prior reviewer disposition: **ship**. After the initial full review, the reviewer scored a single correction: start-block label contrast. The initial fill was corrected to `#a16908`, yielding 4.626:1 with white text; the native cap and connection geometry are unchanged. All 17 recaptures were valid and no correction regression was visible. That verdict closes the prior sole scored fix; it is not curriculum validation, whole-platform certification, a production-readiness verdict or a claim of complete Blockly accessibility.

### Latest three-column, palette and drawer review

Supplied implementation verification: the initial final browser batch passed 30 checks. The reviewer then found a P2 desktop article-space defect. Its correction batch passed 21 checks across curriculum-v2, three-column and palette-size, including complete narration and prose bounds. The later drawer-overlay addition passed three geometry checks across desktop, phone and tablet. The latest unit rerun passed all 935 tests across fourteen files in 8.81 seconds after the UI corrections. The latest production build passed, with 106.42KB CSS and the known 837.08KB Blockly-containing app chunk warning. These are supplied implementation results, not tests independently rerun by this documentation pass.

Final reviewer disposition: **ship** for the article-space correction and drawer-overlay addition only. Refreshed Byte, Grade 2, Text and Drawing captures show readable prose, complete narration and reachable instructions/hints; the overlay addition is resolved across all three device classes with the supplied geometry checks. No material fix regressions were observed. This scoped verdict does not certify the whole platform, curriculum or complete accessibility.

The scoped layout detector returned `[]` before and after the initial layout work, before the final review fix. It was not rerun during this documentation pass and is not evidence about unscanned later changes.

Evidence captures under `.impeccable/review/`: `three-column-grade2-{desktop,phone,tablet}.png`, `three-column-desktop-{byte,hint,milo}.png`, `three-column-phone-milo.png`, `three-column-compact.png`, `three-column-drawer-{desktop,phone,tablet}.png`, `v2-text-{desktop,phone,tablet}.png` and `v2-drawing-{desktop,phone,tablet}.png`.
