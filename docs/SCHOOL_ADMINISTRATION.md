# School administration

## Ownership and roles

An adult keeps one Better Auth account and may belong to a personal teaching workspace and multiple school workspaces. The workspace selector scopes the class list and navigation. Creating or joining a school does not convert a personal workspace or move its classes, pupils or saved work.

A school administrator can manage all classes and staff within that school. A school teacher can access only explicitly assigned classes while their school membership remains active. No school administrator gains access to personal classes or other schools. The final administrator cannot be removed or demoted; appoint another first.

## Administrator workflow

1. Open **Schools** in the adult workspace. An authorized adult can create a separate school after confirming their authority. This is self-attestation, not verified institutional identity.
2. Unlock sensitive management for five minutes using the existing password/MFA step-up.
3. Generate an invitation for a colleague’s email and select Teacher or Administrator. Copy the private link and share it yourself: **no invitation email is sent automatically**.
4. The colleague signs into a verified adult account with that exact email, reopens the link if necessary, reviews the school/role, unlocks management and confirms acceptance.
5. Assign one or more school staff members to each school class. Administrators retain access even if no teacher is assigned.
6. Change a member’s school role or remove school membership using the explicit confirmation. Removal immediately revokes future school/class requests and removes assignments. It does not delete pupils, progress or that adult’s personal workspace. An already delivered response cannot be recalled.

Invitations expire after seven days and are single-use. Only a SHA-256 token digest is stored. Reissuing for the same school/email invalidates earlier links; revocation or the inviter losing administrator access invalidates pending links. Lost one-time links must be generated again. Tokens are not returned in staff listings or written to audit events.

## Class archive and restore

Classes has Active and Archived filters. Archive is reversible, not deletion: it pauses student login, saves and class edits, revokes class-bound student sessions and keeps rosters, assignments, code, stars, quiz results and reports. Ask pupils to finish saving before archiving; work not yet acknowledged by the account may not be saved.

Authorized adults can still read archived reports and restore the class. Active pupils can then sign in again with their existing cards. Disabled pupils stay disabled; old sessions are not revived. Staff assignments can still be maintained by school administrators while a class is archived.

## API and integrity

School endpoints are under `/api/schools`: create; read school; generate/revoke invitations; preview/accept invitation; update/remove member; replace class staff. Existing classroom endpoints use the shared membership/class authorization helper. Writes require verified adult identity, CSRF origin checks and recent management unlock. School organization locks serialize membership changes, assignments and classroom mutations with an authorization recheck inside the transaction. Stale role/assignment edits are rejected. Last-administrator protection runs under the same school lock.

Limits: five school creation attempts per adult/day, thirty invitation generations/hour, one hundred active pending invitations/school, 250 staff/school and 25 explicitly assigned staff/class. Existing class/student/bulk-operation limits remain. A same-key school creation retry safely returns the already-created school ID after rechecking administrator authority; changed payloads are rejected. A same-key invitation retry cannot recover its plaintext one-time link. The UI explicitly offers a new-key replacement that invalidates the earlier link, including after repeated lost responses. School permission loss hides stale details and offers workspace refresh without confirming protected membership information. Audit events contain action/resource IDs, not credentials or invitation tokens.

Migrations `0003_class_archival` and `0004_school_invitations` are additive and applied to the configured development database. Other environments must run the guarded migration workflow before using these routes. Better Auth remains self-managed; this increment does not introduce the Better Auth organization plugin or Neon Auth.

## Verification and remaining scope

Backend integration tests use actual Better Auth/Hono with isolated PGlite. Mocked Playwright checks cover school creation/join, role confirmations, invitations, workspace context, archive/restore and existing teacher workflows at desktop, phone and tablet sizes. Run `RUN_LIVE_SCHOOL_E2E=1 npx playwright test e2e/schools-live.spec.ts --project=desktop` only against the configured localhost development environment. It creates synthetic identities, exercises API/database boundaries and deletes its exact fixture IDs; traces/screenshots are disabled to avoid recording private tokens.

Not included: automatic invitation email, verified school claims, cross-workspace class/pupil transfers, school deletion, academic-year rollover, district hierarchy, bulk staff import, family linking or retention automation. Archive is not an erasure/retention policy. Production readiness still requires the operational controls in BACKEND_SETUP.md.
