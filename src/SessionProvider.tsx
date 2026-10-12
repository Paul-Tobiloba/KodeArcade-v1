import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { adultIdleWarningMs } from '../shared/session-policy';
import './session.css';

export type SessionState = { user: { id: string; name: string; principalKind: 'adult' | 'learner' }; sessionKey: string; lastActiveAt: number; expiresAt: number };
const Context = createContext<{ session: SessionState | null; loading: boolean; refresh: () => Promise<void> }>({ session: null, loading: true, refresh: async () => undefined });
export const useAccountSession = () => useContext(Context);
export const dashboardHref = (session: SessionState | null) => session?.user.principalKind === 'learner' ? '/#/student-courses' : '/#/dashboard';

export default function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null), [loading, setLoading] = useState(true);
  const [gate, setGate] = useState<'warning' | 'expired' | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const current = useRef<SessionState | null>(null), previous = useRef<SessionState | null>(null), ignored = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null), nextHeartbeat = useRef(0), generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    try {
      const response = await fetch('/api/session', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json() as SessionState | null;
      if (request !== generation.current) return;
      if (data && (!data.user || !Number.isFinite(data.expiresAt) || !Number.isFinite(data.lastActiveAt))) return;
      if (data && previous.current && data.user.id !== previous.current.user.id) { location.reload(); return; }
      current.current = data; setSession(data);
      if (data) { previous.current = data; ignored.current = false; }
      else if (previous.current && !ignored.current) setGate('expired');
    } catch { /* Offline is not a sign-out. The local deadline still protects access. */ }
    finally { if (request === generation.current) setLoading(false); }
  }, []);
  const stay = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/session/activity', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (response.status === 401) { setGate('expired'); return; }
      if (!response.ok) throw new Error();
      nextHeartbeat.current = Date.now() + 60_000; await refresh(); setGate(null);
    } catch { setError('Could not reach your account. Check your connection and try again. Your open work stays here.'); }
    finally { setBusy(false); }
  }, [refresh]);
  useEffect(() => {
    void refresh();
    const check = () => {
      const value = current.current;
      if (!value) return;
      if (Date.now() >= value.expiresAt) { setGate('expired'); return; }
      if (value.user.principalKind === 'adult' && Date.now() - value.lastActiveAt >= adultIdleWarningMs) setGate('warning');
      else setGate(null);
    };
    const activity = () => {
      const value = current.current;
      if (!value || value.user.principalKind !== 'adult' || Date.now() - value.lastActiveAt >= adultIdleWarningMs || Date.now() >= value.expiresAt || Date.now() < nextHeartbeat.current) return;
      nextHeartbeat.current = Date.now() + 60_000;
      void fetch('/api/session/activity', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(response => { if (response.ok) void refresh(); else if (response.status === 401) setGate('expired'); }).catch(() => undefined);
    };
    const signedOut = () => { ++generation.current; ignored.current = true; previous.current = null; current.current = null; setSession(null); setGate(null); };
    const visible = () => { if (!document.hidden) { check(); void refresh(); } };
    const interval = setInterval(check, 1000), poll = setInterval(() => { if (!document.hidden) void refresh(); }, 30_000);
    document.addEventListener('pointerdown', activity, true); document.addEventListener('keydown', activity, true); document.addEventListener('scroll', activity, true);
    document.addEventListener('visibilitychange', visible); addEventListener('focus', visible); addEventListener('hashchange', refresh); addEventListener('kodearcade-signed-out', signedOut);
    return () => { ++generation.current; clearInterval(interval); clearInterval(poll); document.removeEventListener('pointerdown', activity, true); document.removeEventListener('keydown', activity, true); document.removeEventListener('scroll', activity, true); document.removeEventListener('visibilitychange', visible); removeEventListener('focus', visible); removeEventListener('hashchange', refresh); removeEventListener('kodearcade-signed-out', signedOut); };
  }, [refresh]);
  useEffect(() => { if (gate && !dialog.current?.open) dialog.current?.showModal(); else if (!gate) dialog.current?.close(); }, [gate]);
  const expired = gate === 'expired';
  return <Context.Provider value={{ session, loading, refresh }}>{children}<dialog className="session-dialog" ref={dialog} aria-labelledby="session-title" onCancel={event => event.preventDefault()}>
    <ShieldCheck size={30} aria-hidden="true" /><h2 id="session-title">{expired ? 'Sign in again to continue' : 'Still here?'}</h2>
    <p>{expired ? 'Your session has ended. This tab keeps your open work in memory; don’t close or refresh it yet.' : 'You’ve been inactive for 55 minutes. Your adult account will sign out at 60 minutes unless you choose to stay.'}</p>
    {expired && <p>Sign in to the same account in a new tab, then return here. Using a different account will reload this page to protect the previous account’s work.</p>}
    {error && <p role="alert">{error}</p>}
    <div className="session-actions">{expired ? <><a href="/#/login" target="_blank" rel="noopener">Open sign in</a><button disabled={busy} onClick={() => { void refresh().then(() => { if (current.current && Date.now() < current.current.expiresAt) setGate(null); else setError('Sign in in the new tab first, then check again.'); }); }}>I’ve signed in — check again</button></> : <><button autoFocus disabled={busy} onClick={() => { void stay(); }}>{busy ? 'Checking…' : 'Stay signed in'}</button><button disabled={busy} onClick={async () => { setBusy(true); try { const response = await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }); if (!response.ok) throw new Error(); current.current = null; setSession(null); setGate('expired'); } catch { setError('Sign-out failed. Try again.'); } finally { setBusy(false); } }}>Sign out</button></>}</div>
    {expired && <small>{previous.current?.user.principalKind === 'learner' ? 'Student sessions last up to 24 hours and do not have an idle timeout. Unsynced activity recovery remains subject to the existing device-recovery limits.' : 'Adult sessions end after 60 idle minutes or 24 hours from sign-in. Open work is kept in this tab, not saved across a refresh.'} Always sign out on shared computers.</small>}
  </dialog></Context.Provider>;
}
