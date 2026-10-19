import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { ProgressDocument } from '../shared/progress';

const identity = { learnerId: 'synthetic-creative-child', classroomId: 'synthetic-creative-class' };
async function fixture(page: Page, grades = [4], home = false) {
  const docs = new Map<number, ProgressDocument>();
  for (const grade of grades) docs.set(grade, { version: 1, currentId: `grade-${grade}-${grade >= 3 ? 'creative-4' : 'sequences-1'}`, view: 'challenge', progress: {}, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } });
  await page.route('**/api/capabilities', r => r.fulfill({ json: {} }));
  await page.route('**/api/session', r => r.fulfill({ json: null }));
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Sample Maker', classroomName: home ? 'Home learning' : 'Sample class', learningContext: home ? 'home' : 'classroom', assignments: grades.map(grade => ({ id: `assignment-${grade}`, courseKey: `grade-${grade}` })) } }));
  await page.route('**/api/student/progress/grade-*', r => {
    const grade = Number(r.request().url().split('-').at(-1));
    if (r.request().method() === 'POST') { docs.set(grade, r.request().postDataJSON().document); return r.fulfill({ json: { revision: 2 } }); }
    return r.fulfill({ json: { ...identity, revision: 1, updatedAt: null, document: docs.get(grade) } });
  });
  return docs;
}

test('dashboard exposes both assigned creative spaces and each link opens the signed-in editor', async ({ page }, info) => {
  const docs = await fixture(page), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/student-courses');
  const nav = page.getByRole('navigation', { name: 'Creative spaces', exact: true });
  await expect(nav.getByRole('link')).toHaveCount(2);
  await expect(nav.getByRole('link', { name: 'Open Byte Lab · Grade 4', exact: true })).toHaveAttribute('href', '/#/student-play/grade-4/lab');
  await expect(nav.getByRole('link', { name: 'Open Drawing & Art · Grade 4', exact: true })).toHaveAttribute('href', '/#/student-play/grade-4/art');
  await page.locator('.student-welcome img').evaluate((image: HTMLImageElement) => image.decode());
  expect((await new AxeBuilder({ page }).include('.student-creative-spaces').analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/dashboard-creative-${info.project.name}.png`, fullPage: true });
  await nav.getByRole('link', { name: 'Open Byte Lab · Grade 4', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'KodeArcade home', exact: true }).click();
  await page.getByRole('link', { name: 'Open Drawing & Art · Grade 4', exact: true }).click();
  await expect(page.locator('.drawing-artboard')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Make it yours', exact: true, level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My projects', exact: true })).toHaveCount(0);
  await expect(page.locator('.tour-card')).toHaveCount(0);
  await expect.poll(() => docs.get(4)?.drawingId).toBe('create');
  await expect.poll(() => docs.get(4)?.view).toBe('drawing');
  await page.getByRole('button', { name: 'Drawing tools', exact: true }).click();
  await page.getByRole('button', { name: 'Teal ink', exact: true }).click();
  await expect.poll(() => docs.get(4)?.drawings.create?.ink).toBe('#08796e');
  await page.getByRole('button', { name: 'Close drawing tools', exact: true }).click();
  await page.reload(); await expect(page.locator('.drawing-artboard')).toBeVisible();
  await page.getByRole('button', { name: 'Drawing tools', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Teal ink', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Close drawing tools', exact: true }).click();
  await page.screenshot({ path: `.impeccable/review/dashboard-art-${info.project.name}.png`, fullPage: false });
  const compactGuide = page.getByRole('button', { name: 'Lesson & instructions', exact: true });
  if (await compactGuide.isVisible()) await compactGuide.click();
  await page.getByRole('button', { name: 'Back to dashboard', exact: true }).click();
  await expect(nav).toBeVisible();
  expect(docs.get(4)?.drawings.create?.ink).toBe('#08796e');
  expect(errors).toEqual([]);
});

test('home learners get grade-scoped choices, younger learners get art only and no assignment grants no entry', async ({ page }) => {
  await fixture(page, [1, 6], true); await page.goto('/#/student-courses');
  const nav = page.getByRole('navigation', { name: 'Creative spaces', exact: true });
  await expect(nav.getByRole('link')).toHaveCount(3);
  await expect(nav.getByRole('link', { name: 'Open Byte Lab · Grade 1', exact: true })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'Open Drawing & Art · Grade 1', exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Open Byte Lab · Grade 6', exact: true })).toBeVisible();
  await nav.getByRole('link', { name: 'Open Drawing & Art · Grade 1', exact: true }).click();
  await expect(page.locator('.drawing-artboard')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Make it yours', exact: true, level: 2 })).toBeVisible();
  await page.goto('/#/student-play/grade-5/art');
  await expect(page.getByRole('heading', { name: 'This activity isn’t available', exact: true })).toBeVisible();
  await expect(page.locator('.drawing-artboard')).toHaveCount(0);
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Sample Maker', classroomName: 'Sample class', assignments: [] } }));
  await page.goto('/#/student-courses');
  await expect(page.getByRole('heading', { name: 'Your next adventure is on its way', exact: true })).toBeVisible();
  await expect(nav).toHaveCount(0);
});

test('direct art ignores stale quiz navigation while ordinary course resume restores the drawing instead of Byte Lab', async ({ page }) => {
  const docs = await fixture(page, [6]);
  docs.get(6)!.view = 'quiz'; docs.get(6)!.quizModuleId = 'grade-6-creative@2';
  await page.goto('/#/student-play/grade-6/art');
  await expect(page.locator('.drawing-artboard')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Make it yours', exact: true, level: 2 })).toBeVisible();
  await expect.poll(() => docs.get(6)?.view).toBe('drawing');
  await page.goto('/#/student-courses');
  await page.locator('.account-assigned-course').click();
  await expect(page.locator('.drawing-artboard')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My projects', exact: true })).toHaveCount(0);
  const compactGuide = page.getByRole('button', { name: 'Lesson & instructions', exact: true });
  if (await compactGuide.isVisible()) await compactGuide.click();
  await expect(page.getByRole('button', { name: 'Back to Build project', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to dashboard', exact: true })).toHaveCount(0);
});
