import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Star, X } from 'lucide-react';

type Props = { open: boolean; stars: number; message: string; reduced: boolean; nextTitle?: string; onStar: () => void; onClose: () => void; onNext: () => void };
export default function FeedbackDialog({ open, stars, message, reduced, nextTitle, onStar, onClose, onNext }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    setRevealed(0);
    if (!open) { dialog.current?.close(); return; }
    if (!dialog.current?.open) dialog.current?.showModal();
    title.current?.focus();
    const timers = Array.from({ length: stars }, (_, index) => setTimeout(() => { setRevealed(index + 1); onStar(); }, 250 + index * 350));
    return () => { timers.forEach(clearTimeout); };
  }, [open, stars, onStar]);
  return <dialog ref={dialog} className={`feedback-dialog success star-dialog ${reduced ? 'still-stars' : ''}`} aria-labelledby="feedback-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <button className="celebration-close" aria-label="Close feedback" onClick={onClose}><X size={22} /></button>
    <div className="reward-stars" role="img" aria-label={`You earned ${stars} of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" size={54} className={index < revealed ? 'earned' : 'unearned'} fill={index < revealed ? 'currentColor' : 'none'} />)}</div>
    <h2 id="feedback-title" ref={title} tabIndex={-1}>You made it!</h2><p className="feedback-message">{message}</p>
    <button className="primary celebration-next" onClick={nextTitle ? onNext : onClose}>{nextTitle ? 'Next challenge' : 'Keep exploring'}<ArrowRight size={22} /></button>
    {nextTitle && <p className="next-challenge-label">Up next: {nextTitle}</p>}
  </dialog>;
}
