import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { Undo2, Redo2 } from 'lucide-react';
import { evaluateWorkspace, seedWorkspace, theme } from './blockly';
import { directions, labels, type Block, type Mission, type RunResult } from './learning';

export type EditorHandle = { run: (mission: Mission) => RunResult; clear: () => void; highlight: (id: string) => void };
type Props = { mission: Mission; initial: Record<string, unknown> | undefined; legacy: Block[]; running: boolean; onChange: (state: Record<string, unknown>, count: number) => void; onError: (message: string) => void };

export default forwardRef<EditorHandle, Props>(function BlockEditor({ mission, initial, legacy, running, onChange, onError }, ref) {
  const element = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const change = useRef(onChange); change.current = onChange;
  const error = useRef(onError); error.current = onError;
  const [keyboardType, setKeyboardType] = useState('right');
  useImperativeHandle(ref, () => ({
    run: m => workspace.current ? evaluateWorkspace(workspace.current, m) : { frames: [], success: false, message: 'The block workspace is still loading. Try again in a moment.' },
    clear: () => { if (workspace.current) { workspace.current.clear(); seedWorkspace(workspace.current, []); } },
    highlight: id => { workspace.current?.highlightBlock(id || null); },
  }), []);

  useEffect(() => {
    if (!element.current) return;
    const ws = Blockly.inject(element.current, {
      toolbox: { kind: 'flyoutToolbox', contents: [
        ...directions.map(d => ({ kind: 'block', type: `ka_${d}` })),
        ...(mission.loops ? [{ kind: 'sep', gap: 28 }, { kind: 'block', type: 'ka_repeat' }] : []),
      ] },
      theme, renderer: 'geras', media: '/blockly-media/', sounds: false, trashcan: true, maxBlocks: 25,
      grid: { spacing: 24, length: 2, colour: '#d9dfe9', snap: false },
      move: { scrollbars: true, drag: true, wheel: true },
      zoom: { controls: true, wheel: false, startScale: 0.95, maxScale: 1.3, minScale: 0.55, scaleSpeed: 1.15 },
    });
    workspace.current = ws;
    try {
      if (initial) {
        Blockly.serialization.workspaces.load(initial, ws);
        const starts = ws.getBlocksByType('ka_start', false);
        if (starts.length !== 1 || ws.getAllBlocks(false).length > 25) throw new Error('Invalid workspace');
        starts[0].setDeletable(false); starts[0].setMovable(false); starts[0].setEditable(false);
      } else seedWorkspace(ws, legacy);
    } catch {
      ws.clear(); seedWorkspace(ws, legacy);
      error.current('The saved block layout could not be restored. Your last movement sequence is available; please check it before running.');
    }
    function publish() { change.current(Blockly.serialization.workspaces.save(ws), Math.max(0, ws.getAllBlocks(false).length - 1)); }
    const listener = (event: Blockly.Events.Abstract) => {
      if (event.isUiEvent || event.type === Blockly.Events.FINISHED_LOADING) return;
      publish();
    };
    ws.addChangeListener(listener);
    publish();
    const observer = new ResizeObserver(() => { Blockly.svgResize(ws); ws.scroll(0, 0); }); observer.observe(element.current);
    const initialLayout = requestAnimationFrame(() => { Blockly.svgResize(ws); ws.scroll(0, 0); });
    return () => { cancelAnimationFrame(initialLayout); ws.removeChangeListener(listener); observer.disconnect(); ws.dispose(); workspace.current = null; };
    // Workspace lifecycle is tied to this mission; changes persist without re-injecting Blockly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.id]);

  function appendKeyboardBlock() {
    const ws = workspace.current; if (!ws || running || ws.remainingCapacity() < 1) return;
    const root = ws.getBlocksByType('ka_start', false)[0]; if (!root) return;
    let last = root; while (last.getNextBlock()) last = last.getNextBlock()!;
    const b = ws.newBlock(`ka_${keyboardType}`); b.initSvg(); b.render(); last.nextConnection!.connect(b.previousConnection!);
  }
  return <>
    <div className="blockly-labels"><h3>Blocks</h3><div><h3>Code canvas</h3><div className="history-buttons"><button aria-label="Undo block change" disabled={running} onClick={() => workspace.current?.undo(false)}><Undo2 size={16}/></button><button aria-label="Redo block change" disabled={running} onClick={() => workspace.current?.undo(true)}><Redo2 size={16}/></button></div></div></div>
    <div className="blockly-container"><div className="blockly-host" ref={element} aria-label="Drag blocks from the palette into the code canvas" />{running && <div className="running-cover" aria-label="Code is running"/>}</div>
    <details className="keyboard-tools"><summary>Keyboard helpers</summary><p>Add a movement to the end of the program. Use Undo to reverse a change. Full keyboard editing of nested blocks is still being evaluated.</p><div><label htmlFor="keyboard-move">Movement</label><select id="keyboard-move" value={keyboardType} onChange={e => setKeyboardType(e.target.value)}>{directions.map(d => <option key={d} value={d}>{labels[d]}</option>)}</select><button disabled={running} onClick={appendKeyboardBlock}>Add block</button></div></details>
  </>;
});
