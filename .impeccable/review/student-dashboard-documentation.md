# Student dashboard documentation comparison

11 October 2026. Ordinary Operate extension of **Build & Play**; no replacement visual world or global system change.

## Evidence and boundary

Compared `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json` and `.impeccable/surfaces/student-dashboard.md` with `src/StudentCourses.tsx`, `src/student-dashboard.css`, `src/LearnerMenu.tsx`, `src/learner-menu.css`, the student header/settings branches of `src/App.tsx`, and `src/AccountPortal.tsx`. Inherited presentation was checked in `src/account.css`, `src/brand.css`, `src/styles.css` and `src/learning-world.css`.

Inspected `student-dashboard-{desktop,phone,tablet}.png` and `student-header-live-{desktop,phone,tablet}.png` in this directory. Their modification times (11:19:31–11:21:23 UTC) follow the final dashboard CSS/App edits (11:18:41/11:18:40 UTC). The phone capture visibly omits welcome artwork and uses the shorter course image. Source confirms the 112px phone image and conditional student-dashboard brand destination; a screenshot alone cannot verify navigation behavior. This comparison did not rerun browser checks, inspect backend implementation or read secrets.

## Agreements

- **Identity:** Both student headers reuse `/brand/mark-color.svg`, the original violet/teal/yellow K, and Fredoka wordmark. Existing Byte adventure artwork supplies dashboard imagery. No new mark, illustration or visual world was introduced. Student brand links and My courses return to `/#/student-courses`.
- **Type and palette:** Fredoka identifies headings; reading and controls use system type. The dashboard inherits learning ground (`#eeebf8`), ink (`#181339`) and muted text (`#575472`), with learning navigation purple (`#241259`) and white course surfaces. These agree with established palette roles; bright teal/yellow remain artwork/identity accents.
- **Layout:** Assigned courses lead the main area; class/help occupies a narrow supporting column. At 1000px the course grid becomes one column; at 700px support stacks after courses, the wordmark hides, welcome artwork disappears and course imagery reduces to 112px. Desktop/tablet/phone captures support this hierarchy. Long names wrap in the welcome, profile and account disclosure.
- **Controls and state truth:** Native details/summary exposes Settings, My courses and Sign out, with 44px minimum account actions, outside-click/blur dismissal and Escape focus return. Dashboard Settings opens the teacher-managed profile section; activity Settings uses the existing dialog and shows the signed-in name instead of a nickname input. Loading, empty, access-error and sign-out-error branches exist. Dashboard/account copy explicitly says activity work is session-only and does not invent progress or saved projects.
- **Student shell:** `AccountPortal` returns the student dashboard before its public/login wrapper. Student activity headers retain course/challenge context and account controls while omitting the public lesson/listen/hint/change-course toolbar branch. The existing learning stage/editor shell and Play placement remain visible in the captures.

## Narrow differences and existing drift

- Dashboard dimensions are surface choices: 1200px content maximum, 72px desktop/68px phone minimum header height, 14px course corners and 16px welcome corners. They do not redefine the learning workspace's container, toolbar or breakpoint tokens.
- Course cards remove the incumbent border and gain a local hover shadow (`0 8px 24px #2412591c`); the account dropdown uses `0 12px 32px #18133930`. These are scoped exceptions to the mostly border-led system, not new global elevation tokens.
- The inherited account stylesheet already uses focus (`#8b6ce8`, 4px offset), link (`#5332b8`) and supporting-control (`#372066`) colors outside the documented learning primitives. The student activity still inherits the learning light-surface/navigation focus rules. This is existing account-style divergence; no token was invented or silently normalized.
- `DESIGN.md` navigation prose still describes lesson/listen/hint/course/settings toolbar controls without the new authenticated-student distinction. Its sidecar narrative also omits several later Do rules present in the Markdown. Historical `PRODUCT.md` paragraphs still describe deferred accounts/backend and local-only progress. These are preexisting documentation discrepancies; this report does not repair them or treat them as authority over current student source.

## Disposition

Identity, type roles, principal palette, responsive hierarchy and account-control approach agree with the incumbent system and student surface contract, subject to the scoped differences above. Interaction, overflow, settings and first-viewport acceptance remain the responsibility of the implementation/finish verification, not this documentation comparison.

`DESIGN.md` and `.impeccable/design.json` were preserved byte-for-byte. SHA-256 at comparison start: `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE` and `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`, respectively. This report is the only file written by this documentation pass.
