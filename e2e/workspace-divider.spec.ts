import { test, expect, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { studioStarterProject } from '../src/studioStarters';
import { saveStudioProject } from '../src/studioProject';
import type { ProgressDocument } from '../shared/progress';
import type { StudioGallery } from '../shared/studioGallery';
import type { StudioProject } from '../src/studioProject';

function work(document: ProgressDocument, kind: 'studio' | 'drawing' | 'course') {
  if (kind === 'drawing') {
    const { code, mode, ink, width } = document.drawings.create;
    return { code, mode, ink, width };
  }
  if (kind === 'course') return document.progress;
  const workspace = document.progress['grade-6-creative-4'].workspace!;
  const gallery = workspace.byteStudioGallery as StudioGallery | undefined;
  const project = structuredClone(gallery?.projects.find(item => item.id === gallery.activeId)?.project ?? workspace.byteStudio) as StudioProject;
  // Blockly assigns missing IDs on initial hydration, not during resizing.
  function withoutGeneratedIds(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(withoutGeneratedIds);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'id' || !('type' in value)).map(([key, child]) => [key, withoutGeneratedIds(child)]));
    return value;
  }
  return withoutGeneratedIds(project);
}

async function fixture(page: Page, kind: 'studio' | 'drawing' | 'course') {
  const id = kind === 'course' ? 'grade-6-sequences-2' : 'grade-6-creative-4';
  const project = studioStarterProject('keyboard'); project.onboarding = 'skipped';
  let document: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { complete: false, attempts: 0, hints: 0, blocks: [], ...(kind === 'studio' ? { workspace: saveStudioProject(project) } : { codingMode: 'text', textCode: 'forward(1)' }) } }, drawings: kind === 'drawing' ? { create: { mode: 'text', code: 'forward(40)\nturn(90)\nforward(40)', ink: '#08796e', width: 4 } } : {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } };
  let revision = 0;
  const identity = { learnerId: 'synthetic-resize-child', classroomId: 'synthetic-resize-class' };
  await page.route('**/api/capabilities', r => r.fulfill({ json: {} }));
  await page.route('**/api/session', r => r.fulfill({ json: null }));
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Sample Maker', classroomName: 'Sample class', assignments: [{ id: 'sample', courseKey: 'grade-6' }] } }));
  await page.route('**/api/student/progress/grade-6', r => {
    if (r.request().method() === 'POST') { document = r.request().postDataJSON().document; return r.fulfill({ json: { revision: ++revision } }); }
    return r.fulfill({ json: { ...identity, revision, updatedAt: null, document } });
  });
  return Object.assign(() => document, { revision: () => revision });
}
async function drag(page: Page, handle: Locator, distance: number) {
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + distance, box.y + box.height / 2, { steps: 12 }); await page.mouse.up();
}
async function exercise(page: Page, stage: Locator, code: Locator) {
  const handle = page.getByRole('separator', { name: 'Resize stage and coding area', exact: true });
  await expect(handle).toBeVisible();
  const before = (await stage.boundingBox())!.width, codeBefore = (await code.boundingBox())!.width;
  await drag(page, handle, 100);
  await expect.poll(async () => (await stage.boundingBox())!.width).toBeGreaterThan(before + 70);
  expect((await code.boundingBox())!.width).toBeLessThan(codeBefore - 70);
  await handle.focus(); await page.keyboard.press('Home');
  await expect.poll(async () => Math.round((await stage.boundingBox())!.width)).toBe(240);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Math.round((await stage.boundingBox())!.width)).toBe(264);
  await page.keyboard.press('End');
  await expect.poll(async () => handle.getAttribute('aria-valuenow')).toBe(await handle.getAttribute('aria-valuemax'));
  expect((await code.boundingBox())!.width).toBeGreaterThanOrEqual(399);
  await page.keyboard.press('Enter');
  await expect.poll(async () => Math.round((await stage.boundingBox())!.width)).toBe(Math.round(before));
  await page.keyboard.press('ArrowRight'); await handle.dblclick();
  await expect.poll(async () => Math.round((await stage.boundingBox())!.width)).toBe(Math.round(before));
  expect((await new AxeBuilder({ page }).include('.workspace-divider').analyze()).violations).toEqual([]);
  await drag(page, handle, 90);
  expect(await page.locator('[data-stage-resizing=true]').count()).toBe(0);
  return handle;
}

for (const kind of ['studio', 'drawing', 'course'] as const) test(`${kind} stage/code divider resizes live panels without changing saved work`, async ({ page }, info) => {
  const saved = await fixture(page, kind), errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`/#/student-play/grade-6${kind === 'studio' ? '/lab' : kind === 'drawing' ? '/art' : ''}`);
  const stage = page.locator(kind === 'studio' ? '.studio-scene-panel' : '.workspace-grid > .scene');
  const code = page.locator(kind === 'studio' ? '.studio-tool-panel' : '.workspace-grid > .editor');
  await expect(stage).toBeVisible(); await expect(code).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => kind === 'studio' ? !!saved().progress['grade-6-creative-4']?.workspace : !!saved().drawings.create || kind === 'course').toBe(true);
  await expect.poll(() => saved.revision()).toBeGreaterThan(0);
  if (kind === 'studio') await expect.poll(() => JSON.stringify(saved().progress).includes('"deletable":false')).toBe(true);
  await expect(page.locator('.student-cloud-status')).toContainText('Saved to your account');
  const workBefore = structuredClone(work(saved(), kind));
  if (info.project.name === 'desktop') {
    const handle = await exercise(page, stage, code);
    if (kind !== 'studio') {
      await page.getByRole('button', { name: 'Minimize lesson panel', exact: true }).click();
      await expect.poll(async () => Math.round((await page.locator('.activity-guide').boundingBox())!.width)).toBe(56);
      await handle.focus(); await page.keyboard.press('ArrowLeft');
      await expect(handle).toBeFocused();
      await page.getByRole('button', { name: 'Expand lesson panel', exact: true }).click();
    }
    await page.screenshot({ path: `.impeccable/review/resize-${kind}-desktop.png`, fullPage: false });
    await page.setViewportSize({ width: 1308, height: 656 });
    await expect(handle).toBeVisible();
    await handle.focus(); await page.keyboard.press('End');
    await expect.poll(async () => (await code.boundingBox())!.width).toBeGreaterThanOrEqual(kind === 'studio' ? 519 : 399);
    await page.screenshot({ path: `.impeccable/review/resize-${kind}-1308.png`, fullPage: false });
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(handle).toBeVisible(); await handle.focus(); await page.keyboard.press('Home');
    await expect.poll(async () => Math.round((await stage.boundingBox())!.width)).toBe(240);
    if (kind !== 'studio') expect((await page.locator('.activity-guide').boundingBox())!.y).toBeLessThan((await stage.boundingBox())!.y);
    await page.setViewportSize({ width: 700, height: 800 });
    await expect(handle).toBeHidden();
    await expect.poll(() => page.locator(kind === 'studio' ? '.studio-main' : '.workspace-grid').evaluate(element => element.style.getPropertyValue('--stage-width'))).toBe('');
    await page.setViewportSize({ width: 1440, height: 1000 }); await expect(handle).toBeVisible();
    await handle.press('Enter');
  } else {
    await expect(page.getByRole('separator', { name: 'Resize stage and coding area', exact: true })).toHaveCount(0);
    await page.screenshot({ path: `.impeccable/review/resize-${kind}-${info.project.name}.png`, fullPage: false });
  }
  expect(work(saved(), kind)).toEqual(workBefore);
  if (kind === 'studio') {
    await page.getByRole('button', { name: 'Run', exact: true }).click();
    await page.getByRole('button', { name: 'Move right', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Click Dash sprite', exact: true })).not.toHaveAttribute('style', /left: 50%;/);
    if (info.project.name === 'desktop') await drag(page, page.getByRole('separator', { name: 'Resize stage and coding area', exact: true }), 80);
    await page.getByRole('button', { name: 'Move right', exact: true }).click();
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
  } else if (kind === 'drawing') {
    await page.getByRole('button', { name: 'Run code', exact: true }).click();
    await expect(page.locator('.drawing-ink')).not.toHaveAttribute('d', '');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
