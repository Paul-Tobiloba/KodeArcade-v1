import type {LearnerAccount} from './LearnerMenu';
import LearnerMenu from './LearnerMenu';
import {dashboardHref,useAccountSession} from './SessionProvider';
import {GraduationCap,LayoutDashboard,LogIn,Settings} from 'lucide-react';
import './platform-header.css';

/** Learning chrome never changes to marketing navigation on a preview URL. */
export default function PlatformHeader({context,student,onSettings}:{context?:string;student?:LearnerAccount;onSettings?:()=>void}){
  const {session,loading}=useAccountSession();
  return <header className="platform-header">
    <a className="platform-brand" href={student?'/#/student-courses':'/#/learn'} aria-label="KodeArcade learning home"><img src="/brand/mark-color.svg" width="34" height="38" alt=""/><span>KodeArcade</span></a>
    {context&&<span className="platform-context">{context}</span>}
    {student?<LearnerMenu account={student} onSettings={()=>onSettings?.()}/>:<nav className="platform-account" aria-label="Platform account">
      {loading?<span role="status">Checking account…</span>:session?<>
        <span className="platform-identity">{session.user.name}</span>
        <a href={dashboardHref(session)}>{session.user.principalKind==='learner'?<GraduationCap size={18}/>:<LayoutDashboard size={18}/>}<span>{session.user.principalKind==='learner'?'My courses':'My dashboard'}</span></a>
        {session.user.principalKind==='adult'&&<a href="/#/account-settings" aria-label="Account settings"><Settings size={18}/><span>Account settings</span></a>}
      </>:<a href="/#/login"><LogIn size={18}/>Log in</a>}
    </nav>}
  </header>;
}
