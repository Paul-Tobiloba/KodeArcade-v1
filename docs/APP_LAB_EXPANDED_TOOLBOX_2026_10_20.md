# App Lab toolbox expansion and panel removal — 20 October 2026

The owner approved the Claude-derived block design and requested more code blocks. During that work they explicitly requested removal of the dark read-only JavaScript preview. It is removed, together with its column styles. The workspace now uses the existing Show blocks / Show text switch; the real editable text editor, gutter, warnings and saved projects remain. Rounded category-railed styling is unchanged.

## Toolbox

54 complete command templates are grouped into six categories. UI controls include click/change events, text/number display, checkbox state, control properties, position/size, navigation and visibility. Control includes startup, if/else, bounded repeat, negation, comparisons and combined conditions. Variables includes counters and reading inputs. Text includes joining, length, upper/lowercase, contains and slicing. Math includes arithmetic/remainder, inclusive random integers, rounding/floor/ceiling, absolute value and min/max. Data includes cell reads/writes, row count, blank-row insertion/deletion and console output.

Text and Math templates assign results to a named variable. These are complete executable commands, not standalone value tiles or draggable expression sockets. Supported expressions can be combined through argument/source-command editing or Show text. Palette examples are parsed once, not on every render. On desktop the larger palette scrolls inside a 480px region; the existing horizontal mobile palette remains. Boolean arguments have true/false dropdowns instead of numeric equality workarounds.

## Runtime and compatibility

The shared block model adds native Boolean values, Boolean not, allowlisted property reads/writes, atomic position/size updates, number/text helpers and local row actions. Arithmetic adds remainder; comparisons add >= and <=. Old Boolean-as-comparison projects and all earlier block types remain supported. No automatic conversion of saved projects occurs on opening.

Properties are limited to text, background-color, text-color, font-size, x, y, width, height, hidden, checked and value. Checked writes require a checkbox; value writes require a slider. Control updates validate the same geometry, types, hex colours and bounds as the design editor. Position/size changes validate both coordinates/dimensions before applying. `setNumber` validates numeric input before displaying it. Random bounds must be ordered whole numbers within the existing numeric limits. Slicing uses whole-number positions 0–300. Text remains bounded to 300 units. Remainder/division by zero, invalid indices and unsupported functions/properties produce line-context errors.

`addRow` creates one blank row in an existing table and enforces the 50-row limit. `deleteRow` accepts an existing zero-based whole-number row index. All runtime data/property changes remain isolated from the saved design and reset on Run. The existing event/step/block/nesting/gallery bounds remain. The parser and runtime independently restrict helper/property names; arbitrary methods, prototype properties, DOM access, networking and source evaluation are not enabled. No timers, general while/for loops, arrays, user functions, media, canvas or new curriculum scoring are claimed.

New saves require a coordinated frontend/backend deployment because the shared validator must recognize the new block types. No database migration is necessary. Nothing was pushed, merged or deployed in this pass.

## Verification

The final focused run passed 193 App Lab tests. Every template is parsed, checked for diagnostics, executed against synthetic controls/data and round-tripped through text/backup conversion. Additional tests cover helper results, random endpoints, geometry/style updates, saved-design isolation, local row changes/limits, invalid inputs and independent rejection of corrupted function/property names. The final frontend regression passed 48 files / 1,977 tests, excluding historical review snapshots. Local private-progress integration passed 23 tests including new block serialization; server typecheck passed. No live account or production data was used.

All 30 browser cases passed across desktop, phone and tablet. After the bounded palette-sizing and Boolean-socket corrections, all six targeted final cases passed, checking real toolbox insertion/execution, panel absence, source completions, persistence, table operations, code-workspace accessibility and overflow. Final desktop, phone and tablet captures in `.impeccable/review/app-lab-expanded-*.png` were opened and visually inspected. The final production build passed with existing annotation/chunk-size warnings. The independent whole-surface finish-review status remains unchanged; these are builder checks, not a new independent sign-off. Nothing was pushed, merged or deployed.
