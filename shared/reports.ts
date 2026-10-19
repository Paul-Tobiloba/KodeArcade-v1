import { progressCatalog } from './progress-catalog.js';
import { summarizeProgress, type CloudSnapshot, type GradeKey } from './progress.js';
export function reportSummary(course: GradeKey, snapshot?: CloudSnapshot) {
  const summary = summarizeProgress(course, snapshot), document = snapshot?.document;
  const checkIns = progressCatalog[course].challenges.flatMap(id => {
    const result = document?.progress[id];
    return result && !result.complete && (result.attempts >= 3 || result.hints >= 2) ? [id] : [];
  });
  const activeQuiz = summary.quizResults.find(item => item.id === document?.quizModuleId);
  const previousQuiz = summary.previousQuizResults.find(item => item.id === document?.quizModuleId);
  const lastActivity = document?.view === 'quiz' ? `${activeQuiz?.title ?? previousQuiz?.title ?? 'Module'} quiz${previousQuiz ? ' (previous version)' : ''}` : document?.view === 'drawing' ? progressCatalog[course].drawings.find(d => d.id === document.drawingId)?.title : progressCatalog[course].missions.find(m => m.id === document?.currentId)?.title;
  return { ...summary, checkIns: checkIns.length, lastActivity: lastActivity ?? 'Not started' };
}
export type StudentReport = ReturnType<typeof reportSummary> & { learnerId: string; displayName: string; active: boolean };
export type ClassReport = { course: GradeKey; students: StudentReport[]; generatedAt: string };
export type ChallengeReport = { id: string; title: string; complete: boolean; stars: number; attempts: number; hints: number };
