# Proof-of-Concept Scope

## Scope principle

Build one coherent learning loop deeply enough to test its usefulness. Do not attempt to reproduce the breadth of Code.org, Scratch, or a complete learning-management system during the sprint.

Scope revised with user approval on 5 October 2026 for submission on Friday, 9 October: four polished missions and one final mini-project. The eight-mission world is an expansion plan. See [Friday sprint plan](SPRINT_PLAN.md) for the delivery sequence and deferred capabilities.

## In scope

### One learning world

**World 1: Robot Rescue**

- Mission 1: Sequences
- Mission 2: Direction and order
- Mission 3: Repetition with loops
- Mission 4: Debugging a broken program
- Final mini-project: choose a destination and create a rescue route, with multiple valid solutions

Expansion after the sprint: efficient loops, conditions, combining loops and conditions, and mixed practice. The Friday demonstration teaches sequences, direction/order, simple loops, and debugging; it does not claim to teach conditions.

### Essential product capabilities

- Nickname-based local learner profile
- Accessibility and language preferences
- Start from basics without a diagnostic; optional starting-point check deferred
- Visual block-coding workspace
- Animated execution area
- Automatic mission validation
- Progressive hint ladder
- Explainable review/practise/advance recommendation
- Visual progress map and concept mastery indicators
- Local progress persistence
- Resume recap after interruption
- Curated extension-resource cards with source information
- One learner progress summary suitable for a parent or mentor

### Demonstrated multilingual readiness

- English interface and mission content
- Internationalization architecture with all visible strings separated from application logic
- One translated sample mission only if a fluent reviewer is available before submission; otherwise report this as pending
- Show a language-switching control only when reviewed translated content is available

## Out of scope for the capstone

- A large course catalogue
- Live classrooms or video conferencing
- Public chat, direct messaging, or an open leaderboard
- Payments and subscriptions
- Generative AI tutoring for children
- Automated career matching
- Production-scale school administration
- Social-media features
- Native mobile applications

## Operating-constraint response

### Quality and credibility

- Each lesson has a stated learning objective and concept definition.
- External resources display author or publisher, source link, language, format, and review date.
- Content is reviewed against an established introductory computing curriculum before demonstration.
- The platform distinguishes authored lesson content from external resources.

### Low bandwidth and limited access

- Build as an installable progressive web application where feasible.
- Cache the core interface, current world, and progress locally.
- Avoid video in the essential pathway.
- Use compressed vector or sprite assets and system fonts where possible.
- Show estimated download size before opening external resources.
- Ensure the core world remains functional after initial loading.

### Accessibility and inclusion

- Target WCAG 2.2 AA for the demonstrated flows.
- Provide keyboard-accessible controls and visible focus states.
- Do not rely on colour alone to communicate state.
- Support text enlargement, reduced motion, captions or text alternatives, and optional sound.
- Use short sentences, consistent layouts, and icon-plus-text labels.
- Test the main journey with a screen reader and keyboard.

### Personalization without exclusion

- Diagnostic participation is optional.
- Recommendations are explanations, not gates.
- Learners can repeat, skip between unlocked activities, or restart.
- Mastery can be demonstrated through more than one challenge.
- Difficulty is adjusted through scaffolding, not by permanently labelling ability.

### Privacy and security

- Collect the minimum information required for the demonstration.
- Use nicknames and local identifiers rather than real child identities.
- Keep proof-of-concept progress local unless a backend is necessary.
- Do not include public profiles, chat, or precise location tracking.
- Document what is stored and provide a clear reset/delete option.

### Multilingual access

- Externalize all user-facing text.
- Design layouts for text expansion and right-to-left support, even if RTL is not implemented in the first sprint.
- Use plain language and avoid humour that depends on one culture.
- Require human review before claiming a translation is supported.

### Local relevance

- Use familiar, respectful scenarios that do not depend on expensive technology or foreign cultural knowledge.
- Make resource and pathway cards configurable by country or region.
- Do not imply that one curriculum, credential, or career pathway applies across Africa.

## Suggested technical approach

| Layer | Suggested option | Reason |
|---|---|---|
| Frontend | React with TypeScript | Component-based development and strong tooling |
| Build framework | Vite | Lightweight proof-of-concept setup |
| Block editor | Blockly | Mature visual programming primitives |
| Animation | HTML Canvas or SVG grid | Lightweight, controllable execution feedback |
| State | React state plus a small store | Avoid unnecessary backend complexity |
| Persistence | IndexedDB or local storage | Local-first progress and offline support |
| Offline | Service worker/PWA support | Resilience under intermittent connectivity |
| Testing | Vitest and Playwright | Unit logic plus critical learner-flow testing |

The stack may change after a short technical spike. The learner experience and operating constraints should drive the choice.

## Core data model

- Learner profile
- Accessibility and language preferences
- Learning world
- Mission
- Concept or skill
- Attempt
- Hint usage
- Mission result
- Concept mastery
- Recommendation
- Resource card

## Recommendation logic example

```text
if mission completed:
    offer ADVANCE or REPLAY
else if attempts >= 3 and mission is not the first:
    offer optional REVIEW of first mission
else:
    recommend PRACTISE with one small change
```

The exact thresholds should be treated as testable design assumptions, not objective measures of intelligence.

## Proof-of-concept success metrics

- First mission start rate
- First mission completion rate
- Percentage of failed attempts followed by another attempt
- Hint-to-success rate
- Mini-project completion rate
- Resume success after a simulated interruption
- Percentage of learners who correctly understand the next recommendation
- Basic accessibility and low-bandwidth test results
