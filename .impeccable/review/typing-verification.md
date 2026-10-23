# Typing verification — 21 October 2026

Story: a learner chooses Typing and an assigned/public grade, practises with keyboard guidance, completes an activity, receives a bounded star celebration and returns to separately persisted typing progress.

| Boundary | Evidence |
| --- | --- |
| Course entry → working UI | Built-preview smoke test selected Grade 1, opened Start typing, physically entered `f j` and reached five earned stars. Playwright reported `pageErrors: []`. |
| Browser → local result | The same built-preview smoke read `kodearcade-typing-v1:grade-1` and confirmed five saved stars for the completed activity. No account session was used. |
| Student UI → API | Browser tests exercised private assigned-grade routes and POST progress collection, while confirming public preview storage remained untouched and unassigned grade access failed closed. These browser account requests used synthetic fixtures, not a production account. |
| API → database → response | Twenty-four progress API tests passed against an isolated PGlite database, including private typing persistence, cross-grade validation, old-client omission preservation and another learner's isolation. |
| Persisted response → UI | Cloud hydration/collection round-trips and best-achievement preservation passed in the frontend suite; student browser fixtures confirmed save acknowledgements and private results. |
| Build/runtime | Final production build and frontend/server typechecks passed. Existing large-chunk/Zod annotation warnings remain non-failing. Frontend:49 files/1983 tests. Browser:60 typing/dashboard/Labs checks plus12 separate reward checks across desktop, phone and tablet. |

Environment boundary: no new environment variables or database migration. The local frontend preview is `http://127.0.0.1:4173`; it is device-only practice, not a launched local account backend or a production deployment. Live production login/database behavior was not claimed or exercised. Deploy frontend/backend together for the additive validated typing field.

Visual finish: fresh reviewer disposition `ship` in typing-finish.md. All required main/result/map/motion and short-desktop captures were opened and validated; no material fixes requested. Asset provenance scan:two rasters,zero missing.

Next owner-requested topic after this release: resume coding curriculum enhancement and revise coding grading so repeated learning attempts do not reduce rewards. This implementation preserves existing coding grades; only the shared celebration appearance changed.
