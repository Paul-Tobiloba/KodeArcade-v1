# Byte Lab game sprite prompts

Mode: built-in `image_gen.imagegen`; one generation call per asset; `transparent_background: true` for every call. Original native PNG alpha is preserved when scaling to 384 × 384 with Sharp. Exact prompts are embedded with Impeccable `embed-prompt` and read back for verification.

| Sprite | Output |
| --- | --- |
| RaceCarRed | `public/images/studio/racecarred.png` |
| RaceCarBlue | `public/images/studio/racecarblue.png` |
| RaceCarYellow | `public/images/studio/racecaryellow.png` |
| BasketballBoy | `public/images/studio/basketballboy.png` |
| BasketballGirl | `public/images/studio/basketballgirl.png` |
| BasketballHoop | `public/images/studio/basketballhoop.png` |

## racecarred

```text
Use case: stylized-concept
Asset type: isolated 2D children's coding-game sprite, RaceCarRed
Primary request: one bright red sport coupe race car seen strictly from directly above, nose pointing straight UP toward the top edge.
Scene/backdrop: genuinely transparent background with native PNG alpha.
Subject: sleek long low coupe silhouette, tapered front hood, two small white racing stripes along the red hood and roof, dark navy windshield and rear glass, four small dark tires peeking symmetrically at the sides. Distinct long sporty body readable at 50px.
Style/medium: polished friendly cartoon illustration, bold smooth dark navy outlines, simple saturated colors, restrained soft highlights matching playful children's educational game assets.
Composition/framing: strict orthographic 90-degree overhead view; symmetrical vertical alignment, centered full car, square canvas, generous transparent padding on all sides. Show roof and hood only as overhead shapes, no visible front or side elevation.
Constraints: one complete car only; clear strong silhouette; native transparency including all surrounding space. No road, ground, ground shadow, perspective, scenery, ball, people, words, numbers, logos, watermark or border.
```

## racecarblue

```text
Use case: stylized-concept
Asset type: isolated 2D children's coding-game sprite, RaceCarBlue
Primary request: one cobalt blue rally hatchback car seen strictly from directly above, nose pointing straight UP toward the top edge.
Scene/backdrop: genuinely transparent background with native PNG alpha.
Subject: short wide squared rally hatchback silhouette, broad blue hood with one small white central accent, large dark navy windshield, compact roof, visible black rear spoiler across the lower rear, four small dark tires peeking symmetrically at the sides. Distinct boxy rally shape readable at 50px.
Style/medium: polished friendly cartoon illustration, bold smooth dark navy outlines, simple saturated colors, restrained soft highlights matching playful children's educational game assets.
Composition/framing: strict orthographic 90-degree overhead view; symmetrical vertical alignment, centered full car, square canvas, generous transparent padding on all sides. Show roof and hood only as overhead shapes, no visible front or side elevation.
Constraints: one complete car only; clear strong silhouette; native transparency including all surrounding space. No road, ground, ground shadow, perspective, scenery, ball, people, words, numbers, logos, watermark or border.
```

## racecaryellow

```text
Use case: stylized-concept
Asset type: isolated 2D children's coding-game sprite, RaceCarYellow
Primary request: one sunny yellow chunky compact city car seen strictly from directly above, nose pointing straight UP toward the top edge.
Scene/backdrop: genuinely transparent background with native PNG alpha.
Subject: very short rounded chubby compact silhouette, bulbous yellow hood, rounded dark navy windshield and rear glass, curved roof, small side mirrors, four small dark tires peeking symmetrically at the sides. Distinct cute rounded chunky body readable at 50px; no racing stripes and no spoiler.
Style/medium: polished friendly cartoon illustration, bold smooth dark navy outlines, simple saturated colors, restrained soft highlights matching playful children's educational game assets.
Composition/framing: strict orthographic 90-degree overhead view; symmetrical vertical alignment, centered full car, square canvas, generous transparent padding on all sides. Show roof and hood only as overhead shapes, no visible front or side elevation.
Constraints: one complete car only; clear strong silhouette; native transparency including all surrounding space. No road, ground, ground shadow, perspective, scenery, ball, people, words, numbers, logos, watermark or border.
```

## basketballboy

```text
Use case: stylized-concept
Asset type: isolated 2D children's coding-game sprite, BasketballBoy
Primary request: one friendly young Black boy basketball player, full body front-facing, ready to bounce or catch a ball above him.
Scene/backdrop: genuinely transparent background with native PNG alpha.
Subject: warm dark brown skin, short tightly curled black hair, cheerful focused smile, large expressive eyes, teal basketball singlet and navy shorts, orange and white sports shoes. Feet planted apart, knees gently bent, both arms open and raised outward at shoulder level with palms facing upward, empty hands.
Style/medium: polished warm children's cartoon character, bold clean dark outlines, simple saturated colors with gentle dimensional shading, lively friendly proportions and readable silhouette, like a children's coding-game character sticker.
Composition/framing: centered full body facing directly forward, square canvas, generous transparent padding around head, hands and shoes; complete arms and legs visible.
Constraints: one child only; exactly two arms and two legs; no ball, hoop, court, ground, ground shadow, scenery, text, jersey numbers, logos, watermark or border. Actual native alpha in the background and gaps between limbs.
```

## basketballgirl

```text
Use case: stylized-concept
Asset type: isolated 2D children's coding-game sprite, BasketballGirl
Primary request: one friendly young brown-skinned girl basketball player, full body front-facing, ready to bounce or catch a ball above her.
Scene/backdrop: genuinely transparent background with native PNG alpha.
Subject: warm medium brown skin, dark curly hair gathered into two puff ponytails, cheerful focused smile, large expressive eyes, violet basketball singlet and matching shorts with teal trim, white and orange sports shoes. Feet planted apart, knees gently bent, both arms open and raised outward at shoulder level with palms facing upward, empty hands.
Style/medium: polished warm children's cartoon character, bold clean dark outlines, simple saturated colors with gentle dimensional shading, lively friendly proportions and readable silhouette, like a children's coding-game character sticker.
Composition/framing: centered full body facing directly forward, square canvas, generous transparent padding around head, hands and shoes; complete arms and legs visible.
Constraints: one child only; exactly two arms and two legs; no ball, hoop, court, ground, ground shadow, scenery, text, jersey numbers, logos, watermark or border. Actual native alpha in the background and gaps between limbs.
```

## basketballhoop

```text
Use case: stylized-concept
Asset type: isolated 2D children's coding-game sprite, BasketballHoop
Primary request: one basketball hoop assembly viewed straight from the front: white rectangular backboard, vivid orange rim and hanging white net.
Scene/backdrop: genuinely transparent background with native PNG alpha.
Subject: broad white rectangular backboard with rounded corners and bold navy edge, small simple orange target rectangle at its center, orange oval rim projecting slightly in front at the lower center, tapered white rope net hanging beneath the rim. Clear open alpha gaps between the net cords; white backboard remains opaque white.
Style/medium: polished friendly cartoon illustration, bold smooth dark navy outlines, clean saturated colors and restrained soft highlights matching playful children's educational game assets.
Composition/framing: centered complete assembly, front view, square canvas with generous transparent margin around backboard and net; balanced wide backboard above hanging net, no support pole or stand.
Constraints: one hoop assembly only; no ball, people, pole, stand, wall, court, ground, ground shadow, scenery, words, numbers, logos, watermark or border. Preserve actual native alpha around the object and inside net gaps.
```

## Validation and native sources

All six shipping PNGs are 384 × 384 RGBA. Their 1254 × 1254 native alpha was preserved through resizing; no chroma key, background flattening, or recoloring was used. Impeccable prompt readback matched each exact generation string. Both light and dark contact sheets were inspected; the white backboard and white net remain solid while background, limb gaps, and net openings are transparent.

Review composites (ignored build artifacts): `output/byte-lab-games/contact-sheet-light.png` and `output/byte-lab-games/contact-sheet-dark.png`.

| Sprite | Original built-in output |
| --- | --- |
| racecarred | `C:\Users\USER\.codex\generated_images\01a14d87-478c-7081-841d-23172713d734\exec-b08eafb5-b2f9-44f9-b45b-ed243b687140.png` |
| racecarblue | `C:\Users\USER\.codex\generated_images\01a14d87-478c-7081-841d-23172713d734\exec-7f20adaf-f1f0-40d7-bad5-9254e81160cb.png` |
| racecaryellow | `C:\Users\USER\.codex\generated_images\01a14d87-478c-7081-841d-23172713d734\exec-90e92d67-d715-42e0-a471-52cd03a17ac6.png` |
| basketballboy | `C:\Users\USER\.codex\generated_images\01a14d87-478c-7081-841d-23172713d734\exec-869e39e8-9490-4163-b7f6-4ab371f90348.png` |
| basketballgirl | `C:\Users\USER\.codex\generated_images\01a14d87-478c-7081-841d-23172713d734\exec-51557ef5-6212-4d7f-9cf2-cc678c252d4c.png` |
| basketballhoop | `C:\Users\USER\.codex\generated_images\01a14d87-478c-7081-841d-23172713d734\exec-90ea4a4d-767e-4d38-933a-7d1cc0480a3c.png` |


