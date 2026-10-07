# Learner testing changes · 7 October 2026

The owner tested with children familiar with Scratch and code.org. A six-year-old struggled with written movement labels and mouse control. Learners wanted more playfulness and time to see Byte move before feedback. These are qualitative observations, not evidence that KodeArcade is more engaging than another platform.

## Implemented

- Little Explorers (6–8): arrow-image Blockly movement blocks, large click/tap-to-append arrows, shorter introductory articles with optional reading together. New learners begin with a one-step route.
- Code Adventurers (8–10): text movement blocks and full lesson articles.
- Independent Builders (10–14): the shared text-block curriculum and open route-design project. This is not yet a separate advanced language or curriculum.
- Separate course workspaces and completion records. Existing version-1 saves migrate to the text course. Accessibility preferences are shared.
- Ten activities in each coding module: sequences, directions/order, loops, debugging. Forty challenges plus one creative project per coding course. Routes include straight paths, turns, obstacles, repeating patterns and deliberate starter bugs.
- Ten mouse/touch activities: two aiming/clicking exercises and eight drag-and-drop deliveries. Pointer capture supports mouse and touch. Click-star-then-home and keyboard activation provide alternatives.
- Ten keyboard activities: Space, Enter, four arrow keys, a letter, typing Byte, Backspace correction, and a short message. Tablets without hardware keyboards have on-screen alternatives for key recognition. Typed exercises use the device keyboard.
- Play and Stop live beneath Byte's board. The stage sticks beside the editor on wide screens and stacks on narrow screens. Canvas background panning and wheel movement are disabled; scrollbars keep long programs reachable. Dragging instruction blocks is retained.
- Runs show all valid steps and leave 650ms after the last step before opening feedback. Reduced motion removes sliding but retains discrete steps. Empty or structurally invalid programs get a preparation interval before feedback. Stop and navigation cancel pending feedback.
- A ten-island module trail marks completed challenges with stars. Successful routes show an inline island-recharged message and the existing sound cue.

## Verification

Checks cover authored solutions for every mission, arrow interpretation, independent course persistence, legacy saves, delayed success/failure feedback with reduced motion, age switching and reload, mouse dragging, keyboard typing, and accessibility outside Blockly's SVG workspace.

## Next learner test

Observe six-year-olds without coaching: find a course, finish the one-step and two-step routes, add an arrow by clicking and dragging, explain what Byte did, and recover from a wrong route. Compare completion, requests for help and voluntary replay with the first test. Story variety, richer rewards, and distinct advanced projects should follow those observations.
