# Held arrows — documentation comparison, 19 October 2026

Disposition: documentation complete for the ordinary Operate input correction, following the fresh scoped **SHIP** in `held-arrows-finish.md`. No production or global design-authority edit was made in this pass.

## Evidence checked

Read Impeccable's `reference/document.md`; the incumbent `DESIGN.md` and relevant `.impeccable/design.json` system/component guidance; `PRODUCT.md`; the persisted `byte-lab-held-arrows.md` surface contract; `docs/BYTE_LAB_HELD_ARROWS_2026_10_19.md`; `held-arrows-verification.md`; all five sections of the fresh `held-arrows-finish.md`; and the supplied detector/provenance record. Compared the documented interaction against `StudioKeyControls.tsx`, the input/focus/scheduling lifecycle in `CreativeStudio.tsx`, `studioEngine.ts` setKey/poll/active/step/stop/dispose paths, and the inherited and arrow-control rules in `studio.css`.

The execution results and image inspection remain the supplied implementation/reviewer evidence: 1,783 frontend tests, 15 focused held-key tests, server typecheck, production build, and the final 12-case desktop/phone/tablet browser batch passed. This documenter did not rerun tests, a browser, captures, a detector or an asset scan.

## Implementation and documentation alignment

The product entry, scoped documentation and direction match the implementation: initial arrow input is immediate; ordinary key hats request repeats after 180 ms and then at 80 ms intervals, with active-script deduplication and missed-interval skipping. Releasing input stops new responses; an authored response already running may finish. Held-key reporters and inspectable behaviors retain their meaning. Physical keyboard repeat cannot add a second cadence. Native arrow buttons support pointer capture, cancellation, focus release, Enter/Space holds and single assistive activation; stage Space remains single-shot. Stage/window focus loss, visibility changes, Stop and Reset clear runtime input. A new press wakes idle or waiting scheduling.

The correction adds no project migration, template rewrite, save-schema change, game-specific movement or new runtime primitive. Movement remains in editable blocks. The existing four-button order, accessible names, icons, inherited focus treatment and responsive placement remain; `touch-action: none` and `user-select: none` support holding the current buttons. The local-only/no-deployment boundary is stated accurately. No material mismatch between current user-facing documentation and the scoped implementation was found.

## Incumbent system and preservation

No new system token, primitive, component specimen, shipping raster, global design file or sidecar update is needed. This is a shared input behavior correction within the incumbent Byte Lab surface. Its cadence is a runtime interaction contract, not a new global motion token. The scoped surface brief and implementation document already carry the behavior that belongs here.

Pre-existing documentation coverage remains: the global design files primarily describe the earlier learning/tile-world shell and do not catalogue the later dedicated Byte Lab control variants or adjustable stage/code composition. For example, Byte Lab already inherits its local 7px button radius and 3px action-violet focus outline at 2px offset, while global button/learning guidance describes other established variants. These local differences predate this input correction and are not caused by the touch/selection addition. This pass reports that coverage gap without repairing or promoting local rules into the global system.

Independently checked SHA256 values match the preserved baseline:

- `DESIGN.md`: `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE`
- `.impeccable/design.json`: `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D`

Only this scoped documentation report was written. The existing global design authority, production source, authored saves and artwork were preserved. No additional fix or inspection round is requested.
