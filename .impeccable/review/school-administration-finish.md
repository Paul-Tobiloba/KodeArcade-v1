# School administration and class lifecycle finish review

11 October 2026. Independent, code-led finish review against the two surface contracts, PRODUCT.md, DESIGN.md, design.json and the Impeccable craft floor. No implementation changes made by this reviewer.

## Persistence

All 30 required captures were opened and inspected at readable detail: school-admin, school-admin-top, school-create, school-invitation, school-access, school-join, class-archive-list, class-archive-confirm, class-archived and class-archived-top, each at desktop, phone and tablet. Loaded synthetic states are consistent with their intended workflows. The phone access-table capture intentionally shows its internal horizontal scroll. The full-page fixed-scenery compositing limitation is not treated as live background loss.

Scoped source inspection covered SchoolManager, AccountPortal, AccountWorkspace, ClassroomManager, ClassLifecycle, account-api, account.css, the school routes and staff-access queries, plus the responsive workflow tests. AccountPortal is keyed by the full hash, so changing workspace remounts it and aborts pending account/school/class reads. Scoped class/report links carry the workspace. Server mutations recheck administrator authority inside the school transaction. Existing verification results are documented separately; this reviewer did not independently rerun the suite or mutate live data.

## Fidelity

The ordinary extension respects the existing illustrated account shell, readable white operating surface, violet hierarchy, labeled native controls, semantic tables and expandable actions. There is no approved comp for this increment, so no unsupported claim of exact comp matching is made. At all three target sizes, ownership, administrator versus teacher authority, manual private invitations, staff-removal consequences and archive/restore consequences remain legible. No material layout clipping or page-level horizontal overflow was found. The scrolled staff table remains an intentional keyboard-focusable region.

## Ceiling

The visual ceiling for this scoped operating extension is met. More decoration, custom controls or shell redesign would not improve the requested task. Existing artwork/provenance stays unchanged. One recovery behavior remains below the truthful-workflow bar; the problem is not visual fidelity.

## Material fixes

Disposition: **FIX**, then targeted verification. No rebuild or recapture of the 30 existing evidence images is required.

1. **Reconcile school create/invitation retries after a committed response is lost.** SchoolManager.tsx lines 38–44 retains an operation key after every failure. server/schools.ts returns ALREADY_PROCESSED when that key was committed. The retry therefore never supplies the private invitation URL, subsequent identical submissions keep the consumed key, and account-api.ts line 39 directs the adult to a class list/pupil-credential reset instead of a school recovery action. Handle committed school operations explicitly: reconcile an already-created school without creating a duplicate, and let the adult deliberately issue a replacement invitation when its one-time-displayed link was lost. Explain that replacement invalidates the previous link. Add a committed-but-response-lost retry test for both operations, including repeated retries.

2. **Use access-changed recovery for a school permission loss.** school() returns NOT_FOUND after an administrator is removed/demoted, including transactional rechecks of an already-open screen. The generic 404 copy currently says the account feature is not available yet, which misidentifies a permission change and points to a public activity. At the school boundary, give non-enumerating access-unavailable guidance with account/workspace refresh and administrator contact as appropriate. Verify a loaded school screen whose authority is revoked before save. Do not expose school membership details to an unauthorized account.

## Keep

Keep the single adult account with separate personal and optional school workspaces; current-workspace ownership and role labels; last-administrator protection; explicit role/access confirmations; no-account/no-record-loss removal copy; seven-day, verified-email-bound, one-use manually shared invitation contract; internally scrolling semantic tables; preserved reports and disabled archived-class editing; and the current three-size layout. No unrelated drift repairs are requested.

## Targeted verdict pass — 11 October 2026

Scope: the two original findings only. This verdict supersedes the FIX disposition above; it is not a reopened audit.

1. **Lost committed school/invitation response: RESOLVED.** School creation now reconciles the original resource ID for matching operation-key/body retries and rechecks present administrator authority; changed-body reuse is rejected. Invitation retries retain their key while the outcome is ambiguous, then clear the consumed key only after ALREADY_PROCESSED. The explicit replacement action states that the earlier private link will stop working and that no email was sent; the ordinary invite submit is disabled until replacement is resolved or cancelled. The repeated-loss browser test checks the k1, k1, k2, k2, k3 sequence and recovered private URL. Server tests cover repeated school replay and new-key invitation replacement closing the old link.

2. **Revoked authority recovery: RESOLVED.** School GET/mutation 404 responses now enter a non-enumerating access-unavailable view with refresh/contact guidance rather than the generic feature-unavailable copy. Mutations clear stale staff data, private invitation and replacement state. The loaded-then-revoked-before-save browser test verifies that stale staff is hidden and workspace refresh is offered.

Opened and inspected all six new captures at readable detail: school-recovery and school-access-unavailable, each desktop/phone/tablet. The recovery consequences and actions remain readable, with no new layout issue in those states. Code and targeted test definitions were inspected directly. The main agent reports 109 passing backend tests, passing build/typecheck, nine passing responsive recovery checks, and a passing synthetic live API/Neon journey including repeated creation replay; this reviewer did not independently rerun those commands. The reported combined-browser teardown artifact collision is not treated as an application assertion failure, and its isolated tablet checks reportedly passed.

Final disposition: **SHIP** for this scoped school-administration/class-lifecycle increment. Both original findings are resolved; no further fix, rebuild or evidence recapture is requested by this verdict pass. The original keep decisions remain unchanged.
