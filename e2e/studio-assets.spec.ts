import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { galleryBytes, galleryEntry, readStudioGallery, saveStudioGallery } from '../shared/studioGallery';
import { newStudioProject, saveStudioProject, type StudioProject } from '../src/studioProject';
import { progressDocument, validCourseDocument, type ProgressDocument } from '../shared/progress';
const id = 'grade-6-creative-4';
async function fixture(page: Page, project: StudioProject = { ...newStudioProject(), onboarding: 'completed' }, workspace = saveStudioProject(project) as Record<string, unknown>) {
  const identity = { learnerId: 'synthetic-art-child', classroomId: 'synthetic-art-class' };
  let value: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { blocks: [], complete: false, attempts: 0, hints: 0, workspace } }, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false } }, revision = 0;
  await page.route('**/api/session', r => r.fulfill({ json: null })); await page.route('**/api/capabilities', r => r.fulfill({ json: {} }));
  await page.route('**/api/student/courses', r => r.fulfill({ json: { ...identity, displayName: 'Synthetic Learner', classroomName: 'Synthetic class', assignments: [{ id: 'synthetic-art-assignment', courseKey: 'grade-6' }] } }));
  await page.route('**/api/student/progress/grade-6', r => {
    if (r.request().method() === 'POST') {
      const body = r.request().postDataJSON(); expect(body.learnerId).toBe(identity.learnerId); expect(body.classroomId).toBe(identity.classroomId);
      expect(progressDocument.safeParse(body.document).success).toBe(true); expect(validCourseDocument('grade-6', body.document)).toBe(true);
      value = body.document; return r.fulfill({ json: { revision: ++revision } });
    }
    return r.fulfill({ json: { ...identity, revision, document: value, updatedAt: null } });
  });
  return () => { const gallery = readStudioGallery(value.progress[id].workspace); return gallery.projects.find(p => p.id === gallery.activeId)?.project ?? gallery.projects.at(-1)!.project; };
}
async function photo(page: Page, mimeType = 'image/png') {
  const data = await page.evaluate(mime => {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 600;
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#217d8c'; ctx.fillRect(0, 0, 1200, 600); ctx.fillStyle = '#e9b382'; ctx.fillRect(200, 100, 800, 400);
    return c.toDataURL(mime);
  }, mimeType);
  return { name: 'private-family-filename.png', mimeType, buffer: Buffer.from(data.split(',')[1], 'base64') };
}

test('sports backgrounds and expanded character library have working visual choices', async ({ page }, info) => {
  test.setTimeout(90000); const saved = await fixture(page), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('button', { name: 'Choose sprite', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Choose a sprite' });
  for (const name of ['Boy', 'Girl', 'Cat', 'Dog', 'Lion', 'Football', 'Basketball', 'Car']) {
    await expect(dialog.getByRole('button', { name: `Use ${name}`, exact: true })).toHaveCount(1);
  }
  await expect.poll(() => dialog.locator('img').evaluateAll(imgs => imgs.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect((await new AxeBuilder({ page }).include('dialog[open]').analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/assets-sprites-${info.project.name}.png`, fullPage: true });
  await dialog.getByRole('button', { name: 'Use Boy', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Click Boy sprite', exact: true }).locator('img')).toHaveAttribute('src', '/images/studio/boy.png');
  await page.getByRole('button', { name: 'Choose sprite', exact: true }).click(); await page.getByRole('button', { name: 'Use Girl', exact: true }).click();
  await page.getByRole('button', { name: 'Choose sprite', exact: true }).click(); await page.getByRole('button', { name: 'Use Football', exact: true }).click();
  await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click(); await page.getByRole('button', { name: 'Choose background', exact: true }).click();
  for (const ref of ['football', 'basketball', 'tennis', 'track', 'volleyball']) await expect(page.getByRole('button', { name: `Use ${ref} background`, exact: true })).toHaveCount(1);
  await expect.poll(() => page.getByRole('dialog', { name: 'Choose a background' }).locator('img').evaluateAll(imgs => imgs.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await page.screenshot({ path: `.impeccable/review/assets-backgrounds-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Use football background', exact: true }).click();
  await expect.poll(() => saved().assets.find(a => a.id === saved().backdrop)?.ref).toBe('football');
  await page.getByRole('tab', { name: 'Code', exact: true }).click(); await page.reload();
  await expect(page.getByRole('button', { name: 'Edit Boy sprite', exact: true })).toBeVisible();
  await expect(page.locator('.studio-stage')).toHaveCSS('background-image', /football-court.svg/);
  await page.evaluate(() => { document.activeElement instanceof HTMLElement && document.activeElement.blur(); scrollTo(0, 0); });
  await page.screenshot({ path: `.impeccable/review/assets-stage-${info.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(errors).toEqual([]);
});

test('private image import resizes, strips filename, autosaves and travels in backups and gallery previews', async ({ page }, info) => {
  test.setTimeout(90000); const saved = await fixture(page); await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click();
  await page.getByLabel('Import background image', { exact: true }).setInputFiles(await photo(page));
  await expect.poll(() => saved().assets.find(a => a.id === saved().backdrop)?.kind).toBe('image');
  const asset = saved().assets.find(a => a.id === saved().backdrop)!;
  expect(asset.imageData).toMatch(/^data:image\/jpeg;base64,/); expect(asset.imageData!.length).toBeLessThanOrEqual(80000);
  expect(JSON.stringify(saved())).not.toContain('private-family-filename');
  const dimensions = await page.locator('.studio-stage-background').evaluate(async node => { const i = node as HTMLImageElement; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }); expect(dimensions).toEqual([768, 384]);
  await expect(page.getByText('Your imported image · Saved only with this private project and its backups.', { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).include('.studio-shell').exclude('.blocklySvg').analyze()).violations).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: `.impeccable/review/assets-import-${info.project.name}.png`, fullPage: true });
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download project', exact: true }).click();
  const backup = await readFile((await (await downloaded).path())!); expect(JSON.parse(backup.toString()).byteStudio.assets).toContainEqual(asset);
  await page.reload(); await expect(page.locator('.studio-stage-background')).toHaveAttribute('src', asset.imageData!);
  await page.getByRole('button', { name: 'My projects', exact: true }).click();
  await expect(page.locator('.studio-project-preview-background')).toHaveAttribute('src', asset.imageData!);
  await page.getByLabel('Import Byte Lab project', { exact: true }).setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: backup });
  await expect(page.locator('.studio-stage-background')).toHaveAttribute('src', asset.imageData!);
  await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click(); await page.getByRole('button', { name: 'Edit a copy', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Drawing editor for My background', exact: true })).toBeVisible();
  await expect.poll(() => saved().assets.at(-1)?.base?.kind).toBe('image');
  await expect.poll(() => page.locator('.studio-paint-paper canvas').evaluate(node => { const data = (node as HTMLCanvasElement).getContext('2d')!.getImageData(200, 200, 1, 1).data; return Math.max(...Array.from(data).map((v, i) => Math.abs(v - [233, 179, 130, 255][i]))); })).toBeLessThanOrEqual(3); // JPEG is intentionally lossy.
});

test('bad, oversized and unsupported image imports leave the current project intact and support retry', async ({ page }) => {
  const saved = await fixture(page); await page.goto('/#/student-play/grade-6/lab'); await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click();
  await expect.poll(() => (saved().sprites[0].code.blocks as { blocks: { deletable?: boolean }[] }).blocks[0].deletable).toBe(false); const before = structuredClone(saved());
  const input = page.getByLabel('Import background image', { exact: true });
  const wideImage = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 8193; canvas.height = 1; return canvas.toDataURL('image/png').split(',')[1]; });
  for (const file of [
    { name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg onload="alert(1)"/>') },
    { name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('not an image') },
    { name: 'big.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) },
    { name: 'wide.png', mimeType: 'image/png', buffer: Buffer.from(wideImage, 'base64') },
  ]) {
    await input.setInputFiles(file); await expect(page.locator('.studio-error')).toBeVisible(); await expect(page.locator('.studio-error')).toBeFocused();
    expect(saved()).toEqual(before); await expect(page.getByRole('button', { name: 'Import image', exact: true })).toBeEnabled();
  }
  for (const mime of ['image/jpeg', 'image/webp']) {
    await input.setInputFiles(await photo(page, mime)); await expect.poll(() => saved().assets.length).toBe(mime === 'image/jpeg' ? 3 : 4);
    await expect(page.locator('.studio-error')).toHaveCount(0);
  }
  await input.setInputFiles([]); expect(saved().assets).toHaveLength(4);
});

test('a project at its asset capacity rejects an import without changing saved work', async ({ page }, info) => {
  const project = { ...newStudioProject(), onboarding: 'completed' as const }; project.assets.push(...Array.from({ length: 22 }, (_, i) => ({ id: `extra-${i}`, name: `Extra ${i}`, kind: 'background' as const, ref: 'sky' })));
  const saved = await fixture(page, project); await page.goto('/#/student-play/grade-6/lab'); await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click();
  await expect.poll(() => (saved().sprites[0].code.blocks as { blocks: { deletable?: boolean }[] }).blocks[0].deletable).toBe(false); const before = structuredClone(saved());
  await page.getByLabel('Import background image', { exact: true }).setInputFiles(await photo(page));
  await expect(page.getByRole('alert')).toContainText('last valid project is unchanged'); await expect(page.getByRole('alert')).toBeFocused();
  expect(saved()).toEqual(before);
  await page.getByRole('button', { name: 'Choose background', exact: true }).click(); await page.getByRole('button', { name: 'Use basketball background', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Choose a background' })).not.toBeVisible(); await expect(page.getByRole('alert')).toBeFocused();
  expect(saved()).toEqual(before);
  await page.getByRole('tab', { name: 'Costumes', exact: true }).click(); await page.getByRole('button', { name: 'Choose costume', exact: true }).click(); await page.getByRole('button', { name: 'Use Girl', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Choose a costume' })).not.toBeVisible(); await expect(page.getByRole('alert')).toBeVisible(); await expect(page.getByRole('alert')).toBeFocused();
  expect(saved()).toEqual(before);
  await page.screenshot({ path: `.impeccable/review/assets-local-capacity-${info.project.name}.png`, fullPage: true });
  await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click(); await page.locator('.studio-asset-list').getByRole('button', { name: 'Extra 0', exact: true }).click();
  page.once('dialog', d => d.accept()); await page.locator('.studio-art-heading').getByRole('button', { name: 'Remove', exact: true }).click();
  await expect.poll(() => saved().assets.length).toBe(23);
  await page.getByRole('button', { name: 'Choose background', exact: true }).click(); await page.getByRole('button', { name: 'Use basketball background', exact: true }).click();
  await expect.poll(() => saved().assets.find(a => a.id === saved().backdrop)?.ref).toBe('basketball'); await expect(page.locator('.studio-error')).toHaveCount(0);
});

test('a gallery-budget rejection closes the library and focuses visible recovery without changing saved artwork', async ({ page }, info) => {
  const project = { ...newStudioProject(), onboarding: 'completed' as const }, active = galleryEntry(project), filler = () => { const p = newStudioProject(); p.sprites[0].code.padding = 'x'.repeat(230000); return galleryEntry(p); };
  const gallery = { version: 1 as const, activeId: active.id, projects: [active, filler(), filler(), galleryEntry(newStudioProject())] };
  const used = new TextEncoder().encode(JSON.stringify({ byteStudioGallery: gallery })).length;
  gallery.projects[3].project.sprites[0].code.padding = 'x'.repeat(galleryBytes - used - 90); // Leave room for Blockly's starter metadata, not another asset.
  const saved = await fixture(page, project, saveStudioGallery(gallery)); await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click(); await page.getByRole('button', { name: 'Choose background', exact: true }).click(); await page.getByRole('button', { name: 'Use basketball background', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Choose a background' })).not.toBeVisible();
  await expect(page.locator('.studio-library-error')).toBeVisible(); await expect(page.locator('.studio-library-error')).toBeFocused();
  expect(saved().assets).toHaveLength(2); expect(saved().backdrop).toBe('background-sky');
  await expect(page.getByRole('button', { name: 'Download gallery', exact: true })).toBeVisible();
  await page.screenshot({ path: `.impeccable/review/assets-capacity-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'My projects', exact: true }).click();
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Delete Untitled project', exact: true }).nth(1).click();
  await page.getByRole('button', { name: 'Recently deleted (1)', exact: true }).click(); page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Delete forever', exact: true }).click();
  await page.getByRole('button', { name: 'My projects (3)', exact: true }).click(); await page.getByRole('button', { name: 'Open Untitled project', exact: true }).first().click();
  await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click(); await page.getByRole('button', { name: 'Choose background', exact: true }).click(); await page.getByRole('button', { name: 'Use basketball background', exact: true }).click();
  await expect.poll(() => saved().assets.find(a => a.id === saved().backdrop)?.ref).toBe('basketball'); await expect(page.locator('.studio-library-error')).toHaveCount(0);
});

test('saved costume and imported-background blocks retain their choices after reopening and run correctly', async ({ page }) => {
  const project = { ...newStudioProject(), onboarding: 'completed' as const };
  project.assets.push({ id: 'girl', kind: 'character', name: 'Girl', ref: 'Girl' }); project.sprites[0].costumes.push('girl');
  const source = await photo(page), imageData = `data:image/png;base64,${source.buffer.toString('base64')}`;
  project.assets.push({ id: 'private-bg', kind: 'image', name: 'Private background', purpose: 'background', imageData });
  project.sprites[0].code = { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', id: 'play', next: { block: { type: 'ka_studio_costume', fields: { ASSET: 'girl' }, next: { block: { type: 'ka_studio_background', fields: { ASSET: 'private-bg' } } } } } }] } };
  await fixture(page, project); await page.goto('/#/student-play/grade-6/lab');
  for (let attempt = 0; attempt < 2; attempt++) {
    await expect(page.locator('.studio-stage-background')).toHaveCount(0);
    await page.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(page.locator('.studio-stage-actor img')).toHaveAttribute('src', '/images/studio/girl.png');
    await expect(page.locator('.studio-stage-background')).toHaveAttribute('src', imageData);
    await expect.poll(() => page.locator('.studio-stage-background').evaluate(node => (node as HTMLImageElement).naturalWidth)).toBe(1200);
    await expect(page.locator('.studio-error')).toHaveCount(0);
    await page.reload();
  }
});

test('family characters and props are searchable, categorized and saved as separate sprites', async ({ page }, info) => {
  test.setTimeout(90000); const saved = await fixture(page); await page.goto('/#/student-play/grade-6/lab');
  await page.getByRole('button', { name: 'Choose sprite', exact: true }).click(); const dialog = page.getByRole('dialog', { name: 'Choose a sprite' });
  await expect(dialog.locator('.studio-library-grid button')).toHaveCount(35);
  await dialog.getByRole('button', { name: 'People', exact: true }).click(); await expect(dialog.locator('.studio-library-grid button')).toHaveCount(8);
  await expect.poll(() => dialog.locator('img').evaluateAll(imgs => imgs.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect((await new AxeBuilder({ page }).include('dialog[open]').analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/story-people-${info.project.name}.png` });
  const search = dialog.getByRole('searchbox', { name: 'Find artwork', exact: true });
  await search.fill('adult'); await expect(dialog.locator('.studio-library-grid button')).toHaveCount(4);
  await search.fill('grand ma'); await expect(dialog.getByRole('button', { name: 'Use Grandma', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Animals', exact: true }).click(); await expect(dialog.getByText('No artwork matches. Try a different name or category.', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Show all artwork', exact: true }).click(); await expect(search).toHaveValue(''); await expect(dialog.locator('.studio-library-grid button')).toHaveCount(35);
  await search.fill('granny'); await dialog.getByRole('button', { name: 'Use Grandma', exact: true }).click();
  await expect.poll(() => saved().sprites.length).toBe(2);
  await page.getByRole('button', { name: 'Choose sprite', exact: true }).click(); await expect(search).toHaveValue(''); await expect(dialog.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await search.fill('grandfather'); await dialog.getByRole('button', { name: 'Use Grandpa', exact: true }).click();
  await page.getByRole('button', { name: 'Choose sprite', exact: true }).click(); await dialog.getByRole('button', { name: 'Things', exact: true }).click(); await search.fill('home'); await dialog.getByRole('button', { name: 'Use House', exact: true }).click();
  await expect.poll(() => saved().sprites.length).toBe(4); await page.reload();
  for (const name of ['Grandma', 'Grandpa', 'House']) await expect(page.getByRole('button', { name: `Edit ${name} sprite`, exact: true })).toBeVisible();
  expect(saved().sprites.map(s => s.name)).toEqual(['Byte', 'Grandma', 'Grandpa', 'House']);
  expect(saved().sprites.every(s => !!s.code.blocks)).toBe(true);
  await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: `.impeccable/review/story-family-stage-${info.project.name}.png` });
});

test('new city, country and adventure scenes load, filter and reopen without changing earlier references', async ({ page }, info) => {
  test.setTimeout(90000); const saved = await fixture(page); await page.goto('/#/student-play/grade-6/lab'); await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click();
  await page.getByRole('button', { name: 'Choose background', exact: true }).click(); const dialog = page.getByRole('dialog', { name: 'Choose a background' }), search = dialog.getByRole('searchbox', { name: 'Find artwork', exact: true });
  await expect(dialog.locator('.studio-library-grid button')).toHaveCount(19);
  await dialog.getByRole('button', { name: 'Places', exact: true }).click(); await expect(dialog.locator('.studio-library-grid button')).toHaveCount(3);
  await expect.poll(() => dialog.locator('img').evaluateAll(imgs => imgs.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 768))).toBe(true);
  expect((await new AxeBuilder({ page }).include('dialog[open]').analyze()).violations).toEqual([]);
  await page.screenshot({ path: `.impeccable/review/story-places-${info.project.name}.png` });
  await search.fill('city'); await dialog.getByRole('button', { name: 'Use cityStreet background', exact: true }).click(); await expect.poll(() => saved().assets.find(a => a.id === saved().backdrop)?.ref).toBe('cityStreet');
  for (const [ref, query] of [['countryHome', 'countryside'], ['park', 'playground'], ['beach', 'beach'], ['classroom', 'classroom'], ['space', 'galaxy'], ['underwater', 'coral'], ['forest', 'woods']]) {
    await page.getByRole('button', { name: 'Choose background', exact: true }).click(); await expect(search).toHaveValue(''); await search.fill(query);
    const option = dialog.getByRole('button', { name: `Use ${ref} background`, exact: true }); await expect.poll(() => option.locator('img').evaluate(node => (node as HTMLImageElement).naturalWidth)).toBe(768);
    await option.click(); await expect.poll(() => saved().assets.find(a => a.id === saved().backdrop)?.ref).toBe(ref);
  }
  await page.reload(); await expect(page.locator('.studio-stage')).toHaveCSS('background-image', /forest-scene.png/);
  expect(saved().assets.find(a => a.id === 'background-sky')?.ref).toBe('sky');
  await page.getByRole('button', { name: 'My projects', exact: true }).click(); await expect(page.locator('.studio-project-preview')).toHaveCSS('background-image', /forest-scene.png/);
});

test('all new animals and things load, and new family/scenery artwork supports painted copies and backups', async ({ page }, info) => {
  test.setTimeout(90000); const saved = await fixture(page); await page.goto('/#/student-play/grade-6/lab'); await page.getByRole('button', { name: 'Choose sprite', exact: true }).click(); const dialog = page.getByRole('dialog', { name: 'Choose a sprite' });
  for (const name of ['Man', 'Woman', 'Grandma', 'Grandpa', 'House', 'Tree', 'Bicycle', 'Bus', 'Rocket', 'Horse', 'Butterfly', 'Fish']) {
    const image = dialog.getByRole('button', { name: `Use ${name}`, exact: true }).locator('img'); await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBe(384);
  }
  await dialog.getByRole('button', { name: 'Animals', exact: true }).click(); await page.screenshot({ path: `.impeccable/review/story-animals-${info.project.name}.png` });
  await dialog.getByRole('button', { name: 'Things', exact: true }).click(); await page.screenshot({ path: `.impeccable/review/story-things-${info.project.name}.png` });
  await dialog.getByRole('button', { name: 'People', exact: true }).click(); await dialog.getByRole('button', { name: 'Use Grandpa', exact: true }).click();
  await page.getByRole('tab', { name: 'Costumes', exact: true }).click(); await page.getByRole('button', { name: 'Edit a copy', exact: true }).click();
  await expect.poll(() => saved().assets.at(-1)?.base).toEqual({ kind: 'character', ref: 'Grandpa' });
  await expect.poll(() => page.locator('.studio-paint-paper canvas').evaluate(node => Array.from((node as HTMLCanvasElement).getContext('2d')!.getImageData(0, 0, 400, 400).data).filter((v, i) => i % 4 === 3 && v > 0).length)).toBeGreaterThan(10000);
  await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click(); await page.getByRole('button', { name: 'Choose background', exact: true }).click(); await page.getByRole('searchbox', { name: 'Find artwork', exact: true }).fill('countryside'); await page.getByRole('button', { name: 'Use countryHome background', exact: true }).click();
  await page.getByRole('button', { name: 'Edit a copy', exact: true }).click(); await expect.poll(() => saved().assets.at(-1)?.base).toEqual({ kind: 'background', ref: 'countryHome' });
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download project', exact: true }).click(); const backup = JSON.parse(await readFile((await (await downloaded).path())!, 'utf8'));
  expect(backup.byteStudio.assets).toEqual(saved().assets); await page.reload();
  await page.getByRole('tab', { name: 'Backgrounds', exact: true }).click(); await expect(page.getByRole('region', { name: 'Drawing editor for My background', exact: true })).toBeVisible();
});
