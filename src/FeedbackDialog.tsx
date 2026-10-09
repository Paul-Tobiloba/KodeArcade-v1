import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Star, X } from 'lucide-react';

type Props = { open: boolean; stars: number; message: string; reduced: boolean; nextTitle?: string; onStar: () => void; onClose: () => void; onNext: () => void };
export default function FeedbackDialog({ open, stars, message, reduced, nextTitle, onStar, onClose, onNext }: Props) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [revealed, setRevealed] = useState(0);
  const [confetti, setConfetti] = useState(false);
  useEffect(() => {
    setConfetti(open && !reduced);
    if (!open || reduced) return;
    const timer = setTimeout(() => setConfetti(false), 2800);
    return () => clearTimeout(timer);
  }, [open, reduced]);
  useEffect(() => {
    setRevealed(0);
    if (!open) { dialog.current?.close(); return; }
    if (!dialog.current?.open) dialog.current?.showModal();
    title.current?.focus();
    const timers = Array.from({ length: stars }, (_, index) => setTimeout(() => { setRevealed(index + 1); onStar(); }, 250 + index * 350));
    return () => { timers.forEach(clearTimeout); };
  }, [open, stars, onStar]);
  return <dialog ref={dialog} className={`feedback-dialog success star-dialog ${reduced ? 'still-stars' : ''}`} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}>
    {confetti && <div className="celebration-confetti" aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <i key={i} style={{ '--confetti-x': `${(i * 37) % 100}vw`, '--confetti-drift': `${(i % 2 ? 1 : -1) * (20 + i % 7 * 8)}px`, '--confetti-delay': `${i % 6 * 60}ms`, '--confetti-color': ['#6d4aff','#0f9f8f','#f6c445','#b53e75'][i % 4] } as CSSProperties} />)}</div>}
    <button className="celebration-close" aria-label="Close feedback" onClick={onClose}><X size={22} /></button>
    <div className="reward-stars" role="img" aria-label={`You earned ${stars} of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" size={54} className={index < revealed ? 'earned' : 'unearned'} fill={index < revealed ? 'currentColor' : 'none'} />)}</div>
    <h2 id={titleId} ref={title} tabIndex={-1}>You made it!</h2><p className="feedback-message">{message}</p>
    <button className="primary celebration-next" onClick={nextTitle ? onNext : onClose}>{nextTitle ? 'Next challenge' : 'Keep exploring'}<ArrowRight size={22} /></button>
    {nextTitle && <p className="next-challenge-label">Up next: {nextTitle}</p>}
  </dialog>;
}
