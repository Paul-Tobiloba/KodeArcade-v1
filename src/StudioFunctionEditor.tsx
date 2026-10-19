import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { theme } from './blockly';
import { configureStudioAssets, setStudioAssetContext, studioCategories } from './studioBlocks';
import { isSystemFunction } from './studioFunctions';
import { conceptFunctionName } from './conceptRuntime';
import type { StudioProject } from './studioProject';
import ConceptKeyboard from './ConceptKeyboard';
type B = Blockly.serialization.blocks.State;
export default function StudioFunctionEditor({ definition, readOnly, project, spriteId, onSave, onClose, onDelete }: {
  definition: B; readOnly: boolean; project: StudioProject; spriteId: string; onSave: (block: B) => void; onClose: () => void; onDelete?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null), workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const draft = useRef<Record<string, unknown> | null>(null);
  const [error, setError] = useState(''), [category, setCategory] = useState('Motion');
  const [keyboardWorkspace, setKeyboardWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [phone, setPhone] = useState(() => matchMedia('(max-width: 700px)').matches);
  useEffect(() => { const query = matchMedia('(max-width: 700px)'), update = () => setPhone(query.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  useEffect(() => {
    if (!host.current) return;
    const ws = Blockly.inject(host.current, { readOnly, horizontalLayout: phone, toolbox: readOnly ? undefined : { kind: 'flyoutToolbox', contents: studioCategories.find(c => c.name === category)!.types.filter(type => !type.startsWith('ka_event_')).map(type => ({ kind: 'block', type })) }, theme, media: '/blockly-media/', sounds: false, renderer: 'geras', maxBlocks: 64, move: { scrollbars: true, drag: true, wheel: true }, zoom: { controls: true, startScale: .85, minScale: .45, maxScale: 1.4 } });
    workspace.current = ws; setKeyboardWorkspace(ws); setStudioAssetContext(ws, project, spriteId);
    if (draft.current) Blockly.serialization.workspaces.load(draft.current, ws);
    else { const root = Blockly.serialization.blocks.append(structuredClone(definition), ws); root.moveBy(30, 30); }
    ws.getAllBlocks(false).filter(b => ['ka_studio_define', 'ka_function_define'].includes(b.type)).forEach(b => b.setDeletable(false));
    configureStudioAssets(ws, project, spriteId);
    let accessibilityFrame = 0;
    const accessibility = () => { cancelAnimationFrame(accessibilityFrame); accessibilityFrame = requestAnimationFrame(() => {
      // Match the main canvas: connection outlines are geometry, not listbox choices.
      host.current?.querySelectorAll('.blocklyHighlightedConnectionPath').forEach(node => node.setAttribute('aria-hidden', 'true'));
      host.current?.querySelectorAll('[aria-owns]').forEach(node => {
        const original = node.getAttribute('aria-owns') ?? '', ids = original.split(/\s+/).filter(id => { const owned = document.getElementById(id); return owned && !owned.classList.contains('blocklyHighlightedConnectionPath'); });
        if (ids.length) { if (original !== ids.join(' ')) node.setAttribute('aria-owns', ids.join(' ')); } else node.removeAttribute('aria-owns');
      });
    }); };
    const semantics = new MutationObserver(accessibility); semantics.observe(host.current, { childList: true, subtree: true, attributes: true, attributeFilter: ['role', 'aria-owns'] });
    const resize = new ResizeObserver(() => { Blockly.svgResize(ws); accessibility(); }); resize.observe(host.current); accessibility();
    return () => { resize.disconnect(); semantics.disconnect(); cancelAnimationFrame(accessibilityFrame); draft.current = Blockly.serialization.workspaces.save(ws); ws.dispose(); workspace.current = null; };
  }, [phone]);
  function changeCategory(name: string) {
    setCategory(name); const ws = workspace.current;
    if (!ws) return;
    ws.updateToolbox({ kind: 'flyoutToolbox', contents: studioCategories.find(c => c.name === name)!.types.filter(type => !type.startsWith('ka_event_')).map(type => ({ kind: 'block', type })) });
    configureStudioAssets(ws.getFlyout()!.getWorkspace(), project, spriteId);
  }
  function save() {
    const ws = workspace.current; if (!ws) return;
    try {
      const roots = ws.getTopBlocks(false);
      if (roots.length !== 1 || !['ka_studio_define', 'ka_function_define'].includes(roots[0].type)) throw new Error('Connect every block inside this function before saving.');
      const name = conceptFunctionName(roots[0].getFieldValue('NAME'));
      if (isSystemFunction(name)) throw new Error('Built-in function names are read-only. Choose a different name.');
      onSave(Blockly.serialization.blocks.save(roots[0])!);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Check this function.'); }
  }
  return <section className="studio-function-editor" aria-label={readOnly ? 'Read-only built-in function' : 'Edit your function'}>
    <div className="studio-function-heading"><h2>{readOnly ? 'Built-in function · read-only' : 'Edit your function'}</h2><div>{!readOnly && <button onClick={save}>Save function</button>}{onDelete && !readOnly && <button onClick={onDelete}>Delete function</button>}<button onClick={onClose}>{readOnly ? 'Close definition' : 'Cancel editing'}</button></div></div>
    <p>{readOnly ? 'These ordinary blocks make this built-in function. You can inspect them, but cannot change the system definition.' : 'Edit the name, input and body. Save applies this definition to the selected sprite; Cancel keeps the previous code.'}</p>
    {error && <p role="alert" className="studio-field-error">{error}</p>}
    {!readOnly && <label className="studio-function-category">Block category<select value={category} onChange={e => changeCategory(e.target.value)}>{studioCategories.filter(c => c.types.some(type => !type.startsWith('ka_event_'))).map(c => <option key={c.name}>{c.name}</option>)}</select></label>}
    <div className="studio-function-canvas" ref={host} role="group" aria-label="Function block workspace" />
    {!readOnly && <ConceptKeyboard workspace={keyboardWorkspace} types={studioCategories.find(c => c.name === category)!.types.filter(type => !type.startsWith('ka_event_'))} running={false} onError={setError} />}
  </section>;
}
