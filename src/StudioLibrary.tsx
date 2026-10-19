import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { ArrowLeft, Plus, Copy, Pencil, Trash2, RotateCcw, Download, FolderOpen, X } from 'lucide-react';
import CreativeStudio, { AssetPicture } from './CreativeStudio';
import StudioStarters from './StudioStarterChooser';
import { StudioDrawing } from './StudioArt';
import { backgroundImage, newStudioProject, readStudioBackup, readStudioProject, saveStudioProject, type StudioProject } from './studioProject';
import { studioNewProject, type StudioProjectChoice } from './studioTutorials';
import { galleryEntry, galleryLimit, readStudioGallery, saveStudioGallery, studioGallerySchema, type StudioGallery, type StudioGalleryEntry } from '../shared/studioGallery';
import SaveFeedback from './SaveFeedback';
import LearnerMenu from './LearnerMenu';
import { activityStorage } from './activityStorage';
import { SAVE_KEY } from './storage';
import './studio-gallery.css';
type Props = ComponentProps<typeof CreativeStudio> & { storageWarning?: string; storageBlocked?: boolean };
function download(data: unknown, name: string) {
  downloadRaw(JSON.stringify(data, null, 2), name);
}
function downloadRaw(data: string, name: string) {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function StudioThumbnail({ project }: { project: StudioProject }) {
  const background = project.assets.find(a => a.id === project.backdrop)!;
  return <span className="studio-project-preview" aria-hidden="true" style={background.kind === 'background' ? { backgroundImage: `url('${backgroundImage[background.ref!]}')` } : undefined}>
    {background.kind === 'drawing' && <StudioDrawing asset={background} className="studio-project-preview-background" />}
    {background.kind === 'image' && <img src={background.imageData} alt="" className="studio-project-preview-background studio-imported-background" />}
    {project.sprites.filter(s => s.visible).map(sprite => <span key={sprite.id} className="studio-project-preview-sprite" style={{ left: `${50 + sprite.x * .35}%`, top: `${50 - sprite.y * .35}%`, width: sprite.size * .5, height: sprite.size * .5 }}><AssetPicture asset={project.assets.find(a => a.id === sprite.costume)!} /></span>)}
  </span>;
}
export default function StudioLibrary(props: Props) {
  const [loaded] = useState(() => { try { return { gallery: readStudioGallery(props.initial), error: '' }; } catch { return { gallery: null, error: 'Your saved projects could not be opened. Download the original data before leaving; it has not been replaced.' }; } });
  const [gallery, setGallery] = useState(loaded.gallery), [error, setError] = useState(loaded.error), [message, setMessage] = useState(''), [trash, setTrash] = useState(false);
  const [rename, setRename] = useState<StudioGalleryEntry | null>(null), [title, setTitle] = useState('');
  const latest = useRef(gallery); latest.current = gallery;
  const publish = useRef(props.onChange); publish.current = props.onChange;
  const createDialog = useRef<HTMLDialogElement>(null), renameDialog = useRef<HTMLDialogElement>(null), settings = useRef<HTMLDialogElement>(null), file = useRef<HTMLInputElement>(null), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (loaded.gallery && !props.storageBlocked) publish.current(saveStudioGallery(latest.current!)); }, [loaded, props.storageBlocked]);
  useEffect(() => { if (gallery?.activeId === null) { document.title = 'My projects · Byte Lab | KodeArcade'; heading.current?.focus({ preventScroll: true }); } }, [gallery?.activeId]);
  function commit(next: StudioGallery) {
    try {
      const workspace = saveStudioGallery(next);
      if (publish.current(workspace) === false) return false;
      latest.current = next; setGallery(next); setError(''); return true;
    } catch {
      setError('The gallery is full or this project is too large. Keep this tab open, download your projects, then permanently remove an unwanted project from Recently deleted to free space. Your last valid gallery is unchanged.');
      createDialog.current?.close(); renameDialog.current?.close();
      requestAnimationFrame(() => document.querySelector<HTMLElement>('.studio-library-error, .studio-gallery-error')?.focus());
      return false;
    }
  }
  function updateProject(workspace: Record<string, unknown>) {
    const current = latest.current!; const selected = current.projects.find(p => p.id === current.activeId);
    if (!selected) return false;
    const project = readStudioProject(workspace);
    if (JSON.stringify(project) === JSON.stringify(selected.project)) return true;
    return commit({ ...current, projects: current.projects.map(p => p.id === selected.id ? { ...p, project, updatedAt: new Date().toISOString() } : p) });
  }
  function add(project: StudioProject, open = true) {
    const current = latest.current!, entry = galleryEntry(project);
    if (!commit({ ...current, activeId: open ? entry.id : current.activeId, projects: [...current.projects, entry] })) return false;
    createDialog.current?.close(); setMessage(`${project.title} ${open ? 'opened' : 'duplicated'}. Your other projects are unchanged.`); return true;
  }
  function create(kind: StudioProjectChoice | null) {
    const project = studioNewProject(kind); project.onboarding = 'skipped'; add(project);
  }
  function mutate(entry: StudioGalleryEntry, action: 'delete' | 'restore' | 'remove') {
    if (action === 'delete' && !confirm(`Move “${entry.project.title}” to Recently deleted? You can restore it later.`)) return;
    if (action === 'remove' && !confirm(`Permanently delete “${entry.project.title}”? This cannot be undone. Download it first if you want a backup.`)) return;
    const current = latest.current!, now = new Date().toISOString();
    const projects = action === 'remove' ? current.projects.filter(p => p.id !== entry.id) : current.projects.map(p => p.id !== entry.id ? p : { ...p, deletedAt: action === 'delete' ? now : undefined });
    if (commit({ ...current, projects })) { setMessage(action === 'delete' ? `${entry.project.title} moved to Recently deleted. You can restore it there.` : action === 'restore' ? `${entry.project.title} restored to My projects.` : `${entry.project.title} permanently deleted.`); heading.current?.focus(); }
  }
  async function importProject(input?: File) {
    if (!input) return;
    try {
      if (input.size > 2 * 1024 * 1024) throw new Error();
      const data = JSON.parse(await input.text());
      if (data && typeof data === 'object' && Object.hasOwn(data, 'byteStudioGallery')) {
        const backup = studioGallerySchema.parse(data.byteStudioGallery), current = latest.current!;
        const entries = backup.projects.map(p => ({ ...p, id: galleryEntry(p.project).id }));
        if (commit({ ...current, projects: [...current.projects, ...entries] })) setMessage('Gallery backup imported. Existing projects are unchanged; deleted projects remain in Recently deleted.');
      } else { add(readStudioBackup(data)); }
    }
    catch { setError('Choose a supported Byte Lab project or gallery JSON backup under 2 MB. Project and gallery storage limits still apply. Your existing projects are unchanged.'); }
    finally { if (file.current) file.current.value = ''; }
  }
  if (props.storageBlocked || !gallery) return <main className="studio-recovery"><h1>Let’s protect your projects</h1><p role="alert">{props.storageWarning || error}</p><button onClick={() => { try { if (props.storageBlocked) downloadRaw(activityStorage.getItem(SAVE_KEY) ?? '', 'Byte-Lab-original-progress.json'); else download(props.initial, 'Byte-Lab-original-data.json'); } catch { setError('Browser storage could not be read. Keep this tab open and check browser storage permissions.'); } }}>Download original data</button><button onClick={props.onExit}>Return to course</button></main>;
  const selected = gallery.projects.find(p => p.id === gallery.activeId), items = gallery.projects.filter(p => trash ? !!p.deletedAt : !p.deletedAt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (selected) return <>{(error || props.storageWarning) && <div className="studio-library-error" role="alert" tabIndex={-1}>{error || props.storageWarning}<button onClick={() => download(saveStudioGallery(latest.current!), 'Byte-Lab-gallery.json')}>Download gallery</button></div>}<CreativeStudio {...props} key={selected.id} initial={saveStudioProject(selected.project)} onChange={updateProject} onProjects={() => commit({ ...latest.current!, activeId: null })} onCreate={project => add(project)} /></>;
  return <div className={`studio-shell studio-gallery ${props.largeText ? 'studio-large' : ''}`}>
    <header className="studio-header"><a className="studio-brand" aria-label="KodeArcade home" href={props.student ? '/#/student-courses' : '/#/learn'}><img src="/brand/mark-color.svg" alt="" width={32} height={36} /><span>KodeArcade</span></a><span>Byte Lab</span><div className="studio-header-actions">{props.student ? <LearnerMenu account={props.student} onSettings={() => settings.current?.showModal()} /> : <span>Saved on this device</span>}</div></header>
    {props.cloud && <SaveFeedback {...props.cloud} />}
    <main className="studio-gallery-main">
      <button className="studio-course-back" onClick={props.onExit}><ArrowLeft size={17} />Course</button>
      <div className="studio-gallery-heading"><div><h1 ref={heading} tabIndex={-1}>{trash ? 'Recently deleted' : 'My projects'}</h1><p>{props.student ? 'Your private creations for this course.' : 'Private to this browser. Use a backup to move projects to another device.'}</p></div><button className="studio-gallery-create" onClick={() => createDialog.current?.showModal()}><Plus size={19} />New project</button></div>
      <div className="studio-gallery-tools"><button aria-pressed={!trash} onClick={() => setTrash(false)}>My projects ({gallery.projects.filter(p => !p.deletedAt).length})</button><button aria-pressed={trash} onClick={() => setTrash(true)}><Trash2 size={16} />Recently deleted ({gallery.projects.filter(p => p.deletedAt).length})</button><button onClick={() => file.current?.click()}><FolderOpen size={17} />Import project</button><button onClick={() => download(saveStudioGallery(gallery), 'Byte-Lab-gallery.json')}><Download size={17} />Download gallery</button><input ref={file} type="file" hidden accept=".json,application/json" aria-label="Import Byte Lab project" onChange={e => { void importProject(e.target.files?.[0]); }} /></div>
      <p className="studio-gallery-storage">{gallery.projects.length} of {galleryLimit} project slots used, including Recently deleted. {trash ? 'Deleted projects stay here until you restore or permanently remove them.' : 'New projects keep your earlier work.'}</p>
      {(error || props.storageWarning) && <p role="alert" tabIndex={-1} className="studio-gallery-error">{error || props.storageWarning}</p>}{message && <p role="status" className="studio-gallery-notice">{message}</p>}
      {items.length ? <ul className="studio-project-grid" aria-label={trash ? 'Deleted projects' : 'Saved projects'}>{items.map(entry => <li key={entry.id}><article aria-labelledby={`title-${entry.id}`}>
        {trash ? <StudioThumbnail project={entry.project} /> : <button className="studio-project-open" aria-label={`Open ${entry.project.title}`} onClick={() => commit({ ...latest.current!, activeId: entry.id })}><StudioThumbnail project={entry.project} /></button>}
        <div className="studio-project-info"><h2 id={`title-${entry.id}`}>{entry.project.title}</h2><p>Edited <time dateTime={entry.updatedAt}>{new Date(entry.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time></p>
        <div className="studio-project-actions">{trash ? <><button onClick={() => mutate(entry, 'restore')}><RotateCcw size={16} />Restore</button><button onClick={() => download(saveStudioProject(entry.project), `${entry.project.title.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40)}-project.json`)}><Download size={16} />Backup</button><button onClick={() => mutate(entry, 'remove')}><Trash2 size={16} />Delete forever</button></> : <><button aria-label={`Rename ${entry.project.title}`} onClick={() => { setRename(entry); setTitle(entry.project.title); renameDialog.current?.showModal(); }}><Pencil size={16} />Rename</button><button aria-label={`Duplicate ${entry.project.title}`} onClick={() => add({ ...structuredClone(entry.project), title: `${entry.project.title.slice(0, 35)} copy` }, false)}><Copy size={16} />Duplicate</button><button aria-label={`Delete ${entry.project.title}`} onClick={() => mutate(entry, 'delete')}><Trash2 size={16} />Delete</button></>}</div></div>
      </article></li>)}</ul> : <section className="studio-gallery-empty"><h2>{trash ? 'Nothing in Recently deleted' : 'A new idea starts here'}</h2><p>{trash ? 'Projects you delete will appear here so you can restore them.' : 'Make a story, move a character, or build something of your own.'}</p>{!trash && <button onClick={() => createDialog.current?.showModal()}><Plus size={18} />Create a project</button>}</section>}
    </main>
    <dialog ref={createDialog} className="studio-dialog studio-starters-dialog" aria-labelledby="gallery-create-title"><div className="studio-dialog-heading"><h2 id="gallery-create-title">Start a new project</h2><button aria-label="Close starter projects" onClick={() => createDialog.current?.close()}><X size={22} /></button></div><p>Your earlier projects stay in My projects.</p><StudioStarters onChoose={create} /></dialog>
    <dialog ref={renameDialog} className="studio-dialog studio-rename-dialog" aria-labelledby="gallery-rename-title"><form onSubmit={e => { e.preventDefault(); if (!rename || !title.trim()) return; const current = latest.current!; if (commit({ ...current, projects: current.projects.map(p => p.id === rename.id ? { ...p, project: { ...p.project, title: title.trim() }, updatedAt: new Date().toISOString() } : p) })) { renameDialog.current?.close(); setMessage('Project renamed.'); heading.current?.focus(); } }}><div className="studio-dialog-heading"><h2 id="gallery-rename-title">Rename project</h2><button type="button" aria-label="Close rename project" onClick={() => renameDialog.current?.close()}><X size={22} /></button></div><label>Project name<input autoFocus required maxLength={40} value={title} onChange={e => setTitle(e.target.value)} /></label><div className="studio-rename-actions"><button type="button" onClick={() => renameDialog.current?.close()}>Cancel</button><button type="submit">Save name</button></div></form></dialog>
    <dialog ref={settings} className="studio-dialog" aria-labelledby="gallery-settings-title"><div className="studio-dialog-heading"><h2 id="gallery-settings-title">Lab settings</h2><button aria-label="Close lab settings" onClick={() => settings.current?.close()}><X size={22} /></button></div><label className="studio-setting"><input type="checkbox" checked={props.reduced} onChange={e => props.onReduced(e.target.checked)} />Reduced motion</label><label className="studio-setting"><input type="checkbox" checked={props.largeText} onChange={e => props.onLargeText(e.target.checked)} />Larger text</label></dialog>
  </div>;
}
