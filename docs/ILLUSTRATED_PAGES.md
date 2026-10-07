# Illustrated public pages — 7 October 2026

## Routes and scope

- `/`: overview and approved sky hero; remaining sections now use matching island artwork.
- `/#/courses`: four available age/confidence paths, searchable catalog, shared coding curriculum and computer basics.
- `/#/how-it-works`: lesson/build/play learning loop and explanation of the three workspace areas.
- `/#/parents`: practical support, local-save limitations, devices and accessibility status.

These are separate client-side pages with refresh/back/forward support, titles, shared navigation, a mobile menu and footer links. Hash routing needs no server rewrite. Social metadata still describes the overall platform and uses the existing approved share card; hash routes do not produce distinct crawler previews.

The reference is the user-supplied `KodeArcade_ Byte’s Coding Adventure.png`. The approved hero and vector brand stay intact. Lower sections inherit pastel clouds, violet floating islands, teal waterfalls, rounded white surfaces and Fredoka headings. HTML renders all text and controls. Age and challenge counts follow the implemented curriculum rather than the older reference: 6–14, forty challenges plus project per coding path, twenty computer activities. The coding paths currently share one curriculum; the oldest path is not a new advanced language.

## Surface direction and implementation

Mode: Persuade. This extends the existing Build & Play world through the user's explicitly approved illustration reference and request for lower homepage sections and multiple public pages. The implementation followed that pinned reference in code; no formal composition seed or quality card was produced. Do not infer a replacement global identity from this surface.

Public-page ground (#f8faff), ink (#101333) and action violet (#6840f5) are scoped to the marketing surface. The learning workspace retains its documented palette and three-area workflow. The shared public menu appears at 900px, and sections/catalog stack at 600px. Keep current-page navigation, search status, native FAQ controls and visible focus. The master SVG brand in `public/brand/` remains authoritative.

Lower-page scene plates use isolated decorative layers, retain a 3:2 aspect ratio and blend rectangular edges with linear masks. This softens the plate seams while preserving the islands and Byte; it is not an organic-contour cutout. Content remains real HTML above the art. The approved sky hero retains its own responsive crop. Generated scenes are concept artwork, not screenshots of playable worlds.

## Artwork provenance

Built-in image-generation skill/tool, reference-guided generation (not a screenshot crop or an edit of the source), opaque PNGs. All four are stored in `public/images/`. Exact prompts are embedded in each image as PNG text metadata. Input reference for each: `C:/Users/USER/Downloads/KodeArcade_ Byte’s Coding Adventure.png`.

All nine shipped PNGs have an `impeccable:prompt` text chunk: the four new scene plates below, plus `adventure-sky.png`, `byte-adventure.png`, `jumping-game.png`, `space-story.png` and `public/social/kodearcade-share.png`. Existing art records its available provenance rather than invented missing prompts. The social-card edit prompts remain in `LANDING_PAGE.md`; the master logo is an SVG, not one of these PNGs.

### steps-island.png

Use case: stylized-concept. Asset type: decorative website section background, wide landscape 1536x1024. Input image is STYLE AND CHARACTER REFERENCE only, not an edit target. Match its polished whimsical 3D floating-island world, violet stone, teal waterfalls, lush little plants, pastel lavender blue and peach clouds. No text, no letters, no logos, no UI, no panels. Background very pale #f8faff, fade all outer edges to this color for seamless web composition. A floating island with glowing cyan and violet stepping stones and a small wooden sign with a code symbol, clustered in bottom-left quarter. Entire upper half and right 55 percent must be pale almost white empty cloud space for HTML text and cards. No robot.

### byte-star.png

Use case: stylized-concept. Asset type: decorative website section background, wide landscape 1536x1024. Input image is STYLE AND CHARACTER REFERENCE only, not an edit target. Match its polished whimsical 3D floating-island world, violet stone, teal waterfalls, lush little plants, pastel lavender blue and peach clouds. No text, no letters, no logos, no UI, no panels. Background very pale #f8faff, fade all outer edges to this color for seamless web composition. Friendly small white rounded robot Byte with black face and happy glowing eyes, teal ear discs and violet joints, sitting on a lush floating island holding a glowing golden star in bottom-left quarter. Wide pale almost-white empty cloud space throughout upper half and right 55 percent for text. A few distant tiny floating islands at lower edge.

### question-island.png

Use case: stylized-concept. Asset type: decorative website section background, wide landscape 1536x1024. Input image is STYLE AND CHARACTER REFERENCE only, not an edit target. Match its polished whimsical 3D floating-island world, violet stone, teal waterfalls, lush little plants, pastel lavender blue and peach clouds. No text, no letters, no logos, no UI, no panels. Background very pale #f8faff, fade all outer edges to this color for seamless web composition. A single small floating rocky island at the far right with a glowing violet question-mark cube, teal waterfall, greenery. Left 70 percent empty near-white pale cloud space for HTML FAQ rows. Keep the island in the rightmost quarter.

### journey-horizon.png

Use case: stylized-concept. Asset type: decorative website section background, wide landscape 1536x1024. Input image is STYLE AND CHARACTER REFERENCE only, not an edit target. Match its polished whimsical 3D floating-island world, violet stone, teal waterfalls, lush little plants, pastel lavender blue and peach clouds. No text, no letters, no logos, no UI, no panels. Background very pale #f8faff, fade all outer edges to this color for seamless web composition. Byte robot viewed from behind standing on a lush violet floating island at bottom left looking toward a distant golden star portal on floating island at far right. Center 60 percent and upper half mostly pale luminous clouds empty for dark heading and HTML button. Cinematic hopeful magical pastel light. No words.

## Verification

The production build and 73 unit tests passed. Unit coverage includes curriculum solutions, arrow evaluation, backward-compatible storage and independent course saves. Browser checks passed on desktop, phone and tablet, exercising public page links/search, refresh, learner entry, arrow controls, actual mouse/touch practice, feedback timing and local persistence. The replay correction also passed all three device profiles: Reset position restores an interactive star, replay succeeds, and saved completion credit stays unchanged. Artwork seam corrections are checked in the independent finish review. Automated accessibility checks are useful checks, not a claim of complete accessibility conformance. Learner engagement still needs another observed session with children.

