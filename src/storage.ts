import { directions, initialProgram, missions, same, type Block, type Position } from './learning';
import { firstChallenge, isCourse, type CourseId } from './courses';
export type Progress = { blocks: Block[]; attempts: number; hints: number; complete: boolean; stars?: number; lessonSeen?: boolean; end?: Position; workspace?: Record<string, unknown> };
export type CourseProgress = { current: number; progress: Record<string, Progress> };
export type Save = { version: 1; nickname: string; reducedMotion: boolean; largeText: boolean; soundEnabled: boolean; musicEnabled: boolean; current: number; progress: Record<string, Progress>; course: CourseId; courseProgress: Partial<Record<CourseId, CourseProgress>>; basicsComplete: string[] };
export const SAVE_KEY = 'kodearcade-v1';
export const emptySave = (): Save => ({ version: 1, nickname: '', reducedMotion: false, largeText: false, soundEnabled: true, musicEnabled: false, current: missions.findIndex(m => m.id === firstChallenge('grade-1')), progress: {}, course: 'grade-1', courseProgress: {}, basicsComplete: [] });
export function switchCourse(save: Save, course: CourseId): Save {
  if (save.course === course) return save;
  const target = save.courseProgress[course] ?? { current: missions.findIndex(m => m.id === firstChallenge(course)), progress: {} };
  return { ...save, ...target, course, courseProgress: { ...save.courseProgress, [save.course]: { current: save.current, progress: save.progress } } };
}
export function freshProgress(index: number): Progress { return { blocks: initialProgram(missions[index]), attempts: 0, hints: 0, complete: false }; }
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export function parseSave(raw: string | null): Save {
  if (!raw) return emptySave();
  const value: unknown = JSON.parse(raw);
  if (!object(value) || value.version !== 1 || !object(value.progress)) throw new Error('Unsupported save');
  const save = emptySave();
  // Existing learners keep their text-block work; each course has its own progress.
  save.course = isCourse(value.course) ? value.course : 'words';
  save.basicsComplete = Array.isArray(value.basicsComplete) ? [...new Set(value.basicsComplete.filter((id): id is string => typeof id === 'string' && /^(mouse|keyboard)-[0-9]$/.test(id)))] : [];
  if (object(value.courseProgress)) for (const [id, state] of Object.entries(value.courseProgress)) {
    if (!isCourse(id) || !object(state) || !object(state.progress)) continue;
    const parsed = parseSave(JSON.stringify({ version: 1, course: id, current: state.current, progress: state.progress }));
    save.courseProgress[id] = { current: parsed.current, progress: parsed.progress };
  }
  save.nickname = typeof value.nickname === 'string' ? value.nickname.slice(0, 20) : '';
  save.reducedMotion = value.reducedMotion === true;
  save.largeText = value.largeText === true;
  save.soundEnabled = value.soundEnabled !== false;
  save.musicEnabled = value.musicEnabled === true;
  save.current = Number.isInteger(value.current) && Number(value.current) >= 0 && Number(value.current) < missions.length ? Number(value.current) : 0;
  for (const mission of missions) {
    const p = value.progress[mission.id];
    if (!object(p) || !Array.isArray(p.blocks) || p.blocks.length > 24) continue;
    const ids = new Set<string>();
    const blocks: Block[] = [];
    for (const b of p.blocks) {
      if (!object(b) || typeof b.id !== 'string' || ids.has(b.id) || !(directions.includes(b.kind as never) || (b.kind === 'repeat' && mission.loops))) continue;
      if (b.kind === 'repeat' && (!directions.includes(b.direction as never) || !Number.isInteger(b.count) || Number(b.count) < 2 || Number(b.count) > 5)) continue;
      ids.add(b.id);
      blocks.push({ id: b.id, kind: b.kind as Block['kind'], direction: directions.includes(b.direction as never) ? b.direction as Block['direction'] : 'right', count: b.kind === 'repeat' ? Number(b.count) : 2 });
    }
    const progress: Progress = { blocks, attempts: Number.isInteger(p.attempts) ? Math.max(0, Math.min(100000, Number(p.attempts))) : 0, hints: Number.isInteger(p.hints) ? Math.max(0, Math.min(4, Number(p.hints))) : 0, complete: p.complete === true };
    if (object(p.workspace) && JSON.stringify(p.workspace).length < 100000) progress.workspace = p.workspace;
    if (p.lessonSeen === true) progress.lessonSeen = true;
    if (progress.complete && Number.isInteger(p.stars) && Number(p.stars) >= 1 && Number(p.stars) <= 5) progress.stars = Number(p.stars);
    if (mission.id.endsWith('rescue-project') && object(p.end)) {
      const end = { x: Number(p.end.x), y: Number(p.end.y) };
      if (Number.isInteger(end.x) && Number.isInteger(end.y) && end.x >= 0 && end.x < mission.size && end.y >= 0 && end.y < mission.size && !same(end, mission.start) && !mission.walls.some(w => same(w, end))) progress.end = end;
    }
    save.progress[mission.id] = progress;
  }
  return save;
}
export function loadSave(): { save: Save; warning: string; resumed: boolean } {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return { save: parseSave(raw), warning: '', resumed: !!raw };
  } catch {
    return { save: emptySave(), warning: 'Saved progress could not be read. You can play this session. Your previous save will stay untouched until you choose Reset saved progress in Settings.', resumed: false };
  }
}
