import { AccountError, accountRequest } from './account-api';
import { emptySave, parseSave, SAVE_KEY } from './storage';
import { drawingSaveKey } from './drawingActivities';
import { missions } from './learning';
import { progressCatalog } from '../shared/progress-catalog';
import { type CloudSnapshot, type GradeKey, type ProgressDocument } from '../shared/progress';
import type { OfflineDraft, RecoveryDraft } from './offlineDraft';
export const NAV_KEY = 'kodearcade-navigation-v1';
export type SaveStatus = 'saved' | 'pending' | 'saving' | 'error' | 'conflict';
export function hydrateCloud(course: GradeKey, document: ProgressDocument | null): Record<string, string> {
  if (!document) return {};
  const save = { ...emptySave(), ...document.preferences, course, current: missions.findIndex(m => m.id === document.currentId), progress: document.progress, basicsComplete: document.basicsComplete, topicRecords: document.topicRecords, quizzes: document.quizzes ?? {} };
  return { [SAVE_KEY]: JSON.stringify(save), [NAV_KEY]: JSON.stringify({ view: document.view, drawingId: document.drawingId, quizModuleId: document.quizModuleId }), ...Object.fromEntries(Object.entries(document.drawings).map(([id, drawing]) => [drawingSaveKey(course, id), JSON.stringify(drawing)])) };
}
export function collectCloud(course: GradeKey, entries: Record<string, string>): ProgressDocument | null {
  if (!entries[SAVE_KEY]) return null;
  const save = parseSave(entries[SAVE_KEY]);
  const catalog = progressCatalog[course];
  if (save.course !== course || !catalog.missions.some(m => m.id === missions[save.current].id)) return null;
  let navigation: { view?: ProgressDocument['view']; drawingId?: string; quizModuleId?: string } = {};
  try { navigation = JSON.parse(entries[NAV_KEY] ?? '{}'); } catch { /* Fall back to challenge. */ }
  const drawings: ProgressDocument['drawings'] = {};
  for (const drawing of catalog.drawings) {
    const raw = entries[drawingSaveKey(course, drawing.id)];
    if (raw) { const value = JSON.parse(raw); drawings[drawing.id] = { ...value, attempts: value.attempts ?? 0, complete: value.complete === true, ...(value.stars ? { stars: value.stars } : { stars: undefined }) }; }
  }
  const quizzes = Object.fromEntries(Object.entries(save.quizzes).filter(([id]) => id.startsWith(`${course}-`)));
  return { version: 1, currentId: missions[save.current].id, view: navigation.view ?? 'challenge', ...(navigation.drawingId ? { drawingId: navigation.drawingId } : {}), ...(navigation.quizModuleId ? { quizModuleId: navigation.quizModuleId } : {}), ...(Object.keys(quizzes).length ? { quizzes } : {}),
    progress: Object.fromEntries(Object.entries(save.progress).filter(([id]) => catalog.missions.some(m => m.id === id))), drawings,
    preferences: { reducedMotion: save.reducedMotion, largeText: save.largeText, soundEnabled: save.soundEnabled, musicEnabled: save.musicEnabled }, basicsComplete: save.basicsComplete, topicRecords: save.topicRecords };
}

export class CloudSaver {
  private latest: ProgressDocument | null;
  private saved: string;
  private revision: number;
  private timer?: ReturnType<typeof setTimeout>;
  private running?: Promise<boolean>;
  private backupTask: Promise<boolean> = Promise.resolve(false);
  private discarded = false;
  private protectionGeneration = 0;
  recoveryStatus: 'writing' | 'protected' | 'unavailable' = 'unavailable';
  status: SaveStatus = 'saved';
  constructor(snapshot: CloudSnapshot, private submit: (revision: number, document: ProgressDocument) => Promise<{ revision: number }>, private changed: (status: SaveStatus) => void,
    private recovery?: { store: OfflineDraft; draft: RecoveryDraft | null; changed: (status: 'writing' | 'protected' | 'unavailable') => void }) {
    this.latest = snapshot.document; this.saved = JSON.stringify(snapshot.document); this.revision = snapshot.revision;
    if (recovery?.draft && JSON.stringify(recovery.draft.document) !== this.saved) {
      this.latest = recovery.draft.document;
      this.state(recovery.draft.revision === snapshot.revision ? 'pending' : 'conflict');
      this.revision = recovery.draft.revision;
      this.recoveryStatus = 'protected'; recovery.changed('protected');
    }
  }
  get document() { return this.latest; }
  get pending() { return JSON.stringify(this.latest) !== this.saved; }
  private state(status: SaveStatus) { this.status = status; this.changed(status); }
  private protect() {
    if (!this.recovery || this.discarded) return;
    const generation = ++this.protectionGeneration;
    this.recoveryStatus = 'writing'; this.recovery.changed('writing');
    this.backupTask = this.recovery.store.write(this.pending && this.latest ? { revision: this.revision, document: this.latest } : null).then(() => {
      if (generation === this.protectionGeneration) { this.recoveryStatus = 'protected'; this.recovery!.changed('protected'); } return true;
    }, () => { if (generation === this.protectionGeneration) { this.recoveryStatus = 'unavailable'; this.recovery!.changed('unavailable'); } return false; });
  }
  async backedUp() { return !this.pending || await this.backupTask; }
  async discardRecovery() { this.discarded = true; clearTimeout(this.timer); await this.recovery?.store.discard(); }
  update(document: ProgressDocument | null) {
    this.latest = document;
    this.protect();
    if (!this.pending || this.status === 'conflict') return;
    this.state('pending'); clearTimeout(this.timer);
    this.timer = setTimeout(() => { void this.flush(); }, 800);
  }
  flush(): Promise<boolean> {
    clearTimeout(this.timer);
    if (this.discarded) return Promise.resolve(!this.pending);
    if (this.running) return this.running;
    if (this.status === 'conflict') return Promise.resolve(false);
    this.running = (async () => {
      while (this.pending && this.latest) {
        const document = this.latest, serialized = JSON.stringify(document);
        this.state('saving');
        try { const result = await this.submit(this.revision, document); this.revision = result.revision; this.saved = serialized; this.protect(); }
        catch (error) { this.state(error instanceof AccountError && error.code === 'PROGRESS_CONFLICT' ? 'conflict' : 'error'); return false; }
      }
      this.state('saved'); return true;
    })().finally(() => { this.running = undefined; });
    return this.running;
  }
  dispose() { clearTimeout(this.timer); if (this.running) void this.running.finally(() => this.recovery?.store.release()); else this.recovery?.store.release(); }
  exportDraft() { return JSON.stringify(this.latest, null, 2); }
}
export function cloudSubmit(course: GradeKey, learnerId: string, classroomId: string) {
  return (revision: number, document: ProgressDocument) => accountRequest<{ revision: number }>(`student/progress/${course}`, { learnerId, classroomId, revision, document }, AbortSignal.timeout(15000));
}
