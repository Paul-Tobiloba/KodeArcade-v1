import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: false } }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.route('**/api/auth/get-session', route => route.fulfill({ json: null }));
});

test('activity widget uses the allowlisted adult pilot, keeps code checks local and cancels stale replies', async ({ page }) => {
  const now = Date.now(); let mode: 'ok' | 'slow' | 'error' = 'ok', calls = 0;
  await page.route('**/api/session', route => route.fulfill({ json: { user: { id: 'adult', name: 'Sample Adult', principalKind: 'adult' }, sessionKey: 'sample', lastActiveAt: now, expiresAt: now + 3600_000 } }));
  await page.route('**/api/session/activity', route => route.fulfill({ json: { active: true } }));
  await page.route('**/api/byte/pilot', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { enabled: true, allowed: true } });
    calls++; expect(Object.keys(route.request().postDataJSON()).sort()).toEqual(['question', 'topic']);
    if (mode === 'slow') { await new Promise(resolve => setTimeout(resolve, 500)); return route.fulfill({ json: { answer: 'Stale coding reply.' } }).catch(() => undefined); }
    if (mode === 'error') return route.fulfill({ status: 503, json: { error: 'private gateway details' } });
    return route.fulfill({ json: { answer: 'Synthetic pilot hint: check your loop count.' } });
  });
  await page.goto('/#/learn/grade-2'); await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.locator('.byte-launch').click(); await expect(page.locator('.byte-chat')).toContainText('adult tester only');
  await page.getByLabel('Your coding question').fill('Why does my coding loop need a count?');
  await page.locator('.byte-chat button[type=submit]').click(); await expect(page.locator('.byte-transcript')).toContainText('Synthetic pilot hint');
  await expect(page.locator('.byte-starters')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear chat' }).click();
  await page.getByRole('button', { name: 'Help check my code' }).click(); expect(calls).toBe(1);
  mode = 'slow'; await page.getByLabel('Your coding question').fill('How do I check the coding loop count?');
  await page.locator('.byte-chat button[type=submit]').click(); await page.getByRole('button', { name: 'Cancel reply' }).click();
  await expect(page.getByLabel('Your coding question')).toBeEnabled(); await expect(page.getByText('Stale coding reply.')).toHaveCount(0);
  mode = 'error'; await page.getByLabel('Your coding question').fill('How does a coding loop repeat?');
  await page.locator('.byte-chat button[type=submit]').click(); await expect(page.locator('.byte-chat [role=alert]')).toContainText('on-device lesson help');
  await expect(page.locator('.byte-chat')).not.toContainText('private gateway details');
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('Why does my coding loop');
});
test('Byte offers local help without bypassing hints, with responsive keyboard access', async ({ page }, info) => {
  let calls = 0; const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/byte/**', route => { calls++; return route.fulfill({ status: 403, json: {} }); });
  await page.goto('/#/learn/grade-2');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  if (info.project.name !== 'desktop') await page.getByRole('button', { name: 'Lesson & instructions', exact: true }).click();
  else await page.locator('.activity-concept > summary').click();
  const summary = page.locator('.byte-launch');
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Explain this topic' })).toBeVisible();
  await page.getByRole('button', { name: 'Explain this topic' }).click();
  await expect(page.locator('.byte-transcript')).toContainText('sequence is a set of instructions in order');
  await expect(page.locator('.byte-starters')).toHaveCount(0);
  await expect(page.getByLabel('Your coding question')).toBeFocused();
  await page.getByRole('button', { name: 'Clear chat' }).click();
  await expect(page.locator('.byte-starters button')).toHaveCount(3);
  await page.getByRole('button', { name: 'What is my task?' }).click();
  await expect(page.locator('.byte-transcript')).toContainText('charging station');
  await expect(page.locator('.byte-starters')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear chat' }).click();
  await page.getByRole('button', { name: 'Help check my code' }).click();
  await expect(page.locator('.byte-transcript')).toContainText('No instructions are connected');
  await expect(page.getByRole('button', { name: 'Reveal first hint' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['grade-2-sequences-1'].hints)).toBe(0);
  await page.getByLabel('Your coding question').fill('Why does my loop repeat too many times?');
  await page.locator('.byte-chat button[type=submit]').click();
  await expect(page.locator('.byte-transcript')).toContainText('Repeat 3 times');
  await page.getByLabel('Your coding question').fill('Tell me about the weather');
  await page.locator('.byte-chat button[type=submit]').click();
  await expect(page.locator('.byte-transcript')).toContainText('I help with coding');
  expect(calls).toBe(0);
  const layout = await page.locator('.byte-chat').evaluate(panel => {
    const log = panel.querySelector('.byte-transcript')!, form = panel.querySelector('form')!;
    return { height: panel.clientHeight, conversationHeight: log.clientHeight, nestedScroll: panel.scrollHeight > panel.clientHeight + 1, composerBottom: form.getBoundingClientRect().bottom, bottom: panel.getBoundingClientRect().bottom };
  });
  expect(layout.conversationHeight).toBeGreaterThan(layout.height * .4);
  expect(layout.nestedScroll).toBe(false);
  expect(layout.composerBottom).toBeLessThan(layout.bottom);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/byte-chat-${info.project.name}.png`, fullPage: true });
  const accessibility = await new AxeBuilder({ page }).include('.byte-chat').analyze(); expect(accessibility.violations).toEqual([]);
  await page.getByRole('button', { name: 'Close Byte chat' }).click();
  await expect(page.locator('.byte-launch')).toBeFocused();
  await page.getByRole('button', { name: 'Reveal first hint' }).click();
  await expect(page.locator('.hint-current')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kodearcade-v1')!).progress['grade-2-sequences-1'].hints)).toBe(1);
  expect(errors).toEqual([]);
});

test('Byte keeps the composer visible in short windows and scrolls only the conversation', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Short-window check supplements the three device layouts.');
  await page.setViewportSize({ width: 1024, height: 438 });
  await page.goto('/#/learn/grade-2');
  await page.getByRole('button', { name: 'Start challenge', exact: true }).click();
  await page.locator('.byte-launch').click();
  await page.getByRole('button', { name: 'Explain this topic' }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByLabel('Your coding question').fill('Why does my loop repeat too many times?');
    await page.locator('.byte-chat button[type=submit]').click();
  }
  const dimensions = await page.locator('.byte-chat').evaluate(panel => {
    const log = panel.querySelector('.byte-transcript')!;
    return { top: panel.getBoundingClientRect().top, bottom: panel.getBoundingClientRect().bottom, viewport: innerHeight, panelOverflow: panel.scrollHeight > panel.clientHeight + 1, transcriptHeight: log.clientHeight, transcriptOverflow: log.scrollHeight > log.clientHeight };
  });
  expect(dimensions.top).toBeGreaterThanOrEqual(0);
  expect(dimensions.bottom).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.panelOverflow).toBe(false);
  expect(dimensions.transcriptHeight).toBeGreaterThan(120);
  expect(dimensions.transcriptOverflow).toBe(true);
  await expect(page.locator('.byte-starters')).toHaveCount(0);
  await expect(page.getByLabel('Your coding question')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Clear chat' })).toBeInViewport();
  await page.screenshot({ path: '.impeccable/review/byte-chat-short-desktop.png' });
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
  await page.locator('.byte-launch').click();
  await page.getByRole('button', { name: 'Explain this topic' }).click();
  await expect(page.locator('.byte-transcript')).toContainText('pencil’s arrow');
  await expect(page.locator('.byte-transcript')).not.toContainText('charging station');
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
