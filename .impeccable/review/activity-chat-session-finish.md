disposition: fix

Inputs/limits: no separate QUALITY BAR card or critique-reference comp was supplied; this is the explicitly code-led incumbent extension. Review used the nine named captures and sampled changed source/tests/docs; no browser, detector or tests were run by this reviewer. The broader 87-check regression batch was still pending in the packet.

## persistence

Pass for the incumbent extension: PRODUCT.md, DESIGN.md, .impeccable/design.json and .impeccable/surfaces/activity-chat-session.md exist. The surface records Operate mode, the five contract blocks and the code-led/no-tournament decision. Its precise incumbent-extension FORM is the authority for omitting a new concept seed, comp round and build-state gates. Existing DESIGN.md's Fredoka/system reading split, violet/white/lavender learning world, Lucide controls and border-led workspaces match the captures. Small scoped sizes and error-color additions flagged as detector advisories do not establish a material system failure or justify global drift repair.

Evidence passes: all nine required files exist, show their named states, include the page top and contain readable UI without blank/black regions. Desktop captures are 1440×1000; Byte phone/tablet full-page captures are 1082×4728 and 1620×3876; session phone/tablet captures are 1082×2202 and 1620×2160. The high-density and tall captures are consistent with their device classes. Sample Adult and the unsaved classroom plan are synthetic fixture content, not real account records.

## fidelity

| Element or promise | Assessment | Evidence |
| --- | --- | --- |
| TYPE | match | Fredoka headings and plain system reading/control type continue the incumbent voice across all nine captures. The 1.2rem chat heading and 1.5rem session heading have clear hierarchy without competing with the task. |
| MATERIAL | match | Existing raster Byte sprite and semantic tile artwork remain visible; new help/session chrome is honest flat UI. No new image region, fake physical material or raster asset obligation is introduced. |
| GROUND | match | White panels, pale lavender learning canvas and violet controls keep the OWN-WORLD palette. The account artwork stays behind the session backdrop rather than becoming new decoration in the dialog. |
| THESIS: help one tap away, protect account access | match | Launcher and nonmodal panel keep the task present; session warning/expiry use protected native dialogs. Play remains separately identifiable. |
| OWN-WORLD: retain layout and branding | match | Three-part learning layout on desktop and existing stacked phone/tablet layout remain; Byte, Lucide and existing wordmark are retained. |
| STORY: starters, typed question, bounded hints, return to code | match | ByteHelp.tsx supplies three starters, labelled 8–300-character composer, local program checks, read-aloud, close, clear, cancellation and error fallback. e2e/byte.spec.ts checks local help, off-topic redirection, unchanged hint counts, cancellation, fallback and drawing-specific explanation. |
| Child/public typed help versus adult pilot | adaptation | Explicit safety boundary in the brief and docs/ASK_BYTE.md: learner/public text receives authored on-device help, visibly labelled “not live AI”; verified allowlisted adults alone can use the experimental pilot. This does not complete or claim child live-model rollout. |
| FIRST VIEWPORT: responsive help composition | match | byte-chat-desktop.png, byte-chat-phone.png and byte-chat-tablet.png show title/close, transcript, starters, labelled composer and disclosure. The phone transcript is internally scrolled to its latest response; this is bounded transcript scrolling, not cut-off page evidence. The panel is nonmodal and closes separately from learning controls. |
| Adult warning at 55 minutes / expiry at 60 | match | All three warning captures state the exact timing and offer Stay signed in / Sign out with visible focus. SessionProvider.tsx and server/session-policy.ts provide local deadline checks and server expiry/activity enforcement. |
| Student maximum 24 hours / no idle expiry | match, source/test evidence | SessionProvider.tsx excludes learners from idle renewal/warnings; docs/SESSION_POLICY.md and the targeted student browser test cover 61 idle minutes without a warning and expiry at 24 hours. The supplied session screenshots intentionally cover adult dialogs. |
| Preserve open unsaved work through reauthentication | match within stated limit | All expired captures explain same-account sign-in in a new tab and warn against refresh. SessionProvider.tsx keeps children mounted and reloads for a different user; e2e/session.spec.ts retains the synthetic form value after same-account recovery. This is tab memory only, not durable form saving. |
| Authenticated navigation instead of another login | contradicted | MarketingNav uses session-aware My dashboard and login-entry routes redirect, but AccountPortal.tsx:56 chooses Log in from the dashboard layout flag. Authenticated onboarding deliberately sets dashboard false, so every session-warning capture still shows Log in behind the dialog. The same incorrect link is present before the warning and can recur during private-route loading/errors. |
| Child-name-prefixed PDF download | match, sampled source evidence | shared/card-filename.ts derives a bounded safe learner prefix; accountPdf preserves the supplied filename in a File; classroom and family download anchors use blob.name/cardName. docs/SESSION_POLICY.md supplies the classroom/home examples and class-prefixed booklet rule. Backend filename wiring is supported by supplied verification, not independently re-executed here. |

Request/viewport coverage: desktop, phone and tablet each cover Byte chat, adult warning and adult expiry. The packet reports 1,027 unit tests, 131 server tests and 24 targeted browser checks passing, plus frontend build/server typecheck and zero scoped axe violations on the Byte panel and warning dialog. These are builder results, not independent reviewer certification; screenshots do not prove all keyboard, offline, security or live-model behavior. Existing school mandatory 2FA and the separate 30-minute management unlock remain outside the visual change and are explicitly retained in the session documentation.

## ceiling

Reached for the narrowed incumbent UI extension, except the navigation contradiction below. Brand expression stays in Fredoka, Byte and violet controls; readable white surfaces, 44px controls, visible focus, restrained separation and a protected session interruption serve Operate mode. No new motion, ornamental frame, depth treatment or raster scene is needed for this scope. The .8rem supporting labels, 1.5rem dialog heading and scoped error tone are legible intentional component roles in these captures; detector advisories alone are not material fixes. No new banned eyebrow, gradient text, glyph-icon substitute, hard block shadow or artificial physicality was found in the changed UI.

## material_fixes

1. Authenticated navigation / coverage: make AccountPortal.tsx:56 derive its signed-in destination and label from active.session rather than the dashboard layout flag; authenticated onboarding, private-route loading and error states must expose the appropriate dashboard/account destination. Add an authenticated-onboarding navigation assertion and confirm the account header in the same three session capture paths. Preserve the mounted form while correcting the link.

## keep

Keep the local-help versus adult-pilot disclosure, unchanged hint/star accounting, existing Byte/learning identity, visible session actions and explicit same-tab-only recovery warning; ship remains blocked on the single authenticated-header correction, and this review does not approve child live AI or certify the whole platform.

## verdict

Resolved — the single authenticated-navigation finding: refreshed session-warning-desktop.png, session-warning-phone.png and session-warning-tablet.png now visibly show My dashboard while the synthetic adult session is active. The longer phone label wraps its navigation into a readable second row without clipping or crowding the dialog. The three refreshed expired captures correctly show Log in after the fixture session becomes null, while preserving the protected form and same-tab-only recovery explanation. All six recaptures are valid; no material regression from this fix is visible. The builder reports the new authenticated-onboarding destination/no-login assertions and 27 session/family checks passing across three viewports, with the earlier family expiry assertions updated to the retained-form behavior; these tests were not independently rerun by this reviewer.

## remaining

Clear. This ship verdict covers the scored navigation fix, not the whole surface. Original limits remain: children/public users receive authored on-device help, child live-model rollout is not enabled or approved, and unsaved forms survive only in the current tab's memory. The original review and supplied verification limits remain part of the record.

disposition: ship
