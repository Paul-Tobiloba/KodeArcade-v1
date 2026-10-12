import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, GraduationCap, HelpCircle, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { AccountError, accountErrorMessage, accountRequest } from './account-api';
import { Notice } from './AccountUI';
import { courses } from './courses';
import { activateStudentStorage, clearStudentStorage, hydrateStudentDrafts, studentDrafts, subscribeStudentDrafts } from './activityStorage';
import { CloudSaver, cloudSubmit, collectCloud, hydrateCloud, type SaveStatus } from './cloudProgress';
import { type CloudSnapshot, type GradeKey, type summarizeProgress } from '../shared/progress';
import LoadingScreen from './LoadingScreen';
import LearnerMenu from './LearnerMenu';
import { OfflineDraft, clearOfflineOwner, hasOfflineOwner, type RecoveryAccess } from './offlineDraft';
import './account.css';
import './student-dashboard.css';

const Activity = lazy(() => import('./App'));
let offlineOwner: string | undefined;
async function signOutStudent(confirmed = false, home = false) { if (!confirmed && hasOfflineOwner(offlineOwner) && !confirm('Unsynced recovery work is still on this device. Return to the activity to sync or download it. Sign out and remove these device copies anyway?')) return; await accountRequest('auth/sign-out', {}); clearOfflineOwner(offlineOwner); offlineOwner = undefined; clearStudentStorage(); location.hash = home ? '/home-login' : '/student-login'; }
type Context = { learnerId: string; classroomId: string; displayName: string; classroomName: string; learningContext?: 'home' | 'classroom'; offlineOwner?: string; assignments: { id: string; courseKey: string; progress?: ReturnType<typeof summarizeProgress> }[] };
function useStudentContext() {
  const [context, setContext] = useState<Context>();
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let latestCheck = 0;
    let hasContext = false;
    const check = () => {
      const request = ++latestCheck;
      return accountRequest<Context>('student/courses', undefined, controller.signal).then(value => { if (!controller.signal.aborted && request === latestCheck) { hasContext = true; offlineOwner = value.offlineOwner; setContext(value); setError(''); } }).catch(failure => { if (!controller.signal.aborted && request === latestCheck) { if (hasContext && failure instanceof AccountError && (failure.status === 0 || failure.status >= 500)) return; hasContext = false; clearStudentStorage(); setContext(undefined); setError(accountErrorMessage(failure)); } });
    };
    void check(); const interval = setInterval(() => { void check(); }, 30_000);
    const visible = () => { if (!document.hidden) void check(); };
    document.addEventListener('visibilitychange', visible);
    return () => { controller.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', visible); };
  }, []);
  return { context, error };
}
function StudentSignOut() {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <><button className="account-button" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await signOutStudent(); } catch (failure) { setError(accountErrorMessage(failure)); } finally { setBusy(false); } }}><LogOut size={18} />{busy ? 'Signing out…' : 'Sign out'}</button>{error && <Notice error>{error}</Notice>}</>;
}
export default function StudentCourses() {
  const { context, error } = useStudentContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileHeading = useRef<HTMLHeadingElement>(null);
  const home = context?.learningContext === 'home';
  useEffect(() => { document.title = 'My dashboard | KodeArcade'; }, []);
  useEffect(() => { if (profileOpen) profileHeading.current?.focus(); }, [profileOpen]);
  const assigned = context?.assignments.flatMap(assignment => {
    const course = courses.find(course => course.id === assignment.courseKey);
    return course ? [{ ...course, assignmentId: assignment.id, progress: assignment.progress }] : [];
  }) ?? [];
  return <div className="account-portal student-dashboard">
    <a className="skip-link" href="#student-main" onClick={event => { event.preventDefault(); document.getElementById('student-main')?.focus(); }}>Skip to content</a>
    <header className="student-dashboard-header">
      <a className="account-brand" href="/#/student-courses" aria-label="KodeArcade student dashboard"><img src="/brand/mark-color.svg" width="34" height="38" alt="" /><span>KodeArcade</span></a>
      {context && <LearnerMenu account={{ displayName: context.displayName, signOut: () => signOutStudent(false, home) }} onSettings={() => setProfileOpen(true)} coursesCurrent />}
    </header>
    <main id="student-main" tabIndex={-1} className="student-dashboard-main">
      {error ? <section className="student-dashboard-error"><h1>Let’s open your dashboard</h1><Notice error>{error}</Notice><button className="account-button" onClick={() => location.reload()}>Try again</button><p>If you need to sign in again, choose the login that matches your card.</p><div className="account-recovery-links"><a className="account-button primary" href="/#/home-login">Home learner sign in<ArrowRight size={18} /></a><a className="account-button" href="/#/student-login">Classroom student sign in<ArrowRight size={18} /></a></div><p>Check your connection, or ask your parent, guardian or teacher for help.</p></section> : !context ? <LoadingScreen embedded label="Opening your dashboard…" /> : <>
        <section className="student-welcome" aria-labelledby="student-welcome-title"><div><h1 id="student-welcome-title">Welcome, {context.displayName}!</h1><p>Ready for your next discovery? Choose a course below and make something happen.</p><span className="student-class-label"><GraduationCap size={20} />{context.classroomName}</span></div><img src="/images/adventure-sky.png" width="480" height="250" alt="" /></section>
        <div className="student-dashboard-columns">
          <section className="student-course-section" aria-labelledby="student-courses-title"><h2 id="student-courses-title">{home ? 'Your home adventures' : 'Your assigned courses'}</h2><p>{home ? 'Adventures chosen for you by your parent or guardian.' : 'Adventures chosen for you by your teacher.'}</p>
            {assigned.length ? <div className="student-course-grid">{assigned.map(course => <a className="account-assigned-course student-course" key={course.assignmentId} href={`/#/student-play/${course.id}`}><img src="/images/adventure-sky.png" width="480" height="250" alt="" /><div><h3>{course.title}</h3><p>{course.description}</p>{course.progress && <div className="student-course-progress"><label htmlFor={`progress-${course.id}`}>{course.progress.completed} of {course.progress.total} challenges complete</label><progress id={`progress-${course.id}`} value={course.progress.completed} max={course.progress.total} /><small>{course.progress.stars} stars · {course.progress.drawingCompleted} of {course.progress.drawingTotal} drawings complete · {course.progress.quizCompleted ?? 0} of {course.progress.quizTotal ?? 0} quizzes submitted</small></div>}<span>{course.progress?.started ? 'Continue learning' : 'Start learning'}<ArrowRight size={19} /></span></div></a>)}</div> : <div className="student-empty"><BookOpen size={30} /><h3>Your next adventure is on its way</h3><p>{home ? 'Ask your parent or guardian to choose a course in the family portal.' : 'Your teacher hasn’t assigned a course yet. Ask them what to work on next; new assignments will appear here.'}</p></div>}
          </section>
          <aside className="student-dashboard-help" aria-label="Your learning and help"><section><h2><GraduationCap size={21} />{home ? 'My home learning' : 'My classroom'}</h2><strong>{context.classroomName}</strong><p>Your {home ? 'parent or guardian' : 'teacher'} chooses your courses and helps with your login card.</p><button className="student-text-button" onClick={() => setProfileOpen(open => !open)}><UserRound size={18} />My profile & settings</button></section><section><h2><HelpCircle size={21} />Need a hand?</h2><details><summary>Forgot your password?</summary><p>Ask your {home ? 'parent or guardian' : 'teacher'} to reset your password and print a new login card. Keep your card private.</p></details><details><summary>Where is my progress?</summary><p>Your code, completed challenges and best stars save to your student account. Choose Continue learning to return to your last activity. Check for “Saved to your account” before closing an activity.</p></details><p className="student-shared-device"><ShieldCheck size={18} />Using a shared computer? Sign out from your avatar menu when you finish.</p></section></aside>
        </div>
        {profileOpen && <section className="student-profile" aria-labelledby="student-profile-title"><h2 id="student-profile-title" tabIndex={-1} ref={profileHeading}>My profile & settings</h2><dl><div><dt>Student name</dt><dd>{context.displayName}</dd></div><div><dt>{home ? 'Family' : 'Classroom'}</dt><dd>{context.classroomName}</dd></div></dl><p>Your {home ? 'parent or guardian' : 'teacher'} manages your name and login details. Sound, text size and motion preferences are available in Settings inside each activity.</p><button className="account-button" onClick={() => setProfileOpen(false)}>Close profile</button></section>}
        <p className="student-save-note">Your progress is saved privately to your student account. Public preview work stays separate.</p>
      </>}
    </main>
  </div>;
}
export function StudentActivity({ course }: { course: string }) {
  const { context, error } = useStudentContext();
  const identity = context ? `${context.learnerId}:${context.classroomId}` : '';
  const assigned = context?.assignments.some(assignment => assignment.courseKey === course);
  if (error || (context && !assigned)) return <div className="account-portal"><main className="account-entry"><section className="account-panel"><h1>This activity isn’t available</h1><Notice error>{error || 'This course has not been chosen for your learning profile.'}</Notice><a className="account-button primary" href="/#/student-courses">Back to my courses</a><StudentSignOut /></section></main></div>;
  if (!identity) return <LoadingScreen />;
  return <CloudActivity key={`${identity}:${course}`} context={context!} course={course as GradeKey} />;
}

function CloudActivity({ context, course }: { context: Context; course: GradeKey }) {
  const [saver, setSaver] = useState<CloudSaver>();
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [recoveryStatus, setRecoveryStatus] = useState<'writing' | 'protected' | 'unavailable'>('unavailable');
  const [recoveryNotice, setRecoveryNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    let current: CloudSaver | undefined, unsubscribe: (() => void) | undefined;
    void accountRequest<CloudSnapshot & { learnerId: string; classroomId: string; recovery?: RecoveryAccess }>(`student/progress/${course}`, undefined, controller.signal).then(async snapshot => {
      if (!active) return;
      if (snapshot.learnerId !== context.learnerId || snapshot.classroomId !== context.classroomId) throw new AccountError(401, 'UNAUTHORIZED');
      let store: OfflineDraft | undefined, draft = null;
      try { if (snapshot.recovery) { store = new OfflineDraft(snapshot.recovery, course); draft = await store.read(); } }
      catch { if (active) setRecoveryNotice('Device recovery is unavailable. Your account copy is unchanged; keep this tab open until saving finishes.'); }
      if (!active) return;
      activateStudentStorage(`${context.learnerId}:${context.classroomId}`);
      current = new CloudSaver(snapshot, cloudSubmit(course, context.learnerId, context.classroomId), state => { if (active) setStatus(state); }, store ? { store, draft, changed: state => { if (active) setRecoveryStatus(state); } } : undefined);
      hydrateStudentDrafts(hydrateCloud(course, current.document));
      unsubscribe = subscribeStudentDrafts(() => current!.update(collectCloud(course, studentDrafts())));
      setSaver(current);
      if (draft) { setRecoveryNotice('Recovered your unsaved work from this device.'); if (current.status !== 'conflict') void current.flush(); }
    }).catch(failure => { if (active) setError(accountErrorMessage(failure)); });
    return () => { active = false; controller.abort(); unsubscribe?.(); if (current) { void current.flush(); current.dispose(); } clearStudentStorage(); };
  }, [context.learnerId, context.classroomId, course]);
  useEffect(() => {
    if (!saver) return;
    const leaving = (event: BeforeUnloadEvent) => { if (saver.pending) { event.preventDefault(); event.returnValue = ''; } };
    const online = () => { void saver.flush(); };
    const hidden = () => { if (document.hidden) void saver.flush(); };
    const navigate = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || !saver.pending || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0 || link.hash === location.hash || link.hash === '#workspace') return;
      event.preventDefault(); const destination = link.href;
      void saver.flush().then(async saved => { if (saved || await saver.backedUp()) location.assign(destination); });
    };
    addEventListener('beforeunload', leaving); addEventListener('online', online); document.addEventListener('visibilitychange', hidden); document.addEventListener('click', navigate, true);
    return () => { removeEventListener('beforeunload', leaving); removeEventListener('online', online); document.removeEventListener('visibilitychange', hidden); document.removeEventListener('click', navigate, true); };
  }, [saver]);
  if (error) return <div className="account-panel"><h1>Your progress could not be loaded</h1><Notice error>{error}</Notice><p>We haven’t opened an empty activity over your saved work.</p><button className="account-button" onClick={() => location.reload()}>Try again</button><a href="/#/student-courses">My courses</a></div>;
  if (!saver) return <LoadingScreen label="Loading your saved work…" />;
  const signOut = async () => { if (!await saver.flush() && !confirm('Some work has not saved to your account. Sign out and remove this student’s device recovery copies? Download unsaved work first if needed.')) return; await saver.backedUp(); await signOutStudent(true, context.learningContext === 'home'); await saver.discardRecovery(); };
  const download = () => { const url = URL.createObjectURL(new Blob([saver.exportDraft()], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'kodearcade-unsaved-work.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  const reload = async () => { if (confirm('Discard this device draft and reload your saved account version? Download unsaved work first if needed.')) { await saver.discardRecovery(); location.reload(); } };
  return <Suspense fallback={<LoadingScreen />}><Activity student={{ displayName: context.displayName, signOut }} cloud={{ status, recoveryStatus, recoveryNotice, retry: () => { void saver.flush(); }, download, reload: () => { void reload(); } }} /></Suspense>;
}
