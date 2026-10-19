import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { serialization } from 'blockly/core';
import { newStudioProject, saveStudioProject, type StudioProject } from '../src/studioProject';
import type { ProgressDocument } from '../shared/progress';
import type { StudioGallery } from '../shared/studioGallery';
type B = serialization.blocks.State;
const n = (NUM: number): B => ({ type: 'ka_number', fields: { NUM } });
const t = (TEXT: string): B => ({ type: 'ka_studio_text', fields: { TEXT } });
const b = (type: string, values: Record<string, B> = {}, fields: Record<string, string | number> = {}): B => ({ type, fields, inputs: Object.fromEntries(Object.entries(values).map(([key, block]) => [key, { block }])) });
const chain = (blocks: B[]): B | undefined => blocks.reduceRight<B | undefined>((next, block) => ({ ...block, ...(next ? { next: { block: next } } : {}) }), undefined);
const at = (x = 0, y = 0) => b('ka_studio_location', { X: n(x), Y: n(y) });
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => { const errors: string[] = []; browserErrors.set(page, errors); page.on('pageerror', error => errors.push(error.message)); });
test.afterEach(({ page }) => { expect(browserErrors.get(page)).toEqual([]); });
async function fixture(page: Page, actions: B[] = [], hats: B[] = []) {
  const project = newStudioProject(); project.onboarding = 'skipped';
  project.sprites[0].code = { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', ...(actions.length ? { next: { block: chain(actions)! } } : {}) }, ...hats] } };
  const id = 'grade-6-creative-4', identity = { learnerId: 'synthetic-block-child', classroomId: 'synthetic-block-class' };
  let doc: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { blocks: [], complete: false, attempts: 0, hints: 0, workspace: saveStudioProject(project) } }, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } }, revision = 0;
  await page.route('**/api/capabilities', r => r.fulfill({ json: {} })); await page.route('**/api/session', r => r.fulfill({ json: null }));
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Sample Maker', classroomName: 'Sample Class', assignments: [{ id: 'sample', courseKey: 'grade-6' }] } }));
  await page.route('**/api/student/progress/grade-6', r => { if (r.request().method() === 'POST') { doc = r.request().postDataJSON().document; return r.fulfill({ json: { revision: ++revision } }); } return r.fulfill({ json: { ...identity, revision, document: doc, updatedAt: null } }); });
  await page.goto('/#/student-play/grade-6/lab');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await expect(page.locator('.studio-project-title small')).toHaveText('Saved to your account');
  return () => { const gallery = doc.progress[id].workspace?.byteStudioGallery as StudioGallery | undefined; return gallery?.projects.find(p => p.id === gallery.activeId)?.project ?? doc.progress[id].workspace?.byteStudio as StudioProject; };
}
async function capture(page: Page, state: string, device: string) {
  await expect(page.locator('.studio-project-title small')).toHaveText('Saved to your account');
  if (state === 'question' && ['phone', '1308'].includes(device)) await page.locator('.studio-question').evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: `.impeccable/review/blocks-${state}-${device}.png`, fullPage: false });
}
test('choice questions and clock events stay responsive while the main script waits', async ({ page }) => {
  await fixture(page, [b('ka_studio_prompt_choices', { QUESTION: t('Choose a made-up planet') }, { VAR: 'planet', CHOICE1: 'Nova', CHOICE2: 'Luma', CHOICE3: 'Zed' }), b('ka_studio_say_text', { VALUE: b('ka_studio_text_variable', {}, { VAR: 'planet' }) })], [{ type: 'ka_event_at', fields: { SECONDS: .2 }, next: { block: b('ka_studio_print', { VALUE: t('Clock is running'), LOCATION: at(0, 60) }) } }]);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const form = page.getByRole('form', { name: 'Project question' });
  await expect(form.getByRole('button')).toHaveCount(3);
  await expect(page.locator('.studio-printed-text')).toHaveText('Clock is running');
  await form.getByRole('button', { name: 'Luma', exact: true }).click(); await expect(page.locator('.studio-speech')).toHaveText('Byte: Luma');
});
test('questions, world overlays and text execute without persisting the answer', async ({ page }, info) => {
  const saved = await fixture(page, [b('ka_studio_background_color', { COLOR: b('ka_studio_color', {}, { COLOR: '#e6f7ee' }) }), b('ka_studio_prompt', { QUESTION: t('Invent a hero name') }, { VAR: 'answer' }), b('ka_studio_print', { VALUE: b('ka_studio_join', { A: t('Hello '), B: b('ka_studio_text_variable', {}, { VAR: 'answer' }) }), LOCATION: at(0, 65) }), b('ka_studio_say_text', { VALUE: b('ka_studio_text_variable', {}, { VAR: 'answer' }) })]);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const form = page.getByRole('form', { name: 'Project question' });
  await expect(form).toContainText('Don’t enter personal details');
  await expect(form.getByRole('textbox', { name: 'Your answer' })).toBeFocused();
  await capture(page, 'question', info.project.name);
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1308, height: 656 }); await capture(page, 'question', '1308'); await page.setViewportSize({ width: 1440, height: 1000 });
    const axe = await new AxeBuilder({ page }).include('.studio-question').analyze(); expect(axe.violations).toEqual([]);
  }
  await form.getByRole('textbox', { name: 'Your answer' }).fill('<Star Hero>'); await form.getByRole('button', { name: 'Answer', exact: true }).click();
  await expect(page.locator('.studio-printed-text')).toHaveText('Hello <Star Hero>');
  await expect(page.locator('.studio-speech')).toHaveText('Byte: <Star Hero>');
  expect(JSON.stringify(saved())).not.toContain('<Star Hero>');
  await page.getByRole('button', { name: 'Reset stage', exact: true }).click();
  await expect(page.locator('.studio-printed-text')).toHaveCount(0);
  await page.getByRole('button', { name: 'Run', exact: true }).click(); await expect(form).toBeVisible();
  await page.getByRole('button', { name: 'Stop', exact: true }).click(); await expect(form).toHaveCount(0);
  await page.reload(); expect(JSON.stringify(saved())).not.toContain('<Star Hero>'); expect(errors).toEqual([]);
});
test('temporary sprites support dragging and held-key behaviors without altering the saved cast', async ({ page }) => {
  const saved = await fixture(page, [b('ka_studio_spawn', { COUNT: n(1), LOCATION: at(-60, 0) }, { SPRITE: 'this', NAME: 'Friend', ASSET: 'current' }), b('ka_studio_behavior', {}, { MODE: 'start', NAME: '@arrow_moving' })], [{ type: 'ka_event_created', next: { block: b('ka_studio_draggable', {}, { MODE: 'start' }) } }]);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.locator('.studio-stage-actor')).toHaveCount(2);
  const actor = page.getByRole('button', { name: 'Click Byte sprite', exact: true }), before = await actor.getAttribute('style');
  const right = page.getByRole('button', { name: 'Move right', exact: true });
  await right.scrollIntoViewIfNeeded(); const control = (await right.boundingBox())!;
  await page.mouse.move(control.x + control.width / 2, control.y + control.height / 2); await page.mouse.down();
  await expect.poll(() => actor.getAttribute('style')).not.toBe(before);
  await page.mouse.up();
  const clone = page.getByRole('button', { name: 'Click Friend 1 sprite', exact: true });
  await clone.scrollIntoViewIfNeeded(); const box = (await clone.boundingBox())!;
  const cloneBefore = await clone.getAttribute('style');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 - 20, { steps: 3 }); await page.mouse.up();
  await expect.poll(() => clone.getAttribute('style')).not.toBe(cloneBefore);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  expect(saved().sprites).toHaveLength(1); expect(JSON.stringify(saved())).not.toContain('runtime-');
  await page.getByRole('button', { name: 'Reset stage', exact: true }).click(); await expect(page.locator('.studio-stage-actor')).toHaveCount(1);
});
test('children can build new text blocks with the keyboard and reopen their source', async ({ page }) => {
  const saved = await fixture(page);
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  const keyboard = page.locator('.studio-code > .studio-code-area > .concept-keyboard');
  await keyboard.getByText('Build & edit with keyboard', { exact: true }).click();
  const types = keyboard.getByRole('combobox', { name: 'Block type', exact: true });
  await types.selectOption('ka_studio_say_text'); await keyboard.getByRole('button', { name: 'Add block', exact: true }).click();
  await types.selectOption('ka_studio_text'); await keyboard.getByRole('button', { name: 'Add block', exact: true }).click();
  await keyboard.getByRole('textbox', { name: 'text', exact: true }).fill('I made this');
  await expect.poll(() => JSON.stringify(saved().sprites[0].code)).toContain('I made this');
  await page.getByRole('button', { name: 'Show code', exact: true }).click(); await expect(page.locator('.studio-code-view code')).toContainText('I made this');
  await page.getByRole('button', { name: 'Run', exact: true }).click(); await expect(page.locator('.studio-speech')).toHaveText('Byte: I made this');
  await page.reload(); await page.getByRole('button', { name: 'Show code', exact: true }).click(); await expect(page.locator('.studio-code-view code')).toContainText('I made this');
});
test('built-in behavior and grid definitions are inspectable while personal definitions stay editable', async ({ page }, info) => {
  const saved = await fixture(page);
  await page.getByRole('button', { name: 'Behaviors', exact: true }).click();
  await page.getByRole('combobox', { name: 'Built-in definition', exact: true }).selectOption('@arrow_moving'); await page.getByRole('button', { name: 'View definition', exact: true }).click();
  const readOnly = page.getByRole('region', { name: 'Read-only built-in function', exact: true }); await expect(readOnly).toBeVisible();
  await expect(readOnly.getByRole('button', { name: 'Save function', exact: true })).toHaveCount(0);
  await expect(readOnly.locator('.blocklyText')).toContainText([/Right\s+arrow/]);
  if (info.project.name !== 'desktop') await readOnly.scrollIntoViewIfNeeded();
  await capture(page, 'behavior', info.project.name);
  await readOnly.getByRole('button', { name: 'Close definition', exact: true }).click();
  await page.getByRole('button', { name: 'Create behavior', exact: true }).click();
  const own = page.getByRole('region', { name: 'Edit your function', exact: true });
  await own.getByText('Build & edit with keyboard', { exact: true }).click(); await own.getByRole('textbox', { name: 'name', exact: true }).fill('my_dance');
  await own.getByRole('combobox', { name: 'Block type', exact: true }).selectOption('ka_sprite_turn');
  const target = await own.getByRole('combobox', { name: 'Insert into', exact: true }).locator('option').filter({ hasText: ' · DO' }).first().getAttribute('value');
  await own.getByRole('combobox', { name: 'Insert into', exact: true }).selectOption(target!); await own.getByRole('button', { name: 'Add block', exact: true }).click(); await own.getByRole('button', { name: 'Save function', exact: true }).click();
  await expect.poll(() => JSON.stringify(saved().sprites[0].code)).toContain('my_dance');
  await page.getByRole('button', { name: 'Sprites', exact: true }).click(); await page.getByRole('combobox', { name: 'Built-in definition', exact: true }).selectOption('@make_grid'); await page.getByRole('button', { name: 'View definition', exact: true }).click();
  await expect(readOnly.locator('.blocklyText')).toContainText(['grid_index']); await readOnly.getByRole('button', { name: 'Close definition', exact: true }).click();
  await page.reload(); await page.getByRole('button', { name: 'Behaviors', exact: true }).click(); await page.getByRole('button', { name: 'Edit my_dance', exact: true }).click(); await expect(own.getByRole('button', { name: 'Save function', exact: true })).toBeEnabled();
});
