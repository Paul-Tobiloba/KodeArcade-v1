# Family portal documentation handoff — 12 October 2026

Status: documented. Final review disposition: **ship**, scoped to the sole home-dashboard sign-in recovery finding in `family-finish.md`. `family-verdict.md` resolves that finding; the original full finish review remains the evidence for the family composition and its unchanged requested journey. This handoff does not expand that verdict into production, security, curriculum or accessibility certification.

## Authority and preservation

This is an ordinary, precisely scoped extension of the approved illustrated account/family world. The controlling surface direction is `.impeccable/surfaces/family.md`: a parent creates a private home identity, hands over a login card, and reviews saved learning without entering the child's session. No replacement identity or durable design-system refresh was authorized.

The document playbook was read and applied as a comparison and handoff, with the explicit preservation boundary taking precedence over its general DESIGN.md-generation workflow. Only this file was written. `DESIGN.md` and `.impeccable/design.json` were preserved; no tokens, narrative, snippets or timestamps were refreshed. App source, other documentation, existing artwork and review records were also left unchanged by this pass. No detector, test, browser batch or raster scan was rerun.

## Finished build against the incumbent system

`DESIGN.md` establishes Build & Play: the approved three-piece K, violet actions, teal/yellow identity accents, system reading type, rounded white workspaces and decorative illustrated scenery beneath real HTML. The family build retains those relationships. `AccountPortal.tsx` supplies the original SVG mark and existing island-world, code-symbol and Byte artwork; `FamilyManager.tsx` reuses the existing parent illustration for its empty state. This extension creates no new raster assets or visual identity.

The family task surface is a white container, at most 1280px wide, with a heading, a no-child-email explanation, account/handover controls and management unlock above child selection and selected-child detail. Violet leads Add child, save and PDF actions. Bordered child choices, pale violet selected states and green semantic progress bars make identity, selection and saved progress distinct. The private-card confirmation uses the incumbent pale green feedback treatment. Amber check-ins describe repeated practice as a prompt for help; they do not imply a diagnosis or invented attainment.

The supplied full review records valid settled captures for family-top, populated family, add-child, setup, empty, home-login and child-dashboard at desktop, phone and tablet, plus both synthetic PDF pages and the supplied family reference. It found the requested composition and happy path at shipping quality. The reference's exposed-password and classroom-link concepts were correctly translated into private one-time home cards and separate school access. This documentation pass relies on that visual evidence; it did not independently reopen or recapture the images.

### Pre-existing documentation drift

The incumbent design files cover the brand, public pages and learning workspace more fully than the later account implementation. Account CSS already defines additional scoped colors, larger outer containers and controls, and `Baloo Bhai 2` heading overrides for `.account-flow-screen`; the family portal inherits that shell, while the wordmark and base account heading rules use Fredoka. The finish review's general Fredoka description should therefore be read alongside this source-level qualification. These inherited account treatments are not new global family tokens.

The sidecar's learning compatibility narrative still refers to deferred backend/account scope, and its component/narrative coverage does not capture the current family/account journeys or every later DESIGN.md addition. Current product and implementation documentation supersede those historical availability statements. `PRODUCT.md` now records home profiles and the live development journey; its family paragraph's 15-browser-check figure predates the final recovery batch of 18. This pass reports these differences without repairing or refreshing their source files, and does not turn surface-specific dimensions into system-wide requirements.

## Responsive and accessible behavior

The family grid uses `minmax(240px, .8fr)` beside `minmax(0, 1.4fr)`, with a 28px gap. At 1000px the heading becomes one column and spacing tightens while selection remains beside detail. At 700px selection and detail stack, the outer panel uses 16px horizontal padding, actions can fill the available width and supporting artwork yields space. Names, headings and credentials wrap; detail containers have zero minimum width; challenge/quiz tables scroll within their own bounded wrapper. The original full review observed no horizontal page overflow in the supplied phone captures.

Visible labels remain on names, grade and login choices. Native disclosures organize course selection and challenge/quiz detail. Child selection exposes `aria-pressed`; progress uses native progress elements with text counts and accessible labels; tables retain captions and row headers. Adding a child and generating a card move focus to their relevant headings. Family focus uses a visible 3px violet outline. The supplied scoped axe checks contribute evidence, without establishing complete keyboard/screen-reader or WCAG certification.

The account backdrop remains a fixed viewport layer in `account.css`. Flat sky beyond the viewport in full-page captures was reviewed as a capture consequence, not evidence of a live-scroll defect. The recovery controls use the existing wrapping action layout; the verdict records readable, reachable home/classroom choices and retry at all three sizes.

## Identity, card and privacy boundaries

Parents create a separate family workspace and up to ten home profiles, including paused profiles. Setup and child creation include parent/guardian responsibility acknowledgements. Child setup asks for a first name or family nickname and Grade 1–6, without email or birth date. Grade changes default new profiles to pictures for Grades 1–2 and text for later grades; the parent can choose either method. Changing an existing child's grade does not silently replace assigned courses.

The generated private PDF reveals the child's home code, username and four-picture ordered password or three-word text password. The parent portal shows the login method rather than plaintext credentials. Cards use `/#/home-login`; classroom cards use their separate login scope. Public code lookup reveals no child roster. The supplied rendered PDF review checked the home route, order, long names, original K, access instructions, privacy and recovery copy. As documented in `docs/FAMILY_LEARNING.md`, plaintext credentials and PDF files are not retained server-side for reprinting.

The parent must download the card when created. A replacement generates a new credential, invalidates the old card and signs the child out; username and saved progress remain. Pausing access and removing a course retain saved work, and their consequences are explained before the action. Parent handover explicitly signs out the adult before opening home login; there is no silent impersonation or parent-to-child session conversion.

Each child's learning and saves reuse the established student flow with learner/context/course scope. Continue learning restores saved activity and code; public preview work remains separate. The parent report exposes saved challenge completion, best stars, tries/hints, last activity, drawing counts and quiz results, while omitting raw code, Blockly workspaces, recovery keys and credentials. Results are client-reported formative practice, not independently replayed exam grades. Device recovery remains best effort; learners should wait for “Saved to your account.”

School-pupil linking is separate. A guardian link alone does not authorize access to a school pupil; a family context does not convert, move or claim an existing school record.

## Recovery finding and final evidence

The original P2 finding was specific: an initial unauthorized dashboard load or a home session becoming unauthorized cleared its context and previously offered only the classroom login route and teacher help. The finished `StudentCourses.tsx` error view now provides Try again, Home learner sign in (`/#/home-login`) and Classroom student sign in (`/#/student-login`), plus neutral parent/guardian/teacher help. Both destinations remain available when identity context is unknown. This meets the requested repair while preserving school recovery.

`family-verdict.md` records all six initial/expired recovery captures across desktop, phone and tablet, and regression inspection of all 21 original matrix recaptures. It observed no material regression and marks the sole finding resolved, with no further fix round owed. Its exact disposition is ship at that finding's scope, not a new whole-surface review.

Supplied implementation evidence in `family-verification.md` and `docs/FAMILY_LEARNING.md`:

- 117 backend tests across 12 files and 1,019 frontend tests across 22 files passed; server typecheck and production build passed, with existing chunk/dependency-comment warnings.
- The final family browser batch passed 18 checks across desktop, phone and tablet in 58.9 seconds, including initial 401, retry into a home dashboard, later unauthorized visibility recheck and direct home sign-in navigation.
- The 47.3-second localhost/development Neon synthetic journey covered parent management, private picture/text cards, both child login methods, real challenge completion/cloud saving, reload/resume and the parent report. Exact synthetic records were cleaned up; owner records were untouched and no live email was sent.
- School-entry regression assertions passed, with two intentional skips; the check affected by concurrent trace-output loss passed in a sequential rerun with a separate output directory.
- The supplied changed-target detector reported no primary findings and advisory palette/type/radius differences. These advisories did not authorize design-file repair.

These results are supplied evidence, not checks rerun by this documenter.

## Remaining work

No material family fix remains from the scoped review. School-pupil linking, institutional/guardian verification, consent/legal review, deletion/export lifecycle, retention operations, production deployment and independent server-side result replay remain separate work. Any future refresh of DESIGN.md and its sidecar requires explicit authority and should reconcile the inherited account typography, scoped palette/components and obsolete account/backend statements together. This documentation handoff completes the family finish workflow within the existing preservation boundary.
