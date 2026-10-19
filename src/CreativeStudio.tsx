import { useConfirmation } from './ConfirmationProvider';
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ArrowLeft, Play, Square, RotateCcw, Plus, Trash2, Copy, Pencil, HelpCircle, Settings, Download, FolderOpen, Upload, X, ArrowRight } from 'lucide-react';
import StudioKeyControls from './StudioKeyControls';
import StudioEditor, { type StudioEditorHandle } from './StudioEditor';
import StudioArt, { StudioDrawing } from './StudioArt';
import { StudioEngine, type StudioScene } from './studioEngine';
import { readStudioProject, readStudioBackup, newStudioProject, saveStudioProject, blankStudioCode, studioAssetId, studioSpriteId, studioProjectSchema, backgroundImage, isStudioBackground, type StudioProject, type StudioAsset } from './studioProject';
import { studioCharacters, studioBackdrops, studioBackdropLabels, studioCharacterLabel, characterImage, characterIsAtlas, studioCharacterGroups, studioBackdropGroups, filteredStudioCharacters, filteredStudioBackdrops } from './studioCatalog';
import { importStudioImage } from './studioImageImport';
import LearnerMenu, { type LearnerAccount } from './LearnerMenu';
import SaveFeedback, { type SaveFeedbackProps } from './SaveFeedback';
import StudioStarters from './StudioStarterChooser';
import { studioStarters, untouchedStudioProject } from './studioStarters';
import { findStudioTutorial, studioNewProject, type StudioProjectChoice } from './studioTutorials';
import StudioTutorialGuide from './StudioTutorialGuide';
import WorkspaceTour, { type WorkspaceTourStep } from './WorkspaceTour';
import WorkspaceDivider from './WorkspaceDivider';
import { StudioWorldOverlay, StudioQuestion, studioTint } from './StudioRuntimeOverlay';
import type { SoundCue } from './sound';
import type { StudioActor } from './studioEngine';
import './studio.css';
type Props = { initial?: Record<string, unknown>; onChange: (workspace: Record<string, unknown>) => void | boolean; onProjects?: () => void; onCreate?: (project: StudioProject) => boolean; onExit: () => void; student?: LearnerAccount; cloud?: SaveFeedbackProps; reduced: boolean; largeText: boolean; onReduced: (value: boolean) => void; onLargeText: (value: boolean) => void; soundEnabled?: boolean; onSoundEnabled?: (value: boolean) => void; onSound?: (cue: SoundCue) => void; onUnlockSound?: () => void; onStopSound?: () => void };
const studioTourSteps: WorkspaceTourStep[] = [
  { target: '.studio-run-controls', title: 'Bring your project to life', text: 'Press Run to start every sprite. Watch the stage. Stop ends the scripts; Reset brings back the starting scene without deleting your code.' },
  { target: '.studio-sprite-list', title: 'Choose who you are coding', text: 'Select a sprite tile to see its own code. Different sprites can do different things. Choose sprite adds another character.' },
  { target: '.studio-tool-panel', title: 'Change one thing', text: 'In Code, pick a category, then drag blocks onto the canvas. Connect actions below Run or an event hat. Try changing a SAY message or a movement number. The keyboard builder can connect and edit blocks too.' },
  { target: '.studio-tabs-row [role="tablist"]', title: 'Make it look like yours', text: 'Costumes changes the selected sprite’s artwork. Backgrounds changes the scene. Choose from the library, paint something new, or edit a private copy.' },
  { target: '.studio-project-title', title: 'Keep your creation', text: 'Give your project a name here and check its save status. Download makes a backup you can reopen. Help can replay this tour; My projects keeps your creations together. New project offers the starters again without removing your earlier work.' },
];
function SpriteNumber({ label, value, min, max, onCommit }: { label: string; value: number; min: number; max: number; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value)), [error, setError] = useState(''), id = useId();
  useEffect(() => { setDraft(String(value)); setError(''); }, [value]);
  function commitDraft() {
    const number = Number(draft);
    if (!draft.trim() || !Number.isFinite(number) || number < min || number > max) { setError(`Enter a number from ${min} to ${max}. Your saved value is unchanged.`); return; }
    setError(''); if (number !== value) onCommit(number);
  }
  return <label>{label}<input type="text" inputMode="decimal" aria-label={label} value={draft} aria-invalid={!!error} aria-describedby={error ? id : undefined} onChange={e => { setDraft(e.target.value); setError(''); }} onBlur={commitDraft} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitDraft(); } if (e.key === 'Escape') { e.preventDefault(); setDraft(String(value)); setError(''); } }} />{error && <small id={id} className="studio-field-error" role="alert">{error}</small>}</label>;
}
export function AssetPicture({ asset, className = '', decorative = false }: { asset: StudioAsset; className?: string; decorative?: boolean }) {
  if (asset.kind === 'drawing') return <StudioDrawing asset={asset} className={className} decorative={decorative} />;
  if (asset.kind === 'image') return <img className={className} src={asset.imageData} alt={decorative ? '' : asset.name} />;
  if (asset.kind === 'background') return <img className={className} src={backgroundImage[asset.ref!]} alt={decorative ? '' : asset.name} />;
  if (!characterIsAtlas(asset.ref!)) return <img className={`studio-cutout ${className}`} src={characterImage(asset.ref!)} alt={decorative ? '' : asset.name} />;
  return <span className={`studio-art-sprite ${className}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : asset.name} aria-hidden={decorative || undefined} style={{ backgroundImage: `url('/images/worlds/${asset.ref!.toLowerCase()}.png')` }} />;
}
export default function CreativeStudio({ initial, onChange, onProjects, onCreate, onExit, student, cloud, reduced, largeText, onReduced, onLargeText, soundEnabled = false, onSoundEnabled, onSound, onUnlockSound, onStopSound }: Props) {
  const confirm = useConfirmation();
  const [loaded] = useState(() => { try { return { project: readStudioProject(initial), error: '' }; } catch { return { project: newStudioProject(), error: 'Your saved Byte Lab project could not be opened. The original draft is preserved; download it before starting over.' }; } });
  const [project, setProject] = useState(loaded.project), [tab, setTab] = useState<'Code' | 'Costumes' | 'Backgrounds'>('Code'), [category, setCategory] = useState('Motion');
  const [welcome, setWelcome] = useState(() => !loaded.error && !loaded.project.onboarding && untouchedStudioProject(loaded.project));
  const [tourOpen, setTourOpen] = useState(loaded.project.onboarding === 'started'), [projectVersion, setProjectVersion] = useState(0);
  const starters = useRef<HTMLDialogElement>(null);
  const [scene, setScene] = useState<StudioScene | null>(null), [running, setRunning] = useState(false), [error, setError] = useState(loaded.error), [message, setMessage] = useState('');
  const [library, setLibrary] = useState<'sprite' | 'costume' | 'background'>('sprite'), [artId, setArtId] = useState('');
  const [libraryQuery, setLibraryQuery] = useState(''), [libraryGroup, setLibraryGroup] = useState('All');
  const libraryCharacters = filteredStudioCharacters(libraryGroup, libraryQuery), libraryBackgrounds = filteredStudioBackdrops(libraryGroup, libraryQuery);
  const libraryCount = library === 'background' ? libraryBackgrounds.length : libraryCharacters.length;
  const engine = useRef<StudioEngine | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), generation = useRef(0), editor = useRef<StudioEditorHandle>(null), stage = useRef<HTMLDivElement>(null), chooser = useRef<HTMLDialogElement>(null), help = useRef<HTMLDialogElement>(null), settings = useRef<HTMLDialogElement>(null);
  const latest = useRef(project); latest.current = project;
  const publish = useRef(onChange); publish.current = onChange;
  const projectFile = useRef<HTMLInputElement>(null), backgroundFile = useRef<HTMLInputElement>(null), mounted = useRef(true), importBusy = useRef(false);
  const [importingImage, setImportingImage] = useState(false);
  const lastSound = useRef(0);
  const sprite = project.sprites.find(s => s.id === project.selected)!;
  const tutorial = findStudioTutorial(project.starter), starter = studioStarters.find(item => item.id === project.starter);
  const assets = tab === 'Backgrounds' ? project.assets.filter(isStudioBackground) : project.assets.filter(a => sprite.costumes.includes(a.id));
  const selectedArt = assets.find(a => a.id === artId) ?? assets.find(a => a.id === (tab === 'Backgrounds' ? project.backdrop : sprite.costume)) ?? assets[0];
  const backdrop = project.assets.find(a => a.id === (scene?.background ?? project.backdrop))!;
  const actors: StudioActor[] = scene?.actors ?? project.sprites.map(s => ({ ...s, speech: '', variables: { score: 0 }, monitors: [], output: [] }));
  useEffect(() => {
    const clear = () => engine.current?.clearInput();
    window.addEventListener('blur', clear); document.addEventListener('visibilitychange', clear);
    return () => { window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear); };
  }, []);
  useEffect(() => { document.title = `${project.title} · Byte Lab | KodeArcade`; }, [project.title]);
  useEffect(() => { if (error) document.querySelector<HTMLElement>('.studio-error')?.focus(); }, [error]);
  useEffect(() => { if (!loaded.error) publish.current(saveStudioProject(loaded.project)); }, [loaded]);
  useEffect(() => () => { generation.current++; if (timer.current) clearTimeout(timer.current); engine.current?.dispose(); onStopSound?.(); }, []);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  function stop(reset = false) { generation.current++; if (timer.current) clearTimeout(timer.current); timer.current = null; engine.current?.dispose(); engine.current = null; onStopSound?.(); setRunning(false); editor.current?.highlight(''); if (reset) setScene(null); else setScene(previous => previous ? { ...previous, prompts: [] } : null); }
  function commit(next: StudioProject, clearScene = true) {
    try { const saved = saveStudioProject(next); if (publish.current(saved) === false) return false; setProject(next); setError(''); if (clearScene) { stop(true); } return true; }
    catch { setError('This change is outside the project limits. Use up to four sprites, 24 assets and 2,000 drawing points. Check number ranges or remove unused code/artwork; your last valid project is unchanged.'); return false; }
  }
  function patchSprite(patch: Partial<typeof sprite>) { commit({ ...latest.current, sprites: latest.current.sprites.map(s => s.id === latest.current.selected ? { ...s, ...patch } : s) }); }
  function advance(token: number) {
    if (token !== generation.current || !engine.current) return;
    timer.current = null;
    try {
      const next = engine.current.step(true);
      if (!next) { setRunning(false); setScene(engine.current.snapshot()); editor.current?.highlight(''); return; }
      setScene(next.scene); if (next.scene.spriteId === latest.current.selected) editor.current?.highlight(next.scene.blockId ?? '');
      for (const sound of next.scene.sounds ?? []) if (sound.id > lastSound.current) { lastSound.current = sound.id; onSound?.(({ ping: 'move', jump: 'star', cheer: 'success', oops: 'retry' } as Record<string,SoundCue>)[sound.name]); }
      // Reduced motion removes sliding, not the authored time to read speech or wait.
      timer.current = setTimeout(() => advance(token), next.delay);
    } catch (failure) { setRunning(false); setError(failure instanceof Error ? failure.message : 'Check your blocks and try again.'); setScene(engine.current.snapshot()); }
  }
  function run() {
    stop(true); if (loaded.error) return; setError(''); setMessage(''); lastSound.current = 0; onUnlockSound?.();
    try { const next = new StudioEngine(latest.current); engine.current = next; setScene(next.start()); setRunning(next.active); if (next.active) advance(generation.current); stage.current?.focus({ preventScroll: true }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Check your code and try again.'); }
  }
  function trigger(event: 'click' | 'key', spriteId?: string, key?: string) {
    if (!engine.current) { setMessage('Press Run first to start your event scripts.'); return; }
    try { engine.current.trigger(event, spriteId, key); if (!running && engine.current.active) { setRunning(true); advance(generation.current); } }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Check the event script.'); }
  }
  function keyState(key: string, pressed: boolean) {
    if (!engine.current) { if (pressed) setMessage('Press Run first to start your event scripts.'); return; }
    try {
      const changed = engine.current.setKey(key, pressed);
      if (pressed && changed && engine.current.active) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null; setRunning(true); advance(generation.current);
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Check the key event script.'); }
  }
  function pointer(event: PointerEvent<HTMLDivElement>, down?: boolean) {
    if (!engine.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width * 100 - 50) / .35, y = (50 - (event.clientY - box.top) / box.height * 100) / .35;
    const actorId = (event.target as Element).closest<HTMLElement>('[data-actor-id]')?.dataset.actorId;
    try { engine.current.setPointer(x, y, down, actorId); setScene(engine.current.snapshot()); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Pointer input could not be read.'); }
  }
  function answer(id: string, value: string) {
    try { engine.current?.answerPrompt(id, value); if (engine.current) setScene(engine.current.snapshot()); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Check the answer.'); }
  }
  function openLibrary(kind: typeof library) { setLibrary(kind); setLibraryQuery(''); setLibraryGroup('All'); chooser.current?.showModal(); }
  function finishAssetChoice(next: StudioProject, id: string) {
    chooser.current?.close();
    if (commit(next)) setArtId(id);
    else requestAnimationFrame(() => (document.querySelector<HTMLElement>('.studio-library-error') ?? document.querySelector<HTMLElement>('.studio-error'))?.focus());
  }
  function chooseCharacter(name: typeof studioCharacters[number]) {
    const label = studioCharacterLabel(name), next = structuredClone(latest.current), existing = next.assets.find(a => a.kind === 'character' && a.ref === name), asset = existing ?? { id: studioAssetId(), name: label, kind: 'character' as const, ref: name };
    if (!existing) next.assets.push(asset);
    if (library === 'sprite') {
      if (next.sprites.length >= 4) { chooser.current?.close(); setError('This lab supports up to four programmable sprites. Remove one before adding another.'); return; }
      const id = studioSpriteId(), place = [[0, 0], [65, 0], [-65, 0], [0, -65]][next.sprites.length]; next.sprites.push({ id, name: label, costume: asset.id, costumes: [asset.id], x: place[0], y: place[1], angle: 0, size: 100, visible: true, code: blankStudioCode() }); next.selected = id;
    } else { const selected = next.sprites.find(s => s.id === next.selected)!; selected.costume = asset.id; selected.costumes = [...new Set([...selected.costumes, asset.id])]; }
    finishAssetChoice(next, asset.id);
  }
  function chooseBackground(ref: typeof studioBackdrops[number]) {
    const next = structuredClone(latest.current), existing = next.assets.find(a => a.kind === 'background' && a.ref === ref), asset = existing ?? { id: studioAssetId(), name: studioBackdropLabels[ref], kind: 'background' as const, ref };
    if (!existing) next.assets.push(asset); next.backdrop = asset.id;
    finishAssetChoice(next, asset.id);
  }
  function addDrawing(background = false, base?: StudioAsset) {
    const id = studioAssetId(), asset: StudioAsset = { id, name: background ? 'My background' : 'My costume', kind: 'drawing', purpose: background ? 'background' : 'costume', ...(base && base.kind !== 'drawing' ? { base: base.kind === 'image' ? { kind: 'image', imageData: base.imageData! } : { kind: base.kind, ref: base.ref! } } : {}), strokes: [], ...(background ? { paper: '#ffffff' } : {}) }, next = structuredClone(latest.current);
    next.assets.push(asset);
    if (background) next.backdrop = id;
    else { const selected = next.sprites.find(s => s.id === next.selected)!; selected.costume = id; selected.costumes.push(id); }
    if (commit(next)) { setArtId(id); setTab(background ? 'Backgrounds' : 'Costumes'); }
  }
  async function importBackground(file?: File) {
    if (!file || importBusy.current) return;
    importBusy.current = true; setImportingImage(true); setError(''); setMessage('Preparing your private background…');
    try {
      const imageData = await importStudioImage(file);
      if (!mounted.current) return;
      const next = structuredClone(latest.current), asset: StudioAsset = { id: studioAssetId(), name: 'My imported background', kind: 'image', purpose: 'background', imageData };
      next.assets.push(asset); next.backdrop = asset.id;
      if (commit(next)) { setArtId(asset.id); setTab('Backgrounds'); setMessage('Background imported. A resized, still-image copy is saved privately with this project.'); }
      else setMessage('');
    } catch (failure) { if (mounted.current) { setMessage(''); setError(failure instanceof Error ? failure.message : 'That image could not be imported. Your background is unchanged.'); } }
    finally { importBusy.current = false; if (mounted.current) setImportingImage(false); if (backgroundFile.current) backgroundFile.current.value = ''; }
  }
  function exportProject(original = false) {
    const data = original ? initial : saveStudioProject(project), url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `${project.title.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40) || 'Byte-Lab'}-project.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function newProject() { starters.current?.showModal(); }
  function replaceProject(next: StudioProject) {
    if (!commit(next)) return false;
    setProjectVersion(value => value + 1); setArtId(''); setTab('Code'); setCategory('Motion'); setWelcome(false); return true;
  }
  async function chooseStarter(kind: StudioProjectChoice | null) {
    const current = latest.current, firstUse = welcome && !current.onboarding;
    const next = studioNewProject(kind);
    if (onCreate && !welcome) { next.onboarding = current.onboarding === 'completed' ? 'completed' : 'skipped'; if (!onCreate(next)) starters.current?.close(); return; }
    const replacing = !untouchedStudioProject(current);
    if (replacing && !(await confirm({ title: "Replace this project?", message: `Download a backup of “${current.title}”, then replace this course’s saved project with “${next.title}”?`, confirmLabel: "Download backup & replace", tone: 'danger' }))) return;
    if (replacing) exportProject();
    next.onboarding = firstUse ? 'started' : current.onboarding === 'completed' ? 'completed' : 'skipped';
    if (replaceProject(next)) {
      starters.current?.close(); setTourOpen(firstUse); setMessage(replacing ? 'A backup download of your previous project was requested. Your new project will autosave in this course.' : '');
    }
  }
  function finishTour(status: 'completed' | 'skipped') {
    commit({ ...latest.current, onboarding: status }, false); setTourOpen(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[aria-label="Byte Lab help"]')?.focus({ preventScroll: true }));
  }
  function replayTour() { help.current?.close(); setWelcome(false); setTab('Code'); setTourOpen(true); }
  async function openProject(file?: File) {
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('Choose a project file smaller than 2 MB.');
      const next = readStudioBackup(JSON.parse(await file.text()));
      if (onCreate) { onCreate(next); return; }
      if (!(await confirm({ title: "Open a different project?", message: 'Download a backup of the current project, then open this project in the course’s saved slot?', confirmLabel: "Download backup & open", tone: 'danger' }))) return;
      exportProject(); if (replaceProject(next)) { setTourOpen(false); setMessage('Project opened. A backup download of your previous project was requested.'); }
    } catch { setError('That file is not a supported Byte Lab project, or is over 2 MB. Your current project is unchanged.'); }
    finally { if (projectFile.current) projectFile.current.value = ''; }
  }
  async function removeArt() {
    if (!selectedArt || (tab === 'Costumes' ? sprite.costumes.length : assets.length) <= 1 || !(await confirm({ title: "Remove this artwork?", message: `Remove ${selectedArt.name} from ${tab === 'Costumes' ? 'this sprite' : 'the project backgrounds'}? Blocks using it will need a new selection.`, confirmLabel: "Remove artwork", tone: 'danger' }))) return;
    const next = structuredClone(latest.current);
    if (tab === 'Costumes') { const selected = next.sprites.find(s => s.id === next.selected)!; selected.costumes = selected.costumes.filter(id => id !== selectedArt.id); selected.costume = selected.costumes[0]; }
    else next.backdrop = assets.find(a => a.id !== selectedArt.id)!.id;
    if (!next.sprites.some(s => s.costumes.includes(selectedArt.id)) && next.backdrop !== selectedArt.id) next.assets = next.assets.filter(a => a.id !== selectedArt.id);
    if (commit(next)) setArtId('');
  }
  async function removeSprite() { if (project.sprites.length <= 1 || !(await confirm({ title: "Remove this sprite?", message: `Remove ${sprite.name} and this sprite’s code from the project? Download a backup first if you want to keep it.`, confirmLabel: "Remove sprite", tone: 'danger' }))) return; const next = { ...project, sprites: project.sprites.filter(s => s.id !== sprite.id) }; next.selected = next.sprites[0].id; commit(next); }
  function duplicateSprite() { if (project.sprites.length >= 4) return; const id = studioSpriteId(), copied = { ...structuredClone(sprite), id, name: `${sprite.name.slice(0, 18)} copy`, x: Math.min(100, sprite.x + 20) }; commit({ ...project, selected: id, sprites: [...project.sprites, copied] }); }
  if (loaded.error) return <main className="studio-recovery"><h1>Let’s protect your saved project</h1><p role="alert">{loaded.error}</p><button onClick={() => exportProject(true)}>Download original draft</button><button onClick={onExit}>Return to course</button><p>No empty project has been saved over it.</p></main>;
  return <div className={`studio-shell ${reduced ? 'studio-reduced' : ''} ${largeText ? 'studio-large' : ''}`}>
    <header className="studio-header"><h1 className="sr-only">Byte Lab project editor</h1><a href={student ? '/#/student-courses' : '/#/learn'} className="studio-brand" aria-label="KodeArcade home"><img src="/brand/mark-color.svg" alt="" width={32} height={36} /><span>KodeArcade</span></a><div className="studio-project-title"><label htmlFor="studio-project-title">Byte Lab project</label><input id="studio-project-title" aria-label="Project name" value={project.title} maxLength={40} onChange={e => { if (e.target.value.trim()) commit({ ...latest.current, title: e.target.value }, false); }} /><small>{cloud ? cloud.status === 'saved' ? 'Saved to your account' : cloud.status === 'saving' ? 'Saving…' : 'Check save status' : 'Autosaves on this device'}</small></div><div className="studio-header-actions">{onProjects && <button onClick={() => { stop(); onProjects(); }}><FolderOpen size={18} />My projects</button>}<button disabled={running} onClick={newProject}><Plus size={17} />New project</button><button aria-label="Open project" disabled={running} onClick={() => projectFile.current?.click()}><FolderOpen size={19} /></button><input ref={projectFile} hidden type="file" accept=".json,application/json" aria-label="Choose Byte Lab project file" onChange={e => { void openProject(e.target.files?.[0]); }} /><button aria-label="Download project" onClick={() => exportProject()}><Download size={19} /></button><button aria-label="Byte Lab help" onClick={() => help.current?.showModal()}><HelpCircle size={20} /></button>{student ? <LearnerMenu account={student} onSettings={() => settings.current?.showModal()} /> : <button aria-label="Lab settings" onClick={() => settings.current?.showModal()}><Settings size={20} /></button>}</div></header>
    <div className="studio-tabs-row"><button className="studio-course-back" onClick={() => { stop(); onExit(); }}><ArrowLeft size={16} />Course</button><div role="tablist" aria-label="Project tools">{(['Code', 'Costumes', 'Backgrounds'] as const).map(name => <button key={name} role="tab" aria-selected={tab === name} aria-controls="studio-tool-panel" id={`studio-tab-${name}`} tabIndex={tab === name ? 0 : -1} disabled={running} onKeyDown={e => { const names = ['Code', 'Costumes', 'Backgrounds'] as const; const direction = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!direction && !['Home', 'End'].includes(e.key)) return; e.preventDefault(); const next = names[e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (names.indexOf(name) + direction + 3) % 3]; setTab(next); setArtId(''); document.getElementById(`studio-tab-${next}`)?.focus(); }} onClick={() => { setTab(name); setArtId(''); }}>{name}</button>)}</div><span>Private project · no public sharing</span></div>
    {cloud && <SaveFeedback {...cloud} />}
    {error && <div className="studio-message studio-error" role="alert" tabIndex={-1}>{error}<button aria-label="Dismiss error" onClick={() => setError('')}><X size={18} /></button></div>}
    {message && <div className="studio-message" role="status">{message}<button aria-label="Dismiss message" onClick={() => setMessage('')}><X size={18} /></button></div>}
    <main className={`studio-main ${welcome && tab === 'Code' ? 'studio-welcome' : ''}`}><aside className="studio-scene-panel" aria-label="Stage and sprites">
      <div ref={stage} className="studio-stage" tabIndex={0} role="group" aria-label="Project stage. Press Run, then use arrow or space keys for key events." onKeyDown={e => { if (e.target === e.currentTarget && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) { e.preventDefault(); keyState(e.key, true); } }} onKeyUp={e => keyState(e.key, false)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) engine.current?.clearInput(); }} onPointerMove={e => pointer(e)} onPointerDown={e => { pointer(e, true); const id = (e.target as Element).closest<HTMLElement>('[data-actor-id]')?.dataset.actorId; if (actors.some(a => a.id === id && a.draggable)) e.currentTarget.setPointerCapture(e.pointerId); }} onPointerUp={e => { pointer(e, false); if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => engine.current?.clearInput()} style={scene?.backgroundColor ? { backgroundColor: scene.backgroundColor, backgroundImage: 'none' } : backdrop.kind === 'background' ? { backgroundImage: `url('${backgroundImage[backdrop.ref!]}')` } : undefined}>
        {!scene?.backgroundColor && backdrop.kind === 'drawing' && <StudioDrawing asset={backdrop} className="studio-stage-background" />}
        {!scene?.backgroundColor && backdrop.kind === 'image' && <img src={backdrop.imageData} alt="" className="studio-stage-background studio-imported-background" />}
        {actors.filter(actor => actor.visible).map(actor => { const asset = project.assets.find(a => a.id === actor.costume)!; return <button key={actor.id} data-actor-id={actor.id} className={`studio-stage-actor ${actor.id === project.selected ? 'studio-selected-actor' : ''}`} style={{ left: `${50 + actor.x * .35}%`, top: `${50 - actor.y * .35}%`, width: `${actor.size * .6}px`, height: `${actor.size * .6}px`, filter: studioTint(actor.tint), touchAction: actor.draggable ? 'none' : undefined }} aria-label={`Click ${actor.name} sprite`} onClick={() => trigger('click', actor.id)}><AssetPicture asset={asset} decorative /><span className="studio-heading-arrow"><ArrowRight size={16} style={{ transform: `rotate(${-actor.angle}deg)` }} aria-hidden="true" /></span></button>; })}
        {actors.filter(actor => actor.visible && actor.speech).map(actor => <span key={actor.id} className="studio-speech" style={{ left: `clamp(70px, ${50 + actor.x * .35}%, calc(100% - 70px))`, top: `clamp(8px, ${50 - actor.y * .35}% - 70px, calc(100% - 60px))` } as CSSProperties}>{actor.name}: {actor.speech}</span>)}
        {actors.some(actor => actor.monitors.some(name => !actor.monitorPositions?.[name])) && <dl className="studio-counters" aria-label="Live counters">{actors.flatMap(actor => actor.monitors.filter(name => !actor.monitorPositions?.[name]).map(name => <div key={`${actor.id}-${name}`}><dt>{actor.name} · {name}</dt><dd>{actor.variables[name as keyof typeof actor.variables]}</dd></div>))}</dl>}
        <StudioWorldOverlay scene={scene} />
      </div>
      <div className="studio-run-controls"><button className="studio-run" disabled={running} onClick={run}><Play size={20} fill="currentColor" />Run</button><button disabled={!running && !engine.current} onClick={() => { stop(); setMessage('Stopped. Code and scene choices are unchanged.'); }}><Square size={18} />Stop</button><button aria-label="Reset stage" onClick={() => stop(true)}><RotateCcw size={19} /></button></div>
      <StudioQuestion scene={scene} onAnswer={answer} />
      {actors.some(actor => actor.output.length) && <details className="studio-runtime-output" open><summary>Program output</summary>{actors.map(actor => actor.output.length ? <p key={actor.id}>{actor.name}: {actor.output.map(String).join(', ')}</p> : null)}</details>}
      {project.sprites.some(s => /ka_event_key|ka_studio_key_down|@arrow/.test(JSON.stringify(s.code))) && <StudioKeyControls onState={keyState} onActivate={key => trigger('key', undefined, key)} />}
      {tutorial && ['tutorialSprites', 'tutorialBehaviors'].includes(tutorial.id) && <div className="studio-key-controls" role="group" aria-label="Tutorial key controls"><button onClick={() => trigger('key', undefined, ' ')}>Space</button></div>}
      {starter && <p className="studio-starter-tip">{starter.tryThis}</p>}
      <p className="studio-runtime-note" role="status">{scene?.note ?? 'Build something. Every sprite has its own code.'}</p>
      <div className="studio-sprites-heading"><h2>Sprites</h2><button disabled={running || project.sprites.length >= 4} onClick={() => openLibrary('sprite')}><Plus size={17} />Choose sprite</button></div>
      <div className="studio-sprite-list" role="group" aria-label="Select a sprite">{project.sprites.map(s => <button key={s.id} aria-label={`Edit ${s.name} sprite`} disabled={running} aria-pressed={project.selected === s.id} onClick={() => { commit({ ...latest.current, selected: s.id }, false); setArtId(''); }}><AssetPicture asset={project.assets.find(a => a.id === s.costume)!} decorative /><span>{s.name}</span></button>)}</div>
      <fieldset className="studio-sprite-properties" disabled={running}><legend>{sprite.name} properties</legend><label>Name<input value={sprite.name} maxLength={24} onChange={e => { if (e.target.value.trim()) patchSprite({ name: e.target.value }); }} /></label>{(['x', 'y', 'angle', 'size'] as const).map(key => <SpriteNumber key={`${sprite.id}-${key}`} label={key === 'angle' ? 'Direction' : key === 'size' ? 'Size %' : key} value={sprite[key]} min={key === 'size' ? 20 : key === 'angle' ? 0 : -100} max={key === 'size' ? 180 : key === 'angle' ? 359 : 100} onCommit={value => patchSprite({ [key]: value })} />)}<label className="studio-visibility"><input type="checkbox" checked={sprite.visible} onChange={e => patchSprite({ visible: e.target.checked })} />Show</label><button disabled={project.sprites.length >= 4} onClick={duplicateSprite}><Copy size={16} />Duplicate</button><button disabled={project.sprites.length <= 1} onClick={removeSprite}><Trash2 size={16} />Remove</button></fieldset>
      <p className="studio-privacy-note">Keep personal details out of speech and drawings. This lab awards no stars.</p>
    </aside><WorkspaceDivider studio /><section id="studio-tool-panel" role="tabpanel" aria-labelledby={`studio-tab-${tab}`} className={`studio-tool-panel ${tab === 'Code' && tutorial && !welcome ? 'studio-guided' : ''}`}>
      {tab === 'Code' ? welcome ? <StudioStarters welcome onChoose={chooseStarter} /> : <>{tutorial && <StudioTutorialGuide key={`${projectVersion}-${tutorial.id}`} tutorialId={tutorial.id} running={running} onCategory={setCategory} />}<StudioEditor key={`${projectVersion}-${sprite.id}`} ref={editor} project={project} sprite={sprite} running={running} category={category} onCategory={setCategory} onError={setError} onChange={code => { const p = latest.current; return commit({ ...p, sprites: p.sprites.map(s => s.id === sprite.id ? { ...s, code } : s) }); }} /></> : <div className="studio-assets-workspace">
        <aside className="studio-asset-list"><h2>{tab}</h2>
          <button className="studio-add-asset" onClick={() => openLibrary(tab === 'Backgrounds' ? 'background' : 'costume')}><Plus size={24} />Choose {tab === 'Backgrounds' ? 'background' : 'costume'}</button>
          {tab === 'Backgrounds' && <>
            <button disabled={importingImage} onClick={() => backgroundFile.current?.click()}><Upload size={18} />{importingImage ? 'Preparing image…' : 'Import image'}</button>
            <input ref={backgroundFile} type="file" hidden accept="image/png,image/jpeg,image/webp" aria-label="Import background image" onChange={e => { void importBackground(e.target.files?.[0]); }} />
            <p className="studio-import-note">PNG, JPEG or WebP · up to 5 MB. A resized copy stays in this private project. Don’t include personal photos or details.</p>
          </>}
          <button onClick={() => addDrawing(tab === 'Backgrounds')}><Pencil size={17} />Paint new</button>
          {assets.map(a => <button key={a.id} aria-pressed={selectedArt?.id === a.id} onClick={() => { setArtId(a.id); if (tab === 'Backgrounds') commit({ ...latest.current, backdrop: a.id }); else patchSprite({ costume: a.id }); }}><AssetPicture asset={a} decorative /><span>{a.name}</span></button>)}
        </aside>
        <div className="studio-art-workarea">{selectedArt && <><div className="studio-art-heading"><label>{tab === 'Backgrounds' ? 'Background name' : 'Costume name'}<input value={selectedArt.name} maxLength={40} onChange={e => { if (e.target.value.trim()) commit({ ...latest.current, assets: latest.current.assets.map(a => a.id === selectedArt.id ? { ...a, name: e.target.value } : a) }); }} /></label><button onClick={() => { const next = { ...selectedArt, id: studioAssetId(), name: `${selectedArt.name.slice(0, 30)} copy` }, p = structuredClone(project); p.assets.push(next); if (tab === 'Backgrounds') p.backdrop = next.id; else { const s = p.sprites.find(s => s.id === p.selected)!; s.costumes.push(next.id); s.costume = next.id; } if (commit(p)) setArtId(next.id); }}><Copy size={16} />Duplicate</button><button disabled={(tab === 'Costumes' ? sprite.costumes.length : assets.length) <= 1} onClick={removeArt}><Trash2 size={16} />Remove</button></div>{selectedArt.kind === 'drawing' ? <StudioArt key={selectedArt.id} asset={selectedArt} onChange={asset => commit({ ...latest.current, assets: latest.current.assets.map(a => a.id === asset.id ? asset : a) })} onError={setError} /> : <div className="studio-asset-preview"><AssetPicture asset={selectedArt} /><p>{selectedArt.kind === 'image' ? 'Your imported image · Saved only with this private project and its backups.' : 'Library artwork · Edit a private copy, or paint a new design.'}</p><button onClick={() => addDrawing(tab === 'Backgrounds', selectedArt)}><Pencil size={18} />Edit a copy</button></div>}</>}</div>
      </div>}
    </section></main>
    {tourOpen && <WorkspaceTour key="studio-tour" hidden={false} textMode={false} goal="" instructions={0} steps={studioTourSteps} label="Byte Lab tour" headerSelector=".studio-header" onFinish={finishTour} />}
    <dialog ref={starters} className="studio-dialog studio-starters-dialog" aria-labelledby="studio-starters-title"><div className="studio-dialog-heading"><h2 id="studio-starters-title">Start a new project</h2><button aria-label="Close starter projects" onClick={() => starters.current?.close()}><X size={22} /></button></div><p>Choose working code to change, or start blank. Your earlier projects stay in My projects.</p><StudioStarters onChoose={chooseStarter} /></dialog>
    <dialog ref={chooser} className="studio-dialog studio-library-dialog" aria-labelledby="studio-library-title">
      <div className="studio-library-top">
        <div className="studio-dialog-heading"><h2 id="studio-library-title">Choose a {library}</h2><button aria-label="Close asset library" onClick={() => chooser.current?.close()}><X size={22} /></button></div>
        <label className="studio-library-search">Find artwork<input type="search" value={libraryQuery} placeholder="Search by name" maxLength={60} onChange={e => setLibraryQuery(e.target.value)} /></label>
        <div className="studio-library-filters" role="group" aria-label="Artwork categories">{(library === 'background' ? studioBackdropGroups : studioCharacterGroups).map(group => <button key={group} aria-pressed={libraryGroup === group} onClick={() => setLibraryGroup(group)}>{group}</button>)}</div>
        <p className="studio-catalog-count" role="status">{libraryCount} {libraryCount === 1 ? 'choice' : 'choices'}</p>
      </div>
      <div className="studio-library-grid">{library === 'background' ? libraryBackgrounds.map(ref => <button key={ref} aria-label={`Use ${ref} background`} onClick={() => chooseBackground(ref)}><img src={backgroundImage[ref]} alt="" loading="lazy" /><span>{studioBackdropLabels[ref]}</span></button>) : libraryCharacters.map(name => <button key={name} aria-label={`Use ${studioCharacterLabel(name)}`} onClick={() => chooseCharacter(name)}><AssetPicture asset={{ id: name.toLowerCase(), name: studioCharacterLabel(name), kind: 'character', ref: name }} decorative /><span>{studioCharacterLabel(name)}</span></button>)}</div>
      {!libraryCount && <div className="studio-library-empty"><p>No artwork matches. Try a different name or category.</p><button onClick={() => { setLibraryQuery(''); setLibraryGroup('All'); }}>Show all artwork</button></div>}
      <p>KodeArcade artwork. Your drawings and imported backgrounds stay private to this project.</p>
    </dialog>
    <dialog ref={help} className="studio-dialog studio-help" aria-labelledby="studio-help-title"><div className="studio-dialog-heading"><h2 id="studio-help-title">Welcome to Byte Lab</h2><button aria-label="Close lab help" onClick={() => help.current?.close()}><X size={22} /></button></div><button className="studio-replay-tour" onClick={replayTour}><HelpCircle size={18} />Replay Byte Lab tour</button><ol><li>Choose a sprite. Its code appears on the right; each sprite has a separate script.</li><li>Pick a block category. Drag actions below Run or an event hat. The keyboard builder can connect blocks too.</li><li>Use Costumes and Backgrounds to choose artwork or paint your own. Backgrounds also has Import image for PNG, JPEG or WebP files up to 5 MB. A resized still-image copy is stored with the project; don’t include personal photos or details.</li><li>Run starts all sprites. Click a character, touch a border or another sprite, or focus the stage and press arrow/space keys. Held-key blocks and arrow behaviors also work with the arrow buttons.</li><li>World has questions, timers, title screens, colors and sound. Text joins answers and prints words. Sprites creates temporary actors and groups; Locations supplies coordinates. Comments explains your idea.</li><li>Functions run once; Behaviors repeats an ordinary function body until stopped. Create your own editable definition or inspect a read-only built-in. Grid and burst helpers are visible block compositions, not hidden game code.</li><li>Stop ends scripts, questions and program sounds. Reset restores the starting scene. Question answers and created sprites are not saved as project data.</li></ol><p>The centre is x 0, y 0. Right increases x; up increases y. Limits: four authored sprites, 32 runtime sprites, 128 creations per run, 64 blocks per authored sprite, eight number/text variables and four waiting questions. Runs stop at 10,000 executed steps. Text is at most 120 printable characters. Sound effects respect your existing sound preference.</p><p>{student ? 'Your draft autosaves privately to your account.' : 'This preview autosaves on this device.'} Download a project backup before big changes. No public sharing, external image links, live AI or external requests from scripts. This is KodeArcade’s editor, not complete Code.org or Scratch compatibility.</p></dialog>
    <dialog ref={settings} className="studio-dialog" aria-labelledby="studio-settings-title"><div className="studio-dialog-heading"><h2 id="studio-settings-title">Lab settings</h2><button aria-label="Close lab settings" onClick={() => settings.current?.close()}><X size={22} /></button></div><label className="studio-setting"><input type="checkbox" checked={reduced} onChange={e => onReduced(e.target.checked)} />Reduced motion</label><label className="studio-setting"><input type="checkbox" checked={largeText} onChange={e => onLargeText(e.target.checked)} />Larger text</label>{onSoundEnabled && <label className="studio-setting"><input type="checkbox" checked={soundEnabled} onChange={e => { onUnlockSound?.(); onSoundEnabled(e.target.checked); }} />Program sound effects</label>}<p>These preferences use your existing learning-profile settings. Sound blocks use original device-local synthesized effects and respect the sound preference.</p></dialog>
  </div>;
}
