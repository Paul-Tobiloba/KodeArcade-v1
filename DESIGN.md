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
rounded:
  chip: "5px"
  field: "7px"
  button: "8px"
  panel: "12px"
  workspace: "14px"
  dialog: "16px"
  learning-play: "10px"
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
---

# Design System: KodeArcade

## Overview

**Creative North Star: "Build & Play"**

A friendly K assembled from coding blocks connects making with play. Violet, teal and yellow carry the identity against ink lettering and cloud backgrounds. The approved extension adds a consistent mark, wordmark and heading voice to the existing learning application.

The working surface stays legible and task-focused: a quiet lesson or mission heading, a visible execution stage, and a block editor. Flat geometry and rounded corners support the playful identity without competing with the learner's program.

The approved 9 October learning extension makes each coding activity a playable top-down tile world. Deep purple navigation frames white workspaces on pale lavender ground; the live mascot, walkable path, obstacles and destination share one meaningful map. The same shell carries grade selection, lessons, Blockly and bounded typed practice; drawing changes the stage to smooth white paper with Dash's pencil.

The approved learning layout keeps lesson, activity instructions and progressive hints beside a smaller execution stage and the editor. Wide screens devote 25/30/45 of the workspace columns to those roles. The article expands in normal flow, pushing activity instructions and hints down within one scrollable guide column. The square map is centred on white, and the native Blockly palette keeps readable targets as the workspace changes size. The course drawer overlays the learning workspace without moving its panels.

**Key Characteristics:**

- A consistent three-piece block-built K.
- Fredoka for the wordmark and principal course heading; system type for reading and controls.
- Light bordered workspaces and a dark course drawer.
- Visible focus and reduced-motion support.
- Purple learning navigation and readable white workspaces around semantic mascot tile worlds.
- A persistent wide-screen lesson guide, smaller stage and readable native Blockly palette.

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

**The Accent Legibility Rule.** Bright brand teal and yellow are identity accents, not small text colors on white; retain functional teal for readable block labels.

**The Semantic Terrain Rule.** Every painted obstacle inside the playable map represents a collision cell; a walkable tile represents open ground. Decorative scenery outside the map never creates a second route or hidden collision rule.

## Typography

Fredoka is the locally hosted display face with a system fallback. The current course implementation applies it to the wordmark, h1 and stage/editor headings; lesson reading, Blockly labels and controls retain system type. Extend the display voice deliberately rather than changing every text role at once.

The principal heading uses the headline token and reduces to 1.7rem at the narrow breakpoint. The wordmark reduces to 1.3rem at 620px and 1.1rem at 360px. Lesson prose uses .93rem with 1.8 line-height and a maximum of 72ch; the introduction uses 1.075rem with 1.85 line-height and 70ch. The global 16px size is a root reference, not the size of every paragraph.

**The Reading Voice Rule.** Preserve the plain system face for instructions and controls. The tagline is exactly “Play. Build. Learn.”

Public pages extend Fredoka to expressive hero and section headings. Body copy, navigation, course-card titles and step-card titles keep system type. The public hero uses responsive display sizing; learning headings and reading widths retain their own rules.

Learning entry uses its scoped responsive Fredoka headline token. Tile-stage mission titles use the scoped Fredoka title token; editor headings also use Fredoka at 1.2rem, inherited from the course heading rules. Play uses system type at 1.15rem, goal copy at .875rem/1.4, and world/tool labels at .75rem. At 700px and below the stage goal becomes .85rem and world labels .7rem. Do not turn every utility label into display type.

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

## Elevation & Depth

Most surfaces are flat, separated by borders and tonal fills. Modal dialogs use the shared `0 20px 80px #11182740` shadow and a dimmed backdrop. The robot has a small local illustration shadow; do not apply it to the logo. Drawer motion uses 180ms ease-out, while board movement uses 360ms cubic-bezier(.16,1,.3,1). Respect both the application reduced-motion setting and the system preference.

Public-page depth comes primarily from the generated landscape. Step cards use the observed soft shadow (`0 12px 30px -20px #897bc4`); it is a scoped marketing treatment, not a new workspace or logo shadow.

Learning tile depth is local: the map has a thin learning-line outline and no map shadow; moving sprites use `drop-shadow(0 3px 2px #14221766)` and destinations `drop-shadow(0 2px 2px #50351766)`. Decorative scenery strips around the map are removed. Help/tools use the existing compact popover shadow. The white editor and lesson containers stay border-led. Tile movement retains the incumbent movement timing, and drawing reveals ink along Dash's motion. Reduced motion removes sliding and celebration confetti.

## Shapes

The identity uses flat, rounded geometric blocks. Controls are gently rounded, workspaces have larger corners, and circular badges identify modules or feedback states. Keep the same three-piece mark geometry in color, reverse and monochrome variants.

Active learning workspaces use the dialog radius, grade cards the workspace radius, and Play/Reset the learning-play radius. Tile cells meet edge to edge; scenery does not become a rounded card within every cell. Sprite atlases are transparent 3-column by 2-row six-slot sheets, indexed at 300% by 200%. Blockly retains its native connected silhouettes, start cap, statement notches and loop/conditional cavities; styling changes category color and surrounding chrome rather than block geometry.

**The Mark Integrity Rule.** Never stretch, rotate, relight or add an extra play triangle to the mark. Keep clear space of at least one quarter of its height. Use the normal symbol at 24 CSS pixels or larger; use the backed favicon below that. Use a tagline lockup at 260px wide or larger and omit the tagline for smaller placements.

## Components

### Buttons

Primary buttons are violet with white labels, darkening on hover. Secondary buttons are white with a subtle border. The base control has a 44px minimum height; primary controls use 46px. Focus uses a 3px violet-dark outline offset by 4px. Disabled buttons reduce opacity to .45 and show a disabled cursor. Existing compact utility controls are exceptions to the base sizing, not a new default.

Learning Play uses the learning-play component token, expanding across the run-control row beneath the stage; phones retain a 44px minimum control height. Reset preserves code and resets the stage. Clear code belongs at the bottom of the editor. Learning focus overrides use a 3px outline offset by 3px, with the navigation-focus color inside the toolbar. Purple navigation controls darken on hover; selected progress steps and completed steps remain distinguishable.

### Inputs / Fields

The nickname field uses a quiet gray border, the field radius and full available width. It inherits system type, uses violet caret color and shares the global visible focus ring. Placeholder text uses muted ink. Do not replace its visible label with placeholder-only instructions.

### Navigation

The dark drawer groups modules and nested challenges. The current module has a violet-tinted fill; selected challenges use a distinct darker surface and lighter labels. Focus rings become pale violet within the drawer. Selection remains visible independently of hover.

The learning toolbar uses learning navigation purple, a white wordmark, current grade/topic/challenge, numbered progress and lesson/listen/hint/course/settings controls. The learning drawer uses its scoped deeper purple fill. Keep Change course reachable and expose the active course; Computer Explorers retains its own activities.

### Chips

Concept labels are small violet-tinted informational chips using the concept colors and chip radius. They are not action buttons and do not require invented interaction states.

### Cards / Containers

Execution and editor workspaces are white, bordered and rounded with the workspace radius. The lesson example uses the panel radius and 24px padding, reducing to 22px on phones. Hint panels use an existing warm cream treatment; success feedback uses a pale green treatment. Preserve those semantic distinctions.

The active learning override uses white workspaces with the larger dialog radius and learning-panel border. Lesson, journey and Computer Explorers containers use white bordered surfaces and clamp(20px,3vw,40px) padding. Grade entry is a card grid rather than the former age-grouped linked rows.

### Playable mascot stage and editor

The stage presents mission title and goal, mascot/world name, a named destination, semantic tile map, status and a Rows & columns toggle. Board text and live position descriptions remain available. A run advances the live character cell by cell while highlighting the executing Blockly block. Byte guides sequences/projects; Dash directions/order and drawing; Gigi loops; Fix debugging; Milo the monkey conditionals; Nova variables; Pip Computer Explorers. Pip's Events lookup is not an implemented formal Events curriculum.

The white Blockly workspace keeps its real draggable palette and connected code canvas. Its light violet toolbox comes from the existing Blockly theme. The start label uses the block-start token; the measured white-text contrast is 4.626:1. Footer reference, keyboard helpers, history and editable long-program overview remain usable. Grades 5–6 offer Blocks/Text within the same editor; typed commands are a bounded teaching language, not full Python.

Palette blocks stay at native Blockly scale .95; longer lists use the native flyout scroll instead of shrinking to fit the available height. The flyout reflows on resize. This palette rule is separate from the retained program-canvas fitting and editable overview for long programs. Resize/reposition work remains deferred during a held pointer or drag to preserve gesture stability.

Drawing swaps only the execution stage for smooth white paper: a dotted target, progressive ink, Dash holding a pencil and a heading pointer. It reuses the navigation, editor and Play position. Drawing tools expose ink and pen width, and drawing work saves separately from core challenge progress.

### Lessons and narration

The activity guide puts concept prose and worked example, authored activity instructions and progressive hints alongside the challenge. Its reading role uses the learning-guide-reading token. The first challenge's concept opens automatically only on wide desktop; later concepts start closed. Generated grade-context instructions are omitted because the toolbar already supplies that context; authored instructions remain, and an identical instruction/goal is printed once within the guide. Hint reveal accounting and protected saved bests retain their existing behavior. A hint request expands the folded guide and brings its hint heading into view.

Ordinary concept introductions retain once-per-course/module cadence and a manual Read lesson action during practice; reinforcement challenges go directly to building. Grade 1 Sequences retains its existing topic journey and captioned lesson video with text/read-aloud alternatives. Read-aloud stays opt-in, with visible Listen/Stop controls, local English device voices and clear unavailable-voice feedback. Extend future lesson media with captions and text alternatives. See `docs/LEARNING_ENTRY.md` and `docs/SEQUENCE_LESSON.md`.

### Brand lockup

Use the assets in `public/brand/`: color for light surfaces, reverse for dark surfaces, and mono or white for one-color reproduction. The header combines the symbol with an ink Fredoka wordmark. SVG lockups embed the licensed font but retain editable text; confirm embedded-font support with print vendors. Mark files contain paths only.

### Illustrated public pages

The shared public navigation exposes Courses, How it works and For Parents, with a visible current-page state, labelled menu toggle and footer links. Public action links use a 13px radius, white labels and a visible focus ring. Search uses a visible label and result status; FAQs use native details/summary. Course cards link to the implemented arrow, word, builder and computer routes. All text and controls remain HTML above decorative artwork. The approved master SVG mark stays separate from generated promotional images.

## Do's and Don'ts

### Do:

- Do reuse the approved three-piece K and the exact tagline.
- Do preserve system typography for lesson reading and controls.
- Do keep focus, text scaling and reduced-motion behavior visible in new work.
- Do use the darker functional teal for white movement-block labels.
- Do apply learning tokens only within the learning shell and entry; preserve public-page rules and the master mark.
- Do keep Play below the stage, real Blockly geometry, meaningful obstacle tiles and readable board alternatives.
- Do preserve the shared white-paper drawing shell and Grade 1–6 entry choices.
- Do keep native palette blocks at .95 scale and let long flyout lists scroll.
- Do keep lesson prose, authored instructions and hints reachable within the responsive activity guide.

### Don't:

- Don't substitute a generic code icon for the approved mark.
- Don't use bright teal or yellow as small text on white.
- Don't stretch the logo or add lighting effects or a variant-only triangle.
- Don't treat this brand extension as permission to redesign the learning flow.
- Don't replace collision data with a decorative complete-scene background or change saved learners' routes.
- Don't imply that mascot artwork implements formal Events, full Python, new accounts or curriculum validation.
