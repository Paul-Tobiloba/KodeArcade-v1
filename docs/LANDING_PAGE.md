# Landing page and social sharing

The public entry at `/` introduces KodeArcade. Public pages at `/#/courses`, `/#/how-it-works` and `/#/parents` share navigation and footer links. `/#/learn` opens the existing learning workspace; `/#/learn/arrows`, `/#/learn/words`, `/#/learn/builder` and `/#/learn/computer` open the implemented courses. Hash routing requires no server-side route rewrites; `#workspace` remains a supported learning anchor. The wordmark returns to the landing page. Learner saves keep their existing storage key. Blockly loads only when entering the workspace.

## Design

Persuade mode, within the approved Build & Play identity. The user-approved sky hero and matching lower-section scenes carry pastel clouds, floating violet islands and teal waterfalls. Fredoka headlines, system body copy and violet actions sit in real HTML above decorative concept art. Sections explain the learning loop, four coding modules and creative project, support features, and preview limitations. No invented outcomes, testimonials, account flow, or pricing. The catalog contains three coding paths sharing forty challenges plus a project, and twenty computer-basics activities. See [illustrated page notes](ILLUSTRATED_PAGES.md) for the scoped visual extension, exact new artwork prompts and verification limits.

## Artwork provenance

- `public/images/byte-adventure.png`: unchanged copy of the user-confirmed original `../assets/presentation/kodearcade-concept.png`, first created for the KodeArcade concept on 3 October 2026. Original generation prompt is not present beside that source; do not invent one.
- `public/social/kodearcade-share.png`: built-in image-generation edit of that original, 6 October 2026. Prompt: Edit the supplied original KodeArcade concept illustration into a polished wide 1.91:1 social sharing preview card (target 1200 by 630). Preserve the original friendly robot Byte, violet and teal floating stepping blocks, glowing golden star and dark navy magical atmosphere. This is the same illustration, not a new character design. Recompose to place the robot and rising block path on the right half, with the goal star toward upper right, keeping the robot fully visible. Left half is clean dark navy negative space containing large perfectly legible white rounded geometric bold typography 'KodeArcade', then two lines 'Play. Build.' and 'Learn.' with Learn in golden yellow. Smaller supporting text 'Coding adventures for curious minds.' Generous safe margins. Upper left beside KodeArcade a small simple flat three-piece K symbol: purple vertical stem, teal upper diagonal arm, yellow lower diagonal arm; no enclosing box. Keep all words exact, no other text, no tiny labels, no decorative UI mockups, no watermark. Professional restrained title card with the image atmosphere doing the expressive work. Do not crop robot face or star. Full bleed dark navy background, opaque image.

Final targeted edit prompt (built-in image generation): Make exactly one correction to this social sharing card: remove the large three-piece K pictogram in the upper-left above the KodeArcade wordmark, filling that small area with the matching plain navy background. Preserve ALL other artwork, text, exact typography, placements, composition, dimensions and colors unchanged. Do not add or redraw a logo. The existing written KodeArcade name remains unchanged. This avoids using an inaccurate pictogram instead of the brand's master vector logo.

The sharing card is a generated promotional image, not the master logo asset. Master SVG identity files remain in `public/brand/`.

## Deployment requirement

Set `SITE_URL` to the final public HTTPS origin when building (for example the actual hosting URL, not an invented domain). Vite inserts Open Graph, X large-image metadata, and, when configured, canonical and `og:url` tags into the initial HTML, so crawlers do not need JavaScript. Without an origin, development uses root-relative image URLs and omits canonical/og:url. Rebuild after setting the deployment origin. The image and page must be publicly reachable for social crawlers; a private GitHub repository or localhost link is not a public website. Platforms may cache earlier previews and choose their own crops.

Client-side public-page titles update when navigating, but hash routes do not have distinct social metadata or crawler previews. The existing share card describes KodeArcade as a whole.

No deployment or GitHub push is included in this local landing-page update.
