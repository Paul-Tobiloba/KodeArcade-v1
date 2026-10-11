# Security Policy

## System and Scope

KodeArcade teaches beginner coding through React/TypeScript/Vite/Blockly. The current repository is a browser-only preview; account, database, API and email integration are not implemented at the 11 October 2026 source baseline.

Review runtime source, parsing/restoration, persistence, dependencies, build/release paths and future server/auth/database/jobs configuration when introduced. Confirm production deployment and operational owners instead of inferring exposure from local development.

## Threat Model and Trust Boundaries

Learner text, block programs and browser storage are untrusted inputs. Public and learning SPA routes share origin authority. Local records are not isolated child accounts or server-issued assessment records.

The selected future stack is Better Auth, Neon and Resend. School-managed learners and parent-managed home profiles require distinct identity, guardianship, workspace, classroom, enrollment and assignment boundaries. Teachers select generated picture or text pupil credentials; a shared classroom code locates a class, not an individual identity.

Provisioning, resets, printable login cards, exports, migrations and deployment are privileged operations, separate from ordinary student actions. Distinguish source facts, deployment prerequisites and proposed controls.

## Security Invariants

- Authorize every private read/list/export/write by server-derived actor, object and context. UUIDs, routes, client roles and classroom codes are not authorization.
- Learners cannot use auth/plugin endpoints to acquire adult roles, change identity kind, bypass class context or downgrade credential methods.
- Better Auth owns credential verification and sessions; application policies own school/family access. Keep CSRF/origin protections enabled, secrets server-side, cookies secure and revocation effective.
- Picture passwords are private ordered sequences, not public avatars. Generate credentials securely and throttle every equivalent authentication path, including server-side auth API wrappers.
- Only authorized class managers can provision/reset credentials or receive login-card PDFs. Do not persist readable passwords, publicly host cards or log their contents. Resets invalidate old credentials and affected sessions.
- Do not require child email or mail internal learner identifiers. Learners cannot access adult recovery, membership, consent or billing controls.
- Preserve bounded teaching-language execution and validate serialized programs before restoration. No eval, general host-code execution or unbounded parser/interpreter work.
- Client rewards, imported completion and submitted mission definitions are untrusted for authoritative school reports.
- Partition cloud records, caches and sync queues by learner/context. Home-school linking requires explicit approved authority.
- DB/auth/mail credentials and private responses must not enter browser bundles, public caches, ordinary preview datasets or telemetry.
- Privileged jobs/mutations require scoped authority, idempotency, audit and bounded retries. Export/deletion and restore must preserve privacy boundaries.

These are required properties when features ship, not claims of implemented protection.

## Reportable Findings and Severity Context

Report reachable confidentiality, integrity, availability or privilege failures with a concrete actor, input, consumer, control and new capability. Separate hypotheses from validated findings and impact from confidence.

Prioritize cross-school/family access, unauthorized pupil impersonation/resets, staff escalation, credential/PDF exposure, secret leakage, unsafe program execution and material shared-service denial.

Editing one's own browser-local stars is not a demonstrated cross-user breach. JSON restoration does not prove remote delivery or host-code execution. Operator asset scripts do not grant ordinary pupils filesystem authority. State missing prerequisites rather than inventing impact or blanket suppressions.

## Out of Scope, Exclusions, and Accepted Risk

No vulnerability-class exclusions or accepted risks have been approved. Dependency/example status alone does not exclude application-used code. Future feature absence is not a proven live vulnerability or proof of a safe implementation.

## Known Limitations and Compensating Controls

Current controls include restricted program syntax/budgets, coding-save field/size checks, restoration fallback and local-voice filtering. They are not account isolation, a general-purpose sandbox, complete deserialization assurance or certification.

Drawing workspace admission differs from coding-save size validation; investigate delivery/impact before severity assignment. README runtime/curriculum statements include stale content; verify actual consumers.

Production hosting, auth version/configuration, school/guardian authority, retention, recovery, incident ownership and private vulnerability-reporting contact need decisions before real-child rollout. Do not invent owners, contacts, assurances or risk exceptions.
