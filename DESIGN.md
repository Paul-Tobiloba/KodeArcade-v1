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
rounded:
  chip: "5px"
  field: "7px"
  button: "8px"
  panel: "12px"
  workspace: "14px"
  dialog: "16px"
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
---

# Design System: KodeArcade

## Overview

**Creative North Star: "Build & Play"**

A friendly K assembled from coding blocks connects making with play. Violet, teal and yellow carry the identity against ink lettering and cloud backgrounds. The approved extension adds a consistent mark, wordmark and heading voice to the existing learning application.

The working surface stays legible and task-focused: a quiet lesson or mission heading, a visible execution stage, and a block editor. Flat geometry and rounded corners support the playful identity without competing with the learner's program.

**Key Characteristics:**

- A consistent three-piece block-built K.
- Fredoka for the wordmark and principal course heading; system type for reading and controls.
- Light bordered workspaces and a dark course drawer.
- Visible focus and reduced-motion support.

This captures `src/styles.css`, `src/course.css`, `src/brand.css` and the approved scope in `docs/BRAND_IMPLEMENTATION.md` on 5 October 2026. It documents the current application and a small identity extension, not a new page composition.

The 7 October public-page extension carries Build & Play into the user-approved Byte adventure world: pastel clouds, violet floating islands, teal waterfalls and small golden goals. It preserves the incumbent identity and learning-workspace rules. Its page composition and code-led reference decisions live in `docs/ILLUSTRATED_PAGES.md`; this is an extension, not a replacement visual world.

## Colors

The palette combines expressive identity accents with darker functional colors for readable controls.

Public pages use scoped cloud ground (#f8faff), deep ink (#101333) and action violet (#6840f5), as implemented in `src/landing.css`. These public-page values do not replace the learning primitives in the frontmatter. White translucent panels and pale violet borders keep HTML readable over the artwork.

### Primary

- **Violet:** primary actions and the main logo block. Violet-dark supplies hover and focus treatments.

### Secondary

- **Brand teal:** the mark's creation accent.
- **Functional teal:** the darker movement-block and scene accent used with white text.

### Tertiary

- **Brand yellow:** a playful mark accent and supporting illustration detail.

### Neutral

- **Ink:** wordmark and primary text.
- **Cloud:** application canvas; surface white provides workspace and dialog contrast.
- **Muted and line:** supporting copy and quiet borders.
- **Drawer and selected-module:** dark navigation and its violet-tinted current state.

**The Accent Legibility Rule.** Bright brand teal and yellow are identity accents, not small text colors on white; retain functional teal for readable block labels.

## Typography

Fredoka is the locally hosted display face with a system fallback. The current course implementation applies it to the wordmark and h1; secondary headings, lesson text, Blockly labels and controls retain system type. Extend the display voice deliberately rather than changing every text role at once.

The principal heading uses the headline token and reduces to 1.7rem at the narrow breakpoint. The wordmark reduces to 1.3rem at 620px and 1.1rem at 360px. Lesson prose uses .93rem with 1.8 line-height and a maximum of 72ch; the introduction uses 1.075rem with 1.85 line-height and 70ch. The global 16px size is a root reference, not the size of every paragraph.

**The Reading Voice Rule.** Preserve the plain system face for instructions and controls. The tagline is exactly “Play. Build. Learn.”

Public pages extend Fredoka to expressive hero and section headings. Body copy, navigation, course-card titles and step-card titles keep system type. The public hero uses responsive display sizing; learning headings and reading widths retain their own rules.

## Layout

The course header is sticky and 72px high, shrinking to 64px at 620px. Main padding is 30px 36px 24px on wide screens, then reduces through the existing responsive rules. The desktop drawer is 280px wide and shifts the main content; at 900px and below it overlays content and is at most 310px wide with 44px of viewport clearance.

The stage and editor use a two-column grid with minimum widths of 260px and 430px and proportions .8 to 1.5. When the course content container reaches 750px, they stack. Lesson reading and examples also stack at that container threshold. The tagline hides at 1100px to protect header controls. Keep drawer and settings controls reachable on narrow screens.

Spacing tokens record recurring observed dimensions, not a mandated new spacing scale. Preserve the established three-area Blockly workflow and existing reading widths.

Public pages alternate wide illustrated sections with constrained readable content. Their navigation becomes an explicit menu at 900px; at 600px, two-column sections and the full catalog stack. Keep menu, search and learning links reachable. Decorative scene plates sit in isolated layers below real HTML, preserve their 3:2 aspect ratio and use linear masks to blend rectangular edges into the ground. Do not simulate an organic island contour with a generic mask. The approved sky hero retains its separate responsive crop.

## Elevation & Depth

Most surfaces are flat, separated by borders and tonal fills. Modal dialogs use the shared `0 20px 80px #11182740` shadow and a dimmed backdrop. The robot has a small local illustration shadow; do not apply it to the logo. Drawer motion uses 180ms ease-out, while board movement uses 360ms cubic-bezier(.16,1,.3,1). Respect both the application reduced-motion setting and the system preference.

Public-page depth comes primarily from the generated landscape. Step cards use the observed soft shadow (`0 12px 30px -20px #897bc4`); it is a scoped marketing treatment, not a new workspace or logo shadow.

## Shapes

The identity uses flat, rounded geometric blocks. Controls are gently rounded, workspaces have larger corners, and circular badges identify modules or feedback states. Keep the same three-piece mark geometry in color, reverse and monochrome variants.

**The Mark Integrity Rule.** Never stretch, rotate, relight or add an extra play triangle to the mark. Keep clear space of at least one quarter of its height. Use the normal symbol at 24 CSS pixels or larger; use the backed favicon below that. Use a tagline lockup at 260px wide or larger and omit the tagline for smaller placements.

## Components

### Buttons

Primary buttons are violet with white labels, darkening on hover. Secondary buttons are white with a subtle border. The base control has a 44px minimum height; primary controls use 46px. Focus uses a 3px violet-dark outline offset by 4px. Disabled buttons reduce opacity to .45 and show a disabled cursor. Existing compact utility controls are exceptions to the base sizing, not a new default.

### Inputs / Fields

The nickname field uses a quiet gray border, the field radius and full available width. It inherits system type, uses violet caret color and shares the global visible focus ring. Placeholder text uses muted ink. Do not replace its visible label with placeholder-only instructions.

### Navigation

The dark drawer groups modules and nested challenges. The current module has a violet-tinted fill; selected challenges use a distinct darker surface and lighter labels. Focus rings become pale violet within the drawer. Selection remains visible independently of hover.

### Chips

Concept labels are small violet-tinted informational chips using the concept colors and chip radius. They are not action buttons and do not require invented interaction states.

### Cards / Containers

Execution and editor workspaces are white, bordered and rounded with the workspace radius. The lesson example uses the panel radius and 24px padding, reducing to 22px on phones. Hint panels use an existing warm cream treatment; success feedback uses a pale green treatment. Preserve those semantic distinctions.

### Brand lockup

Use the assets in `public/brand/`: color for light surfaces, reverse for dark surfaces, and mono or white for one-color reproduction. The header combines the symbol with an ink Fredoka wordmark. SVG lockups embed the licensed font but retain editable text; confirm embedded-font support with print vendors. Mark files contain paths only.

### Illustrated public pages

The shared public navigation exposes Courses, How it works and For Parents, with a visible current-page state, labelled menu toggle and footer links. Public action links use a 13px radius, white labels and a visible focus ring. Search uses a visible label and result status; FAQs use native details/summary. Course cards link to the implemented arrow, word, builder and computer routes. All text and controls remain HTML above decorative artwork. The approved master SVG mark stays separate from generated promotional images.

## Do's and Don'ts

### Learning entry and concept cadence

The learning entry uses the existing light workspace ground, Fredoka heading, system reading text and purple actions. Course choices are spacious linked rows, grouped by suggested age rather than collected birth dates. Keep a visible Change course link inside the workspace and name the active course in its drawer. Only playable modules belonging to that course appear there; Computer Explorers does not inherit coding modules.

Concept introductions open once per course/module, with a manual Read lesson action during practice. Reinforcement challenges go directly to building. Read-aloud is opt-in, has visible Listen/Stop controls, uses local English device voices and explains unavailable voices. Future video belongs to concept introductions, with captions and text alternatives. See docs/LEARNING_ENTRY.md.

### Do:

- Do reuse the approved three-piece K and the exact tagline.
- Do preserve system typography for lesson reading and controls.
- Do keep focus, text scaling and reduced-motion behavior visible in new work.
- Do use the darker functional teal for white movement-block labels.

### Don't:

- Don't substitute a generic code icon for the approved mark.
- Don't use bright teal or yellow as small text on white.
- Don't stretch the logo or add lighting effects or a variant-only triangle.
- Don't treat this brand extension as permission to redesign the learning flow.
