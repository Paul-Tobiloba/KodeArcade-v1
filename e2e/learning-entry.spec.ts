import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('choose a course, scope the drawer, and learn a concept only once', async ({ page }, testInfo) => {
  await page.goto('/#/learn');
  await expect(page.getByRole('heading', { name: 'Where shall we begin?' })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/learning-entry-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Explore courses', exact: true }).click();
  await page.getByRole('link', { name: /Grade 2/ }).click();
  await expect(page.getByRole('button', { name: 'Listen to lesson' })).toBeVisible();
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  if (await page.getByRole('button', { name: 'Show modules', exact: true }).count()) await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await page.locator('#module-drawer').getByRole('button', { name: '2 Byte: A different direction', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Listen to challenge' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start challenge', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Listen to challenge' })).toBeVisible();
  await page.getByRole('button', { name: 'Read lesson', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Listen to lesson' })).toBeVisible();
  await page.getByRole('button', { name: 'Show modules', exact: true }).count().then(async count => { if (count) await page.getByRole('button', { name: 'Show modules', exact: true }).click(); });
  await expect(page.locator('#module-drawer')).toContainText('Grade 2');
  await expect(page.locator('#module-drawer')).not.toContainText('Variables');
  await page.locator('#module-drawer').getByRole('button', { name: /Loops/ }).click();
  await expect(page.getByRole('heading', { name: 'Say it once, repeat it with a loop' })).toBeVisible();
  if (await page.getByRole('button', { name: 'Hide modules', exact: true }).count()) await page.getByRole('button', { name: 'Hide modules', exact: true }).click();
  await page.getByRole('link', { name: 'Change course', exact: true }).click();
  await page.getByRole('link', { name: /Computer Explorers New to a computer/ }).click();
  if (await page.getByRole('button', { name: 'Show modules', exact: true }).count()) await page.getByRole('button', { name: 'Show modules', exact: true }).click();
  await expect(page.locator('#module-drawer')).toContainText('Computer Explorers');
  await expect(page.locator('#module-drawer')).not.toContainText('Sequences');
});

test('read-aloud is opt-in, stops on navigation, and handles missing voices', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: string[] = [];
    Object.defineProperty(window, '__speechCalls', { value: calls });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { text: string; constructor(text: string) { this.text = text; } } });
    Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [{ localService: true, lang: 'en-GB', name: 'Test device voice' }], speak: (utterance: { text: string }) => calls.push(utterance.text), cancel: () => calls.push('cancel') } });
  });
  await page.goto('/#/learn/arrows');
  expect(await page.evaluate(() => (window as unknown as { __speechCalls: string[] }).__speechCalls)).toEqual([]);
  await page.getByRole('button', { name: 'Listen to lesson' }).click();
  await expect(page.getByRole('button', { name: 'Stop reading' })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __speechCalls: string[] }).__speechCalls.at(-1))).toContain('An arrow tells Byte');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { __speechCalls: string[] }).__speechCalls.at(-1))).toBe('cancel');
  await page.evaluate(() => { window.speechSynthesis.getVoices = () => []; });
  await page.getByRole('button', { name: 'Listen to challenge' }).click();
  await expect(page.getByText('No English device voice is ready.', { exact: false })).toBeVisible();
});
