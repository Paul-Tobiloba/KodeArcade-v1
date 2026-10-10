import { Check, ChevronRight } from 'lucide-react';

export type ActivityItem = { id: string; title: string; description: string; complete: boolean; started?: boolean; drawing?: boolean };

/** A learning sequence is a list, not a data table. The entire row is a target. */
export default function ActivityList({ items, onSelect, label }: { items: ActivityItem[]; onSelect: (id: string) => void; label: string }) {
  const next = items.find(item => !item.complete)?.id;
  return <ol className="activity-list" aria-label={label}>{items.map((item, index) => <li key={item.id}>
    <button className="activity-row" onClick={() => onSelect(item.id)} aria-current={item.id === next ? 'step' : undefined}>
      <span className={`activity-row-number ${item.complete ? 'is-complete' : ''}`} aria-hidden="true">{item.complete ? <Check size={18} strokeWidth={3} /> : index + 1}</span>
      <span className="activity-row-copy"><strong>{item.title}</strong><span>{item.description}</span></span>
      <span className="activity-row-action"><span>{item.complete ? 'Completed' : item.started ? 'Continue' : item.id === next ? 'Up next' : item.drawing ? 'Drawing' : 'Start'}</span><ChevronRight size={18} aria-hidden="true" /></span>
    </button>
  </li>)}</ol>;
}
