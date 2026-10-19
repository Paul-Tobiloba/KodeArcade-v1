import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { missions } from '../src/learning';
import { gradeSolutions } from '../src/gradeMissions';
import { emptySave } from '../src/storage';

async function completeChallenge(page: Page, reduced = false, attempts = 0) {
  const id = 'grade-3-sequences-1', save = emptySave();
  save.course = 'grade-3'; save.current = missions.findIndex(m => m.id === id);
  save.reducedMotion = reduced; save.soundEnabled = false; save.musicEnabled = false;
  save.progress[id] = { blocks: [], attempts, hints: 0, complete: false, lessonSeen: true, worldLayout: 'tiles-v1', workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: gradeSolutions[id] } }] } } };
  await page.addInitScript(save => localStorage.setItem('kodearcade-v1', JSON.stringify(save)), save);
  await page.goto('/#/learn/grade-3');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 15000 });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: false } }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
});

test('shiny stars reveal once in a symmetric, upright, responsive arch', async ({ page }, info) => {
  await completeChallenge(page);
  await expect(page.getByRole('img', { name: 'You earned 5 of 5 stars' })).toBeVisible();
  await expect(page.locator('.reward-stars .earned')).toHaveCount(5);
  await expect(page.locator('.reward-stars img')).toHaveCount(5);
  await expect(page.locator('.reward-star.earned').first()).toHaveCSS('animation-name', 'star-arrives');
  await expect(page.locator('.earned .reward-star-shine').first()).toHaveCSS('animation-iteration-count', '1');
  await page.locator('.reward-stars').evaluate(async group => {
    await Promise.all([...group.querySelectorAll('img')].map(image => image.decode()));
    await Promise.all(group.getAnimations({ subtree: true }).map(animation => animation.finished));
    await document.fonts.ready;
  });
  const stars = await page.locator('.reward-star-slot').evaluateAll(slots => slots.map(slot => {
    const box = slot.getBoundingClientRect(), star = slot.querySelector('.reward-star')!, matrix = new DOMMatrix(getComputedStyle(star).transform);
    return { x: box.x, width: box.width, cy: box.y + box.height / 2, upright: matrix.b === 0 && matrix.c === 0 };
  }));
  expect(stars[0].width / stars[2].width).toBeCloseTo(.58, 1);
  expect(stars[1].width / stars[2].width).toBeCloseTo(.8, 1);
  expect(stars[4].width).toBeCloseTo(stars[0].width, 1);
  expect(stars[3].width).toBeCloseTo(stars[1].width, 1);
  expect(stars[2].cy).toBeLessThan(stars[1].cy);
  expect(stars[1].cy).toBeLessThan(stars[0].cy);
  expect(stars.every(star => star.upright)).toBe(true);
  const dialog = (await page.locator('.star-dialog').boundingBox())!;
  expect(stars[0].x).toBeGreaterThan(dialog.x);
  expect(stars[4].x + stars[4].width).toBeLessThan(dialog.x + dialog.width);
  const alpha = await page.locator('.reward-stars img').first().evaluate(image => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!; context.drawImage(image as HTMLImageElement, 0, 0);
    return context.getImageData(0, 0, 1, 1).data[3];
  });
  expect(alpha).toBe(0);
  await page.locator('.star-dialog').screenshot({ path: `.impeccable/review/reward-stars-${info.project.name}.png` });
  expect((await new AxeBuilder({ page }).include('.star-dialog').analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Next challenge', exact: true }).click();
  await expect(page.locator('.star-dialog')).not.toBeVisible();
});

for (const preference of ['saved', 'system'] as const) test(`reduced motion (${preference}) shows partial rewards immediately without shine`, async ({ page }, info) => {
  if (preference === 'system') await page.emulateMedia({ reducedMotion: 'reduce' });
  await completeChallenge(page, preference === 'saved', 5);
  await expect(page.getByRole('img', { name: 'You earned 3 of 5 stars' })).toBeVisible();
  await expect(page.locator('.reward-stars .earned')).toHaveCount(3);
  await expect(page.locator('.reward-stars .unearned')).toHaveCount(2);
  await expect(page.locator('.reward-star.earned').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.reward-star-shine').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.celebration-confetti')).toHaveCount(0);
  if (preference === 'saved') await page.locator('.star-dialog').screenshot({ path: `.impeccable/review/reward-stars-partial-${info.project.name}.png` });
  await page.keyboard.press('Escape');
  await expect(page.locator('.star-dialog')).not.toBeVisible();
});

test('closing feedback early cancels pending star reveals', async ({ page }) => {
  await completeChallenge(page);
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect(page.locator('.star-dialog')).not.toBeVisible();
  await expect(page.locator('.reward-stars .earned')).toHaveCount(0);
});
