# Byte Lab play sprites

Produced 17 October 2026 with the built-in `image_gen` tool, one call per asset and `transparent_background: true`. No reference images were supplied. The exact tool prompts below are embedded in the shipping PNGs with Impeccable `embed-prompt`.

Shipping files: `public/images/studio/football.png`, `basketball.png`, and `car.png`. All are 384 × 384 PNGs with native alpha. Sharp crops to the nonzero-alpha subject bounds, fits the longest dimension to 230 pixels, and centers the subject within a 384-pixel transparent canvas, preserving at least 20% clear padding on every side. It then uses lossless PNG compression; the generated colors and alpha remain intact.

The football uses opaque white painted panels; the car is a flat side view facing right with two visible wheels. Subjects are isolated, with no text, branding, background, floor or cast shadow.

Verification: every file has four channels and native alpha values from 0 to 255, with fully transparent outer space. The original near-opaque interior alpha (predominantly 252–254) is preserved. Light (`#ffffff`) and dark (`#17152b`) composites were visually inspected. Exact embedded prompts were recovered with `embed-prompt --read` and compared with the tool inputs.

| Asset | Dimensions | Shipping size | Fully transparent pixels |
| --- | --- | --- | --- |
| Football | 384 × 384 | 21,753 bytes | 118,376 |
| Basketball | 384 × 384 | 23,017 bytes | 119,454 |
| Car | 384 × 384 | 13,742 bytes | 130,792 |

## football

Source artifact: `C:/Users/USER/.codex/generated_images/01a14a80-22e6-7832-a3be-f5225badd9d8/exec-6d63f30e-dc95-4ff4-98f6-441b8d369524.png`

Exact prompt:

```text
Use case: stylized-concept
Asset type: single transparent 2D game sprite for the KodeArcade Byte Lab sprite library
Scene/backdrop: genuinely transparent background with native alpha, empty around the object
Subject: one classic black-and-white soccer football, round silhouette, recognizable black pentagonal panels and white panels
Style/medium: cute polished 2D game illustration, bold deep-indigo outlines, clean unbranded shapes, soft simple cel shading with an upper-left highlight; coherent friendly children's game art, highly readable at 60 pixels
Composition/framing: square canvas, exactly one complete object centered, approximately 20 percent transparent padding on every side, front view of the ball
Constraints: retain opaque white painted panels; alpha only outside the ball; no face, no characters, no text, no numbers, no logo, no watermark, no floor, no cast shadow, no background scene, no border, no sprite atlas
```

## basketball

Source artifact: `C:/Users/USER/.codex/generated_images/01a14a80-22e6-7832-a3be-f5225badd9d8/exec-2405eca0-0788-4684-842e-9ced37da91f5.png`

Exact prompt:

```text
Use case: stylized-concept
Asset type: single transparent 2D game sprite for the KodeArcade Byte Lab sprite library
Scene/backdrop: genuinely transparent background with native alpha, empty around the object
Subject: one orange basketball, round silhouette, bold black curved basketball seams and a few simple curved seam divisions
Style/medium: cute polished 2D game illustration, bold deep-indigo outer outlines, clean unbranded shapes, soft simple cel shading with an upper-left highlight; coherent friendly children's game art, highly readable at 60 pixels
Composition/framing: square canvas, exactly one complete object centered, approximately 20 percent transparent padding on every side, front view of the ball
Constraints: alpha only outside the ball; no face, no characters, no text, no numbers, no logo, no watermark, no floor, no cast shadow, no background scene, no border, no sprite atlas
```

## car

Source artifact: `C:/Users/USER/.codex/generated_images/01a14a80-22e6-7832-a3be-f5225badd9d8/exec-ff853e81-1523-4940-b189-c831ce051a9f.png`

Exact prompt:

```text
Use case: stylized-concept
Asset type: single transparent 2D game sprite for the KodeArcade Byte Lab sprite library
Scene/backdrop: genuinely transparent background with native alpha, empty around the object
Subject: one bright coral small car, complete compact rounded hatchback body, flat 2D side view facing right, exactly two visible circular wheels, clear pale-blue windows, a small front headlight at the right, dark wheels with simple pale hubs
Style/medium: cute polished 2D game illustration, bold deep-indigo outlines, clean unbranded shapes, soft simple cel shading with an upper-left highlight; coherent friendly children's game art, highly readable at 60 pixels
Composition/framing: square canvas, exactly one complete car centered, approximately 20 percent transparent padding on left and right and generous clear space above and below, horizontal level stance; pure side elevation without perspective or visible far-side wheels
Constraints: no face, no eyes, no driver, no characters, no text, no numbers, no logo, no watermark, no floor, no cast shadow, no background scene, no border, no sprite atlas
```


