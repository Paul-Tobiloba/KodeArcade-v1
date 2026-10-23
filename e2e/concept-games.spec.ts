import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { conceptSources } from '../src/conceptMissions';
import type { ProgressDocument } from '../shared/progress';

async function openGame(page: Page, id: string) {
  const identity = { learnerId: 'synthetic-game-learner', classroomId: 'synthetic-game-class' };
  let document: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { blocks: [], complete: false, attempts: 0, hints: 0, codingMode: 'text', textCode: conceptSources[id], lessonSeen: true } }, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } };
  let revision = 0;
  await page.route('**/api/capabilities', route => route.fulfill({ json: {} }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...identity, displayName: 'Sample Game Learner', classroomName: 'Sample Class', assignments: [{ id: 'game-course', courseKey: 'grade-5' }] } }));
  await page.route('**/api/student/progress/grade-5', route => {
    if (route.request().method() === 'POST') { document = route.request().postDataJSON().document; return route.fulfill({ json: { revision: ++revision } }); }
    return route.fulfill({ json: { ...identity, document, revision, updatedAt: null } });
  });
  await page.goto('/#/student-play/grade-5');
  await expect(page.locator('.concept-stage')).toBeVisible({ timeout: 20000 });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.querySelectorAll<HTMLImageElement>('.concept-stage img')].map(image => image.decode().catch(() => {}))); });
  await expect(page.getByText('Saved to your account', { exact: true })).toBeVisible();
  return () => document;
}

async function finish(page: Page) {
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close feedback', exact: true }).click();
}

for (const scenario of [
  { id: 'grade-5-operators-1', game: 'rescue-islands', heading: 'Rescue Islands' },
  { id: 'grade-5-boolean-3', game: 'secret-gates', heading: 'Secret Gates' },
  { id: 'grade-5-functions-3', game: 'robot-workshop', heading: 'Robot Workshop' },
]) test(`${scenario.heading}: ready, real code, Results, reset and private save`, async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const saved = await openGame(page, scenario.id);
  const stage = page.locator('.concept-stage');
  await expect(stage.getByRole('heading', { name: scenario.heading, exact: true })).toBeVisible();
  await expect(stage.locator('.concept-result-area')).not.toBeVisible();
  const picture = await stage.locator('.concept-game-world').boundingBox();
  expect(picture!.height).toBeGreaterThan(250);
  expect(await stage.locator('.concept-world-art').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(1000);
  await page.screenshot({ path: `.impeccable/review/concept-game-${scenario.game}-${info.project.name}-ready.png`, fullPage: true });
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1309, height: 700 });
    await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/concept-game-${scenario.game}-user-1309.png`, fullPage: true });
  }
  await finish(page);
  if (scenario.game === 'rescue-islands') {
    await expect(stage.locator('.concept-plank[data-built=true]')).toHaveCount(5);
    await expect(stage.locator('.concept-byte')).toHaveAttribute('data-crossed', 'true');
  } else if (scenario.game === 'secret-gates') {
    await expect(stage.locator('.concept-gate-doors')).toHaveAttribute('data-open', 'true');
    await expect(stage.locator('.concept-switch[data-state=true]')).toHaveCount(2);
  } else {
    await expect(stage.locator('.concept-machine-name')).toHaveText('double');
    await expect(stage.locator('.input-label')).toHaveText('Input: 3');
    await expect(stage.locator('.output-label')).toHaveText('Output: 6');
  }
  await expect.poll(() => saved().progress[scenario.id]?.complete).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `.impeccable/review/concept-game-${scenario.game}-${info.project.name}-complete.png`, fullPage: true });
  const results = stage.locator('.concept-results>summary');
  await results.focus(); await page.keyboard.press('Enter');
  await expect(stage.locator('.concept-result-area')).toBeVisible();
  await expect(stage.locator('.concept-result-area')).toContainText('required result');
  await page.keyboard.press('Escape');
  await expect(stage.locator('.concept-result-area')).not.toBeVisible();
  await expect(results).toBeFocused();
  expect((await new AxeBuilder({ page }).include('.concept-stage').analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Reset results', exact: true }).click();
  await expect(stage.locator('.concept-game-status')).toContainText('Build your code');
  if (scenario.game === 'rescue-islands') await expect(stage.locator('.concept-plank[data-built=true]')).toHaveCount(0);
  if (scenario.game === 'secret-gates') await expect(stage.locator('.concept-gate-doors')).toHaveAttribute('data-open', 'false');
  if (scenario.game === 'robot-workshop') await expect(stage.locator('.output-label')).toHaveText('Target: 6');
  await expect(page.getByLabel('Your text program', { exact: true })).toHaveValue(conceptSources[scenario.id]);
  await page.reload();
  await expect(page.getByLabel('Your text program', { exact: true })).toHaveValue(conceptSources[scenario.id]);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('kodearcade-v1'))).toBeNull();
});

test('bridge distinguishes incorrect arithmetic, extra planks and a literal-only answer', async ({ page }) => {
  await openGame(page, 'grade-5-operators-1');
  const editor = page.getByLabel('Your text program', { exact: true }), stage = page.locator('.concept-stage');
  for (const [code, count, message] of [['score = 2 + 1', 3, '2 more planks'], ['score = 2 + 5', 5, '2 extra planks'], ['score = 5', 5, 'Use the instructions']] as const) {
    await editor.fill(code); await page.getByRole('button', { name: 'Run code', exact: true }).click();
    await expect(stage.locator('.concept-plank[data-built=true]')).toHaveCount(count);
    await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
    await expect(stage.locator('.concept-byte')).toHaveAttribute('data-crossed', 'false');
    await expect(stage.locator('.concept-scene-message')).toContainText(message);
    await expect(page.getByRole('dialog', { name: 'You made it!' })).toHaveCount(0);
  }
});

test('correct False keeps the gate closed; a skipped input is not presented as evaluated', async ({ page }) => {
  await openGame(page, 'grade-5-boolean-2');
  await finish(page);
  await expect(page.locator('.concept-gate-doors')).toHaveAttribute('data-open', 'false');
  await expect(page.locator('.concept-scene-message')).toContainText('False is the right answer');
  await page.getByRole('button', { name: /Challenge 3:/ }).click();
  await expect(page.locator('.concept-stage .goal')).toContainText('Use AND');
  await page.getByLabel('Your text program', { exact: true }).fill('show_boolean(False and (3 > 2))');
  await expect(page.getByLabel('Your text program', { exact: true })).toHaveValue('show_boolean(False and (3 > 2))');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.concept-game-status')).toContainText('Output false');
  await expect(page.locator('.switch-1')).toHaveAttribute('data-state', 'skipped');
  await expect(page.locator('.switch-1')).toContainText('Not evaluated');
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
});

test('definitions do not fabricate calls or output and a stopped run resets cleanly', async ({ page }) => {
  await openGame(page, 'grade-5-functions-1');
  const editor = page.getByLabel('Your text program', { exact: true });
  await editor.fill('def my_action():\n    show_number(2)');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.concept-scene-badge')).toContainText('Calls: 0');
  await expect(page.locator('.concept-machine-event')).toContainText('is defined');
  await expect(page.locator('.output-label')).toHaveText('Target: 2');
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
  await editor.fill(`def my_action():\n    show_number(2)\n${Array.from({ length: 8 }, () => 'my_action()').join('\n')}`);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await page.getByRole('button', { name: 'Stop run', exact: true }).click();
  await page.getByRole('button', { name: 'Reset results', exact: true }).click();
  await expect(page.locator('.concept-scene-badge')).toContainText('Calls: 0');
  await expect(page.locator('.concept-machine-event')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toHaveCount(0);
});

test('scene resize and reduced-motion retain real state without active animations', async ({ page }, info) => {
  await openGame(page, 'grade-5-boolean-3');
  await finish(page);
  const leaves = page.locator('.gate-leaf');
  expect(await leaves.first().evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  if (info.project.name === 'desktop') {
    const divider = page.getByRole('separator', { name: 'Resize stage and coding area', exact: true });
    await divider.focus(); await page.keyboard.press('Home');
    await expect(page.locator('.concept-game-world')).toBeVisible();
    await page.keyboard.press('End');
    await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeInViewport();
    await page.keyboard.press('Enter');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await leaves.first().evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await expect(page.locator('.concept-gate-doors')).toHaveAttribute('data-open', 'true');
});
