# Interactive core challenge upgrade

Selected existing slots in Grades 3–6 now teach changing world state rather than extending a route. There are still ten core challenges per module, not an extra practice track. Grade 1–2 retain their simpler topic coverage.

| Module / slots | Character | Task and evidence |
| --- | --- | --- |
| Conditionals 3–4 | Dash | Collect five carrots scattered along different turning trails around plants and holes. Check the current square: pick up if present; otherwise follow the next numbered path tile. A pickup empties the square, changing the next answer. There is no finish tile: collecting the fifth carrot ends execution immediately, even before the trail ends. |
| Loops 7 | Gigi | Repeat move-then-pick as one body. Picking before moving fails on the empty starting square. Three instruction blocks replace six individual actions. |
| Variables 7 | Nova | Start score at zero and add exactly one per collected acorn. Empty squares must not change score. A correct final number without correct counting does not pass. |
| Conditionals 7–8 | Milo | Check the adjacent gate. If locked, take the side path, collect the key, return and unlock it. On the already-open version, the key-hunt branch must be skipped. |
| Conditionals 9–10 | Milo | Check the adjacent river crossing. Build a missing bridge from the bank, then cross. Unbridged movement causes a recoverable splash; an existing bridge needs no rebuilding. |

This replaces eight slots per grade, 32 slots overall, with eight authored scenario types. Larger grades retain their larger boards. The same visible items, gates and river cells drive execution and the accessible board description. State changes appear during playback, not only after feedback. Every run resets the items, key, gate and bridge to the authored initial state.

## Instruction limits

- All graded loop missions, selected conditional missions and loop-based variable missions have activity-specific limits derived from valid compact reference programs.
- Loop drawing activities use the written instruction count of their reference and require a loop. Free drawing keeps the normal 24-instruction allowance.
- Count each physical instruction block once, including loop containers and nested bodies. The start block is excluded; ELSE belongs to its IF block. Text mode uses the equivalent parsed instruction count, not loop-expanded steps or comment lines.
- Blockly's native capacity limit prevents adding beyond the budget. Keyboard additions use the same check; execution also validates saved/pasted work, including headless Text mode. Restored drafts are not deleted just for exceeding a tighter teaching budget: they can be edited down.
- Execution limits remain separate: 120 movement frames / 500 dynamic operations, bounded nesting and repeat counts. A short program is not permission for unbounded execution.

The editor uses the supported `maxBlocks` capacity option described in [Blockly's configuration reference](https://docs.blockly.com/guides/configure/configuration_struct/), with one extra capacity slot for the fixed start block.

## Bounded teaching commands

`item_here()`, `pick_up()`, `move_next()`, `gate_locked()`, `open_gate()`, `bridge_missing()` and `build_bridge()` are activity-specific teaching commands, not general Python APIs. Item checks inspect the character's current square. Dash's `move_next()` follows one adjacent numbered trail tile, including turns. Gate/bridge checks and actions require an adjacent obstacle. Other movement remains screen-relative. All supported commands are parsed; no learner code is evaluated as JavaScript or unrestricted Python.

## Save compatibility

New tasks have versioned `-world-v2` IDs and declare which original slot they replace. Original missions remain in the mission registry and new entries are appended so existing numeric indices never shift. Module lists select the new IDs. Old programs, completions and stars remain under the original IDs; they do not automatically certify the replacement tasks. Resuming an original replaced task selects its new version. There is no change to the storage key, account model or backend.

## Verification

`src/worldChallenges.test.ts` covers all 32 reference programs, slot counts, save migration, pickup state, empty squares, both conditional outcomes, keys, gate proximity, river failures/recovery, counting semantics and matching Blockly/Text/drawing budgets. `e2e/world-challenges.spec.ts` exercises visible state updates, capacity limits, recovery, core navigation and drawing on desktop, phone and tablet.

Verified 10 October 2026: production build passed; 991 unit tests passed; 30 final world-challenge browser checks and 12 earlier module-flow regression checks passed across desktop, phone and tablet. The final checks include collecting five carrots without a finish tile and resetting the collection. Automated accessibility checks passed on the rendered collection/gate screens. The existing large-Blockly-chunk build warning remains. Impeccable kept this a scoped learning-shell refinement, and the React best-practices review checked hook ordering, state ownership, accessible labels and cleanup without adding a UI framework.
