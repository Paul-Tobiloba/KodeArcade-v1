import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ClipboardCheck, RotateCcw } from 'lucide-react';
import { emptyQuiz, moduleQuiz, quizScore, type QuizRecord } from '../shared/quizzes';
import type { LearningModule } from './curriculum';
import ReadAloud from './ReadAloud';
import './module-quiz.css';

export function QuizEntry({ module, record, onStart }: { module: LearningModule; record?: QuizRecord; onStart: () => void }) {
  return <section className="module-quiz-entry" aria-label={`${module.title} end-of-module quiz`}><div><h2><ClipboardCheck size={22} />{module.title} quiz</h2><p>Check what you understand with five questions. No timer. You can review your answers and try again.</p>{record?.bestAnswers && <p><strong>Best result: {quizScore(module.id, record.bestAnswers)} / 5</strong> · {record.attempts} submitted {record.attempts === 1 ? 'attempt' : 'attempts'}</p>}</div><button className="primary" onClick={onStart}>{record?.submittedAnswers ? 'Review quiz' : record?.answers.some(answer => answer !== null) ? 'Continue quiz' : 'Start quiz'}<ArrowRight size={18} /></button></section>;
}

export default function ModuleQuiz({ module, grade, record = emptyQuiz(), onChange, onBack, onNext, nextTitle }: { module: LearningModule; grade?: number; record?: QuizRecord; onChange: (record: QuizRecord) => void; onBack: () => void; onNext?: () => void; nextTitle?: string }) {
  const questions = moduleQuiz(module.id, grade);
  const submitted = record.submittedAnswers;
  const score = quizScore(module.id, submitted, grade);
  const remaining = record.answers.filter(answer => answer === null).length;
  const [error, setError] = useState('');
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const wasSubmitted = useRef(!!submitted);
  useEffect(() => { if (submitted && !wasSubmitted.current) resultHeading.current?.focus(); wasSubmitted.current = !!submitted; }, [submitted]);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (remaining) { setError(`Choose an answer for ${remaining === 1 ? 'the remaining question' : `all ${remaining} remaining questions`} before submitting.`); return; }
    const answers = record.answers as number[];
    const bestAnswers = record.bestAnswers && quizScore(module.id, record.bestAnswers, grade) >= quizScore(module.id, answers, grade) ? record.bestAnswers : [...answers];
    onChange({ ...record, submittedAnswers: [...answers], bestAnswers, attempts: Math.min(100000, record.attempts + 1) });
    setError('');
  }
  return <section className="module-quiz" aria-label={`${module.title} quiz`}>
    <button className="secondary" onClick={onBack}>Back to module</button>
    {submitted ? <div className="quiz-result"><h2 ref={resultHeading} tabIndex={-1}>You answered {score} of 5 correctly</h2><p>{score === 5 ? 'You understood every question in this quiz. Well done!' : 'Read the explanations below to see what worked and what to practise.'} Your best result stays saved when you retry.</p><p>Best result: <strong>{quizScore(module.id, record.bestAnswers, grade)} / 5</strong> · Attempt {record.attempts}</p></div> : <p className="quiz-instructions">Five questions about {module.title.toLowerCase()}. Choose one answer for each, then submit to see your result and explanations. You can leave and come back to your answers.</p>}
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
