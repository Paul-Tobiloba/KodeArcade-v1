import { test, expect } from '@playwright/test';

test('course drawer overlays without resizing the board or canvas', async ({ page }, info) => {
  await page.goto('/#/learn/grade-2');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308, height: 677 });
  await expect(page.locator('.blocklyFlyout .ka_arrow_right')).toBeVisible();
  const selectors = ['.workspace-grid', '.tile-map', '.editor', '.blocklySvg > .blocklyWorkspace > .blocklyBlockCanvas .ka_start > .blocklyPath'];
  const boxes = async () => Promise.all(selectors.map(s => page.locator(s).first().boundingBox()));
  await page.waitForTimeout(250);
  const before = await boxes();
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await expect(page.locator('.course-drawer')).toHaveClass(/is-open/);
  await page.waitForTimeout(250);
  const unchanged = async () => {
    const after = await boxes();
    for (let i=0;i<before.length;i++) for (const key of ['x','y','width','height'] as const) expect(after[i]![key]).toBeCloseTo(before[i]![key], 1);
  };
  await unchanged();
  await page.getByRole('button', { name: 'Close modules', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show modules', exact: true })).toHaveAttribute('aria-expanded','false');
  await page.waitForTimeout(250);
  await unchanged();
  // Capture after measuring; full-page capture can temporarily resize the
  // browser viewport and invoke Blockly's native layout independently.
  await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({ path: `.impeccable/review/three-column-drawer-${info.project.name}.png`, fullPage: true });
});
