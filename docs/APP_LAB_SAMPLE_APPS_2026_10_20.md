# App Lab sample apps — 20 October 2026

Open App Lab → New app to create an editable copy of a sample. The picker now has seven working examples plus Blank app. Existing projects are not replaced, and the existing eight-project limit still applies. Templates are instantiated only when selected, not automatically imported into a learner's saved gallery.

## Added samples

- **Number Detective:** three arithmetic questions stored in a project-local table. A dropdown and Check answer button demonstrate comparisons and branching. Each question awards at most one point, incorrect answers show feedback, and Next question moves through the table. After the last question a new round starts with a zero score. The first question is read from the table on Run, so edits to it appear immediately. Scores are sample-app variables, not curriculum stars or assessment records.
- **Mini Calculator:** two numeric inputs, an Add/Subtract/Multiply dropdown, a Calculate event and a result label. This intentionally demonstrates three supported operations, not a full calculator. Invalid or out-of-range numeric input uses the existing bounded runtime's error handling. Division was not added or advertised.
- **Story Paths:** three screens with two alternative endings and return buttons. Screen-navigation events, readable story labels and editable copy demonstrate a non-board, branching narrative.
- **Mission Checklist:** three pretend goals represented by checkboxes and a project-local table. Update my progress writes the checkbox states to the table, recounts completed goals and updates the summary. Unchecking a goal reduces the count correctly. Runtime checkbox/table changes reset on the next Run; editing the saved design or Data table remains an ordinary project edit.

Hello, app!, Tap counter and Animal explorer retain their existing behavior. Blank app remains available. All samples use the same existing design controls, independent JavaScript-shaped blocks, text conversion and bounded runtime; no new executable API, database, project schema, media or external request was introduced.

## Verification

The focused App Lab run passed 95 tests, including validation of every starter, clean code diagnostics, blocks/text/backup conversion, quiz scoring and round reset, arithmetic operations and decimal/negative input, both story paths, checklist unchecking/data isolation and independent copies. The frontend suite, excluding old review snapshots, passed 47 files / 1,879 tests. The production build passed with the existing dependency-comment and chunk-size warnings.

All 24 App Lab browser cases passed across desktop, phone and tablet. The new coverage exercises all four samples through the real picker and live preview, reopens saved copies and checks that the checklist code remains available in text view. Gallery and populated preview captures are recorded under `.impeccable/review/app-lab-sample*.png`; all twelve sample previews and three picker captures were opened and inspected. Tests use synthetic browser-local projects, not live student accounts.

The additions preserve the approved App Lab interface and existing sample-list layout. No curriculum integration, automatic seeding of personal projects, production data operation, push, merge or deployment is included. Earlier whole-surface independent-review status is unchanged by these builder checks.
