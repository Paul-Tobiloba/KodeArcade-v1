import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { studioStarterProject, type StudioStarter } from '../src/studioStarters';
import { saveStudioProject, type StudioProject } from '../src/studioProject';
import type { ProgressDocument } from '../shared/progress';
import type { StudioGallery } from '../shared/studioGallery';
const id = 'grade-6-creative-4';
async function fixture(page: Page, kind: StudioStarter, prepare?: (project: StudioProject) => void) {
  const project = studioStarterProject(kind); project.onboarding = 'skipped';
  prepare?.(project);
  let doc: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { blocks: [], complete: false, attempts: 0, hints: 0, workspace: saveStudioProject(project) } }, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } }, revision = 0;
  const identity = { learnerId: 'synthetic-game-child', classroomId: 'synthetic-game-class' };
  await page.route('**/api/capabilities', r => r.fulfill({ json: {} })); await page.route('**/api/session', r => r.fulfill({ json: null }));
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Sample Maker', classroomName: 'Sample Class', assignments: [{ id: 'sample', courseKey: 'grade-6' }] } }));
  await page.route('**/api/student/progress/grade-6', r => { if (r.request().method() === 'POST') { doc = r.request().postDataJSON().document; return r.fulfill({ json: { revision: ++revision } }); } return r.fulfill({ json: { ...identity, revision, document: doc, updatedAt: null } }); });
  return () => { const gallery = doc.progress[id].workspace?.byteStudioGallery as StudioGallery | undefined; return gallery?.projects.find(p => p.id === gallery.activeId)?.project ?? doc.progress[id].workspace?.byteStudio as StudioProject; };
}
async function capture(page: Page, label: string, project: string) {
  await expect(page.locator('.studio-project-title small')).toHaveText('Saved to your account');
  if (label === 'function-edit') {
    const keyboard = page.locator('.studio-function-editor details[open] summary');
    if (await keyboard.count()) await keyboard.click();
  }
  if (project !== 'desktop') {
    const target = label === 'function-edit' || label === 'system-function' ? '.studio-function-heading' : label === 'racing-code' ? '.studio-code-view' : label === 'basketball' || label === 'tennis' ? '.studio-stage' : '';
    if (target) await page.locator(target).evaluate((element, kind) => {
      const header = document.querySelector('.studio-header')?.getBoundingClientRect().height ?? 0;
      window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - header - (kind === 'racing-code' ? 100 : 8));
    }, label);
  }
  await page.screenshot({ path: `.impeccable/review/games-${label}-${project}.png`, fullPage: false });
}
test('racing starter loads real art, runs, steers, saves and exposes its editable code', async ({ page }, info) => {
  const saved = await fixture(page, 'racing'), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/student-play/grade-6/lab');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Three-lane racer');
  await expect.poll(() => page.locator('.studio-stage-actor img').evaluateAll(images => images.every(i => (i as HTMLImageElement).naturalWidth === 384))).toBe(true);
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(page.locator('.studio-code-view code')).toContainText('showCounter("score")');
  await expect(page.locator('.studio-code-view code')).toContainText('changePosition("x", -50)');
  if (info.project.name !== 'desktop') await page.locator('.studio-code-area').scrollIntoViewIfNeeded();
  await capture(page, 'racing-code', info.project.name);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await page.getByRole('button', { name: 'Move right', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Click Your car sprite', exact: true })).toHaveAttribute('style', /left: 67.5%/);
  await expect(page.locator('.studio-counters')).toContainText('score');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.reload(); await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Three-lane racer');
  expect(saved().sprites.map(s => s.x)).toEqual([0, -50, 50]); expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('racing broadcasts its editable speed increase above score 50 and runs both traffic responses', async ({ page }) => {
  const saved = await fixture(page, 'racing', project => {
    // Synthetic near-threshold save avoids waiting a minute; production threshold is unchanged.
    const root = (project.sprites[0].code.blocks as { blocks: { next?: { block: unknown } }[] }).blocks[0];
    root.next = { block: { type: 'ka_studio_set_variable', fields: { VAR: 'score' }, inputs: { VALUE: { block: { type: 'ka_number', fields: { NUM: 50 } } } }, next: root.next } };
    for (const traffic of project.sprites.slice(1)) {
      const start = (traffic.code.blocks as { blocks: { next: { block: { next?: { block: unknown } } } }[] }).blocks[0].next.block;
      start.next = { block: { type: 'ka_studio_monitor', fields: { VAR: 'speed', MODE: 'show' }, next: start.next } };
    }
  });
  await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(page.locator('.studio-code-view code')).toContainText('(vars["score"] > 50)');
  await expect(page.locator('.studio-code-view code')).toContainText('broadcast("speed_up")');
  await page.getByRole('button', { name: 'Edit Blue traffic sprite', exact: true }).click();
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(page.locator('.studio-code-view code')).toContainText('vars["speed"] = 4');
  await expect(page.locator('.studio-code-view code')).toContainText('onMessage("speed_up"');
  await expect(page.locator('.studio-code-view code')).toContainText('vars["speed"] = 7');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const counters = page.locator('.studio-counters');
  await expect(counters.locator('div').filter({ hasText: 'Blue traffic · speed' }).locator('dd')).toHaveText('7');
  await expect(counters.locator('div').filter({ hasText: 'Yellow traffic · speed' }).locator('dd')).toHaveText('7');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.reload(); await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Three-lane racer');
  expect(JSON.stringify(saved().sprites[0].code)).toContain('speed_up');
});

test('basketball renders a top hoop and bottom player and shows its scoring/miss blocks', async ({ page }, info) => {
  await fixture(page, 'basketball'); await page.goto('/#/student-play/grade-6/lab');
  await expect.poll(() => page.locator('.studio-stage-actor img').evaluateAll(images => images.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.getByRole('button', { name: 'Click Hoop sprite' })).toHaveAttribute('style', /top: 22%/);
  await expect(page.getByRole('button', { name: 'Click Player sprite' })).toHaveAttribute('style', /top: 76.25%/);
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(page.locator('.studio-code-view code')).toContainText('touchingSprite("hoop")');
  await expect(page.locator('.studio-code-view code')).toContainText('vars["score"] = (vars["score"] ?? 0) + 1');
  await expect(page.locator('.studio-code-view code')).toContainText('stopAll()');
  if (info.project.name !== 'desktop') await page.locator('.studio-stage').scrollIntoViewIfNeeded();
  await capture(page, 'basketball', info.project.name);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.locator('.studio-speech')).toContainText('Missed', { timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Move left', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Click Player sprite' })).toHaveAttribute('style', /left: 50%/);
  expect((await new AxeBuilder({ page }).include('.studio-code-view').analyze()).violations).toEqual([]);
});
test('personal functions edit and rename their callers while built-in definitions remain read-only', async ({ page }, info) => {
  const saved = await fixture(page, 'garden'), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/student-play/grade-6/lab'); await page.getByRole('button', { name: 'Functions', exact: true }).click();
  await page.getByRole('button', { name: 'Edit greet', exact: true }).click();
  const pane = page.getByRole('region', { name: 'Edit your function', exact: true });
  await pane.getByText('Build & edit with keyboard', { exact: true }).click();
  await pane.getByRole('textbox', { name: 'name', exact: true }).fill('welcome');
  await expect(pane.getByRole('button', { name: 'Delete selected block', exact: true })).toBeDisabled();
  expect((await new AxeBuilder({ page }).include('.studio-function-editor').analyze()).violations).toEqual([]);
  if (info.project.name !== 'desktop') await pane.scrollIntoViewIfNeeded();
  await capture(page, 'function-edit', info.project.name);
  await pane.getByRole('button', { name: 'Save function', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Edit welcome', exact: true })).toBeVisible();
  await expect.poll(() => JSON.stringify(saved().sprites[0].code)).toContain('welcome');
  expect(JSON.stringify(saved().sprites[0].code)).not.toContain('"NAME":"greet"');
  await page.getByRole('button', { name: 'View hop', exact: true }).click();
  const readOnly = page.getByRole('region', { name: 'Read-only built-in function', exact: true });
  await expect(readOnly.getByRole('button', { name: 'Save function', exact: true })).toHaveCount(0);
  await expect(readOnly.locator('.blocklyEditableText')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).include('.studio-function-editor').analyze()).violations).toEqual([]);
  if (info.project.name !== 'desktop') await readOnly.scrollIntoViewIfNeeded();
  await capture(page, 'system-function', info.project.name);
  await readOnly.getByRole('button', { name: 'Close definition', exact: true }).click();
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(page.locator('.studio-code-view code')).toContainText('functions["welcome"]');
  await page.reload(); await page.getByRole('button', { name: 'Functions', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Edit welcome', exact: true })).toBeVisible(); expect(errors).toEqual([]);
});
test('new personal functions support keyboard body editing, cancellation and confirmed deletion', async ({ page }) => {
  const saved = await fixture(page, 'garden'); await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('button', { name: 'Functions', exact: true }).click(); await page.getByRole('button', { name: 'Create function', exact: true }).click();
  const pane = page.getByRole('region', { name: 'Edit your function', exact: true });
  await pane.getByText('Build & edit with keyboard', { exact: true }).click(); await pane.getByRole('textbox', { name: 'name', exact: true }).fill('celebrate');
  if (test.info().project.name === 'desktop') {
    await page.setViewportSize({ width: 600, height: 950 }); await expect(pane.getByRole('textbox', { name: 'name', exact: true })).toHaveValue('celebrate');
    await page.setViewportSize({ width: 1440, height: 1000 }); await expect(pane.getByRole('textbox', { name: 'name', exact: true })).toHaveValue('celebrate');
  }
  await pane.getByRole('combobox', { name: 'Block type', exact: true }).selectOption('ka_sprite_turn');
  const target = await pane.getByRole('combobox', { name: 'Insert into', exact: true }).locator('option').filter({ hasText: ' · DO' }).first().getAttribute('value');
  await pane.getByRole('combobox', { name: 'Insert into', exact: true }).selectOption(target!); await pane.getByRole('button', { name: 'Add block', exact: true }).click();
  await pane.getByRole('button', { name: 'Save function', exact: true }).click(); await expect(page.getByRole('button', { name: 'Edit celebrate', exact: true })).toBeVisible();
  await expect.poll(() => JSON.stringify(saved().sprites[0].code)).toContain('celebrate'); const before = structuredClone(saved().sprites[0].code);
  await page.getByRole('button', { name: 'Edit celebrate', exact: true }).click(); await pane.getByRole('button', { name: 'Cancel editing', exact: true }).click(); expect(saved().sprites[0].code).toEqual(before);
  await page.getByRole('button', { name: 'Edit celebrate', exact: true }).click(); await pane.getByRole('button', { name: 'Delete function', exact: true }).click(); await page.locator('.confirmation-accept').click();
  await expect(page.getByRole('button', { name: 'Edit celebrate', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Edit greet', exact: true }).click(); await pane.getByRole('button', { name: 'Delete function', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Remove calls to greet'); await pane.getByRole('button', { name: 'Cancel editing', exact: true }).click();
});
test('a newly authored broadcast function saves, reopens and triggers another sprite', async ({ page }) => {
  const saved = await fixture(page, 'garden', project => {
    const blocks = (project.sprites[0].code.blocks as { blocks: { type: string; next?: { block: { fields?: Record<string, string> } } }[] }).blocks;
    blocks.splice(blocks.findIndex(b => b.type === 'ka_studio_define'), 1);
    blocks.find(b => b.type === 'ka_event_click')!.next!.block.fields!.NAME = 'celebrate';
  });
  await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('button', { name: 'Functions', exact: true }).click();
  await page.getByRole('button', { name: 'Create function', exact: true }).click();
  const pane = page.getByRole('region', { name: 'Edit your function', exact: true });
  await pane.getByRole('combobox', { name: 'Block category', exact: true }).selectOption('Events');
  await expect(pane.locator('.blocklyFlyout .blocklyDraggable[data-id]')).toHaveCount(1);
  await pane.getByText('Build & edit with keyboard', { exact: true }).click();
  await pane.getByRole('textbox', { name: 'name', exact: true }).fill('celebrate');
  const types = pane.getByRole('combobox', { name: 'Block type', exact: true });
  await expect(types.locator('option')).toHaveCount(1);
  await types.selectOption('ka_studio_broadcast');
  const target = await pane.getByRole('combobox', { name: 'Insert into', exact: true }).locator('option').filter({ hasText: ' · DO' }).first().getAttribute('value');
  await pane.getByRole('combobox', { name: 'Insert into', exact: true }).selectOption(target!);
  await pane.getByRole('button', { name: 'Add block', exact: true }).click();
  await pane.getByRole('textbox', { name: 'message', exact: true }).fill('garden_time');
  await pane.getByRole('button', { name: 'Save function', exact: true }).click();
  await expect.poll(() => JSON.stringify(saved().sprites[0].code)).toContain('garden_time');
  await page.getByRole('button', { name: 'Edit celebrate', exact: true }).click();
  await pane.getByText('Build & edit with keyboard', { exact: true }).click();
  await pane.getByRole('combobox', { name: 'Edit block', exact: true }).selectOption({ label: '2. broadcast garden_time' });
  await expect(pane.getByRole('textbox', { name: 'message', exact: true })).toHaveValue('garden_time');
  await pane.getByRole('button', { name: 'Cancel editing', exact: true }).click();
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await page.getByRole('button', { name: 'Click Grandma sprite', exact: true }).click();
  await expect(page.locator('.studio-speech')).toContainText(['Click me to start our story.', 'I planted a surprise for you.', 'A garden for all of us!']);
});

test('tennis loads its court and cutouts, steers, stops on a miss and saves editable rules', async ({ page }, info) => {
  const saved = await fixture(page, 'tennis'); await page.goto('/#/student-play/grade-6/lab');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Tennis rally');
  await expect.poll(() => page.locator('.studio-stage-actor img').evaluateAll(images => images.length === 3 && images.every(i => (i as HTMLImageElement).naturalWidth === 384))).toBe(true);
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(page.locator('.studio-code-view code')).toContainText('touchingSprite("opponent")');
  await expect(page.locator('.studio-code-view code')).toContainText('vars["score"] = (vars["score"] ?? 0) + 1');
  await capture(page, 'tennis', info.project.name);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await page.getByRole('button', { name: 'Move right', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Click Your racket sprite', exact: true })).toHaveAttribute('style', /left: 54.2%/);
  await expect(page.locator('.studio-speech')).toContainText('Missed', { timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Move left', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Click Your racket sprite', exact: true })).toHaveAttribute('style', /left: 54.2%/);
  await page.reload(); await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Tennis rally');
  expect(saved().sprites.map(s => s.x)).toEqual([-60, 0, 0]);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Click Your racket sprite', exact: true })).toHaveAttribute('style', /left: 50%/);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
});

test('new-project chooser offers all games/stories and preserves the earlier gallery entry', async ({ page }, info) => {
  const saved = await fixture(page, 'garden'); await page.goto('/#/student-play/grade-6/lab'); await page.getByRole('button', { name: 'New project', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Start a new project', exact: true });
  await expect(dialog.locator('.studio-starter-option')).toHaveCount(9);
  await expect.poll(() => dialog.locator('.studio-starter-preview img').evaluateAll(images => images.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await capture(page, 'starters', info.project.name);
  await dialog.getByRole('button', { name: 'Start Basketball bounce', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Basketball bounce'); await expect.poll(() => saved().starter).toBe('basketball');
});
