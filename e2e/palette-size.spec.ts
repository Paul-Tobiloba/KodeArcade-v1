import { test, expect } from '@playwright/test';

test('Grade 2 movement palette stays readable after reload and responsive resizing', async ({ page }, info) => {
  await page.goto('/#/learn/grade-2');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1308, height: 677 });
  const arrow = page.locator('.blocklyFlyout .blocklyDraggable.ka_arrow_right');
  const readable = async () => {
    await expect(arrow).toBeVisible();
    const box = (await arrow.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  };
  await readable();
  await arrow.click();
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  await page.reload();
  await readable();
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1024, height: 768 });
    await readable();
    await page.setViewportSize({ width: 1308, height: 677 });
    await readable();
  }
  await page.evaluate(() => { window.scrollTo(0,0); return document.fonts.ready; });
  await page.screenshot({ path: `.impeccable/review/three-column-grade2-${info.project.name}.png`, fullPage: true });
});
