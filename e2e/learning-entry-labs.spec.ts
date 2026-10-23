import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.route('**/api/capabilities', route => route.fulfill({ json: {} }));
});

test('public course page has illustrated courses and three matching Labs cards', async ({ page }, info) => {
  await page.goto('/#/learn');
  const nav = page.getByRole('navigation', { name: 'Labs', exact: true });
  await expect(nav.getByRole('link')).toHaveCount(3);
  await expect(page.locator('.entry-resume[href="/#/app-lab"]')).toHaveCount(0);
  const coursesBottom = await page.locator('.entry-options').evaluate(element => element.getBoundingClientRect().bottom);
  expect((await page.locator('.entry-labs').boundingBox())!.y).toBeGreaterThan(coursesBottom);
  for (const name of ['Byte Lab', 'App Lab', 'Artist Lab']) {
    const link = nav.getByRole('link', { name: new RegExp(`^Open ${name} preview`) });
    await expect(link.locator('svg').first()).toBeVisible();
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  const art = await page.locator('.entry-world-art > .character-sprite').evaluateAll(elements => Promise.all(elements.map(async element => {
    // The immediate icon is replaced once the independent image preload succeeds.
    const deadline = Date.now() + 10000;
    while (getComputedStyle(element).backgroundImage === 'none' && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 25));
    const style = getComputedStyle(element), box = element.getBoundingClientRect();
    const image = new Image(); image.src = style.backgroundImage.slice(5, -2);
    await image.decode();
    return { width: box.width, height: box.height, display: style.display, sourceWidth: image.naturalWidth };
  })));
  for (const item of art) {
    expect(item.height, JSON.stringify(item)).toBeGreaterThanOrEqual(48);
    expect(item.width).toBeGreaterThanOrEqual(48);
    expect(item.sourceWidth).toBeGreaterThan(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.learning-entry').analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/public-labs-${info.project.name}.png`, fullPage: true });
});

test('course and Lab icons remain visible when character image requests fail', async ({ page }, info) => {
  await page.route('**/images/worlds/*.png', route => route.abort());
  await page.goto('/#/learn');
  await expect(page.locator('.entry-world-art > .character-sprite > svg')).toHaveCount(7);
  for (const icon of await page.locator('.entry-world-art > .character-sprite > svg').all()) await expect(icon).toBeVisible();
  await expect(page.locator('.entry-labs .lab-card-icon > svg')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.impeccable/review/public-labs-fallback-${info.project.name}.png`, fullPage: true });
});

test('all public Labs cards open real preview editors without student requests', async ({ page }) => {
  const studentRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('/api/student/')) studentRequests.push(request.url()); });
  await page.goto('/#/learn');
  await page.getByRole('link', { name: /^Open Artist Lab preview/ }).click();
  await expect(page).toHaveURL(/learn\/grade-1\/art$/);
  await expect(page.locator('.drawing-artboard')).toBeVisible({timeout:15000});
  await page.goto('/#/learn');
  await page.getByRole('link', { name: /^Open Byte Lab preview/ }).click();
  await expect(page).toHaveURL(/learn\/grade-3\/lab$/);
  await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toBeVisible();
  await page.goto('/#/learn');
  await page.getByRole('link', { name: /^Open App Lab preview/ }).click();
  await expect(page).toHaveURL(/#\/app-lab$/);
  await expect(page.getByRole('textbox', { name: 'App project name', exact: true })).toBeVisible();
  expect(studentRequests).toEqual([]);
});

test('public Byte and Artist shortcuts retain a supported last-used preview course', async ({ page }) => {
  await page.goto('/#/learn/grade-5/art');
  await expect(page.locator('.drawing-artboard')).toBeVisible();
  await page.goto('/#/learn');
  await expect(page.getByRole('link', { name: 'Open Byte Lab preview · Grade 5', exact: true })).toHaveAttribute('href', '/#/learn/grade-5/lab');
  await expect(page.getByRole('link', { name: 'Open Artist Lab preview · Grade 5', exact: true })).toHaveAttribute('href', '/#/learn/grade-5/art');
});
