import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square, RotateCcw, Lightbulb, Settings, X, ChevronRight, Code2, Sparkles, Trash2, BookOpen, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { missions, recommend, same, type Position, type RunResult } from './learning';
import { modules, moduleFor, missionIndex, nextChallenge } from './curriculum';
import { emptySave, freshProgress, loadSave, SAVE_KEY } from './storage';
import BlockEditor, { type EditorHandle } from './BlockEditor';
import CourseDrawer from './CourseDrawer';
import LessonArticle from './LessonArticle';
import FeedbackDialog from './FeedbackDialog';
import MissionStage from './MissionStage';

export default function App() {
  const [loaded] = useState(loadSave);
  const [save, setSave] = useState(loaded.save);
  const [saveWarning, setSaveWarning] = useState(loaded.warning);
  const [storageBlocked, setStorageBlocked] = useState(!!loaded.warning);
  const [resumed, setResumed] = useState(loaded.resumed);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [position, setPosition] = useState<Position>(missions[save.current].start);
  const [activeBlock, setActiveBlock] = useState('');
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState('');
  const [showLesson, setShowLesson] = useState(!loaded.save.progress[missions[loaded.save.current].id]?.lessonSeen);
  const [previewModule, setPreviewModule] = useState<string | null>(null);
  const [small, setSmall] = useState(() => matchMedia('(max-width: 900px)').matches);
  const [drawerOpen, setDrawerOpen] = useState(() => !matchMedia('(max-width: 900px)').matches);
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
  const [editorKey, setEditorKey] = useState(0);
  const baseMission = missions[save.current];
  const progress = save.progress[baseMission.id] ?? freshProgress(save.current);
  const mission = { ...baseMission, end: progress.end ?? baseMission.end };
  const module = previewModule ? modules.find(m => m.id === previewModule)! : moduleFor(mission.id);
  const challengeNumber = module.challengeIds.indexOf(mission.id) + 1;
  const total = modules.filter(m => m.id !== 'project').flatMap(m => m.challengeIds);
  const completed = total.filter(id => save.progress[id]?.complete).length;
  const reduced = save.reducedMotion || systemReduced;
  const recommendation = result ? recommend(result.success, progress.attempts, save.current) : null;
  const nextId = nextChallenge(mission.id);
  const upcoming = module.status === 'upcoming';

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
  useEffect(() => () => { generation.current++; if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { editor.current?.highlight(activeBlock); }, [activeBlock]);

  function stop() { generation.current++; if (timer.current) clearTimeout(timer.current); setRunning(false); setActiveBlock(''); }
  function focusHeading() { requestAnimationFrame(() => { heading.current?.focus(); window.scrollTo({ top: 0, behavior: 'auto' }); }); }
  function navigate(id: string) {
    const index = missionIndex(id); if (index < 0) return;
    stop(); setFeedbackOpen(false); setSave(s => ({ ...s, current: index })); setPosition(missions[index].start);
    setResult(null); setStep(0); setNotice(''); setResumed(false); setShowLesson(true); setPreviewModule(null);
    if (small) closeDrawer(); focusHeading();
  }
  function selectModule(id: string) {
    const selected = modules.find(m => m.id === id)!;
    if (selected.status === 'upcoming') { stop(); setFeedbackOpen(false); setPreviewModule(id); setShowLesson(true); if (small) closeDrawer(); focusHeading(); }
    else if (module.id !== id || previewModule) navigate(selected.challengeIds[0]);
  }
  function startChallenge() {
    setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...(s.progress[mission.id] ?? freshProgress(s.current)), lessonSeen: true } } }));
    setShowLesson(false); setResumed(false); setResult(null); setFeedbackOpen(false); setPosition(mission.start); setStep(0); focusHeading();
  }
  function reviewLesson() { stop(); setFeedbackOpen(false); setShowLesson(true); focusHeading(); }
  function updateWorkspace(workspace: Record<string, unknown>, count: number) {
    setBlockCount(count);
    setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...(s.progress[mission.id] ?? freshProgress(s.current)), workspace } } }));
    setResult(null); setPosition(mission.start); setStep(0);
  }
  function dismissFeedback() { setFeedbackOpen(false); requestAnimationFrame(() => runButton.current?.focus({ preventScroll: true })); }
  function run() {
    stop(); setResumed(false); setNotice(''); setResult(null); setFeedbackOpen(false); setPosition(mission.start); setStep(0);
    const outcome = editor.current!.run(mission);
    if (!blockCount) { setResult(outcome); setFeedbackOpen(true); return; }
    setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...s.progress[mission.id], attempts: progress.attempts + 1 } } }));
    const token = generation.current;
    function finish() {
      if (generation.current !== token) return;
      setRunning(false); setActiveBlock(''); setResult(outcome); setFeedbackOpen(true);
      if (outcome.success) setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...s.progress[mission.id], complete: true } } }));
    }
    if (reduced) { const last = outcome.frames.at(-1); if (last) { setPosition(last); setStep(last.step); } finish(); return; }
    if (matchMedia('(max-width: 800px)').matches) stage.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    setRunning(true); let i = 0;
    function advance() {
      if (generation.current !== token) return;
      const frame = outcome.frames[i++]; if (!frame) { finish(); return; }
      setPosition(frame); setActiveBlock(frame.blockId); setStep(frame.step); timer.current = setTimeout(advance, 480);
    }
    timer.current = setTimeout(advance, 200);
  }
  function chooseEnd(end: Position) {
    if (running || same(end, mission.start) || mission.walls.some(w => same(w, end))) return;
    setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...s.progress[mission.id], end, complete: false } } }));
    setResult(null); setPosition(mission.start); setStep(0); setNotice(`Station moved to row ${end.y + 1}, column ${end.x + 1}.`);
  }
  function resetAll() {
    if (!window.confirm('Delete your nickname, programs, and progress from this browser? This cannot be undone.')) return;
    stop();
    try { localStorage.removeItem(SAVE_KEY); setStorageBlocked(false); setSaveWarning(''); }
    catch { setSaveWarning('Browser storage could not be cleared. Use your browser settings to delete this site’s data.'); }
    setSave(emptySave()); setEditorKey(key => key + 1); setPosition(missions[0].start); setResult(null); setFeedbackOpen(false);
    setStep(0); setResumed(false); setNotice('Session progress reset.'); setShowLesson(true); setPreviewModule(null); settings.current?.close(); focusHeading();
  }

  return <div className={`app course-app ${drawerOpen ? 'drawer-open' : ''} ${save.largeText ? 'large-text' : ''} ${reduced ? 'reduced-motion' : ''}`}>
    <a className="skip-link" href="#workspace">Skip to learning</a>
    <header className="topbar">
      <button ref={drawerToggle} className="drawer-toggle" aria-label={drawerOpen ? 'Hide modules' : 'Show modules'} aria-controls="module-drawer" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(open => !open)}>{drawerOpen ? <PanelLeftClose size={22} /> : <PanelLeftOpen size={22} />}</button>
      <a className="brand" href="#workspace" aria-label="KodeArcade learning workspace" inert={small && drawerOpen}><span className="brand-mark"><Code2 size={25} /></span>Kode<span>Arcade</span></a>
      <span className="tagline">Play. Build. Learn.</span>
      <div className="header-actions" inert={small && drawerOpen}><span className="prototype-label">Learning preview</span><button aria-label="Settings" className="settings-button" onClick={() => settings.current?.showModal()}><Settings size={18} /><span>Settings</span></button></div>
    </header>
    <CourseDrawer open={drawerOpen} small={small} currentModule={module.id} currentMission={previewModule ? '' : mission.id} save={save} onClose={closeDrawer} onModule={selectModule} onChallenge={navigate} toggle={drawerToggle} />
    <main id="workspace" className="main course-main" tabIndex={-1} inert={small && drawerOpen}>
      {saveWarning && <div className="warning" role="alert">{saveWarning}</div>}
      {offline && <div className="warning" role="status">You’re offline. This loaded session can keep running. Offline reopening is not available in this preview yet.</div>}
      {resumed && <div className="resume-banner"><div><strong>Welcome back{save.nickname ? `, ${save.nickname}` : ''}.</strong> Your progress is saved. You were exploring {moduleFor(mission.id).title.toLowerCase()}.</div><button aria-label="Dismiss welcome back" onClick={() => setResumed(false)}><X size={18} /></button></div>}
      <div className="breadcrumb"><BookOpen size={15} /><span>{module.title}</span><ChevronRight size={14} /><span>{upcoming ? 'Module preview' : module.id === 'project' ? 'Creative project' : `Challenge ${challengeNumber} of ${module.challengeIds.length}`}</span><span className="concept-label">{upcoming ? 'Coming next' : showLesson ? 'Learn' : 'Build'}</span></div>
      <div className="mission-heading"><div><h1 ref={heading} tabIndex={-1}>{showLesson ? module.lesson.title : mission.title}</h1><p>{showLesson ? module.description : mission.description}</p></div>{!showLesson && <button className="lesson-link secondary" disabled={running} onClick={reviewLesson}><BookOpen size={17} />Read lesson</button>}</div>
      {showLesson ? <LessonArticle module={module} mission={upcoming ? undefined : mission} onStart={startChallenge} previouslySeen={!!progress.lessonSeen} /> : <>
        <section className="hint-panel top-hints" aria-label="Hints"><div className="hint-intro"><Lightbulb size={21} /><div><h2>A little nudge?</h2><p>Hints help you think it through. No points lost.</p></div></div><button className="hint-button" disabled={running || progress.hints >= 4} onClick={() => setSave(s => ({ ...s, progress: { ...s.progress, [mission.id]: { ...s.progress[mission.id], hints: Math.min(4, progress.hints + 1) } } }))}>{progress.hints === 0 ? 'Get a hint' : progress.hints < 4 ? 'Show next hint' : 'All hints shown'}<ChevronRight size={17} /></button>{progress.hints > 0 && <ol className="hint-list" aria-live="polite">{mission.hints.slice(0, progress.hints).map((hint, i) => <li key={hint}><strong>{['Notice', 'Remember', 'Example', 'Try this'][i]}</strong><span>{hint}</span></li>)}</ol>}</section>
        <div className="workspace-grid">
          <MissionStage stageRef={stage} mission={mission} position={position} step={step} result={result} running={running} onChooseEnd={chooseEnd} onStop={() => { stop(); setNotice('Run stopped. Your code is unchanged.'); }} />
          <section className="editor" aria-label="Code editor"><div className="editor-title"><h2><Code2 size={20} /> Build your program</h2><span>{blockCount} / 24 blocks</span></div><p className="editor-help">Drag blocks onto the canvas. Snap them together below the start block.</p>
            <BlockEditor key={`${mission.id}-${editorKey}`} ref={editor} mission={mission} initial={progress.workspace} legacy={progress.blocks} running={running} onChange={updateWorkspace} onError={setNotice} />
            <div className="run-controls"><button ref={runButton} className="primary run-button" onClick={running ? () => { stop(); setNotice('Run stopped. Your code is unchanged.'); } : run}>{running ? <Square size={18} /> : <Play size={18} fill="currentColor" />}{running ? 'Stop run' : 'Run code'}</button><button className="clear-button" disabled={running || !blockCount} onClick={() => editor.current?.clear()}><RotateCcw size={17} />Clear code</button></div>
            <p className="save-note"><ShieldCheck size={14} />{saveWarning ? 'Saving unavailable — see message above' : 'Your code saves on this device'}</p><div className="sr-only" role="status">{notice}</div>{notice && <p className="inline-notice" aria-hidden="true">{notice}</p>}
          </section>
        </div>
      </>}
      <footer className="workspace-footer"><span>Small steps. Big discoveries.</span><span><Sparkles size={14} /> Made for curious minds</span></footer>
    </main>
    <FeedbackDialog result={result} open={feedbackOpen} reflection={mission.reflection} recommendation={recommendation} nextTitle={nextId ? missions[missionIndex(nextId)].title : undefined} onClose={dismissFeedback} onNext={() => nextId && navigate(nextId)} onReview={reviewLesson} />
    <dialog ref={settings} aria-labelledby="settings-title" className="settings-dialog"><div className="dialog-heading"><h2 id="settings-title">Make yourself comfortable</h2><button aria-label="Close settings" onClick={() => settings.current?.close()}><X size={21} /></button></div><p>These preferences and your progress stay in this browser.</p><label className="nickname-label">Nickname <span>(optional)</span><input maxLength={20} value={save.nickname} placeholder="What should we call you?" autoComplete="off" onChange={e => setSave(s => ({ ...s, nickname: e.target.value }))} /></label><label className="toggle-label"><input type="checkbox" checked={save.largeText} onChange={e => setSave(s => ({ ...s, largeText: e.target.checked }))} /><span>Larger text</span></label><label className="toggle-label"><input type="checkbox" checked={save.reducedMotion} onChange={e => setSave(s => ({ ...s, reducedMotion: e.target.checked }))} /><span>Skip movement animations</span></label>{systemReduced && <p>Your device’s reduced-motion preference is also active.</p>}<hr /><h3>Your learning so far</h3><p>{completed} of {total.length} challenges complete. {save.progress['rescue-project']?.complete ? 'Your project has a working route.' : 'Your project is ready whenever you are.'}</p><ul className="summary-list">{modules.filter(m => m.status === 'available').map(m => <li key={m.id}>{m.title}<span>{m.challengeIds.filter(id => save.progress[id]?.complete).length} / {m.challengeIds.length} complete</span></li>)}</ul><p className="privacy-copy">Anyone using this browser may see this progress. Use a nickname, not your real name. Clearing browser data removes your saved work.</p><button className="delete-button" onClick={resetAll}><Trash2 size={17} />Reset saved progress</button><button className="primary dialog-done" onClick={() => settings.current?.close()}>Done</button></dialog>
  </div>;
}
