import { useState } from 'react';
import { ArrowRight, Blocks, BookOpen, Bug, Compass, GitBranch, Keyboard, MousePointer2, Repeat2, Route, Variable } from 'lucide-react';
import { courses, courseFor } from './courses';
import { loadSave } from './storage';
import CharacterSprite from './CharacterSprite';
import LabCards from './LabCards';
import TypingCards from './TypingCards';
import PracticalCards from './PracticalCards';
import PlatformHeader from './PlatformHeader';

const courseArtwork = [
  { concept: 'Sequences', icon: Route }, { concept: 'Direction & order', icon: Compass },
  { concept: 'Loops', icon: Repeat2 }, { concept: 'Debugging', icon: Bug },
  { concept: 'Conditionals', icon: GitBranch }, { concept: 'Variables', icon: Variable },
];

export default function LearningEntry() {
  const [explore, setExplore] = useState(false);
  const [subject, setSubject] = useState<'coding' | 'typing'>(() => location.hash.includes('subject=typing') ? 'typing' : 'coding');
  const [{ save, resumed }] = useState(loadSave);
  const previewCourse = courses.find(course => course.id === save.course);
  const byteCourse = previewCourse && (previewCourse.grade ?? 0) >= 3 ? previewCourse : courses[2];
  const artistCourse = previewCourse ?? courses[0];
  return <div className="learning-entry"><PlatformHeader/>
    <main className="entry-content"><h1>Where shall we begin?</h1><p>Choose your grade for a starting point, or explore every course. You can change your choice anytime. No birthday or account needed.</p>
      <div className="entry-subjects" role="group" aria-label="Course subject"><button aria-pressed={subject === 'coding'} onClick={() => setSubject('coding')}><Blocks size={18} />Coding</button><button aria-pressed={subject === 'typing'} onClick={() => setSubject('typing')}><Keyboard size={18} />Typing</button></div>
      {subject === 'typing' ? <section aria-label="Typing courses"><p className="typing-subject-description">Find your fingers, build a steady rhythm and make words your own. Six grade courses, with 120 activities each. Accuracy before speed.</p><TypingCards /></section> : <><div className="entry-tabs" role="group" aria-label="Find your course"><button className={!explore ? 'primary' : 'secondary'} aria-pressed={!explore} onClick={() => setExplore(false)}>Choose by grade</button><button className={explore ? 'primary' : 'secondary'} aria-pressed={explore} onClick={() => setExplore(true)}>Explore courses</button></div>
      {resumed && <a className="entry-resume" href={`/#/learn/${save.course}`}>Continue {courseFor(save.course).title}<ArrowRight size={20} /></a>}
      <section className="entry-options" aria-label={explore ? 'Available courses' : 'Grades'}>{courses.map((course, index) => { const artwork = courseArtwork[index], Icon = artwork.icon; return <a className="entry-option" key={course.id} href={`/#/learn/${course.id}`}><div className="entry-world-art" aria-hidden="true"><CharacterSprite concept={artwork.concept} fallback={<Icon size={32} />} /></div><div className="entry-course-copy"><h2>{course.title}</h2><p>{course.description}</p><small>Suggested ages {course.ages} · {course.size}×{course.size} board</small>{explore && <small>{course.topics.join(' · ')} · Creative project</small>}</div><ArrowRight size={24} /></a>; })}
        <a className="entry-option entry-computer" href="/#/learn/computer"><div className="entry-world-art" aria-hidden="true"><CharacterSprite concept="Computer Explorers" fallback={<MousePointer2 size={32} />} /></div><div className="entry-course-copy"><h2><MousePointer2 size={20} /> Computer Explorers</h2><p>New to a computer? Practise clicking, dragging and using the keyboard before coding.</p><small>Ages 6+ · 20 activities</small></div><ArrowRight size={24} /></a></section><PracticalCards/></>}
      <section className="entry-labs" aria-labelledby="entry-labs-title"><h2 id="entry-labs-title">Labs</h2><p>Make games, build apps or draw with code. Preview work stays in this browser, separate from student accounts.</p><LabCards links={{
        byte: { href: `/#/learn/${byteCourse.id}/lab`, label: `Open Byte Lab preview · Grade ${byteCourse.grade}` },
        app: { href: '/#/app-lab', label: 'Open App Lab preview' },
        artist: { href: `/#/learn/${artistCourse.id}/art`, label: `Open Artist Lab preview · Grade ${artistCourse.grade}` },
      }} /></section>
      <p className="entry-note"><BookOpen size={18} /> Grades and ages are a guide, not a gate. Pick the course that feels comfortable.</p>
    </main></div>;
}
