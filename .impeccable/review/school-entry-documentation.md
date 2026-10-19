# School entry documentation handoff

Disposition: documented; finish review is SHIP with no material fixes in the scoped diff.

This is an ordinary, precisely requested extension of the incumbent public marketing system for school administrators. It introduces a discoverable school entry, factual school features and the exact primary action “Sign up your school.” It does not establish a new visual world, approve a global design-system change or add raster assets. The existing DESIGN.md and .impeccable/design.json are preserved byte for byte; this scoped note records implementation facts without regenerating either artifact.

## Evidence checked

Read the complete Impeccable document reference and core skill guidance, PRODUCT.md, DESIGN.md, the relevant public-page and compatibility guidance in .impeccable/design.json, the school-entry surface contract and school-entry-finish review. Compared those with SchoolFeatureContent.tsx, MarketingPages.tsx, Landing.tsx and the relevant landing.css, AdultAccount.tsx, SchoolManager.tsx and main.tsx implementation.

The finish review reports that all 19 required desktop, phone, tablet and 1024px compact captures were opened and are valid. Home-options captures intentionally show the account-choice section; setup captures use the synthetic authenticated, unlocked fixture. This documentation pass relies on that completed visual review and does not claim an independent screenshot, browser, detector, context-loader, test or build rerun. No additional surfaces were inspected.

## Incumbent comparison

| Concern | Finished extension and incumbent relationship |
| --- | --- |
| Identity and type | Keeps the approved master K separate from the artwork, Fredoka for the wordmark and expressive headings, and the system face for reading, navigation, labels and setup-step headings. |
| Color and ground | Uses the established public cloud ground, ink and violet action colors, restrained functional teal, white surfaces and pale borders. Learning tokens are not promoted into public marketing. |
| Material and imagery | Reuses the existing question-island heading artwork through the shared illustrated marketing composition. Text and controls remain real HTML. No new raster, generated prompt or provenance entry is owed by this change. |
| Form and hierarchy | Adds semantic role definitions, aligned feature rows, an ordered setup sequence and native FAQ disclosures. Existing rounded public action links, visible focus and reduced-motion behavior remain the reference. |
| Discovery | The shared header/footer expose For schools. Landing account choices retain Students, Teachers and Parents and add Schools. The public /#/for-schools route resolves to marketing content rather than the private manager. |
| Content | Covers administrator/teacher/pupil access, classes and course assignments, generated picture/text credentials and private PDF cards, saved progress, reports, staff changes and class archival. It adds no pricing, customer proof, institutional-verification or learning-outcome claim. |

## Local responsive behavior

The added navigation destination needs more room: the shared marketing header now uses its existing labelled menu disclosure at widths up to 1100px. This replaces the earlier public-header threshold of 900px for the current implementation and is a local fit adaptation, not a new global breakpoint doctrine. The 1024px compact capture and supplied navigation coverage support that choice.

Landing account entries use four columns above 1000px, two columns from 601px through 1000px and one column at 600px or below. Their explicit grid display keeps these choices reachable when other navigation collapses.

At 700px or below, school role and setup columns become one column, feature definition rows stack their label and description, and the closing action group follows its copy vertically. Section spacing tightens; heading sizing adapts and actions wrap. The shared marketing heading keeps the incumbent phone illustration wash and visible HTML controls.

These are surface implementation facts. They do not alter the broader learning-shell layout, component primitives or approved brand rules.

## Account intent and creation boundary

School actions use the fixed role=school query value. AdultAccount recognizes that value and preserves it through signup, email verification/resend, recovery, sign-in and authenticator/backup-code completion. Successful sign-in routes to /schools?setup=1; an ordinary teacher journey retains /dashboard.

The school role value expresses navigation intent, not authorization. It creates an individual adult account and does not grant access to an existing school or automatically create a school. SchoolManager uses setup=1 only to open the existing creation disclosure. School name, required authority confirmation and a separate “Create school workspace” submission remain explicit. Invited staff are directed to their private email-bound invitation; personal and school classes remain separate.

The FAQ records current development limits, manually shared staff invitations, the lack of verified institutional ownership and test-inbox email delivery. These boundaries agree with the current implementation section of PRODUCT.md; earlier dated product milestones remain historical context.

## Drift reported without repair

- DESIGN.md's illustrated-public-navigation list omits current destinations including For schools and Student login, and its course-route description still names earlier arrow/word/builder routes rather than the current grade destinations.
- DESIGN.md's public Layout paragraph and extensions.publicPages.responsive.menu in the sidecar still record the older 900px public menu threshold. The implemented 1100px threshold is intentionally documented locally above.
- The sidecar's older learningWorld.compatibility narrative still says local progress and deferred backend/account scope remain unchanged. Current PRODUCT.md and the scoped account sources describe connected development account and school journeys. This is inherited documentation drift, not a new promise made by the school entry.

No unrelated drift was repaired and no global system-refresh choice was inferred. DESIGN.md SHA-256 remains 37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE; .impeccable/design.json remains A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D.

## Supplied validation and handoff

Implementation evidence supplied by the parent: 1019 unit tests passed; 43 browser checks passed with two intentional compact-size skips; three recapture checks passed; the final production build passed with the known chunk-size and Zod warnings. The finish review reports SHIP, all 19 captures valid and no material fix. These are supplied results, not independently rerun checks by this documentation pass, and do not certify the wider platform, production delivery, institutional ownership or complete accessibility.

HANDOFF and SCHOOL_ADMINISTRATION documentation are maintained by the parent implementation pass. Keep the exact signup CTA, separate Teachers entry, explicit adult-account-to-school creation step, truthful invitation/preview copy and incumbent public illustration/type treatment.
