import { describe, expect, it } from 'vitest';
import { emptySave, freshProgress, parseSave, switchCourse } from './storage';
import { firstChallenge } from './courses';
import { missionIndex } from './curriculum';
import { collectCloud, hydrateCloud } from './cloudProgress';
import { progressDocument, validCourseDocument, type ProgressDocument } from '../shared/progress';

describe('workspace tour progress', () => {
  it.each(['completed', 'skipped'] as const)('round trips %s without changing challenge results', workspaceTour => {
    const save = emptySave(), id = firstChallenge(save.course);
    save.progress[id] = { ...freshProgress(missionIndex(id)), workspaceTour };
    const restored = parseSave(JSON.stringify(save));
    expect(restored.progress[id]).toMatchObject({ workspaceTour, complete: false, attempts: 0, hints: 0 });
    expect(switchCourse(restored, 'grade-2').progress[firstChallenge('grade-2')]?.workspaceTour).toBeUndefined();
    expect(switchCourse(switchCourse(restored, 'grade-2'), 'grade-1').progress[id].workspaceTour).toBe(workspaceTour);
  });
  it('ignores invalid tour flags in public saves and accepts old saves', () => {
    const save = emptySave(), id = firstChallenge(save.course);
    save.progress[id] = freshProgress(missionIndex(id));
    expect(parseSave(JSON.stringify(save)).progress[id].workspaceTour).toBeUndefined();
    expect(parseSave(JSON.stringify({ ...save, progress: { [id]: { ...save.progress[id], workspaceTour: true } } })).progress[id].workspaceTour).toBeUndefined();
  });
  it('preserves the optional tour marker through scoped cloud hydration and validation', () => {
    const id = firstChallenge('grade-2');
    const document: ProgressDocument = { version: 1, currentId: id, view: 'challenge', progress: { [id]: { blocks: [], attempts: 0, hints: 0, complete: false, workspaceTour: 'skipped' } }, drawings: {}, preferences: { reducedMotion: false, largeText: false, soundEnabled: true, musicEnabled: false }, basicsComplete: [], topicRecords: {} };
    expect(progressDocument.parse(document)).toEqual(document);
    expect(validCourseDocument('grade-2', document)).toBe(true);
    expect(collectCloud('grade-2', hydrateCloud('grade-2', document))).toEqual(document);
    expect(progressDocument.safeParse({ ...document, progress: { [id]: { ...document.progress[id], workspaceTour: 'unknown' } } }).success).toBe(false);
  });
});
