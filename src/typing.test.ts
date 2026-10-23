import { describe, expect, it } from 'vitest';
import { typingActivities, typingActivity, typingCourses } from '../shared/typingCurriculum';
import { emptyTyping, insertedText, mergeTyping, readTyping, typedWords, typingAccuracy, typingHint, typingStars } from '../shared/typing';
import { preserveAchievements, progressDocument, validCourseDocument, type ProgressDocument } from '../shared/progress';
import { collectCloud, hydrateCloud } from './cloudProgress';

describe('typing curriculum', () => {
  it('ships 720 bounded activities with stable unique IDs, ten units and twelve activities per unit', () => {
    const ids = new Set<string>();
    for (const course of typingCourses) {
      expect(course.units).toHaveLength(10); expect(typingActivities(course.grade)).toHaveLength(120);
      for (const unit of course.units) {
        expect(unit.activities).toHaveLength(12);
        expect(unit.activities.filter(a => a.kind === 'check')).toHaveLength(1);
        for (const activity of unit.activities) {
          expect(ids.has(activity.id)).toBe(false); ids.add(activity.id);
          expect(typingActivity(activity.id)).toBe(activity); expect(activity.target.length).toBeGreaterThan(0); expect(activity.target.length).toBeLessThan(600);
          if (activity.kind === 'game' || activity.kind === 'story') { expect(activity.rounds.length).toBeGreaterThan(0); expect(activity.rounds.every(Boolean)).toBe(true); }
          if (activity.kind === 'edit') expect(activity.initial).not.toBe(activity.target);
        }
      }
    }
    expect(ids.size).toBe(720); expect(typingActivity('typing-g7-u01-a01')).toBeUndefined();
  });
  it('does not require untaught letters in early Grade 1 core targets', () => {
    const introduced = new Set([' ', '\n']);
    for (const unit of typingCourses[0].units) {
      for (const key of unit.keys) introduced.add(key);
      for (const activity of unit.activities) for (const key of activity.target) expect(introduced.has(key), `${activity.id}: untaught ${key}`).toBe(true);
    }
  });
});
it('maps letters, punctuation, Space, Enter and opposite Shift without claiming to detect actual fingers', () => {
  expect(typingHint('f')).toMatchObject({ hand:'left', finger:3, shift:false });
  expect(typingHint('I')).toMatchObject({ hand:'right', finger:2, shift:true });
  expect(typingHint('?')).toMatchObject({ key:'/', hand:'right', finger:0, shift:true });
  expect(typingHint(' ')).toMatchObject({ key:'Space', hand:'either', finger:4 });
  expect(typingHint('\n')).toMatchObject({ key:'Enter', hand:'right', finger:0 });
});
it('counts inserted text and replacements, not deletions; errors survive correction', () => {
  expect(insertedText('f x', 'f j')).toEqual({ start:2, text:'j' });
  expect(insertedText('f x', 'f ')).toEqual({ start:2, text:'' });
  expect(typingAccuracy(3,4)).toBe(75); expect(typingAccuracy(0,0)).toBeUndefined();
  expect(typedWords(' My small garden has green plants. ')).toBe(6);
  expect(typingStars(100)).toBe(5); expect(typingStars(90)).toBe(3); expect(typingStars(undefined)).toBe(3);
});
const base = (): ProgressDocument => ({ version:1, currentId:'grade-2-sequences-1', view:'challenge', progress:{}, drawings:{}, preferences:{ reducedMotion:false, largeText:false, soundEnabled:false, musicEnabled:false }, basicsComplete:[], topicRecords:{} });
it('validates bounded grade-scoped saves and rejects raw typed content and invented activity IDs', () => {
  const value = emptyTyping(2);
  expect(readTyping(value,2)).toEqual(value); expect(() => readTyping(value,1)).toThrow();
  expect(() => readTyping({ ...value, writing:'private text' },2)).toThrow();
  expect(() => readTyping({ ...value, currentId:'typing-g2-u99-a01' },2)).toThrow();
  expect(validCourseDocument('grade-2', { ...base(), typing:value })).toBe(true);
  expect(validCourseDocument('grade-2', { ...base(), typing:emptyTyping(1) })).toBe(false);
});
it('keeps best typing stars, independent evidence and old-client omission without changing coding results', () => {
  const previous = emptyTyping(2), id = previous.currentId;
  previous.results[id] = { attempts:2, complete:true, bestStars:5, bestAccuracy:100, durationMs:3000, independent:true, independentAccuracy:100 };
  const next = emptyTyping(2); next.results[id] = { attempts:3, complete:true, bestStars:1, bestAccuracy:70, durationMs:5000, independent:false };
  expect(mergeTyping(previous,next).results[id]).toMatchObject({ bestStars:5, bestAccuracy:100, independent:true, independentAccuracy:100, attempts:3 });
  expect(preserveAchievements({ ...base(), typing:previous },base()).typing).toEqual(previous);
  expect(progressDocument.parse({ ...base(), typing:previous }).typing).toEqual(previous);
  expect(collectCloud('grade-2',hydrateCloud('grade-2',{ ...base(), typing:previous }))).toEqual({ ...base(), typing:previous });
});
