# KodeArcade product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users and purpose

Beginners learn through Grades 1–6 and Computer Explorers. Grades 1–2 use arrows; Grades 3–6 use text blocks, larger boards and route projects. Suggested ages run from 6–7 in Grade 1 to 11–12+ in Grade 6; readiness determines placement. Previous age-labelled courses remain accessible with their saved work. Initial informal learner testing by the owner identified reading and mouse-control difficulties; no comparative learning-outcome or engagement claim is made.

## Stack

React, TypeScript, Vite, and Blockly. User explicitly requested drag-and-drop with three areas: execution stage, draggable block palette, and code canvas. Support mouse on computers and touch on phones/iPads. Programs are interpreted as bounded movement instructions, without eval.

## Scope and commitments

Owner decision, 8 October 2026: the future platform will require signup, use Neon for the backend/database, Better Auth for authentication, and Resend for email. Record this stack now; defer implementation and provisioning until the learning-platform UI has been improved. The current prototype still has no signup/backend and keeps progress locally. Parent/guardian versus child account ownership and consent flow remain decisions to resolve before authentication implementation. No framework migration or choice between managed and self-hosted Better Auth has been approved.

Current implementation, 8 October 2026, for the Friday 9 October milestone: Grade 1 has sequences, directions/order and debugging (30 challenges + one project); Grade 2 adds loops (40 + one project); Grades 3–6 each add conditionals and variables (60 + one project each). Board sizes are 5, 5, 6, 7, 8 and 10 respectively. These are 316 generated variant activities with distinct grade IDs and progress, not 316 independently authored or educationally validated curriculum tasks. The 61 legacy coding activities and previous arrows/words/builder routes and saves remain available. Computer Explorers retains its twenty activities. Byte guides sequences/projects; Dash, Gigi, Fix, Milo and Nova guide specialist topics. IF / ELSE checks the current position; SET, CHANGE and Move by score use a runtime number that resets each run. Nicknames are optional; progress remains local, with no account, backend, public chat, tracking or learner-facing AI. KodeArcade branding remains independent of the parent workspace's company identity. See docs/GRADE_COURSES.md and docs/TOPIC_MODULES.md.

## Evidence and open decisions

The 8 October spiral curriculum brief (docs/SPIRAL_CURRICULUM.md) makes 1–5 challenge stars and age-appropriate end-of-topic assessment core product requirements. Current coding challenges implement gradual retry/hint star caps, completion rewards and protected saved bests. Five specialist characters and scenery treatments now accompany the six topics; quizzes, separate assessment/mastery missions, per-topic projects and badges remain planned. Larger-screen challenge mode keeps the board and canvas visible beneath a 56px toolbar, with Play below the board; ordinary programs fit and long programs use an editable readable overview. At widths up to 950px or heights up to 600px, panels stack and the page scrolls beneath a sticky toolbar; portrait phones use a 108px toolbar. Lesson pages retain normal reading scroll.

Grade selection and the board progression are implemented; this supersedes the earlier proposal-only boundary. This is KodeArcade's own progression, with no formal school-standard alignment. Each grade currently reuses concept lessons and generated route patterns rather than supplying the complete planned spiral curriculum.

Character sound effects use original device-local synthesis; each character has an eight-note background motif. Effects and music have independent preferences, with music off by default, gesture-unlocked and paused for narration, hidden tabs and success feedback. Successful execution opens earned stars and a 30-piece confetti burst lasting 2.8 seconds; reduced motion removes confetti. Opt-in read-aloud uses installed local English voices. Automatic selection prefers child-like names, then known female names, but device APIs expose no guaranteed age or gender. Settings offers manual voice selection and Preview voice; the voice URI is saved separately from progress. No child text is sent to a cloud speech service.

Verification supplied by the implementation pass: 444 unit tests across eleven files passed; production build passed with the known Blockly chunk-size warning; the main browser batch passed 32 checks with one intentional tablet skip, and six entry/read-aloud checks passed after review fixes. The grade-extension reviewer disposition is ship at the three scored fixes: landing availability/count, PRODUCT.md truth and the redundant grade eyebrow. All three are resolved with no material regressions in fix captures. This verdict covers those fixes, not platform, curriculum or accessibility certification.

Planning docs are in docs/. Informal testing with the owner's children informed the 7 October iteration; follow-up testing and formal curriculum review remain pending. English initially. Offline support must be verified before claimed. Deadline fixed; developer hours unknown.

## Accessibility

Large labelled controls, text alternatives for the board, reduced motion, text scaling, visible focus. Basic keyboard helpers append movement blocks; complete keyboard and screen-reader editing in Blockly remains to be evaluated. WCAG 2.2 AA is a target subject to testing, not a certification.
