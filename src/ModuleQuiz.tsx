import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ClipboardCheck, RotateCcw } from 'lucide-react';
import { currentQuizId, emptyQuiz, moduleQuiz, quizScore, quizVersion, type QuizRecord } from '../shared/quizzes';
import type { LearningModule } from './curriculum';
import ReadAloud from './ReadAloud';
import './module-quiz.css';

export function QuizEntry({ module, record, previousRecord, onStart, onPrevious, previousVersions, onVersion }: { module: LearningModule; record?: QuizRecord; previousRecord?: QuizRecord; onStart: () => void; onPrevious?: () => void; previousVersions?: { id: string; record: QuizRecord }[]; onVersion?: (id: string) => void }) {
  return <section className="module-quiz-entry" aria-label={`${module.title} end-of-module quiz`}><div><h2><ClipboardCheck size={22} />{module.title} quiz</h2><p>Check what you understand with five questions. No timer. You can review your answers and try again.</p>{record?.bestAnswers && <p><strong>Best result: {quizScore(currentQuizId(module.id), record.bestAnswers)} / 5</strong> · {record.attempts} submitted {record.attempts === 1 ? 'attempt' : 'attempts'}</p>}{previousRecord && <p>Previous quiz: {previousRecord.bestAnswers ? `best result ${quizScore(module.id, previousRecord.bestAnswers)} / 5` : 'draft answers saved'}. Kept separately from this updated quiz.</p>}</div><div className="quiz-entry-actions"><button className="primary" onClick={onStart}>{record?.submittedAnswers ? 'Review quiz' : record?.answers.some(answer => answer !== null) ? 'Continue quiz' : 'Start quiz'}<ArrowRight size={18} /></button>{previousRecord && onPrevious && <button className="secondary" onClick={onPrevious}>Open previous quiz</button>}{previousVersions?.filter(item => item.id !== module.id).map(item => <button className="secondary" key={item.id} onClick={() => onVersion?.(item.id)}>Open previous quiz (version {quizVersion(item.id)}){item.record.bestAnswers ? ` · ${quizScore(item.id, item.record.bestAnswers)} / 5` : ' · saved draft'}</button>)}</div></section>;
}

export default function ModuleQuiz({ module, quizId = currentQuizId(module.id), grade, record = emptyQuiz(), onChange, onBack, onNext, nextTitle, onPrevious, onCurrent, versions, onVersion }: { module: LearningModule; quizId?: string; grade?: number; record?: QuizRecord; onChange: (record: QuizRecord) => void; onBack: () => void; onNext?: () => void; nextTitle?: string; onPrevious?: () => void; onCurrent?: () => void; versions?: string[]; onVersion?: (id: string) => void }) {
  const questions = moduleQuiz(quizId, grade);
  const submitted = record.submittedAnswers;
  const score = quizScore(quizId, submitted, grade);
  const remaining = record.answers.filter(answer => answer === null).length;
  const [error, setError] = useState('');
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const wasSubmitted = useRef(!!submitted);
  useEffect(() => { if (submitted && !wasSubmitted.current) resultHeading.current?.focus(); wasSubmitted.current = !!submitted; }, [submitted]);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (remaining) { setError(`Choose an answer for ${remaining === 1 ? 'the remaining question' : `all ${remaining} remaining questions`} before submitting.`); return; }
    const answers = record.answers as number[];
    const bestAnswers = record.bestAnswers && quizScore(quizId, record.bestAnswers, grade) >= quizScore(quizId, answers, grade) ? record.bestAnswers : [...answers];
    onChange({ ...record, submittedAnswers: [...answers], bestAnswers, attempts: Math.min(100000, record.attempts + 1) });
    setError('');
  }
  return <section className="module-quiz" aria-label={`${module.title} quiz`}>
    <button className="secondary" onClick={onBack}>Back to module</button>
    {versions && versions.length > 1 && <label className="quiz-version-picker">Quiz version<select value={quizId} onChange={e => onVersion?.(e.target.value)}>{versions.map(id => <option key={id} value={id}>{id === currentQuizId(module.id) ? "Current topic quiz" : `Previous quiz · version ${quizVersion(id)}`}</option>)}</select></label>}
    {onCurrent ? <div className="quiz-version"><p><strong>Previous quiz version</strong><br />Your original questions, answers and results are kept here. This version does not count towards the updated course quizzes.</p><button className="secondary" onClick={onCurrent}>Open updated quiz</button></div> : onPrevious ? <div className="quiz-version"><p>This updated quiz tests the module’s coding concepts. Your previous quiz is saved separately.</p><button className="secondary" onClick={onPrevious}>Open previous quiz</button></div> : null}
    {submitted ? <div className="quiz-result"><h2 ref={resultHeading} tabIndex={-1}>You answered {score} of 5 correctly</h2><p>{score === 5 ? 'You understood every question in this quiz. Well done!' : 'Read the explanations below to see what worked and what to practise.'} Your best result stays saved when you retry.</p><p>Best result: <strong>{quizScore(quizId, record.bestAnswers, grade)} / 5</strong> · Attempt {record.attempts}</p></div> : <p className="quiz-instructions">Five questions about {module.title.toLowerCase()}. Choose one answer for each, then submit to see your result and explanations. You can leave and come back to your answers.</p>}
    <form onSubmit={submit}>
      {questions.map((question, index) => <fieldset className="quiz-question" key={question.id}>
        <legend>{index + 1}. {question.prompt}</legend>
        <ReadAloud label={`Listen to question ${index + 1}`} text={`${question.prompt}. ${question.code ?? ''}. ${question.options.map((option, i) => `Answer ${i + 1}: ${option}`).join('. ')}${submitted ? `. ${question.explanation}` : ''}`} />
        {question.code && <pre className="quiz-code"><code>{question.code}</code></pre>}
        <div className="quiz-options">{question.options.map((option, choice) => <label key={choice} className={submitted && choice === question.correct ? 'quiz-correct' : undefined}><input type="radio" name={question.id} value={choice} checked={(submitted ?? record.answers)[index] === choice} disabled={!!submitted} onChange={() => { const answers = [...record.answers]; answers[index] = choice; onChange({ ...record, answers }); setError(''); }} /><span>{option}{submitted && choice === question.correct && <strong><Check size={16} />Correct answer</strong>}{submitted && submitted[index] === choice && choice !== question.correct && <strong>Your answer</strong>}</span></label>)}</div>
        {submitted && <p className="quiz-explanation"><strong>{submitted[index] === question.correct ? 'Correct.' : 'Let’s look at this one.'}</strong> {question.explanation}</p>}
      </fieldset>)}
      {error && <p role="alert" className="quiz-error">{error}</p>}
      <div className="quiz-actions">{submitted ? <><button className="secondary" type="button" onClick={() => { onChange({ ...record, answers: Array(5).fill(null), submittedAnswers: undefined }); setError(''); window.scrollTo({ top: 0, behavior: 'auto' }); }}><RotateCcw size={18} />Try quiz again</button>{onNext && <button className="primary" type="button" onClick={onNext}>Next module: {nextTitle}<ArrowRight size={18} /></button>}</> : <><span>{5 - remaining} of 5 answered</span><button className="primary" type="submit">Submit quiz<ArrowRight size={18} /></button></>}</div>
    </form>
  </section>;
}
