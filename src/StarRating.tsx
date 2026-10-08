import { Star } from 'lucide-react';

export default function StarRating({ value, label }: { value: number; label: string }) {
  return <span className="star-rating" role="img" aria-label={`${label}: ${value} of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={26} aria-hidden="true" className={index < value ? 'filled-star' : ''} fill={index < value ? 'currentColor' : 'none'} />)}</span>;
}
