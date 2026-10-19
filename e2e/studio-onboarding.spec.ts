import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { ProgressDocument } from '../shared/progress';
import { newStudioProject, saveStudioProject, type StudioProject } from '../src/studioProject';
import { studioStarterProject } from '../src/studioStarters';
import type { StudioGallery } from '../shared/studioGallery';
const id = 'grade-6-creative-4';
async function fixture(page: Page, project = newStudioProject()) {
  const identity = { learnerId: 'synthetic-starter-child', classroomId: 'synthetic-starter-class' };
  let value: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { blocks: [], complete: false, attempts: 0, hints: 0, workspace: saveStudioProject(project) } }, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } }, revision = 0;
  await page.route('**/api/capabilities', r => r.fulfill({ json: {} }));
  await page.route('**/api/session', r => r.fulfill({ json: null }));
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Sample Learner', classroomName: 'Sample Class', assignments: [{ id: 'sample', courseKey: 'grade-6' }] } }));
  await page.route('**/api/student/progress/grade-6', r => {
    if (r.request().method() === 'POST') { value = r.request().postDataJSON().document; return r.fulfill({ json: { revision: ++revision } }); }
    return r.fulfill({ json: { ...identity, revision, document: value, updatedAt: null } });
  });
  return { project: () => { const gallery = value.progress[id]?.workspace?.byteStudioGallery as StudioGallery | undefined; return gallery?.projects.find(p => p.id === gallery.activeId)?.project ?? value.progress[id]?.workspace?.byteStudio as StudioProject; }, gallery: () => value.progress[id]?.workspace?.byteStudioGallery as StudioGallery, progress: () => value.progress[id] };
}
test('first-use chooser creates real editable story code, skips once and preserves account saves', async ({ page }, info) => {
  const saved = await fixture(page), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/student-play/grade-6/lab');
  await expect(page.getByRole('heading', { name: 'What will you make?' })).toBeVisible();
  for (const title of ['Space friends', 'Arrow-key adventure', 'Bounce around']) await expect(page.getByRole('button', { name: `Start ${title}`, exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).include('.studio-start').analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/studio-starters-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Start Space friends', exact: true }).click();
  const tour = page.getByRole('dialog', { name: 'Bring your project to life' }); await expect(tour).toBeVisible();
  await expect(page.locator('.studio-code .blocklySvg')).toBeVisible();
  await expect.poll(() => saved.project().onboarding).toBe('started');
  await page.screenshot({ path: `.impeccable/review/studio-tour-${info.project.name}.png`, fullPage: true });
  expect(await tour.evaluate(n => n.scrollHeight <= n.clientHeight + 1)).toBe(true);
  await tour.getByRole('button', { name: 'Skip tour' }).click();
  await expect.poll(() => saved.project().onboarding).toBe('skipped');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.locator('.studio-speech').filter({ hasText: 'Hi, Dash!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Click Dash sprite', exact: true }).click();
  await expect(page.locator('.studio-speech').filter({ hasText: 'Make up our next line!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
  await page.reload(); await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Space friends');
  await expect(page.locator('.tour-card')).toHaveCount(0); await expect(page.getByRole('heading', { name: 'What will you make?' })).toHaveCount(0);
  expect(saved.progress()).toMatchObject({ complete: false, attempts: 0 }); expect(saved.progress().stars).toBeUndefined();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(errors).toEqual([]);
});
test('tour replays from Help, completes all steps and keeps full-height content beside its target', async ({ page }) => {
  const project = studioStarterProject('keyboard'); project.onboarding = 'skipped'; const saved = await fixture(page, project);
  await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('button', { name: 'Byte Lab help' }).click(); await page.getByRole('button', { name: 'Replay Byte Lab tour' }).click();
  const titles = ['Bring your project to life', 'Choose who you are coding', 'Change one thing', 'Make it look like yours', 'Keep your creation'];
  for (let i = 0; i < titles.length; i++) {
    const tour = page.getByRole('dialog', { name: titles[i] }); await expect(tour).toBeVisible();
    await expect(tour).toHaveAttribute('data-placement', /.+/);
    expect(await tour.evaluate(n => !['auto', 'scroll'].includes(getComputedStyle(n).overflowY) && n.lastElementChild!.getBoundingClientRect().bottom <= n.getBoundingClientRect().bottom)).toBe(true);
    const card = (await tour.boundingBox())!; expect(card.x).toBeGreaterThanOrEqual(0); expect(card.x + card.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    expect((await new AxeBuilder({ page }).include('.tour-card').analyze()).violations).toEqual([]);
    await tour.getByRole('button', { name: i === titles.length - 1 ? 'Start exploring' : 'Next', exact: true }).click();
  }
  await expect(page.locator('.tour-card')).toHaveCount(0); await expect.poll(() => saved.project().onboarding).toBe('completed');
  await expect(page.getByRole('button', { name: 'Byte Lab help' })).toBeFocused();
  await page.reload(); await expect(page.locator('.tour-card')).toHaveCount(0);
});
test('new starters preserve the older project and load their own native blocks', async ({ page }) => {
  const project = studioStarterProject('story'); project.title = 'Keep my story'; project.onboarding = 'completed'; const saved = await fixture(page, project);
  await page.goto('/#/student-play/grade-6/lab'); await expect(page.locator('.tour-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.getByRole('button', { name: 'Close starter projects', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Keep my story'); expect(saved.project().title).toBe('Keep my story');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.getByRole('button', { name: 'Start Bounce around', exact: true }).click();
  await expect.poll(() => saved.gallery()?.projects.length).toBe(2); expect(saved.gallery().projects[0].project.title).toBe('Keep my story');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Bounce around');
  await expect(page.locator('.studio-code .blocklySvg').getByText('forever', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run', exact: true }).click(); await expect(page.locator('.studio-speech')).toContainText('Bounce!');
  await page.getByRole('button', { name: 'Stop', exact: true }).click(); await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
  await expect.poll(() => saved.project().starter).toBe('bounce'); expect(saved.project().onboarding).toBe('completed');
  await page.reload(); await expect(page.locator('.tour-card')).toHaveCount(0);
});
test('unfinished tour resumes and the keyboard starter works with on-screen arrow buttons', async ({ page }) => {
  const project = studioStarterProject('keyboard'); project.onboarding = 'started'; const saved = await fixture(page, project);
  await page.goto('/#/student-play/grade-6/lab'); await page.getByRole('button', { name: 'Skip tour' }).click();
  await page.getByRole('button', { name: 'Run', exact: true }).click(); await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Move right', exact: true }).click(); await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
  const actor = page.getByRole('button', { name: 'Click Dash sprite', exact: true });
  await expect(actor).toHaveAttribute('style', /left: 53\.5%/);
  expect(saved.project().sprites[0].x).toBe(0); // Runtime movement never rewrites authored starting positions.
});

test('pre-onboarding saved work is preserved and blank projects are an explicit choice', async ({ page }) => {
  const project = studioStarterProject('story'); delete project.starter; project.title = 'Older private work';
  const saved = await fixture(page, project); await page.goto('/#/student-play/grade-6/lab');
  await expect(page.getByRole('heading', { name: 'What will you make?' })).toHaveCount(0);
  await expect(page.locator('.tour-card')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Older private work');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.getByRole('button', { name: 'Start with a blank project', exact: true }).click();
  await expect.poll(() => saved.gallery()?.projects.length).toBe(2);
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Untitled project');
  await expect(page.locator('.studio-code')).toBeVisible();
  await expect.poll(() => saved.project().onboarding).toBe('skipped'); expect(saved.project().sprites).toHaveLength(1);
  await page.reload(); await expect(page.locator('.studio-code')).toBeVisible(); await expect(page.getByRole('heading', { name: 'What will you make?' })).toHaveCount(0);
});
