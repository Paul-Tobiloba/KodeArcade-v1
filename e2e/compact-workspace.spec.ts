import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('compact workspace keeps the board, palette and code visible', async ({ page }, info) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const sizes = info.project.name === 'desktop' ? [{ width: 1308, height: 677 }, { width: 1366, height: 768 }] : [page.viewportSize()!];
  await page.goto('/#/learn/arrows');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.evaluate(async () => { const image = new Image(); image.src = '/images/meadow-board.png'; await image.decode(); await document.fonts.ready; });
  for (const size of sizes) {
    await page.setViewportSize(size);
    await expect(page.locator('.board')).toBeVisible();
    await page.waitForTimeout(250);
    const board = (await page.locator('.board').boundingBox())!;
    const host = (await page.locator('.blockly-host').boundingBox())!;
    const scrollable = size.width <= 950 || size.height <= 600;
    expect(board.height).toBeGreaterThan(scrollable ? 250 : 300);
    expect(host.height).toBeGreaterThan(scrollable ? 400 : 450);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(scrollable);
    for (const selector of ['.board', '.blockly-host', '.run-button', '.blocklyFlyout .blocklyDraggable']) {
      for (const item of await page.locator(selector).all()) {
        const box = (await item.boundingBox())!;
        if (!scrollable) { expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(size.height); }
      }
    }
    await page.screenshot({ path: `.impeccable/review/compact-${info.project.name}-${size.width}-workspace.png`, fullPage: scrollable });
  }
  // The actual Blockly palette is both draggable and tap-to-append; no duplicate inventory.
  await page.locator('.blocklyFlyout .blocklyDraggable.ka_arrow_right').click();
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  const boardGeometry = () => page.locator('.board').evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; });
  const before = await boardGeometry();
  await page.getByRole('button', { name: 'Get a hint', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Hints' })).toBeVisible();
  expect(await boardGeometry()).toEqual(before);
  await page.screenshot({ path: `.impeccable/review/compact-${info.project.name}-hint.png` });
  await page.getByRole('button', { name: 'Close hints' }).click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible();
  await expect(page.locator('.reward-stars .earned')).toHaveCount(5);
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect(page.locator('.game-tools .star-rating')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Challenge progress' }).getByRole('button', { name: /Challenge 1:.*completed/ })).toHaveClass('challenge-done');
  await page.screenshot({ path: `.impeccable/review/compact-${info.project.name}-completed-nav.png` });
  await page.getByRole('button', { name: 'Clear code', exact: true }).click();
  await page.locator('.blocklyFlyout .blocklyDraggable.ka_arrow_down').click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.retry-toast')).toBeVisible();
  expect(await boardGeometry()).toEqual(before);
  await page.screenshot({ path: `.impeccable/review/compact-${info.project.name}-retry.png` });
  await expect(page.locator('.retry-toast')).toHaveCount(0, { timeout: 4000 });
  await page.getByRole('button', { name: 'Clear code', exact: true }).click();
  for (let n = 0; n < 24; n++) await page.locator('.blocklyFlyout .blocklyDraggable.ka_arrow_right').click();
  await expect(page.getByText('24 / 24 blocks', { exact: true })).toBeVisible();
  await page.waitForTimeout(250);
  const host = (await page.locator('.blockly-host').boundingBox())!;
  const overview = page.getByRole('region', { name: 'Program steps' });
  if (await overview.isVisible()) {
    await expect(page.locator('.program-overview li>button')).toHaveCount(24);
    for (const step of await page.locator('.program-overview li>button').all()) {
      const box = (await step.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y + box.height).toBeLessThanOrEqual(host.y + host.height);
    }
  } else {
    const program = (await page.locator('.blocklySvg > .blocklyWorkspace > .blocklyBlockCanvas > g[data-id]').first().boundingBox())!;
    expect(program.y + program.height).toBeLessThanOrEqual(host.y + host.height);
    expect((await page.locator('.blocklySvg > .blocklyWorkspace .ka_arrow_right > .blocklyPath').first().boundingBox())!.height).toBeGreaterThanOrEqual(24);
  }
  await page.screenshot({ path: `.impeccable/review/compact-${info.project.name}-max-program.png` });
  if (await overview.isVisible()) {
    await page.getByRole('button', { name: 'Move step later', exact: true }).click();
    await page.getByRole('button', { name: 'Delete selected step', exact: true }).click();
    await expect(page.getByText('23 / 24 blocks', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Undo block change', exact: true }).click();
    await expect(page.getByText('24 / 24 blocks', { exact: true })).toBeVisible();
  }
  expect((await new AxeBuilder({ page }).exclude('.blockly-container').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await page.locator('.module-button').filter({ hasText: 'Loops' }).click();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.evaluate(() => {
    const save = JSON.parse(localStorage.getItem('kodearcade-v1')!);
    save.progress['on-repeat'].blocks = [{ id: 'loop-fixture', kind: 'repeat', direction: 'right', count: 4 }];
    delete save.progress['on-repeat'].workspace;
    localStorage.setItem('kodearcade-v1', JSON.stringify(save));
  });
  await page.reload();
  await expect(page.locator('.blocklyFlyout .ka_repeat')).toBeVisible();
  await page.waitForTimeout(250);
  const loopHost = (await page.locator('.blockly-host').boundingBox())!;
  for (const block of await page.locator('.blocklyFlyout .blocklyDraggable').all()) {
    const box = (await block.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(loopHost.y + loopHost.height);
  }
  await page.screenshot({ path: `.impeccable/review/compact-${info.project.name}-loop.png` });
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible();
  expect(errors).toEqual([]);
});
