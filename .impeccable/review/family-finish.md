Disposition: fix

## Persistence

The family direction is persisted in `.impeccable/surfaces/family.md`, and the implemented home profile, card, saving and report boundaries are described in `docs/FAMILY_LEARNING.md`. This is an extension of the approved account world. Preserve `DESIGN.md` and `.impeccable/design.json`; their older account/backend coverage is pre-existing documentation drift, not authority to redesign the family flow or repair the system files here. The final documentation handoff should accurately supersede PRODUCT.md's outstanding family-profile statement without implying school-pupil linking or production certification.

Reviewed source: `src/FamilyManager.tsx`, `src/family.css`, `src/AccountPortal.tsx`, `src/StudentLogin.tsx`, `src/StudentCourses.tsx`, and the account-shell styles. Supplied verification is 117 server tests, 1019 frontend tests, 15 family browser checks across three sizes with axe, and the 47.3-second synthetic local API/development Neon parent-to-child-save-resume-report journey. These checks were supplied, not rerun by this reviewer. The supplied detector had no primary findings, with advisory palette/type/radius differences; there is no hook. No new raster assets were produced for this extension.

## Fidelity

All 21 required captures were opened: `family-top`, `family`, `family-add`, `family-setup`, `family-empty`, `family-home-login`, and `family-child-dashboard`, each with desktop, phone and tablet suffixes. They show settled intended states with readable content; none requires recapture for evidence validity. Both `output/family-card/page-1.png` and `page-2.png`, and the supplied family composition reference, were also opened.

The build meets the scoped code-led direction: the approved K remains in the header, the illustrated island world frames real HTML, Fredoka gives headings their familiar voice, and violet actions lead the family tasks. Desktop/tablet retain child selection beside detail; phone stacks them without visible horizontal page overflow. Add child is prominent, labels and consent text remain readable, and the empty state presents an actionable beginning rather than fabricated progress. The sample includes distinct children and honest zero/completed practice counts.

The reference's exposed password and classroom-link language are correctly replaced by home-specific codes, separate school access, and a private one-time PDF. On-screen account details show the method rather than plaintext credentials. Download/reset explains the lost-card consequence and session revocation; pause/course removal explains retained progress. The PDF renders the actual home route, credential order, readable long names, privacy and recovery instructions. Progress uses semantic bars, counts and expandable semantic challenge/quiz tables rather than decorative metrics.

The full-page captures' flat sky after the viewport boundary are not a supported live-scroll defect: `src/account.css:114` makes `.account-scenery` fixed, and the separate first-viewport captures show the intended backdrop. No pixel-match gate or new comp is owed for this precisely scoped extension.

## Ceiling

This is a full fresh finish review of the supplied family matrix and source, not a browser certification or a security audit. The visible composition and requested happy path are at shipping quality. One source-confirmed recovery defect remains in the newly extended home journey, so the exact disposition is `fix`. Apply the single material fix in one batch, recapture the same matrix, and return it for a verdict on that finding. Do not broaden the work into an unrelated platform redesign, new imagery, new visual gates, or a repair of existing design-system drift.

## Material fixes

1. **P2 — Give home children a working dashboard sign-in recovery.** `src/StudentCourses.tsx` clears `context` when `student/courses` fails with an authentication error, and its dashboard error view always links to `/#/student-login` and tells the learner to ask their teacher. A home child's expired session therefore sends them to the classroom-code gate; an initial failure likewise provides no home recovery. This contradicts the separate home card/login flow and leaves the child with the wrong person and code prompt. Make this recovery home-aware when the context is known, or present explicit Home learner and Classroom student sign-in choices when it is unknown; use the matching parent/guardian or neutral help copy. Preserve a usable recovery for the school flow. Verify initial load failure and a previously loaded home session becoming unauthorized; the home code route must be reachable directly from both error states. Add targeted evidence of those recovery states to the verdict packet alongside the unchanged required matrix. No redesign is needed.

## Keep

Keep the approved K and illustrated account world, the clear two-column family selection/detail relationship, responsive stacking, the inline add form and native disclosure controls, the no-email/no-birthday child setup, grade-led picture/text defaults with parent choice, and the separate private home card. Keep explicit adult sign-out before child handover, one-time credential delivery and explained resets, honest saved progress/zero states, quiet practice check-ins, and retained work when access or a course is paused. Keep school-pupil linking outside this flow.
