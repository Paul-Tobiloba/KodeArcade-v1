import { ArrowRight, ShieldCheck } from 'lucide-react';

export function schoolSecurityHref(returnTo = location.hash.replace(/^#/, '')) {
  return `/#/account-settings?schoolSecurity=1&returnTo=${encodeURIComponent(returnTo)}`;
}

export function schoolSecurityReturn(hash = location.hash) {
  const path = new URLSearchParams(hash.split('?')[1]).get('returnTo') ?? '';
  return /^\/(schools|school-join|classes|classroom|class-new|learners|learner-new)(\?|$)/.test(path) && !/[\r\n#]/.test(path) ? `/#${path}` : '/#/schools?setup=1';
}

export default function SchoolMfaNotice() {
  return <section className="account-security-section" aria-labelledby="school-mfa-heading">
    <ShieldCheck size={28} aria-hidden="true" />
    <h2 id="school-mfa-heading">Protect your school with two-step verification</h2>
    <p>School administrators can access pupil records and manage staff. Set up an authenticator before creating a school or using administrator tools.</p>
    <p>This is optional for parents and teachers who are not school administrators. Your personal workspace stays separate.</p>
    <a className="account-button primary" href={schoolSecurityHref()}>Set up two-step verification<ArrowRight size={18} /></a>
  </section>;
}
