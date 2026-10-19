# Lesson repeat counts — 16 October 2026

The owner observed that course loop blocks could not exceed five and asked to remove that restriction. Removed the difficulty-specific 2–5 course and 2–12 drawing count restrictions across native fields, compact overview editing, text parsing, interpreters, local restore and the shared authenticated progress schema. Counts are non-negative safe integers (JavaScript's exact integer representation), not capped at a pedagogical number. Zero skips the body; one runs it once. Existing authored tasks, expected outputs, quizzes and achievements are unchanged.

Runtime guards remain: basic expansion has a 500-operation guard (including nested no-op loops) and existing movement-step bound; dynamic and concept execution retain their 500-operation/120-step budgets, output/nesting restrictions and board rules; drawing retains 500 operations and page bounds. They stop oversized execution without silently clamping a saved repeat count. Byte Lab's dedicated project engine retains its separate bounds.

Verification:

- 1,635 frontend tests across 34 files passed, including values 0,1,6,10,25,100,1000, machine representation, route/relative/function/drawing execution, save/reload and nested-zero-work/huge-loop guards.
- All 18 isolated synthetic progress API tests passed, including saving/reloading25 and rejecting negative, fractional and unsafe-integer counts without overwriting it.
- Three scoped Chromium browser checks passed on desktop, emulated phone and tablet: edit6→25, private mock autosave, reload retaining25, execute6 iterations and inspect six output values. Expected lesson output still correctly reports a mismatch when the task asks for two; this is not a count cap. No page errors or document-width overflow.
- Production build and server typecheck passed; existing dependency annotation/bundle-size warnings remain. Broader browser regression remains paused.
- Local API health returns ok and capabilities report cloud progress enabled; this read-only check is not a live Neon persistence test. Frontend is available on127.0.0.1:5173, API on127.0.0.1:3001 for owner testing. No live student records were mutated by automated checks. Changes remain local on codex/auth.

Test the pictured editor without login: http://127.0.0.1:5173/#/learn/grade-6/lab (device-local preview). For private student projects: sign in as an enrolled learner, open http://127.0.0.1:5173/#/student-courses and choose Open Byte Lab beside an assigned Grade3–6 course. To test the course correction, open any course's Loops module and enter6,10 or25. Reload the page if it was already open.

Impeccable hardening guidance kept this a narrow input/validation repair: preserve the existing shell, native Blockly geometry and labels; correct misleading range help; preserve larger saved values; retain clear runtime safety feedback. No visual identity/design-authority refresh.
