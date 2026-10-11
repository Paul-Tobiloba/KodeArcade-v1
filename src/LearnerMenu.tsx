import { useEffect, useRef, useState } from 'react';
import { ChevronDown, GraduationCap, LogOut, Settings, UserRound } from 'lucide-react';
import './learner-menu.css';

export type LearnerAccount = { displayName: string; signOut: () => Promise<void> };
export default function LearnerMenu({ account, onSettings, coursesCurrent = false }: { account: LearnerAccount; onSettings: () => void; coursesCurrent?: boolean }) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (disclosure.current && !disclosure.current.contains(event.target as Node)) disclosure.current.open = false; };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && disclosure.current?.open) { disclosure.current.open = false; trigger.current?.focus(); event.stopPropagation(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, []);
  return <nav className="learner-account-tools" aria-label="Student account">
    <a className="learner-courses-link" href="/#/student-courses" aria-current={coursesCurrent ? 'page' : undefined}><GraduationCap size={19} /><span>My courses</span></a>
    <details className="learner-account-menu" ref={disclosure} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
      <summary ref={trigger} aria-label="Open account options"><span className="learner-avatar"><UserRound size={23} /></span><ChevronDown size={15} /></summary>
      <div className="learner-account-dropdown"><strong>{account.displayName}</strong><p>Progress saves to your student account.</p>
        <button onClick={() => { if (disclosure.current) disclosure.current.open = false; onSettings(); }}><Settings size={18} />Settings</button>
        <a href="/#/student-courses"><GraduationCap size={18} />My courses</a>
        <button disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await account.signOut(); } catch { setError('Could not sign out. Check your connection and try again.'); } finally { setBusy(false); } }}><LogOut size={18} />{busy ? 'Signing out…' : 'Sign out'}</button>
        {error && <p role="alert">{error}</p>}
      </div>
    </details>
  </nav>;
}
