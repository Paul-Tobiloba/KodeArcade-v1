# School security documentation — 12 October 2026

This records a narrow Operate-mode extension of the incumbent account workspace. The changed behavior requires confirmed two-step verification for school setup and school administration, leaves enrollment optional for parents and teachers without an administrator role, and gives sensitive management a 30-minute unlock. It does not establish production readiness or certify the application globally.

## Evidence inspected

Read the Impeccable document reference, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, and `.impeccable/surfaces/src-schoolmfanotice-tsx.md`. Inspected `src/SchoolMfaNotice.tsx`, `src/SchoolManager.tsx`, `src/AccountWorkspace.tsx`, `src/ClassroomManager.tsx`, their current diff, and relevant incumbent rules in `src/account.css`. Also read the updated `docs/SCHOOL_ADMINISTRATION.md` and `docs/FAMILY_LEARNING.md`.

Visually inspected all nine supplied review captures:

- `school-mfa-gate-desktop.png`, `school-mfa-gate-phone.png`, `school-mfa-gate-tablet.png`.
- `school-security-desktop.png`, `school-security-phone.png`, `school-security-tablet.png`.
- `management-unlock-desktop.png`, `management-unlock-phone.png`, `management-unlock-tablet.png`.

These captures show the school-creation gate, school-directed security settings before enrollment, and the expanded successful unlock explanation. They do not individually demonstrate every enrollment, invitation, error, expiry, or optional-parent state. Those behaviors below are supported by inspected source or supplied test evidence, as identified.

## Incumbent visual system preserved

The extension reuses the existing account shell: deep violet navigation, pale violet workspace navigation, white reading surface, Fredoka headings, system text and controls, and Lucide line icons. The approved mark and existing illustrated backdrop remain as rendered in the supplied captures. The desktop sidebar becomes the existing wrapping top navigation at compact widths; phone content retains the same single-column order and normal document scrolling. Headings, explanatory text and setup actions wrap within the white surface without visible clipping in the inspected captures.

`SchoolMfaNotice` uses the existing security section and primary account action. It introduces no new visual primitive or stylesheet. `ShieldCheck` and `ArrowRight` are existing Lucide vocabulary; the icon supplements a written heading and action. The school creation disclosure and management disclosure retain native `details`/`summary` behavior. Enrollment retains the existing `Password`, `Submit` and `Notice` components, visible input labels, private setup key and backup-code presentation.

The account-scoped CSS remains the source of its incumbent values: account action violet (`#6237df`), navigation purple (`#241259`), text (`#181339`), supporting text (`#575472`), and account border (`#d7cee9`). Existing controls keep their established rounding, spacing and minimum heights; management retains its pale violet container, 14px corners, 44px summary target and narrow form measure. The existing account focus outline and reduced-motion gating remain in force. There is no `src/account.css` diff in the inspected change.

No new colors, typography, spacing, radius, elevation, motion tokens, component-system changes or assets were introduced by this UI refinement. Root `DESIGN.md` and `.impeccable/design.json` were read and preserved. This report records the task-local states without promoting them into new global design rules.

## States and copy

| Context | Resulting state and copy |
| --- | --- |
| School creation without confirmed 2FA | The existing creation disclosure shows “Protect your school with two-step verification,” explains pupil-record/staff access, says enrollment is optional for parents and teachers who are not administrators, and offers “Set up two-step verification.” No redundant management password prompt precedes this gate. |
| Existing school administrator without confirmed 2FA | School administration and school class-management surfaces render the same notice. The school staff request is skipped in this state. |
| Administrator invitation without confirmed 2FA | The invitation context remains visible and the same notice replaces acceptance controls. Teacher invitations retain their existing acceptance workflow. |
| Account security reached for school setup or held administrator role | The requirement reads “Required for school administrators before creating or administering a school.” |
| Ordinary parent or teacher account security | The requirement reads “Optional for parents and teachers. Add a code from your authenticator app for extra protection.” This source-supported branch is not shown in the supplied school-directed settings captures. |
| Enrollment in progress | Existing current-password confirmation, manual authenticator setup key, authenticator-code confirmation and private backup-code states remain. Enabled status uses the existing notice. |
| School enrollment complete | After saving backup codes and refreshing the account, “Continue school setup” returns to the preserved school action. The return helper permits the named local school/class routes and falls back to school setup; enrollment itself grants no school role. |
| Management locked | The family/classroom summary and password form remain. Copy now states “Management stays unlocked for 30 minutes.” An authenticator field appears for adults who enabled 2FA. |
| Management unlocked | The summary becomes “Management unlocked”; the credential form closes. Expanding the native disclosure shows the actual localized expiry and explains that the 30-minute unlock applies only to this sign-in and does not extend the account session. The supplied unlock captures deliberately show this expanded explanation. |
| Management refresh or expiry | Source restores remaining time from management status and calculates expiry using the server-returned seconds. The local expiry timer returns the disclosure to its locked form. |
| Busy or failed operation | Existing busy submit behavior and `Notice` errors remain; no new visual error language is introduced. |

The school and family operational documents now describe optional enrollment for parents/teachers, the administrator requirement, preserved return context and the 30-minute session-bound management grant. This documentation pass did not independently validate the backend authorization implementation.

## Existing documentation drift retained

The root design document primarily captures the brand, public pages and learning workspace. The newer account workspace has scoped CSS values and components that are not fully represented by the root frontmatter or sidecar examples, including its focus treatment, 48px form controls and management disclosure. These are incumbent account patterns, not token additions made by this change.

The sidecar is dated 9 October and its learning compatibility text still mentions deferred backend/account scope, while the later implementation sections of `PRODUCT.md` and current operational documents describe connected accounts, schools and families. The sidecar narrative/guardrail lists also lag subsequent root design additions. These are pre-existing documentation coverage/freshness issues. They were not repaired or used as permission to alter the visual system during this narrow extension.

## Verification boundary

The implementation thread supplied passing production build and server typecheck results; 39 scoped server tests plus seven account tests, including actual Better Auth MFA enrollment/sign-in; and 30 scoped browser checks across desktop, phone and tablet, including an axe check of the return-to-setup state. It also supplied three final gate recaptures after removal of the password prompt before MFA setup. Those results were reported by the implementation thread, not rerun by this documentation pass.

The full server regression rerun was pending when this report was written; no result is claimed here. The independent finish reviewer owns the scoped disposition. This document supplies preservation and state evidence, not a replacement reviewer verdict, a whole-platform accessibility audit, or security certification.

No new shipping raster, image generation, raster modification, prompt embedding or provenance scan was needed or performed. The nine PNGs inspected are review evidence. Existing product artwork provenance is outside this extension and was not recertified.
