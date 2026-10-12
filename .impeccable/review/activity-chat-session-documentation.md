# Activity chat and session protection — documentation comparison

Date: 12 October 2026. Mode: Operate. Disposition: compatible ordinary extension of the incumbent Build & Play world on the evidence checked; no identity rewrite or global token refresh.

## Scope and authority

Read the Impeccable skill and `reference/document.md` in full, then compared `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `.impeccable/surfaces/activity-chat-session.md` and the previous Byte help brief with the final implementation. This is a scoped extraction/comparison pass, not regeneration of an existing DESIGN.md. The explicit write boundary is this report and `.impeccable/surfaces/byte-help.md`; the global product/design files are preserved.

Primary source evidence: `src/ByteHelp.tsx`, `src/byte.css`, `src/byteQuestionHelp.ts`, `src/SessionProvider.tsx`, `src/session.css`, `src/AccountPortal.tsx` and `src/MarketingPages.tsx`; implementation boundaries in `docs/ASK_BYTE.md` and `docs/SESSION_POLICY.md`. Supporting checks sampled `shared/session-policy.ts`, `server/session-policy.ts`, `shared/card-filename.ts`, PDF response/client filename wiring and classroom/family download anchors. Read the combined finish and verification records.

Inspected representative existing captures `byte-chat-desktop.png`, `session-warning-phone.png` and `session-expired-tablet.png`. They show the retained learning shell, the corrected My dashboard header while the adult session is active, and Log in after expiry while the protected form remains visible behind the dialog. The finish record validates all nine named Byte/warning/expiry captures across desktop, phone and tablet. This documentation pass did not create captures, run a browser, context launcher, detector, tests, build or provenance scan, inspect live accounts, or invoke a live model.

## Existing-world compatibility

The extension retains the original mark and wordmark, Fredoka heading voice, system reading/control type, Lucide icons, existing Byte sprite, deep purple learning navigation, white surfaces and pale lavender separation. The desktop three-area learning composition, narrow stacked shell and Play beneath the stage remain. Byte's floating panel overlays part of the editor while leaving learning available; session protection intentionally interrupts access through the browser's native modal behavior. These distinct interaction roles agree with the direction thesis.

No new font, artwork, mascot, logo geometry, palette identity or world metaphor is introduced. Existing art supplies the illustration role; the added panels are ordinary HTML controls. The supplied provenance result is seven existing world rasters with zero missing prompts, with no raster created or changed in this scope. That result was not independently rerun here.

## Local component roles and advisory decisions

| Local role | Observed implementation and decision |
| --- | --- |
| Entry to help | A full-width 44px guide launcher and a fixed 48px Byte launcher provide the same action. Their violet/white treatment and existing sprite extend established learning controls without a new header or navigation scheme. |
| Chat container | A 410px maximum white panel, 14px corners and learning-panel border, fixed at the lower right with safe-area offsets. Height is bounded to the viewport; at 600px and below the available height and transcript basis reduce. Panel/transcript scrolling is a local help pattern, not a new global workspace layout. |
| Reading hierarchy | Fredoka chat heading (1.2rem) and session heading (1.5rem); system chat body/control type (.875rem), with .8rem mode, read-aloud and note roles. The supplied detector's .8rem/1.5rem advisories are accepted as scoped component roles supported by the captures, without promoting them into global typography tokens. |
| Conversation and composer | White/pale lavender answer surfaces, a slightly indented user message, visible label and 8–300-character count; wrapping starters/actions and 44px controls. A polite log announces additions; opening focuses the composer and Escape closes with launcher focus return. These source semantics do not establish full accessibility certification. |
| Session gate | A native labelled modal, width bounded at 520px, 16px corners, 28px padding, wrapping 44px actions and visible violet focus. The local `0 16px 48px #18133933` shadow and `#1d1638cc` backdrop distinguish protected access; they do not replace the incumbent global dialog shadow. |
| Feedback | Existing learning ink/muted/border colors remain primary. The pre-existing lab field border (`#bcb3dc`) and new chat error tone (`#9f173c`) stay local. The supplied detector classifies these as advisories; neither warrants a global palette rewrite in this bounded task. |
| State styling | Violet primary send/stay/open-sign-in actions, pale violet hover, visible focus and disabled opacity continue the established control language. The floating launcher's small shadow is a local affordance. No new animation or ornamental raster region is needed. |

The old Byte surface brief described an inline native disclosure with three actions and one answer. That description is superseded by the actual floating chat panel and guide launcher; the authorized update records this current composition and its safety boundaries.

## Product and behavior truth

Byte offers typed coding questions, three authored starters, structural on-device program checks, read-aloud, clear, close, cancellation, off-topic redirection and local fallback after pilot failure. The current transcript is bounded to 12 messages in memory and clears on activity changes/unmounting; no chat history persistence is introduced. Starter/local responses preserve progressive hint and star behavior rather than adding route solutions.

For children and public users, the panel explicitly says authored coding help, not live AI, and states that questions/programs stay on-device. `localByteAnswer` selects bounded authored topic/task/check content. The existing private pilot is limited to verified allowlisted adults per the implementation documentation; the widget sends only topic and typed question. Code, child identity, saved progress and conversation history are excluded, and starters/checks remain local for adult testers. Loading, cancel and unavailable-model fallback are visible. Child live-model rollout, educator/model evaluation, privacy approval and cold-start reliability remain incomplete; this documentation does not treat a typed-question interface as completion of those requirements.

Session timing is precise: adults receive a warning at 55 idle minutes and lose access at 60, while all sessions have a 24-hour absolute cap; learners have no idle timeout. Human adult interaction sends throttled activity requests before warning/expiry; background polling does not renew access. The server policy enforces deadlines, while the provider checks locally and refreshes on focus, visibility/route changes and a visible-tab interval. Existing school-only mandatory 2FA and the separate 30-minute management unlock are unchanged, as recorded in the session policy documentation.

At expiry the provider leaves its children mounted behind the native modal. Same-account sign-in in a new tab can restore access to the existing form; a different account reloads the page. Retention is only current-tab memory: close, crash or refresh can lose unsaved form data. The dialog says this directly, and existing encrypted learner recovery/cloud-save limits remain separate. Temporary learner reauthentication does not grant save authorization before valid access returns.

Marketing navigation uses the appropriate session dashboard destination; login/signup entry routes redirect an authenticated user. The final account header uses `active.session`, including authenticated onboarding/loading/error presentation, with Account settings on the established dashboard layout and My dashboard elsewhere. This corrects the single scored finish finding without discarding the protected form.

Private single-card PDF filenames use the already authorized learner display name as an ASCII, bounded, path-safe prefix; multi-child booklets use the class prefix. The server response supplies the name, the PDF client preserves it in a File, and classroom/family download anchors use that File name. Credentials are excluded from filenames; the documented private/no-store/one-time download boundary remains. This is a naming extension, not a new identity collection flow.

## Verification and finish record

The supplied verification reports 1,027 frontend unit tests, 131 server tests, 24 targeted Byte/session browser checks across three viewports, server typecheck and frontend build passing. Scoped axe checks report no violations for the Byte panel and idle warning. One detector pass reported zero primary findings with the local advisories above. These are supplied implementation results, not independently rerun by this documentation pass.

The broader browser run initially passed 84 of 87 checks; three family recovery assertions expected the superseded discarded-dashboard behavior. After updating those expectations and correcting the authenticated header, the latest family/session batch passed all 27 checks, including the three affected cases. This is not a claim that the entire 87-check suite was rerun after the correction. The finish review records the single header finding resolved, all six session recaptures valid, and `disposition: ship`, scoped to that scored fix. It preserves the original review limits and does not certify the whole platform, security, curriculum, accessibility or child model access.

## Pre-existing drift, recorded without repair

- `.impeccable/design.json` still describes unchanged local progress/deferred account scope in `extensions.learningWorld.compatibility`; current PRODUCT milestone paragraphs and backend/account documents supersede that old status. Its 9 October generated timestamp also precedes its 10 October motion/loading prose.
- The sidecar narrative's Do list omits later instruction-budget, interactive-runtime, activity-list and module/drawing navigation rules already present in DESIGN.md. This predates the chat/session extension.
- Global navigation/nickname examples describe the earlier public learning baseline, and the global Don't example mentions unimplemented accounts alongside other older boundaries. The current authenticated implementation intentionally specializes those examples. Earlier PRODUCT paragraphs retain historical no-backend/local-only milestones, followed by current implementation paragraphs; they must not be read as today's availability claims.
- The existing global artifacts do not yet catalogue the local Byte chat/session components. Their absence does not invalidate compatible scoped components or authorize replacing the world. The surface brief and this report supply current local documentation within the approved boundary.

No drift repair was performed. PRODUCT.md, DESIGN.md and `.impeccable/design.json` retain SHA-256 values `5DD3EFCA5BD3FC71036AE08FD6DC63BAC034A9FE9EA124C168306D65C9F34581`, `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE` and `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`, respectively.

## Handoff

The activity chat/session extension is consistent with the incumbent identity and combined direction contract within the documented local roles and limits. The updated Byte brief reflects the current implementation; global product/design artifacts, source and assets are unchanged by this pass. The independent finish verdict remains the authority for rendered acceptance, with child live AI and durable form recovery explicitly outside the delivered claim.
