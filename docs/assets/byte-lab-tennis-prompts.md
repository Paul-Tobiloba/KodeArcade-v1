# Byte Lab tennis sprites — 18 October 2026

Generated with the built-in image_gen tool, one new image call per asset. Existing basketball and red racecar sprites were inspected for style; no existing artwork was overwritten. Square native RGBA PNGs were trimmed and scaled onto transparent 384 × 384 canvases with Sharp, preserving the native alpha rather than chroma-keying. No generation CLI, hand-drawn substitute, or painted transparency was used.

| Asset | Final | Native source |
| --- | --- | --- |
| TennisBall | `public/images/studio/tennisball.png` | `C:/Users/USER/.codex/generated_images/01a14dd3-3b7c-76c1-a92f-7b9f2f112a0e/exec-ee6f087a-0179-46e6-9d20-b4c7e22e1261.png` |
| TennisRacket | `public/images/studio/tennisracket.png` | `C:/Users/USER/.codex/generated_images/01a14dd3-3b7c-76c1-a92f-7b9f2f112a0e/exec-80d1ec79-bfcb-4eab-92f5-71fecd57324b.png` |

## Validation

Both final files are 384 × 384, four-channel RGBA with clear, opaque and partially transparent pixels. Ball alpha bounds are (57,57)–(325,326), approximately 70% canvas width. Racket alpha bounds are (118,48)–(264,335), 75% canvas height. Native antialiasing and alpha are preserved.

Inspected both assets at full size and 96px on light cream and dark navy grounds. The racket's head has real transparent holes between the cream strings and an open throat. White details remain visible; there are no background panels, external shadows, text, logos, faces, hands or added balls.

QA: `output/byte-lab-tennis/contact-sheet-light.png`, `output/byte-lab-tennis/contact-sheet-dark.png`, and `output/byte-lab-tennis/alpha-report.json`.

The exact prompts below are embedded in each final PNG using Impeccable `embed-prompt --prompt-file`. Both were recovered with `--read` and compared against the generation strings; raw PNG text chunks also match exactly.

## TennisBall — exact generation prompt

```text
Use case: stylized-concept
Asset type: transparent 2D sprite for the KodeArcade children's playable game library.
Scene/backdrop: genuinely transparent empty canvas, square composition.
Subject: one single bright lime-green tennis ball, immediately recognizable, large and centered.
Style/medium: polished realistic-cartoon 2D game artwork, warm and cheerful, crisp dark-navy contour, rounded shape, gentle dimensional cel shading and small painted highlights; match the friendly illustrated basketball and glossy racecar game sprites.
Composition/framing: front-facing round ball, centered on both axes, diameter approximately 70 percent of the square image width, ample clean transparent margin. The complete circular silhouette is visible.
Color/materials: vivid tennis-ball lime green felt with restrained fine texture, two thick curved creamy-white tennis seams wrapping naturally around the sphere, warm light from upper left and shaded lower right. Keep white seams fully opaque.
Constraints: one ball only; clear silhouette that reads when small; actual native RGBA transparency outside the ball; no floor, ground, contact shadow, cast shadow, glow, border panel or background.
Avoid: face, eyes, mouth, character features, people, hands, racket, extra balls, writing, letters, logos, watermark, checkerboard pattern, photorealistic studio background.
```

## TennisRacket — exact generation prompt

```text
Use case: stylized-concept
Asset type: transparent 2D sprite for the KodeArcade children's playable game library.
Scene/backdrop: genuinely transparent empty canvas, square composition.
Subject: one single tennis racket, viewed directly from overhead, perfectly upright with handle pointing straight down.
Style/medium: polished realistic-cartoon 2D game artwork, warm and cheerful, crisp dark-navy contour, gentle dimensional cel shading and painted highlights; match the friendly illustrated sports balls and glossy racecar game sprites.
Composition/framing: centered complete silhouette, racket spans about 75 percent of image height. Broad oval head occupies the upper two-thirds of racket, narrower open throat below, comfortably thick wrapped handgrip at bottom. Face is flat to the viewer, no tilt, no foreshortening. The head must be wide enough for the string grid to read at small game-sprite sizes.
Color/materials: bright red outer frame with deep blue side accents, light cream strings in a visibly sparse regular square grid, dark navy and blue wrapped grip with a small red butt cap. Warm upper-left highlights.
Transparency: the square holes BETWEEN every string must be genuinely clear alpha through the racket head; the open triangle in its throat must also be genuinely transparent. Opaque frame and opaque light-colored strings only, NO opaque white or gray sheet filling the head. Preserve light strings.
Constraints: one racket only; actual native RGBA cutout; complete frame and handle visible with transparent margin; clear silhouette that reads when small; no floor, ground, contact shadow, cast shadow, glow, border panel or background.
Avoid: tennis ball, hand, person, player, text, lettering, brand mark, logo, watermark, face, eyes, mouth, checkerboard pattern, solid fill behind strings.
```
