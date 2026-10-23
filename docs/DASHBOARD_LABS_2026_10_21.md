# Consolidated student dashboard Labs — 21 October 2026

The owner requested one set of Byte Lab, App Lab and Artist Lab entries below assigned courses (Your home adventures for home learners), replacing grade-repeated links. The shared student dashboard now does this for both home and classroom accounts. Parent/teacher administration and public preview pages are unchanged.

`StudentLabs` renders three compact icon-and-label tiles in one desktop row, stacked on phones. Artist Lab opens the existing Drawing & Art code workspace at Make it yours, not a newly implemented paint app. On desktop the full-width Labs row follows the courses/help grid row. On phones it comes directly after courses and before help; the DOM also follows courses → Labs → help. Existing coursework and help content are unchanged. Loading/error states do not show another learner's lab links.

## Course and save boundaries

- Multiple drawing-enabled assigned grades use one Project course selector. Default is the first assigned Grade 3–6 course, otherwise the first supported course; a single course needs no selector.
- Each lab appears once. Its destination is the selected course's existing `/student-play/grade-N/{lab,apps,art}` route. Selecting a course makes no progress requests or writes and never merges, moves, clears or migrates existing projects.
- Grade 1–2 selections offer Artist Lab only. Byte/App remain visible but non-interactive with Grade 3–6 availability text. With no supported assignments, all entries are non-interactive and ask for a course assignment. There is no public-preview storage fallback.
- Account/assignment guards, private save/recovery behavior, course progress/stars and editor/runtime behavior are unchanged. Selection state is mounted UI state, reset across learner/classroom identity changes, not a new saved preference.
- The existing V3 curriculum proposal remains planning-only and on hold; these navigation changes do not implement it.

## Verification

Browser coverage includes all three signed-in lab destinations, artist ink/reload, stale quiz override and ordinary drawing resume, multi-grade home/classroom consolidation, course-selector destinations, no progress writes on selection, younger/empty assignments, unauthorized entry, profile/sign-out, long names, accessible Labs navigation, touch target sizes and page overflow. Synthetic local API fixtures are used; no live student records or production database changes are involved.

The final production build passes, with existing upstream annotation and bundle-size warnings. All 24 dashboard/creative browser cases pass across desktop, phone and tablet. Three additional App Lab private-account save/reopen cases also pass, including public-preview separation and unassigned-course denial: 27 final browser checks total. The layout detector reports no findings and `git diff --check` passes. Home-dashboard captures for all three device classes were opened and inspected; the bounded correction places Labs before mobile help, directly after course cards. The first pass passed all 24 cases too; its visual order prompted that refinement. Existing tests were updated to reflect the intentional below-courses location rather than requiring a mobile lab link above the fold.

These are local Chromium checks with mocked APIs, not live backend/Safari/physical-device certification; unused capabilities requests in the standalone App Lab fixture encountered the absent local backend, without affecting its scoped private-progress checks. This scoped builder pass is not a new independent whole-surface ship verdict. No images were added, no push/merge/deployment performed, and no hibernation requested for this task.

## Public course chooser follow-up

The owner subsequently requested the same cards on the public course chooser, then asked why existing course circles had no images/icons. `LabCards` now shares the three definitions, Lucide icons, rendering and responsive CSS with `StudentLabs`; private permission decisions remain in `StudentLabs`. The plain public App Lab link is replaced by three cards below Computer Explorers. Preview guidance explicitly distinguishes browser-local saves from student accounts. Byte opens the last public Grade 3–6 course, otherwise Grade 3; Artist opens the last supported public grade, otherwise Grade 1; App Lab opens its separate browser-preview gallery. No account routes, runtime or storage formats changed.

The existing character atlases are present and rendered during local inspection. The exact cause of the owner's blank-circle screenshot is not confirmed. Course entry supplies immediate topic icons via an opt-in CharacterSprite fallback while an image loads or if loading fails. Loaded artwork replaces the icon. Preload callbacks are detached on unmount; other CharacterSprite callers keep the existing CSS-image rendering. No bitmap assets were generated, edited or replaced.

Verification covers seven loaded course images, seven fallback icons with deliberately failed atlas requests, three visible Lab icons, all public editor destinations, supported last-course retention, no student requests from public Labs, private dashboard regressions, overflow and accessibility. All 27 final browser cases pass across desktop, phone and tablet (12 public-entry cases and 15 existing student creative-dashboard cases). The final production build passes with existing annotation/chunk-size warnings. The scoped layout detector reports no findings and the diff whitespace check passes. Normal and failed-image captures were opened and inspected across all three device classes under `.impeccable/review/public-labs[-fallback]-{desktop,phone,tablet}.png`. No independent new ship verdict, live account verification or deployment is implied.
