import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('public pages, mobile navigation and course entry', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  if (testInfo.project.name !== 'desktop') await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/#\/courses$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Small steps.');
  await expect(page.locator('.adventure-card')).toHaveCount(4);
  await page.getByLabel('Find an adventure').fill('keyboard');
  await expect(page.locator('.adventure-card')).toHaveCount(1);
  await page.getByLabel('Find an adventure').fill('');
  for (const route of ['courses', 'how-it-works', 'parents']) {
    await page.goto(`/#/${route}`);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: `.impeccable/review/${route}-${testInfo.project.name}.png`, fullPage: true });
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/#\/courses$/);
  await page.locator('.adventure-card').filter({ hasText: 'Little Explorers' }).getByRole('link', { name: 'Start this course' }).click();
  await expect(page).toHaveURL(/#\/learn\/arrows$/);
  await expect(page.getByRole('region', { name: 'Current course' })).toContainText('Little Explorers');
  expect(errors).toEqual([]);
});
