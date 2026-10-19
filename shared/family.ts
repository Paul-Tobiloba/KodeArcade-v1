import type { reportSummary, ChallengeReport } from './reports.js';
import type { GradeKey } from './progress.js';

export type HomeCourse = ReturnType<typeof reportSummary> & { course: GradeKey; challenges: ChallengeReport[] };
export type HomeChild = { id: string; displayName: string; grade: number; loginMethod: 'picture' | 'text'; active: boolean; username: string; homeCode: string; contextId: string; courses: HomeCourse[] };
export type Family = { id: string; name: string; children: HomeChild[]; generatedAt: string };
