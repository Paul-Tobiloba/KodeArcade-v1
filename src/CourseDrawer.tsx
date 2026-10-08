import { useEffect, useRef } from 'react';
import { Check, ChevronDown, ChevronRight, Compass, Flag, Lightbulb, X } from 'lucide-react';
import { modulesFor } from './curriculum';
import { missions } from './learning';
import type { Save } from './storage';
import { courseFor } from './courses';
type Props = { basics?: boolean; open: boolean; small: boolean; currentModule: string; currentMission: string; save: Save; onClose: () => void; onModule: (id: string) => void; onChallenge: (id: string) => void; toggle: React.RefObject<HTMLButtonElement | null> };

export default function CourseDrawer({ basics, open, small, currentModule, currentMission, save, onClose, onModule, onChallenge, toggle }: Props) {
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
  const modules = modulesFor(save.course);
  const total = modules.filter(m => m.status === 'available' && (m.topicId ?? m.id) !== 'project').flatMap(m => m.challengeIds);
  const complete = total.filter(id => save.progress[id]?.complete).length;
  return <>
    {open && small && <button className="drawer-backdrop" aria-label="Close module drawer" tabIndex={-1} onClick={onClose} />}
    <aside ref={drawer} id="module-drawer" className={`course-drawer ${open ? 'is-open' : ''}`} aria-label="Learning modules" aria-hidden={!open} inert={!open} role={small ? 'dialog' : undefined} aria-modal={small && open ? true : undefined}>
      <div className="drawer-heading"><Compass size={24} /><div><h2>{basics ? 'Computer Explorers' : courseFor(save.course).title}</h2><p>Your current course</p></div><button aria-label="Close modules" onClick={onClose}><X size={18} /></button></div>
      <div className="drawer-progress"><span>{basics ? `${save.basicsComplete.length} of 20 activities complete` : `${complete} of ${total.length} challenges complete`}</span><progress aria-label="Challenges completed" value={basics ? save.basicsComplete.length : complete} max={basics ? 20 : total.length} /></div>
      {basics ? <div className="drawer-note"><div><h3>Mouse & touch</h3><p>10 activities: point, click, carry and drop.</p><h3>Keyboard</h3><p>10 activities: keys, arrows and first words.</p><p>Choose a module and activity in the practice area.</p></div></div> : <nav aria-label="Modules"><ul className="module-list">{modules.filter(module => module.status === 'available').map((module, index) => {
        const selected = module.id === currentModule;
        const count = module.challengeIds.filter(id => save.progress[id]?.complete).length;
        return <li key={module.id} className={selected ? 'current-module' : ''}>
          <button className="module-button" aria-expanded={selected && module.status === 'available'} onClick={() => onModule(module.id)}><span className="module-symbol">{(module.topicId ?? module.id) === 'project' ? <Flag size={16} /> : count && count === module.challengeIds.length ? <Check size={16} /> : index + 1}</span><span><strong>{module.title}</strong><small>{module.status === 'upcoming' ? 'Coming next' : (module.topicId ?? module.id) === 'project' ? 'Create your own route' : `${count} / ${module.challengeIds.length} challenges`}</small></span>{selected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
          {selected && module.status === 'available' && <ol className="challenge-list">{module.challengeIds.map((id, challengeIndex) => <li key={id}><button className={currentMission === id ? 'selected-challenge' : ''} aria-current={currentMission === id ? 'step' : undefined} onClick={() => onChallenge(id)}><span>{save.progress[id]?.complete ? <Check size={14} /> : challengeIndex + 1}</span>{missions.find(m => m.id === id)!.title}</button></li>)}</ol>}
        </li>;
      })}</ul></nav>}
      <div className="drawer-note"><Lightbulb size={19} /><p>Learn a new idea, then practise. Reopen a lesson whenever you need it.</p></div>
    </aside>
  </>;
}
