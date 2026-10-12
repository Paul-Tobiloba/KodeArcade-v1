import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: null }));
});
test('Byte offers local help without bypassing hints, with responsive keyboard access', async ({ page }, info) => {
  let calls = 0; const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/byte/**', route => { calls++; return route.fulfill({ status: 403, json: {} }); });
  await page.goto('/#/learn/grade-2');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  if (info.project.name !== 'desktop') await page.getByRole('button', { name: 'Lesson & instructions', exact: true }).click();
  else await page.locator('.activity-concept > summary').click();
  const summary = page.locator('.byte-help > summary');
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Explain this topic' })).toBeVisible();
  await page.getByRole('button', { name: 'Explain this topic' }).click();
  await expect(page.locator('.byte-answer')).toContainText('sequence is a set of instructions in order');
  await page.getByRole('button', { name: 'What is my task?' }).click();
  await expect(page.locator('.byte-answer')).toContainText('charging station');
  await page.getByRole('button', { name: 'Help check my code' }).click();
  await expect(page.locator('.byte-answer')).toContainText('No instructions are connected');
  await expect(page.getByRole('button', { name: 'Reveal first hint' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['grade-2-sequences-1'].hints)).toBe(0);
  expect(calls).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await summary.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `.impeccable/review/byte-help-${info.project.name}.png`, fullPage: true });
  const accessibility = await new AxeBuilder({ page }).include('.byte-help').analyze(); expect(accessibility.violations).toEqual([]);
  await page.getByRole('button', { name: 'Reveal first hint' }).click();
  await expect(page.locator('.hint-current')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['grade-2-sequences-1'].hints)).toBe(1);
  expect(errors).toEqual([]);
});

test('adult lab is visibly disabled by default and never submits on load', async ({ page }, info) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: true } }));
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Teacher', email: 'teacher@example.test', emailVerified: true }, workspaces: [], classes: [] } }));
  let generations = 0;
  await page.route('**/api/byte/pilot', route => { if (route.request().method() === 'POST') generations++; return route.fulfill({ json: { enabled: false, allowed: false } }); });
  await page.goto('/#/byte-lab');
  await expect(page.getByRole('heading', { name: 'AI testing is switched off' })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  expect(generations).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `.impeccable/review/byte-lab-off-${info.project.name}.png`, fullPage: true });
});

test('drawing receives its own explanation rather than movement-route help', async ({ page }, info) => {
  await page.goto('/#/learn/grade-1');
  await page.getByRole('button', { name: 'Open drawing lab' }).click();
  if (info.project.name !== 'desktop') await page.getByRole('button', { name: 'Lesson & instructions', exact: true }).click();
  await page.locator('.byte-help > summary').click();
  await page.getByRole('button', { name: 'Explain this topic' }).click();
  await expect(page.locator('.byte-answer')).toContainText('pencil’s arrow');
  await expect(page.locator('.byte-answer')).not.toContainText('charging station');
});

test('private lab handles synthetic results, cancellation and network failure without persistence', async ({ page }, info) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: true } }));
  await page.route('**/api/account', route => route.fulfill({ json: { profile: { name: 'Sample Teacher', email: 'teacher@example.test' }, workspaces: [], classes: [] } }));
  let mode: 'ok' | 'slow' | 'error' = 'ok';
  await page.route('**/api/byte/pilot', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { enabled: true, allowed: true } });
    expect(Object.keys(route.request().postDataJSON()).sort()).toEqual(['question', 'topic']);
    if (mode === 'slow') { await new Promise(resolve => setTimeout(resolve, 500)); return route.fulfill({ json: { kind: 'answer', answer: 'Stale coding response should not appear.' } }).catch(() => undefined); }
    if (mode === 'error') return route.fulfill({ status: 503, json: { error: 'private details' } });
    return route.fulfill({ json: { kind: 'answer', answer: 'A loop repeats its instructions the number of times you choose.' } });
  });
  await page.goto('/#/byte-lab');
  await page.getByLabel('Test question').fill('Why does a coding loop need a count?');
  await page.getByRole('button', { name: 'Test explanation' }).click();
  await expect(page.getByRole('heading', { name: 'Experimental AI response' })).toBeVisible();
  if (info.project.name === 'desktop') { await page.evaluate(() => document.fonts.ready); await page.screenshot({ path: '.impeccable/review/byte-lab-result-desktop.png', fullPage: true }); }
  mode = 'slow'; await page.getByRole('button', { name: 'Test explanation' }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Test explanation' })).toBeEnabled();
  await expect(page.getByText('Stale coding response should not appear.')).toHaveCount(0);
  mode = 'error'; await page.getByRole('button', { name: 'Test explanation' }).click();
  await expect(page.getByRole('alert')).toContainText('Byte could not answer');
  await expect(page.getByText('private details')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('Why does a coding loop');
});
