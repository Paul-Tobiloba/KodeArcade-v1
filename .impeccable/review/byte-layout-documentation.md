# Ask Byte layout — documentation comparison

Date: 12 October 2026. Mode: Operate. Disposition: compatible scoped refinement of the incumbent Build & Play learning workspace; finish review records `ship`.

## Scope and authority

Read the Impeccable skill and `reference/document.md`, then compared `PRODUCT.md`, `DESIGN.md`, `.impeccable/surfaces/byte-help.md`, the preceding chat/session documentation and `.impeccable/review/byte-layout-finish.md` with `src/ByteHelp.tsx` and `src/byte.css`. This pass documents the requested chat layout and starter lifecycle. It does not regenerate the existing global design system or repair earlier drift. The global design files, implementation, assets and reward behavior are outside this write boundary.

The surface contract remains the authority for this local composition: a nonmodal help panel beside coding, a conversation that fills its available height, visible heading/composer/disclosure, and starters reserved for an empty conversation. The supplied cramped-layout capture is problem evidence, not an approved replacement composition. No new world, concept seed or composition tournament is needed for this narrow incumbent refinement.

## Comparison with the incumbent system

The panel preserves Fredoka for the Ask Byte heading, system type for reading and controls, Lucide controls, the approved Byte sprite, white and pale lavender surfaces, learning ink/muted text, violet actions and visible violet focus. Its bordered, rounded geometry agrees with the existing learning workspaces. No font, color identity, artwork, logo geometry or motion language is introduced.

| Local role | Final behavior and compatibility |
| --- | --- |
| Panel sizing | Width remains bounded at 410px and height is now bounded at 700px, with dynamic-viewport and safe-area clearance. The larger available conversation area is a local help-panel refinement, not a new global workspace proportion. |
| Flexible conversation | The column panel gives the transcript the remaining space through `flex: 1` and `min-height: 0`. Only the transcript uses vertical overflow; the panel clips overflow and the heading, composer and disclosure do not shrink. This keeps controls visible while long conversations scroll. |
| Empty-chat starters | Welcome copy and all three starters share the empty-message condition. A successful starter or submitted typed question appends the first message and removes the entire starter set. Merely editing an unsent draft does not start a conversation. Clear chat empties the messages, clears the error and restores the welcome/starters while returning focus to the composer. |
| Short windows | At heights up to 480px, heading/form padding compacts and the labelled textarea becomes 44px high with resizing disabled. The disclosure becomes .75rem/1.4 with reduced bottom padding. This intentional supporting footer role protects the question, actions and disclosure within the short viewport; it is not a new global body-text size. DESIGN.md already records .75rem learning utility labels and narrower .7rem labels. |
| Existing supporting type | The .8rem mode, read-aloud and standard disclosure/error roles remain local supporting text. The .875rem reading/control role and 1.2rem Fredoka heading retain the incumbent hierarchy. Detector size advisories do not require promoting these local roles into global typography tokens. |
| Existing color advisories | The lab border `#bcb3dc` and chat error tone `#9f173c` remain pre-existing local roles. The layout does not introduce or broaden either value; their advisory status is recorded without a palette rewrite. |
| Controls and semantics | Labelled textarea, 8–300-character input, 44px controls, polite conversation log, opening focus, Escape close/focus return, read-aloud and cancellation remain. These observations support the scoped comparison, not full accessibility certification. |

## Product and behavior boundaries

Authored on-device help remains explicit for learners/public users. The existing adult-only allowlisted experimental pilot retains its separate disclosure; starters and structural code checks stay local. The transcript remains bounded to 12 in-memory messages and clears on activity change or leaving the activity. Off-topic redirection, local fallback, read-aloud and pending-reply cancellation remain in the source. This documentation does not authorize child live AI or claim model evaluation is complete.

The panel keeps coding available beneath its nonmodal overlay and retains the existing lesson launcher and floating Byte launcher. The learning shell, Play placement, hints, stars, curriculum and session behavior are not changed by this layout refinement.

## Verification and finish evidence

The independent finish record reports `disposition: ship`, with no material fixes outstanding. It validates desktop, phone, tablet and short-desktop captures, including the compact supporting disclosure and visible composer. Its ceiling is reached for this scoped refinement.

Supplied implementation verification: production build passed; 16 Byte browser checks passed with two intentional short-desktop-only test skips; scoped axe checks reported no violations. These results and rendered acceptance are supplied evidence from the implementation/finish passes. This documentation pass inspected source and records, and did not rerun tests, build, browser captures, detector, provenance scanning or a live model.

## Handoff

The existing Byte surface contract accurately describes the final layout and starter behavior, so no corrective surface edit is needed. This report adds the scoped design comparison and advisory decisions. `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, implementation and assets remain untouched by this documentation pass; earlier drift remains recorded in the preceding chat/session documentation without repair.
