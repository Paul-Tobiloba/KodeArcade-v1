import type { CSSProperties } from 'react';
import { Star } from 'lucide-react';
import './reward-stars.css';

export default function RewardStars({ value, revealed, reduced = false }: { value: number; revealed?: number; reduced?: boolean }) {
  return <div className={`reward-stars typing-stars${reduced ? ' typing-stars-still' : ''}`} role="img" aria-label={`You earned ${value} of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => <span key={index} className="reward-star-slot" aria-hidden="true"><span className={`reward-star ${index < (revealed ?? value) ? 'earned' : 'unearned'}`} style={{ '--star-delay': `${revealed === undefined ? 160 + index * 330 : 0}ms` } as CSSProperties}>
      <Star className="reward-star-outline" strokeWidth={1.2} />
      {index < (revealed ?? value) && <><img src="/images/rewards/golden-star.png" alt="" width="128" height="128" draggable={false} /><span className="reward-star-shine" /><span className="reward-star-sparks">{Array.from({ length: 7 }, (_, spark) => <Star key={spark} fill="currentColor" strokeWidth={0} style={{ '--spark-x': `${Math.cos(spark * Math.PI * 2 / 7) * 85}px`, '--spark-y': `${Math.sin(spark * Math.PI * 2 / 7) * 70}px`, '--spark-turn': `${spark * 55}deg` } as CSSProperties} />)}</span></>}
    </span></span>)}
  </div>;
}
