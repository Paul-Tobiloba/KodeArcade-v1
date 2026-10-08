import { ArrowRight, ArrowUp, BookOpen, Check, Clock3, Code2, Repeat2 } from 'lucide-react';
import type { LearningModule } from './curriculum';
import type { Mission } from './learning';
import ReadAloud from './ReadAloud';
import { characterFor } from './characters';
import CharacterSprite from './CharacterSprite';

type Props = { module: LearningModule; mission?: Mission; onStart: () => void; previouslySeen: boolean; arrows?: boolean };
export default function LessonArticle({ module, mission, onStart, previouslySeen, arrows }: Props) {
  const { lesson } = module;
  const topic = module.topicId ?? module.id;
  const character = characterFor(module.title);
  const mentor = <div className="lesson-mentor">{character.name !== 'Byte' && <CharacterSprite concept={module.title} labelled />}<div><strong>{character.title}</strong><p>{character.world} · {module.title}</p></div></div>;
  const narration = [lesson.title, lesson.introduction, ...lesson.sections.flatMap(section => [section.title, section.text]), lesson.takeaway, lesson.example.title, ...lesson.example.steps, lesson.example.explanation].join('. ');
  const shortIntroduction = ( topic === 'loops' ? 'A loop does the same little dance again. Put an arrow inside Repeat and choose how many times.' : topic === 'debugging' ? 'Byte needs a little help! Play the program, watch the steps, then change an arrow and try again.' : topic === 'project' ? 'Choose a yellow star spot, then make a path for Byte. There is more than one way to get there!' : 'An arrow tells Byte where to go. Each arrow is one step. Put your arrows in order, then press Play.').replaceAll('Byte', character.name);
  if (arrows && mission && !mission.conditionals && !mission.variables) return <section className="little-lesson" aria-label={`${module.title} lesson`}><article>{mentor}<ReadAloud text={`${shortIntroduction} Say the steps together: right, right, up. Where would ${character.name} go? ${mission.title}. ${mission.goal}`} label="Listen to lesson" /><p className="lesson-introduction">{shortIntroduction}</p><div className="little-example" aria-label="Example: two steps right, then one step up">{topic === 'loops' && <Repeat2 size={34} />}<ArrowRight size={34} /><ArrowRight size={34} /><ArrowUp size={34} /></div><p>Say the steps together: right, right, up. Where would {character.name} go?</p><h2>Try it: {mission.title}</h2><p>{mission.goal}</p><button className="primary" onClick={onStart}>{previouslySeen ? 'Continue to challenge' : 'Start challenge'}<ArrowRight size={20} /></button><details><summary>Read more together</summary><p>{lesson.introduction}</p>{lesson.sections.map(section => <section key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}</details></article></section>;
  return <section className="lesson-layout" aria-label={`${module.title} lesson`}>
    <article className="lesson-article">
      {mentor}
      <ReadAloud text={narration} label="Listen to lesson" />
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
      <div className="module-outline"><h3>{module.status === 'upcoming' ? 'Planned challenges' : 'In this module'}</h3>{module.status === 'upcoming' ? <ol>{module.plannedChallenges?.map(title => <li key={title}>{title}</li>)}</ol> : <p>{module.challengeIds.length} {topic === 'project' ? 'creative project' : 'challenges'} to explore this idea.</p>}</div>
      {module.status === 'upcoming' && <p className="upcoming-note">In development. This topic has a place in your learning path; its challenges are not available in this preview.</p>}
    </aside>
  </section>;
}
