import { useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { findStudioTutorial, type StudioTutorialId } from './studioTutorials';

export default function StudioTutorialGuide({ tutorialId, running, onCategory }: { tutorialId: StudioTutorialId; running: boolean; onCategory: (category: string) => void }) {
  const tutorial = findStudioTutorial(tutorialId)!, [step, setStep] = useState(0), [expanded, setExpanded] = useState(() => !matchMedia('(max-width: 950px)').matches), contentId = useId();
  const current = tutorial.steps[step];
  const stepHeading = useRef<HTMLHeadingElement>(null);
  function goTo(next: number) { setStep(next); requestAnimationFrame(() => stepHeading.current?.focus({ preventScroll: true })); }
  return <section className="studio-tutorial" aria-label="Project tutorial">
    <div className="studio-tutorial-heading"><h2>{tutorial.title}</h2><span>Step {step + 1} of {tutorial.steps.length}</span><button aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(value => !value)}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}{expanded ? 'Minimize tutorial' : 'Show steps'}</button></div>
    <div id={contentId} hidden={!expanded}>
      <h3 ref={stepHeading} tabIndex={-1}>{current.title}</h3><p>{current.instruction}</p><p className="studio-tutorial-notice">{current.notice}</p>
      <div className="studio-tutorial-controls"><button disabled={step === 0} onClick={() => goTo(step - 1)}>Previous step</button><button disabled={running} onClick={() => onCategory(current.category)}>{running ? 'Stop to find blocks' : `Find ${current.category} blocks`}</button><button onClick={() => goTo(step === tutorial.steps.length - 1 ? 0 : step + 1)}>{step === tutorial.steps.length - 1 ? 'Start steps again' : 'Next step'}</button></div>
    </div>
  </section>;
}
