import { expect, it } from 'vitest';
import { courses } from './courses';
import { modulesFor } from './curriculum';
import { emptySave, parseSave, SAVE_KEY, switchCourse } from './storage';
import { collectCloud, hydrateCloud } from './cloudProgress';
import { courseQuizIds, currentQuizId, emptyQuiz, moduleQuiz, quizRecord, quizScore } from '../shared/quizzes';
import { preserveAchievements, progressDocument, summarizeProgress, validCourseDocument, type ProgressDocument } from '../shared/progress';
const document = (): ProgressDocument => ({ version: 1, currentId: 'grade-5-loops-1', view: 'quiz', quizModuleId: 'grade-5-loops', quizzes: {}, progress: {}, drawings: {}, preferences: { reducedMotion: true, largeText: false, soundEnabled: false, musicEnabled: false }, basicsComplete: [], topicRecords: {} });
it('covers every shipped module in every grade with five complete, unambiguous questions', () => {
  for (const course of courses) {
    expect(courseQuizIds(course.id).sort()).toEqual(modulesFor(course.id).map(m => currentQuizId(m.id)).sort());
    for (const module of modulesFor(course.id)) {
      const questions = moduleQuiz(currentQuizId(module.id), course.grade);
      expect(questions).toHaveLength(5);
      expect(new Set(questions.map(q => q.id)).size).toBe(5);
      for (const question of questions) { expect(question.prompt.length).toBeGreaterThan(15); expect(question.explanation.length).toBeGreaterThan(25); expect(new Set(question.options).size).toBe(3); expect(question.options[question.correct]).toBeTruthy(); }
      expect(quizScore(currentQuizId(module.id), questions.map(q => q.correct))).toBe(5);
    }
  }
});
it('uses age-banded questions with real topic-specific content', () => {
  expect(moduleQuiz('grade-1-sequences')[0].prompt).not.toBe(moduleQuiz('grade-5-sequences')[0].prompt);
  expect(moduleQuiz('grade-6-loops')[0].code).toContain('for j');
  expect(moduleQuiz('grade-3-variables')[0].explanation).toContain('2 + 3 = 5');
  expect(moduleQuiz('unknown')).toEqual([]);
});
it('validates answer ranges and record sizes instead of trusting a numeric score', () => {
  expect(quizRecord.safeParse(emptyQuiz()).success).toBe(true);
  expect(quizRecord.safeParse({ ...emptyQuiz(), answers: [4, 0, 1, 2, 0] }).success).toBe(false);
  expect(quizRecord.safeParse({ ...emptyQuiz(), answers: [0] }).success).toBe(false);
  expect(quizRecord.safeParse({ ...emptyQuiz(), submittedAnswers: [null, 0, 1, 2, 0] }).success).toBe(false);
});
it('round trips draft answers, attempts, results and quiz position through student cloud storage', () => {
  const value = document(); value.quizzes!['grade-5-loops'] = { ...emptyQuiz(), answers: [1, null, 2, null, null] };
  expect(collectCloud('grade-5', hydrateCloud('grade-5', value))).toEqual(value);
  const entries = hydrateCloud('grade-5', value);
  expect(parseSave(entries[SAVE_KEY]).quizzes['grade-5-loops'].answers[0]).toBe(1);
  expect(validCourseDocument('grade-5', progressDocument.parse(value))).toBe(true);
});
it('rejects cross-course and nonexistent module quiz IDs and invalid resume destinations', () => {
  expect(validCourseDocument('grade-5', { ...document(), quizzes: { 'grade-6-loops': emptyQuiz() } })).toBe(false);
  expect(validCourseDocument('grade-1', { ...document(), currentId: 'grade-1-sequences-1', quizModuleId: 'grade-1-loops', quizzes: {} })).toBe(false);
});
it('keeps old saves compatible and preserves quiz work when changing public courses', () => {
  const save = emptySave(); save.quizzes['grade-1-sequences'] = emptyQuiz();
  expect(switchCourse(save, 'grade-2').quizzes).toEqual(save.quizzes);
  const old = { ...emptySave(), quizzes: undefined };
  expect(parseSave(JSON.stringify(old)).quizzes).toEqual({});
});
it('protects earned quiz results and counts a zero-score submission as completed', () => {
  const value = document(), id = currentQuizId('grade-5-loops'), correct = moduleQuiz(id).map(q => q.correct);
  value.quizzes![id] = { version: 1, answers: correct, submittedAnswers: correct, bestAnswers: correct, attempts: 2 };
  const retry = document(); retry.quizzes![id] = { ...emptyQuiz(), attempts: 1, bestAnswers: correct.map(answer => (answer + 1) % 3) };
  const protectedDocument = preserveAchievements(value, retry);
  expect(protectedDocument.quizzes![id].bestAnswers).toEqual(correct);
  expect(protectedDocument.quizzes![id].attempts).toBe(2);
  expect(summarizeProgress('grade-5', { revision: 1, document: protectedDocument, updatedAt: null })).toMatchObject({ quizCompleted: 1, quizTotal: 13 });
  retry.quizzes![id].bestAnswers = correct.map(answer => (answer + 1) % 3);
  expect(summarizeProgress('grade-5', { revision: 1, document: retry, updatedAt: null }).quizResults.find(q => q.id === id)).toMatchObject({ submitted: true, best: 0 });
});
