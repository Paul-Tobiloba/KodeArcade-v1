import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from 'react';
import * as Blockly from 'blockly/core';
import { Undo2, Redo2, ArrowRight, ArrowDown, ArrowLeft, ArrowUp, RotateCw, Trash2, ChevronLeft, ChevronRight, CornerDownRight } from 'lucide-react';
import { evaluateWorkspace, seedWorkspace, theme } from './blockly';
import { directions, labels, type Block, type Mission, type RunResult } from './learning';

export type EditorHandle = { run: (mission: Mission) => RunResult; clear: () => void; highlight: (id: string) => void };
type Props = { mission: Mission; initial: Record<string, unknown> | undefined; legacy: Block[]; running: boolean; arrows?: boolean; onChange: (state: Record<string, unknown>, count: number) => void; onError: (message: string) => void };
type OverviewStep = { id: string; type: string; label: string; count: number; depth: number };

export default forwardRef<EditorHandle, Props>(function BlockEditor({ mission, initial, legacy, running, arrows = false, onChange, onError }, ref) {
  const element = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const change = useRef(onChange); change.current = onChange;
  const error = useRef(onError); error.current = onError;
  const runningRef = useRef(running); runningRef.current = running;
  const [keyboardType, setKeyboardType] = useState('right');
  const [overview, setOverview] = useState<OverviewStep[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [highlighted, setHighlighted] = useState('');
  const [paletteWidth, setPaletteWidth] = useState(88);
  const selected = overview.find(step => step.id === selectedId) ?? overview[0];
  useImperativeHandle(ref, () => ({
    run: m => workspace.current ? evaluateWorkspace(workspace.current, m) : { frames: [], success: false, message: 'The block workspace is still loading. Try again in a moment.' },
    clear: () => { if (workspace.current) { workspace.current.clear(); seedWorkspace(workspace.current, [], arrows); } },
    highlight: id => { workspace.current?.highlightBlock(id || null); setHighlighted(id); },
  }), [arrows]);

  useEffect(() => {
    if (!element.current) return;
    const ws = Blockly.inject(element.current, {
      toolbox: { kind: 'flyoutToolbox', contents: [
        ...directions.map(d => ({ kind: 'block', type: `ka_${arrows ? 'arrow_' : ''}${d}`, gap: 8 })),
        ...(mission.loops ? [{ kind: 'sep', gap: 8 }, { kind: 'block', type: 'ka_repeat', gap: 8 }] : []),
      ] },
      theme, renderer: 'geras', media: '/blockly-media/', sounds: false, trashcan: true, maxBlocks: 25,
      grid: { spacing: 24, length: 2, colour: '#d9dfe9', snap: false },
      // Keep Blockly's unbounded coordinate system without exposing scrolling.
      // Disabling scrollbars in its options installs a fixed-edge block bumper.
      move: { scrollbars: true, drag: false, wheel: false },
      zoom: { controls: false, wheel: false, startScale: 0.95, maxScale: 0.95, minScale: 0.1, scaleSpeed: 1.15 },
    });
    workspace.current = ws;
    ws.scrollbar?.setContainerVisible(false);
    const palette = ws.getFlyout() as Blockly.VerticalFlyout | null;
    if (palette) {
      palette.getWorkspace().scrollbar?.setContainerVisible(false);
      const naturalHeight = palette.getWorkspace().getTopBlocks(false).reduce((height, block) => height + block.getHeightWidth().height + 8, mission.loops ? 24 : 16);
      // Palette targets stay large when a longer program scales down.
      palette.getFlyoutScale = () => Math.min(.95, Math.max(.35, ((element.current?.clientHeight ?? 400) - 12) / naturalHeight));
      palette.reflow();
    }
    try {
      if (initial) {
        Blockly.serialization.workspaces.load(initial, ws);
        const starts = ws.getBlocksByType('ka_start', false);
        if (starts.length !== 1 || ws.getAllBlocks(false).length > 25) throw new Error('Invalid workspace');
        starts[0].setDeletable(false); starts[0].setMovable(false); starts[0].setEditable(false);
      } else seedWorkspace(ws, legacy, arrows);
    } catch {
      ws.clear(); seedWorkspace(ws, legacy, arrows);
      error.current('The saved block layout could not be restored. Your last movement sequence is available; please check it before running.');
    }
    let fitFrame = 0;
    let pointerHeld = false;
    let fittedWidth = 0;
    let fittedHeight = 0;
    function fit() {
      cancelAnimationFrame(fitFrame);
      fitFrame = requestAnimationFrame(() => {
        // A flyout creates its new block before Blockly marks the gesture as
        // dragging. Do not resize/reposition in that pointer-down window either.
        if (pointerHeld || ws.isDragging()) return;
        const resized = fittedWidth !== element.current?.clientWidth || fittedHeight !== element.current?.clientHeight;
        if (resized) Blockly.svgResize(ws);
        const bounds = ws.getBlocksBoundingBox();
        const metrics = ws.getMetrics();
        if (!metrics) return;
        const width = Math.max(1, bounds.right - bounds.left);
        const height = Math.max(1, bounds.bottom - bounds.top);
        const scale = Math.min(.95, (metrics.viewWidth - 48) / width, (metrics.viewHeight - 80) / height);
        const steps: OverviewStep[] = [];
        function visit(first: Blockly.Block | null, depth = 0) {
          let block = first;
          while (block) {
            if (block.type !== 'ka_start') {
              const direction = directions.find(d => block!.type === `ka_${arrows ? 'arrow_' : ''}${d}`);
              steps.push({ id: block.id, type: direction ?? 'repeat', label: direction ? labels[direction] : 'Repeat', count: Number(block.getFieldValue('COUNT') ?? 0), depth });
            }
            visit(block.getInputTargetBlock('DO'), depth + 1);
            block = block.getNextBlock();
          }
        }
        for (const root of ws.getTopBlocks(true)) visit(root);
        // Keep the child's viewport stable for ordinary edits. Only shrink when
        // necessary; recovering space after deletion must not zoom the stack.
        const nextScale = Math.round(Math.max(.1, resized ? scale : Math.min(ws.scale, scale)) * 1000) / 1000;
        setOverview(nextScale < .55 ? steps : []);
        if (nextScale !== ws.scale) ws.setScale(nextScale);
        const left = bounds.left * ws.scale + ws.scrollX;
        const top = bounds.top * ws.scale + ws.scrollY;
        const right = bounds.right * ws.scale + ws.scrollX;
        const bottom = bounds.bottom * ws.scale + ws.scrollY;
        if (resized || left < 0 || right > metrics.viewWidth || top < 0 || bottom > metrics.viewHeight - 40) {
          ws.scroll(24 - bounds.left * ws.scale, 20 - bounds.top * ws.scale);
        }
        fittedWidth = element.current?.clientWidth ?? 0;
        fittedHeight = element.current?.clientHeight ?? 0;
        setPaletteWidth(palette?.getWidth() ?? 88);
      });
    }
    function publish() { change.current(Blockly.serialization.workspaces.save(ws), Math.max(0, ws.getAllBlocks(false).length - 1)); }
    const listener = (event: Blockly.Events.Abstract) => {
      if (event.isUiEvent || event.type === Blockly.Events.FINISHED_LOADING) return;
      publish(); fit();
    };
    ws.addChangeListener(listener);
    publish();
    // Blockly creates a block on pointer-down. A short tap connects that new
    // block to the program; a drag keeps Blockly's normal placement behavior.
    let pointer: { x: number; y: number; ids: Set<string>; direction: string } | null = null;
    const host = element.current;
    const down = (event: PointerEvent) => {
      pointerHeld = true;
      if (runningRef.current || !(event.target instanceof Element) || !event.target.closest('.blocklyFlyout .blocklyDraggable')) return;
      const source = ws.getFlyout()?.getWorkspace().getAllBlocks(false).find(b => b.getSvgRoot().contains(event.target as Node));
      const direction = source && directions.find(d => source.type === `ka_${arrows ? 'arrow_' : ''}${d}`);
      if (direction) pointer = { x: event.clientX, y: event.clientY, ids: new Set(ws.getAllBlocks(false).map(b => b.id)), direction };
    };
    let tapFrame = 0;
    const up = (event: PointerEvent) => {
      pointerHeld = false;
      fit();
      const origin = pointer; pointer = null;
      if (!origin || Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) return;
      event.preventDefault(); event.stopImmediatePropagation(); ws.cancelCurrentGesture();
      tapFrame = requestAnimationFrame(() => {
        if (runningRef.current) return;
        for (const added of ws.getAllBlocks(false).filter(b => !origin.ids.has(b.id))) added.dispose(false);
        appendKeyboardBlock(origin.direction); fit();
      });
    };
    const cancel = () => { pointerHeld = false; pointer = null; fit(); };
    host.addEventListener('pointerdown', down, true); document.addEventListener('pointerup', up, true);
    document.addEventListener('pointercancel', cancel, true);
    const observer = new ResizeObserver(fit); observer.observe(element.current); fit();
    return () => { cancelAnimationFrame(fitFrame); cancelAnimationFrame(tapFrame); host.removeEventListener('pointerdown', down, true); document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', cancel, true); ws.removeChangeListener(listener); observer.disconnect(); ws.dispose(); workspace.current = null; };
    // Workspace lifecycle is tied to this mission; changes persist without re-injecting Blockly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.id, arrows]);

  function appendKeyboardBlock(direction = keyboardType) {
    const ws = workspace.current; if (!ws || runningRef.current || ws.remainingCapacity() < 1) return;
    const root = ws.getBlocksByType('ka_start', false)[0]; if (!root) return;
    let last = root; while (last.getNextBlock()) last = last.getNextBlock()!;
    const b = ws.newBlock(`ka_${arrows ? 'arrow_' : ''}${direction}`); b.initSvg(); b.render(); last.nextConnection!.connect(b.previousConnection!);
  }
  function editStep(action: 'earlier' | 'later' | 'delete') {
    const ws = workspace.current; const block = selected && ws?.getBlockById(selected.id);
    if (!ws || !block || runningRef.current) return;
    Blockly.Events.setGroup(true);
    try {
      if (action === 'delete') { block.unplug(true); block.dispose(false); return; }
      const first = action === 'earlier' ? block.getPreviousBlock() : block;
      const second = first?.getNextBlock();
      if (!first || !second || first.type === 'ka_start' || (action === 'earlier' && second !== block)) return;
      const before = first.previousConnection?.targetConnection;
      const after = second.nextConnection?.targetConnection;
      first.previousConnection?.disconnect(); first.nextConnection?.disconnect(); second.nextConnection?.disconnect();
      before?.connect(second.previousConnection!);
      second.nextConnection!.connect(first.previousConnection!);
      if (after) first.nextConnection!.connect(after);
    } finally { Blockly.Events.setGroup(false); }
  }
  return <>
    <div className="blockly-labels"><h3>Blocks</h3><div><h3>Code canvas</h3><div className="history-buttons"><button aria-label="Undo block change" disabled={running} onClick={() => workspace.current?.undo(false)}><Undo2 size={16}/></button><button aria-label="Redo block change" disabled={running} onClick={() => workspace.current?.undo(true)}><Redo2 size={16}/></button></div></div></div>
    <div className="blockly-container" style={{ '--palette-width': `${paletteWidth}px` } as CSSProperties}><div className="blockly-host" ref={element} role="group" aria-label="Drag blocks from the palette into the code canvas" />{overview.length > 0 && <section className="program-overview" aria-label="Program steps"><p>Read across, then down. Tap a step to edit.</p><ol>{overview.map((step, index) => { const Icon = ({ right: ArrowRight, down: ArrowDown, left: ArrowLeft, up: ArrowUp } as Record<string, typeof ArrowRight>)[step.type] ?? RotateCw; return <li key={step.id}><button className={`${step.type === 'repeat' ? 'overview-repeat' : ''} ${highlighted === step.id ? 'step-running' : ''}`} aria-label={`Step ${index + 1}: ${step.label}${step.type === 'repeat' ? ` ${step.count} times` : ''}${step.depth ? ', inside repeat' : ''}`} aria-pressed={selected?.id === step.id} disabled={running} onClick={() => setSelectedId(step.id)}><small>{index + 1}{step.depth > 0 && <CornerDownRight size={10} />}</small><Icon size={22} />{step.type === 'repeat' && <span>×{step.count}</span>}</button></li>; })}</ol><div className="step-edit"><span>Step {overview.indexOf(selected) + 1}</span>{selected?.type === 'repeat' && <label>Repeat<input aria-label="Selected repeat count" type="number" min={2} max={5} value={selected.count} disabled={running} onChange={e => { const count = Number(e.target.value); if (count >= 2 && count <= 5) workspace.current?.getBlockById(selected.id)?.setFieldValue(String(count), 'COUNT'); }} /></label>}<button aria-label="Move step earlier" disabled={running || !workspace.current?.getBlockById(selected.id)?.getPreviousBlock() || workspace.current?.getBlockById(selected.id)?.getPreviousBlock()?.type === 'ka_start'} onClick={() => editStep('earlier')}><ChevronLeft size={20} /></button><button aria-label="Move step later" disabled={running || !workspace.current?.getBlockById(selected.id)?.getNextBlock()} onClick={() => editStep('later')}><ChevronRight size={20} /></button><button aria-label="Delete selected step" disabled={running} onClick={() => editStep('delete')}><Trash2 size={18} /></button></div></section>}{running && <div className="running-cover" role="status" aria-label="Code is running"/>}</div>
    <details className={`keyboard-tools ${overview.length ? 'overview-tools' : ''}`} style={{ '--palette-width': `${paletteWidth}px` } as CSSProperties}><summary>Keyboard helpers</summary><p>Add a movement to the end of the program. Use Undo to reverse a change. Full keyboard editing of nested blocks is still being evaluated.</p><div><label htmlFor="keyboard-move">Movement</label><select id="keyboard-move" value={keyboardType} onChange={e => setKeyboardType(e.target.value)}>{directions.map(d => <option key={d} value={d}>{labels[d]}</option>)}</select><button disabled={running} onClick={() => appendKeyboardBlock()}>Add block</button></div></details>
  </>;
});
