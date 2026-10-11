# School administration and class lifecycle — scoped documentation

11 October 2026. Document status: complete for the ordinary, code-led account extension. This is a surface addendum to the incumbent Build & Play system, not a new visual world or a regeneration of its global design specification.

## Authority and evidence checked

Read the Impeccable document reference in full, PRODUCT.md, DESIGN.md, `.impeccable/design.json`, and both surface contracts (`school-administration.md` and `class-lifecycle.md`). Inspected the current SchoolManager, ClassLifecycle, AccountPortal, AccountWorkspace, ClassroomManager, account-api and account.css sources, the account.css diff against HEAD, and the incumbent HEAD account rules. Also read `docs/SCHOOL_ADMINISTRATION.md`, the verification record and the finish review.

Opened four existing synthetic evidence images as a documentation spot check: school-admin-top-desktop, school-recovery-phone, school-access-unavailable-tablet and class-archived-top-phone. These support the retained shell, stacked navigation and explicit recovery/archive state. This pass did not independently repeat the full visual review, run a browser, rerun tests, inspect live records or execute a raster-provenance scan.

The finish review now records a targeted **SHIP** disposition, superseding its initial FIX, for the two original lost-response and revoked-authority findings. It reports inspection of the original 30 captures and all six added recovery captures. That verdict applies to this school-administration/class-lifecycle increment; it is not production, whole-platform, curriculum or accessibility certification.

## Scoped additions and operating behavior

- A visibly labelled Workspace selector scopes the sidebar navigation, class list and classroom/report links. A single adult account can retain a personal teaching workspace and optional school memberships without moving existing classes or pupils. The main school heading states the current school and role; teacher access explains that only assigned school classes are available.
- Administrators see school staff, role consequences and the Invite staff action before the longer management content. Native details disclose role/removal and class-staff forms. Changes require explicit confirmation; the final administrator is protected. Removal copy explains that personal classes and pupil records remain.
- Invitations are verified-email-bound, expire after seven days and are accepted once. The private link appears in a labelled field with copy/manual-copy recovery. The screen explicitly says no email has been sent and that the administrator must share it privately. Joining presents the school, role and confirmation without converting personal ownership.
- Committed school creation retries reconcile the original resource according to the documented implementation. A lost invitation response offers an explicit replacement; its consequence copy states that the previous link stops working. The ordinary invitation submit is disabled while replacement is pending. Revoked school authority enters an access-unavailable state, clears stale school/private-link state after failed mutations and offers workspace refresh and administrator contact guidance.
- Active/Archived buttons use pressed states and a result status before the class table. Archive confirmation is below classroom metadata and above reports. It explains paused sign-in/saves, preserved records and unsaved-work limits. Archived editing is disabled while reports remain outside that disabled group. Restore explains existing cards and the continued disabled state of disabled students.

These are surface behavior and layout records. They do not establish new global components, tokens or prohibitions for unrelated pages.

## Incumbent visual system retained

The extension keeps the illustrated adult shell: white operating content, pale-purple sidebar, violet actions, system-font reading and controls, the approved K mark, and existing icon vocabulary. The school additions use the existing labelled fields, buttons, management-unlock panel, notices, private-card treatment, native disclosures and semantic tables. School tables retain a 580px minimum width inside keyboard-focusable, labelled horizontal-scroll regions rather than widening the page.

The incumbent dashboard uses a maximum 1280px white workspace, 220px sidebar and rounded 28px outer shell. Existing responsive rules reduce the sidebar to 190px below 1100px and place it above the main column at 900px; phone margins, padding and wrapping navigation remain. New CSS is confined to class-list/filter/lifecycle and school/switcher/staff selectors. The lifecycle panel uses a local pale lavender fill, border and 12px corners; section dividers and staff fieldsets follow existing account spacing and border language. These local selectors do not introduce root design tokens.

Visible focus retains the incumbent account outline (3px, 4px offset); existing controls and disclosure summaries retain their reachable minimum sizes. Existing motion runs only under `prefers-reduced-motion: no-preference`. No new animation was introduced for school or archive operations.

## Preservation and provenance

DESIGN.md and `.impeccable/design.json` are preserved. Their SHA-256 values when inspected were respectively `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE` and `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`. Neither had a working-tree diff at inspection.

No raster was created, replaced or reprocessed by this increment or this documentation pass. AccountPortal continues to reference `public/images/auth/island-world.png`, `code-symbol.png` and `byte-peek.png`; existing chooser artwork, `/brand/mark-color.svg`, local fonts and Lucide icons are reused. The existing artwork and its provenance remain unchanged. This is a preservation statement, not a claim that a new inventory or embedded-metadata audit was performed. The fixed viewport scenery's full-page screenshot compositing limitation remains distinct from a runtime background failure.

## Pre-existing drift recorded without repair

The surface contracts describe Fredoka headings, but the already-committed illustrated account CSS overrides h1/h2 to locally hosted **Baloo Bhai 2**, weight 700. The account wordmark and h3 retain Fredoka; reading and controls use system type. HEAD confirms this predates the school/class additions. This report records the actual inherited type rather than changing either CSS or the contract.

DESIGN.md and its sidecar chiefly document public and learning surfaces and omit the existing illustrated adult account shell. Their generic button samples (8px corners, 44/46px heights, violet primitive) do not capture the existing account-flow overrides (12px corners, 52px minimum, `#7134ef` primary), account focus color, 28px dashboard shell or 900px dashboard stacking. The sidecar's 9 October timestamp and stored learning/public narrative also predate later account work; its do-list is shorter than the current DESIGN.md list. These are existing documentation gaps, not permission to redefine the shared system in this narrow pass.

PRODUCT.md still lists broader school administration as pending in its current account-status paragraph, while the scoped implementation and `docs/SCHOOL_ADMINISTRATION.md` now record this increment. Historical deferred-backend statements and earlier verification counts remain contextual milestones. They were not rewritten within this document-only boundary.

Main-agent handoff update after this documentation pass: PRODUCT.md's current-status paragraph now records the shipped school/class increment and names remaining administration work separately. Historical milestone paragraphs and the global design files remain unchanged.

## Verification boundary

Supplied final implementation results are 109 backend tests, 1,019 frontend tests, passing production build and server typecheck, initial 30 browser checks and 18 evidence recapture checks. The final combined browser batch had 39 passing application checks: 38 test results plus one application check whose surrounding test ended in artifact-teardown ENOENT from concurrent Playwright activity; the two affected tablet archive tests passed in isolation. The synthetic live API/Neon school journey passed, including repeated create-key reconciliation and exact fixture cleanup. This documentation pass has not independently rerun those results. The verification file and final handoff now both report the final 109 backend count.

Automatic invitation email, verified institutional claims, cross-workspace transfers, family linking, deletion/retention automation and production operational readiness remain outside this increment. Responsive visual evidence uses synthetic fixtures; the live check establishes API/database coverage rather than a live multi-device browser journey.
