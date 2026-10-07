import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('arrow course, stage Play, delayed feedback and independent saves', async ({ page }, testInfo) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/learn/arrows');
  await expect(page.getByRole('region', { name: 'Current course' })).toContainText('Little Explorers');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await expect(page.locator('.blocklyFlyout image')).toHaveCount(4);
  await page.getByRole('button', { name: 'Add move right', exact: true }).click();
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: `.impeccable/review/age-course-${testInfo.project.name}.png`, fullPage: true });
  const violations = (await new AxeBuilder({ page }).exclude('.blockly-container').withTags(['wcag2a','wcag2aa']).analyze()).violations;
  expect(violations).toEqual([]);
  await page.locator('.scene').getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.robot-position')).toHaveCSS('--x', '2');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByText('Byte is recharged.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await page.getByRole('link', { name: 'Change course', exact: true }).click();
  await page.getByRole('link', { name: /Ages 8–10 Code Adventurers/ }).click();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await expect(page.getByText('0 / 24 blocks', { exact: true })).toBeVisible();
  await expect(page.locator('.blocklyFlyout:not(.blocklyTrashcanFlyout)')).toContainText('Move right');
  await page.getByRole('link', { name: 'Change course', exact: true }).click();
  await page.getByRole('link', { name: /Ages 6–8 Little Explorers/ }).click();
  await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByText('1 / 24 blocks', { exact: true })).toBeVisible();
  // A wrong route must also show its valid moves before feedback.
  await page.getByRole('button', { name: 'Add move down', exact: true }).click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.robot-position')).toHaveCSS('--y', '3');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('dialog', { name: 'A new clue for your code.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('computer basics supports mouse drag, keyboard practice and persistence', async ({ page, isMobile }, testInfo) => {
  await page.goto('/#/learn/computer');
  await expect(page.getByRole('heading', { name: 'Computer Explorers', exact: true, level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Activity 3', exact: true }).click();
  await page.locator('.mouse-garden').scrollIntoViewIfNeeded();
  const from = await page.getByRole('button', { name: 'Pick up star', exact: true }).boundingBox();
  const to = await page.getByRole('button', { name: 'Star home', exact: true }).boundingBox();
  if (!from || !to) throw new Error('Missing drag targets');
  if (isMobile) {
    const client = await page.context().newCDPSession(page);
    const start = { x: from.x + from.width/2, y: from.y + from.height/2 };
    const end = { x: to.x + to.width/2, y: to.y + to.height/2 };
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let n = 1; n <= 15; n++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x-start.x)*n/15, y: start.y + (end.y-start.y)*n/15 }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await client.detach();
  } else {
    await page.mouse.move(from.x + from.width/2, from.y + from.height/2); await page.mouse.down();
    await page.mouse.move(to.x + to.width/2, to.y + to.height/2, { steps: 15 }); await page.mouse.up();
  }
  await expect(page.getByText('Star delivered!', { exact: true })).toBeVisible();
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: `.impeccable/review/computer-basics-${testInfo.project.name}.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Reset position', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pick up star', exact: true })).toBeEnabled();
  await expect(page.getByText('Star delivered!', { exact: true })).not.toBeVisible();
  await expect(page.getByText('1 / 20 activities complete', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pick up star', exact: true }).click();
  await page.getByRole('button', { name: 'Star home', exact: true }).click();
  await expect(page.getByText('Star delivered!', { exact: true })).toBeVisible();
  await expect(page.getByText('1 / 20 activities complete', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset position', exact: true }).click();
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: `.impeccable/review/computer-replay-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Keyboard', exact: false }).filter({ hasText: 'Keyboard' }).click();
  await page.getByRole('button', { name: 'Activity 8', exact: true }).click();
  await page.getByLabel('Type here').fill('byte'); await page.getByLabel('Type here').press('Enter');
  await expect(page.locator('.basics-result')).toContainText('You did it!');
  await page.reload();
  await expect(page.getByText('2 / 20 activities complete', { exact: true })).toBeVisible();
});
