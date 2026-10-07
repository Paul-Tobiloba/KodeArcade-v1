import { useEffect, useRef } from 'react';
import { ArrowRight, Check, Compass, X } from 'lucide-react';
import type { RunResult } from './learning';
import ReadAloud from './ReadAloud';
type Props = { result: RunResult | null; open: boolean; reflection: string; recommendation: { title: string; reason: string; action: string } | null; nextTitle?: string; onClose: () => void; onNext: () => void; onReview: () => void };
export default function FeedbackDialog({ result, open, reflection, recommendation, nextTitle, onClose, onNext, onReview }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (open && result) { if (!dialog.current?.open) dialog.current?.showModal(); title.current?.focus(); } else dialog.current?.close(); }, [open, result]);
  return <dialog ref={dialog} className={`feedback-dialog ${result?.success ? 'success' : ''}`} aria-labelledby="feedback-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    {result && <><div className="feedback-top"><span className="feedback-symbol">{result.success ? <Check size={30} /> : <Compass size={30} />}</span><button aria-label="Close feedback" onClick={onClose}><X size={21} /></button></div>
      <h2 id="feedback-title" ref={title} tabIndex={-1}>{result.success ? 'You made it happen.' : 'A new clue for your code.'}</h2>
      <p className="feedback-message">{result.message}</p>
      {open && <ReadAloud text={`${result.message}. ${result.success ? reflection : ''}. ${recommendation?.reason ?? ''}`} label="Listen to feedback" />}
      {result.success && <div className="feedback-reflection"><h3>What you just explored</h3><p>{reflection}</p></div>}
      {recommendation && <div className="feedback-next"><h3>{recommendation.title}</h3><p>{recommendation.reason}</p></div>}
      <div className="feedback-actions">{result.success && nextTitle && <button className="primary" onClick={onNext}>Next challenge<ArrowRight size={18} /></button>}{recommendation?.action === 'review' && <button className="secondary" onClick={onReview}>Review the lesson</button>}<button className={result.success && nextTitle ? 'secondary' : 'primary'} onClick={onClose}>{result.success ? 'Explore another solution' : 'Back to my code'}</button></div>
      {result.success && nextTitle && <p className="next-challenge-label">Up next: {nextTitle}</p>}
    </>}
  </dialog>;
}
