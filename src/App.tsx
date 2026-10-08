import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square, RotateCcw, Lightbulb, Settings, X, ChevronRight, Code2, Sparkles, Trash2, BookOpen, LibraryBig, ShieldCheck, PanelLeftClose, PanelLeftOpen, Star, Check } from 'lucide-react';
import { missions, same, type Position, type RunResult } from './learning';
import { modules, moduleFor, missionIndex, nextChallenge } from './curriculum';
import { emptySave, freshProgress, loadSave, SAVE_KEY, switchCourse } from './storage';
import { courses, isCourse } from './courses';
import ComputerBasics from './ComputerBasics';
import BlockEditor, { type EditorHandle } from './BlockEditor';
import CourseDrawer from './CourseDrawer';
import LessonArticle from './LessonArticle';
import FeedbackDialog from './FeedbackDialog';
import MissionStage from './MissionStage';
import { ByteSound } from './sound';
import { needsLesson } from './lessonProgress';
import ReadAloud from './ReadAloud';
import { challengeStars } from './rewards';

export default function App() {
  const [loaded] = useState(() => { const state = loadSave(); const requested = location.hash.split('/')[2]; return isCourse(requested) ? { ...state, save: switchCourse(state.save, requested) } : state; });
  const [sound] = useState(() => new ByteSound());
  const [save, setSave] = useState(loaded.save);
  const [saveWarning, setSaveWarning] = useState(loaded.warning);
  const [storageBlocked, setStorageBlocked] = useState(!!loaded.warning);
  const [resumed, setResumed] = useState(loaded.resumed);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [awardedStars, setAwardedStars] = useState(5);
  const [retryMessage, setRetryMessage] = useState('');
  const [lastClue, setLastClue] = useState('');
  const [hintsOpen, setHintsOpen] = useState(false);
  const [position, setPosition] = useState<Position>(missions[save.current].start);
  const [activeBlock, setActiveBlock] = useState('');
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState('');
  const [showLesson, setShowLesson] = useState(needsLesson(loaded.save, missions[loaded.save.current].id));
  const [previewModule, setPreviewModule] = useState<string | null>(null);
  const [small, setSmall] = useState(() => matchMedia('(max-width: 900px)').matches);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const [systemReduced, setSystemReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [offline, setOffline] = useState(!navigator.onLine);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const settings = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const editor = useRef<EditorHandle>(null);
  const stage = useRef<HTMLElement>(null);
  const drawerToggle = useRef<HTMLButtonElement>(null);
  const runButton = useRef<HTMLButtonElement>(null);
  const [blockCount, setBlockCount] = useState(0);
  const [basics, setBasics] = useState(() => location.hash === '#/learn/computer');
  const [editorKey, setEditorKey] = useState(0);
  const baseMission = missions[save.current];
  const progress = save.progress[baseMission.id] ?? freshProgress(save.current);
  const mission = { ...baseMission, end: progress.end ?? baseMission.end };
  const module = previewModule ? modules.find(m => m.id === previewModule)! : moduleFor(mission.id);
  const challengeNumber = module.challengeIds.indexOf(mission.id) + 1;
  const total = modules.filter(m => m.id !== 'project').flatMap(m => m.challengeIds);
  const completed = total.filter(id => save.progress[id]?.complete).length;
  const reduced = save.reducedMotion || systemReduced;
  const starChime = useCallback(() => { void sound.play('star'); }, [sound]);
  const nextId = nextChallenge(mission.id);
  const upcoming = module.status === 'upcoming';
  const arrows = save.course === 'arrows';
  const playing = !showLesson && !basics;

  function requestHint() {
    setHintsOpen(true);
    setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...(s.progress[mission.id] ?? freshProgress(s.current)), hints: Math.min(4, progress.hints + 1) } } }));
  }

  useEffect(() => {
    if (storageBlocked) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); setSaveWarning(''); }
    catch { setSaveWarning('Progress cannot be saved in this browser. Keep this tab open to continue, or allow browser storage.'); }
  }, [save, storageBlocked]);
  useEffect(() => {
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const widthQuery = matchMedia('(max-width: 900px)');
    const motion = () => setSystemReduced(motionQuery.matches);
    const width = () => { setSmall(widthQuery.matches); if (widthQuery.matches) setDrawerOpen(false); };
    const connection = () => setOffline(!navigator.onLine);
    motionQuery.addEventListener('change', motion); widthQuery.addEventListener('change', width);
    window.addEventListener('online', connection); window.addEventListener('offline', connection);
    return () => { motionQuery.removeEventListener('change', motion); widthQuery.removeEventListener('change', width); window.removeEventListener('online', connection); window.removeEventListener('offline', connection); };
  }, []);
  useEffect(() => { sound.setEnabled(save.soundEnabled); }, [sound, save.soundEnabled]);
  useEffect(() => {
    const silence = () => { if (document.hidden) sound.stop(); };
    document.addEventListener('visibilitychange', silence);
    return () => { document.removeEventListener('visibilitychange', silence); sound.dispose(); };
  }, [sound]);
  useEffect(() => () => { generation.current++; if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { editor.current?.highlight(activeBlock); }, [activeBlock]);
  useEffect(() => { if (!retryMessage) return; const timeout = setTimeout(() => setRetryMessage(''), 3000); return () => clearTimeout(timeout); }, [retryMessage]);

  function stop() { sound.stop(); generation.current++; if (timer.current) clearTimeout(timer.current); setRunning(false); setActiveBlock(''); }
  function focusHeading() { requestAnimationFrame(() => { heading.current?.focus(); window.scrollTo({ top: 0, behavior: 'auto' }); }); }
  function navigate(id: string) {
    const index = missionIndex(id); if (index < 0) return;
    stop(); setHintsOpen(false); setFeedbackOpen(false); setRetryMessage(''); setLastClue(''); setSave(s => ({ ...s, current: index })); setPosition(missions[index].start);
    setResult(null); setStep(0); setNotice(''); setResumed(false); setShowLesson(needsLesson(save, id)); setPreviewModule(null);
    closeDrawer(); focusHeading();
  }
  function selectModule(id: string) {
    const selected = modules.find(m => m.id === id)!;
    if (selected.status === 'upcoming') { stop(); setFeedbackOpen(false); setPreviewModule(id); setShowLesson(true); if (small) closeDrawer(); focusHeading(); }
    else if (module.id !== id || previewModule) navigate(selected.challengeIds[0]);
  }
  function startChallenge() {
    setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...(s.progress[mission.id] ?? freshProgress(s.current)), lessonSeen: true } } }));
    setDrawerOpen(false); setShowLesson(false); setResumed(false); setResult(null); setFeedbackOpen(false); setPosition(mission.start); setStep(0); focusHeading();
  }
  function reviewLesson() { stop(); setFeedbackOpen(false); setShowLesson(true); focusHeading(); }
  function updateWorkspace(workspace: Record<string, unknown>, count: number) {
    setBlockCount(count);
    setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...(s.progress[mission.id] ?? freshProgress(s.current)), workspace } } }));
    setResult(null); setPosition(mission.start); setStep(0);
  }
  function dismissFeedback() { sound.stop(); setFeedbackOpen(false); requestAnimationFrame(() => runButton.current?.focus({ preventScroll: true })); }
  function run() {
    stop(); setResumed(false); setNotice(''); setResult(null); setFeedbackOpen(false); setRetryMessage(''); setPosition(mission.start); setStep(0);
    void sound.unlock();
    const outcome = editor.current!.run(mission);
    const token = generation.current;
    function finish() {
      if (generation.current !== token) return;
      setRunning(false); setActiveBlock(''); setResult(outcome);
      const reward = challengeStars(progress.attempts + 1, progress.hints);
      setSave(s => { const previous = s.progress[mission.id] ?? freshProgress(s.current); return { ...s, progress: { ...s.progress, [mission.id]: { ...previous, attempts: previous.attempts + 1, ...(outcome.success ? { complete: true, stars: Math.max(previous.stars ?? 0, reward) } : {}) } } }; });
      if (outcome.success) { setAwardedStars(reward); setFeedbackOpen(true); setLastClue(''); }
      else { void sound.play('retry'); setRetryMessage(outcome.message); setLastClue(outcome.message); }
    }
    setRunning(true); let i = 0;
    function advance() {
      if (generation.current !== token) return;
      const frame = outcome.frames[i++]; if (!frame) { timer.current = setTimeout(finish, 650); return; }
      setPosition(frame); setActiveBlock(frame.blockId); setStep(frame.step); void sound.play('move'); timer.current = setTimeout(advance, 480);
    }
    timer.current = setTimeout(advance, 200);
  }
  function openBasics(open: boolean) { stop(); setFeedbackOpen(false); setBasics(open); history.replaceState(null, '', `/#/learn/${open ? 'computer' : save.course}`); if (small) closeDrawer(); }
  function chooseEnd(end: Position) {
    if (running || same(end, mission.start) || mission.walls.some(w => same(w, end))) return;
    setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...s.progress[mission.id], end, complete: false } } }));
    setResult(null); setRetryMessage(''); setLastClue(''); setPosition(mission.start); setStep(0); setNotice(`Station moved to row ${end.y + 1}, column ${end.x + 1}.`);
  }
  function resetAll() {
    if (!window.confirm('Delete your nickname, programs, and progress from this browser? This cannot be undone.')) return;
    stop();
    try { localStorage.removeItem(SAVE_KEY); setStorageBlocked(false); setSaveWarning(''); }
    catch { setSaveWarning('Browser storage could not be cleared. Use your browser settings to delete this site’s data.'); }
    const reset = emptySave(); setSave(reset); setEditorKey(key => key + 1); setPosition(missions[reset.current].start); setResult(null); setFeedbackOpen(false);
    setStep(0); setResumed(false); setNotice('Session progress reset.'); setShowLesson(true); setPreviewModule(null); settings.current?.close(); focusHeading();
  }

  return <div className={`app course-app ${!showLesson && !basics ? 'challenge-active' : ''} ${drawerOpen ? 'drawer-open' : ''} ${save.largeText ? 'large-text' : ''} ${reduced ? 'reduced-motion' : ''}`}>
    <a className="skip-link" href="#workspace" onClick={event => { event.preventDefault(); const workspace = document.getElementById('workspace'); workspace?.focus(); workspace?.scrollIntoView(); }}>Skip to learning</a>
    <header className="topbar">
      <button ref={drawerToggle} className="drawer-toggle" aria-label={drawerOpen ? 'Hide modules' : 'Show modules'} aria-controls="module-drawer" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(open => !open)}>{drawerOpen ? <PanelLeftClose size={22} /> : <PanelLeftOpen size={22} />}</button>
      <a className="brand" href="/" aria-label="KodeArcade home" inert={small && drawerOpen}><img className="brand-symbol" src="/brand/mark-color.svg" alt="" width="36" height="36" /><span className="brand-wordmark">KodeArcade</span></a>
      {playing ? <div className="game-context" inert={small && drawerOpen}><div className="game-course-title"><strong>{courses.find(course => course.id === save.course)!.title}</strong><span>{module.title} · Challenge {challengeNumber} of {module.challengeIds.length}</span></div><nav className="challenge-progress" aria-label="Challenge progress">{module.challengeIds.map((id, index) => { const complete = !!save.progress[id]?.complete; const windowStart = Math.max(0, Math.min(challengeNumber - 3, module.challengeIds.length - 5)); if (small && (index < windowStart || index >= windowStart + 5)) return null; return <button key={id} className={complete ? 'challenge-done' : ''} aria-label={`Challenge ${index + 1}: ${missions[missionIndex(id)].title}${complete ? ', completed' : ''}`} aria-current={id === mission.id ? 'step' : undefined} title={missions[missionIndex(id)].title} disabled={running} onClick={() => navigate(id)}>{complete ? <Check size={16} strokeWidth={3} /> : index + 1}</button>; })}</nav></div> : <span className="tagline">Play. Build. Learn.</span>}
      {playing && <div className="game-tools" inert={small && drawerOpen}><button className="lesson-link" aria-label="Read lesson" title="Read lesson" disabled={running} onClick={reviewLesson}><BookOpen size={20} /></button><ReadAloud text={`${mission.title}. ${mission.goal}. ${mission.hints.slice(0, progress.hints).join(' ')}`} label="Listen to challenge" /><button className="game-hint" aria-label="Get a hint" title="Get a hint" disabled={running} onClick={() => progress.hints ? setHintsOpen(open => !open) : requestHint()}><Lightbulb size={20} /></button><a href="/#/learn" className="game-course-link" aria-label="Change course" title="Change course"><LibraryBig size={20} /><span>Courses</span></a></div>}
      <div className="header-actions" inert={small && drawerOpen}><span className="prototype-label">Learning preview</span><button aria-label="Settings" className="settings-button" onClick={() => settings.current?.showModal()}><Settings size={18} /><span>Settings</span></button></div>
    </header>
    <CourseDrawer basics={basics} open={drawerOpen} small={small} currentModule={module.id} currentMission={previewModule ? '' : mission.id} save={save} onClose={closeDrawer} onModule={id => { openBasics(false); selectModule(id); }} onChallenge={id => { openBasics(false); navigate(id); }} toggle={drawerToggle} />
    <main id="workspace" className={`main course-main ${arrows ? 'arrow-course' : ''}`} tabIndex={-1} inert={small && drawerOpen}>
      <section className="course-picker" aria-label="Current course"><div><strong>{basics ? 'Computer Explorers' : courses.find(course => course.id === save.course)!.title}</strong><p>{basics ? 'Mouse and keyboard adventures' : courses.find(course => course.id === save.course)!.description}</p></div><a className="secondary" href="/#/learn">Change course</a></section>
      {basics ? <ComputerBasics complete={save.basicsComplete} onComplete={id => setSave(s => ({ ...s, basicsComplete: [...new Set([...s.basicsComplete, id])] }))} onBack={() => openBasics(false)} /> : <>
      {saveWarning && <div className="warning" role="alert">{saveWarning}</div>}
      {offline && <div className="warning" role="status">You’re offline. This loaded session can keep running. Offline reopening is not available in this preview yet.</div>}
      {resumed && <div className="resume-banner"><div><strong>Welcome back{save.nickname ? `, ${save.nickname}` : ''}.</strong> Your progress is saved. You were exploring {moduleFor(mission.id).title.toLowerCase()}.</div><button aria-label="Dismiss welcome back" onClick={() => setResumed(false)}><X size={18} /></button></div>}
      <div className="breadcrumb"><BookOpen size={15} /><span>{module.title}</span><ChevronRight size={14} /><span>{upcoming ? 'Module preview' : module.id === 'project' ? 'Creative project' : `Challenge ${challengeNumber} of ${module.challengeIds.length}`}</span><span className="concept-label">{upcoming ? 'Coming next' : showLesson ? 'Learn' : 'Build'}</span></div>
      {!upcoming && module.id !== 'project' && <nav className="island-trail" aria-label="Island challenges">{module.challengeIds.map((id, index) => <button key={id} className={save.progress[id]?.complete ? 'island-complete' : ''} aria-label={`Island ${index + 1}: ${missions[missionIndex(id)].title}${save.progress[id]?.complete ? ', recharged' : ''}`} aria-current={id === mission.id ? 'step' : undefined} disabled={running} onClick={() => navigate(id)}>{save.progress[id]?.complete ? <Star size={21} fill="currentColor" /> : index + 1}</button>)}</nav>}
      <div className="mission-heading"><div><h1 ref={heading} tabIndex={-1}>{showLesson ? module.lesson.title : mission.title}</h1><p>{showLesson ? module.description : mission.description}</p></div></div>
      {showLesson ? <LessonArticle module={module} mission={upcoming ? undefined : mission} onStart={startChallenge} previouslySeen={!upcoming && !needsLesson(save, mission.id)} arrows={arrows} /> : <>
        {hintsOpen && <section className="game-help" aria-label="Hints"><div className="dialog-heading"><h2>A little nudge?</h2><button aria-label="Close hints" onClick={() => setHintsOpen(false)}><X size={20} /></button></div><p className="hint-current" aria-live="polite">{mission.hints[Math.max(0, progress.hints - 1)]}</p><p className="hint-cost">{progress.hints < 4 ? `Next hint: up to ${challengeStars(progress.attempts + 1, progress.hints + 1)} stars. Your saved best stays safe.` : 'You have seen all four hints.'}</p><button className="secondary" disabled={running || progress.hints >= 4} onClick={requestHint}>Show next hint<ChevronRight size={16} /></button></section>}
        <div className="workspace-grid">
          <MissionStage stageRef={stage} mission={mission} position={position} step={step} result={result} running={running} onChooseEnd={chooseEnd} notice={retryMessage && <div className="retry-toast" role="status"><div><strong>Almost there!</strong><p>{retryMessage}</p></div><span aria-hidden="true">3s</span><button aria-label="Dismiss retry message" onClick={() => setRetryMessage('')}><X size={20} /></button></div>}>
            <div className="run-controls"><button ref={runButton} className="primary run-button" aria-label={running ? 'Stop run' : 'Run code'} onClick={running ? () => { stop(); setNotice('Run stopped. Your code is unchanged.'); } : run}>{running ? <Square size={22} /> : <Play size={22} fill="currentColor" />}{running ? 'Stop' : 'Play'}</button><button className="clear-button" disabled={running || !blockCount} onClick={() => editor.current?.clear()}><RotateCcw size={17} />Clear code</button></div>
            <details className="run-log"><summary>Last run</summary><p>{lastClue || 'Your next clue will appear here after a run.'}</p></details>
          </MissionStage>
          <section className="editor" aria-label="Code editor"><div className="editor-title"><h2><Code2 size={20} /> Your code</h2><span>{blockCount} / 24 blocks</span></div>
            <BlockEditor key={`${save.course}-${mission.id}-${editorKey}`} ref={editor} mission={mission} initial={progress.workspace} legacy={progress.blocks} running={running} arrows={arrows} onChange={updateWorkspace} onError={setNotice} />
            <p className="save-note"><ShieldCheck size={14} />{saveWarning ? 'Saving unavailable — see message above' : 'Your code saves on this device'}</p><div className="sr-only" role="status">{notice}</div>{notice && <p className="inline-notice" aria-hidden="true">{notice}</p>}
          </section>
        </div>
      </>}
      <footer className="workspace-footer"><span>Small steps. Big discoveries.</span><span><Sparkles size={14} /> Made for curious minds</span></footer>
      </>}
    </main>
    <FeedbackDialog open={feedbackOpen && !!result?.success} stars={awardedStars} message="Byte is recharged. Your instructions reached the station!" reduced={reduced} nextTitle={nextId ? missions[missionIndex(nextId)].title : undefined} onStar={starChime} onClose={dismissFeedback} onNext={() => nextId && navigate(nextId)} />
    <dialog ref={settings} aria-labelledby="settings-title" className="settings-dialog"><div className="dialog-heading"><h2 id="settings-title">Make yourself comfortable</h2><button aria-label="Close settings" onClick={() => settings.current?.close()}><X size={21} /></button></div><p>These preferences and your progress stay in this browser.</p><label className="nickname-label">Nickname <span>(optional)</span><input maxLength={20} value={save.nickname} placeholder="What should we call you?" autoComplete="off" onChange={e => setSave(s => ({ ...s, nickname: e.target.value }))} /></label><label className="toggle-label"><input type="checkbox" checked={save.largeText} onChange={e => setSave(s => ({ ...s, largeText: e.target.checked }))} /><span>Larger text</span></label><label className="toggle-label"><input type="checkbox" checked={save.reducedMotion} onChange={e => setSave(s => ({ ...s, reducedMotion: e.target.checked }))} /><span>Show steps without sliding animations</span></label>{systemReduced && <p>Your device’s reduced-motion preference is also active. Byte still shows each step before feedback.</p>}<label className="toggle-label"><input type="checkbox" checked={save.soundEnabled} onChange={e => setSave(s => ({ ...s, soundEnabled: e.target.checked }))} /><span>Byte sound effects</span></label><details className="reward-settings"><summary>How stars work</summary><p>Every completed challenge earns 1–5 stars. Early attempts keep all five; more retries and stronger hints gradually reduce the available reward. Your highest saved reward never decreases.</p>{progress.stars && <p>Best saved: {progress.stars} / 5</p>}</details><hr /><h3>Your learning so far</h3><p>{completed} of {total.length} challenges complete. {save.progress['rescue-project']?.complete ? 'Your project has a working route.' : 'Your project is ready whenever you are.'}</p><ul className="summary-list">{modules.filter(m => m.status === 'available').map(m => <li key={m.id}>{m.title}<span>{m.challengeIds.filter(id => save.progress[id]?.complete).length} / {m.challengeIds.length} complete</span></li>)}</ul><p className="privacy-copy">Anyone using this browser may see this progress. Use a nickname, not your real name. Clearing browser data removes your saved work.</p><button className="delete-button" onClick={resetAll}><Trash2 size={17} />Reset saved progress</button><button className="primary dialog-done" onClick={() => settings.current?.close()}>Done</button></dialog>
  </div>;
}
