---
name: KodeArcade
description: Play. Build. Learn.
colors:
  violet: "#6d4aff"
  violet-dark: "#5332d6"
  brand-teal: "#0f9f8f"
  brand-yellow: "#f6c445"
  teal: "#08796e"
  ink: "#172033"
  cloud: "#f7f8fc"
  surface: "#ffffff"
  muted: "#586477"
  line: "#e1e5ee"
  drawer: "#111827"
  selected-module: "#2d2650"
  concept-bg: "#ede8ff"
  concept-text: "#5136ab"
  learning-nav: "#241259"
  learning-action: "#6237df"
  learning-ground: "#eeebf8"
  typing-light-top: "#f8f6ff"
  typing-light-bottom: "#eeeafc"
  typing-action: "#6d3fe0"
  typing-ink: "#241a4d"
  typing-muted: "#665b83"
  typing-line: "#dfd6f3"
  typing-current: "#7743e8"
  typing-correct: "#166534"
  typing-mistake: "#991b1b"
  typing-corrected: "#854d0e"
  learning-ink: "#181339"
  learning-muted: "#575472"
  learning-line: "#ded9ed"
  learning-panel-line: "#c6b6e8"
  learning-editor-ground: "#f7f4fe"
  learning-drawer: "#1d1638"
  learning-nav-control: "#352269"
  learning-focus: "#986cf5"
  learning-nav-focus: "#ffe28c"
  block-start: "#a16908"
  block-conditional: "#b85a09"
  block-variable: "#b53e75"
typography:
  headline:
    fontFamily: "Fredoka, 'Segoe UI', sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-.02em"
  wordmark:
    fontFamily: "Fredoka, 'Segoe UI', sans-serif"
    fontSize: "1.65rem"
    fontWeight: 600
    lineHeight: 1
  body:
    fontFamily: "'Segoe UI', ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Segoe UI', ui-sans-serif, system-ui, sans-serif"
    fontSize: ".875rem"
    fontWeight: 600
  learning-entry-headline:
    fontFamily: "Fredoka, 'Segoe UI', sans-serif"
    fontSize: "clamp(2rem,4vw,3rem)"
    fontWeight: 750
    lineHeight: 1.18
    letterSpacing: "-.035em"
  learning-stage-title:
    fontFamily: "Fredoka, sans-serif"
    fontSize: "clamp(1.05rem,1.6vw,1.45rem)"
    lineHeight: 1.2
  learning-guide-reading:
    fontFamily: "'Segoe UI', ui-sans-serif, system-ui, sans-serif"
    fontSize: ".875rem"
    lineHeight: 1.6
  typing-lesson-headline:
    fontFamily: "'Baloo 2', Fredoka, sans-serif"
    fontSize: "clamp(1.9rem,2.7vw,2.8rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-.02em"
  typing-reading:
    fontFamily: "Nunito, 'Segoe UI', sans-serif"
    fontSize: ".875rem"
    fontWeight: 700
  typing-key-label:
    fontFamily: "Nunito, sans-serif"
    fontSize: ".875rem"
    fontWeight: 700
    lineHeight: 1.1
  typing-beginner-tile:
    fontFamily: "'Baloo 2', sans-serif"
    fontSize: "3.6rem"
    fontWeight: 800
    lineHeight: 1
rounded:
  chip: "5px"
  field: "7px"
  button: "8px"
  panel: "12px"
  workspace: "14px"
  dialog: "16px"
  learning-play: "10px"
  typing-stage: "20px"
  typing-panel: "16px"
  typing-metric: "14px"
spacing:
  small: "8px"
  control-gap: "10px"
  compact: "12px"
  medium: "16px"
  panel: "20px"
  large: "24px"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.violet-dark}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "10px 14px"
  nickname-field:
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px"
  lesson-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px"
  concept-chip:
    backgroundColor: "{colors.concept-bg}"
    textColor: "{colors.concept-text}"
    rounded: "{rounded.chip}"
    padding: "5px 9px"
  learning-play:
    backgroundColor: "{colors.learning-action}"
    textColor: "{colors.surface}"
    rounded: "{rounded.learning-play}"
    padding: "12px 18px"
    height: "48px"
  learning-nav:
    backgroundColor: "{colors.learning-nav}"
    textColor: "{colors.surface}"
    height: "68px"
  learning-workspace:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.learning-ink}"
    rounded: "{rounded.dialog}"
  learning-grade-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.learning-ink}"
    rounded: "{rounded.workspace}"
    padding: "22px"
  learning-activity-guide:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.learning-ink}"
    rounded: "{rounded.dialog}"
    typography: "{typography.learning-guide-reading}"
  learning-guide-heading:
    backgroundColor: "{colors.learning-editor-ground}"
    textColor: "{colors.learning-nav}"
    padding: "16px"
    height: "62px"
  typing-stage:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.typing-ink}"
    rounded: "{rounded.typing-stage}"
    padding: "13px 18px 11px"
  typing-current-key:
    backgroundColor: "{colors.typing-current}"
    textColor: "{colors.surface}"
    rounded: "{rounded.field}"
    typography: "{typography.typing-key-label}"
  typing-finger-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.typing-muted}"
    rounded: "{rounded.typing-panel}"
    padding: "12px 10px"
---

# Design System: KodeArcade

## Overview

**Creative North Star: "Build & Play"**

A friendly K assembled from coding blocks connects making with play. Violet, teal and yellow carry the identity against ink lettering and cloud backgrounds. The approved extension adds a consistent mark, wordmark and heading voice to the existing learning application.

The working surface stays legible and task-focused: a quiet lesson or mission heading, a visible execution stage, and a block editor. Flat geometry and rounded corners support the playful identity without competing with the learner's program.

The approved 9 October learning extension makes each coding activity a playable top-down tile world. Deep purple navigation frames white workspaces on pale lavender ground; the live mascot, walkable path, obstacles and destination share one meaningful map. The same shell carries grade selection, lessons, Blockly and bounded typed practice; drawing changes the stage to smooth white paper with Dash's pencil.

The approved learning layout keeps lesson, activity instructions and progressive hints beside a smaller execution stage and the editor. Wide screens devote 25/30/45 of the workspace columns to those roles. The article expands in normal flow, pushing activity instructions and hints down within one scrollable guide column. The square map is centred on white, and the native Blockly palette keeps readable targets as the workspace changes size. The course drawer overlays the learning workspace without moving its panels.

The superseding 22 October typing direction adapts the owner's supplied `typing-design.html`: a friendly Byte lesson hero, real progress/accuracy/streak, a bounded white practice panel and broad keyboard with textual finger panels. The latest owner direction rejects the animation's quality/smoothness and permits a still: the hero now uses one crisp static Byte behind a lavender laptop, with the faint scenic backdrop retained. The actual navy platform header carries the approved K and Fredoka wordmark across typing map, practice and results, including previews and signed-in sessions. The activity stays light under either OS color preference. Baloo 2 and Nunito are intentional route-local roles from the supplied implementation; this does not replace incumbent brand, coding or public-page typography. Instructional hand guides remain removed; Byte is decorative still artwork. The abandoned articulated guide, rejected sprite animation and their earlier scoped reviews remain history, not owner acceptance of those candidates.

**Key Characteristics:**

- A consistent three-piece block-built K.
- Fredoka for the wordmark and principal course heading; system type for reading and controls.
- Light bordered workspaces and a dark course drawer.
- Visible focus and reduced-motion support.
- Purple learning navigation and readable white workspaces around semantic mascot tile worlds.
- A persistent wide-screen lesson guide, smaller stage and readable native Blockly palette.
- A scoped light typing lesson with supplied Baloo 2/Nunito lettering, meaningful feedback, broad keyboard and textual finger panels.

This captures `src/styles.css`, `src/course.css`, `src/brand.css` and the approved scope in `docs/BRAND_IMPLEMENTATION.md` on 5 October 2026. It documents the current application and a small identity extension, not a new page composition.

Learning overrides additionally capture `src/learning-world.css`, `src/App.tsx`, `src/MissionStage.tsx`, `src/CharacterSprite.tsx`, `src/LearningEntry.tsx`, `src/DrawingLab.tsx` and `src/blockly.ts` on 9 October. Their scoped tokens supplement the incumbent primitives; they do not change the mark or public-page identity. Detailed implementation and compatibility evidence is in `docs/TILE_WORLD_REDESIGN.md`.

The 7 October public-page extension carries Build & Play into the user-approved Byte adventure world: pastel clouds, violet floating islands, teal waterfalls and small golden goals. It preserves the incumbent identity and learning-workspace rules. Its page composition and code-led reference decisions live in `docs/ILLUSTRATED_PAGES.md`; this is an extension, not a replacement visual world.

## Colors

The palette combines expressive identity accents with darker functional colors for readable controls.

Public pages use scoped cloud ground (#f8faff), deep ink (#101333) and action violet (#6840f5), as implemented in `src/landing.css`. These public-page values do not replace the learning primitives in the frontmatter. White translucent panels and pale violet borders keep HTML readable over the artwork.

### Primary

- **Violet:** primary actions and the main logo block. Violet-dark supplies hover and focus treatments.
- **Learning navigation purple and learning action violet:** the learning shell and Play control respectively. Their scoped tokens apply only to learning; ordinary primary controls retain the incumbent violet unless explicitly overridden.

### Secondary

- **Brand teal:** the mark's creation accent.
- **Functional teal:** the darker movement-block and scene accent used with white text.

### Tertiary

- **Brand yellow:** a playful mark accent and supporting illustration detail.
- **Start ochre, conditional amber and variable berry:** Blockly category fills. Movement retains functional teal; loops retain incumbent violet. The start block uses white lettering on start ochre after the contrast review correction.

### Neutral

- **Ink:** wordmark and primary text.
- **Cloud:** application canvas; surface white provides workspace and dialog contrast.
- **Muted and line:** supporting copy and quiet borders.
- **Drawer and selected-module:** dark navigation and its violet-tinted current state.
- **Learning ground, ink, muted and line:** scoped lavender canvas, dark purple text, supporting copy and borders. Learning workspaces remain surface white, with a pale editor heading and darker panel border. Learning drawer and navigation-control fills keep navigation distinct from the stage.
- **Learning focus and navigation focus:** violet outlines on light learning surfaces and warm yellow outlines inside purple navigation.
- **Typing light top/bottom, ink, muted and line:** owner-supplied light violet atmosphere, dark readable lettering and quiet panel separation, scoped to the typing route. White panels sit over its vertical ground gradient.
- **Typing action and current:** violet controls and the next/current key cue; the current cue also uses a visible outline. Typing correct, mistake and corrected shades retain green/red/amber feedback with underline, dotted edge or outline cues rather than color alone.

**The Accent Legibility Rule.** Bright brand teal and yellow are identity accents, not small text colors on white; retain functional teal for readable block labels.

**The Semantic Terrain Rule.** Every painted obstacle inside the playable map represents a collision cell; a walkable tile represents open ground. Decorative scenery outside the map never creates a second route or hidden collision rule.

## Typography

Fredoka is the locally hosted display face with a system fallback. The current course implementation applies it to the wordmark, h1 and stage/editor headings; lesson reading, Blockly labels and controls retain system type. Extend the display voice deliberately rather than changing every text role at once.

The principal heading uses the headline token and reduces to 1.7rem at the narrow breakpoint. The wordmark reduces to 1.3rem at 620px and 1.1rem at 360px. Lesson prose uses .93rem with 1.8 line-height and a maximum of 72ch; the introduction uses 1.075rem with 1.85 line-height and 70ch. The global 16px size is a root reference, not the size of every paragraph.

**The Reading Voice Rule.** Preserve the plain system face for incumbent instructions and controls; the supplied typing interface alone uses its scoped Nunito reading/control roles. The tagline is exactly “Play. Build. Learn.”

Public pages extend Fredoka to expressive hero and section headings. Body copy, navigation, course-card titles and step-card titles keep system type. The public hero uses responsive display sizing; learning headings and reading widths retain their own rules.

Learning entry uses its scoped responsive Fredoka headline token. Tile-stage mission titles use the scoped Fredoka title token; editor headings also use Fredoka at 1.2rem, inherited from the course heading rules. Play uses system type at 1.15rem, goal copy at .875rem/1.4, and world/tool labels at .75rem. At 700px and below the stage goal becomes .85rem and world labels .7rem. Do not turn every utility label into display type.

Typing is the owner-authorized local exception: its lesson headline and beginner tiles use Baloo 2, while controls, reading and key labels use Nunito. The headline token is the ordinary desktop size; tall desktops increase it to 3rem, compact laptops use 1.95rem and phones 1.8rem. Short beginner tiles use the dedicated tile role; long passages retain responsive Consolas/Courier New monospace and native repair/writing editors retain their editing behavior. The global header wordmark remains Fredoka. Baloo 2 Bold/ExtraBold and Nunito SemiBold/Bold are self-hosted under `public/fonts`, with adjacent OFL files and `typing-fonts-origin.txt`; no Google font network request is required at runtime. These exact supplied families are an intentional scoped system change, not a warning-driven global replacement.

## Layout

The base non-challenge course header is sticky and 72px high, shrinking to 64px at 620px. Base main padding is 30px 36px 24px on wide screens. These inherited values describe reading surfaces; the active learning challenge override below supersedes them. The desktop drawer is 280px wide; retain its reachable overlay behavior on narrow screens.

The earlier base stage/editor grid (260px and 430px minimums, .8:1.5 proportions, stacking at a 750px content container) is superseded for active learning challenges. Lesson reading and examples retain their container-responsive stacking. The tagline hides at 1100px to protect header controls.

On viewports wider than 1100px and taller than 600px, active learning fills 100dvh beneath a 68px purple toolbar. The learning main area is at most 1440px wide, with 12px padding and gaps. Three columns use minmax(0,25fr), minmax(0,30fr) and minmax(0,45fr) for the lesson/instructions/hints guide, challenge stage and editor. The concept article expands at its natural height and pushes activity instructions and hints down; only the whole guide content scrolls, never a nested article slot. Play stays beneath the stage. The square map fits the smaller of its container's width and height and is centred on a plain white surround; board dimensions follow the mission.

At widths from 951px through 1100px and heights above 600px, the guide folds into a full-width row with a 44px header and expanded content that scrolls within 180px. The stage/editor row uses 44/56 proportions. The guide starts collapsed at this size. Between 951px and 1250px the challenge wordmark hides to protect controls.

Opening the course drawer overlays every learning surface: the main area keeps zero left margin and 100% width, with no reserved 280px desktop space. Desktop navigation remains a nonmodal overlay. The existing narrow-screen backdrop and focus trap retain their behavior; the layout change introduces no new drawer semantics.

At widths up to 950px or heights up to 600px, guide, stage and editor stack in three rows and the page scrolls beneath a sticky toolbar. The guide starts collapsed and opens through its header or a hint request. The tile stage has a clamp(320px,calc(100vw - 24px),560px) surround and the editor is 560px high. Portrait viewports up to 700px use the incumbent 108px two-row toolbar; other narrow toolbar cases retain the 56px base, while wide short screens retain the 68px learning override. Padding reduces to 8px at 700px. Drawing follows the same three-column/folded/stacked shell and retains its minimum 340px white artboard; lesson pages retain ordinary reading scroll.

Learning entry has a 1160px content maximum and two columns of grade cards with 16px gaps, becoming one column at 700px. Cards use 22px padding and 88px mascot wells, reducing to 18px and 64px. Grade 1–6 cards show suggested ages and board size, with a full-width Computer Explorers choice. Grade placement is a guide, without collecting birthdays.

Spacing tokens record recurring observed dimensions, not a mandated new spacing scale. Preserve the established three-area Blockly workflow and existing reading widths.

Public pages alternate wide illustrated sections with constrained readable content. Their navigation becomes an explicit menu at 900px; at 600px, two-column sections and the full catalog stack. Keep menu, search and learning links reachable. Decorative scene plates sit in isolated layers below real HTML, preserve their 3:2 aspect ratio and use linear masks to blend rectangular edges into the ground. Do not simulate an organic island contour with a generic mask. The approved sky hero retains its separate responsive crop.

Typing uses a 1500px content maximum beneath the shared navy platform header, with a compact lesson/control row, Byte lesson hero and grouped live progress/accuracy/streak. A white bordered practice stage holds large beginner tiles or the active measured passage and its four-state legend. The guidance area has a 1280px maximum: finger-name panels flank the keyboard in 170px/minmax(0,1fr)/170px columns with 20px gaps. At 1000px and below the keyboard comes first and the finger lists share a row below; at 600px padding, labels and keycaps compact further. Wide viewports up to 720px tall compact the hero, stage and guide; wide viewports at least 850px tall enlarge them. Hands remain removed. Phone/tablet composition supports physical-keyboard teaching and does not establish software-keyboard or IME support. The complete surface contract is `.impeccable/surfaces/typing-claude-light.md`.

## Elevation & Depth

Most surfaces are flat, separated by borders and tonal fills. Modal dialogs use the shared `0 20px 80px #11182740` shadow and a dimmed backdrop. The robot has a small local illustration shadow; do not apply it to the logo. Drawer motion uses 180ms ease-out, while board movement uses 360ms cubic-bezier(.16,1,.3,1). Respect both the application reduced-motion setting and the system preference.

Public-page depth comes primarily from the generated landscape. Step cards use the observed soft shadow (`0 12px 30px -20px #897bc4`); it is a scoped marketing treatment, not a new workspace or logo shadow.

The supplied typing treatment uses restrained local ambient shadows on white metrics and practice panels, and a small functional keycap shadow on the next key. These route-local values live in the sidecar. They do not authorize decorative bevels, new logo shadows or offset-shadow cards elsewhere.

The typing hero retains its faint cloud/mountain/mint-hill/rocket backdrop behind real HTML, at .7 opacity with vertically faded edges and an open reading area. Decorative horizontal inset tracks main padding: 24px wide, 18px at 1000px and below, 12px at 600px and below, keeping artwork within the viewport without clipping the interactive page. Byte is a single transparent, high-resolution still illustration displayed with object-fit contain at the existing responsive dimensions (100px ordinary, 140px tall desktop, 80px compact laptop, 72px phone). There is no mascot animation, sprite background, keyframe loop or visibility observer. Existing exercise line/reduced-motion behavior remains separate. Both shipping hero rasters have exact adjacent prompts and embedded provenance; the rejected sprite and prompt are archived outside public assets.

Learning tile depth is local: the map has a thin learning-line outline and no map shadow; moving sprites use `drop-shadow(0 3px 2px #14221766)` and destinations `drop-shadow(0 2px 2px #50351766)`. Decorative scenery strips around the map are removed. Help/tools use the existing compact popover shadow. The white editor and lesson containers stay border-led. Tile movement retains the incumbent movement timing, and drawing reveals ink along Dash's motion. Reduced motion removes sliding and celebration confetti.

### Play, movement and arrival motion — 10 October

Keep coordinate translation on the outer robot-position wrapper (360ms); a keyed inner character-motion wrapper performs one 460ms step reaction. Byte bobs mechanically, Dash hops, Gigi scampers, Fix trots, Milo hops with a side-to-side swing and Nova bounds. Ground shadows and brief dust puffs support foot contact without moving the map or editor. During visible runs, the destination sends ring ripples and blocked water has small surface ripples. Success plays a 900ms on-board arrival before the star modal: a three-cycle character dance, destination light pulses and a short four-spark burst. Byte brightens and its charging station lights up; other mascots celebrate their existing named destinations. No new collection or collision rules are implied.

Motion pauses when the stage is offscreen or the tab hidden. Both saved and system reduced-motion preferences remove spatial effects, puffs and spark bursts; a static destination highlight and success status remain. Character calls and happy arrival cues use gesture-unlocked device-local synthesis and obey the existing sound toggle. Milo's rounded oo/ah calls use a bandpass resonance, not a downloaded animal recording. Background music pauses during arrival as well as narration and star feedback. Stop/reset cancels pending arrival and retains the existing attempt/reward semantics. Drawing adds a small pencil-tip-anchored sway without lifting the pencil off the ink.

Initial HTML and the lazy learning-route fallback share a quiet loading screen. The three exact paths from the approved K mark assemble in violet, teal and yellow, with three bounded 1800ms cycles before settling. System reduced motion shows the static mark. The loading screen leaves as soon as the app is ready; no artificial delay, spinning logo, invented progress percentage or new brand geometry is used.

## Shapes

The identity uses flat, rounded geometric blocks. Controls are gently rounded, workspaces have larger corners, and circular badges identify modules or feedback states. Keep the same three-piece mark geometry in color, reverse and monochrome variants.

Active learning workspaces use the dialog radius, grade cards the workspace radius, and Play/Reset the learning-play radius. Tile cells meet edge to edge; scenery does not become a rounded card within every cell. Sprite atlases are transparent 3-column by 2-row six-slot sheets, indexed at 300% by 200%. Blockly retains its native connected silhouettes, start cap, statement notches and loop/conditional cavities; styling changes category color and surrounding chrome rather than block geometry.

**The Mark Integrity Rule.** Never stretch, rotate, relight or add an extra play triangle to the mark. Keep clear space of at least one quarter of its height. Use the normal symbol at 24 CSS pixels or larger; use the backed favicon below that. Use a tagline lockup at 260px wide or larger and omit the tagline for smaller placements.

## Components

### Protected-action confirmations

App-owned confirmations use the shared native HTML dialog styled by `src/confirmation.css`, not browser JavaScript confirm/alert popups. Preserve the white surface, violet border, 16px radius, Fredoka title and system body text. Use the actual action as the affirmative label and explain what is lost and what is preserved. Cancel receives initial focus; Escape and Close cancel; keyboard focus stays in the dialog and returns to the trigger. Destructive actions use semantic red `#ad2435` and hover `#8c1d2b` with white text. These semantic danger colors supplement the brand palette rather than replacing violet primary actions. Narrow screens stack the actions without changing the underlying mobile layout.

Home-screen PNG icons are deterministic rasterizations of `public/brand/mark-color.svg` on white. Apple uses the linked 180px touch icon; the web manifest supplies 192px/512px icons and a separate 512px maskable icon whose full K fits within the central safe circle. Rebuild with `node scripts/generate-app-icons.mjs`; do not substitute or regenerate the approved mark. No service worker, offline capability or public-sharing change is implied.

### Buttons

Primary buttons are violet with white labels, darkening on hover. Secondary buttons are white with a subtle border. The base control has a 44px minimum height; primary controls use 46px. Focus uses a 3px violet-dark outline offset by 4px. Disabled buttons reduce opacity to .45 and show a disabled cursor. Existing compact utility controls are exceptions to the base sizing, not a new default.

Learning Play uses the learning-play component token, expanding across the run-control row beneath the stage; phones retain a 44px minimum control height. Reset preserves code and resets the stage. Clear code belongs at the bottom of the editor. Learning focus overrides use a 3px outline offset by 3px, with the navigation-focus color inside the toolbar. Purple navigation controls darken on hover; selected progress steps and completed steps remain distinguishable.

### Inputs / Fields

The nickname field uses a quiet gray border, the field radius and full available width. It inherits system type, uses violet caret color and shares the global visible focus ring. Placeholder text uses muted ink. Do not replace its visible label with placeholder-only instructions.

### Navigation

The dark drawer groups modules and nested challenges. The current module has a violet-tinted fill; selected challenges use a distinct darker surface and lighter labels. Focus rings become pale violet within the drawer. Selection remains visible independently of hover.

The learning toolbar uses learning navigation purple, a white wordmark, current grade/topic/challenge, numbered progress and lesson/listen/hint/course/settings controls. The learning drawer uses its scoped deeper purple fill. Keep Change course reachable and expose the active course; Computer Explorers retains its own activities.

`PlatformHeader` now supplies the actual navy learning bar to course entry and every typing state, including browser previews. It keeps the real K and white Fredoka wordmark. Guest previews expose Log in; real signed-in adult sessions expose their name, My dashboard and Account settings; real learner sessions expose My courses. Assigned learners retain the existing `LearnerMenu` and guarded sign-out/settings behavior. A signed-in preview remains labeled as a device preview and never gains assigned-save claims through session presence alone. Marketing navigation belongs to public information pages, not these activity surfaces.

### Chips

Concept labels are small violet-tinted informational chips using the concept colors and chip radius. They are not action buttons and do not require invented interaction states.

### Cards / Containers

Execution and editor workspaces are white, bordered and rounded with the workspace radius. The lesson example uses the panel radius and 24px padding, reducing to 22px on phones. Hint panels use an existing warm cream treatment; success feedback uses a pale green treatment. Preserve those semantic distinctions.

The active learning override uses white workspaces with the larger dialog radius and learning-panel border. Lesson, journey and Computer Explorers containers use white bordered surfaces and clamp(20px,3vw,40px) padding. Grade entry is a card grid rather than the former age-grouped linked rows.

### Playable mascot stage and editor

Score readouts reserve a stable 18ch minimum inline width. Replacing “not set” with a numeric result must not rewrap the mission goal or shift the tile map; the score keeps its existing semantic output, colors and responsive type size.

The stage presents mission title and goal, mascot/world name, a named destination, semantic tile map, status and a Rows & columns toggle. Board text and live position descriptions remain available. A run advances the live character cell by cell while highlighting the executing Blockly block. Byte guides sequences/projects; Dash directions/order and drawing; Gigi loops; Fix debugging; Milo the monkey conditionals; Nova variables; Pip Computer Explorers. Pip's Events lookup is not an implemented formal Events curriculum.

The white Blockly workspace keeps its real draggable palette and connected code canvas. Its light violet toolbox comes from the existing Blockly theme. The start label uses the block-start token; the measured white-text contrast is 4.626:1. Footer reference, keyboard helpers, history and editable long-program overview remain usable. Grades 5–6 offer Blocks/Text within the same editor; typed commands are a bounded teaching language, not full Python.

Palette blocks stay at native Blockly scale .95; longer lists use the native flyout scroll instead of shrinking to fit the available height. The flyout reflows on resize. This palette rule is separate from the retained program-canvas fitting and editable overview for long programs. Resize/reposition work remains deferred during a held pointer or drag to preserve gesture stability.

Drawing swaps only the execution stage for smooth white paper: a dotted target, progressive ink, Dash holding a pencil and a heading pointer. It reuses the navigation, editor and Play position. Drawing tools expose ink and pen width, and drawing work saves separately from core challenge progress.

### Code-driven concept games — scoped extension, 22 October

Rescue Islands, Secret Gates and Robot Workshop extend the existing learning stage for operators, Boolean logic and functions. Painted island, garden and workshop backgrounds combine with native-alpha Byte, timber, gate leaves and energy cells; cyan, mint and warm timber surrounds belong to these scenes. Keep the navy platform shell, white panels, violet Play, Fredoka stage/editor headings and plain semantic labels/code. Dynamic operands, truth values, calls, targets and ordered output remain HTML inscriptions and status text, with exact values even when pictured pieces are bounded; pictures must not invent counts, evaluated branches or successful completion. The concept-only wider stage retains the adjustable desktop editor and visible goal/Play/reset/Results at 1309 × 700. Preserve each scene's aspect ratio with matching letterboxing on tall screens; narrow/short screens use the incumbent stacked, document-scrolling layout. Results is a native disclosure, closed initially, with Escape returning focus to its summary. Byte's crossing is bounded (800 ms) and gate motion takes 600 ms; application/OS reduced motion removes spatial effects and hidden/offscreen scenes pause decorative motion. These component rules implement the owner's authorized functional adaptation of the three critique references, not a new global palette, typography or pixel-reproduction contract. See `docs/CONCEPT_GAMES_2026_10_22.md` and the matching surface brief for scope and evidence.

### Lessons and narration

The activity guide puts concept prose and worked example, authored activity instructions and progressive hints alongside the challenge. Its reading role uses the learning-guide-reading token. The first challenge's concept opens automatically only on wide desktop; later concepts start closed. Generated grade-context instructions are omitted because the toolbar already supplies that context; authored instructions remain, and an identical instruction/goal is printed once within the guide. Hint reveal accounting and protected saved bests retain their existing behavior. A hint request expands the folded guide and brings its hint heading into view.

Ordinary concept introductions retain once-per-course/module cadence and a manual Read lesson action during practice; reinforcement challenges go directly to building. Grade 1 Sequences retains its existing topic journey and captioned lesson video with text/read-aloud alternatives. Read-aloud stays opt-in, with visible Listen/Stop controls, local English device voices and clear unavailable-voice feedback. Extend future lesson media with captions and text alternatives. See `docs/LEARNING_ENTRY.md` and `docs/SEQUENCE_LESSON.md`.

### Student dashboard Labs

Assigned courses lead on home and classroom student dashboards. A single Labs section follows the course/help columns on desktop: Byte Lab, App Lab and Artist Lab once each, in compact horizontal icon-and-label tiles. On phones, stack the tiles directly after courses and before help. Use the existing violet/lavender shell, white surfaces, Fredoka headings, and violet/teal/ochre icon panels. A Project course selector appears only for multiple supported assignments and changes launch destinations without moving old work. Byte/App require an assigned Grade 3–6 course; Artist opens existing code art for Grades 1–6. Unavailable entries are non-interactive and explain why. No public-storage fallback, new access grants or new painting application. See `docs/DASHBOARD_LABS_2026_10_21.md`.

The public course chooser reuses those three cards below Computer Explorers instead of a plain App Lab link. Its guidance explicitly says preview work is browser-local and separate from student accounts. Byte/Artist retain a supported last-used public course, with Grade 3/Grade 1 defaults; App Lab has its independent browser-preview route. The shared card renderer changes neither private eligibility nor saved data. Course circles show immediate topic icons until their existing character artwork loads, and retain icons if loading fails. No new rasters or global sprite-style changes.

### App Lab desktop workbench

App Lab retains its approved violet/lavender shell and Claude-derived rounded category blocks. The owner’s latest density refinement takes precedence over the initial spacious mockup: at ≥951px wide and ≥600px high, the shell occupies 100dvh with a 76px header, approximately 48px navigation, 32px pointer controls, 60px design tiles and compact property groups. Preview scaling preserves the 320 × 480 coordinate system. The preview footer has only Run/reset and actionable draft warnings: the bulb tip and Saving & design tips disclosure are removed in favour of a taller phone preview, with a 308px desktop preview column and 338px frame-width cap. Guidance remains available through Help. Keep navigation and Run visible; scroll long content inside properties, toolbox, code/text, data and the expanded debug console, not the desktop page. Touch-operated desktop controls retain 44px targets. Narrow and very short/zoomed windows keep document scrolling and the existing mobile composition. See `.impeccable/surfaces/app-lab.md` and `docs/APP_LAB_COMPACT_DESKTOP_2026_10_20.md`. Other learning surfaces are unchanged.

### Typing lesson and guidance — superseding scoped system change, 22 October

The owner-supplied implementation establishes the light lesson hero, grouped real metrics, larger bounded exercise/legend, next-key label and broad keyboard with textual left/right finger-name lists. The latest request replaces the rejected animated candidate with `public/images/typing/byte-typing.png`, a single static Byte/laptop illustration; `lesson-sky.png` remains behind the hero. These preserve actual Byte/platform identity rather than the demo mascot/star mark. White keycaps retain functional depth; violet identifies the next key and opposite Shift, while text and a selected list row name the recommended finger. Space retains “Either thumb.” Instructional hands, capsule artwork and articulated rig/motor remain removed. Neither rejected guide defects nor rejected sprite smoothness are canonized.

Text entry and original clicks remain immediate. Active-line progression retains its bounded 280ms transition and saved/system reduced-motion behavior. Four-state feedback distinguishes correct, underlined mistake, dotted corrected-after-Backspace and outlined current positions; the earlier functional underline exception does not establish a decorative-card rule. Preserve pause, guide, mute, settings, writing protection and downloads. This adapts visual structure into the existing curriculum/input/progress system rather than importing the demo's scores, ACTS loop, global input handler or inert controls. Earlier simple-scene/removal `ship` verdicts remain historical scoped verdicts, not this replacement's finish clearance or owner acceptance. Current evidence and remaining limits are in `docs/TYPING_CLAUDE_PLATFORM_INTERFACE.md`.

The owner's subsequent interaction correction makes the actual typing field ready immediately on practice arrival, activity/round entry, retry and resume, including native repair/writing inputs. Focus follows the committed task change without scrolling; changing ordinary text, toolbar controls or preferences does not retake focus. Pause, map, result and corrupt-progress recovery keep their own focus behavior, and results retain their focused heading. Scoped primary buttons keep white labels over dark violet on hover; secondary and quiet buttons use the established pale violet hover fill with dark ink/violet labels. Variant hover rules remain distinct so a generic light hover cannot wash out a primary action. This records interaction within the typing surface, without new global tokens.

### Brand lockup

Use the assets in `public/brand/`: color for light surfaces, reverse for dark surfaces, and mono or white for one-color reproduction. The header combines the symbol with an ink Fredoka wordmark. SVG lockups embed the licensed font but retain editable text; confirm embedded-font support with print vendors. Mark files contain paths only.

### Illustrated public pages

The shared public navigation exposes Courses, How it works and For Parents, with a visible current-page state, labelled menu toggle and footer links. Public action links use a 13px radius, white labels and a visible focus ring. Search uses a visible label and result status; FAQs use native details/summary. Course cards link to the implemented arrow, word, builder and computer routes. All text and controls remain HTML above decorative artwork. The approved master SVG mark stays separate from generated promotional images.

## Do's and Don'ts

### Do:

- Do reuse the approved three-piece K and the exact tagline.
- Do preserve system typography for incumbent lesson reading and controls, with Baloo 2/Nunito confined to the owner-supplied typing interface.
- Do keep focus, text scaling and reduced-motion behavior visible in new work.
- Do use the darker functional teal for white movement-block labels.
- Do apply learning tokens only within the learning shell and entry; preserve public-page rules and the master mark.
- Do keep Play below the stage, real Blockly geometry, meaningful obstacle tiles and readable board alternatives.
- Do preserve the shared white-paper drawing shell and Grade 1–6 entry choices.
- Do keep native palette blocks at .95 scale and let long flyout lists scroll.
- Do show task-specific instruction budgets with an explanation, excluding the start block. Keep valid at-limit programs neutral and reserve warning color for over-budget drafts.
- Do render pickups, gates and bridges from real runtime state, with equivalent textual board descriptions. Keep the shared learning shell unchanged; see docs/INTERACTIVE_CHALLENGES.md.
- Do keep lesson prose, authored instructions and hints reachable within the responsive activity guide.
- Do use aligned semantic activity lists with number/check, purpose and text status; keep whole rows touch-friendly and allow descriptions to wrap.
- Do place drawing in the module whose code it practises and return to that module at the end. Preserve stable drawing save IDs and independent practice rewards.
- Do end module overviews with a named Next module action, or Explore courses at the final module, without adding a perfect-star or drawing gate. See docs/LEARNING_UX_REVIEW.md.

### Don't:

- Don't substitute a generic code icon for the approved mark.
- Don't use bright teal or yellow as small text on white.
- Don't stretch the logo or add lighting effects or a variant-only triangle.
- Don't treat this brand extension as permission to redesign the learning flow.
- Don't replace collision data with a decorative complete-scene background or change saved learners' routes.
- Don't imply that mascot artwork implements formal Events, full Python, new accounts or curriculum validation.
