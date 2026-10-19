# Reward stars — documentation comparison

Date: 12 October 2026. Mode: Operate. Status: documented. Final finish disposition: `ship` for the scoped reward dialog in `reward-stars-finish.md`.

## Scope and authority

Compared PRODUCT.md and DESIGN.md with `src/FeedbackDialog.tsx`, the reward section of `src/course.css`, `.impeccable/surfaces/reward-stars.md`, the exact asset prompt and the finish review. Read the Impeccable skill and `reference/document.md`. This is a narrow documentation pass for the owner-approved shiny golden 2D star treatment, gentle arch and bounded reveal. It does not regenerate the incumbent design system or repair unrelated drift.

The approved right-hand arrangement reference is recorded in the surface contract. It governs star material, hierarchy and arrangement rather than the whole dialog. The new raster is a permitted local expansion of the existing reward illustration role. The white dialog, Fredoka heading, system reading/control type, violet action, existing success message, next-challenge caption and Close/Next controls retain the incumbent composition.

DESIGN.md describes Build & Play and the existing typography, rounded controls, semantic success feedback and reduced-motion commitment. Its older generic pale-green success-container description does not describe this existing white star dialog precisely. The source and approved surface contract establish the local white treatment; that discrepancy is recorded without changing global rules. No new logo geometry, font, palette identity or visual-world replacement follows from the golden sprite.

## Local component contract

| Role | Implemented behavior |
| --- | --- |
| Star hierarchy | Five uses of one upright sprite. Grid proportions are `.58fr .8fr 1fr .8fr .58fr`; centre, paired neighbours and paired ends are vertically offset by −8px, 8px and 22px. The group uses the smaller of available width and 392px. These are local reward dimensions, not global spacing tokens. |
| Earned material | The transparent illustrated gold sprite supplies amber edges, yellow/honey shading and painted white highlights. CSS does not replace it with a bevel or a generic star icon. |
| Unearned state | The same silhouettes remain visible with grayscale and .3 image opacity. Partial rewards preserve five positions while clearly distinguishing earned gold from unearned stars. |
| Reveal | Earned stars reveal in score order after 250ms, then every 350ms. Each newly earned star receives one 500ms scale pop and one masked 700ms shine after a 200ms delay; neither animation repeats. The pop scales .55 → 1.08 → 1 without rotating the star. |
| Reduced motion | The supplied reduced flag reveals the final earned count immediately and skips reveal callbacks/confetti. The `still-stars` class and system media query remove pop and shine. Supplied browser checks cover saved and system preferences. |
| Continue and dismiss | Close and Next remain available during reveal. Native dialog cancellation calls the existing close handler; cleanup cancels outstanding star timers. No reward completion gate delays navigation. |
| Accessible description | One labelled `role="img"` announces “You earned N of 5 stars”; decorative spans and empty-alt sprite images avoid five repeated announcements. The native dialog remains labelled by its focused success heading. |

The component receives `stars` as a prop and retains the existing `onStar` cue. This refinement does not calculate scoring, modify retry/hint caps, change saved bests or add an audio system. Existing confetti remains a bounded success effect and is removed for reduced motion.

## Asset provenance

One new shipping raster is used: `public/images/rewards/golden-star.png`, generated with the built-in image-generation tool. The exact generation prompt is retained at `.impeccable/assets/reward-star-prompt.txt` and embedded in the raster, according to the supplied provenance result. The prompt requests one centred transparent upright golden star with clean margins, no text, face, particles or exterior shadow, reused five times by the application. The surface contract records the original arrangement-reference path; generation metadata records the original tool output separately from the shipping copy.

Original built-in image tool output: `C:/Users/USER/.codex/generated_images/01a100b3-40c1-7263-b63a-2bf67ab4d1cb/exec-9dc01a4b-54de-4f30-8db4-6d96bc1c6f6a.png`. The shipping copy preserves its pixel data and adds the prompt metadata. The supplied scoped scan reports one raster and zero missing prompts; the supplied alpha check reports transparent corners. This documentation pass read the prompt and source references without independently rerunning PNG provenance or alpha checks. The approved sprite is a local reward asset rather than a new global illustration specification.

## Verification and finish record

The supplied verification reports a passing production build, 12 reward browser checks across desktop, phone and tablet, and 13 reward-scoring unit tests. Browser coverage includes full and partial rewards, reduced-motion modes, Close/Next behavior, reveal cancellation and scoped axe checks with no reported violations. These results are implementation evidence, not tests rerun by this documentation pass or whole-platform accessibility certification.

All six required dialog crops exist: `reward-stars-desktop.png`, `reward-stars-phone.png`, `reward-stars-tablet.png`, `reward-stars-partial-desktop.png`, `reward-stars-partial-phone.png` and `reward-stars-partial-tablet.png`. The finish reviewer opened all six and found complete settled dialogs without clipped stars, copy or controls. This documentation pass also inspected the full desktop and partial phone crops; they show the approved hierarchy and subdued unearned silhouettes. Still images establish settled visual composition, while motion assessment relies on inspected source and the supplied browser checks.

`reward-stars-finish.md` records `disposition: ship` with no material fixes. Its verdict is limited to this requested dialog refinement. PRODUCT.md, DESIGN.md, `.impeccable/design.json`, application source and assets are unchanged by this documentation pass; only this report and the surface contract's finish wording were updated. The global design system remains intact, and unrelated pre-existing drift is outside this handoff.
