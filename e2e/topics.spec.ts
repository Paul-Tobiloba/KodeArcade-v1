import { test, expect } from '@playwright/test';
import { missions } from '../src/learning';
import { topicSolutions } from '../src/topicMissions';

test('Milo decisions and Nova variables run, animate and persist', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/learn/words');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await page.locator('.module-button').filter({ hasText: 'Conditionals' }).click();
  await expect(page.getByText('Milo the Monkey', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await expect(page.locator('.blocklyFlyout .ka_if_else')).toBeVisible();
  if (info.project.name === 'desktop') await page.locator('.blocklyFlyout .ka_if').click({ position: { x: 12, y: 12 } });
  else await page.locator('.blocklyFlyout .ka_if').tap({ position: { x: 12, y: 12 } });
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  async function load(id: string) {
    await page.evaluate(({ id, current, solution }) => {
      const save = JSON.parse(localStorage.getItem('kodearcade-v1')!);
      save.current = current;
      save.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, lessonSeen: true, workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: solution } }] } } };
      localStorage.setItem('kodearcade-v1', JSON.stringify(save));
    }, { id, current: missions.findIndex(m => m.id === id), solution: topicSolutions[id] });
    await page.reload();
    await page.evaluate(async () => { await document.fonts.ready; const i = new Image(); i.src = '/images/topic-cast.png'; await i.decode(); });
  }
  await load('conditionals-7');
  await expect(page.locator('.character-world')).toContainText('Milo');
  await page.screenshot({ path: `.impeccable/review/topics-${info.project.name}-milo.png`, fullPage: true });
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.runtime-note')).toContainText('right is clear');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Milo');
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await page.locator('.module-button').filter({ hasText: 'Variables' }).click();
  await expect(page.getByText('Nova the Squirrel', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await expect(page.locator('.blocklyFlyout .ka_set_score')).toBeVisible();
  await load('variables-9');
  await expect(page.getByLabel('Current score')).toContainText('not set');
  await page.screenshot({ path: `.impeccable/review/topics-${info.project.name}-nova.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1308, height: 677 });
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
    await page.screenshot({ path: '.impeccable/review/topics-user-1308-nova.png', fullPage: true });
  }
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByLabel('Current score')).toContainText('score: 3');
  await expect(page.getByLabel('Current score')).toContainText('score: 1');
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Nova');
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await page.reload();
  await expect(page.locator('.challenge-progress [aria-current=step]')).toHaveClass('challenge-done');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['variables-9'].stars)).toBe(5);
  expect(errors).toEqual([]);
});
