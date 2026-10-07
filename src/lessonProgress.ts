import { moduleFor } from './curriculum';
import type { Save } from './storage';

// Legacy per-challenge lesson flags remain valid; one introduction belongs to a concept.
export function needsLesson(save: Save, missionId: string) {
  return !moduleFor(missionId).challengeIds.some(id => save.progress[id]?.lessonSeen || save.progress[id]?.complete);
}
