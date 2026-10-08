import { describe, expect, it } from 'vitest';
import { challengeStars } from './rewards';
import { emptySave, freshProgress, parseSave, switchCourse } from './storage';

describe('mastery rewards', () => {
  it.each([[1,5],[2,5],[3,4],[4,4],[5,3],[7,3],[8,2],[11,2],[12,1],[100000,1]])('attempt %i earns %i stars', (attempt, stars) => {
    expect(challengeStars(attempt, 0)).toBe(stars);
  });
  it('reduces help gradually without zero-star completions', () => {
    expect([0,1,2,3,4].map(hints => challengeStars(1, hints))).toEqual([5,5,4,3,2]);
    expect(challengeStars(1, 0, true)).toBe(1);
    for (let attempt = 1; attempt < 30; attempt++) for (let hint = 0; hint <= 4; hint++) expect(challengeStars(attempt, hint)).toBeGreaterThanOrEqual(1);
  });
  it('persists completed rewards independently for each course', () => {
    let save = emptySave();
    save.progress['first-steps'] = { ...freshProgress(0), complete: true, stars: 4 };
    save = switchCourse(save, 'words');
    expect(save.progress['first-steps']).toBeUndefined();
    save = switchCourse(parseSave(JSON.stringify(save)), 'arrows');
    expect(save.progress['first-steps'].stars).toBe(4);
  });
  it('does not invent old rewards or accept invalid/unearned scores', () => {
    const save = emptySave();
    save.progress['first-steps'] = { ...freshProgress(0), complete: true };
    expect(parseSave(JSON.stringify(save)).progress['first-steps'].stars).toBeUndefined();
    for (const stars of [0,6,2.5,'5',null]) {
      expect(parseSave(JSON.stringify({ ...save, progress: { 'first-steps': { ...save.progress['first-steps'], stars } } })).progress['first-steps'].stars).toBeUndefined();
    }
    expect(parseSave(JSON.stringify({ ...save, progress: { 'first-steps': { ...freshProgress(0), stars: 5 } } })).progress['first-steps'].stars).toBeUndefined();
  });
});
