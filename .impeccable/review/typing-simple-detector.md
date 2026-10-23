# Simple typing detector — 21 October 2026

One scan of TypingCourse.tsx, TypingPractice.tsx, TypingKeyboard.tsx, TypingHands.tsx and typing-practice.css returned 32 findings (exit 1): one warning and 31 advisories (15 type, 14 color, 2 radius). No second scan.

The warning is `border-accent-on-rounded`, typing-practice.css:11, `border-bottom:3px solid`. Proposed narrow exception: the current beginner letter tile has a functional violet position underline, not a decorative card accent. This remains subject to the independent review, not silently suppressed. The other findings describe route-local teaching colors, small keyboard/utility labels and keycap radii outside the global marketing token ramp; no global design-system replacement is requested.
