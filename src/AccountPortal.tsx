import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, LayoutDashboard, LockKeyhole, Settings, ShieldCheck, Users } from 'lucide-react';
import { AccountError, accountErrorMessage, accountRequest, workspaceHref, type Account, type Capabilities } from './account-api';
import AdultAccount from './AdultAccount';
import AccountWorkspace, { Onboarding } from './AccountWorkspace';
import StudentLogin from './StudentLogin';
import StudentCourses from './StudentCourses';
import { Notice } from './AccountUI';
import LoadingScreen from './LoadingScreen';
import FamilyManager from './FamilyManager';
import './account.css';

const privateRoutes = new Set(['family', 'onboarding', 'dashboard', 'classes', 'classroom', 'class-new', 'learners', 'learner-new', 'account-settings', 'schools', 'school-join']);
privateRoutes.add('byte-lab');

export default function AccountPortal({ route }: { route: string }) {
  const [capabilities, setCapabilities] = useState<Capabilities>();
  const [account, setAccount] = useState<Account>();
  const [loading, setLoading] = useState(privateRoutes.has(route));
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    document.title = `${route === 'student-login' ? 'Student login' : route === 'signup' ? 'Create an adult account' : 'Your account'} | KodeArcade`;
    const controller = new AbortController();
    accountRequest<Capabilities>('capabilities', undefined, controller.signal).then(setCapabilities).catch(() => { if (!controller.signal.aborted) setCapabilities(undefined); });
    if (privateRoutes.has(route)) {
      setLoading(true); setLoadError('');
      accountRequest<Account>('account', undefined, controller.signal).then(data => {
        if (!Array.isArray(data.workspaces) || !Array.isArray(data.classes) || !data.profile) throw new AccountError(0, 'CONNECTION');
        setAccount(data);
      }).catch(error => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof AccountError && error.status === 401 ? 'Sign in to open your workspace.' : accountErrorMessage(error));
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }
    return () => { controller.abort(); document.title = 'KodeArcade — Play. Build. Learn.'; };
  }, [route, retry]);
  if (route === 'student-courses') return <StudentCourses />;
  const dashboard = privateRoutes.has(route) && route !== 'onboarding' && account && !loading && !loadError;
  const params = new URLSearchParams(location.hash.split('?')[1]);
  const classWorkspace = account?.classes.find(room => room.id === params.get('id'))?.organizationId;
  const workspace = account?.workspaces.find(item => item.id === (params.get('workspace') ?? classWorkspace)) ?? account?.workspaces.find(item => item.kind === 'teacher_workspace') ?? account?.workspaces[0];
  const scopedAccount = account ? { ...account, workspaces: workspace ? [workspace] : [], classes: account.classes.filter(room => room.organizationId ? room.organizationId === workspace?.id : account.workspaces.length <= 1) } : undefined;
  const family = route === 'family' || (workspace?.kind === 'family' && ['dashboard', 'learners', 'classes', 'learner-new', 'class-new'].includes(route));
  return <div className={`account-portal account-illustrated ${route === 'login' ? 'account-chooser-screen' : 'account-flow-screen'} ${dashboard ? 'account-dashboard-screen' : ''}`}>
    <div className="account-scenery" aria-hidden="true">
      <img className="account-world" src="/images/auth/island-world.png" alt="" />
      <img className="account-world-code" src="/images/auth/code-symbol.png" alt="" />
      <img className="account-byte" src="/images/auth/byte-peek.png" alt="" />
    </div>
    <a className="skip-link" href="#account-main">Skip to content</a><header className="account-header"><a className="account-brand" href="/" aria-label="KodeArcade home"><img src="/brand/mark-color.svg" width="34" height="38" alt="" /><span>KodeArcade</span></a><nav aria-label="Account navigation"><a className="account-header-extra" href="/#/how-it-works">How it works</a><a className="account-header-extra" href="/#/courses">Courses</a><a className="account-header-extra" href="/#/parents">For parents</a><a href="/#/learn">Try an activity</a><a className="account-header-login" href={dashboard ? '/#/account-settings' : '/#/login'}>{dashboard ? 'Account settings' : 'Log in'}</a></nav></header>
    {dashboard && family ? <main id="account-main"><FamilyManager account={account} refresh={() => setRetry(n => n + 1)} /></main> : dashboard && scopedAccount ? <div className="account-workspace"><aside className="account-sidebar"><h2>{workspace?.name ?? 'Your workspace'}</h2>{account.workspaces.length > 0 && <label className="account-field account-workspace-switch">Workspace<select value={workspace?.id ?? ''} onChange={event => { location.hash = `/dashboard?workspace=${encodeURIComponent(event.target.value)}`; }}>{account.workspaces.map(item => <option key={item.id} value={item.id}>{item.name} ({item.kind === 'school' ? 'School' : item.kind === 'family' ? 'Family' : 'Personal'})</option>)}</select></label>}<nav aria-label="Workspace navigation">{[{ href: 'dashboard', label: 'Overview', icon: LayoutDashboard }, { href: 'classes', label: 'Classes', icon: GraduationCap }, { href: 'learners', label: 'Learners', icon: Users }, { href: 'family', label: 'Family portal', icon: Users }, { href: 'schools', label: workspace?.kind === 'school' && workspace.role === 'school_admin' ? 'School administration' : 'Schools', icon: ShieldCheck }, { href: 'account-settings', label: 'Account & security', icon: Settings }].map(({ href, label, icon: Icon }) => <a href={workspaceHref(href, workspace?.id)} key={href} aria-current={route === href ? 'page' : undefined}><Icon size={20} />{label}</a>)}</nav><p><ShieldCheck size={18} />{workspace?.kind === 'school' ? 'School classes belong to this school. Personal classes stay separate.' : 'Your personal workspace is separate from school memberships.'}</p></aside><main id="account-main" className="account-workspace-main"><AccountWorkspace route={route} account={scopedAccount} capabilities={capabilities} refresh={() => setRetry(n => n + 1)} /></main></div>
      : <main id="account-main" className={`account-entry ${route === 'login' ? 'account-chooser-layout' : ''}`}>{route !== 'login' && <a className="account-back" href="/#/login"><ArrowLeft size={17} />Choose another login</a>}
        {loading ? <LoadingScreen embedded label="Opening your workspace…" /> : loadError ? <section className="account-panel"><h1>Let’s get you back in</h1><Notice error>{loadError}</Notice><a className="account-button primary" href={route === 'family' ? '/#/adult-login?role=parent' : '/#/adult-login'}>Adult login<ArrowRight size={18} /></a><button className="account-button" onClick={() => setRetry(n => n + 1)}>Try again</button></section> : route === 'login' ? <Chooser /> : route === 'student-login' || route === 'home-login' ? <StudentLogin capabilities={capabilities} home={route === 'home-login'} /> : route === 'onboarding' && account ? <Onboarding account={account} /> : <AdultAccount route={route} capabilities={capabilities} />}
        <p className="account-footnote"><LockKeyhole size={15} />On a shared computer? Sign out when you finish.<br /><a href="/#/learn">Just exploring? Try an activity without an account.</a>{route === 'login' && <><br />Signed-in students can save and resume their assigned activities.</>}</p>
      </main>}
  </div>;
}
function Chooser() {
  return <section className="account-choice-panel" aria-labelledby="account-welcome"><div className="account-intro"><h1 id="account-welcome">Welcome to <span>KodeArcade</span></h1><p>Choose how you want to sign in.</p></div><div className="account-role-list">
    <a className="account-student-door" href="/#/student-login"><img src="/images/auth/student-bag.png" width="88" height="93" alt="" /><div><h2>Student</h2><p>Use your classroom code, then log in individually to access your assigned courses.</p></div><span className="account-role-action">Continue <ArrowRight aria-hidden="true" /></span></a>
    <a className="account-teacher-door" href="/#/adult-login?role=teacher"><img src="/images/auth/teacher-board.png" width="90" height="77" alt="" /><div><h2>Teacher</h2><p>Create classes, manage pupils, choose login methods, and print login cards.</p></div><span className="account-role-action">Continue <ArrowRight aria-hidden="true" /></span></a>
    <a className="account-parent-door" href="/#/adult-login?role=parent"><img src="/images/auth/parent-family.png" width="101" height="107" alt="" /><div><h2>Parent</h2><p>Connect to your child, support learning at home, and view progress.</p></div><span className="account-role-action">Continue <ArrowRight aria-hidden="true" /></span></a>
  </div><p><a href="/#/home-login">Have a home login card? Home learner sign-in<ArrowRight size={16} /></a></p></section>;
}
