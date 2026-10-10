import { ArrowRight, Pencil } from 'lucide-react';
import ActivityList from './ActivityList';
import { readDrawingWork } from './DrawingLab';
import { drawingsForTopic } from './drawingActivities';
import { missions } from './learning';
import type { LearningModule } from './curriculum';
import type { Save } from './storage';

export function DrawingPractice({ save, module, onDrawing }: { save: Save; module: LearningModule; onDrawing: (index: number) => void }) {
  const activities = drawingsForTopic(save.course, module.topicId ?? module.id);
  if (!activities.length) return null;
  const items = activities.map(({ activity, index }) => {
    const work = readDrawingWork(save.course, activity.id);
    return { id: String(index), title: activity.title, description: activity.objective, complete: !!work.complete, started: !!work.attempts, drawing: true };
  });
  const next = items.find(item => !item.complete) ?? items[0];
  return <section className="module-drawing" aria-label={`${module.title} drawing activities`}>
    <div className="module-section-heading"><div><h2><Pencil size={20} />Draw with code</h2><p>Practise {module.title.toLowerCase()} with Dash’s pencil. These optional activities save separately from your core challenges.</p></div><button className="secondary" onClick={() => onDrawing(Number(next.id))}>Open drawing lab<ArrowRight size={17} /></button></div>
    <ActivityList items={items} label="Drawing activities" onSelect={id => onDrawing(Number(id))} />
  </section>;
}

export function NextModule({ module, next, onNext }: { module: LearningModule; next?: LearningModule; onNext: () => void }) {
  return <footer className="module-next"><div><h2>{next ? `Next: ${next.title}` : 'Keep creating'}</h2><p>{next ? 'Move on when you’re ready. You can return to this module any time.' : `You’ve reached the last module in this course. Revisit an activity or explore another grade.`}</p></div>{next ? <button className="primary" onClick={onNext}>Next module<ArrowRight size={19} /></button> : <a className="secondary" href="/#/learn">Explore courses<ArrowRight size={19} /></a>}<span className="sr-only">After {module.title}</span></footer>;
}

export default function ModulePractice({ save, module, onActivity, onDrawing }: { save: Save; module: LearningModule; onActivity: (id: string) => void; onDrawing: (index: number) => void }) {
  const items = module.challengeIds.map(id => {
    const mission = missions.find(item => item.id === id)!;
    const progress = save.progress[id];
    return { id, title: mission.title, description: mission.goal, complete: !!progress?.complete, started: !!progress?.attempts };
  });
  const completed = items.filter(item => item.complete).length;
  return <section className="module-practice" aria-label={`${module.title} activities`}>
    <div className="module-section-heading"><div><h2>{module.title === 'Build project' ? 'Your project' : 'Your challenges'}</h2><p>{completed} of {items.length} complete. Your best results stay saved when you practise again.</p></div></div>
    <ActivityList items={items} label="Core activities" onSelect={onActivity} />
    <DrawingPractice save={save} module={module} onDrawing={onDrawing} />
  </section>;
}
