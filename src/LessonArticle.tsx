import { ArrowRight, BookOpen, Check, Clock3, Code2 } from 'lucide-react';
import type { LearningModule } from './curriculum';
import type { Mission } from './learning';

type Props = { module: LearningModule; mission?: Mission; onStart: () => void; previouslySeen: boolean };
export default function LessonArticle({ module, mission, onStart, previouslySeen }: Props) {
  const { lesson } = module;
  return <section className="lesson-layout" aria-label={`${module.title} lesson`}>
    <article className="lesson-article">
      <div className="lesson-reading-meta"><span><BookOpen size={16} /> Read, then try it</span><span><Clock3 size={16} /> About 3 minutes</span></div>
      <p className="lesson-introduction">{lesson.introduction}</p>
      {lesson.sections.map(section => <section className="lesson-section" key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}
      <div className="lesson-takeaway"><Check size={21} /><p>{lesson.takeaway}</p></div>
      {mission && <div className="lesson-ready"><h2>Try it: {mission.title}</h2><p>{mission.description}</p><p><strong>Your goal:</strong> {mission.goal}</p><button className="primary" onClick={onStart}>{previouslySeen ? 'Continue to challenge' : 'Start challenge'}<ArrowRight size={18} /></button><small>You can reopen this lesson from the workspace whenever you need it.</small></div>}
    </article>
    <aside className="lesson-example" aria-label="Worked example">
      <div className="example-heading"><Code2 size={21} /><h2>{lesson.example.title}</h2></div>
      <ol className="example-blocks">{lesson.example.steps.map((step, index) => <li className={step.startsWith('    ') ? 'example-nested' : ''} key={index}><span>{step.trim()}</span></li>)}</ol>
      <p>{lesson.example.explanation}</p>
      <div className="module-outline"><h3>{module.status === 'upcoming' ? 'Planned challenges' : 'In this module'}</h3>{module.status === 'upcoming' ? <ol>{module.plannedChallenges?.map(title => <li key={title}>{title}</li>)}</ol> : <p>{module.challengeIds.length} {module.id === 'project' ? 'creative project' : 'challenges'} to explore this idea.</p>}</div>
      {module.status === 'upcoming' && <p className="upcoming-note">In development. This topic has a place in your learning path; its challenges are not available in this preview.</p>}
    </aside>
  </section>;
}
