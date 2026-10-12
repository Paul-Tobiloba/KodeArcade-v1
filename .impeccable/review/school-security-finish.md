disposition: ship

## Disposition

Ship the scoped school 2FA and 30-minute management-unlock refinement. No material UI finding remains in the supplied sources and nine required captures. This is an incumbent Operate-surface extension, evaluated against PRODUCT.md, DESIGN.md and `.impeccable/surfaces/src-schoolmfanotice-tsx.md`; a new comp, concept seed, QUALITY BAR card and raster asset are not required by that narrow contract.

## Evidence and coverage

Independently opened all nine required PNGs. Each shows the document top, the named surface, settled readable content and the full page without a blank/black capture region or cropped final action. Dimensions are image pixels, not asserted CSS viewport dimensions.

| Surface | Desktop | Phone | Tablet |
| --- | --- | --- | --- |
| School MFA gate | `school-mfa-gate-desktop.png`, 1440×1000 | `school-mfa-gate-phone.png`, 1082×3583 | `school-mfa-gate-tablet.png`, 1620×2258 |
| Account security for school setup | `school-security-desktop.png`, 1440×1099 | `school-security-phone.png`, 1082×4064 | `school-security-tablet.png`, 1620×2672 |
| Expanded management-unlock success | `management-unlock-desktop.png`, 1440×1000 | `management-unlock-phone.png`, 1082×3187 | `management-unlock-tablet.png`, 1620×2264 |

The following checks cover the supplied direction contract and requested refinement:

| Promise or salient element | Assessment | Evidence |
| --- | --- | --- |
| Gate school creation and administrator tools | Match | `src/SchoolManager.tsx:61`, `:99` and `:128` gate existing administration, school creation and administrator invitation acceptance; `src/ClassroomManager.tsx:50` gates school-administrator classroom access. The MFA-gate captures show one setup action and no irrelevant management password form. |
| Keep parents and teachers optional | Match | `src/SchoolMfaNotice.tsx:17` explicitly excludes adults who are not school administrators; `src/AccountWorkspace.tsx:43` and `:49` select required versus optional copy; the classroom gate is restricted to the school-admin role. |
| Return to the original school action after enrollment | Match in source; behavior supplied | `src/SchoolMfaNotice.tsx:3` preserves the route; `:7` allowlists return routes. `src/AccountWorkspace.tsx:72` keeps backup-code acknowledgment before `:77` exposes Continue school setup. The source does not grant a role as part of this link. |
| Thirty-minute privilege window with clear session boundary | Match | All three unlock captures show an actual expiry and explain that account-session lifetime is separate. `src/ClassroomManager.tsx:94` uses server-returned remaining seconds, `:95` restores the locked state at expiry, and `:104`–`:105` clears the submitted form and applies the response duration. |
| Success collapses the password task | Match in source; expanded evidence shown | `src/ClassroomManager.tsx:96` uses native details with `open={!until}`; the success branch at `:98` replaces the password form with expiry text. Captures intentionally show the details expanded to inspect that text. |
| TYPE | Match | Fredoka headings and plain reading/control typography retain the incumbent hierarchy; MFA and security headings wrap cleanly on the phone. |
| MATERIAL | Match | Flat white reading surfaces, restrained violet controls and Lucide geometry retain the existing workspace treatment. No new imitation material or illustration is introduced. |
| GROUND | Match | The new content stays on the incumbent white workspace with violet account navigation and existing surrounds; no local ground or palette replacement is apparent. |
| Responsive composition and control clarity | Match | Single-column phone reading order, intact tablet layout, visible field labels and complete setup/action labels across all captures. No changed-content clipping or horizontal overflow is visible. |

The implementation packet reports: production build passed; scoped API integration 39 tests passed; seven account tests passed including real Better Auth enrollment/TOTP sign-in; 30 deterministic browser checks passed across desktop/phone/tablet, including scoped axe and return-to-school setup; three final setup recaptures passed after removing the pre-MFA password prompt; one detector run over the four changed TSX targets returned `[]`. These results were supplied, not rerun by this reviewer.

## Material findings

None within the requested refinement. No ordered source fix, recapture or rebuild is required by this review.

## Nonblocking notes

Keep the explicit optional-role sentence, the backup-code acknowledgment before returning, the real expiry time and the distinction between management unlock and account-session lifetime. They communicate the actual policy without implying enrollment itself grants school access.

The text-only setup-key enrollment at `src/AccountWorkspace.tsx:52` is a usable incumbent flow with a labelled code-confirmation form; a QR enhancement is outside this refinement. The supplied screenshot set does not display the setup-key/backup-code state itself.

## Verification limits

This review independently inspects source and static screenshots only. It does not reproduce keyboard interaction, screen-reader output, computed contrast, enrollment/sign-in requests, server enforcement or the full 30-minute expiration in a browser. Runtime confidence relies on the implementation packet's scoped tests. Screenshot dimensions establish complete image evidence, not the original CSS viewport/DPR settings.

Scope excludes existing navigation/background treatment and pending Byte widget/session work. This is neither whole-platform accessibility approval nor security certification, and it makes no production-readiness claim.
