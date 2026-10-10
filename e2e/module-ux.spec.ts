import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { emptySave } from '../src/storage';
import { sequenceCore } from '../src/topicJourney';
import { missions } from '../src/learning';
import { gradeSolutions } from '../src/gradeMissions';

async function moduleLesson(page: Page, title: string) {
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await page.locator('.module-button').filter({ hasText: title }).click();
}

test('the last core challenge returns to its module with drawing and next-module actions', async ({ page }) => {
  const id = 'grade-3-loops-10', save = emptySave();
  save.course = 'grade-3'; save.current = missions.findIndex(m => m.id === id);
  save.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, lessonSeen: true, worldLayout: 'tiles-v1', workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: gradeSolutions[id] } }] } } };
  await page.addInitScript(save => localStorage.setItem('kodearcade-v1', JSON.stringify(save)), save);
  await page.goto('/#/learn/grade-3');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await page.getByRole('dialog', { name: 'You made it!' }).getByRole('button', { name: 'Back to module', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Say it once, repeat it with a loop', exact: true })).toBeFocused();
  await expect(page.getByRole('region', { name: 'Loops drawing activities' })).toBeVisible();
  await page.getByRole('button', { name: 'Next module', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A bug is a clue', exact: true })).toBeFocused();
});

test('completed journey has aligned readable rows, a real next module and no progress gate', async ({ page }, info) => {
  const save = emptySave();
  for (const id of sequenceCore) save.progress[id] = { blocks: [], attempts: 7, hints: 4, complete: true, stars: 1, lessonSeen: true };
  await page.addInitScript(save => localStorage.setItem('kodearcade-v1', JSON.stringify(save)), save);
  await page.goto('/#/learn/grade-1');
  await page.getByRole('button', { name: 'Read lesson', exact: true }).click();
  const rows = page.getByRole('list', { name: 'Core activities' }).locator('.activity-row');
  await expect(rows).toHaveCount(10);
  await expect(rows.locator('.activity-row-action')).toContainText(Array(10).fill('Completed'));
  await expect(page.getByRole('button', { name: 'Try the mastery mission', exact: true })).toBeDisabled();
  const starts = await rows.locator('.activity-row-copy').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().left));
  expect(Math.max(...starts) - Math.min(...starts)).toBeLessThan(1);
  const target = await rows.first().boundingBox(); expect(target!.height).toBeGreaterThanOrEqual(44);
  await rows.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `.impeccable/review/module-list-${info.project.name}.png` });
  await page.locator('.module-activities-panel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `.impeccable/review/module-next-${info.project.name}.png` });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Next module', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The order changes the journey', exact: true })).toBeFocused();
  await expect(page.getByRole('region', { name: 'Direction & order drawing activities' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Drawing activities' }).locator('li')).toHaveCount(3);
  expect(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('kodearcade-v1')!).progress).filter((p: any) => p.complete).length)).toBe(10);
});

test('drawing belongs to its module, finishes back there and retains its saved work', async ({ page }) => {
  await page.goto('/#/learn/grade-1');
  await page.getByRole('button', { name: 'Open drawing lab' }).click();
  await expect(page.locator('.topbar .game-context')).toContainText('Sequences · Drawing 1 of 1');
  await page.getByText('Keyboard helpers', { exact: true }).click();
  await page.getByRole('button', { name: 'Add block', exact: true }).click();
  await page.getByRole('button', { name: 'Add block', exact: true }).click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  const feedback = page.getByRole('dialog', { name: 'You made it!' });
  await feedback.getByRole('button', { name: 'Back to module' }).click();
  await expect(page.getByRole('region', { name: 'Sequences topic journey' })).toBeVisible();
  const row = page.getByRole('list', { name: 'Drawing activities' }).getByRole('button', { name: /A little trail/ });
  await expect(row).toContainText('Completed');
  await row.click();
  await expect(page.getByRole('button', { name: /Drawing 1: A little trail, completed/ })).toBeVisible();
  await expect(page.locator('.editor-title')).toContainText('2 / 24 blocks');
  await page.getByRole('button', { name: 'Read lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Next module', exact: true }).click();
  await page.getByRole('list', { name: 'Drawing activities' }).getByRole('button', { name: /Turn a corner/ }).click();
  await expect(page.locator('.topbar .game-context')).toContainText('Direction & order · Drawing 1 of 3');
  await expect(page.getByRole('navigation', { name: 'Challenge progress' }).getByRole('button')).toHaveCount(3);
});

test('older grades group loops and variables separately and the last module offers a way out', async ({ page }, info) => {
  await page.goto('/#/learn/grade-6');
  await expect(page.getByRole('button', { name: 'Open drawing lab' })).toHaveCount(0);
  await moduleLesson(page, 'Loops');
  const drawings = page.getByRole('list', { name: 'Drawing activities' });
  await expect(drawings.locator('li')).toHaveCount(4);
  await expect(drawings).toContainText('Stellar dendrite');
  await expect(drawings).not.toContainText('Variable-driven spiral');
  await drawings.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `.impeccable/review/module-loops-${info.project.name}.png` });
  await moduleLesson(page, 'Variables');
  await expect(page.getByRole('list', { name: 'Drawing activities' })).toContainText('Variable-driven spiral');
  await page.getByRole('button', { name: 'Open drawing lab' }).click();
  await expect(page.locator('.topbar .game-context')).toContainText('Variables · Drawing 1 of 1');
  await page.getByRole('button', { name: 'Read lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Next module', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Explore courses', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next module', exact: true })).toHaveCount(0);
  await expect(page.getByRole('list', { name: 'Drawing activities' })).toContainText('Make it yours');
});
