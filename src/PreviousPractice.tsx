import type { LearningModule } from './curriculum';
import type { Save } from './storage';
import { missions } from './learning';
import { quizScore } from '../shared/quizzes';
import ActivityList from './ActivityList';

export default function PreviousPractice({ save, module, onActivity }: { save: Save; module: LearningModule; onActivity: (id: string) => void }) {
  const items = (module.previousChallengeIds ?? []).filter(id => !module.challengeIds.includes(id) && !!save.progress[id]).map(id => {
    const mission = missions.find(item => item.id === id)!, progress = save.progress[id];
    return { id, title: mission.title, description: mission.goal, complete: progress.complete, started: progress.attempts > 0 };
  });
  const previousQuiz = module.topicId === 'sequences' ? save.quizzes[`${save.course}-directions`] : undefined;
  if (!items.length && !previousQuiz) return null;
  return <details className="previous-practice"><summary>Previous practice & saved results</summary>
    <p>These earlier activities are kept with your work. They are optional and do not add to the revised course total.</p>
    {items.length > 0 && <ActivityList items={items} label="Previous saved activities" onSelect={onActivity} />}
    {previousQuiz && <p>Previous direction quiz: {previousQuiz.bestAnswers ? `best result ${quizScore(`${save.course}-directions`, previousQuiz.bestAnswers)} / 5` : 'draft answers retained'}.</p>}
  </details>;
}
