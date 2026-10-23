# Articulated hand motion — verification, 21 October 2026

The owner rejected the previous contour-morph motion after its scoped fix signoff. The fresh hand-motion rejection review governs this replacement; page composition, sound, grading and saves remain unchanged.

## Mechanism

Original three-bone 3D digit solver, fixed lengths, bounded140-degree proximal/middle curl, rigid knuckle spacing and bounded palm adjustment. The SVG skin projects solved bones, not CSS whole-path interpolation. The focused passage emits local keydown/keyup/cancel events; text and sound proceed immediately. A single interruptible motor holds contact, releases and moves to the latest desired key. No stale queue or idle loop. Space demonstrates one valid thumb; either thumb remains valid. Reduced motion uses immediate solved/contact states, not interpolated travel.

## Checks and evidence

- 16 focused tests across four files pass, including bone lengths through19 representative key/Shift/Space/number/punctuation poses at press and intermediate reaches, rigid roots/travel bounds, finite contours, feedback and sound. Frontend TypeScript, production build and server TypeScript pass; known upstream annotations/large-bundle warnings remain.
- First six focused browser tests passed but screenshot inspection caught invalid pose captures and projection contour overlaps. The own correction batch changed the projection sign and retained the motor through geometry remeasurement. A diagnostic showed full-page screenshots temporarily resize the viewport to width0, legitimately causing offscreen cancellation; those invalid stills are not review evidence. Final captures use the full visible viewport at document top without a transient viewport resize. No runtime screenshot special case was added.
- An intermediate48-case run had42passes/6failures: three capture-induced held-key cancellations and three obsolete two-thumb assertions. Capture pipeline corrected; Space assertion now expects one demonstrative thumb. The final48-case matrix passed across desktop, phone and tablet projects (3.5 minutes): typing-hand-motion, typing-simple, typing-redesign and typing suites.
- The new browser suite exercises Q/E/R/T/Y/O, upper-case oppositeShift, same-finger and rapid repeated input, numbers/punctuation/Backspace, hold/release, blur, pause, guide removal and system/saved reduced motion. It records video and a measured release/reach trace; passing assertions are not visual/anatomical acceptance.
- One detector pass:1warning/31advisories, documented separately. Reused-raster provenance scan:8rasters/0missing. No new raster, copied EdClub frame/audio, dependency or data/schema change ships.

The actual built-preview recording `typing-hand-animation.webm` captures physical keydown, held contact and keyup for `q w e r ` at1311×685. All15 required current captures were opened: contact/reach/Space/Shift at desktop, phone and tablet sizes, and the three recording-sequence frames. All have valid content and complete guide/palms. Screenshots are viewport captures; no runtime capture-specific bypass exists. Source, sequence frames and event/timing assertions establish the authored sequence, not human acceptance or anatomical fidelity. Recording audio was not auditioned.

Final same-reviewer scoring and documentation pending. Real-device listening, Firefox/Safari motion and child learning outcomes are not established. No exact EdClub artwork/timbre or owner acceptance claim.
