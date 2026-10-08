import { test, expect } from '@playwright/test';
import { missions } from '../src/learning';
import { gradeSolutions } from '../src/gradeMissions';
import { courses } from '../src/courses';

test('six grade courses, optional music and a brief success celebration', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/learn');
  for (const course of courses) await expect(page.locator(`a[href="/#/learn/${course.id}"]`)).toBeVisible();
  await page.locator('a[href="/#/learn/grade-1"]').click();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByLabel('Background music', { exact: true })).not.toBeChecked();
  await page.getByLabel('Background music', { exact: true }).check();
  await page.getByLabel('Character sound effects', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).musicEnabled)).toBe(true);
  const block = page.locator('.blocklyFlyout .ka_arrow_right');
  if (info.project.name === 'desktop') await block.click({ position: { x: 12, y: 12 } });
  else await block.tap({ position: { x: 12, y: 12 } });
  await page.screenshot({ path: `.impeccable/review/grades-${info.project.name}-one.png`, fullPage: true });
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible();
  await expect(page.locator('.celebration-confetti i')).toHaveCount(30);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `.impeccable/review/grades-${info.project.name}-confetti.png`, fullPage: true });
  await expect(page.locator('.celebration-confetti')).toHaveCount(0, { timeout: 4000 });
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect(page.locator('.challenge-progress [aria-current=step]')).toHaveClass('challenge-done');
  expect(errors).toEqual([]);
});

test('grade six keeps its larger board, real variable program and scoped modules', async ({ page }, info) => {
  await page.goto('/#/learn/grade-6');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  const id = 'grade-6-variables-9';
  await page.evaluate(({ id, current, solution }) => {
    const save = JSON.parse(localStorage.getItem('kodearcade-v1')!);
    save.current = current;
    save.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, lessonSeen: true, workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: solution } }] } } };
    localStorage.setItem('kodearcade-v1', JSON.stringify(save));
  }, { id, current: missions.findIndex(m => m.id === id), solution: gradeSolutions[id] });
  await page.reload();
  await expect(page.locator('.character-world')).toContainText('Nova');
  await page.evaluate(async () => { await document.fonts.ready; });
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308, height: 677 });
  await page.screenshot({ path: `.impeccable/review/grades-${info.project.name}-six.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'desktop') expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await expect(page.locator('#module-drawer')).toContainText('Grade 6');
  await expect(page.locator('#module-drawer')).toContainText('Variables');
});
