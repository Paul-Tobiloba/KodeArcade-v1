import { z } from 'zod';
import { progressCatalog } from './progress-catalog.js';
import { courseQuizIds, quizRecord, quizScore, quizTitle } from './quizzes.js';
export const curriculumVersion = 'kodearcade-grades-2026-10';
export type GradeKey = keyof typeof progressCatalog;
export const gradeKey = z.enum(['grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6']);
const integer = z.number().int().min(0).max(100000);
const workspace = z.record(z.string(), z.unknown()).refine(value => JSON.stringify(value).length <= 100000);
const achievement = { attempts: integer, complete: z.boolean(), stars: z.number().int().min(1).max(5).optional() };
const challenge = z.object({ ...achievement, hints: z.number().int().min(0).max(4), blocks: z.array(z.object({ id: z.string().max(100), kind: z.enum(['up', 'down', 'left', 'right', 'repeat']), direction: z.enum(['up', 'down', 'left', 'right']).optional(), count: z.number().int().min(2).max(5).optional() })).max(24), lessonSeen: z.boolean().optional(), workspace: workspace.optional(), textCode: z.string().max(10000).optional(), codingMode: z.enum(['blocks', 'text']).optional(), worldLayout: z.enum(['tiles-v1', 'open-v1']).optional(), end: z.object({ x: z.number().int().min(0).max(9), y: z.number().int().min(0).max(9) }).optional() });
const drawing = z.object({ ...achievement, code: z.string().max(10000).optional(), blockCode: z.string().max(10000).optional(), workspace: workspace.optional(), mode: z.enum(['blocks', 'text']).optional(), ink: z.enum(['#6d4aff', '#08796e', '#b53e75']).optional(), width: z.union([z.literal(2), z.literal(4), z.literal(6)]).optional() });
export const progressDocument = z.object({
  version: z.literal(1), currentId: z.string().max(100), view: z.enum(['lesson', 'challenge', 'drawing', 'quiz']), drawingId: z.string().max(50).optional(), quizModuleId: z.string().max(100).optional(),
  quizzes: z.record(z.string().max(100), quizRecord).refine(value => Object.keys(value).length <= 7).optional(),
  progress: z.record(z.string().max(100), challenge), drawings: z.record(z.string().max(50), drawing),
  preferences: z.object({ reducedMotion: z.boolean(), largeText: z.boolean(), soundEnabled: z.boolean(), musicEnabled: z.boolean() }),
  basicsComplete: z.array(z.string().regex(/^(mouse|keyboard)-[0-9]$/)).max(20),
  topicRecords: z.record(z.string().max(100), z.object({ watched: z.boolean(), guided: z.boolean(), mastered: z.boolean(), masteryAttempts: integer })).refine(value => Object.keys(value).length <= 20),
});
export type ProgressDocument = z.infer<typeof progressDocument>;
export type CloudSnapshot = { revision: number; document: ProgressDocument | null; updatedAt: string | null };
export function validCourseDocument(course: GradeKey, document: ProgressDocument) {
  const catalog = progressCatalog[course];
  return catalog.missions.some(m => m.id === document.currentId)
    && Object.keys(document.progress).every(id => catalog.missions.some(m => m.id === id))
    && Object.keys(document.drawings).every(id => catalog.drawings.some(d => d.id === id))
    && Object.keys(document.quizzes ?? {}).every(id => courseQuizIds(course).includes(id))
    && Object.entries(document.quizzes ?? {}).every(([id, result]) => !result.submittedAnswers || quizScore(id, result.bestAnswers) >= quizScore(id, result.submittedAnswers))
    && (document.view !== 'quiz' || courseQuizIds(course).includes(document.quizModuleId ?? ''))
    && (document.view !== 'drawing' || catalog.drawings.some(d => d.id === document.drawingId));
}
// New drafts may change; previously earned achievements never decrease on a retry.
export function preserveAchievements(previous: ProgressDocument | null, next: ProgressDocument): ProgressDocument {
  if (!previous) return next;
  for (const [id, old] of Object.entries(previous.quizzes ?? {})) {
    next.quizzes ??= {};
    const current = next.quizzes[id];
    if (!current) { next.quizzes[id] = old; continue; }
    current.attempts = Math.max(current.attempts, old.attempts);
    if (old.bestAnswers && (!current.bestAnswers || quizScore(id, old.bestAnswers) > quizScore(id, current.bestAnswers))) current.bestAnswers = old.bestAnswers;
  }
  for (const kind of ['progress', 'drawings'] as const) for (const [id, old] of Object.entries(previous[kind])) {
    const current = next[kind][id];
    if (!current) { Object.assign(next[kind], { [id]: old }); continue; }
    current.complete ||= old.complete;
    current.attempts = Math.max(current.attempts, old.attempts);
    if (current.complete) current.stars = Math.max(current.stars ?? 1, old.stars ?? 1);
  }
  return next;
}
export function summarizeProgress(course: GradeKey, snapshot?: CloudSnapshot) {
  const catalog = progressCatalog[course], document = snapshot?.document;
  const completed = catalog.challenges.filter(id => document?.progress[id]?.complete).length;
  const stars = catalog.challenges.reduce((sum, id) => sum + (document?.progress[id]?.complete ? document.progress[id].stars ?? 1 : 0), 0);
  const quizResults = courseQuizIds(course).map(id => { const result = document?.quizzes?.[id]; return { id, title: quizTitle(id), submitted: !!result?.bestAnswers, best: result?.bestAnswers ? quizScore(id, result.bestAnswers) : null, latest: result?.submittedAnswers ? quizScore(id, result.submittedAnswers) : null, total: 5, attempts: result?.attempts ?? 0 }; });
  return { completed, total: catalog.challenges.length, stars, drawingCompleted: Object.values(document?.drawings ?? {}).filter(d => d.complete).length, drawingTotal: catalog.drawings.length, quizCompleted: quizResults.filter(item => item.submitted).length, quizTotal: quizResults.length, quizResults, currentId: document?.currentId, view: document?.view, drawingId: document?.drawingId, updatedAt: snapshot?.updatedAt ?? null, started: !!document };
}
