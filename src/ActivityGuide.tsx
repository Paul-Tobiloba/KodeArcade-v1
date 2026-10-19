import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, Flag, Lightbulb, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import type { Lesson } from './curriculum';
import ReadAloud from './ReadAloud';
import ByteHelp from './ByteHelp';
import { byteTopic } from '../shared/byte';
import type { ByteProgram } from './byteProgramHelp';

type Props = { lesson: Lesson; concept: string; byteProgram?: ByteProgram; title: string; instruction: string; goal: string; first: boolean; hints: string[]; hintCount: number; hintsOpen: boolean; hintCost?: string; running: boolean; onHint: () => void; onCloseHints: () => void; onBack?: () => void; backLabel?: string; lessonRequest?: number; onOverview?: () => void; onReplayTour?: () => void };

/** Help belongs beside the task on desktop, and folds above it on small screens. */
export default function ActivityGuide({ lesson, concept, byteProgram, title, instruction, goal, first, hints, hintCount, hintsOpen, hintCost, running, onHint, onCloseHints, onBack, backLabel, lessonRequest = 0, onOverview, onReplayTour }: Props) {
  const [wide, setWide] = useState(() => matchMedia('(min-width: 1101px) and (min-height: 601px)').matches);
  const [expanded, setExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const minimized = wide && collapsed;
  const [reading, setReading] = useState(() => first && matchMedia('(min-width: 1101px) and (min-height: 601px)').matches);
  const hintHeading = useRef<HTMLHeadingElement>(null);
  const conceptHeading = useRef<HTMLElement>(null);
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
    setExpanded(true); setCollapsed(false);
    requestAnimationFrame(() => { hintHeading.current?.scrollIntoView({ block: 'nearest' }); hintHeading.current?.focus({ preventScroll: true }); });
  }, [hintsOpen]);
  useEffect(() => {
    if (!lessonRequest) return;
    setExpanded(true); setReading(true); setCollapsed(false);
  }, [lessonRequest]);
  useEffect(() => {
    // Wait until the folded content is actually mounted visibly before focus.
    if (!lessonRequest || minimized || (!wide && !expanded) || !reading) return;
    conceptHeading.current?.scrollIntoView({ block: 'nearest' });
    conceptHeading.current?.focus({ preventScroll: true });
  }, [lessonRequest, wide, expanded, reading, minimized]);
  return <aside className="activity-guide" data-collapsed={minimized} aria-label="Lesson and activity help">
    {wide ? <div className="activity-guide-header"><h2 className="activity-guide-title"><BookOpen size={20} /><span>Lesson & instructions</span></h2><button className="activity-guide-collapse" aria-label={minimized ? 'Expand lesson panel' : 'Minimize lesson panel'} title={minimized ? 'Expand lesson panel' : 'Minimize lesson panel'} aria-expanded={!minimized} aria-controls="activity-guide-content" onClick={() => setCollapsed(v => !v)}>{minimized ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}</button>{minimized && <span className="guide-rail-label" aria-hidden="true"><BookOpen size={20} />Lesson</span>}</div> : <button className="activity-guide-toggle" aria-expanded={expanded} aria-controls="activity-guide-content" onClick={() => setExpanded(v => !v)}><BookOpen size={20} /><span>Lesson & instructions</span><ChevronDown size={18} /></button>}
    <ByteHelp topic={byteTopic(concept)} goal={goal} program={byteProgram} />
    {(onOverview || onReplayTour) && <nav className="guide-navigation" aria-label="Learning help">{onOverview && <button disabled={running} onClick={onOverview}>Module overview</button>}{onReplayTour && <button className="replay-tour" disabled={running} onClick={onReplayTour}>Replay tour</button>}</nav>}
    <div id="activity-guide-content" className="activity-guide-content" hidden={minimized || (!wide && !expanded)}>
      {onBack && <button className="guide-back" disabled={running} onClick={onBack}><ArrowLeft size={17} />{backLabel ?? 'Back to module'}</button>}
      <details className="activity-concept" open={reading} onToggle={event => setReading(event.currentTarget.open)}>
        <summary ref={conceptHeading}><BookOpen size={17} /><span>{lesson.title}</span><ChevronDown size={16} /></summary>
        <div className="activity-reading"><ReadAloud text={[lesson.introduction, ...lesson.sections.map(s => `${s.title}. ${s.text}`), lesson.takeaway].join('. ')} label="Listen to topic" /><p>{lesson.introduction}</p>{lesson.sections.map(section => <section key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}<p className="activity-takeaway">{lesson.takeaway}</p><details className="activity-example"><summary>Worked example</summary><h3>{lesson.example.title}</h3><ol>{lesson.example.steps.map((text, index) => <li key={index}>{text}</li>)}</ol><p>{lesson.example.explanation}</p></details></div>
      </details>
      <section className="activity-instructions"><h2><Flag size={18} />Your activity</h2><h3>{title}</h3>{authoredInstruction && <p>{instruction}</p>}{(!authoredInstruction || goal !== instruction) && <p>{goal}</p>}</section>
      <section className="activity-hints" aria-label="Hints"><div className="activity-hint-heading"><h2 ref={hintHeading} tabIndex={-1}><Lightbulb size={18} />A little nudge?</h2>{hintsOpen && <button aria-label="Close hints" onClick={onCloseHints}><X size={17} /></button>}</div>{hintsOpen && hintCount > 0 && <p className="hint-current" aria-live="polite">{hints[Math.min(hints.length - 1, hintCount - 1)]}</p>}{hintCost && <p className="hint-cost">{hintCost}</p>}<button className="secondary" disabled={running || hintCount >= hints.length} onClick={onHint}>{hintCount ? 'Show next hint' : 'Reveal first hint'}<ChevronDown size={16} /></button></section>
    </div>
  </aside>;
}
