import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Flag, HelpCircle } from 'lucide-react';
import ReadAloud from './ReadAloud';
import { placeTour, type TourLayout } from './tourLayout';
import './workspace-tour.css';

export type WorkspaceTourStep = { target: string; title: string; text: string };
type Props = { conceptLab?: boolean; creativeLab?: boolean; hidden: boolean; textMode: boolean; goal: string; instructions: number; steps?: WorkspaceTourStep[]; label?: string; headerSelector?: string; onFinish: (status: 'completed' | 'skipped') => void };

/** A nonmodal tour of the real workspace. Spotlight layers never intercept input. */
export default function WorkspaceTour({ conceptLab, creativeLab, hidden, textMode, goal, instructions, steps: suppliedSteps, label = 'Workspace tour', headerSelector = '.topbar', onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [layout, setLayout] = useState<TourLayout | null>(null);
  const card = useRef<HTMLElement>(null), title = useRef<HTMLHeadingElement>(null);
  const steps = suppliedSteps ?? [
    { target: '.scene-heading', title: 'Find your mission', text: `Read your goal here: ${goal} ${creativeLab ? 'Choose your characters and background below the stage. Free Byte Lab has no required answer.' : conceptLab ? 'Compare your values and output with the goal in the results panel.' : 'Look for your character and the path on the board.'}` },
    { target: creativeLab ? '.creative-category' : textMode ? '.text-reference' : '.blocklyFlyout', title: textMode ? 'Meet your commands' : 'Choose an instruction', text: creativeLab ? 'Choose a category: Events, Motion, Looks, Control, Sensing, Variables, Operators, Functions or Output. Event responses belong inside DO and wait until triggered.' : conceptLab ? 'Use number and Boolean blocks as inputs inside expressions. Function definitions and calls are instructions. The keyboard builder lets you choose each connection.' : textMode ? 'Open Commands & examples to see the instructions you can use. These are Python-style commands in a small teaching language.' : 'Tap a block to add it, or drag it into Your code. Each movement moves your character one square. Try adding a move now.' },
    { target: textMode ? '.text-editor textarea' : '.blockly-host', title: 'Build your code', text: creativeLab ? 'Connect actions and event registrations below Play. Put value blocks into matching inputs. The keyboard builder can add blocks and edit their connections and fields.' : conceptLab ? 'Connect instructions below Play; nested value blocks fill their inputs. In Text, write one instruction per line and indent groups with four spaces.' : textMode ? 'Write instructions here, one per line. Blocks and Text keep separate programs. Try typing move_right() on a new line.' : 'Connect your blocks below “when Play is pressed”. Your program runs from top to bottom. You can change, undo or clear your instructions.' },
    { target: '.run-controls', title: 'Try it with Play', text: creativeLab ? 'Play initializes the scene and registers events. Click the main character afterward to trigger its click response. Touch events happen when new contact begins. Reset clears runtime state, keeping your code and scene choices.' : conceptLab ? 'Press Play to trace your values, output and function calls. Reset clears the results without deleting your code.' : 'Press Play to run your real code. Watch what happens. Reset moves the character back without deleting your code. It is okay to try again!' },
    { target: '.activity-guide-header, .activity-guide-toggle', title: 'Help is always here', text: 'Open Lesson & instructions for the idea and worked example. Hints give a little nudge; Ask Byte helps with coding. Module overview lists your activities and quiz. The top-left button opens all modules.' },
  ];
  const current = steps[step];

  useLayoutEffect(() => {
    if (hidden) return;
    const target = document.querySelector<HTMLElement>(current.target);
    if (!target || !card.current) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!card.current || !target.isConnected) return;
        const bounds = target.getBoundingClientRect(), panel = card.current.getBoundingClientRect();
        const headerBottom = Math.max(0, document.querySelector(headerSelector)?.getBoundingClientRect().bottom ?? 0);
        setLayout(placeTour(bounds, panel, { width: innerWidth, height: innerHeight }, headerBottom, scrollY));
      });
    };
    const observer = new ResizeObserver(measure); observer.observe(target); observer.observe(card.current);
    window.addEventListener('resize', measure); window.addEventListener('scroll', measure, true);
    measure();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [current.target, hidden, headerSelector]);

  useEffect(() => {
    if (hidden) return;
    const target = document.querySelector(current.target);
    if (innerWidth <= 950 || innerHeight <= 600) {
      const header = document.querySelector(headerSelector)?.getBoundingClientRect().height ?? 0;
      if (target) window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + scrollY - header - 20), behavior: 'instant' });
    }
    title.current?.focus({ preventScroll: true });
  }, [step, current.target, hidden, headerSelector]);

  return hidden ? null : createPortal(<div className="workspace-tour">
    {layout && layout.target.height > 0 && <div className="tour-spotlight" aria-hidden="true" style={layout.target} />}
    <section ref={card} className="tour-card" data-placement={layout?.placement} role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-copy" style={layout ? { ...layout.card, '--tour-arrow-offset': `${layout.arrow}px` } as CSSProperties : undefined} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onFinish('skipped'); } }}>
      <div className="tour-heading"><span><Flag size={17} />{label} · {step + 1} of {steps.length}</span><button className="tour-skip" onClick={() => onFinish('skipped')}>Skip tour</button></div>
      <h2 id="tour-title" ref={title} tabIndex={-1}>{current.title}</h2>
      <p id="tour-copy">{current.text}</p>
      {step === 2 && instructions > 0 && <p className="tour-ready" role="status">An instruction is ready. You can test it with Play.</p>}
      <ReadAloud key={step} text={`${current.title}. ${current.text}`} label="Listen to this step" />
      <div className="tour-controls"><button className="secondary" disabled={step === 0} onClick={() => setStep(value => value - 1)}><ArrowLeft size={17} />Back</button><button className="primary" onClick={() => step === steps.length - 1 ? onFinish('completed') : setStep(value => value + 1)}>{step === steps.length - 1 ? 'Start exploring' : 'Next'}<ArrowRight size={18} /></button></div>
      <p className="tour-note"><HelpCircle size={15} />You can use the real controls while this tour is open.</p>
    </section>
  </div>, document.body);
}
