# Learning entry and concept lessons — updated 14 October 2026

## Current workspace-first flow

Fresh Grade 1–6 and retained arrows/words/builder coding courses now open directly in the working interface, without a separate prose page or Start challenge gate. Concept explanations, opt-in reading and worked examples remain in Lesson & instructions beside the board and code. Read lesson expands and focuses that panel without replacing the editor. On small screens the panel folds above the stage.

A five-step, nonmodal workspace tour appears on a course's first challenge when no tour dismissal is saved: mission, commands/palette, code, Play, then help/navigation. Back, Next, Skip tour, optional device-local narration and Replay tour are available. The actual palette, text editor and run controls remain usable during the tour; no demo replaces the learner's code, and no challenge completion or stars are awarded by finishing the tour. The tour temporarily hides behind arrival feedback and returns to the same step.

Completed/skipped state is stored as an optional `workspaceTour` marker on the course's first challenge. Public previews keep it in their existing independent browser saves; student sessions use the existing learner/class/course-scoped cloud snapshots. This introduces no new database table, analytics, microphone access or external narration. Computer Explorers retains its separate mouse/keyboard activities rather than receiving an inapplicable Blockly tour.

Module overview remains reachable from the help panel and module drawer. It contains activity lists, drawing, quizzes and next-module actions; the Grade 1 Sequences journey retains its video, guided practice and mastery evidence. Generic standalone lesson articles no longer render there. Explicit overview navigation is course-bound, so another course's overview does not become a new course's first screen. Older course-less lesson navigation falls back to the working interface without deleting saved programs.

## Historical behavior and verification

The notes below describe the earlier implementation and its original test evidence. The workspace-first flow above supersedes the standalone concept-article behavior and the older age-labelled chooser details.

`/#/learn` now opens an age/course chooser for both new and returning learners. Age ranges are guidance, not identity collection; no birth date is stored. Returning learners also get a coding-course resume link. Direct `/#/learn/arrows`, `words`, `builder`, and `computer` links open the selected course. Change course returns to the chooser, preserving existing independent saves.

The drawer names the current course. Coding paths currently share the available Robot Rescue curriculum; they do not include future Variables/Conditionals previews in the drawer. Computer Explorers shows only its mouse/touch and keyboard content. Its activity navigation remains in the practice area.

A concept article opens until any challenge in that module has a saved lessonSeen flag or completion. This migrates existing per-challenge history without a schema change. Later challenges go straight to the workspace; a new module gets its own introduction. Read lesson always permits manual review. If a future task introduces a genuinely new idea, give that concept a distinct lesson key rather than forcing every practice challenge through the same article.

Read-aloud is opt-in for lessons, challenge instructions/revealed hints, computer activities, and feedback. It uses only local English Web Speech voices; no microphone permission, external service, or narration autoplay. Availability and voice quality depend on device/browser. A missing voice or synthesis failure is explained in text. Speech stops on content changes, leaving a lesson, closing feedback, starting a run, leaving the course, or hiding the tab. Byte sound effects remain a separate preference. Automated tests stub speech to verify controls and cleanup; actual voice quality still needs listening on the children's devices.

Future videos belong to these concept introductions, with learner-controlled playback, captions and the existing written lesson as a transcript/fallback. No video files or placeholder player have been added yet. Concept-level videos should not replay between every reinforcement activity.

The landing-page background transition issue remains deferred at the user's request; this change does not edit its styling.

Verification: production build and 75 unit tests passed. All six new entry/narration browser tests passed across desktop, phone and tablet. The wider 39-test run had 33 passes and two intentional reference-viewport skips; its four failures were resolved (one keyboard skip-link regression and three ambiguous test selectors). The targeted six-check rerun for computer practice and keyboard preferences then passed on all device profiles. Narration tests use a stub device voice, not an assessment of audible voice quality.
