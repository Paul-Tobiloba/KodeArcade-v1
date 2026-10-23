import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleCheck, Download, Gamepad2, Keyboard, Leaf, Pause, Play, RotateCcw, Settings, Sprout, Star, Type, Volume2,VolumeX,Wrench } from 'lucide-react';
import { typingActivities, typingActivity, typingCourse, type TypingActivity, type TypingKind } from '../shared/typingCurriculum';
import { emptyTyping, insertedText, mergeTyping, readTyping, typedWords, typingAccuracy, typingStars, typingStorageKey, type TypingProgress, type TypingResult } from '../shared/typing';
import { activityStorage } from './activityStorage';
import type { LearnerAccount } from './LearnerMenu';
import PlatformHeader from './PlatformHeader';
import SaveFeedback, { type SaveFeedbackProps } from './SaveFeedback';
import { KeyboardPanel, TypingLegend, TypingLessonHero, TypingViewport } from './TypingPractice';
import {TypingKeySound} from './typingKeySound';
import { correctedPositions } from './typingFeedback';
import RewardStars from './RewardStars';
import { useConfirmation } from './ConfirmationProvider';
import './typing.css';
import './typing-practice.css';
import './typing-claude.css';

const activityIcons: Record<TypingKind, typeof Keyboard> = { keys: Keyboard, copy: Type, game: Gamepad2, story: BookOpen, edit: Wrench, create: Sprout, review: RotateCcw, check: CircleCheck };
const modeLabels: Record<TypingKind, string> = { keys: 'Follow the keys', copy: 'Read and type', game: 'Key garden', story: 'Story steps', edit: 'Repair workshop', create: 'Writing studio', review: 'Personal practice', check: 'Independent check' };
function download(text: string, filename: string, type = 'application/json') { const url = URL.createObjectURL(new Blob([text], { type })), link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function readInitial(grade: number) { let raw: string | null = null; try { raw = activityStorage.getItem(typingStorageKey(`grade-${grade}`)); return { progress: raw ? readTyping(JSON.parse(raw), grade) : emptyTyping(grade), error: '', raw }; } catch { return { progress: emptyTyping(grade), error: 'Your typing progress could not be read. The original has not been replaced. Download it for recovery before leaving.', raw }; } }
type Outcome = { stars: number; accuracy?: number; wpm?: number; duration: number; supported: boolean; independent: boolean };

export default function TypingCourse({ grade, lessonId, student, cloud, beforeLeave }: { grade: number; lessonId?: string; student?: LearnerAccount; cloud?: SaveFeedbackProps; beforeLeave?: () => Promise<boolean> }) {
  const confirm = useConfirmation();
  const [loaded] = useState(() => readInitial(grade));
  const [progress, setProgress] = useState(loaded.progress), [saveError, setSaveError] = useState(loaded.error);
  const [view, setView] = useState<'map' | 'practice' | 'result'>(() => typingActivity(lessonId ?? '')?.grade === grade ? 'practice' : 'map');
  const [activityId, setActivityId] = useState(typingActivity(lessonId ?? '')?.grade === grade ? lessonId! : loaded.progress.currentId);
  const activity = typingActivity(activityId)!, course = typingCourse(grade), all = typingActivities(grade);
  const [value, setValue] = useState(activity.initial), [round, setRound] = useState(0), [paused, setPaused] = useState(false), [feedback, setFeedback] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [guide, setGuide] = useState(!activity.independent && progress.preferences.guide), [supported, setSupported] = useState(false), [outcome, setOutcome] = useState<Outcome>();
  const [systemReduced, setSystemReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const input = useRef<HTMLTextAreaElement>(null), passage = useRef<HTMLDivElement>(null), resultHeading = useRef<HTMLHeadingElement>(null), settings = useRef<HTMLDetailsElement>(null);
  const [corrected, setCorrected] = useState<ReadonlySet<number>>(()=>new Set()), [streak,setStreak]=useState(0), [,setTick]=useState(0);
  const [keySound,setKeySound]=useState(true), sound=useRef<TypingKeySound|null>(null);
  useEffect(()=>()=>{sound.current?.dispose();},[]);
  const clock = useRef({ elapsed: 0, started: 0 }), stats = useRef({ attempts: 0, correct: 0, pasted: false });
  const caret = useRef({ start: activity.initial.length, end: activity.initial.length });
  const latest = useRef(progress); latest.current = progress;
  const roundMode = activity.kind === 'game' || activity.kind === 'story';
  const target = roundMode ? activity.rounds[round] ?? '' : activity.target;
  const free = activity.kind === 'create', editing = activity.kind === 'edit';
  const reduced = systemReduced || progress.preferences.reducedMotion;
  function stopClock() { if (clock.current.started) { clock.current.elapsed += Date.now() - clock.current.started; clock.current.started = 0; } }
  function startClock() { if (!clock.current.started && !paused && view === 'practice') clock.current.started = Date.now(); }
  function pause() { if (input.current) caret.current = { start: input.current.selectionStart, end: input.current.selectionEnd }; stopClock(); setPaused(true); }
  function resume() { setPaused(false); requestAnimationFrame(() => { if(free||editing){input.current?.focus(); input.current?.setSelectionRange(caret.current.start, caret.current.end);}else passage.current?.focus(); }); }
  useEffect(() => { document.title = `Grade ${grade} Typing · ${course.title} | KodeArcade`; }, [grade, course.title]);
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'), changed = () => setSystemReduced(media.matches); media.addEventListener('change', changed); return () => media.removeEventListener('change', changed); }, []);
  useEffect(() => { const hidden = () => { if (document.hidden && view === 'practice') { if (clock.current.started) { clock.current.elapsed += Date.now() - clock.current.started; clock.current.started = 0; } setPaused(true); } }; document.addEventListener('visibilitychange', hidden); return () => document.removeEventListener('visibilitychange', hidden); }, [view]);
  useEffect(() => { if (view === 'result') resultHeading.current?.focus(); }, [view]);
  useEffect(() => {
    if (view !== 'practice' || paused || loaded.error) return;
    const frame = requestAnimationFrame(() => (input.current ?? passage.current)?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [view, activityId, round, paused, attempt, loaded.error]);
  useEffect(()=>{if(view!=='practice'||paused)return;const timer=setInterval(()=>{if(clock.current.started)setTick(tick=>tick+1);},500);return()=>clearInterval(timer);},[view,paused]);
  useEffect(() => { const leaving = (event: BeforeUnloadEvent) => { if (view === 'practice' && free && value.trim()) { event.preventDefault(); event.returnValue = ''; } }; addEventListener('beforeunload', leaving); return () => removeEventListener('beforeunload', leaving); }, [view, free, value]);
  function save(next: TypingProgress) {
    if (loaded.error) return;
    const safe = readTyping(next, grade); setProgress(safe); latest.current = safe;
    try { activityStorage.setItem(typingStorageKey(course.id), JSON.stringify(safe)); setSaveError(''); }
    catch { setSaveError('Saving is unavailable. Your progress remains open; download a backup before leaving, or retry saving.'); }
  }
  function updatePreferences(patch: Partial<TypingProgress['preferences']>) { save({ ...latest.current, preferences: { ...latest.current.preferences, ...patch } }); }
  async function canLeaveWriting() { return !free || !value.trim() || await confirm({ title: 'Leave this writing?', message: 'Your completed activities and stars are saved, but the written text is only in this session. Cancel and use Download writing to keep a copy.', confirmLabel: 'Leave writing', cancelLabel: 'Keep writing' }); }
  async function leaveCourse(event: MouseEvent<HTMLElement>) { const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]'); if (!link || link.getAttribute('href')?.startsWith('#') || !free || !value.trim()) return; event.preventDefault(); const href = link.href; if (await canLeaveWriting() && (!beforeLeave || await beforeLeave())) location.href = href; }
  async function lessonMap() { if (await canLeaveWriting()) { stopClock(); setValue(''); setView('map'); } }
  async function open(next: TypingActivity) {
    if (!await canLeaveWriting()) return;
    setAttempt(attempt => attempt + 1);
    stopClock(); setActivityId(next.id); setValue(next.initial); setCorrected(new Set()); setStreak(0); setRound(0); setPaused(false); setFeedback(''); setOutcome(undefined); setSupported(false); setGuide(next.independent ? false : latest.current.preferences.guide); clock.current = { elapsed: 0, started: 0 }; stats.current = { attempts: 0, correct: 0, pasted: false }; setView('practice'); save({ ...latest.current, currentId: next.id });
  }
  function finish() {
    stopClock();
    const accuracy = free || editing ? undefined : typingAccuracy(stats.current.correct, stats.current.attempts);
    const duration = Math.max(0, Math.min(86400000, clock.current.elapsed));
    const wpm = !free && !editing && !stats.current.pasted && stats.current.attempts >= 40 && duration >= 1000 ? Math.min(500, Math.round(stats.current.correct / 5 / (duration / 60000))) : undefined;
    const stars = typingStars(accuracy), usedSupport = supported || stats.current.pasted || (activity.independent && guide);
    const old = latest.current.results[activity.id];
    const result: TypingResult = { attempts: Math.min(100000, (old?.attempts ?? 0) + 1), complete: true, bestStars: stars, ...(accuracy === undefined ? {} : { bestAccuracy: accuracy, latestAccuracy: accuracy }), ...(wpm === undefined ? {} : { bestWpm: wpm }), durationMs: Math.round(duration), independent: activity.independent && !usedSupport && (accuracy ?? 0) >= [85,90,92,95,95,95][grade - 1], ...(activity.independent && !usedSupport && accuracy !== undefined ? { independentAccuracy: accuracy } : {}) };
    save(mergeTyping(latest.current, { ...latest.current, currentId: activity.id, results: { ...latest.current.results, [activity.id]: result } }));
    setOutcome({ stars, accuracy, wpm, duration, supported: usedSupport, independent: result.independent }); setView('result');
  }
  function change(event: ChangeEvent<HTMLTextAreaElement>) {
    changeValue(event.target.value);
  }
  function changeValue(next:string) {
    startClock();
    const added = insertedText(value, next);
    if(keySound&&!free&&!editing){const character=added.text.at(-1),kind=next.length<value.length?'backspace':character!==target[added.start+added.text.length-1]?'error':character===' '?'space':'key';(sound.current??=new TypingKeySound()).play(kind);}
    if (!free && !editing) {
      setCorrected(history=>correctedPositions(value,next,target,history));
      let run=streak;
      for (let i = 0; i < added.text.length; i++) { stats.current.attempts++; if (added.text[i] === target[added.start + i]) {stats.current.correct++;run++;}else run=0; }
      setStreak(run);
    }
    setValue(next); setFeedback('');
    if (!free && next === target) {
      if (roundMode && round < activity.rounds.length - 1) { setRound(round + 1); setValue(''); setCorrected(new Set()); setFeedback(activity.kind === 'game' ? 'A new plant grew. Here is your next word.' : 'Story step complete. Read the next part.'); }
      else finish();
    }
  }
  function showGuide() { const next = !guide; setGuide(next); if (next && activity.independent) setSupported(true); updatePreferences({ guide: next }); }
  const completed = Object.keys(progress.results).length, bestStars = Object.values(progress.results).reduce((sum, result) => sum + result.bestStars, 0);
  const next = all[all.findIndex(item => item.id === activity.id) + 1];
  const continueActivity = all.find(item => item.id === progress.currentId && !progress.results[item.id]) ?? all.find(item => !progress.results[item.id]) ?? all[0];
  const prefixLength = [...value].findIndex((character, index) => character !== target[index]);
  const wrong = !free && !editing && prefixLength >= 0;
  const percentage = free ? Math.min(100, typedWords(value) / activity.minWords * 100) : roundMode ? (round + Math.min(1, value.length / Math.max(1, target.length))) / activity.rounds.length * 100 : Math.min(100, value.length / Math.max(1, target.length) * 100);
  const backHref = student ? '/#/student-courses' : '/#/learn?subject=typing';
  const elapsed=clock.current.elapsed+(clock.current.started?Date.now()-clock.current.started:0);
  const liveWpm=!stats.current.pasted&&stats.current.attempts>=10&&elapsed>=1000?Math.min(500,Math.round(stats.current.correct/5/(elapsed/60000))):undefined;
  const direct=view==='practice'&&!free&&!editing;
  const matched=[...target].filter((character,index)=>value[index]===character).length;
  return <div onClickCapture={leaveCourse} data-protect-writing={free && value.trim() ? "true" : undefined} className={`typing-app typing-claude-view${view === 'map' ? ' typing-map-view' : ''}${direct?' typing-direct-view':''}${reduced ? ' typing-reduced' : ''}${progress.preferences.largeText ? ' typing-large' : ''}`}>
    <a className="skip-link" href="#typing-main">Skip to activity</a>
    <PlatformHeader context={`Grade ${grade} · Typing${student?'':' · Preview on this device'}`} student={student?{...student,signOut:async()=>{if(await canLeaveWriting())await student.signOut();}}:undefined} onSettings={()=>{if(settings.current)settings.current.open=true;}}/>
    {cloud && <SaveFeedback {...cloud} />}
    <main id="typing-main" className="typing-main">
      <div className="typing-toolbar"><a className="typing-link" href={backHref}><ArrowLeft size={17} />{student?'My courses':'All courses'}</a>{view !== 'map' && <button className="typing-button quiet" onClick={lessonMap}><BookOpen size={17} />Back to lesson</button>}<span className="typing-course-name">{course.title}</span>
        <div className="typing-tools">{view === 'practice' && <><button className="typing-button" aria-pressed={guide} onClick={showGuide}><Keyboard size={17} />Guide {guide ? 'on' : 'off'}</button><button className="typing-button" onClick={() => paused ? resume() : pause()}>{paused ? <Play size={16} /> : <Pause size={16} />}{paused ? 'Resume' : 'Pause'}</button><button className="typing-button typing-sound-toggle" aria-label={keySound?'Mute keyboard sound':'Enable keyboard sound'} aria-pressed={keySound} onClick={()=>setKeySound(!keySound)}>{keySound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button></>}<details className="typing-settings" ref={settings}><summary aria-label="Typing settings"><Settings size={18} />Settings</summary><div><label><input type="checkbox" checked={keySound} onChange={event=>setKeySound(event.target.checked)}/>Keyboard sound</label><label><input type="checkbox" checked={progress.preferences.largeText} onChange={event => updatePreferences({ largeText: event.target.checked })} />Larger practice text</label><label><input type="checkbox" checked={progress.preferences.reducedMotion} onChange={event => updatePreferences({ reducedMotion: event.target.checked })} />Reduce motion</label><p>Hints and retries never remove earned stars. Written text stays in this session; use Download writing to keep a copy.</p><button className="typing-button" onClick={() => download(JSON.stringify(progress, null, 2), `kodearcade-typing-grade-${grade}.json`)}><Download size={16} />Download progress</button></div></details></div>
      </div>
      {saveError && <div className="typing-save-error" role="alert"><p>{saveError}</p><button className="typing-button" onClick={() => download(loaded.error && loaded.raw ? loaded.raw : JSON.stringify(progress, null, 2), `kodearcade-typing-recovery-grade-${grade}.json`)}>Download recovery copy</button>{!loaded.error && <button className="typing-button" onClick={() => save(progress)}>Retry save</button>}</div>}
      {!loaded.error && (view === 'map' ? <>
        <div className="typing-course-heading"><div><h1>{course.title}</h1><p>{course.description}</p></div><div className="typing-course-total"><span>{completed} of 120 activities complete</span><progress value={completed} max={120} aria-label="Typing course completion" /><small>{bestStars} best stars · ten units</small></div></div>
        <div className="typing-map-layout"><aside><h2>Your next step</h2><p>Short practice. Careful fingers. No rush.</p><button className="typing-button primary" onClick={() => open(continueActivity)}><Play size={17} />{completed ? 'Continue practice' : 'Start typing'}</button><p className="typing-course-note">Grades are a guide, not a gate. Start with the unit that feels comfortable. Checkpoints distinguish supported practice from independent results.</p></aside><div className="typing-units">{course.units.map((unit, index) => <details className="typing-unit" key={unit.id} open={index === continueActivity.unit || undefined}><summary><span><span className="typing-unit-number">{index + 1}</span><strong>{unit.title}</strong></span><span>{unit.activities.filter(item => progress.results[item.id]).length} / 12</span></summary><div className="typing-activity-grid">{unit.activities.map(item => { const Icon = activityIcons[item.kind], result = progress.results[item.id]; return <button className={`typing-activity-card${item.id === continueActivity.id ? ' current' : ''}`} key={item.id} onClick={() => open(item)}><span className="typing-activity-number">{item.number}</span><Icon size={25} /><strong>{item.title.split(' · ')[0]}</strong><small>{modeLabels[item.kind]}</small>{result && <span className="typing-activity-complete"><Check size={14} />{result.bestStars}<Star size={12} fill="currentColor" /></span>}</button>; })}</div></details>)}</div></div>
      </> : view === 'result' && outcome ? <section className="typing-result" aria-label="Typing result"><RewardStars value={outcome.stars} reduced={reduced} /><h1 ref={resultHeading} tabIndex={-1}>{outcome.accuracy !== undefined && outcome.accuracy < 90 ? 'Keep finding your rhythm' : 'Lovely, careful work!'}</h1><p>{modeLabels[activity.kind]} complete · {activity.number} of 120</p><div className="typing-result-facts">{outcome.accuracy !== undefined && <div><strong>{outcome.accuracy}%</strong><span>First-try accuracy</span></div>}<div><strong>{Math.max(1, Math.round(outcome.duration / 1000))}s</strong><span>Active practice</span></div>{outcome.wpm !== undefined && <div><strong>{outcome.wpm}</strong><span>Words per minute</span></div>}</div><p>{outcome.supported ? 'Supported practice counts. Your best stars are safe.' : activity.independent ? outcome.independent ? 'Independent checkpoint achieved.' : 'Check complete. Try a little targeted practice before another independent check.' : free ? 'Your ideas count. Composition is not a speed test.' : editing ? 'You repaired the draft. Thoughtful corrections are part of learning.' : 'Careful practice matters more than racing the clock.'}</p><p className="typing-result-best">Best saved for this activity: {progress.results[activity.id]?.bestStars} / 5 stars</p>{free && <button className="typing-button" onClick={() => download(value, `my-typing-grade-${grade}.txt`, 'text/plain')}><Download size={17} />Download writing</button>}<div className="typing-result-actions"><button className="typing-button" onClick={() => open(activity)}><RotateCcw size={17} />Practise again</button><button className="typing-button primary" onClick={() => next ? open(next) : lessonMap()}>{next ? 'Next activity' : 'Back to lessons'}<ArrowRight size={17} /></button></div><button className="typing-button quiet" onClick={lessonMap}>Lesson map</button></section> : <>
        <TypingLessonHero title={activity.title.split(' · ')[1]} number={activity.number} mode={modeLabels[activity.kind]} percentage={editing?matched/Math.max(1,target.length)*100:percentage} detail={free?`${typedWords(value)} of ${activity.minWords} words`:editing?`${matched} of ${target.length} matched`:roundMode?`Round ${round+1} of ${activity.rounds.length}`:`${Math.min(value.length,target.length)} of ${target.length} keys`} accuracy={typingAccuracy(stats.current.correct,stats.current.attempts)} streak={streak} wrong={wrong} measured={direct}/>
        <section className={`typing-stage${direct?' typing-direct-stage':''}`} aria-label="Typing activity">
          {paused ? <div className="typing-paused"><Pause size={28} /><h2>Take a breath</h2><p>Your place is waiting for you.</p><button className="typing-button primary" onClick={resume}>Continue practice</button></div> : <>
            <div className="typing-stage-heading"><span className="typing-mode"><Keyboard size={19}/>{modeLabels[activity.kind]}</span><p id="typing-instruction" className="typing-instruction">{activity.instruction}</p></div>
            {activity.kind === 'game' && <div className="typing-garden" aria-label={`${round} of ${activity.rounds.length} plants grown`}>{activity.rounds.map((_, index) => <span key={index} className={index < round ? 'grown' : index === round ? 'growing' : ''}>{index < round ? <Leaf size={26} /> : <Sprout size={26} />}</span>)}</div>}
            {activity.kind === 'story' && <div className="typing-story-steps" aria-label={`${round} story steps revealed`}>{activity.rounds.map((part, index) => <span key={index} className={index < round ? 'revealed' : ''}>{index < round ? <><Check size={14} />{part}</> : <BookOpen size={16} />}</span>)}</div>}
            {direct?<><TypingViewport target={target} value={value} corrected={corrected} short={activity.kind==='keys'&&grade<=2} large={progress.preferences.largeText} inputRef={passage} onChange={changeValue} onFocus={()=>{}} onBlur={stopClock} onPaste={()=>{stats.current.pasted=true;setSupported(true);}}/><TypingLegend/></>:<>{editing&&<div className="typing-target editing-model" role="img" aria-label={`Model: ${target}`}>{target}</div>}<label className="typing-input-label" htmlFor="typing-entry">{free?'Your writing':'Edit this draft to match the model'}</label><textarea id="typing-entry" ref={input} rows={free?5:3} value={value} maxLength={free?4000:Math.max(100,target.length*2+10)} spellCheck={free} autoComplete="off" autoCorrect="off" autoCapitalize="off" aria-describedby="typing-instruction typing-feedback" onFocus={startClock} onBlur={stopClock} onChange={change} onPaste={()=>{stats.current.pasted=true;setSupported(true);}}/></>}
            <p id="typing-feedback" className={`typing-feedback${wrong ? ' error' : ''}`} role="status">{feedback || (wrong ? 'A key is different. Use Backspace to try it again.' : free ? `Write at least ${activity.minWords} words. Fictional details only; your writing is not stored in your account.` : editing ? 'Use the caret, selection, Backspace and undo to repair the extra character.' : '')}</p>
            {free && <div className="typing-writing-actions"><button className="typing-button primary" disabled={typedWords(value) < activity.minWords} onClick={finish}>Finish writing<Check size={17} /></button><button className="typing-button" disabled={!value.trim()} onClick={() => download(value, `my-typing-grade-${grade}.txt`, 'text/plain')}><Download size={17} />Download writing</button></div>}
          </>}
        </section>
        {!paused&&direct&&<KeyboardPanel guide={guide} next={target[value.length]}/>}
        <footer className="typing-practice-footer"><button className="typing-button quiet" onClick={() => open(activity)}><RotateCcw size={17} />Try again</button><span>{direct?`WPM ${liveWpm??'—'} · Accuracy before speed.`:'Hints and retries never remove earned stars.'}</span>{!free && <button className="typing-button quiet" onClick={lessonMap}>Lesson map</button>}</footer>
      </>)}
    </main>
  </div>;
}
