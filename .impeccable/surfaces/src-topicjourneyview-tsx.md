---
version: 1
slug: "src-topicjourneyview-tsx"
primary_target: "src/TopicJourneyView.tsx"
related_targets: ["src/ActivityList.tsx","src/ModulePractice.tsx","src/App.tsx","src/LessonArticle.tsx","src/DrawingLab.tsx","src/drawingActivities.ts","src/course.css"]
---

# Learning module overview — 10 October 2026

Mode: Operate + Read. Refinement of the incumbent purple learning world, not a replacement design. The reading/task path is lesson → core practice → related drawing → next module. On desktop, Grade 1's supplementary repair/mastery/project/badge remains beside its lesson and core list; on narrow screens DOM order becomes one reading column. No nested reading scroll.

Activities are semantic ordered lists, not layout tables: consistent number/check column, left-aligned title/purpose, text completion/action and chevron. Full rows are at least 44px. Mobile status wraps below the description. No star-perfection gate. Module footer names the next destination and opens its lesson even if previously reviewed. Last module exits to course selection.

Drawing placement follows existing code, using stable global indices and unchanged save keys. Sequence trails, directional turns/branching, looped patterns, variable spirals and free projects are discoverable in their respective modules. Drawing navigation stays scoped to its parent; last drawing and last core challenge return to the module. Desktop fixed activity shell and mobile scrolling remain unchanged. Lesson defaults remain open on desktop activity 1, collapsed on later activities, and whole-help collapsed by default on compact screens.

Evidence and remaining UX work: docs/LEARNING_UX_REVIEW.md. Existing master objectives, badge criteria and save schema are preserved. No formal learner testing or whole-platform accessibility certification claimed.
