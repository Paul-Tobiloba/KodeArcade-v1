import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { reportSummary } from '../shared/reports';
import { progressCatalog } from '../shared/progress-catalog';
import type { Family, HomeChild } from '../shared/family';
import type { GradeKey, ProgressDocument } from '../shared/progress';

const id = '743705bd-29c1-424a-b384-f538a7e48c29';
const account = { profile: { name: 'Sample Parent', email: 'parent@example.test' }, workspaces: [{ id, name: 'Our coding adventures', kind: 'family', role: 'parent' }], classes: [] };
function child(name: string, grade: number, done: number): HomeChild {
  const course = `grade-${grade}` as GradeKey, catalog = progressCatalog[course];
  const document: ProgressDocument = { version: 1, currentId: catalog.challenges[done], view: 'challenge', progress: Object.fromEntries(catalog.challenges.slice(0, done).map(id => [id, { blocks: [], attempts: 1, hints: 0, complete: true, stars: 5 }])), drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: true, musicEnabled: false } };
  return { id: name.toLowerCase(), displayName: name, grade, active: true, username: name.toLowerCase(), homeCode: 'ABCDEFGH', loginMethod: grade <= 2 ? 'picture' : 'text', contextId: `home-${name}`, courses: [{ course, ...reportSummary(course, { revision: 1, document, updatedAt: '2026-10-12T10:00:00Z' }), challenges: catalog.challenges.map(id => ({ id, title: catalog.missions.find(m => m.id === id)?.title ?? id, complete: !!document.progress[id], stars: document.progress[id]?.stars ?? 0, attempts: document.progress[id]?.attempts ?? 0, hints: 0 })) }] };
}
let family: Family;
test.beforeEach(async ({ page }) => {
  family = { id, name: 'Our coding adventures', children: [child('Alex', 4, 12), child('Maya', 6, 5), child('Noah', 2, 0)], generatedAt: '2026-10-12T10:00:00Z' };
  await page.route('**/api/capabilities', route => route.fulfill({ json: { adultAccounts: true, classroomLogin: true, classManagement: true, homeLearning: true } }));
  await page.route('**/api/account', route => route.fulfill({ json: account }));
  await page.route('**/api/manage/management/status', route => route.fulfill({ json: { unlockedForSeconds: 300 } }));
  await page.route(`**/api/family/${id}`, route => route.fulfill({ json: family }));
});
test('responsive family selection, report, add-child and course management', async ({ page }, info) => {
  await page.goto('/#/family');
  await expect(page.getByRole('heading', { name: 'Family portal' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alex', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/family-${info.project.name}.png`, fullPage: true });
  await page.screenshot({ path: `.impeccable/review/family-top-${info.project.name}.png` });
  await page.getByRole('button', { name: /Maya Grade 6/ }).click();
  await expect(page.getByRole('heading', { name: 'Maya', exact: true })).toBeVisible();
  await page.getByText('View challenge & quiz results', { exact: true }).click();
  await expect(page.getByRole('table', { name: 'Saved challenge practice' })).toBeVisible();
  await page.getByText('View challenge & quiz results', { exact: true }).click();
  await page.getByRole('button', { name: 'Add child', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add a home learner' })).toBeFocused();
  await page.getByLabel('Child’s name').fill('Sample Child');
  await page.getByRole('combobox', { name: 'Grade', exact: true }).selectOption('4');
  await expect(page.getByRole('combobox', { name: 'Login method', exact: true })).toHaveValue('text');
  await page.getByRole('checkbox').check();
  let body: Record<string, unknown> | undefined;
  await page.route(`**/api/family/${id}/children`, route => { body = route.request().postDataJSON(); family.children.push(child('Sample Child', 4, 0)); return route.fulfill({ contentType: 'application/pdf', body: Buffer.from('%PDF-1.3 synthetic preview') }); });
  await page.evaluate(() => { window.scrollTo(0, 0); });
  await page.screenshot({ path: `.impeccable/review/family-add-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Add child & generate card' }).click();
  await expect(page.getByRole('link', { name: 'Download PDF card' })).toBeVisible();
  expect(body).toMatchObject({ displayName: 'Sample Child', grade: 4, loginMethod: 'text', authority: true });
  await page.getByRole('button', { name: 'I’ve saved the card' }).click();
  await expect(page.getByRole('link', { name: 'Download PDF card' })).toHaveCount(0);
  await page.getByText('Choose courses', { exact: true }).click();
  let saved = false;
  await page.route(`**/api/family/${id}/children/maya/courses`, route => { saved = true; expect(route.request().postDataJSON()).toMatchObject({ previous: ['grade-6'] }); return route.fulfill({ json: { updated: true } }); });
  await page.getByRole('button', { name: 'Save courses', exact: true }).click();
  await expect.poll(() => saved).toBe(true);
});
test('family setup stays separate from a teaching workspace', async ({ page }, info) => {
  await page.route('**/api/account', route => route.fulfill({ json: { ...account, workspaces: [{ id: 'personal', name: 'Teaching', kind: 'teacher_workspace', role: 'teacher' }] } }));
  await page.goto('/#/family');
  await expect(page.getByRole('heading', { name: 'A home for your family’s adventures' })).toBeVisible();
  await page.getByLabel('Family workspace name').fill('Our family');
  await page.getByRole('checkbox').check();
  let posted = false;
  await page.route('**/api/family/setup', route => { posted = true; expect(route.request().postDataJSON()).toEqual({ name: 'Our family', authority: true }); return route.fulfill({ json: { id } }); });
  await page.screenshot({ path: `.impeccable/review/family-setup-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Create family workspace' }).click();
  await expect.poll(() => posted).toBe(true);
});
test('empty family has one clear add action and no fabricated progress', async ({ page }, info) => {
  family.children = [];
  await page.goto('/#/family');
  await expect(page.getByRole('heading', { name: 'Your children (0)' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add child', exact: true })).toHaveCount(1);
  await expect(page.getByText('Their first discovery starts here')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.impeccable/review/family-empty-${info.project.name}.png`, fullPage: true });
});
test('home login submits home scope and leads to resumable child dashboard, not parent tools', async ({ page }, info) => {
  await page.route('**/api/student/classroom', route => { expect(route.request().postDataJSON()).toEqual({ classCode: 'ABCDEFGH', scope: 'home' }); return route.fulfill({ json: { found: true } }); });
  await page.route('**/api/student/login', route => { expect(route.request().postDataJSON()).toMatchObject({ classCode: 'ABCDEFGH', scope: 'home', username: 'noah', method: 'picture', pictures: ['sun', 'moon', 'star', 'flower'] }); return route.fulfill({ json: { signedIn: true } }); });
  const home = child('Noah', 2, 1);
  await page.route('**/api/student/courses', route => route.fulfill({ json: { learnerId: home.id, classroomId: home.contextId, displayName: home.displayName, classroomName: family.name, learningContext: 'home', assignments: home.courses.map(course => ({ id: course.course, courseKey: course.course, progress: course })) } }));
  await page.goto('/#/home-login');
  await expect(page.getByRole('heading', { name: 'Home learner sign in' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.impeccable/review/family-home-login-${info.project.name}.png`, fullPage: true });
  await page.getByLabel('Home code', { exact: true }).fill('ABCDEFGH');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Student username', { exact: true }).fill('noah');
  for (const name of ['Sun', 'Moon', 'Star', 'Flower']) await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: 'Start learning', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your home adventures' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Continue learning/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toHaveCount(0);
  await expect(page.getByText('My home learning', { exact: true })).toBeVisible();
  await page.screenshot({ path: `.impeccable/review/family-child-dashboard-${info.project.name}.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});
test('parent login preserves role through MFA to family portal', async ({ page }) => {
  await page.route('**/api/auth/sign-in/email', route => route.fulfill({ json: { twoFactorRedirect: true } }));
  await page.route('**/api/auth/two-factor/verify-totp', route => route.fulfill({ json: {} }));
  await page.goto('/#/adult-login?role=parent');
  await page.getByLabel('Email address').fill('parent@example.test');
  await page.getByLabel('Password', { exact: true }).fill('synthetic-only-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/#\/two-factor\?role=parent$/);
  await page.getByLabel('Authenticator code').fill('123456');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page).toHaveURL(/#\/family$/);
});

test('home dashboard recovery offers the correct login after an initial failure or expired session', async ({ page }, info) => {
  let unavailable = true;
  await page.route('**/api/student/courses', route => unavailable
    ? route.fulfill({ status: 401, json: { code: 'UNAUTHORIZED' } })
    : route.fulfill({ json: { learnerId: 'noah', classroomId: 'home-noah', displayName: 'Noah', classroomName: family.name, learningContext: 'home', assignments: [] } }));
  await page.goto('/#/student-courses');
  await expect(page.getByRole('link', { name: 'Home learner sign in', exact: true })).toHaveAttribute('href', '/#/home-login');
  await expect(page.getByRole('link', { name: 'Classroom student sign in', exact: true })).toHaveAttribute('href', '/#/student-login');
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.impeccable/review/family-recovery-initial-${info.project.name}.png`, fullPage: true });
  unavailable = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your home adventures' })).toBeVisible();
  unavailable = true;
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByRole('heading', { name: 'Let’s open your dashboard' })).toBeVisible();
  await expect(page.getByText('Check your connection, or ask your parent, guardian or teacher for help.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home learner sign in', exact: true })).toHaveAttribute('href', '/#/home-login');
  await page.screenshot({ path: `.impeccable/review/family-recovery-expired-${info.project.name}.png`, fullPage: true });
  await page.getByRole('link', { name: 'Home learner sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Home learner sign in' })).toBeVisible();
});
