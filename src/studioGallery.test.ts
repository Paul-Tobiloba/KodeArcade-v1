import { describe, expect, it } from 'vitest';
import { galleryEntry, readStudioGallery, saveStudioGallery, studioGallerySchema, validWorkspace } from '../shared/studioGallery';
import { studioStarterProject } from './studioStarters';
import { newStudioProject, saveStudioProject } from './studioProject';
import { collectCloud, hydrateCloud } from './cloudProgress';
import { emptySave, parseSave, SAVE_KEY } from './storage';
import { progressDocument, validCourseDocument } from '../shared/progress';
import { missions } from './learning';
describe('private multi-project gallery', () => {
  it('migrates existing art, scripts and tour metadata without mutating their original', () => {
    const project = studioStarterProject('story'); project.onboarding = 'completed';
    const old = saveStudioProject(project), before = structuredClone(old), gallery = readStudioGallery(old);
    expect(gallery.projects[0].project).toEqual(project); expect(old).toEqual(before);
    expect(gallery.activeId).toBe(gallery.projects[0].id); expect(readStudioGallery(saveStudioGallery(gallery))).toEqual(gallery);
  });
  it('retains raw legacy workspace data through migration', () => {
    const old = { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', id: 'old', x: 99, y: 88 }] } };
    expect(readStudioGallery(old).projects[0].project.legacy).toEqual(old);
  });
  it('rejects corrupt libraries and projects instead of quietly loading an empty one', () => {
    expect(() => readStudioGallery({ byteStudioGallery: null })).toThrow();
    expect(() => readStudioGallery({ byteStudio: { version: 999 } })).toThrow();
    const gallery = readStudioGallery(); gallery.projects[0].project.selected = 'missing';
    expect(studioGallerySchema.safeParse(gallery).success).toBe(false);
  });
  it('requires unique IDs and a non-deleted active project', () => {
    const gallery = readStudioGallery();
    expect(studioGallerySchema.safeParse({ ...gallery, projects: [gallery.projects[0], gallery.projects[0]] }).success).toBe(false);
    gallery.projects[0].deletedAt = new Date().toISOString(); expect(studioGallerySchema.safeParse(gallery).success).toBe(false);
    gallery.activeId = null; expect(studioGallerySchema.safeParse(gallery).success).toBe(true);
    gallery.projects = []; expect(studioGallerySchema.safeParse(gallery).success).toBe(true);
  });
  it('bounds the number and UTF-8 bytes of projects, including deleted entries', () => {
    const gallery = readStudioGallery(); gallery.activeId = null;
    gallery.projects = Array.from({ length: 21 }, () => galleryEntry(newStudioProject()));
    expect(studioGallerySchema.safeParse(gallery).success).toBe(false);
    const project = newStudioProject(); project.sprites[0].code.extra = '界'.repeat(20000);
    gallery.projects = Array.from({ length: 11 }, () => galleryEntry(project));
    expect(studioGallerySchema.safeParse(gallery).success).toBe(false);
    expect(validWorkspace({ any: 'x'.repeat(100001) })).toBe(false);
  });
  it('keeps larger galleries intact through local, cloud and validated recovery serialization', () => {
    const gallery = readStudioGallery(); gallery.activeId = null;
    const p = studioStarterProject('bounce'); p.sprites[0].code.extra = 'x'.repeat(55000);
    gallery.projects.push(galleryEntry(p), galleryEntry(p)); gallery.projects[2].deletedAt = new Date().toISOString();
    const workspace = saveStudioGallery(gallery), save = emptySave(), id = 'grade-6-creative-4';
    save.course = 'grade-6'; save.current = missions.findIndex(m => m.id === id);
    save.progress[id] = { blocks: [], complete: false, hints: 0, attempts: 0, workspace };
    const entries = { [SAVE_KEY]: JSON.stringify(save) };
    expect(parseSave(entries[SAVE_KEY]).progress[id].workspace).toEqual(workspace);
    const cloud = collectCloud('grade-6', entries)!;
    expect(progressDocument.safeParse(cloud).success).toBe(true); expect(validCourseDocument('grade-6', cloud)).toBe(true);
    expect(collectCloud('grade-6', hydrateCloud('grade-6', cloud))?.progress[id].workspace).toEqual(workspace);
    const wrong = structuredClone(cloud); wrong.progress['grade-6-sequences-1'] = wrong.progress[id];
    expect(validCourseDocument('grade-6', wrong)).toBe(false);
    const malformed = { byteStudioGallery: { version: 99 } };
    const restored = parseSave(JSON.stringify({ ...save, progress: { [id]: { ...save.progress[id], workspace: malformed } } }));
    expect(restored.progress[id].workspace).toEqual(malformed);
    expect(() => readStudioGallery(restored.progress[id].workspace)).toThrow();
  });
  it('serializes copies independently and retains edited/deleted timestamps on roundtrip', () => {
    const first = galleryEntry(studioStarterProject('story')), second = galleryEntry(first.project);
    second.project.title = 'A different story'; second.deletedAt = '2026-10-17T10:00:00.000Z';
    expect(first.project.title).toBe('Space friends');
    const gallery = { version: 1 as const, activeId: null, projects: [first, second] };
    expect(readStudioGallery(saveStudioGallery(gallery))).toEqual(gallery);
  });
});
