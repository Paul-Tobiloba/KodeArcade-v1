import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { missions } from '../src/learning';
import { gradeSolutions } from '../src/gradeMissions';

test('tile worlds share real collision cells, mascot goals and a responsive workspace', async ({ page }, info) => {
  test.setTimeout(120000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/learn');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `.impeccable/review/worlds-${info.project.name}-entry.png`, fullPage: true });
  await page.locator('a[href="/#/learn/grade-3"]').click();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  const worlds = [
    ['sequences','Byte','charging station'], ['directions','Dash','carrot basket'],
    ['loops','Gigi','golden leaf'], ['debugging','Fix','toolbox'],
    ['conditionals','Milo','banana basket'], ['variables','Nova','acorn basket'],
  ];
  for (const [topic, name, goal] of worlds) {
    const id = `grade-3-${topic}-1`;
    await page.evaluate(({ id, current, solution }) => {
      const save = JSON.parse(localStorage.getItem('kodearcade-v1')!);
      save.current = current;
      save.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, lessonSeen: true, worldLayout: 'tiles-v1', workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: solution } }] } } };
      localStorage.setItem('kodearcade-v1', JSON.stringify(save));
    }, { id, current: missions.findIndex(m => m.id === id), solution: gradeSolutions[id] });
    await page.reload();
    await expect(page.locator('.tile-scene')).toHaveAttribute('data-character', name);
    await expect(page.locator('.world-destination')).toContainText(goal);
    await expect(page.locator('.board .cell')).toHaveCount(36);
    await expect(page.locator('.destination-sprite')).toHaveCount(1);
    await expect(page.locator('.board .cell.rock')).not.toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308, height: 677 });
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0,0));
    await page.screenshot({ path: `.impeccable/review/worlds-${info.project.name}-${name.toLowerCase()}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (info.project.name === 'desktop') expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze();
    expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) ).toEqual([]);
    if (name === 'Byte') {
      await page.getByRole('button', { name: 'Reset position', exact: true }).click();
      await expect(page.locator('.blocklyBlockCanvas>.blocklyDraggable')).not.toHaveCount(0);
      await page.getByRole('button', { name: 'Rows & columns', exact: true }).click();
      await expect(page.locator('.cell-coordinate')).toHaveCount(36);
      await page.getByRole('button', { name: 'Rows & columns', exact: true }).click();
      await page.getByRole('button', { name: 'Run code', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: 'Close feedback' }).click();
      await expect(page.locator('.challenge-progress [aria-current=step]')).toHaveClass('challenge-done');
    }
  }
  await page.goto('/#/learn/computer');
  await expect(page.getByRole('img', { name: 'Pip the Parrot' })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({ path: `.impeccable/review/worlds-${info.project.name}-pip.png`, fullPage: true });
  await page.getByRole('button', { name: 'Pick up star' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Pip is ready' })).toBeVisible();
  expect(errors).toEqual([]);
});
