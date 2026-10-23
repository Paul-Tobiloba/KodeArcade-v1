# Typing detector — 21 October 2026

One static detector invocation covered TypingCourse.tsx, TypingCards.tsx, TypingKeyboard.tsx, RewardStars.tsx, typing.css and reward-stars.css.

Primary finding: border-accent-on-rounded at typing.css's current-character underline (`border-bottom:3px solid`). Resolved mechanically with text-decoration underline; this marks the insertion point, not a card accent.

Advisories: local color shades, compact text sizes and keycap radii outside the incumbent DESIGN.md/sidecar ramp. These are local approved-preview extensions, not a proposed global rebrand. Pass these to the finish reviewer for actual rendered legibility, hierarchy and identity assessment. Do not mutate global tokens or rerun the detector merely to suppress advisory output.
