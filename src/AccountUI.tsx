import { useState, type ReactNode } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Check } from 'lucide-react';

export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div className={`account-notice ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'}>{children}</div>;
}
export function Password({ label = 'Password', name = 'password', fresh = false }: { label?: string; name?: string; fresh?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <label className="account-field">{label}<span className="account-password"><input name={name} type={visible ? 'text' : 'password'} autoComplete={fresh ? 'new-password' : 'current-password'} minLength={fresh ? 12 : undefined} maxLength={128} required /><button type="button" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></span></label>;
}
export function Submit({ busy, children, disabled = false }: { busy: boolean; children: ReactNode; disabled?: boolean }) {
  return <button className="account-button primary" type="submit" disabled={busy || disabled}>{busy ? 'Please wait…' : children}{!busy && <ArrowRight size={18} />}</button>;
}
export function AdultGuide({ parent = false }: { parent?: boolean }) {
  return <aside className={`account-guide ${parent ? 'is-parent' : ''}`} aria-label={parent ? 'For families' : 'For teachers'}>
    <img src={parent ? '/images/auth/parent-family.png' : '/images/auth/teacher-board.png'} width="160" height="160" alt="" />
    <h2>{parent ? 'A little support. A big adventure.' : 'Make room for bright ideas.'}</h2>
    <p>{parent ? 'Explore coding together, one small discovery at a time.' : 'Explore coding activities made for curious minds in Grades 1–6.'}</p>
    <ul><li><Check size={19} />Try activities without signing in</li><li><ShieldCheck size={19} />Keep your adult account private</li><li><LockKeyhole size={19} />Children won’t need an email</li></ul>
    <p className="account-guide-note">Teachers can manage classes and issue private login cards. Student cloud saving and teacher reports are connected. Family learner profiles are coming next. Public activity progress stays on this device.</p>
  </aside>;
}
export function LoginCardExample() {
  return <aside className="account-card-guide" aria-label="Example login card">
    <h2>Where do I find my code?</h2><p>Your teacher will give you a login card that looks like this:</p>
    <div className="account-card-example">
      <div className="account-card-brand"><img src="/brand/mark-color.svg" width="25" height="28" alt="" />KodeArcade</div>
      <strong className="account-example-label">Example only · not a real login</strong>
      <dl><div><dt>Classroom code</dt><dd>ABCD2345</dd></div><div><dt>Username</dt><dd>sabcdefgh</dd></div><div><dt>Password</dt><dd>On your card</dd></div></dl>
      <ol><li>Open KodeArcade</li><li>Enter your classroom code</li><li>Use your username and password</li></ol>
    </div><details className="account-help"><summary>Lost your login card?</summary><p>Ask your teacher for a replacement. Never borrow another student’s card or share your own password.</p></details>
  </aside>;
}
