# Shared confirmations and K-logo home-screen icons

19 October 2026. Local implementation; no Git push, deployment, database change or live credential reset was performed.

## Confirmation coverage

Replaced all 17 application-owned JavaScript confirmation calls with the shared `ConfirmationProvider` / `useConfirmation` service:

- Classroom single-student and selected-student password/card resets.
- Family sign-out/switch to child login, pause access and password/card replacement.
- Student sign-out with unsynced work and explicit account-version reload/discard.
- Browser learning-progress reset.
- Lab artwork/sprite removal, legacy project replacement/import, personal-function deletion, gallery soft deletion and permanent deletion.
- Teacher course-access removal.

Blockly's supported `dialog.setConfirm` and `dialog.setAlert` callbacks also use the shared in-app dialog. Inline validation/status messages remain inline; `role="alert"` does not mean a browser alert and was not replaced with an interruption.

The dialog uses the browser's HTML top layer, not `window.confirm` or `window.alert`. It has a labelled heading/description, explicit action label, Cancel initially focused, Escape/Close cancellation, a keyboard focus loop, native focus restoration and a responsive action row. A second pending request fails closed rather than queuing duplicate destructive operations. Route changes and requesting-component unmounts cancel pending decisions. Buttons are `type="button"`, outside the originating form; destructive API calls run only after an affirmative result. Existing authorization, PDF downloads, operation keys, recovery warnings and error handling remain in their original handlers.

The student `beforeunload` unsaved-work guard remains. Browsers require their own warning when a tab closes/reloads; an asynchronous React modal cannot replace that lifecycle safeguard.

Impeccable guided the existing-brand treatment and safe/default focus behavior. The React quality pass checked stable context/callbacks, unconditional hooks, cancellation and event/form lifetime after `await`.

## Home-screen icons

The site previously linked only an SVG favicon, with no Apple touch-icon link or web manifest. Added:

- `/brand/apple-touch-icon.png`: opaque 180×180 PNG.
- `/brand/app-icon-192.png` and `/brand/app-icon-512.png`: general app icons.
- `/brand/app-icon-maskable-512.png`: separate padded icon, with every non-white pixel inside the central 40%-radius safe circle.
- `/site.webmanifest`: KodeArcade name, same-origin root start/scope, standalone display and the three manifest icons.
- HTML Apple home-screen title/capability metadata and explicit touch-icon/manifest links. The existing SVG favicon stays intact.

All four PNGs are generated deterministically from the existing approved `public/brand/mark-color.svg` on white by `node scripts/generate-app-icons.mjs`. No generated replacement logo, new art or external asset download. The original violet, teal and yellow pixels are checked in browser tests. Icons and manifest are included in the production build's public files.

No mobile learning layout, device orientation, account/session behavior, service worker or offline-cache behavior was changed. This is install metadata, not a claim of offline support. Existing home-screen shortcuts may need removing and adding again after deployment to pick up the new icon.

References: [Apple home-screen icon configuration](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html), [manifest icon sizes and purposes](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons).

## Verification

- `npm run build:vercel`: server typecheck and frontend production build pass. Existing Zod annotation and large-chunk warnings remain.
- `npx vitest run src --exclude '**/.impeccable/**' --maxWorkers=2`: 43 files / 1,784 tests pass. Includes the new source policy guarding against native browser dialog calls. The explicit exclusion avoids an unrelated ignored scratch checkout. Windows sandbox temporary-module errors required running tests outside the sandbox.
- Desktop and phone tests cover classroom/family cancellation and approval, Escape/Close, focus trapping/restoration, zero requests on cancel, one request after repeated acceptance, stale-route cancellation, and course-removal confirmation. The modal's scoped axe scan reports no violations.
- Lab/recovery checks pass for gallery cancel/delete/restore/permanent delete, artwork removal at asset/gallery capacity, editable-function deletion, additive project backup imports and explicit unsynced-draft discard. These use mocked account APIs, not real users or live resets.
- Icon checks verify served PNG signatures and dimensions, opaque backgrounds, all three brand colors, maskable safe-zone pixels and Chrome's error-free manifest parsing.
- Final isolated browser batch: 12/12 pass across desktop Chrome, Pixel 7 and iPad Chromium emulations (icon metadata, parent resets/access, public progress reset, and classroom password reset). Earlier test failures used retired lesson-entry expectations; the affected test now follows the workspace-first flow and current Grade 1 title. The final isolated batch avoids temporary trace-directory/server conflicts between overlapping runners.
- Desktop/phone screenshots inspected together, then confirmed with viewport-sized captures. No clipping in the confirmation; phone actions stack. Icon artwork visually inspected. Native installation on physical iOS/Android devices remains untested.
- Mechanical detector run once: no primary findings; two semantic danger-color advisories were documented in DESIGN.md. The HTML loader advisory is incomplete because the detector resolves `/brand/loading.css` outside Vite's `public` root. No claim of an app-wide accessibility certification.

Scoped finish verdict: SHIP for this implementation, based on the passing final batch and scoped evidence above. Publication remains a separate action; physical home-screen installation and live production mutations were not tested.
