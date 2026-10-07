import { useState } from 'react';
import { ArrowRight, BookOpen, MousePointer2 } from 'lucide-react';
import { courses } from './courses';
import { loadSave } from './storage';

export default function LearningEntry() {
  const [explore, setExplore] = useState(false);
  const [{ save, resumed }] = useState(loadSave);
  return <div className="learning-entry"><header className="topbar"><a className="brand" href="/"><img className="brand-symbol" src="/brand/mark-color.svg" alt="" width="36" height="36" /><span className="brand-wordmark">KodeArcade</span></a></header>
    <main className="entry-content"><h1>Where shall we begin?</h1><p>Choose your age group for a starting point, or explore every course. You can change your choice anytime. No birthday or account needed.</p>
      <div className="entry-tabs" role="group" aria-label="Find your course"><button className={!explore ? 'primary' : 'secondary'} aria-pressed={!explore} onClick={() => setExplore(false)}>Choose by age</button><button className={explore ? 'primary' : 'secondary'} aria-pressed={explore} onClick={() => setExplore(true)}>Explore courses</button></div>
      {resumed && <a className="entry-resume" href={`/#/learn/${save.course}`}>Continue {courses.find(course => course.id === save.course)!.title}<ArrowRight size={20} /></a>}
      <section className="entry-options" aria-label={explore ? 'Available courses' : 'Age groups'}>{courses.map(course => <a className="entry-option" key={course.id} href={`/#/learn/${course.id}`}><span className="entry-age">Ages {course.ages}</span><div><h2>{course.title}</h2><p>{course.description}</p>{explore && <small>Sequences · Direction & order · Loops · Debugging · Creative project</small>}</div><ArrowRight size={24} /></a>)}
        <a className="entry-option" href="/#/learn/computer"><MousePointer2 size={30} /><div><h2>Computer Explorers</h2><p>New to a computer? Practise clicking, dragging and using the keyboard before coding.</p><small>Ages 6+ · 20 activities</small></div><ArrowRight size={24} /></a></section>
      <p className="entry-note"><BookOpen size={18} /> Ages are a guide, not a gate. Pick the course that feels comfortable.</p>
    </main></div>;
}
