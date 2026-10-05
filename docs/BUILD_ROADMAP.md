# Build Roadmap

Scope update, 5 October 2026: the user approved four missions plus a creative project for Friday, 9 October. The [Friday sprint plan](SPRINT_PLAN.md) is the current delivery schedule. This phased roadmap describes the longer development path where explicitly marked as expansion.

## Delivery strategy

The sprint should prove the riskiest and most valuable assumptions first:

1. Young learners can understand and operate the coding workspace.
2. Progressive hints help them recover from mistakes.
3. The recommendation is understandable and feels appropriate.
4. The experience remains usable on a basic device and interrupted connection.

## Phase 0: Validate the concept

Use the [concept validation guide](CONCEPT_VALIDATION.md) to conduct sessions and record evidence. This phase is pending; preparing the guide does not count as completing research.

### Outputs

- Interview or observe 3–5 learners, parents, teachers, or mentors.
- Confirm the most common reasons beginners stop learning.
- Test the language used for missions, hints, and recommendations.
- Identify one curriculum reference for sequences, directions/order, loops, and debugging.
- Record assumptions and evidence separately.

### Key questions

- What usually causes a learner to stop?
- What kind of help is useful without giving away the answer?
- What devices and connectivity conditions are realistic?
- What would make a learner return after one session?

## Phase 1: Experience prototype

### Outputs

- Low-fidelity screens for onboarding, journey map, mission, result, and next move.
- Clickable prototype of the first mission.
- Accessibility preferences and language-switch concept.
- Five-minute usability test with representative users where possible.

### Exit criteria

- A first-time user can identify how to start.
- A user can run and revise a solution.
- A user understands the difference between a mission, hint, and next move.

## Phase 2: Technical foundation

### Outputs

- Frontend application shell
- Reusable mission schema
- Block workspace technical spike
- Animation/execution proof
- Local learner profile and progress persistence
- Offline shell and cached core assets
- Automated test setup

### Exit criteria

- One hard-coded mission runs end to end.
- Refreshing or closing the application does not lose completed progress.
- The shell loads under simulated slow-network conditions.

## Phase 3: Complete learning loop

### Outputs

- Missions 1–4
- Automatic validation
- Progressive hint ladder
- Attempt and hint recording
- Rule-based recommendation engine
- Journey map and resume recap

### Exit criteria

- Review, practise, and advance routes can each be demonstrated.
- Recommendation reasons are visible to the learner.
- A failed attempt can lead to a hint, revision, and successful completion.

## Phase 4: Project and supporting experience

### Outputs

- Final mini-project
- Concept mastery summary
- Curated pathway/resource cards
- One translated sample mission if human review is available; otherwise document the gap
- Parent/mentor progress summary

### Exit criteria

- The complete world is playable.
- At least one project permits multiple valid solutions.
- External resources include source and access information.

## Phase 5: Verification and presentation

### Product checks

- Keyboard-only journey test
- Screen-reader smoke test
- Colour-contrast audit
- Reduced-motion check
- Small-screen check
- Slow and interrupted-network test
- Progress deletion/reset test
- Recommendation unit tests
- Mission-validation tests

### Capstone presentation flow

1. Introduce the learner and the reason they might disengage.
2. Show the low-pressure starting experience.
3. Complete a mission incorrectly.
4. Use progressive hints to recover.
5. Demonstrate the recommendation and its explanation.
6. Simulate leaving and resuming.
7. Show the milestone project and next pathway.
8. Explain how low-bandwidth, inclusion, privacy, and localization shaped the design.

## Delivery checkpoints

The approved Friday target is four missions and a final mini-project. The first checkpoint is one complete mission with feedback, hints, and persistence. Conditions and the other expansion missions follow after the sprint.

### First playable checkpoint

- First mission in Robot Rescue
- Block-programming interaction
- Visual execution and validation
- Progressive hints
- Saved progress and resume
- Explainable next-step recommendation
- Responsive and accessible core flow

### Capstone completion target

- Four polished missions and final mini-project
- Curated resource cards
- One translated mission if reviewed before submission
- Parent/mentor summary

### Could have

- More avatars and themes
- Additional project templates
- Printable offline activity
- Installable PWA prompt
- Lightweight audio cues

### Will not have during the sprint

- Public social features
- Live tutoring
- Payments
- Generative AI tutor
- Full school-management functionality

## Demonstration data to prepare

- A new learner with no progress
- A learner who needs review
- A learner ready to practise
- A learner ready to advance
- A returning learner with a partially completed mission
- A completed mini-project and pathway summary

## Definition of done

The Friday proof of concept is done when four missions and the final mini-project are playable, the primary learner journey works reliably, survives interruption, communicates an explainable next step, and has documented evidence about accessibility, low bandwidth, privacy, credibility, multilingual readiness, and local relevance. Pending research and unverified capabilities must be named explicitly in the submission.
