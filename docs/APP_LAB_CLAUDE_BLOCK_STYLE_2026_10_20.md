# App Lab block-style reference implementation — 20 October 2026

The owner supplied two identical HTML files, `applab-blocks.html` and `App Lab_ stackable blocks.html`, after the earlier Markdown export omitted the design. SHA-256 of each supplied file: `60EDE4E2AC483B16FEF5A84A815DF4B725B8A9CD327592282731B063C2D0F75D`. Both were read; the first was rendered locally for visual reference. The Downloads originals were not edited. The files are visual references, not authority to execute arbitrary code or replace the existing application engine.

## Implemented treatment

Only App Lab's Code workspace changes. The surrounding header, phone preview, Design/Data interfaces, sample apps and global design guidance remain intact. Rounded blocks with colored 4px rails replace puzzle notches. UI controls use amber, Control blue, Variables purple and Data green. Startup/event containers have solid category-colored headers; white-text header fills are darkened relative to the source for readable contrast. Ordinary blocks use 13% category tints and 11px corners. Nesting uses inset grey lists with 8px padding and 6px sibling spacing; root scripts use 18px separation. The workspace has the reference's 22px dot grid.

Plain-language labels such as “when app starts”, “when … triggers …”, “make variable”, “set text of … to …” and “repeat … times” are generated for display only. White rectangular sockets edit the same saved arguments through the existing parser. Nested expressions retain their source syntax, and the code-icon control still exposes a complete editable command head. Display text never becomes executable source. Quoted values continue to use JSON escaping when reconstructing edits.

The 48px left gutter still aligns statement, populated branch and closing-line numbers independently of nesting. Diagnostic markers and existing inline/global warnings remain. A dark “JavaScript, live” panel displays the normalized saved program, updating after valid block changes. It is read-only; Show text remains the genuine editable CodeMirror view with diagnostics, completions and separate unfinished-draft handling. At widths of 1400px or more the preview is a third code-workspace column; narrower screens place it below the blocks. Existing fonts are retained rather than introducing the reference's remote font requests.

## Behavior retained

Existing category navigation, native drag insertion/movement, keyboard/tap insertion, explicit Delete, session undo/redo, bounded execution and local/account save formats are unchanged. The reference's standalone mutable tree, raw-string JavaScript generator, `for`/`+=` examples, global pointer handlers and drag-left deletion are not imported. No new executable language features, schema migration, external requests, database operations, curriculum changes or automatic saved-project conversion were added. CodeMirror remains lazy-loaded.

## Verification boundary

97 focused App Lab tests passed, including friendly-label conversion, expression preservation, escaping, saved-program conversion and all sample apps. The complete frontend suite, excluding earlier review snapshots, passed 47 files / 1,881 tests. All 24 App Lab browser cases passed across desktop, phone and tablet. Browser assertions cover 4px rails, 11px corners, 6px stacking rhythm, aligned gutter labels, source/socket edits, live generated code, warning markers, reload persistence, drag/tap insertion, undo/redo, Run, imports and private save scope. The targeted code-workspace accessibility scan and page-overflow checks passed. The production build passed with the existing dependency-annotation and chunk-size warnings.

The supplied reference and populated `app-lab-claude-{desktop,phone,tablet}.png` captures were opened and inspected. The scoped layout detector returned no findings. React checks kept components module-scoped and hoisted repeated prefix patterns out of rendering; final focused tests recheck that mechanical change. This is builder verification, not a new independent whole-surface finish verdict; the earlier independent-review status remains unchanged. No push, merge or deployment was performed.
