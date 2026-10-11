import { afterEach, expect, it, vi } from 'vitest';
import { OfflineDraft, clearOfflineOwner } from './offlineDraft';
import { CloudSaver } from './cloudProgress';
import type { ProgressDocument } from '../shared/progress';
const access = { key: btoa('12345678901234567890123456789012'), slot: 'synthetic-slot', owner: 'synthetic-owner' };
const document = (): ProgressDocument => ({ version: 1, currentId: 'grade-2-sequences-1', view: 'challenge', progress: { 'grade-2-sequences-1': { attempts: 1, hints: 0, complete: false, blocks: [], textCode: 'private offline code' } }, drawings: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false }, basicsComplete: [], topicRecords: {} });
function storage(): Storage {
  const values: Record<string, string> = {};
  return Object.assign(values, { getItem: (key: string) => values[key] ?? null, setItem: (key: string, value: string) => { values[key] = value; }, removeItem: (key: string) => { delete values[key]; } }) as unknown as Storage;
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('encrypts work without persisting keys/plaintext and recovers after controller recreation', async () => {
  const disk = storage(), store = new OfflineDraft(access, 'grade-2', disk);
  await store.write({ revision: 3, document: document() });
  const raw = disk.getItem('kodearcade-recovery-v1:synthetic-slot')!;
  expect(raw).not.toContain('private offline code'); expect(raw).not.toContain(access.key);
  expect(await new OfflineDraft(access, 'grade-2', disk).read()).toEqual({ revision: 3, document: document() });
});
it('isolates other students/keys, rejects tampering and expires recovery copies', async () => {
  const disk = storage(), store = new OfflineDraft(access, 'grade-2', disk);
  await store.write({ revision: 1, document: document() });
  expect(await new OfflineDraft({ ...access, slot: 'other' }, 'grade-2', disk).read()).toBeNull();
  await expect(new OfflineDraft({ ...access, key: btoa('anotherkey12345678901234567890123') }, 'grade-2', disk).read()).rejects.toThrow();
  await expect(new OfflineDraft(access, 'grade-5', disk).read()).rejects.toThrow();
  vi.useFakeTimers(); vi.setSystemTime(Date.now() + 8 * 86400_000);
  expect(await store.read()).toBeNull();
});
it('serializes writes and clears only the signed-out student owner', async () => {
  const disk = storage(); vi.stubGlobal('localStorage', disk);
  const store = new OfflineDraft(access, 'grade-2', disk), other = new OfflineDraft({ ...access, slot: 'other-slot', owner: 'other-owner' }, 'grade-2', disk);
  const first = store.write({ revision: 1, document: document() });
  const second = store.write({ revision: 2, document: { ...document(), view: 'lesson' } });
  await Promise.all([first, second, other.write({ revision: 1, document: document() })]);
  expect((await store.read())?.revision).toBe(2);
  clearOfflineOwner(access.owner); expect(await store.read()).toBeNull(); expect(await other.read()).not.toBeNull();
});
it('restores a same-revision draft and clears its recovery copy after acknowledgement', async () => {
  const store = new OfflineDraft(access, 'grade-2', storage());
  const saver = new CloudSaver({ revision: 0, document: null, updatedAt: null }, async () => ({ revision: 1 }), () => {}, { store, draft: { revision: 0, document: document() }, changed: () => {} });
  expect(saver.pending).toBe(true); expect(saver.status).toBe('pending');
  expect(await saver.flush()).toBe(true); await saver.backedUp(); expect(await store.read()).toBeNull(); saver.dispose();
});
it('never upgrades a conflicting recovery draft baseline to the newer account revision', async () => {
  const store = new OfflineDraft(access, 'grade-2', storage()), submit = vi.fn();
  const saver = new CloudSaver({ revision: 4, document: { ...document(), view: 'lesson' }, updatedAt: null }, submit, () => {}, { store, draft: { revision: 2, document: document() }, changed: () => {} });
  saver.update(document()); await saver.backedUp();
  expect(saver.status).toBe('conflict'); expect(await saver.flush()).toBe(false); expect(submit).not.toHaveBeenCalled(); expect((await store.read())?.revision).toBe(2);
  await saver.discardRecovery(); expect(await store.read()).toBeNull(); saver.dispose();
});
it('reports storage failure without claiming that work is protected', async () => {
  const disk = storage(); disk.setItem = () => { throw new Error('Quota exceeded'); };
  const store = new OfflineDraft(access, 'grade-2', disk);
  const saver = new CloudSaver({ revision: 0, document: null, updatedAt: null }, vi.fn().mockRejectedValue(new Error()), () => {}, { store, draft: null, changed: () => {} });
  saver.update(document()); expect(await saver.backedUp()).toBe(false); expect(saver.recoveryStatus).toBe('unavailable'); saver.dispose();
});
