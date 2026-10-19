# Held arrow controls — 19 October 2026

Mode: Operate. User found basketball requires repeated clicking and explicitly requests hold-to-move for every project, including keyboard arrows. Existing-world input correction; session context already loaded, no new world/comp/seed.

## Direction contract

THESIS: holding an arrow is a sustained input across every project, not an instruction to click repeatedly.

OWN-WORLD: preserve the four existing native arrow buttons, names, icons, focus, mobile arrangement and child-authored source. No new art, palette, panel or save schema.

STORY: Run an existing/new project → press/hold arrow button or physical arrow → existing key-event blocks repeat while held → release/cancel/blur/Stop ends repeat input → tapping remains one key press.

FIRST VIEWPORT: visually unchanged stage and four arrow controls. Touch holds must not scroll/select the button; pointer capture handles release outside. Enter/Space activation and assistive click remain usable.

FORM: shared bounded input repeat, not hidden game movement. Feed ordinary key hats on initial press and a monotonic repeat cadence; retain held-key reporters and authored behavior bodies. Skip missed repeat intervals and deduplicate active event scripts. Wake idle/waiting scheduling promptly; don't let native OS repeat duplicate the shared cadence. Preserve single-tap, key lifecycle, old saves, existing all-stop, pending-script semantics and runtime budgets. Releasing stops new input; already-authored multi-step scripts may finish. No template migration, curriculum change, deployment or power action.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. Verify held pointer/touch/keyboard, release outside/cancel/blur/Stop/Reset, all arrow directions, saved basketball/other game/custom key hats and existing held reporters. One bounded responsive capture batch and scoped detector/provenance check; fresh finish review and documentation. Preserve global DESIGN/sidecar.
