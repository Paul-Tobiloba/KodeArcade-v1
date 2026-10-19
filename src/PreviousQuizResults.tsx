type Result = { id: string; title: string; version?: number; best: number | null; latest: number | null; total: number; attempts: number };
export default function PreviousQuizResults({ results }: { results?: Result[] }) {
  if (!results?.length) return null;
  return <details><summary>Previous quiz results ({results.length})</summary>
    <p>These earlier quizzes keep their original scores. They are not counted in the current course quiz total.</p>
    <div className="account-table-wrap" tabIndex={0} aria-label="Previous quiz results, scroll horizontally if needed"><table>
      <caption>Previous versions · original questions and scores</caption>
      <thead><tr><th scope="col">Quiz</th><th scope="col">Best result</th><th scope="col">Latest result</th><th scope="col">Attempts</th></tr></thead>
      <tbody>{results.map(quiz => <tr key={quiz.id}><th scope="row">{quiz.title}{quiz.version && ` · version ${quiz.version}`}</th><td>{quiz.best === null ? 'Not submitted' : `${quiz.best} / ${quiz.total}`}</td><td>{quiz.latest === null ? 'Draft / retry in progress' : `${quiz.latest} / ${quiz.total}`}</td><td>{quiz.attempts}</td></tr>)}</tbody>
    </table></div>
  </details>;
}
