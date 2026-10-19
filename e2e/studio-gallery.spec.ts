import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { galleryEntry, galleryBytes, readStudioGallery, saveStudioGallery, type StudioGallery } from '../shared/studioGallery';
import { progressDocument, validCourseDocument, type ProgressDocument } from '../shared/progress';
import { studioStarterProject } from '../src/studioStarters';
import { saveStudioProject } from '../src/studioProject';
const id = 'grade-6-creative-4';
function sampleGallery(): StudioGallery {
  const projects = (['story', 'keyboard', 'bounce'] as const).map(kind => galleryEntry({ ...studioStarterProject(kind), onboarding: 'completed' }, '2026-10-17T10:00:00.000Z'));
  return { version: 1, activeId: null, projects };
}
async function fixture(page: Page, workspace: Record<string, unknown> = saveStudioGallery(sampleGallery())) {
  const identity = { learnerId: 'synthetic-gallery-pupil', classroomId: 'synthetic-gallery-class' };
  let value: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { blocks: [], attempts: 0, hints: 0, complete: false, workspace } }, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } }, revision = 0, failed = false;
  await page.route('**/api/session', r => r.fulfill({ json: null })); await page.route('**/api/capabilities', r => r.fulfill({ json: {} }));
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Synthetic Learner', classroomName: 'Synthetic class', assignments: [{ id: 'synthetic-assignment', courseKey: 'grade-6' }] } }));
  await page.route('**/api/student/progress/grade-6', r => {
    if (r.request().method() === 'POST') {
      if (failed) return r.fulfill({ status: 503, json: { code: 'TEST_OFFLINE' } });
      const body = r.request().postDataJSON(); expect(body.learnerId).toBe(identity.learnerId); expect(body.classroomId).toBe(identity.classroomId);
      expect(progressDocument.safeParse(body.document).success).toBe(true); expect(validCourseDocument('grade-6', body.document)).toBe(true);
      value = body.document; return r.fulfill({ json: { revision: ++revision } });
    }
    return r.fulfill({ json: { ...identity, revision, document: value, updatedAt: null } });
  });
  return { gallery: () => readStudioGallery(value.progress[id].workspace), progress: () => value.progress[id], fail: (v: boolean) => { failed = v; } };
}
test('gallery creates, renames, duplicates and opens independent saved projects', async ({ page }, info) => {
  const saved = await fixture(page), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/student-play/grade-6/lab'); await expect(page.getByRole('heading', { name: 'My projects', exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Saved projects' }).getByRole('article')).toHaveCount(3);
  expect((await new AxeBuilder({ page }).include('.studio-gallery').analyze()).violations).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: `.impeccable/review/gallery-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Rename Space friends', exact: true }).click();
  await page.getByRole('dialog', { name: 'Rename project' }).getByRole('textbox', { name: 'Project name' }).fill('My moon story'); await page.getByRole('button', { name: 'Save name' }).click();
  await expect.poll(() => saved.gallery().projects[0].project.title).toBe('My moon story');
  await page.getByRole('button', { name: 'Duplicate My moon story', exact: true }).click(); await expect.poll(() => saved.gallery().projects.length).toBe(4);
  await page.getByRole('button', { name: 'Open My moon story copy', exact: true }).click();
  await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('Only the copy changed');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'My projects', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My moon story', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Only the copy changed', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'New project', exact: true }).click(); await page.getByRole('button', { name: 'Start Bounce around', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Bounce around');
  await page.getByRole('button', { name: 'Run', exact: true }).click(); await expect(page.locator('.studio-speech')).toContainText('Bounce!');
  await page.getByRole('button', { name: 'My projects', exact: true }).click();
  await expect.poll(() => saved.gallery().projects.length).toBe(5); await expect.poll(() => saved.gallery().activeId).toBeNull(); await page.reload();
  await expect(page.getByRole('heading', { name: 'Only the copy changed', exact: true })).toBeVisible();
  expect(saved.progress()).toMatchObject({ complete: false, attempts: 0 }); expect(saved.progress().stars).toBeUndefined();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(errors).toEqual([]);
});
test('deletion is confirmed, restorable after reload and permanently removable only with confirmation', async ({ page }, info) => {
  const saved = await fixture(page); await page.goto('/#/student-play/grade-6/lab');
  page.once('dialog', d => d.dismiss()); await page.getByRole('button', { name: 'Delete Space friends', exact: true }).click(); expect(saved.gallery().projects[0].deletedAt).toBeUndefined();
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Delete Space friends', exact: true }).click();
  await expect.poll(() => !!saved.gallery().projects[0].deletedAt).toBe(true);
  await page.getByRole('button', { name: 'Recently deleted (1)', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Deleted projects' }).getByRole('article')).toHaveCount(1);
  await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: `.impeccable/review/gallery-trash-${info.project.name}.png`, fullPage: true });
  await page.reload(); await page.getByRole('button', { name: 'Recently deleted (1)', exact: true }).click(); await page.getByRole('button', { name: 'Restore', exact: true }).click();
  await page.getByRole('button', { name: 'My projects (3)', exact: true }).click(); await expect(page.getByRole('button', { name: 'Open Space friends', exact: true })).toBeVisible();
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Delete Space friends', exact: true }).click(); await page.getByRole('button', { name: 'Recently deleted (1)', exact: true }).click();
  page.once('dialog', d => d.dismiss()); await page.getByRole('button', { name: 'Delete forever', exact: true }).click(); await expect(page.getByRole('list', { name: 'Deleted projects' }).getByRole('article')).toHaveCount(1);
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Delete forever', exact: true }).click();
  await expect.poll(() => saved.gallery().projects.length).toBe(2); await expect(page.getByRole('heading', { name: 'Nothing in Recently deleted' })).toBeVisible();
});
test('gallery backups and single projects import additively without replacing previous work', async ({ page }) => {
  const saved = await fixture(page); await page.goto('/#/student-play/grade-6/lab');
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download gallery', exact: true }).click();
  const download = await downloaded, backup = await readFile((await download.path())!); expect(download.suggestedFilename()).toBe('Byte-Lab-gallery.json');
  await page.getByLabel('Import Byte Lab project', { exact: true }).setInputFiles({ name: 'gallery.json', mimeType: 'application/json', buffer: backup });
  await expect.poll(() => saved.gallery().projects.length).toBe(6); expect(new Set(saved.gallery().projects.map(p => p.id)).size).toBe(6);
  await page.getByLabel('Import Byte Lab project', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.getByRole('alert')).toContainText('existing projects are unchanged'); expect(saved.gallery().projects.length).toBe(6);
  const p = studioStarterProject('keyboard'); p.title = 'Imported keys';
  await page.getByLabel('Import Byte Lab project', { exact: true }).setInputFiles({ name: 'keys.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(saveStudioProject(p))) });
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Imported keys'); await expect.poll(() => saved.gallery().projects.length).toBe(7);
});
test('old single drafts migrate unchanged and a full gallery import never replaces earlier work', async ({ page }) => {
  const p = studioStarterProject('story'); p.title = 'Old saved story'; p.onboarding = 'completed'; const saved = await fixture(page, saveStudioProject(p));
  await page.goto('/#/student-play/grade-6/lab'); await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Old saved story');
  await page.getByRole('button', { name: 'My projects', exact: true }).click(); await expect.poll(() => saved.gallery().projects[0].project.title).toBe('Old saved story');
  const gallery = sampleGallery(); gallery.projects = Array.from({ length: 20 }, () => galleryEntry(studioStarterProject('story')));
  await page.getByLabel('Import Byte Lab project', { exact: true }).setInputFiles({ name: 'full.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(saveStudioGallery(gallery))) });
  await expect(page.getByRole('alert')).toContainText('gallery is full'); expect(saved.gallery().projects).toHaveLength(1);
});
test('corrupt saved galleries offer original-data recovery without publishing an empty replacement', async ({ page }) => {
  const saved = await fixture(page, { byteStudioGallery: { version: 999, privateText: 'Synthetic original data' } });
  await page.goto('/#/student-play/grade-6/lab');
  await expect(page.getByRole('heading', { name: 'Let’s protect your projects' })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download original data' }).click();
  expect(await readFile((await (await download).path())!, 'utf8')).toContain('Synthetic original data');
  expect(saved.progress().workspace).toEqual({ byteStudioGallery: { version: 999, privateText: 'Synthetic original data' } });
});
test('failed account sync stays visible with export/retry and recovers without losing projects', async ({ page }) => {
  const saved = await fixture(page); await page.goto('/#/student-play/grade-6/lab'); saved.fail(true);
  await page.getByRole('button', { name: 'Duplicate Space friends', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry save', exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Download unsaved work', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Space friends copy', exact: true })).toBeVisible(); saved.fail(false); await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect.poll(() => saved.gallery().projects.length).toBe(4); await page.reload(); await expect(page.getByRole('heading', { name: 'Space friends copy', exact: true })).toBeVisible();
});
test('browser storage failures stay visible and expose the in-memory gallery backup', async ({ page }) => {
  await fixture(page);
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) { if (key === 'kodearcade-v1') throw new DOMException('Synthetic storage quota', 'QuotaExceededError'); original.call(this, key, value); };
  });
  await page.goto('/#/learn/grade-6/lab');
  await expect(page.getByRole('alert').filter({ hasText: 'Progress cannot be saved' })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download gallery', exact: true }).click();
  const data = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  expect(readStudioGallery(data).projects).toHaveLength(1);
});
test('unreadable browser progress is protected and its exact original data can be downloaded', async ({ page }) => {
  await fixture(page); await page.addInitScript(() => localStorage.setItem('kodearcade-v1', '{synthetic malformed original'));
  await page.goto('/#/learn/grade-6/lab'); await expect(page.getByRole('heading', { name: 'Let’s protect your projects' })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download original data', exact: true }).click();
  expect(await readFile((await (await download).path())!, 'utf8')).toBe('{synthetic malformed original');
  expect(await page.evaluate(() => localStorage.getItem('kodearcade-v1'))).toBe('{synthetic malformed original');
});
test('full-capacity errors close the starter dialog and focus reachable recovery in editor and gallery', async ({ page }, info) => {
  const gallery = sampleGallery(); gallery.projects = Array.from({ length: 20 }, (_, i) => galleryEntry({ ...studioStarterProject('story'), title: `Saved ${i + 1}`, onboarding: 'completed' })); gallery.activeId = gallery.projects[0].id;
  const saved = await fixture(page, saveStudioGallery(gallery)); await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('button', { name: 'New project', exact: true }).click(); await page.getByRole('button', { name: 'Start Bounce around', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Start a new project' })).not.toBeVisible();
  const editorError = page.locator('.studio-library-error'); await expect(editorError).toContainText('gallery is full'); await expect(editorError).toBeFocused();
  await expect(editorError.getByRole('button', { name: 'Download gallery' })).toBeVisible(); expect(saved.gallery().projects).toHaveLength(20);
  await page.getByRole('button', { name: 'My projects', exact: true }).click();
  await page.getByRole('button', { name: 'New project', exact: true }).click(); await page.getByRole('button', { name: 'Start Bounce around', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Start a new project' })).not.toBeVisible();
  const galleryError = page.locator('.studio-gallery-error'); await expect(galleryError).toContainText('gallery is full'); await expect(galleryError).toBeFocused();
  expect(saved.gallery().projects).toHaveLength(20); await page.screenshot({ path: `.impeccable/review/gallery-capacity-${info.project.name}.png` });
});
test('byte-budget rename rejection closes the modal, announces recovery and preserves the old name', async ({ page }, info) => {
  const gallery = sampleGallery(); gallery.projects = Array.from({ length: 9 }, (_, i) => galleryEntry({ ...studioStarterProject('story'), title: `A ${i}`, onboarding: 'completed' }));
  const bytes = () => Buffer.byteLength(JSON.stringify({ byteStudioGallery: gallery }));
  for (const entry of gallery.projects) { if (bytes() >= galleryBytes - 10) break; entry.project.sprites[0].code.padding = ''; entry.project.sprites[0].code.padding = 'x'.repeat(Math.min(70000, galleryBytes - 10 - bytes())); }
  expect(bytes()).toBe(galleryBytes - 10);
  const saved = await fixture(page, saveStudioGallery(gallery)); await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('button', { name: 'Rename A 0', exact: true }).click(); await page.getByRole('dialog', { name: 'Rename project' }).getByRole('textbox', { name: 'Project name' }).fill('A'.repeat(40));
  await page.getByRole('button', { name: 'Save name', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Rename project' })).not.toBeVisible();
  const error = page.locator('.studio-gallery-error'); await expect(error).toContainText('gallery is full'); await expect(error).toBeFocused();
  expect(saved.gallery().projects[0].project.title).toBe('A 0'); await page.screenshot({ path: `.impeccable/review/gallery-byte-budget-${info.project.name}.png` });
});
