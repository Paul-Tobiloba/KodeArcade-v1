import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { if (!localStorage.getItem('kodearcade-v1')) localStorage.setItem('kodearcade-v1', JSON.stringify({ version: 1, course: 'words', current: 0, progress: {} })); }); });
async function dragRight(page: Page, touch = false) {
  const source = page.locator('.blocklyFlyout .blocklyDraggable').filter({ hasText: 'Move right' });
  const target = page.locator('.blocklySvg > .blocklyWorkspace > .blocklyBlockCanvas .blocklyPath').last();
  await source.scrollIntoViewIfNeeded();
  const from = await source.boundingBox(); const to = await target.boundingBox();
  if (!from || !to) throw new Error('Block bounds unavailable');
  if (touch) {
    const client = await page.context().newCDPSession(page);
    const start = { x: from.x + 25, y: from.y + 12 };
    const end = { x: to.x + 25, y: to.y + to.height + 8 };
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let i = 1; i <= 20; i++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * i / 20, y: start.y + (end.y - start.y) * i / 20 }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await client.detach(); return;
  }
  await page.mouse.move(from.x + 25, from.y + 12); await page.mouse.down();
  await page.mouse.move(from.x + 35, from.y + 12, { steps: 3 });
  await page.mouse.move(to.x + 25, to.y + to.height + 8, { steps: 20 }); await page.mouse.up();
}
test('drag blocks, run, recover, save and resume', async ({ page, isMobile }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); await page.goto('/#/learn/words'); await expect(page.locator('.course-app')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Every program starts with a sequence');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await expect(page.locator('.blocklyFlyout .blocklyDraggable')).toHaveCount(4);
  await dragRight(page, isMobile); await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.retry-toast')).toBeVisible();
  await expect(page.locator('.retry-toast')).toContainText('Byte stopped at row 3, column 2.');
  await page.getByRole('button', { name: 'Dismiss retry message', exact: true }).click();
  await page.getByRole('button', { name: 'Get a hint', exact: true }).click();
  await expect(page.getByText('Look at Byte and the yellow charging station.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Close hints', exact: true }).click();
  await dragRight(page, isMobile); await dragRight(page, isMobile);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByText('Byte is recharged.', { exact: false })).toBeVisible();
  await page.reload(); await expect(page.getByText('3 / 24 blocks', { exact: true })).toBeVisible();
  await expect(page.getByText('3 / 24 blocks', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next challenge', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next challenge', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start challenge', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A different direction'); expect(errors).toEqual([]);
});
test('preferences, keyboard helpers and reset', async ({ page }) => {
  await page.goto('/#/learn/words'); await expect(page.locator('.course-app')).toBeVisible(); await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to learning' })).toBeFocused(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.getByText('Keyboard helpers', { exact: true }).click();
  await page.getByRole('button', { name: 'Add block', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Settings' }).click(); await page.getByLabel('Nickname').fill('Explorer');
  await page.getByLabel('Larger text').check(); await page.getByLabel('Show steps without sliding animations').check();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Settings' }).click(); page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reset saved progress' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Every program starts with a sequence');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await expect(page.getByText('0 / 24 blocks', { exact: true })).toBeVisible();
});
test('capture workspace and audit the app shell', async ({ page }, testInfo) => {
  await page.goto('/#/learn/words'); await expect(page.locator('.course-app')).toBeVisible();
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-lesson.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await expect(page.locator('.blocklyFlyout .blocklyDraggable')).toHaveCount(4);
  await expect.poll(async () => {
    const hint = await page.getByRole('button', { name: 'Get a hint', exact: true }).boundingBox();
    const editor = await page.getByRole('region', { name: 'Code editor', exact: true }).boundingBox();
    return hint && editor ? hint.y < editor.y : false;
  }).toBe(true);
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  // Blockly's SVG accessibility requires separate evaluation.
  const violations = (await new AxeBuilder({ page }).exclude('.blockly-container').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations;
  expect(violations).toEqual([]);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.retry-toast')).toBeVisible();
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-feedback.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).exclude('.blockly-container').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await expect(page.locator('.retry-toast')).not.toBeVisible({ timeout: 4000 });
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeEnabled();
});

test('drawer modules, concept review, and code preservation', async ({ page }, testInfo) => {
  await page.goto('/#/learn/words'); await expect(page.locator('.course-app')).toBeVisible();
  if (await page.getByRole('button', { name: 'Hide modules', exact: true }).isVisible()) await page.getByRole('button', { name: 'Hide modules', exact: true }).click();
  await expect(page.locator('#module-drawer')).toHaveAttribute('aria-hidden', 'true');
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await expect(page.locator('#module-drawer')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#module-drawer')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-drawer.png` });
  await page.locator('.module-button').filter({ hasText: 'Loops' }).click();
  if (await page.getByRole('button', { name: 'Show modules', exact: true }).isVisible()) await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await expect(page.locator('.current-module .challenge-list button')).toHaveCount(10);
  await page.locator('.challenge-list button').filter({ hasText: 'Two little loops' }).click();
  await expect(page.getByRole('heading', { name: 'Try it: Two little loops' })).toBeVisible();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.getByText('Keyboard helpers', { exact: true }).click();
  await page.getByRole('button', { name: 'Add block', exact: true }).click();
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Read lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Continue to challenge', exact: true }).click();
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  if (await page.getByRole('button', { name: 'Show modules', exact: true }).isVisible()) await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await expect(page.locator('#module-drawer')).toContainText('Variables');
  await expect(page.locator('#module-drawer')).toContainText('Conditionals');
});
