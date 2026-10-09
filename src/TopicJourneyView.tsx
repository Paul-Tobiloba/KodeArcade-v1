import { useState } from 'react';
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Award, Check, Play } from 'lucide-react';
import type { Save } from './storage';
import ReadAloud from './ReadAloud';
import { corePurposes, masteryMissions, sequenceCore, sequenceExtras, sequenceEvidence, sequenceManifest, type TopicRecord } from './topicJourney';

const arrows = { right: ArrowRight, left: ArrowLeft, up: ArrowUp, down: ArrowDown };
export default function TopicJourney({ save, onRecord, onActivity, onStart }: { save: Save; onRecord: (patch: Partial<TopicRecord>) => void; onActivity: (id: string) => void; onStart: () => void }) {
  const evidence = sequenceEvidence(save);
  const [view, setView] = useState<'learn'|'mastery'>('learn');
  const [guidedStep, setGuidedStep] = useState(0);
  const [question, setQuestion] = useState(0);
  const [message, setMessage] = useState('');
  const challenge = masteryMissions[question];
  const canAssess = evidence.completed === 10 && evidence.repaired;
  return <section className="topic-journey" aria-label="Sequences topic journey">
    <div className="journey-intro"><h2>Byte’s delivery route</h2><p>{sequenceManifest.objective}</p><ReadAloud label="Listen to lesson" text="A sequence is a set of instructions in order. Each arrow moves Byte one square. Watch, try the example, then build your own routes. You can always come back here." /></div>
    <nav className="journey-nav" aria-label="Topic stages"><button className="secondary" aria-current={view === 'learn' ? 'step' : undefined} onClick={() => setView('learn')}>Learn & practise</button><button className="secondary" disabled={!canAssess} aria-current={view === 'mastery' ? 'step' : undefined} onClick={() => { setView('mastery'); setMessage(''); }}>Show what you know{evidence.record.mastered && <Check size={18} />}</button></nav>
    {view === 'learn' ? <div className="journey-layout"><article>
      <h3>Watch: one arrow, one step</h3><video controls preload="metadata" playsInline src={sequenceManifest.video} aria-label="Sequence introduction: Byte moves right, right, then up" onEnded={() => onRecord({ watched: true })}><track kind="captions" src="/lessons/grade-1-sequences.vtt" srcLang="en" label="English" default /></video>
      <p>Byte starts at the bottom left. Right, right, up reaches the star. If we change the order, Byte visits different squares.</p>
      <ReadAloud label="Read video description" text="Byte starts at the bottom left. The star is two squares right and one square up. The instructions are right, right, up. Byte follows each arrow in order and reaches the star." />
      <button className="secondary" onClick={() => onRecord({ watched: true })}>{evidence.record.watched ? 'Introduction reviewed' : 'I read the introduction instead'}</button>
      <h3>Try it together</h3><p>Tap each step in order. Count the squares Byte moves.</p>
      <div className="guided-sequence" aria-label={`Example: ${guidedStep} of 3 steps shown`}>{(['right','right','up'] as const).map((direction, i) => { const Icon = arrows[direction]; return <span key={i} className={i < guidedStep ? 'shown' : ''}><Icon aria-hidden="true" /><span className="sr-only">{i + 1}: {direction}</span></span>; })}</div>
      <p aria-live="polite">{['Ready: Byte is at row 5, column 1.', 'Right: row 5, column 2.', 'Right again: row 5, column 3.', 'Up: row 4, column 3. Byte reached the star!'][guidedStep]}</p>
      <button className="secondary" onClick={() => { if (guidedStep === 3) setGuidedStep(0); else { setGuidedStep(guidedStep + 1); if (guidedStep === 2) onRecord({ guided: true }); } }}>{guidedStep === 3 ? 'Try the example again' : 'Show next step'}<Play size={16} /></button>
      <h3>Your ten challenges</h3><p>{evidence.completed} of 10 complete · {evidence.stars} / 50 core stars. You never need perfect stars to continue.</p><button className="primary" onClick={onStart}>Start challenge<ArrowRight size={18} /></button>
      <ol className="journey-challenges">{corePurposes.map(([title, purpose], i) => <li key={title}><button className="journey-challenge" onClick={() => onActivity(sequenceCore[i])}><strong>{i + 1}. {title}{save.progress[sequenceCore[i]]?.complete && <Check size={18} aria-label="Completed" />}</strong><span>{purpose}</span></button></li>)}</ol>
    </article><aside>
      <h3>Optional adventures</h3><p>These do not change your 50-star core total or block your badge.</p>{sequenceExtras.slice(0,2).map((id, i) => <button className="secondary" key={id} onClick={() => onActivity(id)}>Bonus {i + 1}{save.progress[id]?.complete && <Check size={18} />}</button>)}
      <h3>Repair a delivery</h3><p>Watch the broken program, find the wrong arrow, then test your repair.</p><button className="secondary" onClick={() => onActivity(sequenceExtras[2])}>Try the repair{evidence.repaired && <Check size={18} />}</button>
      <h3>Show what you know</h3><p>A short arrow mission, not a written exam. Finish the ten challenges and repair first.</p><button className="secondary" disabled={!canAssess} onClick={() => setView('mastery')}>Try the mastery mission{evidence.record.mastered && <Check size={18} />}</button>
      <h3>Create your delivery</h3><p>Choose a destination and make your own working sequence.</p><button className="secondary" onClick={() => onActivity(sequenceExtras[3])}>Build my mini-project{evidence.project && <Check size={18} />}</button>
      <div className="journey-badge"><Award size={34} /><h3>{evidence.badge ? 'Sequence Explorer earned!' : 'Your Sequence Explorer badge'}</h3><p>{evidence.badge ? 'You practised, repaired, showed your understanding and created a route.' : 'Review the introduction, finish the example and ten challenges, repair a route, complete the mastery mission and build your project.'}</p></div>
    </aside></div> : <article className="mastery-mission"><h3>{evidence.record.mastered ? 'You showed what you know!' : `Arrow mission ${question + 1} of 3`}</h3>{evidence.record.mastered ? <><p>You can predict and repair sequences. Now create a delivery route of your own.</p><button className="primary" onClick={() => onActivity(sequenceExtras[3])}>Build my mini-project<ArrowRight size={18} /></button></> : <><p>{challenge.prompt}</p><ReadAloud text={challenge.prompt} label="Listen to this mission" /><div className="mastery-options">{challenge.options.map((option, i) => <button className="secondary" key={i} aria-label={`Choose ${option.join(', ')}`} onClick={() => {
      onRecord({ masteryAttempts: evidence.record.masteryAttempts + 1 });
      if (i !== challenge.answer) { setMessage('Trace each arrow again. You can try another sequence.'); return; }
      if (question === masteryMissions.length - 1) { onRecord({ mastered: true }); setMessage('You did it! Your arrows are in the right order.'); }
      else { setQuestion(question + 1); setMessage('That sequence works. Try the next mission.'); }
    }}>{option.map((direction, j) => { const Icon = arrows[direction]; return <Icon key={j} aria-hidden="true" />; })}</button>)}</div></>}<p role="status">{message}</p><button className="secondary" onClick={() => setView('learn')}>Back to topic journey</button></article>}
  </section>;
}
