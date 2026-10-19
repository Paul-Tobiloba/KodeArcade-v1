# Activity autosave feedback

Mode: Operate. Narrow refinement of the existing student learning interface.

THESIS: A successful background save reassures briefly, then gets out of the child's way. Failures remain actionable.

OWN-WORLD: Existing purple/lavender save colors, system-font status text and native recovery buttons. No new artwork or design-system replacement.

STORY: Pending → saving → one Saved confirmation for three seconds → hidden. Another save resets this cycle. Error/conflict remains visible with Retry, Download and/or Reload until resolved.

FIRST VIEWPORT: Routine feedback is a compact bottom-corner toast that does not reserve a row, move content, intercept clicks or take focus. Persistent failures use the existing in-flow strip with wrapping controls. Do not obscure the lesson heading with a full-width temporary overlay.

FORM: CSS-only 180ms transform/opacity exit; three-second timer has cleanup on state change/unmount. System and in-app reduced-motion settings remove spatial movement. A polite status region announces updates without moving focus. No queue or stacked toasts.

FINISH: Independent review of desktop/phone/tablet success, hidden and error states, with source-backed timer/focus/reduced-motion checks. Preserve incumbent DESIGN.md and sidecar.
