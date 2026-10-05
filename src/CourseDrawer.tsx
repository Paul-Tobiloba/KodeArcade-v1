import { useEffect, useRef } from 'react';
import { Check, ChevronDown, ChevronRight, Compass, Flag, Lightbulb, X } from 'lucide-react';
import { modules } from './curriculum';
import { missions } from './learning';
import type { Save } from './storage';
type Props = { open: boolean; small: boolean; currentModule: string; currentMission: string; save: Save; onClose: () => void; onModule: (id: string) => void; onChallenge: (id: string) => void; toggle: React.RefObject<HTMLButtonElement | null> };

export default function CourseDrawer({ open, small, currentModule, currentMission, save, onClose, onModule, onChallenge, toggle }: Props) {
  const drawer = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open || !small) return;
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    drawer.current?.querySelector<HTMLButtonElement>('button')?.focus();
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); toggle.current?.focus(); }
      if (event.key !== 'Tab') return;
      const controls = [toggle.current, ...Array.from(drawer.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])].filter((item): item is HTMLButtonElement => !!item);
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keyboard); };
  }, [open, small, onClose, toggle]);
  const total = modules.filter(m => m.status === 'available' && m.id !== 'project').flatMap(m => m.challengeIds);
  const complete = total.filter(id => save.progress[id]?.complete).length;
  return <>
    {open && small && <button className="drawer-backdrop" aria-label="Close module drawer" tabIndex={-1} onClick={onClose} />}
    <aside ref={drawer} id="module-drawer" className={`course-drawer ${open ? 'is-open' : ''}`} aria-label="Learning modules" aria-hidden={!open} inert={!open} role={small ? 'dialog' : undefined} aria-modal={small && open ? true : undefined}>
      <div className="drawer-heading"><Compass size={24} /><div><h2>Your learning path</h2><p>Small steps. Real discoveries.</p></div><button aria-label="Close modules" onClick={onClose}><X size={18} /></button></div>
      <div className="drawer-progress"><span>{complete} of {total.length} challenges complete</span><progress aria-label="Challenges completed" value={complete} max={total.length} /></div>
      <nav aria-label="Modules"><ul className="module-list">{modules.map((module, index) => {
        const selected = module.id === currentModule;
        const count = module.challengeIds.filter(id => save.progress[id]?.complete).length;
        return <li key={module.id} className={selected ? 'current-module' : ''}>
          <button className="module-button" aria-expanded={selected && module.status === 'available'} onClick={() => onModule(module.id)}><span className="module-symbol">{module.id === 'project' ? <Flag size={16} /> : count && count === module.challengeIds.length ? <Check size={16} /> : index + 1}</span><span><strong>{module.title}</strong><small>{module.status === 'upcoming' ? 'Coming next' : module.id === 'project' ? 'Create your own route' : `${count} / ${module.challengeIds.length} challenges`}</small></span>{selected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
          {selected && module.status === 'available' && <ol className="challenge-list">{module.challengeIds.map((id, challengeIndex) => <li key={id}><button className={currentMission === id ? 'selected-challenge' : ''} aria-current={currentMission === id ? 'step' : undefined} onClick={() => onChallenge(id)}><span>{save.progress[id]?.complete ? <Check size={14} /> : challengeIndex + 1}</span>{missions.find(m => m.id === id)!.title}</button></li>)}</ol>}
        </li>;
      })}</ul></nav>
      <div className="drawer-note"><Lightbulb size={19} /><p>Explore at your own pace. Every challenge starts with a little learning.</p></div>
    </aside>
  </>;
}
