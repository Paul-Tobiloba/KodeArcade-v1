import { useState } from 'react';
import { Archive, ArrowRight, RotateCcw } from 'lucide-react';
import { workspaceHref, type Account } from './account-api';
import { Submit } from './AccountUI';

export function ClassList({ classes, workspaceId }: { classes: Account['classes']; workspaceId?: string }) {
  const [archived, setArchived] = useState(false);
  const visible = classes.filter(room => Boolean(room.archivedAt) === archived);
  const activeCount = classes.filter(room => !room.archivedAt).length;
  return <section className="account-class-list" aria-label="Your class list">
    <div className="account-class-filters" role="group" aria-label="Filter classes">
      <button className="account-button" aria-pressed={!archived} onClick={() => setArchived(false)}>Active ({activeCount})</button>
      <button className="account-button" aria-pressed={archived} onClick={() => setArchived(true)}>Archived ({classes.length - activeCount})</button>
    </div>
    <p role="status">{visible.length} {archived ? 'archived' : 'active'} {visible.length === 1 ? 'class' : 'classes'}</p>
    {visible.length ? <div className="account-table-wrap" tabIndex={0} role="region" aria-label={archived ? 'Archived classes' : 'Active classes'}><table>
      <caption>{archived ? 'Saved reports and student records are kept. Open a class to restore access.' : 'Select a class to manage students and assigned courses.'}</caption>
      <thead><tr><th scope="col">Class</th><th scope="col">Grade</th><th scope="col">Classroom code</th><th scope="col">Manage</th></tr></thead>
      <tbody>{visible.map(room => <tr key={room.id}><th scope="row">{room.name}</th><td>{room.grade}</td><td><code>{room.code}</code></td><td><a className="account-button" href={workspaceHref(`classroom?id=${encodeURIComponent(room.id)}`, workspaceId)}>Open class<ArrowRight size={17} /></a></td></tr>)}</tbody>
    </table></div> : <div className="account-empty"><h2>{archived ? 'No archived classes' : 'No active classes'}</h2><p>{archived ? 'Classes you archive will appear here. Their saved work is kept, not deleted.' : classes.length ? 'Switch to Archived to restore a class, or create a new class.' : 'Create your first class, then add students to generate their private login cards.'}</p></div>}
  </section>;
}

export default function ClassLifecycle({ archivedAt, busy, onChange }: { archivedAt?: string | null; busy: boolean; onChange: (archived: boolean) => Promise<boolean> }) {
  const [confirmed, setConfirmed] = useState(false);
  if (archivedAt) return <section className="account-class-lifecycle is-archived" aria-labelledby="class-access-title">
    <h2 id="class-access-title"><Archive size={20} />This class is archived</h2>
    <p>Student sign-in and changes are paused. Students, courses, saved code, stars and quiz results are kept. You can still read the reports below.</p>
    <p>Restoring allows active students to sign in again with their existing cards. Disabled students stay disabled.</p>
    <button className="account-button primary" disabled={busy} onClick={() => void onChange(false)}><RotateCcw size={18} />{busy ? 'Restoring…' : 'Restore class'}</button>
  </section>;
  return <details className="account-class-lifecycle"><summary><Archive size={18} />Archive this class</summary>
    <p>Archive when a class finishes. Students will be signed out and cannot sign in or save more work until you restore the class. Saved account progress and reports are kept; this does not delete student records.</p>
    <p>Ask students to finish saving first. Changes that have not reached the account may not be saved.</p>
    <form aria-busy={busy} onSubmit={async event => { event.preventDefault(); if (confirmed && await onChange(true)) setConfirmed(false); }}>
      <label className="account-checkbox"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={busy} required />I understand this pauses student access.</label>
      <Submit busy={busy} disabled={!confirmed}>Archive class</Submit>
    </form>
  </details>;
}
