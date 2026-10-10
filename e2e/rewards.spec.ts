import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('meadow workspace, star/chime sequence, retry toast and protected best reward', async ({ page }, testInfo) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const audioWindow = window as typeof window & { playedNotes: number[] }; audioWindow.playedNotes = [];
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () { const oscillator = create.call(this); const start = oscillator.start.bind(oscillator); oscillator.start = (when?: number) => { audioWindow.playedNotes.push(oscillator.frequency.value); start(when); }; return oscillator; };
  });
  await page.goto('/#/learn/arrows');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.locator('.blocklyFlyout .blocklyDraggable.ka_arrow_right').click();
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); return document.fonts.ready; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (testInfo.project.name === 'desktop') expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  for (const selector of ['.board', '.blockly-host', '.run-button']) {
    const bounds = await page.locator(selector).boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    if (testInfo.project.name === 'desktop') expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    expect(bounds!.height).toBeGreaterThan(selector === '.run-button' ? 40 : 80);
  }
  expect((await new AxeBuilder({ page }).exclude('.blockly-container').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/rewards-workspace-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).not.toBeVisible();
  await expect(page.locator('.robot-position')).toHaveCSS('--x', '2');
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible();
  await expect(page.locator('.reward-stars .earned')).toHaveCount(5);
  await expect.poll(() => page.evaluate(() => (window as typeof window & { playedNotes: number[] }).playedNotes.length)).toBe(12); // Start 2, move 1, arrival 4, stars 5.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/rewards-success-${testInfo.project.name}.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await page.getByRole('button', { name: 'Clear code', exact: true }).click();
  await page.locator('.blocklyFlyout .blocklyDraggable.ka_arrow_down').click();
  const beforeRetry = await page.locator('.board').boundingBox();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.retry-toast')).toBeVisible();
  expect(await page.locator('.board').boundingBox()).toEqual(beforeRetry);
  await expect(page.getByRole('dialog', { name: 'You made it!' })).not.toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/rewards-retry-${testInfo.project.name}.png`, fullPage: true });
  await expect(page.locator('.retry-toast')).toHaveCount(0, { timeout: 4000 });
  await page.getByText('Last run', { exact: true }).click();
  await expect(page.locator('.run-log p')).toBeVisible();
  await page.getByRole('button', { name: 'Get a hint', exact: true }).click();
  for (let n = 0; n < 3; n++) await page.getByRole('button', { name: 'Show next hint', exact: true }).click();
  await page.getByRole('button', { name: 'Close hints', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['sequences-practice-1'].hints)).toBe(4);
  await page.getByRole('button', { name: 'Clear code', exact: true }).click();
  await page.locator('.blocklyFlyout .blocklyDraggable.ka_arrow_right').click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.reward-stars .earned')).toHaveCount(2);
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByText('How stars work', { exact: true }).click();
  await expect(page.getByText('Best saved: 5 / 5', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['sequences-practice-1'].stars)).toBe(5);
  expect(errors).toEqual([]);
});

test('stopped runs do not count and muted reduced-motion celebrations remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/learn/arrows');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Character sound effects', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.locator('.blocklyFlyout .blocklyDraggable.ka_arrow_right').click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await page.getByRole('button', { name: 'Stop run', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['sequences-practice-1'].attempts)).toBe(0);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.reward-stars .earned')).toHaveCount(5);
  await expect(page.locator('.reward-stars .earned').first()).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeFocused();
});
