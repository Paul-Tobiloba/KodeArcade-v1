import { afterEach, expect, it, vi } from 'vitest';
import { CloudSaver, collectCloud, hydrateCloud } from './cloudProgress';
import { AccountError } from './account-api';
import { SAVE_KEY } from './storage';
import type { ProgressDocument } from '../shared/progress';
import { progressCatalog } from '../shared/progress-catalog';
import { missions } from './learning';
import { courses } from './courses';
import { modulesFor } from './curriculum';
const document = (): ProgressDocument => ({ version: 1, currentId: 'grade-2-sequences-1', view: 'challenge', progress: {}, drawings: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false }, basicsComplete: [], topicRecords: {} });
afterEach(() => vi.useRealTimers());
it('round trips code, position, mode, drawings and preferences without public storage', () => {
  const value = document(); value.drawings.square = { attempts: 1, complete: true, stars: 4, code: 'forward(40)', mode: 'text' };
  value.progress['grade-2-sequences-1'] = { attempts: 2, complete: true, stars: 5, hints: 1, blocks: [], workspace: { blocks: { blocks: [] } } };
  expect(collectCloud('grade-2', hydrateCloud('grade-2', value))).toEqual(value);
  expect(hydrateCloud('grade-2', null)).toEqual({}); expect(collectCloud('grade-2', {})).toBeNull();
  expect(JSON.parse(hydrateCloud('grade-2', value)[SAVE_KEY]).nickname).toBe('');
});
it('keeps the generated catalog identical to shipped challenge order and indices', () => {
  for (const course of courses) {
    const catalog = progressCatalog[course.id as keyof typeof progressCatalog];
    expect(catalog.challenges).toEqual(modulesFor(course.id).flatMap(module => module.challengeIds));
    for (const mission of catalog.missions) expect(missions[mission.index].id).toBe(mission.id);
  }
});
it('serializes saves and flushes edits made during an in-flight request', async () => {
  const submitted: string[] = []; let release!: () => void;
  const saver = new CloudSaver({ revision: 0, document: null, updatedAt: null }, async (revision, value) => { submitted.push(value.currentId); if (!revision) await new Promise<void>(resolve => { release = resolve; }); return { revision: revision + 1 }; }, () => {});
  saver.update(document()); const pending = saver.flush();
  saver.update({ ...document(), currentId: 'grade-2-sequences-2' }); release();
  expect(await pending).toBe(true); expect(submitted).toEqual(['grade-2-sequences-1', 'grade-2-sequences-2']); expect(saver.pending).toBe(false); saver.dispose();
});
it('keeps unsaved work after network failure and allows retry', async () => {
  const submit = vi.fn().mockRejectedValueOnce(new AccountError(0, 'CONNECTION')).mockResolvedValue({ revision: 1 });
  const saver = new CloudSaver({ revision: 0, document: null, updatedAt: null }, submit, () => {});
  saver.update(document()); expect(await saver.flush()).toBe(false); expect(saver.status).toBe('error'); expect(saver.pending).toBe(true);
  expect(await saver.flush()).toBe(true); expect(saver.status).toBe('saved'); saver.dispose();
});
it('stops automatic conflict retries and provides a private export', async () => {
  const submit = vi.fn().mockRejectedValue(new AccountError(409, 'PROGRESS_CONFLICT'));
  const saver = new CloudSaver({ revision: 0, document: null, updatedAt: null }, submit, () => {});
  saver.update(document()); expect(await saver.flush()).toBe(false); expect(saver.status).toBe('conflict');
  saver.update({ ...document(), view: 'lesson' }); expect(await saver.flush()).toBe(false); expect(submit).toHaveBeenCalledTimes(1); expect(JSON.parse(saver.exportDraft()).view).toBe('lesson'); saver.dispose();
});
