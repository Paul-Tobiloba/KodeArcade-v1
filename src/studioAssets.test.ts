import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { studioCharacters, studioBackdrops, characterImage, characterIsAtlas } from './studioCatalog';
import { spriteNames, backdropNames } from './spriteModel';
import { importedImage, isStudioBackground, newStudioProject, readStudioBackup, saveStudioProject, studioProjectSchema } from './studioProject';
import { checkImageFile, imageImportBytes } from './studioImageImport';
import { galleryEntry, readStudioGallery, saveStudioGallery, validWorkspace } from '../shared/studioGallery';
import { configureStudioAssets } from './studioBlocks';
import { StudioEngine } from './studioEngine';
import { progressDocument, validCourseDocument } from '../shared/progress';
import { collectCloud, hydrateCloud } from './cloudProgress';
import { emptySave, parseSave, SAVE_KEY } from './storage';
import { missions } from './learning';

const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=';
function importedProject() {
  const project = newStudioProject();
  project.assets.push({ id: 'imported-bg', kind: 'image', purpose: 'background', name: 'My imported background', imageData }); project.backdrop = 'imported-bg';
  return project;
}
describe('Byte Lab private image imports and expanded art catalog', () => {
  it('extends only the free-build catalog without changing guided mascots or backgrounds', () => {
    expect(spriteNames).toHaveLength(7); expect(backdropNames).toHaveLength(4);
    for (const name of ['Boy', 'Girl', 'Cat', 'Dog', 'Lion', 'Football', 'Basketball', 'Car']) {
      expect(studioCharacters).toContain(name); expect(characterIsAtlas(name)).toBe(false); expect(characterImage(name)).toBe(`/images/studio/${name.toLowerCase()}.png`);
      const p = newStudioProject(); p.assets[0].ref = name; expect(studioProjectSchema.safeParse(p).success).toBe(true);
    }
    expect(characterIsAtlas('Byte')).toBe(true); expect(characterImage('Byte')).toBe('/images/worlds/byte.png');
    expect(studioBackdrops).toEqual(expect.arrayContaining(['football', 'basketball', 'tennis', 'track', 'volleyball']));
  });
  it('round-trips the private imported background, including painted copies', () => {
    const p = importedProject(); p.assets.push({ id: 'painted-bg', name: 'Painted image', kind: 'drawing', purpose: 'background', base: { kind: 'image', imageData }, strokes: [] });
    expect(readStudioBackup(saveStudioProject(p))).toEqual(p);
    const gallery = { version: 1 as const, activeId: null, projects: [galleryEntry(p)] };
    expect(readStudioGallery(saveStudioGallery(gallery))).toEqual(gallery);
    expect(isStudioBackground(p.assets[2])).toBe(true);
  });
  it.each(['https://external.test/picture.jpg', 'javascript:alert(1)', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:text/html;base64,PHNjcmlwdD4=', "data:image/png;base64,AAAA' onerror='alert(1)", 'data:image/png;base64,not base64', 'data:image/gif;base64,R0lGODlh'])('rejects unsafe or unsupported source %s', value => {
    expect(importedImage.safeParse(value).success).toBe(false);
    const p = importedProject(); p.assets[2].imageData = value; expect(studioProjectSchema.safeParse(p).success).toBe(false);
  });
  it('bounds image, project and gallery size while retaining larger single-project backups', () => {
    expect(importedImage.safeParse(`data:image/jpeg;base64,${'A'.repeat(80000)}`).success).toBe(false);
    const p = importedProject(); p.sprites[0].code.extra = 'x'.repeat(100001);
    expect(validWorkspace(saveStudioProject(p))).toBe(true);
    p.sprites[0].code.extra = 'x'.repeat(240001); expect(studioProjectSchema.safeParse(p).success).toBe(false);
  });
  it('does not accept image assets as costumes, or hide image data in other asset kinds', () => {
    const p = importedProject(); p.sprites[0].costumes.push('imported-bg'); expect(studioProjectSchema.safeParse(p).success).toBe(false);
    p.sprites[0].costumes.pop(); p.assets[2].purpose = 'costume'; expect(studioProjectSchema.safeParse(p).success).toBe(false);
    p.assets[2].kind = 'drawing'; expect(studioProjectSchema.safeParse(p).success).toBe(false);
  });
  it('checks the input size and format before decoding', () => {
    expect(() => checkImageFile({ type: 'image/png', size: imageImportBytes })).not.toThrow();
    for (const type of ['image/jpeg', 'image/webp']) expect(() => checkImageFile({ type, size: 100 })).not.toThrow();
    expect(() => checkImageFile({ type: 'image/svg+xml', size: 100 })).toThrow('PNG, JPEG or WebP');
    expect(() => checkImageFile({ type: 'image/png', size: 0 })).toThrow('5 MB');
    expect(() => checkImageFile({ type: 'image/png', size: imageImportBytes + 1 })).toThrow('5 MB');
  });
  it('includes imported backgrounds in block selections and executes a switch', () => {
    const p = importedProject(); p.sprites[0].code = { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: { type: 'ka_studio_background', fields: { ASSET: 'imported-bg' } } } }] } };
    const ws = new Blockly.Workspace();
    try { const block = ws.newBlock('ka_studio_background'); configureStudioAssets(ws, p, p.selected); expect((block.getField('ASSET') as Blockly.FieldDropdown).getOptions(false)).toContainEqual(['My imported background', 'imported-bg']); } finally { ws.dispose(); }
    const engine = new StudioEngine(p); try { engine.start(); while (engine.step()) { /* bounded one-action script */ } expect(engine.snapshot().background).toBe('imported-bg'); } finally { engine.dispose(); }
  });
  it('restores non-default costume choices and rejects missing artwork instead of substituting a different asset', () => {
    const p = newStudioProject(); p.assets.push({ id: 'girl', name: 'Girl', kind: 'character', ref: 'Girl' }); p.sprites[0].costumes.push('girl');
    const code = (id: string) => ({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: { type: 'ka_studio_costume', fields: { ASSET: id } } } }] } });
    p.sprites[0].code = code('girl');
    const engine = new StudioEngine(p); try { engine.start(); while (engine.step()) { /* one-action script */ } expect(engine.snapshot().actors[0].costume).toBe('girl'); } finally { engine.dispose(); }
    p.sprites[0].code = code('removed-art');
    const broken = new StudioEngine(p); try { broken.start(); expect(() => broken.step()).toThrow('costume'); } finally { broken.dispose(); }
  });
  it('preserves image pixels through browser, cloud and recovery serialization, without scoring free builds', () => {
    const id = 'grade-6-creative-4', p = importedProject(), save = emptySave();
    save.course = 'grade-6'; save.current = missions.findIndex(m => m.id === id);
    const workspace = saveStudioGallery({ version: 1, activeId: null, projects: [galleryEntry(p)] });
    save.progress[id] = { blocks: [], attempts: 0, hints: 0, complete: false, workspace };
    expect(parseSave(JSON.stringify(save)).progress[id].workspace).toEqual(workspace);
    const cloud = collectCloud('grade-6', { [SAVE_KEY]: JSON.stringify(save) })!;
    expect(progressDocument.safeParse(cloud).success).toBe(true); expect(validCourseDocument('grade-6', cloud)).toBe(true);
    expect(collectCloud('grade-6', hydrateCloud('grade-6', cloud))?.progress[id].workspace).toEqual(workspace);
  });
});
