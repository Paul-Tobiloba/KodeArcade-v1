# Learning entry and concept lessons

`/#/learn` now opens an age/course chooser for both new and returning learners. Age ranges are guidance, not identity collection; no birth date is stored. Returning learners also get a coding-course resume link. Direct `/#/learn/arrows`, `words`, `builder`, and `computer` links open the selected course. Change course returns to the chooser, preserving existing independent saves.

The drawer names the current course. Coding paths currently share the available Robot Rescue curriculum; they do not include future Variables/Conditionals previews in the drawer. Computer Explorers shows only its mouse/touch and keyboard content. Its activity navigation remains in the practice area.

A concept article opens until any challenge in that module has a saved lessonSeen flag or completion. This migrates existing per-challenge history without a schema change. Later challenges go straight to the workspace; a new module gets its own introduction. Read lesson always permits manual review. If a future task introduces a genuinely new idea, give that concept a distinct lesson key rather than forcing every practice challenge through the same article.

Read-aloud is opt-in for lessons, challenge instructions/revealed hints, computer activities, and feedback. It uses only local English Web Speech voices; no microphone permission, external service, or narration autoplay. Availability and voice quality depend on device/browser. A missing voice or synthesis failure is explained in text. Speech stops on content changes, leaving a lesson, closing feedback, starting a run, leaving the course, or hiding the tab. Byte sound effects remain a separate preference. Automated tests stub speech to verify controls and cleanup; actual voice quality still needs listening on the children's devices.

Future videos belong to these concept introductions, with learner-controlled playback, captions and the existing written lesson as a transcript/fallback. No video files or placeholder player have been added yet. Concept-level videos should not replay between every reinforcement activity.

The landing-page background transition issue remains deferred at the user's request; this change does not edit its styling.

Verification: production build and 75 unit tests passed. All six new entry/narration browser tests passed across desktop, phone and tablet. The wider 39-test run had 33 passes and two intentional reference-viewport skips; its four failures were resolved (one keyboard skip-link regression and three ambiguous test selectors). The targeted six-check rerun for computer practice and keyboard preferences then passed on all device profiles. Narration tests use a stub device voice, not an assessment of audible voice quality.
