# First preview verification — 5 October 2026

## Verified

- TypeScript and Vite production compilation pass.
- 21 unit tests pass: movement, rocks/edges, end-position validation, loop objectives, alternative routes, debugging, provisional next-step rules, stored-data boundaries, Blockly connection handling, repeat bodies, and execution limits.
- 9 Playwright checks pass across desktop Chromium, a phone viewport, and an iPad-sized viewport. Desktop uses mouse dragging; phone and tablet use emulated touch events for block dragging. The flow includes an unsuccessful run, a hint, recovery, completion, reload/resume, and switching missions.
- Preferences, a basic keyboard helper, and progress reset are checked at all three sizes.
- Automated axe checks pass for the surrounding application UI at these sizes. The Blockly SVG workspace is explicitly excluded from those checks and still needs a dedicated accessibility assessment.
- No page errors were recorded during the tested drag/run/resume journeys.

## Limits

Browser emulation is not testing on physical phones or iPads, and the iPad-sized test uses Chromium, not Safari. No screen-reader session, child usability study, curriculum review, translated-content review, or offline-reopening test has been completed. Full keyboard editing of Blockly programs remains under evaluation. Successful mission execution is not a validated measure of learning.

The current production app is approximately 278 kB gzipped JavaScript plus 6 kB CSS, before local Blockly UI icons. Blockly accounts for most of the JavaScript. No remote fonts, essential videos, child accounts, analytics, or generative tutoring are included. Progress stays in local storage in this browser.

## Reproduce

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Current screenshots are in `.impeccable/review/`. The visual skill's context loader and detector could not run because its launcher reported `cache_directory_failed`; visual review uses captured screens and source inspection instead.
