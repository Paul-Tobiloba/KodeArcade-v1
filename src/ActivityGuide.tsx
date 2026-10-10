import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, Flag, Lightbulb, X } from 'lucide-react';
import type { Lesson } from './curriculum';
import ReadAloud from './ReadAloud';

type Props = { lesson: Lesson; title: string; instruction: string; goal: string; first: boolean; hints: string[]; hintCount: number; hintsOpen: boolean; hintCost?: string; running: boolean; onHint: () => void; onCloseHints: () => void; onBack?: () => void; backLabel?: string };

/** Help belongs beside the task on desktop, and folds above it on small screens. */
export default function ActivityGuide({ lesson, title, instruction, goal, first, hints, hintCount, hintsOpen, hintCost, running, onHint, onCloseHints, onBack, backLabel }: Props) {
  const [wide, setWide] = useState(() => matchMedia('(min-width: 1101px) and (min-height: 601px)').matches);
  const [expanded, setExpanded] = useState(false);
  const [reading, setReading] = useState(() => first && matchMedia('(min-width: 1101px) and (min-height: 601px)').matches);
  const hintHeading = useRef<HTMLHeadingElement>(null);
  // Generated grade labels are context, not task instructions; the toolbar
  // already supplies that context. Preserve authored instructions otherwise.
  const authoredInstruction = !/^Grade [1-6]: practise /i.test(instruction);
  useEffect(() => {
    const query = matchMedia('(min-width: 1101px) and (min-height: 601px)');
    const change = () => setWide(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!hintsOpen) return;
    setExpanded(true);
    requestAnimationFrame(() => { hintHeading.current?.scrollIntoView({ block: 'nearest' }); hintHeading.current?.focus({ preventScroll: true }); });
  }, [hintsOpen]);
  return <aside className="activity-guide" aria-label="Lesson and activity help">
    {wide ? <h2 className="activity-guide-title"><BookOpen size={20} />Lesson & instructions</h2> : <button className="activity-guide-toggle" aria-expanded={expanded} aria-controls="activity-guide-content" onClick={() => setExpanded(v => !v)}><BookOpen size={20} /><span>Lesson & instructions</span><ChevronDown size={18} /></button>}
    <div id="activity-guide-content" className="activity-guide-content" hidden={!wide && !expanded}>
      {onBack && <button className="guide-back" disabled={running} onClick={onBack}><ArrowLeft size={17} />{backLabel ?? 'Back to module'}</button>}
      <details className="activity-concept" open={reading} onToggle={event => setReading(event.currentTarget.open)}>
        <summary><BookOpen size={17} /><span>{lesson.title}</span><ChevronDown size={16} /></summary>
        <div className="activity-reading"><ReadAloud text={[lesson.introduction, ...lesson.sections.map(s => `${s.title}. ${s.text}`), lesson.takeaway].join('. ')} label="Listen to topic" /><p>{lesson.introduction}</p>{lesson.sections.map(section => <section key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}<p className="activity-takeaway">{lesson.takeaway}</p><details className="activity-example"><summary>Worked example</summary><h3>{lesson.example.title}</h3><ol>{lesson.example.steps.map((text, index) => <li key={index}>{text}</li>)}</ol><p>{lesson.example.explanation}</p></details></div>
      </details>
      <section className="activity-instructions"><h2><Flag size={18} />Your activity</h2><h3>{title}</h3>{authoredInstruction && <p>{instruction}</p>}{(!authoredInstruction || goal !== instruction) && <p>{goal}</p>}</section>
      <section className="activity-hints" aria-label="Hints"><div className="activity-hint-heading"><h2 ref={hintHeading} tabIndex={-1}><Lightbulb size={18} />A little nudge?</h2>{hintsOpen && <button aria-label="Close hints" onClick={onCloseHints}><X size={17} /></button>}</div>{hintsOpen && hintCount > 0 && <p className="hint-current" aria-live="polite">{hints[Math.min(hints.length - 1, hintCount - 1)]}</p>}{hintCost && <p className="hint-cost">{hintCost}</p>}<button className="secondary" disabled={running || hintCount >= hints.length} onClick={onHint}>{hintCount ? 'Show next hint' : 'Reveal first hint'}<ChevronDown size={16} /></button></section>
    </div>
  </aside>;
}
