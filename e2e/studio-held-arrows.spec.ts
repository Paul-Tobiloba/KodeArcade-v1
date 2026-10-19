import { test, expect, type Page, type Locator } from '@playwright/test';
import { studioStarterProject, type StudioStarter } from '../src/studioStarters';
import { saveStudioProject } from '../src/studioProject';
import type { ProgressDocument } from '../shared/progress';
const id = 'grade-6-creative-4';
async function open(page: Page, kind: StudioStarter) {
  const p = studioStarterProject(kind); p.onboarding = 'skipped';
  let doc: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { blocks: [], complete: false, attempts: 0, hints: 0, workspace: saveStudioProject(p) } }, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } }, revision = 0;
  const identity = { learnerId: 'held-input-child', classroomId: 'held-input-class' };
  await page.route('**/api/capabilities', r => r.fulfill({ json: {} }));
  await page.route('**/api/session', r => r.fulfill({ json: null }));
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Sample Maker', classroomName: 'Sample Class', assignments: [{ id: 'sample', courseKey: 'grade-6' }] } }));
  await page.route('**/api/student/progress/grade-6', r => {
    if (r.request().method() === 'POST') { doc = r.request().postDataJSON().document; return r.fulfill({ json: { revision: ++revision } }); }
    return r.fulfill({ json: { ...identity, revision, document: doc, updatedAt: null } });
  });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/student-play/grade-6/lab');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue(p.title);
  return errors;
}
const x = (actor: Locator) => actor.evaluate(el => parseFloat((el as HTMLElement).style.left));
const y = (actor: Locator) => actor.evaluate(el => parseFloat((el as HTMLElement).style.top));
async function stable(page: Page, actor: Locator) {
  const before = await actor.getAttribute('style'); await page.waitForTimeout(350);
  expect(await actor.getAttribute('style')).toBe(before);
}
test('saved basketball supports pointer hold, outside release, tap and accessible keyboard hold', async ({ page }, info) => {
  const errors = await open(page, 'basketball');
  await expect.poll(() => page.locator('.studio-stage img').evaluateAll(imgs => imgs.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.locator('.studio-project-title small')).toHaveText('Saved to your account');
  await page.locator('.studio-key-controls').scrollIntoViewIfNeeded();
  if (process.env.HELD_ARROWS_CAPTURE === '1') {
    await page.screenshot({ path: `.impeccable/review/held-arrows-${info.project.name}.png`, fullPage: true });
    if (info.project.name === 'desktop') {
      await page.setViewportSize({ width: 1308, height: 1000 });
      await page.screenshot({ path: '.impeccable/review/held-arrows-1308.png', fullPage: true });
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
  }
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const actor = page.getByRole('button', { name: 'Click Player sprite', exact: true });
  const right = page.getByRole('button', { name: 'Move right', exact: true });
  await right.scrollIntoViewIfNeeded(); const box = (await right.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await expect.poll(() => x(actor)).toBeGreaterThan(58.4);
  await page.mouse.move(box.x - 20, box.y - 20); await page.mouse.up(); await stable(page, actor);
  const beforeTap = await x(actor); await page.getByRole('button', { name: 'Move left', exact: true }).click();
  await expect.poll(() => x(actor)).toBeCloseTo(beforeTap - 4.2, 1); await stable(page, actor);
  await page.getByRole('button', { name: 'Move left', exact: true }).focus(); await page.keyboard.down('Enter'); await expect.poll(() => x(actor)).toBeLessThan(beforeTap - 12.6);
  await page.keyboard.up('Enter'); await stable(page, actor);
  await page.getByRole('button', { name: 'Stop', exact: true }).click(); expect(errors).toEqual([]);
});
test('all keyboard arrows hold continuously, release and blur clear input without editing source', async ({ page }) => {
  const errors = await open(page, 'keyboard');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const stage = page.locator('.studio-stage'), actor = page.getByRole('button', { name: 'Click Dash sprite', exact: true });
  for (const [key, read, sign] of [['ArrowRight', x, 1], ['ArrowLeft', x, -1], ['ArrowUp', y, -1], ['ArrowDown', y, 1]] as const) {
    await stage.focus(); const before = await read(actor); await page.keyboard.down(key);
    await expect.poll(async () => ((await read(actor)) - before) * sign).toBeGreaterThan(6.9);
    await page.keyboard.up(key); await stable(page, actor);
  }
  await stage.focus(); await page.keyboard.down('ArrowRight'); await expect.poll(() => x(actor)).toBeGreaterThan(50);
  await page.getByRole('textbox', { name: 'Project name' }).focus(); await stable(page, actor); await page.keyboard.up('ArrowRight');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.reload(); await expect(actor).toHaveAttribute('style', /left: 50%/); expect(errors).toEqual([]);
});
test('touch hold and cancellation stop repetition; Stop and Reset leave no stuck controls', async ({ page, context }) => {
  const errors = await open(page, 'keyboard');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const actor = page.getByRole('button', { name: 'Click Dash sprite', exact: true }), right = page.getByRole('button', { name: 'Move right', exact: true });
  await right.scrollIntoViewIfNeeded(); const box = (await right.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
  await expect.poll(() => x(actor)).toBeGreaterThan(56.9);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await stable(page, actor);
  await page.locator('.studio-stage').focus(); await page.keyboard.down('ArrowLeft');
  await expect.poll(() => x(actor)).toBeLessThan(53.5);
  await page.getByRole('button', { name: 'Stop', exact: true }).click(); await page.keyboard.up('ArrowLeft'); await stable(page, actor);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(actor).toHaveAttribute('style', /left: 50%/); await stable(page, actor);
  await page.getByRole('button', { name: 'Reset stage', exact: true }).click(); await stable(page, actor); expect(errors).toEqual([]);
});
test('moving focus to controls clears a held stage arrow; Space hold and assistive click work', async ({ page }) => {
  const errors = await open(page, 'keyboard');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const actor = page.getByRole('button', { name: 'Click Dash sprite', exact: true }), left = page.getByRole('button', { name: 'Move left', exact: true });
  await page.keyboard.down('ArrowRight'); await expect.poll(() => x(actor)).toBeGreaterThan(56.9);
  await left.focus(); await stable(page, actor); await page.keyboard.up('ArrowRight');
  const before = await x(actor); await page.keyboard.down('Space');
  await expect.poll(async () => before - await x(actor)).toBeGreaterThan(6.9);
  await page.keyboard.up('Space'); await stable(page, actor);
  const beforeClick = await x(actor); await left.evaluate(el => (el as HTMLButtonElement).click());
  await expect.poll(() => x(actor)).toBeCloseTo(beforeClick - 3.5, 1); await stable(page, actor); expect(errors).toEqual([]);
});
