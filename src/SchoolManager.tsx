import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Building2, Copy, Plus, ShieldCheck } from 'lucide-react';
import { AccountError, accountErrorMessage, accountRequest, workspaceHref, type Account } from './account-api';
import { Notice, Submit } from './AccountUI';
import { ManagementUnlock } from './ClassroomManager';
import LoadingScreen from './LoadingScreen';
import SchoolMfaNotice from './SchoolMfaNotice';

type Role = 'teacher' | 'school_admin';
type Staff = { userId: string; name: string; email: string; role: Role };
type School = {
  workspace: { id: string; name: string; role: Role }; actorId: string; members: Staff[];
  invitations: { id: string; email: string; role: Role; expiresAt: string }[];
  classes: { id: string; name: string; archivedAt: string | null; staffIds: string[] }[];
};
const roleName = (role: Role) => role === 'school_admin' ? 'Administrator' : 'Teacher';

export default function SchoolManager({ route, account, refresh }: { route: string; account: Account; refresh: () => void }) {
  const workspace = account.workspaces[0];
  const admin = workspace?.kind === 'school' && workspace.role === 'school_admin';
  const [data, setData] = useState<School>();
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [invitation, setInvitation] = useState<{ url: string; email: string }>();
  const [replacement, setReplacement] = useState<{ path: string; body: { email: string; role: string } }>();
  const [accessUnavailable, setAccessUnavailable] = useState(false);
  const keys = useRef(new Map<string, string>());
  useEffect(() => {
    if (!admin || !account.profile.twoFactorEnabled || route === 'school-join') return;
    const controller = new AbortController();
    accountRequest<School>(`schools/${workspace.id}`, undefined, controller.signal).then(setData).catch(failure => {
      if (!controller.signal.aborted) {
        if (failure instanceof AccountError && failure.status === 404) setAccessUnavailable(true);
        else setError(accountErrorMessage(failure));
      }
    });
    return () => controller.abort();
  }, [admin, account.profile.twoFactorEnabled, workspace?.id, route, revision]);
  async function mutate<T>(path: string, body: object, keyed = false): Promise<T | undefined> {
    setBusy(true); setError(''); setMessage('');
    const signature = JSON.stringify([path, body]);
    const operationKey = keys.current.get(signature) ?? crypto.randomUUID();
    if (keyed) keys.current.set(signature, operationKey);
    try {
      const result = await accountRequest<T>(path, keyed ? { ...body, operationKey } : body);
      keys.current.delete(signature); setRevision(value => value + 1); return result;
    } catch (failure) {
      if (failure instanceof AccountError && failure.status === 404) {
        setAccessUnavailable(true); setData(undefined); setInvitation(undefined); setReplacement(undefined);
      } else if (failure instanceof AccountError && failure.code === 'ALREADY_PROCESSED' && path.endsWith('/invitations')) {
        keys.current.delete(signature);
        setReplacement({ path, body: body as { email: string; role: string } });
        setError('The invitation was created, but its private link was not received. Generate a replacement below; this invalidates the previous link. No email has been sent.');
      } else setError(accountErrorMessage(failure));
    }
    finally { setBusy(false); }
  }
  if (route === 'school-join') return <JoinSchool account={account} refresh={refresh} />;
  if (admin && !account.profile.twoFactorEnabled) return <><h1>{workspace.name}</h1><SchoolMfaNotice /></>;
  if (accessUnavailable) return <><h1>School access unavailable</h1><Notice error>Your access may have changed, or this workspace is unavailable. Refresh your workspaces and contact the school administrator if you still need access.</Notice><button className="account-button primary" onClick={refresh}>Refresh workspaces<ArrowRight size={18} /></button></>;
  return <>
    <div className="account-workspace-heading"><div><h1>{admin ? workspace.name : 'Your school workspaces'}</h1><p>{workspace?.kind === 'school' ? `${roleName(workspace.role as Role)} access · School-owned classes and records` : 'Teach independently, join a school, or do both with the same account.'}</p></div><Building2 size={30} /></div>
    {account.profile.twoFactorEnabled && <ManagementUnlock mfa />}
    {error && <Notice error>{error}</Notice>}
    {message && <Notice>{message}</Notice>}
    {replacement && <section className="account-private-card" aria-label="Replace lost invitation"><h2>Replace the lost invitation</h2><p>Generate a new private link for {replacement.body.email}. The previous invitation link will stop working.</p><button className="account-button primary" disabled={busy} onClick={async () => {
      const result = await mutate<{ url: string }>(replacement.path, replacement.body, true);
      if (result) { setInvitation({ url: result.url, email: replacement.body.email }); setReplacement(undefined); setMessage('Replacement invitation created. The previous link no longer works.'); }
    }}>Generate replacement invitation<ArrowRight size={18} /></button><button className="account-text-button" disabled={busy} onClick={() => setReplacement(undefined)}>Cancel replacement</button></section>}
    {workspace?.kind === 'school' && !admin && <section className="account-school-section"><h2>Your teaching access</h2><p>Your school administrator assigns the classes you can teach. Your personal classes stay separate. Ask an administrator if a school class is missing.</p><a className="account-button primary" href={workspaceHref('classes', workspace.id)}>Open assigned classes<ArrowRight size={18} /></a><a className="account-button" href="/#/onboarding">Set up a personal workspace</a></section>}
    {admin && !data && !error && <LoadingScreen embedded label="Loading school staff…" />}
    {admin && error && <button className="account-button" onClick={() => { setError(''); setRevision(value => value + 1); }}>Reload school</button>}
    {admin && data && <>
      <section className="account-school-section" aria-labelledby="school-staff-title">
        <div className="account-section-heading"><h2 id="school-staff-title">School staff ({data.members.length})</h2><button className="account-button primary" onClick={() => { const heading = document.getElementById('school-invite-title'); heading?.scrollIntoView({ block: 'start' }); heading?.focus({ preventScroll: true }); }}><Plus size={18} />Invite staff</button></div>
        <p>Administrators manage all school classes and staff. Teachers see only their assigned classes. Removing staff does not remove students or their work.</p>
        <div className="account-table-wrap" tabIndex={0} role="region" aria-label="School staff"><table><caption>Access applies only to {workspace.name}</caption><thead><tr><th scope="col">Staff member</th><th scope="col">Role</th><th scope="col">Access</th></tr></thead><tbody>{data.members.map(member => <tr key={member.userId}><th scope="row">{member.name}{member.userId === data.actorId && ' (you)'}<span className="account-staff-email">{member.email}</span></th><td>{roleName(member.role)}</td><td><StaffAccess key={`${member.userId}-${member.role}`} member={member} busy={busy} lastAdmin={member.role === 'school_admin' && data.members.filter(item => item.role === 'school_admin').length === 1} onSave={async newRole => {
          if (await mutate(`schools/${workspace.id}/members/${encodeURIComponent(member.userId)}`, { role: newRole, previousRole: member.role, confirm: true })) {
            if (member.userId === data.actorId) refresh(); else setMessage('School access updated. Student records and personal workspaces are unchanged.');
          }
        }} /></td></tr>)}</tbody></table></div>
      </section>
      <section className="account-school-section" id="school-invite" aria-labelledby="school-invite-title">
        <h2 id="school-invite-title" tabIndex={-1}>Invite a staff member</h2><p>The invitation expires after seven days and can be accepted once, using the invited adult’s verified email. A new invitation to the same address replaces its earlier link.</p>
        <form className="account-management-form" aria-busy={busy} onSubmit={async event => {
          event.preventDefault(); const form = event.currentTarget, body = new FormData(form), email = String(body.get('email')).trim();
          const result = await mutate<{ url: string }>(`schools/${workspace.id}/invitations`, { email, role: body.get('role') }, true);
          if (result) { setInvitation({ url: result.url, email }); form.reset(); }
        }}><label className="account-field">Staff email<input type="email" name="email" autoComplete="off" maxLength={254} required /></label><label className="account-field">School role<select name="role" defaultValue="teacher"><option value="teacher">Teacher — assigned classes only</option><option value="school_admin">Administrator — all school classes and staff</option></select></label><Submit busy={busy} disabled={Boolean(replacement)}>Generate invitation link</Submit></form>
        {invitation && <section className="account-private-card" aria-label="Private invitation link"><h3>Share privately with {invitation.email}</h3><p>No email has been sent. Copy and share this link yourself. It is shown only here; if lost, generate a new invitation.</p><label className="account-field">Invitation link<input readOnly value={invitation.url} onFocus={event => event.currentTarget.select()} /></label><button className="account-button" onClick={async () => { try { await navigator.clipboard.writeText(invitation.url); setMessage('Invitation link copied. Share it only with the invited staff member.'); } catch { setMessage('Select the invitation link above and copy it manually.'); } }}><Copy size={18} />Copy link</button><button className="account-text-button" onClick={() => setInvitation(undefined)}>Dismiss private link</button></section>}
        {data.invitations.length ? <div className="account-table-wrap" tabIndex={0} role="region" aria-label="Pending invitations"><table><caption>Pending invitations</caption><thead><tr><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Expires</th><th scope="col">Action</th></tr></thead><tbody>{data.invitations.map(item => <tr key={item.id}><th scope="row">{item.email}</th><td>{roleName(item.role)}</td><td>{new Date(item.expiresAt).toLocaleDateString()}</td><td><button className="account-button" disabled={busy} aria-label={`Revoke invitation for ${item.email}`} onClick={async () => { if (await mutate(`schools/${workspace.id}/invitations/${item.id}/revoke`, { confirm: true })) { setInvitation(undefined); setMessage('Invitation revoked. That link can no longer be used.'); } }}>Revoke</button></td></tr>)}</tbody></table></div> : <p>No pending invitations. Generate a link above to invite your first colleague.</p>}
      </section>
      <section className="account-school-section"><h2>Class teaching assignments</h2><p>Assign one or more school staff members to each class. Saving changes access immediately, without moving pupils or changing their login cards. Administrators retain access even when no teacher is assigned.</p>{data.classes.length ? data.classes.map(room => <details className="account-help" key={room.id}><summary>{room.name}{room.archivedAt ? ' · Archived' : ''} · {room.staffIds.length} assigned</summary><ClassStaff key={JSON.stringify(room.staffIds)} room={room} members={data.members} busy={busy} onSave={async userIds => {
        if (await mutate(`schools/${workspace.id}/classes/${room.id}/staff`, { userIds, previous: room.staffIds, confirm: true })) { refresh(); }
      }} /><a href={workspaceHref(`classroom?id=${room.id}`, workspace.id)}>Open class and reports<ArrowRight size={16} /></a></details>) : <p>No school classes yet. <a href={workspaceHref('class-new', workspace.id)}>Create a school class</a>; your personal classes will not be moved.</p>}</section>
    </>}
    <section className="account-school-section"><details open={new URLSearchParams(location.hash.split('?')[1]).get('setup') === '1' || undefined}><summary><Building2 size={18} />Create a separate school workspace</summary><p>Only create this if you are authorized to administer the school. You will become its initial administrator. This does not verify the school’s identity or transfer your existing classes.</p>{!account.profile.twoFactorEnabled ? <SchoolMfaNotice /> : <form className="account-management-form" aria-busy={busy} onSubmit={async event => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      const result = await mutate<{ id: string }>('schools', { name: form.get('name'), confirmAuthority: true }, true);
      if (result) { refresh(); location.hash = `/schools?workspace=${result.id}`; }
    }}><label className="account-field">School name<input name="name" minLength={2} maxLength={80} required /></label><label className="account-checkbox"><input type="checkbox" required />I am authorized to administer this school.</label><Submit busy={busy}>Create school workspace</Submit></form>}</details><p>Joining an existing school? Ask its administrator for a private invitation link. A school name or classroom code cannot grant staff access.</p></section>
  </>;
}

function StaffAccess({ member, busy, lastAdmin, onSave }: { member: Staff; busy: boolean; lastAdmin: boolean; onSave: (role: Role | 'remove') => Promise<void> }) {
  const [next, setNext] = useState<Role | 'remove'>(member.role);
  return lastAdmin ? <span>Last administrator — add another before changing access.</span> : <details><summary>Manage {member.name}</summary><form aria-busy={busy} onSubmit={async event => { event.preventDefault(); await onSave(next); }}><label className="account-field">Access for {member.name}<select value={next} disabled={busy} onChange={event => setNext(event.target.value as Role | 'remove')}><option value="teacher">Teacher</option><option value="school_admin">Administrator</option><option value="remove">Remove from school</option></select></label><p>{next === 'remove' ? 'School access and class assignments end immediately. Personal classes and pupil records are kept.' : next === 'school_admin' ? 'This grants management access to all school classes, pupils and staff.' : 'Only explicitly assigned classes will remain accessible.'}</p><label className="account-checkbox"><input type="checkbox" required disabled={busy} />I confirm this school access change.</label><Submit busy={busy} disabled={next === member.role}>Save staff access</Submit></form></details>;
}
function ClassStaff({ room, members, busy, onSave }: { room: School['classes'][number]; members: Staff[]; busy: boolean; onSave: (ids: string[]) => Promise<void> }) {
  const [ids, setIds] = useState(room.staffIds);
  return <form aria-busy={busy} onSubmit={async event => { event.preventDefault(); await onSave(ids); }}><fieldset disabled={busy} className="account-school-staff-options"><legend>Staff assigned to {room.name}</legend>{members.map(member => <label className="account-checkbox" key={member.userId}><input type="checkbox" checked={ids.includes(member.userId)} onChange={event => setIds(current => event.target.checked ? [...current, member.userId] : current.filter(id => id !== member.userId))} />{member.name} · {roleName(member.role)}</label>)}</fieldset><label className="account-checkbox"><input type="checkbox" required disabled={busy} />I confirm these class access changes.</label><Submit busy={busy} disabled={JSON.stringify([...ids].sort()) === JSON.stringify([...room.staffIds].sort()) || ids.length > 25}>Save class staff</Submit><p>Up to 25 assigned staff per class.</p></form>;
}
function JoinSchool({ account, refresh }: { account: Account; refresh: () => void }) {
  const token = new URLSearchParams(location.hash.split('?')[1]).get('token') ?? '';
  const [invitation, setInvitation] = useState<{ name: string; role: Role; expiresAt: string }>();
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    accountRequest<{ name: string; role: Role; expiresAt: string }>('schools/invitation', { token }, controller.signal).then(setInvitation).catch(failure => { if (!controller.signal.aborted) setError(accountErrorMessage(failure)); });
    return () => controller.abort();
  }, [token]);
  return <><h1>Join a school workspace</h1><p>Signed in as {account.profile.email}. Only the invited email can accept this link. If you need to sign in first, reopen your original invitation afterwards.</p>
    {error && <Notice error>{error}</Notice>}
    {!invitation && !error && <LoadingScreen embedded label="Checking your invitation…" />}
    {invitation && <><h2>{invitation.name}</h2><p>You have been invited as a {roleName(invitation.role).toLowerCase()}. {invitation.role === 'school_admin' ? 'Administrators can manage all school classes and staff.' : 'Teachers can access only their assigned school classes.'} Your personal workspace and existing classes will not change.</p>
      {invitation.role === 'school_admin' && !account.profile.twoFactorEnabled ? <SchoolMfaNotice /> : <>
        <ManagementUnlock mfa={account.profile.twoFactorEnabled === true} />
        <form aria-busy={busy} onSubmit={async event => {
          event.preventDefault(); setBusy(true); setError('');
          try { const result = await accountRequest<{ id: string }>('schools/accept', { token, confirm: true }); refresh(); location.hash = `/dashboard?workspace=${result.id}`; }
          catch (failure) { setError(accountErrorMessage(failure)); } finally { setBusy(false); }
        }}><label className="account-checkbox"><input type="checkbox" required disabled={busy} />Join {invitation.name} with this school role.</label><Submit busy={busy}>Accept invitation<ShieldCheck size={18} /></Submit></form>
      </>}
    </>}
    <a className="account-button account-school-join-back" href="/#/dashboard">Back to my workspace</a>
  </>;
}
