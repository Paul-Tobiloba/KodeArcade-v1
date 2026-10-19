import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { ProgressDocument } from '../shared/progress';
async function student(page: Page, grade: number, id: string, code?: string) {
  let revision = 0;
  let value: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: code ? { [id]: { attempts: 0, hints: 0, blocks: [], complete: false, codingMode: 'text', textCode: code } } : {}, drawings: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false }, basicsComplete: [], topicRecords: {} };
  const identity = { learnerId: 'synthetic-heading-pupil', classroomId: 'synthetic-heading-class' };
  await page.route('**/api/capabilities', route => route.fulfill({ json: {} }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...identity, displayName: 'Sample Heading Learner', classroomName: 'Sample Class', assignments: [{ id: 'sample', courseKey: `grade-${grade}` }] } }));
  await page.route(`**/api/student/progress/grade-${grade}`, route => {
    if (route.request().method() === 'POST') { value = route.request().postDataJSON().document; return route.fulfill({ json: { revision: ++revision } }); }
    return route.fulfill({ json: { ...identity, document: value, revision, updatedAt: null } });
  });
  await page.goto(`/#/student-play/grade-${grade}`);
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
  if (id === `grade-${grade}-sequences-1`) await page.locator('.tour-card').getByRole('button', { name: 'Skip tour' }).click();
  return () => value;
}
test('Grades 4–6 have relative palettes; Grade 3 keeps screen movement', async ({ page }) => {
  test.setTimeout(60000);
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: false } }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  for (const grade of [3, 4, 5, 6]) {
    await page.goto(`/#/learn/grade-${grade}`);
    await page.locator('.tour-card').getByRole('button', { name: 'Skip tour' }).click();
    if (grade >= 5) await page.getByRole('button', { name: 'Blocks', exact: true }).click();
    const palette = page.locator('.blocklyFlyout:not(.blocklyTrashcanFlyout)');
    await expect(palette.locator('.ka_forward')).toHaveCount(grade >= 4 ? 1 : 0);
    await expect(palette.locator('.ka_right')).toHaveCount(grade === 3 ? 1 : 0);
    await expect(palette.locator('.ka_turn_degrees')).toHaveCount(grade >= 5 ? 1 : 0);
    if (grade >= 4) await expect(page.getByLabel('Facing direction')).toContainText('Facing right');
  }
});
test('Grade 4 new argument blocks and turns run, save and restore without losing code on resize', async ({ page }, info) => {
  const id = 'grade-4-statements-3', value = await student(page, 4, id);
  await page.locator('.keyboard-tools > summary').click();
  for (const type of ['ka_relative_move_steps', 'ka_forward', 'ka_turn_left', 'ka_forward']) {
    await page.getByLabel('Instruction', { exact: true }).selectOption(type);
    await page.getByRole('button', { name: 'Add block', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect(page.getByLabel('Facing direction')).toContainText('Facing up');
  await expect.poll(() => value().progress[id]?.complete).toBe(true);
  const work = JSON.stringify(value().progress[id].workspace);
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.width <= 600 ? 800 : 412, height: viewport.height });
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
  await expect.poll(() => JSON.stringify(value().progress[id]?.workspace)).toBe(work);
  await page.reload();
  await expect(page.getByLabel('Facing direction')).toContainText('Facing right');
  expect(JSON.stringify(value().progress[id].workspace)).toContain('ka_turn_left');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize(viewport);
  await page.screenshot({ path: `.impeccable/review/relative-blocks-${info.project.name}.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).include('.scene').analyze()).violations).toEqual([]);
});
test('degree turns and backward keep their correct meaning in a saved Grade 6 text program', async ({ page }, info) => {
  const code = ['turn_right(180)', ...Array(5).fill('backward()'), 'turn_right(90)', 'forward()'].join('\n');
  const id = 'grade-6-sequences-1', value = await student(page, 6, id, code);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect(page.getByLabel('Facing direction')).toContainText('Facing up');
  await expect.poll(() => value().progress[id]?.complete).toBe(true);
  await page.reload();
  await expect(page.getByLabel('Your text program', { exact: true })).toHaveValue(code);
  await expect(page.getByLabel('Facing direction')).toContainText('Facing right');
  await page.getByRole('button', { name: 'Ask Byte', exact: true }).click();
  await page.getByRole('button', { name: 'Explain this topic' }).click();
  await expect(page.getByRole('log')).toContainText('backward');
  await page.getByRole('button', { name: 'Close Byte chat' }).click();
  await page.screenshot({ path: `.impeccable/review/relative-degrees-${info.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('list append and replacement blocks are introduced by later activities', async ({ page }) => {
  await student(page, 4, 'grade-4-lists-1');
  const palette = page.locator('.blocklyFlyout:not(.blocklyTrashcanFlyout)');
  await expect(palette.locator('.ka_list_set')).toHaveCount(1);
  await expect(palette.locator('.ka_relative_list_move')).toHaveCount(1);
  await expect(palette.locator('.ka_list_append')).toHaveCount(0);
  await expect(palette.locator('.ka_list_update')).toHaveCount(0);
  await page.getByRole('button', { name: /Challenge 4: Byte: Append/ }).click();
  await expect(palette.locator('.ka_list_append')).toHaveCount(1);
  await expect(palette.locator('.ka_list_update')).toHaveCount(0);
  await page.getByRole('button', { name: /Challenge 5: Byte: Replace/ }).click();
  await expect(palette.locator('.ka_list_update')).toHaveCount(1);
});
