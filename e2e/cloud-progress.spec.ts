import { expect, test } from '@playwright/test';
import type { ProgressDocument } from '../shared/progress';
const identity = { learnerId: 'synthetic-learner', classroomId: 'synthetic-class' };
const recovery = { key: Buffer.from('12345678901234567890123456789012').toString('base64'), slot: 'synthetic-recovery', owner: 'synthetic-owner' };
// These scenarios exercise saves after onboarding, not the workspace tour.
const document = (): ProgressDocument => ({ version: 1, currentId: 'grade-5-sequences-1', view: 'challenge', progress: { 'grade-5-sequences-1': { attempts: 0, hints: 0, blocks: [], complete: false, workspaceTour: 'completed' } }, drawings: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false }, basicsComplete: [], topicRecords: {} });
test.beforeEach(async ({ page }) => {
  await page.route('**/api/capabilities', route => route.fulfill({ json: {} }));
  await page.route('**/api/student/courses', route => route.fulfill({ json: { ...identity, displayName: 'Sample Student', classroomName: 'Sample Class', assignments: [{ id: 'assignment', courseKey: 'grade-5' }] } }));
});
test('failed load does not open an empty editor over saved work', async ({ page }) => {
  await page.route('**/api/student/progress/grade-5', route => route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } }));
  await page.goto('/#/student-play/grade-5');
  await expect(page.getByRole('heading', { name: 'Your progress could not be loaded' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.locator('.blocklyWorkspace')).toHaveCount(0);
});

test('save feedback slides away without moving content and returns for the next save', async ({ page }, info) => {
  let fail = false;
  const value = document();
  value.preferences.reducedMotion = false;
  await page.route('**/api/student/progress/grade-5', route => route.request().method() === 'GET'
    ? route.fulfill({ json: { ...identity, recovery, revision: 1, document: value, updatedAt: null } })
    : route.fulfill({ status: fail ? 503 : 200, json: fail ? { code: 'UNAVAILABLE' } : { revision: 2 } }));
  await page.goto('/#/student-play/grade-5');
  const feedback = page.locator('.student-cloud-status');
  const workspace = page.locator('#workspace');
  await expect(page.getByText('Saved to your account', { exact: true })).toBeVisible();
  const top = (await workspace.boundingBox())!.y;
  await page.screenshot({ path: `.impeccable/review/save-feedback-${info.project.name}.png`, fullPage: true });
  await expect(feedback).toBeHidden({ timeout: 5000 });
  expect((await workspace.boundingBox())!.y).toBe(top);
  await page.screenshot({ path: `.impeccable/review/save-hidden-${info.project.name}.png`, fullPage: true });
  const editor = page.getByRole('textbox');
  await editor.fill('move_right()');
  await expect(page.getByText('Saved to your account', { exact: true })).toBeVisible();
  await expect(editor).toBeFocused();
  await expect(feedback).toBeHidden({ timeout: 5000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  fail = true;
  await editor.fill('move_left()');
  await expect(page.getByRole('button', { name: 'Retry save' })).toBeVisible();
  await page.waitForTimeout(3500);
  await expect(page.getByRole('button', { name: 'Retry save' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry save' }).click();
  await page.screenshot({ path: `.impeccable/review/save-error-${info.project.name}.png`, fullPage: true });
  fail = false;
  await page.getByRole('button', { name: 'Retry save' }).click();
  await expect(page.getByText('Saved to your account', { exact: true })).toBeVisible();
  await expect(feedback).toHaveCSS('transform', 'none');
  await expect(feedback).toHaveCSS('transition-duration', '0s');
});
test('failed save retains work and retry gets a server acknowledgement', async ({ page }) => {
  let available = false, saved: ProgressDocument | undefined;
  await page.route('**/api/student/progress/grade-5', route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { ...identity, revision: 1, document: document(), updatedAt: new Date().toISOString() } });
    if (!available) return route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
    saved = route.request().postDataJSON().document;
    return route.fulfill({ json: { revision: 2 } });
  });
  await page.goto('/#/student-play/grade-5');
  await page.getByRole('textbox').fill('move_right()');
  await expect(page.getByRole('button', { name: 'Retry save' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download unsaved work' })).toBeVisible();
  available = true;
  await page.getByRole('button', { name: 'Retry save' }).click();
  await expect(page.getByText('Saved to your account', { exact: true })).toBeVisible();
  expect(saved?.currentId).toBe('grade-5-sequences-1');
});
test('conflicting tab cannot silently overwrite newer saved work', async ({ page }) => {
  await page.route('**/api/student/progress/grade-5', route => route.request().method() === 'GET'
    ? route.fulfill({ json: { ...identity, revision: 1, document: document(), updatedAt: new Date().toISOString() } })
    : route.fulfill({ status: 409, json: { code: 'PROGRESS_CONFLICT' } }));
  await page.goto('/#/student-play/grade-5');
  await page.getByRole('textbox').fill('move_right()');
  await expect(page.getByText('Another tab saved newer work. Your changes have not overwritten it.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload saved version' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download unsaved work' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry save' })).toHaveCount(0);
});
test('drawing activity and typed code restore from cloud without using public preview', async ({ page }) => {
  const value = document();
  value.view = 'drawing'; value.drawingId = 'hexagon';
  value.drawings.hexagon = { attempts: 2, complete: true, stars: 4, mode: 'text', code: 'forward(37)\nturn(60)', ink: '#08796e', width: 6 };
  await page.route('**/api/student/progress/grade-5', route => route.request().method() === 'GET'
    ? route.fulfill({ json: { ...identity, revision: 3, document: value, updatedAt: new Date().toISOString() } })
    : route.fulfill({ json: { revision: 4 } }));
  await page.goto('/#/student-play/grade-5');
  await expect(page.getByRole('region', { name: 'Dash drawing challenge' })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue('forward(37)\nturn(60)');
  expect(await page.evaluate(() => localStorage.getItem('kodearcade-v1'))).toBeNull();
});
test('encrypted unsynced work survives refresh and reconnects without public storage', async ({ page }, info) => {
  let available = false, saved: ProgressDocument | undefined;
  await page.route('**/api/student/progress/grade-5', route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { ...identity, recovery, revision: 1, document: document(), updatedAt: null } });
    if (!available) return route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } });
    saved = route.request().postDataJSON().document;
    return route.fulfill({ json: { revision: 2 } });
  });
  await page.goto('/#/student-play/grade-5');
  await page.getByRole('textbox').fill('move_left()');
  await expect(page.getByText(/An encrypted recovery copy is saved on this device/)).toBeVisible();
  const disk = await page.evaluate(() => JSON.stringify(localStorage));
  expect(disk).not.toContain('move_left'); expect(disk).not.toContain(recovery.key); expect(disk).not.toContain('synthetic-learner');
  page.on('dialog', dialog => dialog.accept());
  await page.reload();
  await expect(page.getByRole('textbox')).toHaveValue('move_left()');
  await expect(page.getByText('Recovered your unsaved work from this device.')).toBeVisible();
  await page.locator('.student-cloud-status').screenshot({ path: `.impeccable/review/workflows-recovery-${info.project.name}.png` });
  available = true; await page.evaluate(() => dispatchEvent(new Event('online')));
  await expect(page.getByText('Saved to your account', { exact: true })).toBeVisible();
  expect(saved?.progress['grade-5-sequences-1'].textCode).toBe('move_left()');
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('kodearcade-recovery-v1:')).length)).toBe(0);
});
test('recovered older revision cannot overwrite newer cloud work and can be explicitly discarded', async ({ page }) => {
  let revision = 1, posts = 0;
  await page.route('**/api/student/progress/grade-5', route => route.request().method() === 'GET'
    ? route.fulfill({ json: { ...identity, recovery, revision, document: document(), updatedAt: null } })
    : (posts++, route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } })));
  await page.goto('/#/student-play/grade-5'); await page.getByRole('textbox').fill('move_down()');
  await expect(page.getByText(/An encrypted recovery copy is saved on this device/)).toBeVisible();
  revision = 3; page.on('dialog', dialog => dialog.accept()); await page.reload();
  await expect(page.getByText('Another tab saved newer work. Your changes have not overwritten it.')).toBeVisible();
  const before = posts; await page.waitForTimeout(1000); expect(posts).toBe(before);
  await page.getByRole('button', { name: 'Reload saved version' }).click();
  await page.locator('.confirmation-accept').click();
  await expect(page.getByText('Another tab saved newer work. Your changes have not overwritten it.')).toHaveCount(0);
  await expect(page.getByRole('textbox')).not.toHaveValue('move_down()');
});
