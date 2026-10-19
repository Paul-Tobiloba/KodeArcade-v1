# Held arrow controls — 19 October 2026

The basketball report exposed a shared input mismatch: controls updated held-key sensing, but ordinary key-event hats only received a click or initial keyboard press. Saved basketball, tennis, racing, catch and custom arrow projects now receive sustained arrow input without rewriting any project source.

## Interaction

- Press Run. Hold a physical arrow with the stage focused, or hold an on-screen arrow with mouse/touch. Initial input is immediate; repeat starts after 180 ms, then requests another key event every 80 ms. Existing active event scripts are deduplicated, so authored waits and multi-step responses retain their timing.
- Release, pointer cancellation/lost capture, focus loss, hidden page, Stop or Reset clears repeat input. Pointer capture handles releases outside the button. Releasing prevents new key responses; an already-running authored multi-step response can finish.
- A tap remains one press. Enter/Space can hold a focused arrow button; an assistive click activates it once. Stage Space remains single-shot. Operating-system key-repeat events do not add duplicate repeats.
- Missed intervals are skipped rather than replayed after a pause. The scheduler wakes immediately for a new key even when the project is idle or waiting. Existing held-key reporters and inspectable arrow behaviors continue to work.

## Boundaries

Movement remains in the child's visible blocks. No game-specific movement, migration, new primitive, save schema or template change was introduced. Existing bounds and execution budgets still apply. The four-button arrangement, accessible names, native focus and mobile layout are unchanged; buttons suppress touch scrolling/selection while held. Input is transient, not saved in the private gallery.

Implementation: `src/studioEngine.ts`, `src/CreativeStudio.tsx`, `src/StudioKeyControls.tsx`, `src/studio.css`. Regression evidence: `src/studioHeldKeys.test.ts`, `e2e/studio-held-arrows.spec.ts`, and `.impeccable/review/held-arrows-verification.md`.

Test locally at `http://127.0.0.1:5173/#/learn/grade-6/lab` (or the signed-in dashboard's assigned-grade Byte Lab). Refresh an already-open page, open an existing basketball/tennis/racing project, Run, hold/release each direction. Focus the stage to test the physical keyboard. This is a local implementation, not a production deployment or live child-account signoff.
