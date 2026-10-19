import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { accountErrorMessage, accountRequest } from './account-api';
import { courses } from './courses';
import { Notice } from './AccountUI';
import PreviousQuizResults from './PreviousQuizResults';
import type { ChallengeReport, ClassReport, StudentReport } from '../shared/reports';
import './class-progress.css';
const savedTime = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'No saved work yet';
const status = (student: StudentReport) => student.checkIns ? 'May need a check-in' : student.completed === student.total ? 'Challenges complete' : student.started ? 'Working on it' : 'Not started';
export default function ClassProgress({ classroomId, assignments }: { classroomId: string; assignments: { courseKey: string }[] }) {
  const [course, setCourse] = useState(assignments[0]?.courseKey ?? '');
  const [report, setReport] = useState<ClassReport>();
  const [error, setError] = useState(''), [refresh, setRefresh] = useState(0), [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<StudentReport>();
  useEffect(() => { if (!assignments.some(item => item.courseKey === course)) setCourse(assignments[0]?.courseKey ?? ''); }, [assignments, course]);
  useEffect(() => {
    setReport(undefined); setSelected(undefined); setError('');
    if (!course) return;
    const controller = new AbortController();
    accountRequest<ClassReport>(`manage/classes/${classroomId}/progress?course=${encodeURIComponent(course)}`, undefined, controller.signal).then(setReport).catch(failure => { if (!controller.signal.aborted) setError(accountErrorMessage(failure)); });
    return () => controller.abort();
  }, [classroomId, course, refresh]);
  const students = report?.students.filter(student => filter === 'all' || (filter === 'check-in' ? student.checkIns > 0 : filter === 'new' ? !student.started : student.completed === student.total)) ?? [];
  return <section className="class-progress" aria-labelledby="class-progress-title"><h2 id="class-progress-title">Learning progress</h2><p>See saved activity results, module quizzes and where a quick check-in may help. These are learning checks, not proctored assessments.</p>
    {!assignments.length ? <p>Assign a course below to begin tracking learning.</p> : <>
      <div className="class-progress-tools"><label>Course<select value={course} onChange={event => setCourse(event.target.value)}>{assignments.map(item => <option key={item.courseKey} value={item.courseKey}>{courses.find(course => course.id === item.courseKey)?.title ?? item.courseKey}</option>)}</select></label><label>Show students<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All students</option><option value="check-in">May need a check-in</option><option value="new">Not started</option><option value="complete">Challenges complete</option></select></label><button className="account-button" disabled={!report && !error} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={17} />Refresh progress</button></div>
      {error ? <Notice error>{error}</Notice> : !report ? <p role="status">Loading saved progress…</p> : <>
        <p className="class-progress-note">Updated {savedTime(report.generatedAt)}. A check-in means an unfinished challenge has 3+ runs or 2+ hints. It is a conversation starter, not a judgement.</p>
        {students.length ? <div className="account-table-wrap" tabIndex={0} aria-label="Student progress table, scroll horizontally for more columns"><table><caption>Saved results for {courses.find(item => item.id === course)?.title}</caption><thead><tr><th scope="col">Student</th><th scope="col">Challenges</th><th scope="col">Best stars</th><th scope="col">Last activity</th><th scope="col">Check-in</th><th scope="col">Last saved</th><th scope="col">Details</th></tr></thead><tbody>{students.map(student => <tr key={student.learnerId}><th scope="row">{student.displayName}{!student.active && <small>Disabled account</small>}</th><td>{student.completed} / {student.total}<small>{student.drawingCompleted} / {student.drawingTotal} drawings</small><small>{student.quizCompleted ?? 0} / {student.quizTotal ?? 0} quizzes</small></td><td>{student.stars} / {student.total * 5}</td><td>{student.lastActivity}</td><td>{status(student)}{student.checkIns > 0 && <small>{student.checkIns} unfinished {student.checkIns === 1 ? 'challenge' : 'challenges'}</small>}</td><td>{savedTime(student.updatedAt)}</td><td><button className="account-button" aria-label={`View progress for ${student.displayName}`} onClick={() => setSelected(student)}>View</button></td></tr>)}</tbody></table></div> : <p>{report.students.length ? 'No students match this filter.' : 'No students enrolled yet. Add students below; their saved work will appear here.'}</p>}
        {selected && <><section aria-label={`${selected.displayName} quiz results`}><h3>{selected.displayName}’s module quizzes</h3><p>{selected.quizCompleted ?? 0} of {selected.quizTotal ?? 0} submitted. Scores are calculated from submitted answers; best results stay earned on retries.</p><div className="account-table-wrap" tabIndex={0} aria-label="Module quiz results, scroll horizontally if needed"><table><caption>Quiz results are separate from coding challenge stars</caption><thead><tr><th scope="col">Module</th><th scope="col">Best result</th><th scope="col">Latest submitted result</th><th scope="col">Submitted attempts</th></tr></thead><tbody>{selected.quizResults?.map(quiz => <tr key={quiz.id}><th scope="row">{quiz.title}</th><td>{quiz.best === null ? 'Not submitted' : `${quiz.best} / ${quiz.total}`}</td><td>{quiz.latest === null ? 'No submission / retry in progress' : `${quiz.latest} / ${quiz.total}`}</td><td>{quiz.attempts}</td></tr>)}</tbody></table></div><PreviousQuizResults results={selected.previousQuizResults} /></section><ProgressDetails key={`${selected.learnerId}:${course}:${refresh}`} classroomId={classroomId} course={course} student={selected} onClose={() => setSelected(undefined)} /></>}
      </>}
    </>}
  </section>;
}
function ProgressDetails({ classroomId, course, student, onClose }: { classroomId: string; course: string; student: StudentReport; onClose: () => void }) {
  const [data, setData] = useState<ChallengeReport[]>(), [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    accountRequest<{ challenges: ChallengeReport[] }>(`manage/classes/${classroomId}/progress/${student.learnerId}?course=${encodeURIComponent(course)}`, undefined, controller.signal).then(result => setData(result.challenges)).catch(failure => { if (!controller.signal.aborted) setError(accountErrorMessage(failure)); });
    return () => controller.abort();
  }, [classroomId, course, student.learnerId]);
  return <section className="class-progress-details" aria-label={`Challenge results for ${student.displayName}`}><div className="account-section-heading"><h3>{student.displayName}’s challenges</h3><button className="account-button" onClick={onClose}>Close progress details</button></div>{error ? <Notice error>{error}</Notice> : !data ? <p role="status">Loading challenge results…</p> : <div className="account-table-wrap" tabIndex={0}><table><caption>Best stars stay earned when a student retries or edits their code</caption><thead><tr><th scope="col">Challenge</th><th scope="col">Result</th><th scope="col">Best stars</th><th scope="col">Runs</th><th scope="col">Hints</th></tr></thead><tbody>{data.map(challenge => <tr key={challenge.id}><th scope="row">{challenge.title}</th><td>{challenge.complete ? 'Complete' : challenge.attempts ? 'In progress' : 'Not completed'}</td><td>{challenge.stars} / 5</td><td>{challenge.attempts}</td><td>{challenge.hints}</td></tr>)}</tbody></table></div>}</section>;
}
