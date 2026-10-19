# Ask Byte verification — 2026-10-12

## Scope

Local authored lesson help for movement/drawing; separate default-off adult-only AI evaluation route and loopback Ollama gateway. No live model connection or VPS changes were made. Model responses in automated tests are synthetic. Student help never calls a model.

## Results

- Frontend unit/regression suite: **23 files, 1,023 tests passed**.
- Server type check: passed. Backend regression: **13 files, 126 tests passed**, using `--hookTimeout=60000` for PGlite migration startup under concurrent local test load. First full attempt reached an existing 10-second account-fixture startup timeout; this was not hidden as a pass.
- Standalone loopback gateway: **3 Node tests passed**, covering token checks, strict payloads, fixed native Ollama protocol, bounded response handling, one in-flight generation and rate limit.
- Browser: **9 help/lab checks passed** across desktop/Pixel 7/iPad, then **3 drawing checks passed**. The drawing test initially pointed at a Grade 2 module with no introductory drawing action; corrected to the existing Grade 1 drawing module. No application change was needed for that fixture correction.
- Scoped axe check for the new learner disclosure: no violations in all three device projects. Not a whole-platform accessibility certification.
- Production frontend build: passed, with existing large-bundle and third-party annotation warnings.
- Local health: frontend 5173 = 200; API 3001 health = 200; anonymous private lab = 401.
- Git whitespace check: passed.

## Environment and evidence limits

Sandboxed full-suite attempts failed on Windows temporary-file and localhost isolation; reruns outside the sandbox passed. No database credentials were printed, remote services mutated, real learners created or real model prompts submitted.

Final valid inspected captures: `byte-help-desktop.png`, `byte-help-phone.png`, `byte-help-tablet.png`, `byte-lab-off-desktop.png`, `byte-lab-off-phone.png`, `byte-lab-off-tablet.png`, `byte-lab-result-desktop.png`. The result capture uses a labelled synthetic AI fixture. Two bounded capture rounds were used. Screenshots are local review evidence, not shipping raster assets.

One Impeccable detector pass reported three advisory type sizes. They were changed to inherited 1rem/.875rem steps; no second detector pass was run. Incumbent DESIGN.md/sidecar and approved raster artwork remain unchanged.

Prototype keyword filters are neither a safety evaluation nor proof that model responses stay on topic. Learner sessions are blocked server-side regardless of the pilot flag. Live Qwen integration, latency/concurrency and n8n impact remain unverified pending private VPS setup. See `docs/ASK_BYTE.md` for setup, known limits and prerequisites before any future student AI pilot.
