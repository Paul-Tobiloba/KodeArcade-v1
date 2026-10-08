# KodeArcade product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users and purpose

Beginners aged approximately 6–14 learn through age-labelled coding courses and Computer Explorers. Ages 6–8 use arrows and short lessons, ages 8–10 use text blocks, and ages 10–14 share the text curriculum with independent route design. Initial informal learner testing by the owner identified reading and mouse-control difficulties; no comparative learning-outcome or engagement claim is made.

## Stack

React, TypeScript, Vite, and Blockly. User explicitly requested drag-and-drop with three areas: execution stage, draggable block palette, and code canvas. Support mouse on computers and touch on phones/iPads. Programs are interpreted as bounded movement instructions, without eval.

## Scope and commitments

Owner decision, 8 October 2026: the future platform will require signup, use Neon for the backend/database, Better Auth for authentication, and Resend for email. Record this stack now; defer implementation and provisioning until the learning-platform UI has been improved. The current prototype still has no signup/backend and keeps progress locally. Parent/guardian versus child account ownership and consent flow remain decisions to resolve before authentication implementation. No framework migration or choice between managed and self-hosted Better Auth has been approved.

Friday 9 October 2026: four coding modules (sequences, directions/order, loops, debugging), ten challenges each, and one project. Computer Explorers has ten mouse/touch and ten keyboard activities. Conditions and variables remain expansion work. Nicknames optional; no account, backend, public chat, tracking, or learner-facing AI. Each coding course keeps separate progress in this browser. KodeArcade branding only, independent of the parent workspace's company identity.

## Evidence and open decisions

The 8 October spiral curriculum brief (docs/SPIRAL_CURRICULUM.md) makes 1–5 challenge stars and age-appropriate end-of-topic assessment core product requirements. Current Byte challenges implement gradual retry/hint star caps, completion rewards and protected saved bests; expanded worlds, quizzes, mastery missions and badges are planned rather than shipped. Challenge mode must keep the board and canvas visible without document scrolling; long programs may scroll inside the canvas, while lesson pages retain normal reading scroll.

Planning docs are in docs/. Informal testing with the owner's children informed the 7 October iteration; follow-up testing and formal curriculum review remain pending. English initially. Offline support must be verified before claimed. Deadline fixed; developer hours unknown.

## Accessibility

Large labelled controls, text alternatives for the board, reduced motion, text scaling, visible focus. Basic keyboard helpers append movement blocks; complete keyboard and screen-reader editing in Blockly remains to be evaluated. WCAG 2.2 AA is a target subject to testing, not a certification.
