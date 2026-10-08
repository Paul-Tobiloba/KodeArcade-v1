# KodeArcade

**An adaptive, gamified coding platform for young learners**

> Play. Build. Learn.

KodeArcade is a capstone proof of concept designed to help young learners begin coding, experience early wins, and remain engaged long enough to build genuine confidence and foundational programming skills.

## Challenge alignment

- **Primary track:** Engagement & Staying in the Learning Journey
- **Secondary track:** Guidance, Pathways & Opportunity
- **Supporting track:** Access & Discovery of Learning Resources

KodeArcade does more than present lessons. It creates a supportive learning loop that helps a learner understand what to do, try it, recover from mistakes, recognize progress, and choose an appropriate next step.

## The proof of concept

The capstone will demonstrate a complete learning journey for one introductory coding world:

1. A learner chooses a short, low-pressure skill check or starts from the beginning.
2. The platform recommends a starting point without blocking other options.
3. The learner completes visual coding missions using blocks.
4. Progressive hints support the learner without immediately revealing the answer.
5. The platform records concept mastery and saves progress locally.
6. A rule-based adaptive engine recommends review, practice, or advancement.
7. The learner completes a small creative project and sees possible next pathways.

## Intended audience

The primary audience is young learners aged 6–14 who are new to programming, particularly those using shared, low-cost, or intermittently connected devices. Little Explorers (6–8) uses arrow blocks and short lessons; Code Adventurers (8–10) uses text blocks; Independent Builders (10–14) shares the text-block core with room for independent route design. Each coding course has separate saved progress, four modules of ten challenges, and one creative project. Computer Explorers adds ten mouse/touch and ten keyboard activities. See `docs/LEARNER_FEEDBACK.md` for the learner-testing changes.

## Capstone documents

- [Project brief](docs/PROJECT_BRIEF.md)
- [Learner pathway](docs/LEARNER_PATHWAY.md)
- [Proof-of-concept scope](docs/POC_SCOPE.md)
- [Brand guide](docs/BRAND_GUIDE.md)
- [Build roadmap](docs/BUILD_ROADMAP.md)
- [Concept validation guide](docs/CONCEPT_VALIDATION.md)

## Current stage

A local React/TypeScript prototype covers four modules of ten Byte challenges and a creative route project, with separate progress for each coding course, plus twenty computer-introduction activities. Informal testing with the owner's children informed the age-labelled courses and fixed-screen workspace. The submission deadline is Friday, 9 October 2026; formal curriculum validation remains pending.

The [spiral curriculum brief](docs/SPIRAL_CURRICULUM.md) records the expanded curriculum, 1–5-star rewards and age-specific assessments. The current implementation adds challenge stars, sequential success chimes and three-second retry notices; the expanded worlds, quizzes, mastery missions and badges remain planned. See [workspace reward notes](docs/WORKSPACE_REWARDS.md).

## Run locally

The root page is the KodeArcade landing page. Public pages at `/#/courses`, `/#/how-it-works` and `/#/parents` provide the searchable course catalog, learning guide and parent information. Choose **Start learning** to enter the workspace, or open `/#/learn` directly. Course links open `/#/learn/arrows`, `/#/learn/words`, `/#/learn/builder` and `/#/learn/computer`. See [illustrated public pages](docs/ILLUSTRATED_PAGES.md) for the approved artwork extension and [landing page notes](docs/LANDING_PAGE.md) for social-sharing metadata and the required deployment origin. Hash routes share one social preview.

Requires Node.js 22.12+ or 24 and npm. From this folder:

```sh
npm install
npm run dev
```

Open the local address printed in the terminal. The screen has a robot stage, a Blockly block palette, and a code canvas. Drag movement blocks from the palette and snap them below the start block. Drag connected stacks to rearrange them; drag unwanted blocks to the bin. Run code to watch Byte follow the instructions. Repeat blocks contain other blocks. Mouse and touch dragging are supported by Blockly. Keyboard helpers can append simple movements; full keyboard and screen-reader editing needs further evaluation.

```sh
npm test
npm run build
npm run preview
npm run test:e2e
```

Browser tests require Playwright Chromium (`npx playwright install chromium`). The prototype stores only an optional nickname, preferences, programs, and progress under `kodearcade-v1` in this browser's local storage. Settings includes a reset control. No backend, account, analytics, remote fonts, or learner-facing AI is used.

Offline reopening, curriculum review, a human-reviewed translation, external resource cards, and real-device/screen-reader checks are still pending. Blockly programs are interpreted directly without eval or JavaScript generation, with at most 24 instruction blocks, three levels of repeat nesting, and 120 executed steps. Conditions are outside this sprint. The platform is not yet deployed.

Blockly API references: [flyout toolbox](https://docs.blockly.com/guides/configure/toolboxes/flyout/) and [workspace serialization](https://docs.blockly.com/guides/get-started/save-and-load/). Its local UI icons in `public/blockly-media` are copied from the installed Blockly package and retain its Apache-2.0 license.

## Byte sound effects

Run code to hear a soft rising bloop for each animated move, a gentle three-note retry cue, or a four-note success chime. Toggle **Byte sound effects** beneath the Run controls to mute; this preference is saved on this device. Reduced-motion runs play only the result cue. Audio starts after a Run click/tap, never on page load. Sounds are original local Web Audio synthesis, with no audio downloads. If the browser blocks audio, the learning activity still works and all feedback remains visible.

## Working capstone title

**KodeArcade: An Adaptive, Gamified Coding Platform for Young Learners**

## Authorship note

The capstone idea originated from the student. AI tools may support research, planning, software development, testing, and documentation, in accordance with the sprint requirements; they are not presented as the origin of the idea.
