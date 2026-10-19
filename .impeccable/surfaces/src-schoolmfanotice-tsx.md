---
version: 1
slug: "src-schoolmfanotice-tsx"
primary_target: "src/SchoolMfaNotice.tsx"
related_targets: ["src/SchoolManager.tsx","src/AccountWorkspace.tsx","src/ClassroomManager.tsx"]
---

# School security refinement

Mode: Operate. Narrow extension of the approved account workspace; no redesign or new artwork.

## Direction contract

THESIS: Explain the security requirement at the blocked school action, not as a blanket barrier for every adult.

OWN-WORLD: Retain the violet account navigation, Fredoka headings, white reading surfaces, existing form spacing and Lucide icons. No token or component-system changes.

STORY: Parents and individual teachers can choose 2FA. School administrators must confirm an authenticator before school creation or access. Setup returns to the original school action without granting a role by itself.

FIRST VIEWPORT: Within the existing workspace, show a short heading, why protection is required, and one setup link. On phones retain the single-column reading order and wrapping buttons. A successful management unlock collapses the password form and shows its actual expiry when expanded.

FORM: Incumbent workspace refinement; no concept seed, new identity or comp round. Preserve native details and forms, focus rings and existing reduced-motion behavior.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
