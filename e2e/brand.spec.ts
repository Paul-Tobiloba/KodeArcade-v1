import { test, expect } from '@playwright/test';

test('approved brand assets load without crowding navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/learn/arrows');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveTitle('KodeArcade — Play. Build. Learn.');
  await expect(page.getByRole('link', { name: 'KodeArcade home' })).toBeVisible();
  expect(await page.locator('.brand-symbol').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: /^(Show|Hide) modules$/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible();
  await page.screenshot({ path: `.impeccable/review/brand-${test.info().project.name}.png`, fullPage: true });
  for (const file of ['logo-color.svg','logo-reverse.svg','logo-mono.svg','logo-white.svg','favicon.svg']) {
    const response = await page.request.get(`/brand/${file}`);
    expect(response.ok()).toBe(true);
  }
});
