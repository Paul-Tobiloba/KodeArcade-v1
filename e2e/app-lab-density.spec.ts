import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function fitsWindow(page: Page) {
  await expect(page.getByText('Saving & design tips', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Run to test your app! Each new run resets variables and table changes.', { exact: true })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    const main = document.querySelector('.al-main')!.getBoundingClientRect();
    return document.documentElement.scrollHeight <= innerHeight + 1
      && document.documentElement.scrollWidth <= innerWidth
      && main.top >= 0 && main.bottom <= innerHeight + 1;
  })).toBe(true);
  const run = await page.getByRole('button', { name: /^(Run|Stop) app$/ }).boundingBox();
  expect(run!.y + run!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
}

for (const [width, height] of [[1366, 768], [1280, 720], [1024, 768], [1440, 900], [1280, 600]]) {
  test(`desktop workbench fits ${width} × ${height} across all views`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.setViewportSize({ width, height });
    await page.route('**/api/session', route => route.fulfill({ json: null }));
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/#/app-lab');
    await page.getByRole('button', { name: /^Animal explorer/ }).click();
    await fitsWindow(page);
    await expect(page.getByRole('button', { name: 'New app', exact: true })).toHaveCSS('min-height', '32px');
    await expect(page.getByRole('button', { name: 'Button', exact: true })).toHaveCSS('min-height', '60px');
    // Frame and canvas shrink together, without cropping the 320 × 480 design.
    const frame = await page.locator('.al-device').boundingBox();
    const canvas = await page.locator('.al-preview').boundingBox();
    expect(canvas!.width / canvas!.height).toBeCloseTo(2 / 3, 2);
    expect(canvas!.y + canvas!.height).toBeLessThan(frame!.y + frame!.height);
    if (width === 1366) expect(canvas!.height).toBeGreaterThanOrEqual(380);
    if (width === 1366) await page.screenshot({ path: '.impeccable/review/app-lab-compact-design.png', fullPage: true });

    await page.getByRole('button', { name: 'Button', exact: true }).click();
    await page.getByRole('button', { name: 'Delete control', exact: true }).scrollIntoViewIfNeeded();
    await fitsWindow(page);
    await page.locator('.al-console summary').click();
    await fitsWindow(page);
    await page.locator('.al-console summary').click();

    await page.getByRole('button', { name: 'Code', exact: true }).click();
    await fitsWindow(page);
    if (width === 1366) await page.screenshot({ path: '.impeccable/review/app-lab-compact-blocks.png', fullPage: true });
    await page.getByRole('button', { name: 'Show text', exact: true }).click();
    const editor = page.getByRole('textbox', { name: 'App JavaScript code', exact: true });
    // Separate short stacks respect the interpreter's existing connection-depth limit.
    await editor.fill(Array.from({ length: 3 }, (_, group) => `onStart(function() {\n${Array.from({ length: 12 }, (_, i) => `console.log(${group * 12 + i});`).join('\n')}\n});`).join('\n'));
    await page.getByRole('button', { name: 'Apply code', exact: true }).click();
    await fitsWindow(page);
    await page.getByRole('button', { name: 'Run app', exact: true }).click();
    await page.locator('.al-console summary').click();
    await expect(page.locator('.al-console pre')).toContainText('35');
    await fitsWindow(page);
    await page.getByRole('button', { name: 'Stop app', exact: true }).click();
    if (width === 1366) await page.screenshot({ path: '.impeccable/review/app-lab-compact-text.png', fullPage: true });
    await page.locator('.al-console summary').click();
    await page.getByRole('button', { name: 'Show blocks', exact: true }).click();
    await page.getByRole('button', { name: 'Edit print command as text', exact: true }).last().scrollIntoViewIfNeeded();
    await fitsWindow(page);

    await page.getByRole('navigation', { name: 'App Lab views' }).getByRole('button', { name: 'Data', exact: true }).click();
    for (let i = 0; i < 15; i++) await page.getByRole('button', { name: 'Add row', exact: true }).click();
    await page.getByLabel('name row 17', { exact: true }).fill('Last animal');
    await page.getByLabel('name row 17', { exact: true }).blur();
    await fitsWindow(page);
    if (width === 1366) {
      await page.screenshot({ path: '.impeccable/review/app-lab-compact-data.png', fullPage: true });
      expect((await new AxeBuilder({ page }).include('.app-lab').analyze()).violations).toEqual([]);
    }
    await page.getByRole('button', { name: 'New app', exact: true }).click();
    await page.getByRole('button', { name: /^Mission checklist/i }).scrollIntoViewIfNeeded();
    await fitsWindow(page);
    expect(errors).toEqual([]);
  });
}

test('narrow or zoom-sized windows retain document scrolling and touch controls', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop');
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.goto('/#/app-lab');
  await page.getByRole('button', { name: /^Blank app/ }).click();
  expect(await page.getByRole('button', { name: 'New app', exact: true }).evaluate(button => parseFloat(getComputedStyle(button).minHeight))).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Button', exact: true }).click();
  await expect(page.getByLabel('Control ID', { exact: true })).toHaveValue('button1');
  await page.screenshot({ path: `.impeccable/review/app-lab-compact-${info.project.name}.png`, fullPage: true });
});

test('very short desktop windows fall back to a reachable scrolling page', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.goto('/#/app-lab');
  await page.getByRole('button', { name: /^Blank app/ }).click();
  await page.getByRole('button', { name: 'Add screen', exact: true }).click();
  await page.getByRole('button', { name: 'Start app on this screen', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('touch-operated desktop retains 44px controls without page overflow', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, hasTouch: true });
  try {
    const page = await context.newPage();
    await page.route('**/api/session', route => route.fulfill({ json: null }));
    await page.goto('http://127.0.0.1:5173/#/app-lab');
    await page.getByRole('button', { name: /^Blank app/ }).tap();
    await expect(page.getByRole('button', { name: 'New app', exact: true })).toHaveCSS('min-height', '44px');
    await fitsWindow(page);
    await page.getByRole('button', { name: 'Button', exact: true }).tap();
    await expect(page.getByLabel('Control ID', { exact: true })).toHaveValue('button1');
    await fitsWindow(page);
  } finally { await context.close(); }
});
