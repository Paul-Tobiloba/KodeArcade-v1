import { useConfirmation } from './ConfirmationProvider';
import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { csvTemplate, parseClassroomCsv, type ImportedStudent } from '../shared/classroom-import';
import { courses } from './courses';
import { Notice, Submit } from './AccountUI';

export function CsvImport({ busy, existingNames, remaining, onImport }: { busy: boolean; existingNames: string[]; remaining: number; onImport: (csv: string) => Promise<boolean> }) {
  const [csv, setCsv] = useState('');
  const [students, setStudents] = useState<ImportedStudent[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [reading, setReading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  async function read(file?: File) {
    setConfirmed(false); setCsv(''); setStudents([]); setErrors([]);
    if (!file) return;
    if (file.size > 48000) { setErrors(['Choose a CSV file with no more than 50 students (up to 48 KB).']); return; }
    setReading(true);
    try {
      const source = await file.text(), parsed = parseClassroomCsv(source);
      const duplicate = parsed.students.some(student => existingNames.some(name => name.normalize('NFKC').toLocaleLowerCase('en') === student.displayName.normalize('NFKC').toLocaleLowerCase('en')));
      if (duplicate) parsed.errors.push('A name is already enrolled in this class. Remove that row or use a distinct classroom alias.');
      if (parsed.students.length > remaining) parsed.errors.push(`This class has room for ${remaining} more students (100 maximum).`);
      setCsv(source); setStudents(parsed.students); setErrors(parsed.errors);
    } catch { setErrors(['This file could not be read. Choose it again or download a fresh template.']); }
    finally { setReading(false); }
  }
  function template() {
    const url = URL.createObjectURL(new Blob([csvTemplate], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'kodearcade-student-template.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <details className="account-csv-import"><summary><Upload size={18} />Import students from CSV</summary><p>Add up to 50 students at once. Use the template’s name, grade and login_method columns. A blank method uses picture passwords for Grades 1–2 and text passwords for Grades 3–6. Don’t include emails or passwords.</p><button className="account-button" onClick={template}><Download size={17} />Download CSV template</button><label className="account-field">Student CSV file<input type="file" accept=".csv,text/csv" disabled={busy || reading} onChange={event => { void read(event.target.files?.[0]); }} /></label>
    {reading && <p role="status">Reading CSV…</p>}
    {errors.length > 0 && <Notice error><strong>Fix the CSV before importing.</strong><ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul><p>No students have been added.</p></Notice>}
    {!!students.length && !errors.length && <form aria-busy={busy} onSubmit={async event => { event.preventDefault(); if (confirmed && await onImport(csv)) { setCsv(''); setStudents([]); setConfirmed(false); } }}><h3>Review {students.length} students</h3><div className="account-table-wrap" tabIndex={0} role="region" aria-label="CSV student preview"><table><caption>Preview only — nothing is saved until you confirm</caption><thead><tr><th>Name</th><th>Grade</th><th>Login method</th></tr></thead><tbody>{students.map((student, index) => <tr key={index}><td>{student.displayName}</td><td>{student.grade}</td><td>{student.loginMethod === 'picture' ? 'Picture password' : 'Text password'}</td></tr>)}</tbody></table></div><label className="account-checkbox"><input type="checkbox" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={busy} />I reviewed these students. Add them and generate their private login cards.</label><Submit busy={busy}>Import {students.length} students & generate cards</Submit><p>Download the PDF after importing. Passwords cannot be retrieved later; a lost card needs a reset.</p></form>}
  </details>;
}

export function CourseAssignments({ assigned, busy, onSave }: { assigned: string[]; busy: boolean; onSave: (courses: string[], previous: string[]) => Promise<boolean> }) {
  const confirm = useConfirmation();
  const [chosen, setChosen] = useState(assigned);
  const [notice, setNotice] = useState('');
  const dirty = [...chosen].sort().join(',') !== [...assigned].sort().join(',');
  const removing = assigned.filter(course => !chosen.includes(course));
  return <section className="account-assignment-list"><h2>Assigned courses</h2><p>Choose what students can open, then save your changes. Their saved code, stars and results remain linked to their account.</p><form aria-busy={busy} onSubmit={async event => { event.preventDefault(); if (removing.length && !(await confirm({ title: "Remove course access?", message: `Remove access to ${removing.length} course(s)? Saved progress is kept, but students can no longer open these courses until reassigned.`, confirmLabel: "Remove access", tone: 'danger' }))) return; if (await onSave(chosen, assigned)) setNotice('Course assignments saved. Students will see the updated choices on their dashboard.'); }}><fieldset disabled={busy}><legend>{chosen.length} courses selected</legend>{courses.map(course => <label key={course.id}><input type="checkbox" checked={chosen.includes(course.id)} onChange={event => { setNotice(''); setChosen(value => event.target.checked ? [...value, course.id] : value.filter(id => id !== course.id)); }} /><span><strong>{course.title}</strong>{assigned.includes(course.id) && <small>Currently assigned</small>}<small>{course.description}</small></span></label>)}</fieldset>{!chosen.length && <p>No courses selected. Students will see an empty dashboard until you assign one.</p>}<div className="account-batch-actions"><button className="account-button primary" disabled={busy || !dirty} type="submit">{busy ? 'Saving…' : 'Save assignments'}</button><button className="account-button" disabled={busy || !dirty} type="button" onClick={() => { setChosen(assigned); setNotice(''); }}>Cancel changes</button><span role="status">{dirty ? 'Unsaved assignment changes' : notice || 'Assignments are up to date'}</span></div></form></section>;
}
