import { expect, test } from '@playwright/test';
import { courseFor } from '../src/courses';
import { NAV_KEY } from '../src/cloudProgress';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: false } }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
});

for (const course of ['arrows', 'words', 'builder'] as const) {
  for (const staleDrawing of [false, true]) {
    test(`${course} opens and reloads without drawing activities${staleDrawing ? ' after a graded drawing' : ''}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      if (staleDrawing) {
        await page.addInitScript(key => {
          if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ view: 'drawing', drawingId: 'trail' }));
        }, NAV_KEY);
      }
      await page.goto(`/#/learn/${course}`);
      const courseLabel = page.locator('.game-course-title');
      await expect(courseLabel).toContainText(courseFor(course).title);
      await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
      await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).view, NAV_KEY)).toBe('challenge');
      await page.reload();
      await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
}
