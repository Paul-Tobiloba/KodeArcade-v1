import { describe, expect, it } from 'vitest';
import { needsLesson } from './lessonProgress';
import { emptySave, freshProgress, switchCourse } from './storage';
import { missionIndex } from './curriculum';

describe('concept introductions', () => {
  it('shows a new concept but not every challenge in it', () => {
    const save = emptySave();
    expect(needsLesson(save, 'first-steps')).toBe(true);
    save.progress['first-steps'] = { ...freshProgress(missionIndex('first-steps')), lessonSeen: true };
    expect(needsLesson(save, 'sequence-up')).toBe(false);
    expect(needsLesson(save, 'on-repeat')).toBe(true);
  });
  it('honours previous completions and keeps courses independent', () => {
    const save = emptySave();
    save.progress['first-steps'] = { ...freshProgress(missionIndex('first-steps')), complete: true };
    expect(needsLesson(save, 'sequence-up')).toBe(false);
    expect(needsLesson(switchCourse(save, 'words'), 'first-steps')).toBe(true);
  });
});
