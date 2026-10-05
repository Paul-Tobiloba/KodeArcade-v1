# Build & Play — approved identity

Approved by the founder on 5 October 2026. This is a scoped brand application, not a redesign of the learning flow. The image concept is direction reference, not a pixel-exact interface specification.

## Direction contract

THESIS: A K assembled from coding blocks connects creation with play. Replace the generic code icon; preserve the working editor and lessons.

OWN-WORLD: Violet, teal, yellow, ink and cloud; rounded geometric mark and Fredoka wordmark. Flat scalable geometry, no lighting effects.

STORY: Learners recognize the same identity in the app, tab icon and course materials. Body copy remains a plain, legible system face.

FIRST VIEWPORT: Existing app header gains the color symbol and ink wordmark; the existing lesson heading uses Fredoka. Keep the drawer toggle and settings reachable on phones.

FORM: User-pinned Build & Play concept; no new direction roll required. Three-piece mark normalized across all variants; no extra play triangle added only in some versions.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Files and use

`public/brand/logo-color.svg` is the main horizontal logo with tagline. `logo-reverse.svg` uses white lettering on dark backgrounds; `logo-mono.svg` is ink-only; `logo-white.svg` is white-only. Corresponding `mark-*.svg` files contain only the symbol. `favicon.svg` includes its violet backing.

The SVG lockups embed the licensed Fredoka font, so they do not require a network connection or a locally installed font. They retain editable text, not outlined lettering: for a print vendor, confirm embedded-font SVG support or convert text to outlines in a vector editor. The marks are path-only.

Keep clear space equal to at least one quarter of the mark height. Minimum symbol size: 24 CSS pixels for general use; use the backed favicon for smaller tab icons. Keep the tagline lockup at least 260 pixels wide; omit the tagline for smaller placements. Never stretch or rotate the logo. Yellow and bright teal are brand accents, not small text colors on white; functional teal remains the darker #08796E.

Fredoka is distributed under the SIL Open Font License; see `public/fonts/OFL-Fredoka.txt`. Original font source: https://github.com/google/fonts/tree/main/ofl/fredoka . Build or regenerate the SVG assets with `node scripts/build-brand.mjs`.

No trademark clearance or uniqueness certification is claimed. No changes to authentication, learning logic, progress data, or deployment are part of this update.
