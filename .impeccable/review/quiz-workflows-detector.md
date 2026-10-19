# Scoped detector evidence — 11 October 2026

One detector run covered ModuleQuiz.tsx, module-quiz.css, ClassProgress.tsx, TeacherBatch.tsx, ClassroomManager.tsx, SaveFeedback.tsx and save-feedback.css. No blocking findings. Three advisories in module-quiz.css:

- 1.125rem question legends are outside the documented global ramp. Intentional 18px reading emphasis for question prompts; native option text retains inherited body size.
- #edf9f5 correct-answer background is an undocumentated local semantic tint, paired with incumbent #08796e and explicit “Correct answer” text.
- #9c233a incomplete-submission error text is an undocumented local semantic error color, paired with a role=alert text instruction.

These are scoped additions, not authorization to refresh DESIGN.md or its sidecar. Fresh review must judge readability and consistency. The detector was not rerun. Subsequent save-toast placement uses only an incumbent border color and shape and fixes initial heading overlap.
