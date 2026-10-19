import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { currentQuizId, moduleQuiz } from '../shared/quizzes';
import type { ProgressDocument } from '../shared/progress';
import { dataSolutions } from '../src/dataMissions';

const identity = { learnerId: 'synthetic-data-learner', classroomId: 'synthetic-data-class' };
function document(currentId: string): ProgressDocument {
  return { version: 1, currentId, view: 'challenge', progress: {}, drawings: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false }, basicsComplete: [], topicRecords: {} };
}
test('merged module removes duplicate navigation across all six grades', async ({ page }) => {
  test.setTimeout(90000);
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: false } }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  for (let grade = 1; grade <= 6; grade++) {
    await page.goto(`/#/learn/grade-${grade}`);
    await page.locator('.tour-card').getByRole('button', { name: 'Skip tour' }).click();
    await page.getByRole('button', { name: 'Show modules', exact: true }).click();
    const modules = page.locator('.module-button');
    await expect(modules).toHaveCount(grade === 1 ? 3 : grade === 2 ? 4 : 13);
    await expect(modules.filter({ hasText: 'Sequences, directions & order' })).toHaveCount(1);
    await expect(modules.filter({ hasText: 'Direction & order' })).toHaveCount(0);
    await expect(modules.filter({ hasText: 'Statements & arguments' })).toHaveCount(grade >= 3 ? 1 : 0);
    await page.getByRole('button', { name: 'Close modules', exact: true }).click();
  }
});

for (const scenario of [
  { grade: 3, id: 'grade-3-statements-1', topic: 'statements', title: 'Statements & arguments', mode: 'keyboard' },
  { grade: 5, id: 'grade-5-lists-4', topic: 'lists', title: 'Lists', mode: 'text' },
  { grade: 6, id: 'grade-6-objects-6', topic: 'objects', title: 'Objects', mode: 'blocks' },
]) test(`Grade ${scenario.grade}: ${scenario.title} executes, saves, resumes and assesses`, async ({ page }, info) => {
  test.setTimeout(60000);
  let value = document(scenario.id), revision = 0;
  if (scenario.mode === 'blocks') value.progress[scenario.id] = { blocks: [], attempts: 0, hints: 0, complete: false, codingMode: 'blocks', workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: dataSolutions[scenario.id] } }] } } };
  await page.route('**/api/capabilities', route => route.fulfill({ json: {} }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...identity, displayName: 'Sample Data Learner', classroomName: 'Sample Class', assignments: [{ id: 'sample', courseKey: `grade-${scenario.grade}` }] } }));
  await page.route(`**/api/student/progress/grade-${scenario.grade}`, route => {
    if (route.request().method() === 'POST') { value = route.request().postDataJSON().document; return route.fulfill({ json: { revision: ++revision } }); }
    return route.fulfill({ json: { ...identity, document: value, revision, updatedAt: null } });
  });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`/#/student-play/grade-${scenario.grade}`);
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
  if (scenario.mode === 'keyboard') {
    await page.locator('.keyboard-tools > summary').click();
    await page.getByLabel('Instruction', { exact: true }).selectOption('ka_move_steps');
    await page.getByRole('button', { name: 'Add block', exact: true }).click();
  } else if (scenario.mode === 'text') {
    await page.getByLabel('Your text program', { exact: true }).fill('steps = [1, 2]\nsteps.append(3)\nmove("right", steps[2])');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'phone' && scenario.mode !== 'text') {
    await expect(page.locator('.data-palette-stacked')).toHaveCount(1);
    const flyout = (await page.locator('.blocklyFlyout:not(.blocklyTrashcanFlyout)').boundingBox())!;
    expect(flyout.height).toBeLessThan(160);
    const readable = page.locator('.program-overview');
    if (await readable.count()) expect((await readable.boundingBox())!.width).toBeGreaterThan(300);
  }
  await page.screenshot({ path: `.impeccable/review/data-workspace-${scenario.topic}-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  // Data assignments and reads are visible trace frames as well as movements.
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 12000 });
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect.poll(() => value.progress[scenario.id]?.complete).toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeVisible();
  if (scenario.mode === 'text') await expect(page.getByLabel('Your text program', { exact: true })).toContainText('steps.append(3)');
  await page.getByRole('button', { name: 'Ask Byte', exact: true }).click();
  await page.getByRole('button', { name: 'Explain this topic', exact: true }).click();
  await expect(page.getByRole('log', { name: 'Conversation with Byte' })).toContainText(scenario.topic === 'lists' ? 'Index 0' : scenario.topic === 'objects' ? 'named properties' : 'Arguments');
  await page.getByRole('button', { name: 'Close Byte chat' }).click();
  await page.getByRole('button', { name: 'Module overview', exact: true }).click();
  await page.getByRole('region', { name: `${scenario.title} end-of-module quiz` }).getByRole('button', { name: 'Start quiz', exact: true }).click();
  const quizId = currentQuizId(`grade-${scenario.grade}-${scenario.topic}`);
  for (const [index, question] of moduleQuiz(quizId).entries()) await page.locator('.quiz-question').nth(index).getByRole('radio').nth(question.correct).check();
  await page.getByRole('button', { name: 'Submit quiz' }).click();
  await expect(page.getByRole('heading', { name: 'You answered 5 of 5 correctly' })).toBeVisible();
  await expect.poll(() => value.quizzes?.[quizId]?.attempts).toBe(1);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'You answered 5 of 5 correctly' })).toBeVisible();
  await page.screenshot({ path: `.impeccable/review/data-${scenario.topic}-${info.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.module-quiz').analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('kodearcade-v1'))).toBeNull();
  expect(errors).toEqual([]);
});
