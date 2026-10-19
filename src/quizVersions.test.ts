import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { courseQuizIds, currentQuizId, emptyQuiz, moduleQuiz, quizModuleId, quizScore, quizTopics } from '../shared/quizzes';
import { relativeQuizTopics } from '../shared/relative-quizzes';
import { preserveAchievements, progressDocument, summarizeProgress, validCourseDocument, type ProgressDocument } from '../shared/progress';
import { reportSummary } from '../shared/reports';
import { collectCloud, hydrateCloud, NAV_KEY } from './cloudProgress';
import { emptySave, parseSave, SAVE_KEY } from './storage';
import { parseCode, runText } from './textCoding';
import type { Mission } from './learning';

const doc = (): ProgressDocument => ({ version: 1, currentId: 'grade-5-loops-1', view: 'quiz', quizModuleId: 'grade-5-loops', progress: {}, drawings: {}, basicsComplete: [], topicRecords: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false }, quizzes: {} });
const submitted = (id: string) => { const answers = moduleQuiz(id).map(q => q.correct); return { version: 1 as const, answers, submittedAnswers: answers, bestAnswers: answers, attempts: 1 }; };

describe('immutable quiz versions and saved results', () => {
  it('freezes complete published banks, including prompts, explanations and option order', () => {
    const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
    const legacy = Array.from({ length: 6 }, (_, i) => quizTopics.filter(topic => !['operators', 'boolean', 'functions', 'creative'].includes(topic)).map(topic => moduleQuiz(`grade-${i + 1}-${topic}`)));
    const current = [4, 5, 6].map(grade => relativeQuizTopics.map(topic => moduleQuiz(`grade-${grade}-${topic}@2`)));
    // Publish another revision rather than updating these fingerprints for content changes.
    expect(hash(legacy)).toBe('ba1d614d9989eee70df74fce47a157feb01529df54631750f7fd08ba8cdb4a55');
    expect(hash(current)).toBe('f9769782696b414dbcff7fefe09ffd73daba17357bd6e1ab06c727c08297cc03');
  });
  it('keeps original question IDs, answer order and grade bands unchanged', () => {
    expect(moduleQuiz('grade-5-loops').map(q => q.correct)).toEqual([0, 2, 1, 0, 2]);
    expect(moduleQuiz('grade-5-loops').map(q => q.id)).toEqual(Array.from({ length: 5 }, (_, i) => `loops-2-${i}`));
    expect(moduleQuiz('grade-6-loops')[0].code).toContain('for j');
    expect(moduleQuiz('grade-3-lists')).toEqual(moduleQuiz('grade-4-lists'));
    expect(currentQuizId('grade-3-lists')).toBe('grade-3-lists@3');
    expect(quizModuleId('grade-6-lists@2')).toBe('grade-6-lists');
  });
  it('cannot reinterpret original answers as results on the revised bank', () => {
    const oldId = 'grade-5-loops', nextId = currentQuizId(oldId), old = submitted(oldId);
    expect(quizScore(oldId, old.bestAnswers)).toBe(5);
    expect(quizScore(nextId, old.bestAnswers)).toBe(0);
    const value = doc(); value.quizzes = { [oldId]: old };
    const summary = summarizeProgress('grade-5', { revision: 1, document: value, updatedAt: null });
    expect(summary.quizCompleted).toBe(0); expect(summary.quizTotal).toBe(13);
    expect(summary.previousQuizResults).toEqual([expect.objectContaining({ id: oldId, best: 5, latest: 5, attempts: 1 })]);
    expect(summary.quizResults.find(q => q.id === nextId)).toMatchObject({ best: null, attempts: 0 });
    expect(reportSummary('grade-5', { revision: 1, document: value, updatedAt: null }).lastActivity).toBe('Loops quiz (previous version)');
  });
  it.each(['grade-5-loops', 'grade-5-loops@2', 'grade-5-loops@3'])('round trips exact version %s, including draft and navigation', id => {
    const value = doc(); value.quizModuleId = id; value.quizzes = { [id]: { ...emptyQuiz(), answers: [2, null, 0, null, null] } };
    expect(collectCloud('grade-5', hydrateCloud('grade-5', value))).toEqual(value);
    expect(JSON.parse(hydrateCloud('grade-5', value)[NAV_KEY]).quizModuleId).toBe(id);
    expect(validCourseDocument('grade-5', progressDocument.parse(value))).toBe(true);
  });
  it('preserves best results independently on retries and stale-version writes', () => {
    const oldId = 'grade-5-loops', nextId = currentQuizId(oldId), old = doc();
    old.quizzes = { [oldId]: submitted(oldId), [nextId]: submitted(nextId) };
    const next = doc(), wrong = moduleQuiz(nextId).map(q => (q.correct + 1) % 3);
    next.quizzes = { [nextId]: { version: 1, answers: wrong, submittedAnswers: wrong, bestAnswers: wrong, attempts: 2 } };
    const saved = preserveAchievements(old, next), summary = summarizeProgress('grade-5', { revision: 2, document: saved, updatedAt: null });
    expect(saved.quizzes![oldId]).toEqual(old.quizzes[oldId]);
    expect(summary.quizResults.find(q => q.id === nextId)).toMatchObject({ best: 5, latest: 0, attempts: 2 });
    expect(summary.previousQuizResults[0]).toMatchObject({ best: 5, latest: 5, attempts: 1 });
    expect(summary.quizCompleted).toBe(1);
  });
  it('keeps two historical banks and the current topic bank independently reviewable', () => {
    const value = doc(); value.quizModuleId = 'grade-5-loops@2';
    value.quizzes = Object.fromEntries(['grade-5-loops', 'grade-5-loops@2', 'grade-5-loops@3'].map(id => [id, submitted(id)]));
    expect(collectCloud('grade-5', hydrateCloud('grade-5', value))).toEqual(value);
    const summary = summarizeProgress('grade-5', { revision: 1, document: value, updatedAt: null });
    expect(summary.quizCompleted).toBe(1);
    expect(summary.previousQuizResults.map(q => [q.version, q.best])).toEqual([[1, 5], [2, 5]]);
    expect(summary.quizResults.find(q => q.id === 'grade-5-loops@3')).toMatchObject({ version: 3, best: 5 });
  });
  it('retains every allowed bank across all public grades rather than truncating after 60 records', () => {
    const save = emptySave();
    for (const course of ['words', ...Array.from({ length: 6 }, (_, i) => `grade-${i + 1}`)]) for (const id of courseQuizIds(course, true)) save.quizzes[id] = emptyQuiz();
    expect(Object.keys(save.quizzes).length).toBeGreaterThan(60);
    expect(parseSave(JSON.stringify(save)).quizzes).toEqual(save.quizzes);
    const value = doc(); value.quizzes = Object.fromEntries(courseQuizIds('grade-5', true).map(id => [id, emptyQuiz()]));
    expect(Object.keys(value.quizzes)).toHaveLength(32);
    expect(progressDocument.safeParse(value).success).toBe(true);
    expect(validCourseDocument('grade-5', value)).toBe(true);
    expect(collectCloud('grade-5', hydrateCloud('grade-5', value))).toEqual(value);
  });
  it.each(['grade-3-loops@2', 'grade-5-loops@4', 'grade-6-directions@2', 'grade-4-unknown@2', 'loops@2', 'grade-5-loops@2@2'])('rejects unregistered revision %s locally and in the cloud', id => {
    expect(moduleQuiz(id)).toEqual([]);
    const value = doc(); value.quizzes = { [id]: emptyQuiz() }; value.quizModuleId = id;
    expect(validCourseDocument('grade-5', value)).toBe(false);
    expect(parseSave(JSON.stringify({ ...emptySave(), quizzes: value.quizzes })).quizzes).toEqual({});
  });
});

describe('revised quizzes assess the shipped senior controls', () => {
  for (const grade of [4, 5, 6]) for (const topic of relativeQuizTopics) it(`Grade ${grade} ${topic}: complete questions with executable teaching syntax`, () => {
    const id = `grade-${grade}-${topic}@2`, questions = moduleQuiz(id);
    expect(questions).toHaveLength(5);
    expect(quizScore(id, questions.map(q => q.correct))).toBe(5);
    expect(new Set(questions.map(q => q.id)).size).toBe(5);
    for (const q of questions) {
      expect(q.explanation.length).toBeGreaterThan(25);
      expect(new Set(q.options).size).toBe(3);
      if (q.code) expect(() => parseCode(q.code!)).not.toThrow();
    }
    if (grade === 4) expect(JSON.stringify(questions)).not.toMatch(/turn_\w+\(|270|45°/);
    expect(moduleQuiz(id, 1)).toEqual(questions);
  });
  const task = (topic: string, end: { x: number; y: number }): Mission => ({ id: `grade-6-${topic}-quiz-check`, title: 'Quiz trace', concept: 'Sequences', description: '', goal: '', size: 10, start: { x: 2, y: 2 }, end, walls: [], loops: true, conditionals: topic === 'conditionals', variables: topic === 'variables', targetScore: topic === 'variables' ? 3 : undefined, starter: [], hints: [], reflection: '', ...(['statements', 'lists', 'objects'].includes(topic) ? { dataTask: { topic: topic as 'statements' | 'lists' | 'objects', required: [], ...(topic === 'objects' ? { list: [2, 2] } : {}) } } : {}) });
  it.each([
    ['sequences', 0, 4, 3, 'down'], ['statements', 1, 4, 1, 'down'],
    ['loops', 0, 2, 2, 'right'], ['loops', 1, 8, 2, 'right'],
    ['conditionals', 0, 2, 3, 'down'], ['conditionals', 1, 3, 2, 'right'],
    ['variables', 0, 5, 2, 'right'], ['lists', 1, 8, 2, 'right'], ['lists', 2, 7, 2, 'right'],
  ])('%s question %i matches the interpreter trace', (topic, index, x, y, heading) => {
    const q = moduleQuiz(`grade-6-${topic}@2`)[index as number];
    const result = runText(q.code!, task(topic as string, { x: x as number, y: y as number }));
    expect(result.success, result.message).toBe(true);
    expect(result.frames.at(-1)).toMatchObject({ x, y, heading });
  });
  it('only introduces list-to-property copy in the Grade 6 object quiz', () => {
    expect(moduleQuiz('grade-5-objects@2')[4].code).toBeUndefined();
    expect(moduleQuiz('grade-6-objects@2')[4].code).toContain('robot["speed"] = steps[0]');
    const m = task('objects', { x: 2, y: 2 }); m.dataTask!.robot = { speed: 3, energy: 1 };
    const result = runText(moduleQuiz('grade-6-objects@2')[4].code!, m);
    expect(result.success, result.message).toBe(true);
    expect(result.frames.at(-1)?.note).toContain('speed = 3');
  });
});
