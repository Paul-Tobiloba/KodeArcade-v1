import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { ProgressDocument } from '../shared/progress';
import { currentQuizId, moduleQuiz } from '../shared/quizzes';
import { conceptSources, conceptSolutions } from '../src/conceptMissions';
const identity = { learnerId: 'synthetic-concept-pupil', classroomId: 'synthetic-concept-class' };
test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: {} }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
});
for (const scenario of [
  { grade: 3, id: 'grade-3-operators-1', title: 'Operators', keyboard: true },
  { grade: 4, id: 'grade-4-functions-6', title: 'Functions', blocks: true },
  { grade: 5, id: 'grade-5-boolean-6', title: 'Boolean logic' },
  { grade: 6, id: 'grade-6-functions-6', title: 'Functions' },
]) test(`${scenario.grade}: ${scenario.title} concept lab executes, saves and assesses`, async ({ page }, info) => {
  test.setTimeout(60000);
  let value: ProgressDocument = { version: 1, currentId: scenario.id, view: 'challenge', progress: {}, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } }, revision = 0;
  if (scenario.blocks) value.progress[scenario.id] = { blocks: [], complete: false, attempts: 0, hints: 0, codingMode: 'blocks', workspace: { blocks: { languageVersion: 0, blocks: [conceptSolutions[scenario.id]] } } };
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...identity, displayName: 'Sample Concept Learner', classroomName: 'Sample Class', assignments: [{ id: 'sample', courseKey: `grade-${scenario.grade}` }] } }));
  await page.route(`**/api/student/progress/grade-${scenario.grade}`, route => {
    if (route.request().method() === 'POST') { value = route.request().postDataJSON().document; return route.fulfill({ json: { revision: ++revision } }); }
    return route.fulfill({ json: { ...identity, document: value, revision, updatedAt: null } });
  });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`/#/student-play/grade-${scenario.grade}`);
  await expect(page.getByRole('region', { name: `${scenario.title} results lab` })).toBeVisible();
  if (scenario.keyboard) {
    await page.getByText('Build & edit with keyboard', { exact: true }).click();
    for (const type of ['ka_compute_score', 'ka_arithmetic', 'ka_number', 'ka_number']) {
      await page.getByRole('combobox', { name: 'Block type', exact: true }).selectOption(type);
      await page.getByRole('button', { name: 'Add block', exact: true }).click();
    }
    await page.getByLabel('num', { exact: true }).fill('3');
  } else if (!scenario.blocks) await page.getByLabel('Your text program', { exact: true }).fill(conceptSources[scenario.id]);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('dialog')).toContainText('required result');
  await page.getByRole('button', { name: 'Close feedback' }).click();
  await expect.poll(() => value.progress[scenario.id]?.complete).toBe(true);
  await page.reload();
  await expect(page.getByRole('region', { name: `${scenario.title} results lab` })).toBeVisible();
  if (!scenario.keyboard && !scenario.blocks) await expect(page.getByLabel('Your text program', { exact: true })).toHaveValue(conceptSources[scenario.id]);
  await page.getByRole('button', { name: 'Ask Byte', exact: true }).click();
  await page.getByRole('button', { name: 'Explain this topic', exact: true }).click();
  await expect(page.getByRole('log', { name: 'Conversation with Byte' })).toContainText(scenario.title === 'Operators' ? 'operands' : scenario.title === 'Functions' ? 'definition' : 'true or false');
  await page.getByRole('button', { name: 'Close Byte chat' }).click();
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'You made it!' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close feedback' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.concept-stage').include('.concept-keyboard').analyze()).violations).toEqual([]);
  await page.getByRole('region', { name: `${scenario.title} results lab` }).screenshot({ path: `.impeccable/review/concept-${scenario.grade}-${info.project.name}.png` });
  await page.screenshot({ path: `.impeccable/review/concept-full-${scenario.grade}-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Module overview', exact: true }).click();
  const topic = scenario.title === 'Boolean logic' ? 'boolean' : scenario.title.toLowerCase(), quiz = currentQuizId(`grade-${scenario.grade}-${topic}`);
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click();
  for (const [index, question] of moduleQuiz(quiz).entries()) await page.locator('.quiz-question').nth(index).getByRole('radio').nth(question.correct).check();
  await page.getByRole('button', { name: 'Submit quiz' }).click();
  await expect(page.getByRole('heading', { name: 'You answered 5 of 5 correctly' })).toBeVisible();
  await expect.poll(() => value.quizzes?.[quiz]?.attempts).toBe(1);
  expect(errors).toEqual([]);
});
