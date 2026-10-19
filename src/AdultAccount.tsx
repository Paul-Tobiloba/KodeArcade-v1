import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { accountErrorMessage, accountRequest, callbackParameter, type Capabilities } from './account-api';
import { AdultGuide, Notice, Password, Submit } from './AccountUI';

export default function AdultAccount({ route, capabilities }: { route: string; capabilities?: Capabilities }) {
  const signup = route === 'signup', reset = route === 'reset-password', recovery = route === 'forgot-password', verify = route === 'check-email', mfa = route === 'two-factor';
  const parent = callbackParameter('', location.hash, 'role') === 'parent';
  const school = callbackParameter(location.search, location.hash, 'role') === 'school';
  const roleQuery = school ? '?role=school' : parent ? '?role=parent' : '?role=teacher';
  const destination = school ? '/schools?setup=1' : parent ? '/family' : '/dashboard';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [backup, setBackup] = useState(false);
  const [token] = useState(() => reset ? callbackParameter(location.search, location.hash, 'token') : null);
  const [callbackError] = useState(() => callbackParameter(location.search, location.hash, 'error'));
  useEffect(() => {
    if ((reset && token) || callbackError) history.replaceState(null, '', `${location.pathname}#/${route}${school ? '?role=school' : parent ? '?role=parent' : ''}`);
  }, [reset, token, callbackError, route]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim().toLowerCase();
    const password = String(data.get('password') ?? '');
    try {
      if ((signup || reset) && password !== data.get('confirm')) { setError('The passwords do not match. Please enter them again.'); return; }
      if (signup) {
        await accountRequest('auth/sign-up/email', { name: String(data.get('name')).trim(), email, password, callbackURL: `${location.origin}/#/email-verified${roleQuery}` }); setDone(true);
      } else if (recovery) {
        await accountRequest('auth/request-password-reset', { email, redirectTo: `${location.origin}/#/reset-password${roleQuery}` }); setDone(true);
      } else if (verify) {
        await accountRequest('auth/send-verification-email', { email, callbackURL: `${location.origin}/#/email-verified${roleQuery}` }); setDone(true);
      } else if (reset) {
        if (!token) { setError('This recovery link is missing or expired. Request a new one.'); return; }
        await accountRequest('auth/reset-password', { token, newPassword: password }); setDone(true);
      } else if (mfa) {
        await accountRequest(`auth/two-factor/${backup ? 'verify-backup-code' : 'verify-totp'}`, { code: String(data.get('code')).replace(/\s/g, ''), trustDevice: false }); location.hash = destination;
      } else {
        const result = await accountRequest<{ twoFactorRedirect?: boolean }>('auth/sign-in/email', { email, password, rememberMe: false });
        location.hash = result.twoFactorRedirect ? `/two-factor${roleQuery}` : destination;
      }
    } catch (failure) { setError(accountErrorMessage(failure)); }
    finally { setBusy(false); }
  }
  const title = signup ? `${school ? 'School administrator' : parent ? 'Parent' : 'Teacher'} sign up` : recovery ? 'Forgot your password?' : reset ? 'Choose a new password' : verify ? 'Check your inbox' : mfa ? 'One more security check' : school ? 'Sign in to set up your school' : 'Welcome back';
  if (route === 'email-verified') return <section className="account-panel"><ShieldCheck className="account-heading-icon" size={34} /><h1>{callbackError ? 'This link needs another try' : 'Ready to sign in'}</h1><p>{callbackError ? 'Your verification link may have expired or already been used. Request a fresh link below.' : school ? 'If you followed a valid verification link, your email is now confirmed. Sign in to create your school workspace.' : 'If you followed a valid verification link, your email is now confirmed. Sign in to set up your teacher or parent workspace.'}</p><a className="account-button primary" href={`/#/${callbackError ? 'check-email' : 'adult-login'}${roleQuery}`}>{callbackError ? 'Send a new link' : 'Sign in'}<ArrowRight size={18} /></a></section>;
  if (done) return <section className="account-panel"><Check size={34} className="account-heading-icon" /><h1>{reset ? 'Password updated' : 'Check your inbox'}</h1><p>{reset ? 'Sign in with your new password. Other sessions have been signed out.' : recovery ? 'If an eligible adult account matches, a recovery link is on its way. It expires in 15 minutes.' : 'Open the KodeArcade verification email and click the link to verify your email address. The link expires in one hour.'}</p>{!reset && <p>Can’t find it? Check your spam or junk folder, or request another email below.</p>}{school && <p>After signing in, you’ll create your school workspace. No school or staff access has been created yet.</p>}<a className="account-button primary" href={`/#/adult-login${roleQuery}`}>Back to sign in<ArrowRight size={18} /></a>{!reset && <a className="account-inline-link" href={`/#/${recovery ? 'forgot-password' : 'check-email'}${roleQuery}`}>{recovery ? 'Request another recovery email' : 'Resend verification email'}</a>}</section>;
  return <section className="account-panel account-adult-panel"><div className="account-form-column"><h1>{title}</h1><p>{signup ? 'Teachers and parents use an email address. Children do not need one.' : recovery ? 'We’ll send a recovery link for your adult account. Students should ask their teacher for a new login card.' : verify ? 'Open your verification email to finish creating your adult account. Need a new link? Enter your email below.' : reset ? 'Use at least 12 characters. A longer, unique passphrase works well.' : mfa ? 'Enter the code from your authenticator app. We won’t remember this shared device.' : 'Sign in with your adult account. Students use a classroom code instead.'}</p>
    {!mfa && capabilities?.adultAccounts === false && <Notice>Adult accounts are not enabled on this server yet. The public preview is available below.</Notice>}
    {school && !reset && !recovery && !verify && !mfa && <p>You’ll use your own adult account, then create a separate school workspace. Signing up does not grant access to an existing school. Invited staff should use their administrator’s invitation link.</p>}
    {error && <Notice error>{error}</Notice>}
    {reset && !token ? <><Notice error>This recovery link is missing or expired.</Notice><a className="account-button primary" href="/#/forgot-password">Request a new link<ArrowRight size={18} /></a></> : <form onSubmit={submit} aria-busy={busy}>
      {signup && <label className="account-field">Your name<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label>}
      {!reset && !mfa && <label className="account-field">Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>}
      {!recovery && !verify && !mfa && <Password fresh={signup || reset} />}
      {(signup || reset) && <><p className="account-field-help">At least 12 characters. Never use a child’s login password.</p><Password name="confirm" label="Confirm password" fresh /></>}
      {mfa && <label className="account-field">{backup ? 'Backup code' : 'Authenticator code'}<input name="code" autoComplete="one-time-code" inputMode={backup ? 'text' : 'numeric'} pattern={backup ? undefined : '[0-9 ]{6,9}'} maxLength={40} required autoFocus /></label>}
      <Submit busy={busy} disabled={!mfa && capabilities?.adultAccounts === false}>{signup ? 'Create adult account' : recovery ? 'Send recovery link' : reset ? 'Update password' : verify ? 'Resend verification email' : mfa ? 'Verify and sign in' : 'Sign in'}</Submit>
    </form>}
    {mfa ? <button className="account-text-button" onClick={() => { setBackup(!backup); setError(''); }}>{backup ? 'Use my authenticator app' : 'Use a backup code instead'}</button> : !signup && !reset && !recovery && !verify ? <div className="account-recovery-links"><a href={`/#/forgot-password${roleQuery}`}>Forgot password?</a><a href={`/#/check-email${roleQuery}`}>Resend verification email</a><span>New here? <a href={`/#/signup${roleQuery}`}>Create an adult account</a></span></div> : signup ? <p className="account-inline-link">Already have an account? <a href={`/#/adult-login${roleQuery}`}>Sign in</a></p> : null}
    </div><AdultGuide parent={parent} />
  </section>;
}
