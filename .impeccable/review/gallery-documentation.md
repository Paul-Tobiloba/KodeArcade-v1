# Private Byte Lab gallery documentation comparison — 17 October 2026

This is an ordinary, approved extension of KodeArcade's incumbent Build & Play world. It documents source and scope; it does not supply the separate finish reviewer's verdict or certify the platform, curriculum, privacy or accessibility. Global design authority is preserved.

## Authority and evidence

Read `C:/Users/USER/.codex/skills/impeccable/reference/document.md` completely. Compared current `src/StudioLibrary.tsx`, `src/studio-gallery.css`, `src/CreativeStudio.tsx` and `src/studio.css` with the incumbent `DESIGN.md` and `.impeccable/design.json`; read `PRODUCT.md`, `docs/BYTE_LAB_GALLERY_2026_10_17.md`, and the surface brief's **Private gallery extension — 17 October 2026** direction contract. Also inspected `shared/studioGallery.ts` for collection bounds/migration and the earlier `.impeccable/review/studio-documentation.md` to distinguish inherited studio differences from this gallery addition.

The approved contract pins the existing editor identity and familiar private collection actions. It does not authorize a new visual identity or refresh/merge of global authority. The document reference's general DESIGN/sidecar generation workflow is therefore limited here to this scoped comparison; neither global file was rewritten. No qualitative identity interview or composition workshop is necessary for this already approved extension.

No browser, test suite, detector, provenance scan or agent definition was read/run by this documentation pass. Code evidence below is source evidence, not a rendered interaction or conformance claim.

## Preserved visual system and scoped additions

| Incumbent authority | Current evidence | Comparison |
| --- | --- | --- |
| Approved K mark, Fredoka display/brand voice, system reading/control type | `StudioLibrary.tsx:85` uses `/brand/mark-color.svg` at 32 by 36 CSS pixels and the incumbent brand class. `studio-gallery.css:4`, `:21` use Fredoka for the gallery heading/project titles; `studio.css:1`, `:3`, `:12` retain system controls and Fredoka wordmark. | Existing identity is carried into My projects. No new logo, downloaded reference artwork or identity palette is introduced. |
| Deep purple navigation, violet actions, white bordered workspaces, pale lilac supporting ground | `studio.css:1`, `:11`, `:18` retain `#f7f4fe`, `#241259` and `#352269`; `studio-gallery.css:6–8`, `:13` use learning action `#6237df`, hover `#5332d6`, white cards and `#c6b6e8` borders. Supporting copy remains `#575472`. | Palette roles agree with the existing learning/editor world. These remain scoped literal values, not new global tokens. |
| Border-led depth and gently rounded surfaces, shared modal treatment | Gallery articles use a 12px radius and 1px border (`studio-gallery.css:13`), without card shadows. Create/rename/settings reuse `.studio-dialog`; `studio.css:100–103` supplies 16px corners, dim backdrop and `0 20px 80px #11182740`. | Existing panel and dialog vocabulary is reused; no new elevation system. |
| Visible focus, readable text and profile accommodations | Named open/rename/duplicate/delete controls, labelled rename field and native labelled dialogs occur in `StudioLibrary.tsx:94–101`; status/error text uses `role="status"`/`role="alert"`. Gallery heading focus is restored on return and mutations (`:37`, `:65`, `:100`). Studio focus and yellow toolbar focus remain (`studio.css:7`, `:20`). | Existing mechanisms remain in source. The thumbnail button gets an inset focus outline (`studio-gallery.css:15`) because its card clips overflow. Larger text is inherited; the static gallery adds no spatial animation. No complete keyboard/Blockly or screen-reader certification is asserted. |
| Approved sprites/scenery, composited private artwork | `StudioThumbnail` (`StudioLibrary.tsx:22–28`) reads the saved backdrop and visible sprite positions/sizes/costumes. It reuses `AssetPicture` and `StudioDrawing`; existing character atlas CSS remains at 300% by 200% with its 4% horizontal inset (`studio.css:37`). | Thumbnails are generated in the page from authored starting-scene data, not invented placeholders, remote screenshot uploads or running-engine captures. They are a 16:10 summary with thumbnail-specific sprite scaling, not an exact square-stage screenshot or runtime replay. |
| Surface contract's collection composition | `studio-gallery.css:2`, `:11`, `:34–41` provides a 1160px content maximum, 24px grid gap, three columns above 950px, two from 601–950px and one at 600px or below. Phone gap is 20px; heading stacks and tool actions wrap. | This is the approved gallery's 3/2/1 composition, not a replacement for guided lesson layout. At 600px and below the gallery specifically reduces its toolbar minimum to 72px; the editor retains its own phone toolbar rules. |

## Feature boundaries and recovery truth

`StudioLibrary` owns a strict version-1 `byteStudioGallery` collection. `shared/studioGallery.ts:4–14` enforces twenty total entries, including Recently deleted, unique identities, an active ID referring only to a non-deleted entry, validated project bodies and **600,000 serialized UTF-8 bytes** for the wrapped collection. This is decimal 600 KB, not 600 KiB. It remains inside the existing course workspace; there is no separate project service or new database schema in this extension.

The gallery and editor changes provide these bounded behaviors:

- **Create/open:** `StudioLibrary.tsx:52–58` appends a fresh entry and selects it; it does not replace another creation. The first untouched migrated draft still uses the existing first-use chooser/tour. `CreativeStudio.tsx:114–126` routes later New project choices through `onCreate`; its old replacement path remains a standalone compatibility fallback. Opening/returning changes `activeId`, not `updatedAt`.
- **Independent edits and duplication:** `updateProject` (`StudioLibrary.tsx:45–50`) updates only the selected entry, and skips identical project bodies. Duplication deep-clones the body, changes its name and gets a fresh gallery identity (`:52–55`, `:96`). Cards sort by edited timestamp; their localized dates include machine-readable time values. Rename uses a labelled required field bounded to forty characters and explicit Save name (`:100`).
- **Recoverable deletion:** `mutate` (`:60–65`) separately confirms moving to Recently deleted and permanent removal. Trash retains saved entries until restore or explicit Delete forever, and offers individual JSON backup (`:96`). There is no timed purge. Deleted entries still consume the twenty-entry and byte budgets.
- **Backups and imports:** gallery download includes the collection; gallery import accepts project or gallery JSON up to 2 MiB input and appends fresh entry identities while retaining deleted status (`:67–79`, `:90`). Invalid/over-limit data is rejected before commit, preserving the last valid gallery. The editor's existing single-project Open still has its narrower 100 KB file-input check (`CreativeStudio.tsx:131–140`); the gallery import and editor Open limits should not be described as identical. Individual project schema/art/code bounds continue to apply after parsing.
- **Save and recovery:** local actions call the inherited `onChange` and respect a `false` result before committing UI state (`StudioLibrary.tsx:38–43`). Existing `SaveFeedback` remains visible for account save state (`:86`), and selected-editor errors offer a gallery download (`:83`). A success notice for a local action is not proof of remote completion. Malformed initial galleries or blocked browser saves expose original-data download/return actions and avoid publishing an empty replacement (`:30–36`, `:81`). Legacy single drafts upgrade in memory into one entry through `readStudioGallery` (`shared/studioGallery.ts:22–27`), retaining their validated project data.

The current top section of `PRODUCT.md` and the gallery notes accurately supersede their older one-draft descriptions. The collection is private to the current learner/class/course context; public preview remains browser-only and separate from child accounts. Existing course saves, authorization, revision conflicts and encrypted device recovery are reused as documented by the implementation notes; this source/documentation comparison does not independently validate those backend paths. Gallery work stays unscored, with no challenge completion or stars. No public sharing, cross-course collection, asset upload service, new authentication flow, live child AI or full Scratch compatibility is claimed. Frontend and backend must deploy together so shared validation accepts the collection.

## Scoped departures and pre-existing drift retained

These observations do not change global rules:

- The global files describe the guided 25/30/45 lesson/instructions/hints, stage and editor shell, tile-world semantics and learning breakpoints. The previously approved free editor instead uses stage/sprites beside a code/art workspace, with 72px desktop toolbar, stacking at 950px and a 110px phone toolbar at 700px. The gallery is another local state in that approved editor world, with its own normal page scroll and 950px/600px grid transitions. Neither topology becomes a global lesson rule.
- Incumbent studio controls generally remain 40px high with 7px corners; fields use 36px/5px, and light-surface focus uses `#6237df` with a 2px offset (`studio.css:4`, `:7–8`). Root authority describes 44px base/46px primary controls, 8px buttons/7px fields, and learning focus `#986cf5` with 3px offset. Gallery create and per-card actions explicitly use 44px (`studio-gallery.css:6`, `:24`); phone controls inherit 44px. These inherited compact variants are recorded, not silently promoted or repaired.
- The gallery's responsive Fredoka heading and 1.25rem Fredoka project-card titles extend the existing studio display voice. Its 16:10 scene-summary thumbnails, article padding (18px), gallery width and grid are surface-specific additions absent from global component metadata. They do not redefine root headline/body/panel primitives.
- `.impeccable/design.json` still declares `generatedAt: 2026-10-09T00:00:00Z`, has `learningWorld` and `publicPages` extensions but no dedicated-studio/gallery extension, and retains historical deferred backend/account and original-map compatibility prose. The sidecar's narrative/Do list is also less current than root DESIGN's later task-budget, interactive-board and activity-list additions. This authority age/scope drift pre-exists the gallery and remains intact.
- The global warning that mascot art does not establish formal Events curriculum remains meaningful; bounded studio event hats do not prove full curricular objective coverage. The gallery does not change those teaching claims, learning palette scale or route-map collision semantics.

The approved surface brief, current product section, gallery implementation notes and this scoped report carry the gallery addition until the user explicitly requests a global authority refresh. No refresh approval was supplied or inferred.

## Modal recovery correction recheck

The separate finish review requested a correction because capacity/rename errors could be hidden behind native modal dialogs. Rechecked the current source after that narrow correction. In `StudioLibrary.tsx:43–48`, a validation/capacity exception sets the existing recovery message, closes both gallery create and rename dialogs, then schedules focus on the rendered gallery/editor recovery alert. Those alerts now have `tabIndex={-1}` (`:88`, `:97`), allowing programmatic focus without adding a regular tab stop. In `CreativeStudio.tsx:117`, a failed `onCreate(next)` also closes the editor's starter dialog, exposing the parent collection error and gallery-backup action. The failed commit returns before replacing the last valid gallery or publishing an invalid collection.

This recheck establishes the source behavior for that correction; it does not claim the slot-limit or near-600,000-byte rename browser checks passed. The implementation is running those checks across three devices, and the independent review's final disposition remains pending. No CSS, design tokens or global authority were changed for the correction. Earlier `StudioLibrary.tsx` evidence references in this report describe the initial reviewed capture; this five-line catch-block expansion shifts subsequent source references by five lines without changing those features.

## Verification limits and preservation result

Supplied implementation results: **1,650 frontend tests across 36 files** and **139 synthetic backend tests across 14 files**. The scoped browser matrix belongs in the implementation's final confirmation; no counts or pass verdict are invented here. The independent finish reviewer is running separately, and its disposition is not claimed by this report.

Supplied read-only `public/images` provenance result: **26 rasters scanned, zero missing provenance**. No new raster was generated for the gallery. This documentation pass did not rerun that scan or broaden its reported scope.

SHA-256 checks before and after writing this report match the supplied baselines byte-for-byte:

| Global authority | Preserved SHA-256 |
| --- | --- |
| `DESIGN.md` | `37A0726A0DAB845687579A7ECC3B45F50346ED8D937EB06ADA18B5C5BB85D8AE` |
| `.impeccable/design.json` | `A803F0646D8957C90E7D9088C19792E1D07DFCF3630095B1CFAA727E05DA730D` |

Only `.impeccable/review/gallery-documentation.md` was written by this documentation pass. Code, PRODUCT, global authority and existing review artifacts were not edited.

## Implementation handoff update

After the comparison/recheck above, the implementation supplied final results: 58 unique scoped browser checks passed (including 30 gallery checks and 28 existing editor/starter checks), with two desktop-only skips; the reviewer-directed confirmation batch passed 12/12. The separate reviewer inspected all six recovery captures and six refreshed gallery/trash captures, scored the one modal failure-state finding RESOLVED and issued SHIP at that single-finding scope. These are supplied handoff results, not checks rerun by the documenter. Production build/server typecheck passed after correction. Global authority hashes were confirmed unchanged again at handoff; no later design-code change occurred.
