# Byte Lab people sprite prompts

Generated with the built-in `image_gen` tool on 2026-10-17, one call per asset, with `transparent_background: true`. No input images. Each shipped sprite is resized and padded to 384 × 384 while preserving generated alpha. The exact generation prompts below are also embedded in each PNG through Impeccable `embed-prompt`.

## Boy — `public/images/studio/boy.png`

```text
Use case: stylized-concept
Asset type: single shipping transparent PNG character sprite for KodeArcade Byte Lab, a child-friendly creative coding game
Primary request: one friendly Black boy approximately 9 years old, dark brown skin, short coily black hair, warm cheerful smile, teal t-shirt, indigo shorts, orange trainers
Scene/backdrop: genuinely transparent alpha background, isolated character only
Style/medium: polished friendly 2D cartoon illustration, strong clean dark outlines, simple rounded shapes, modest soft cel-shading, warm colorful child-friendly game mascot aesthetic
Composition/framing: square canvas; one complete uncropped full body centered with about 20 percent transparent padding; relaxed standing pose, arms naturally resting beside body, three-quarter view facing right; readable silhouette at small sprite size
Constraints: exactly one character in one pose; complete hair, hands and both shoes; no floor, ground shadow, background, scene, props, text, letters, logos, watermark, border, checkerboard pattern, atlas, sprite sheet, or multiple poses; preserve real PNG transparency
```

Generation source: `C:/Users/USER/.codex/generated_images/01a14a7f-b840-7a30-aed9-0e366d21e4aa/exec-3befc7e5-5bb5-4eee-b8b4-38dfd287dd15.png`.

## Girl — `public/images/studio/girl.png`

```text
Use case: stylized-concept
Asset type: single shipping transparent PNG character sprite for KodeArcade Byte Lab, a child-friendly creative coding game
Primary request: one friendly Black girl approximately 9 years old, brown skin, two round puff ponytails of coily black hair, warm cheerful smile, purple t-shirt, teal shorts, yellow trainers
Scene/backdrop: genuinely transparent alpha background, isolated character only
Style/medium: polished friendly 2D cartoon illustration, strong clean dark outlines, simple rounded shapes, modest soft cel-shading, warm colorful child-friendly game mascot aesthetic
Composition/framing: square canvas; one complete uncropped full body centered with about 20 percent transparent padding; relaxed standing pose, arms naturally resting beside body, three-quarter view facing right; readable silhouette at small sprite size
Constraints: exactly one character in one pose; complete hair, hands and both shoes; no floor, ground shadow, background, scene, props, text, letters, logos, watermark, border, checkerboard pattern, atlas, sprite sheet, or multiple poses; preserve real PNG transparency
```

Generation source: `C:/Users/USER/.codex/generated_images/01a14a7f-b840-7a30-aed9-0e366d21e4aa/exec-f950a721-2525-4b58-a8e1-af4e0031b4e8.png`.

## Verification

- Both PNGs: 384 × 384, RGBA, native generated alpha preserved. Approximately 20% transparent margin added around the centered full-body figures.
- Boy: 37,186 bytes; 135,569 fully transparent pixels; 11,201 partially transparent pixels; 686 opaque pixels.
- Girl: 44,980 bytes; 134,016 fully transparent pixels; 12,685 partially transparent pixels; 755 opaque pixels.
- Visually inspected both figures on warm light and dark navy grounds: complete bodies, no background rectangles, no visible edge halos.
- Impeccable `embed-prompt --read` exactly matches the corresponding prompt above. `embed-prompt --scan public/images/studio`: `SCAN: 2 rasters, 0 missing`.
- QA contact sheet: `output/assets/byte-lab-people-alpha-check.png` (inspection only; not referenced by the product).

