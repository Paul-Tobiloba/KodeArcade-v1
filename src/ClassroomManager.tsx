import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, KeyRound, Plus, ShieldCheck } from 'lucide-react';
import { accountErrorMessage, accountPdf, accountRequest, workspaceHref, type Account } from './account-api';
import { Notice, Password, Submit } from './AccountUI';
import { CourseAssignments, CsvImport } from './TeacherBatch';
import LoadingScreen from './LoadingScreen';
import ClassProgress from './ClassProgress';
import ClassLifecycle, { ClassList } from './ClassLifecycle';
import SchoolMfaNotice from './SchoolMfaNotice';

type Pupil = { id: string; displayName: string; username: string; grade: number; loginMethod: 'picture' | 'text'; active: boolean };
type Classroom = { room: { id: string; name: string; code: string; grade: number; archivedAt?: string | null }; learners: Pupil[]; assignments: { id: string; courseKey: string }[] };
const currentClassId = () => new URLSearchParams(location.hash.split('?')[1]).get('id') ?? '';

export default function ClassroomManager({ route, account, refresh }: { route: string; account: Account; refresh: () => void }) {
  const [data, setData] = useState<Classroom>();
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [card, setCard] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Pupil>();
  const [adding, setAdding] = useState(route === 'learner-new');
  const [checked, setChecked] = useState<string[]>([]);
  const operationKeys = useRef(new Map<string, string>());
  const [createKey] = useState(() => crypto.randomUUID());
  const id = currentClassId();
  const workspace = account.workspaces.find(workspace => ['teacher', 'school_admin'].includes(workspace.role));
  useEffect(() => {
    if (!id || !['classroom', 'learner-new'].includes(route)) return;
    const controller = new AbortController();
    accountRequest<Classroom>(`manage/classes/${encodeURIComponent(id)}`, undefined, controller.signal).then(setData).catch(failure => { if (!controller.signal.aborted) setError(accountErrorMessage(failure)); });
    return () => controller.abort();
  }, [id, route, revision]);
  useEffect(() => () => { if (card) URL.revokeObjectURL(card); }, [card]);
  const reload = () => { setRevision(value => value + 1); setSelected(undefined); };
  async function mutate(path: string, body: object, pdf = false) {
    setError(''); setBusy(true);
    const signature = JSON.stringify([path, body]);
    const operationKey = operationKeys.current.get(signature) ?? crypto.randomUUID();
    operationKeys.current.set(signature, operationKey);
    try {
      if (pdf) { const blob = await accountPdf(path, { ...body, operationKey }); setCard(URL.createObjectURL(blob)); }
      else await accountRequest(path, { ...body, operationKey });
      operationKeys.current.delete(signature);
      reload(); return true;
    } catch (failure) { setError(accountErrorMessage(failure)); return false; }
    finally { setBusy(false); }
  }
  if (!workspace) return <><h1>Set up a teaching workspace</h1><p>Classes and student credentials are managed by teachers. Family profiles are a separate feature.</p><a className="account-button" href="/#/onboarding">Workspace setup<ArrowRight size={18} /></a></>;
  if (workspace.kind === 'school' && workspace.role === 'school_admin' && !account.profile.twoFactorEnabled) return <SchoolMfaNotice />;
  return <>
    <a className="account-back" href={workspaceHref('classes', workspace.id)}><ArrowLeft size={17} />Your classes</a>
    <h1>{route === 'class-new' ? 'Create a class' : data?.room.name ?? (route === 'learners' || route === 'learner-new' ? 'Your students' : 'Your classes')}</h1>
    {error && <Notice error>{error}</Notice>}
    {card && <section className="account-private-card" aria-label="Private login card ready"><h2>Login card ready</h2><p>Download this private PDF now. It is only available here until you leave or dismiss it. Existing passwords cannot be reprinted—reset a lost card to issue a new one.</p><a className="account-button primary" href={card} download="kodearcade-private-login-card.pdf"><Download size={18} />Download PDF card</a><button className="account-button" onClick={() => setCard('')}>Dismiss private card</button></section>}
    <ManagementUnlock mfa={account.profile.twoFactorEnabled === true} />
    {route === 'class-new' ? <form className="account-management-form" aria-busy={busy} onSubmit={async event => {
      event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError('');
      try { const result = await accountRequest<{ id: string }>('manage/classes', { name: form.get('name'), grade: Number(form.get('grade')), organizationId: workspace.id, operationKey: createKey }); refresh(); location.hash = `/classroom?id=${result.id}&workspace=${workspace.id}`; }
      catch (failure) { setError(accountErrorMessage(failure)); } finally { setBusy(false); }
    }}><label className="account-field">Class name<input name="name" maxLength={60} required placeholder="e.g. Grade 2A" /></label><GradeField /><p>The class starts with its grade’s course assigned. You can change the assignments after creation.</p><Submit busy={busy}>Create class</Submit></form>
      : !id ? <><p>{workspace.kind === 'school' ? `School workspace: ${workspace.name}. ${workspace.role === 'school_admin' ? 'You can manage every class in this school.' : 'Only your assigned school classes appear here.'}` : 'These classes belong to your personal teaching workspace.'} Open a class to manage students and courses.</p><a className="account-button primary" href={workspaceHref('class-new', workspace.id)}><Plus size={18} />Create class</a><ClassList classes={account.classes} workspaceId={workspace.id} /></>
        : !data ? error ? <button className="account-button" onClick={() => { setError(''); reload(); }}>Try loading this class again</button> : <LoadingScreen embedded label="Opening your classroom…" /> : <>
          <div className="account-class-meta"><span>Grade {data.room.grade}</span><span>Classroom code <code>{data.room.code}</code></span><span>{data.learners.length} students</span></div>
          <ClassLifecycle key={String(data.room.archivedAt)} archivedAt={data.room.archivedAt} busy={busy} onChange={async archived => {
            const saved = await mutate(`manage/classes/${id}/archive`, { archived, previousArchived: Boolean(data.room.archivedAt), confirm: true });
            if (saved) { setAdding(false); setChecked([]); setCard(''); refresh(); }
            return saved;
          }} />
          <ClassProgress classroomId={id} assignments={data.assignments} />
          <fieldset className="account-class-editing" disabled={Boolean(data.room.archivedAt) || busy} aria-label="Classroom editing">
          <details className="account-help"><summary>Edit class details</summary><form aria-busy={busy} onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); await mutate(`manage/classes/${id}/update`, { name: form.get('name'), grade: Number(form.get('grade')) }); }}><label className="account-field">Class name<input name="name" defaultValue={data.room.name} maxLength={60} required /></label><GradeField initial={data.room.grade} /><Submit busy={busy}>Save class details</Submit></form></details>
          <section className="account-roster"><div className="account-section-heading"><h2>Students</h2><button className="account-button primary" onClick={() => { setAdding(!adding); setSelected(undefined); }}><Plus size={18} />{adding ? 'Close student form' : 'Add student'}</button></div>
            <CsvImport busy={busy} existingNames={data.learners.map(student => student.displayName)} remaining={100 - data.learners.length} onImport={csv => mutate(`manage/classes/${id}/students/import`, { csv }, true)} />
            {data.learners.length > 0 && <div className="account-batch-actions"><span role="status">{checked.length} students selected</span><button className="account-button" disabled={busy || !checked.length} onClick={async () => { if (confirm(`Reset passwords for ${checked.length} selected students and generate a private PDF booklet? Their old cards will stop working and they will be signed out. Saved account progress is kept. Unsynced device drafts cannot be recovered after a reset.`)) { if (await mutate(`manage/classes/${id}/students/reset-cards`, { studentIds: checked, confirmReset: true }, true)) setChecked([]); } }}>Reset selected & generate cards</button><button className="account-text-button" disabled={busy || !checked.length} onClick={() => setChecked([])}>Clear selection</button><p>Select up to 50 active students. Existing passwords cannot be reprinted; this action issues new ones.</p></div>}
            {adding && <StudentForm grade={data.room.grade} busy={busy} onSubmit={async body => { if (await mutate(`manage/classes/${id}/students`, body, true)) setAdding(false); }} />}
            {data.learners.length ? <div className="account-table-wrap" tabIndex={0} role="region" aria-label="Class student roster"><table><caption>Only students enrolled in this class</caption><thead><tr><th><input type="checkbox" aria-label="Select first 50 active students" checked={data.learners.some(student => student.active) && data.learners.filter(student => student.active).slice(0, 50).every(student => checked.includes(student.id))} disabled={busy} onChange={event => setChecked(event.target.checked ? data.learners.filter(student => student.active).slice(0, 50).map(student => student.id) : [])} /></th><th>Student</th><th>Username</th><th>Grade</th><th>Login method</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data.learners.map(student => <tr key={student.id}><td><input type="checkbox" aria-label={`Select ${student.displayName}`} checked={checked.includes(student.id)} disabled={busy || !student.active || (checked.length >= 50 && !checked.includes(student.id))} onChange={event => setChecked(value => event.target.checked ? [...value, student.id] : value.filter(id => id !== student.id))} /></td><td>{student.displayName}</td><td><code>{student.username}</code></td><td>{student.grade}</td><td>{student.loginMethod === 'picture' ? 'Picture password' : 'Text password'}</td><td>{student.active ? 'Active' : 'Disabled'}</td><td><button className="account-button" aria-label={`Manage ${student.displayName}`} onClick={() => { setSelected(student); setAdding(false); }}>Manage</button></td></tr>)}</tbody></table></div> : <p>No students yet. Add your first student above; children don’t need an email.</p>}
            {selected && <section className="account-student-management"><div className="account-section-heading"><h3>{selected.displayName}</h3><button className="account-text-button" onClick={() => setSelected(undefined)}>Close student details</button></div><StudentForm key={selected.id} grade={selected.grade} student={selected} busy={busy} onSubmit={body => mutate(`manage/classes/${id}/students/${selected.id}/update`, body)} /><form aria-busy={busy} onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); if (confirm('Reset this password? The old card will stop working and the student will be signed out.')) await mutate(`manage/classes/${id}/students/${selected.id}/reset`, { loginMethod: form.get('loginMethod') }, true); }}><label className="account-field">New password method<select name="loginMethod" defaultValue={selected.loginMethod}><option value="picture">Picture password</option><option value="text">Text password</option></select></label><p>A reset generates a new credential and PDF. It never reveals the existing password.</p><Submit busy={busy}>Reset credential & generate PDF</Submit></form></section>}
          </section>
          <CourseAssignments key={JSON.stringify(data.assignments)} assigned={data.assignments.map(item => item.courseKey)} busy={busy} onSave={(courses, previous) => mutate(`manage/classes/${id}/assignments/save`, { courses, previous })} />
          </fieldset>
        </>}
  </>;
}
function GradeField({ initial = 1, onChange }: { initial?: number; onChange?: (grade: number) => void }) {
  return <label className="account-field">Grade<select name="grade" defaultValue={initial} onChange={event => onChange?.(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map(grade => <option key={grade} value={grade}>Grade {grade}</option>)}</select></label>;
}
function StudentForm({ grade, busy, student, onSubmit }: { grade: number; busy: boolean; student?: Pupil; onSubmit: (body: object) => Promise<unknown> }) {
  const [method, setMethod] = useState(student?.loginMethod ?? (grade <= 2 ? 'picture' : 'text'));
  return <form className="account-management-form" aria-busy={busy} onSubmit={async event => { event.preventDefault(); const data = new FormData(event.currentTarget); await onSubmit({ displayName: data.get('displayName'), grade: Number(data.get('grade')), ...(student ? { active: data.get('active') === 'on' } : { loginMethod: method }) }); }}><label className="account-field">Student display name<input name="displayName" maxLength={60} required defaultValue={student?.displayName} placeholder="First name or classroom alias" /></label><GradeField initial={grade} onChange={grade => { if (!student) setMethod(grade <= 2 ? 'picture' : 'text'); }} />{student ? <label className="account-checkbox"><input type="checkbox" name="active" defaultChecked={student.active} />Active student (uncheck to disable login and sign out)</label> : <label className="account-field">Login method<select name="loginMethod" value={method} onChange={event => setMethod(event.target.value as 'picture' | 'text')}><option value="picture">Picture password (usually Grades 1–2)</option><option value="text">Generated text password (usually Grades 3–6)</option></select></label>}<Submit busy={busy}>{student ? 'Save student details' : 'Add student & generate PDF'}</Submit></form>;
}
export function ManagementUnlock({ mfa, family = false }: { mfa: boolean; family?: boolean }) {
  const [until, setUntil] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { const controller = new AbortController(); accountRequest<{ unlockedForSeconds: number }>('manage/management/status', undefined, controller.signal).then(value => { if (value.unlockedForSeconds > 0) setUntil(Date.now() + value.unlockedForSeconds * 1000); }).catch(() => {}); return () => controller.abort(); }, []);
  useEffect(() => { if (!until) return; const timer = setTimeout(() => setUntil(0), Math.max(0, until - Date.now())); return () => clearTimeout(timer); }, [until]);
  return <details className="account-management-unlock" open={!until}>
    <summary><KeyRound size={18} />{until ? 'Management unlocked' : family ? 'Unlock family management' : 'Unlock classroom management'}</summary>
    {until ? <p><ShieldCheck size={18} />Unlocked until {new Date(until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. The 30-minute unlock applies only to this sign-in and does not extend your account session.</p> : <>
      <p>{family ? 'Confirm your adult password before adding children, changing courses or issuing home login cards.' : 'Confirm your adult password before creating classes, changing assignments or issuing student cards.'} Management stays unlocked for 30 minutes.</p>
      {error && <Notice error>{error}</Notice>}
      <form aria-busy={busy} onSubmit={async event => {
        event.preventDefault(); const form = event.currentTarget, data = new FormData(form); setBusy(true); setError('');
        try {
          const result = await accountRequest<{ unlockedForSeconds: number }>('manage/management/unlock', { password: data.get('password'), ...(mfa ? { code: data.get('code') } : {}) });
          form.reset(); setUntil(Date.now() + result.unlockedForSeconds * 1000);
        } catch (failure) { setError(accountErrorMessage(failure)); } finally { setBusy(false); }
      }}>
        <Password label="Confirm adult password" />
        {mfa && <label className="account-field">Authenticator code<input name="code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} required /></label>}
        <Submit busy={busy}>Unlock management</Submit>
      </form>
    </>}
  </details>;
}
