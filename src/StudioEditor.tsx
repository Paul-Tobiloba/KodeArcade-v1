import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { Undo2, Redo2 } from 'lucide-react';
import { theme } from './blockly';
import { configureStudioAssets, setStudioAssetContext, studioCategories } from './studioBlocks';
import type { StudioProject, StudioSprite } from './studioProject';
import ConceptKeyboard from './ConceptKeyboard';
import StudioFunctionEditor from './StudioFunctionEditor';
import { studioSystemFunctions, isSystemFunction } from './studioFunctions';
import { studioCodeView } from './studioCode';
import { conceptFunctionName } from './conceptRuntime';
import { studioBehaviorFunctions, studioCreationFunctions } from './studioBehaviorDefinitions';
export type StudioEditorHandle = { highlight: (id: string) => void; center: () => void };
type Props = { project: StudioProject; sprite: StudioSprite; running: boolean; category: string; onCategory: (category: string) => void; onChange: (code: Record<string, unknown>) => void | boolean; onError: (message: string) => void };
export default forwardRef<StudioEditorHandle, Props>(function StudioEditor({ project, sprite, running, category, onCategory, onChange, onError }, ref) {
  const host = useRef<HTMLDivElement>(null), current = useRef<Blockly.WorkspaceSvg | null>(null), change = useRef(onChange), configuration = useRef(project);
  change.current = onChange; configuration.current = project;
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null), [count, setCount] = useState(0);
  const [, setRevision] = useState(0), [showCode, setShowCode] = useState(false), [functionError, setFunctionError] = useState('');
  const [editing, setEditing] = useState<{ block: Blockly.serialization.blocks.State; readOnly: boolean; originalId?: string } | null>(null);
  const [phone, setPhone] = useState(() => matchMedia('(max-width: 700px)').matches);
  const [helper, setHelper] = useState(studioBehaviorFunctions[0].name);
  useEffect(() => { const query = matchMedia('(max-width: 700px)'), update = () => setPhone(query.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  const active = studioCategories.find(c => c.name === category) ?? studioCategories[0];
  const functionSignature = workspace?.getAllBlocks(false).filter(b => ['ka_studio_define', 'ka_function_define'].includes(b.type)).map(b => `${b.getFieldValue('NAME')}:${b.getFieldValue('PARAM')}`).join('|') ?? '';
  useImperativeHandle(ref, () => ({ highlight: id => current.current?.highlightBlock(id || null), center: () => current.current?.zoomToFit() }), []);
  useEffect(() => {
    if (!host.current) return;
    const ws = Blockly.inject(host.current, { horizontalLayout: phone, toolbox: { kind: 'flyoutToolbox', contents: active.types.map(type => ({ kind: 'block', type })) }, theme, renderer: 'geras', media: '/blockly-media/', sounds: false, trashcan: true, maxBlocks: 65, move: { scrollbars: true, drag: true, wheel: true }, zoom: { controls: true, wheel: false, startScale: .9, minScale: .45, maxScale: 1.5 }, grid: { spacing: 24, length: 2, colour: '#ded9ed', snap: false } });
    current.current = ws; setWorkspace(ws);
    let accessibilityFrame = 0;
    const accessibility = () => { cancelAnimationFrame(accessibilityFrame); accessibilityFrame = requestAnimationFrame(() => {
      // Connection outlines are visual geometry, not listbox choices or owned controls.
      host.current?.querySelectorAll('.blocklyHighlightedConnectionPath').forEach(node => node.setAttribute('aria-hidden', 'true'));
      host.current?.querySelectorAll('[aria-owns]').forEach(node => { const original = node.getAttribute('aria-owns') ?? ''; const ids = original.split(/\s+/).filter(id => { const owned = document.getElementById(id); return owned && !owned.classList.contains('blocklyHighlightedConnectionPath'); }); if (ids.length) { if (original !== ids.join(' ')) node.setAttribute('aria-owns', ids.join(' ')); } else node.removeAttribute('aria-owns'); });
    }); };
    const semantics = new MutationObserver(accessibility);
    semantics.observe(host.current, { childList: true, subtree: true, attributes: true, attributeFilter: ['role', 'aria-owns'] });
    let restored = true;
    try { setStudioAssetContext(ws, configuration.current, sprite.id); Blockly.serialization.workspaces.load(sprite.code, ws); const root = ws.getBlocksByType('ka_start', false)[0]; root?.setDeletable(false); configureStudioAssets(ws, configuration.current, sprite.id); }
    catch { restored = false; onError('This sprite’s saved code could not be opened. Its draft is preserved; download a backup or choose another sprite.'); }
    const publish = (event: Blockly.Events.Abstract) => { accessibility(); if (!restored || event.isUiEvent || event.type === Blockly.Events.FINISHED_LOADING) return; if (event.type === Blockly.Events.BLOCK_CREATE) configureStudioAssets(ws, configuration.current, sprite.id); setCount(Math.max(0, ws.getAllBlocks(false).length - 1)); setRevision(n => n + 1); change.current(Blockly.serialization.workspaces.save(ws)); };
    setCount(Math.max(0, ws.getAllBlocks(false).length - 1)); ws.addChangeListener(publish);
    const observer = new ResizeObserver(() => { Blockly.svgResize(ws); accessibility(); }); observer.observe(host.current); accessibility();
    return () => { observer.disconnect(); semantics.disconnect(); cancelAnimationFrame(accessibilityFrame); ws.removeChangeListener(publish); ws.dispose(); current.current = null; };
  }, [sprite.id, phone]);
  useEffect(() => {
    if (!workspace) return;
    const own = workspace.getAllBlocks(false).filter(b => ['ka_studio_define', 'ka_function_define'].includes(b.type));
    const calls = [...studioSystemFunctions.map(f => ({ name: f.name, parameter: f.block.fields?.PARAM === 'value' })), ...own.map(b => ({ name: String(b.getFieldValue('NAME')), parameter: b.getFieldValue('PARAM') === 'value' }))];
    workspace.updateToolbox({ kind: 'flyoutToolbox', contents: category === 'Functions' ? [
      ...calls.map(f => ({ kind: 'block', type: 'ka_function_call', fields: { NAME: f.name }, ...(f.parameter ? { inputs: { ARG: { shadow: { type: 'ka_number', fields: { NUM: 1 } } } } } : {}) })),
      ...active.types.filter(type => type !== 'ka_function_call').map(type => ({ kind: 'block', type })),
    ] : category === 'Behaviors' ? [...studioBehaviorFunctions.map(f => ({ kind: 'block', type: 'ka_studio_behavior', fields: { NAME: f.name, MODE: 'start' } })), ...active.types.map(type => ({ kind: 'block', type }))] : category === 'Sprites' ? [...studioCreationFunctions.map(f => ({ kind: 'block', type: 'ka_function_call', fields: { NAME: f.name }, inputs: { ARG: { shadow: { type: 'ka_number', fields: { NUM: 10 } } } } })), ...active.types.map(type => ({ kind: 'block', type }))] : active.types.map(type => ({ kind: 'block', type })) });
    configureStudioAssets(workspace.getFlyout()!.getWorkspace(), project, sprite.id);
  }, [workspace, category, project.assets, sprite.costumes, project.sprites.length, functionSignature]);
  useEffect(() => { if (!workspace) return; configureStudioAssets(workspace, project, sprite.id); }, [workspace, project.assets, sprite.costumes]);
  const definitions = workspace?.getAllBlocks(false).filter(b => ['ka_studio_define', 'ka_function_define'].includes(b.type)) ?? [];
  function editDefinition(block: Blockly.Block) {
    const saved = Blockly.serialization.blocks.save(block)!; delete saved.next;
    setFunctionError(''); setEditing({ block: saved, originalId: block.id, readOnly: false });
  }
  function saveDefinition(block: Blockly.serialization.blocks.State) {
    if (!workspace || !editing || editing.readOnly) return;
    const name = conceptFunctionName(block.fields?.NAME), old = editing.originalId ? workspace.getBlockById(editing.originalId) : null;
    if (definitions.some(d => d.id !== old?.id && d.getFieldValue('NAME') === name)) throw new Error('This sprite already has a function with that name.');
    if (isSystemFunction(name)) throw new Error('Choose a different name; built-in functions are read-only.');
    if (!old && definitions.length >= 4) throw new Error('Use up to four personal functions per sprite.');
    const code = Blockly.serialization.workspaces.save(workspace), roots = (code.blocks as { blocks: Blockly.serialization.blocks.State[] }).blocks;
    const oldName = old?.getFieldValue('NAME');
    const replace = (b: Blockly.serialization.blocks.State): Blockly.serialization.blocks.State => {
      const next = b.next?.block;
      if (b.id === old?.id) b = { ...block, type: b.type, id: b.id, x: b.x, y: b.y, ...(next ? { next: { block: next } } : {}) };
      if (oldName && ['ka_function_call', 'ka_function_value', 'ka_studio_behavior'].includes(b.type) && b.fields && b.fields.NAME === oldName) b.fields.NAME = name;
      if (b.next?.block) b.next.block = replace(b.next.block);
      for (const value of Object.values(b.inputs ?? {})) if (value.block) value.block = replace(value.block);
      return b;
    };
    roots.forEach((b, i) => { roots[i] = replace(b); });
    if (!old) roots.push({ ...block, type: 'ka_studio_define', id: crypto.randomUUID(), x: 360, y: 320 });
    const check = new Blockly.Workspace();
    try { setStudioAssetContext(check, project, sprite.id); Blockly.serialization.workspaces.load(code, check); if (check.getAllBlocks(false).length > 65) throw new Error('This function would exceed 64 blocks for this sprite. Remove unused blocks first.'); } finally { check.dispose(); }
    if (change.current(code) === false) throw new Error('This function could not be saved. Your previous code is unchanged.');
    Blockly.Events.disable(); try { Blockly.serialization.workspaces.load(code, workspace); workspace.getBlocksByType('ka_start', false)[0]?.setDeletable(false); configureStudioAssets(workspace, project, sprite.id); } finally { Blockly.Events.enable(); }
    setCount(workspace.getAllBlocks(false).length - 1); setRevision(n => n + 1); setEditing(null);
  }
  function deleteDefinition() {
    if (!workspace || !editing?.originalId || editing.readOnly) return;
    const block = workspace.getBlockById(editing.originalId); if (!block) return;
    const name = block.getFieldValue('NAME');
    if (workspace.getAllBlocks(false).some(b => ['ka_function_call', 'ka_function_value', 'ka_studio_behavior'].includes(b.type) && b.getFieldValue('NAME') === name)) { setFunctionError(`Remove calls to ${name} before deleting its definition.`); return; }
    if (!confirm(`Delete your function ${name}? Its body will be removed. Cancel keeps it.`)) return;
    block.dispose(true); setEditing(null); setFunctionError('');
  }
  let translated = '';
  if (showCode) try { translated = studioCodeView(workspace ? Blockly.serialization.workspaces.save(workspace) : sprite.code, sprite.name); } catch (failure) { translated = failure instanceof Error ? failure.message : 'Check your blocks.'; }
  return <section className="studio-code" aria-label={`Code for ${sprite.name}`}>
    <nav className="studio-category-rail" aria-label="Block categories">{studioCategories.map(c => <button key={c.name} type="button" disabled={running || !!editing} aria-pressed={category === c.name} onClick={() => onCategory(c.name)}><span style={{ background: c.colour }} aria-hidden="true" />{c.name}</button>)}</nav>
    <div className="studio-code-area"><div className="studio-code-heading"><strong>{sprite.name} · Code workspace</strong><span>{count}/64 blocks</span><button aria-label="Undo code change" disabled={running || !!editing} onClick={() => workspace?.undo(false)}><Undo2 size={17} /></button><button aria-label="Redo code change" disabled={running || !!editing} onClick={() => workspace?.undo(true)}><Redo2 size={17} /></button><button disabled={running || !!editing} onClick={() => workspace?.zoomToFit()}>Fit code</button><button aria-expanded={showCode} onClick={() => setShowCode(v => !v)}>{showCode ? 'Hide code' : 'Show code'}</button></div>
      {['Functions', 'Behaviors', 'Sprites'].includes(category) && !editing && <div className="studio-functions-shelf">{category !== 'Sprites' && <><button disabled={running} onClick={() => { setFunctionError(''); setEditing({ block: { type: 'ka_studio_define', fields: { NAME: category === 'Behaviors' ? 'my_behavior' : 'my_function', PARAM: 'none' } }, readOnly: false }); }}>{category === 'Behaviors' ? 'Create behavior' : 'Create function'}</button>{definitions.map(d => <button key={d.id} disabled={running} onClick={() => editDefinition(d)}>Edit {d.getFieldValue('NAME')}</button>)}</>}{category === 'Functions' && studioSystemFunctions.slice(0,2).map(f => <button key={f.name} disabled={running} onClick={() => setEditing({ block: f.block, readOnly: true })}>View {f.name}</button>)}<label>Built-in definition<select aria-label="Built-in definition" disabled={running} value={studioSystemFunctions.some(f => f.name === helper && (category !== 'Sprites' || studioCreationFunctions.some(c => c.name === f.name))) ? helper : '@make_grid'} onChange={e => setHelper(e.target.value)}>{(category === 'Sprites' ? studioCreationFunctions : studioSystemFunctions.slice(2)).map(f => <option key={f.name} value={f.name}>{f.name.replace(/^@/, '').replaceAll('_', ' ')}</option>)}</select></label><button disabled={running} onClick={() => { const name = category === 'Sprites' && !studioCreationFunctions.some(f => f.name === helper) ? '@make_grid' : helper; const definition = studioSystemFunctions.find(f => f.name === name)!; setEditing({ block: definition.block, readOnly: true }); }}>View definition</button><small>Functions run once; behaviors repeat the same ordinary blocks until stopped. Built-in definitions are read-only. Your own definitions stay editable.</small></div>}
      {functionError && <p role="alert" className="studio-function-error">{functionError}</p>}
      {editing && <StudioFunctionEditor key={editing.originalId ?? String(editing.block.fields?.NAME)} definition={editing.block} readOnly={editing.readOnly} project={project} spriteId={sprite.id} onSave={saveDefinition} onClose={() => { setEditing(null); setFunctionError(''); }} onDelete={editing.originalId ? deleteDefinition : undefined} />}
      <div className="studio-blockly-wrap" hidden={!!editing}><div className="studio-blockly" ref={host} role="group" aria-label="Block palette and draggable code canvas" />{running && <div className="studio-code-cover" role="status">Running · Stop to edit</div>}</div>
      {showCode && <section className="studio-code-view" aria-label="Read-only generated code"><h2>{sprite.name} · JavaScript-style code</h2><p>Read-only learning view. Byte Lab supplies the sprite and event helpers; this is not standalone JavaScript. Your blocks remain the source.</p><pre tabIndex={0}><code>{translated}</code></pre></section>}
      {!editing && <ConceptKeyboard workspace={workspace} types={active.types} running={running} onError={onError} />}
    </div>
  </section>;
});
