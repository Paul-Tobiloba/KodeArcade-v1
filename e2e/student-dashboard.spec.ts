import { expect, test } from '@playwright/test';

const student = { learnerId: 'synthetic-learner', classroomId: 'synthetic-class', displayName: 'Sample Student', classroomName: 'Sample Grade 4 Class', assignments: [{ id: 'assignment', courseKey: 'grade-4' }] };
test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: {} }));
  await page.route('**/api/session', route => route.fulfill({ json: null }));
});
test('signed-in dashboard has student navigation, real profile and assigned courses', async ({ page }, info) => {
  await page.route('**/api/student/courses', route => route.fulfill({ json: student }));
  await page.route('**/api/auth/sign-out', route => route.fulfill({ json: { success: true } }));
  await page.goto('/#/student-courses');
  await expect(page.getByRole('heading', { name: 'Welcome, Sample Student!' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Log in|How it works|For parents|Try an activity|Choose another login/ })).toHaveCount(0);
  await expect(page.locator('.account-assigned-course')).toHaveCount(1);
  await expect(page.locator('.account-assigned-course')).toHaveAttribute('href', '/#/student-play/grade-4');
  await page.locator('.student-dashboard img').evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'phone') {
    const lab = page.getByRole('link', { name: 'Open Byte Lab · Grade 4', exact: true });
    await lab.scrollIntoViewIfNeeded();
    const action = await lab.boundingBox();
    expect(action!.height).toBeGreaterThanOrEqual(44);
    expect(action!.y + action!.height).toBeLessThanOrEqual(await page.evaluate(() => innerHeight));
  }
  await page.screenshot({ path: `.impeccable/review/student-dashboard-${info.project.name}.png`, fullPage: true });
  await page.getByLabel('Open account options').click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My profile & settings' })).toBeFocused();
  await expect(page.locator('.student-profile dd').first()).toHaveText(student.displayName);
  await expect(page.getByPlaceholder('What should we call you?')).toHaveCount(0);
  await page.getByLabel('Open account options').click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/student-login/);
});
test('empty assignments and long names remain usable without fabricated progress', async ({ page }) => {
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...student, displayName: 'A very long student name that still belongs to one child', classroomName: 'A very long classroom name with several words', assignments: [] } }));
  await page.goto('/#/student-courses');
  await expect(page.getByRole('heading', { name: 'Your next adventure is on its way' })).toBeVisible();
  await expect(page.locator('.account-assigned-course')).toHaveCount(0);
  await page.getByLabel('Open account options').click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('student dashboard fails closed without leaking a previous profile', async ({ page }) => {
  await page.route('**/api/student/courses', route => route.fulfill({ status: 401, json: { code: 'UNAUTHORIZED' } }));
  await page.goto('/#/student-courses');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.account-assigned-course')).toHaveCount(0);
  await expect(page.getByLabel('Open account options')).toHaveCount(0);
});
