import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from 'react';
import * as Blockly from 'blockly/core';
import { Undo2, Redo2, ArrowRight, ArrowDown, ArrowLeft, ArrowUp, RotateCw, Trash2, ChevronLeft, ChevronRight, CornerDownRight } from 'lucide-react';
import { evaluateWorkspace, seedWorkspace, theme } from './blockly';
import { directions, labels, type Block, type Mission, type RunResult } from './learning';
import { drawingWorkspaceCode, seedDrawingCode } from './drawingBlockly';
import { instructionLimit, limitMessage } from './programLimits';
import { validRepeatCount } from '../shared/repeats.js';
import { dataBlocks } from './dataProgram';
import { relativeMovement, degreeTurns, relativeProgram } from './relativeMovement';
import { conceptPalette, creativeCategories } from './conceptModel';
import type { SpriteSettings } from './spriteModel';
import { creativeSolutions } from './creativeMissions';
import ConceptKeyboard, { insertConceptBlock } from './ConceptKeyboard';
import { configureConceptFields } from './conceptBlocks';

export type EditorHandle = { run: (mission: Mission) => RunResult; clear: () => void; highlight: (id: string) => void; drawingCode?: () => string; setScene?: (scene: SpriteSettings) => void };
type Props = { mission: Mission; initial: Record<string, unknown> | undefined; legacy: Block[]; running: boolean; arrows?: boolean; drawing?: { code: string; step: number; turn: number; repeats?: number; advanced?: boolean; young?: boolean }; onChange: (state: Record<string, unknown>, count: number) => void; onError: (message: string) => void };
type OverviewStep = { id: string; type: string; label: string; count: number; depth: number; scope: string[] };

export default forwardRef<EditorHandle, Props>(function BlockEditor({ mission, initial, legacy, running, arrows = false, drawing, onChange, onError }, ref) {
  const relative = !drawing && relativeMovement(mission);
  const conceptTypes = mission.conceptTask ? conceptPalette(mission.conceptTask.topic, Number(mission.id.match(/^grade-([3-6])-/)?.[1]), mission.conceptTask.required) : [];
  const [conceptWorkspace, setConceptWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const creative = mission.conceptTask?.topic === 'creative';
  const [category, setCategory] = useState('Events');
  const movementTypes = relative ? ['ka_forward', 'ka_backward', 'ka_turn_left', 'ka_turn_right', ...(degreeTurns(mission) ? ['ka_turn_degrees'] : [])] : directions.map(d => `ka_${arrows ? 'arrow_' : ''}${d}`);
  const element = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const change = useRef(onChange); change.current = onChange;
  const error = useRef(onError); error.current = onError;
  const runningRef = useRef(running); runningRef.current = running;
  const [keyboardType, setKeyboardType] = useState(drawing ? `ka_draw_${drawing.young ? 'arrow_' : ''}forward` : relative ? 'ka_forward' : 'right');
  const [overview, setOverview] = useState<OverviewStep[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [highlighted, setHighlighted] = useState('');
  const [paletteWidth, setPaletteWidth] = useState(88);
  const [paletteHeight, setPaletteHeight] = useState(0);
  const [phone, setPhone] = useState(() => matchMedia('(max-width: 600px)').matches);
  const stackedPalette = !!(mission.dataTask || mission.conceptTask) && phone;
  useEffect(() => {
    const query = matchMedia('(max-width: 600px)');
    const update = () => setPhone(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const selected = overview.find(step => step.id === selectedId) ?? overview[0];
  const selectedBlock = selected && workspace.current?.getBlockById(selected.id);
  const valueMin = drawing ? selected?.type.includes('forward') ? 1 : 0 : mission.dataTask ? 0 : -10;
  const valueMax = drawing ? selected?.type.includes('forward') ? 150 : 360 : mission.dataTask ? 9 : 10;
  const drawingTurn = !!drawing && selected?.type === 'ka_draw_turn';
  const selectedDirections = selectedBlock?.type.startsWith('ka_relative_') ? selectedBlock.type.includes('_if') ? ['forward', 'backward', 'left', 'right'] : ['forward', 'backward'] : directions;
  function stepFields() {
    return <>
      {selected?.type === 'repeat' && <label>Repeat<input aria-label="Selected repeat count" type="number" min={0} step={1} value={selected.count} disabled={running} onChange={e => { const n = Number(e.target.value); if (validRepeatCount(n)) selectedBlock?.setFieldValue(String(n),'COUNT'); }}/></label>}
      {selected?.type.startsWith('ka_') && selectedBlock?.getField('VALUE') && <label>{drawing ? selected.type.includes('forward') ? 'Distance' : 'Angle' : 'Edit value'}<input aria-label="Selected block value" type="number" min={valueMin} max={valueMax} value={Number(selectedBlock.getFieldValue('VALUE') ?? 0)} disabled={running} onChange={e => { const n = Number(e.target.value); if (Number.isInteger(n) && n >= valueMin && n <= valueMax) selectedBlock.setFieldValue(String(n),'VALUE'); }}/></label>}
      {drawingTurn && <select aria-label="Selected turn direction" disabled={running} value={selectedBlock?.getFieldValue('SIDE') ?? 'left'} onChange={e => selectedBlock?.setFieldValue(e.target.value,'SIDE')}><option value="left">Left</option><option value="right">Right</option></select>}
      {selectedBlock?.getField('DEGREES') && <><label>Degrees<select aria-label="Selected turn degrees" disabled={running} value={String(selectedBlock.getFieldValue('DEGREES'))} onChange={e => selectedBlock.setFieldValue(e.target.value, 'DEGREES')}>{[90, 180, 270].map(n => <option value={n} key={n}>{n}°</option>)}</select></label><select aria-label="Selected route turn direction" disabled={running} value={String(selectedBlock.getFieldValue('SIDE'))} onChange={e => selectedBlock.setFieldValue(e.target.value, 'SIDE')}><option value="left">Left</option><option value="right">Right</option></select></>}
      {selectedBlock?.getField('DIRECTION') && <select aria-label="Selected block direction" value={selectedBlock?.getFieldValue('DIRECTION') ?? 'right'} disabled={running} onChange={e => selectedBlock?.setFieldValue(e.target.value,'DIRECTION')}>{selectedDirections.map(d => <option key={d} value={d}>{d}</option>)}</select>}
      {['INDEX', 'SPEED', 'ENERGY'].filter(name => selectedBlock?.getField(name)).map(name => <label key={name}>{name.toLowerCase()}<input aria-label={`Selected block ${name.toLowerCase()}`} type="number" min={0} max={name === 'INDEX' ? 7 : 9} value={Number(selectedBlock?.getFieldValue(name))} disabled={running} onChange={e => { const n = Number(e.target.value); if (Number.isInteger(n) && n >= 0 && n <= (name === 'INDEX' ? 7 : 9)) selectedBlock?.setFieldValue(String(n), name); }} /></label>)}
      {selectedBlock?.getField('ITEMS') && <label>List items<input aria-label="Selected list items" value={String(selectedBlock.getFieldValue('ITEMS'))} maxLength={40} disabled={running} onChange={e => selectedBlock.setFieldValue(e.target.value, 'ITEMS')} /></label>}
      {selectedBlock?.getField('PROPERTY') && <select aria-label="Selected object property" value={String(selectedBlock.getFieldValue('PROPERTY'))} disabled={running} onChange={e => selectedBlock.setFieldValue(e.target.value, 'PROPERTY')}><option value="speed">speed</option><option value="energy">energy</option></select>}
    </>;
  }
  useImperativeHandle(ref, () => ({
    run: m => workspace.current ? evaluateWorkspace(workspace.current, m) : { frames: [], success: false, message: 'The block workspace is still loading. Try again in a moment.' },
    clear: () => { if (workspace.current) { const data = workspace.current.getBlocksByType('ka_start', false)[0]?.data; workspace.current.clear(); seedWorkspace(workspace.current, [], arrows); if (creative) { workspace.current.getBlocksByType('ka_start', false)[0].data = data; change.current(Blockly.serialization.workspaces.save(workspace.current), 0); } } },
    highlight: id => { workspace.current?.highlightBlock(id || null); setHighlighted(id); },
    drawingCode: () => workspace.current ? drawingWorkspaceCode(workspace.current, instructionLimit(mission)) : '',
    setScene: scene => { const ws = workspace.current, root = ws?.getBlocksByType('ka_start', false)[0]; if (!ws || !root) return; const previous = root.data; root.data = JSON.stringify(scene); Blockly.Events.fire(new Blockly.Events.BlockChange(root, 'data', null, previous, root.data)); change.current(Blockly.serialization.workspaces.save(ws), Math.max(0, ws.getAllBlocks(false).length - 1)); },
  }), [arrows, mission.maxBlocks]);

  useEffect(() => {
    if (!element.current) return;
    const ws = Blockly.inject(element.current, {
      horizontalLayout: stackedPalette,
      toolbox: { kind: 'flyoutToolbox', contents: drawing ? [
        { kind: 'block', type: drawing.young ? 'ka_draw_arrow_forward' : 'ka_draw_forward', fields: { VALUE: drawing.step } },
        ...['left','right'].map(side => ({kind:'block',type:drawing.young ? `ka_draw_arrow_${side}` : 'ka_draw_turn',fields:drawing.young ? {VALUE:drawing.turn} : {SIDE:side,VALUE:drawing.turn}})),
        ...(drawing.repeats ? [{kind:'block',type:'ka_draw_repeat',fields:{COUNT:drawing.repeats}}] : []),
        ...(drawing.advanced ? ['push','pop','pen_up','pen_down'].map(type => ({kind:'block',type:`ka_draw_${type}`})) : []),
      ] : mission.conceptTask ? (creative ? creativeCategories.find(c => c.name === category)!.types.filter(type => conceptTypes.includes(type)) : conceptTypes).map(type => ({ kind: 'block', type, gap: 8 })) : [
        ...dataBlocks(mission).map(type => ({ kind: 'block', type: `ka_${type}`, gap: 8 })),
        ...(mission.trail ? [{ kind: 'block', type: 'ka_move_next', gap: 8 }] : []),
        ...movementTypes.map(type => ({ kind: 'block', type, gap: 8 })),
        ...(mission.loops ? [{ kind: 'sep', gap: 8 }, { kind: 'block', type: 'ka_repeat', gap: 8 }] : []),
        ...(mission.conditionals && !mission.collectibles && !mission.gate && !mission.river ? (relative ? ['ka_relative_if', ...(mission.requireElse ? ['ka_relative_if_else'] : [])] : ['ka_if', 'ka_if_else']).map(type => ({ kind: 'block', type, gap: 8 })) : []),
        ...(mission.variables ? ['ka_set_score', ...(mission.requireChange ? ['ka_change_score'] : []), relative ? 'ka_relative_move_score' : 'ka_move_score'].map(type => ({ kind: 'block', type, gap: 8 })) : []),
        ...(mission.collectibles ? [...(mission.conditionals && mission.collectibles.kind !== 'key' ? [mission.requireElse ? 'ka_if_item_else' : 'ka_if_item'] : []),'ka_pick_item'].map(type => ({ kind: 'block', type, gap: 8 })) : []),
        ...(mission.gate ? ['ka_if_gate_locked','ka_open_gate'].map(type => ({ kind: 'block', type, gap: 8 })) : []),
        ...(mission.river ? ['ka_if_bridge_missing','ka_build_bridge'].map(type => ({ kind: 'block', type, gap: 8 })) : []),
      ] },
      theme, renderer: 'geras', media: '/blockly-media/', sounds: false, trashcan: true, maxBlocks: instructionLimit(mission) + 1,
      grid: { spacing: 24, length: 2, colour: '#d9dfe9', snap: false },
      // Keep Blockly's unbounded coordinate system without exposing scrolling.
      // Disabling scrollbars in its options installs a fixed-edge block bumper.
      move: { scrollbars: true, drag: false, wheel: false },
      zoom: { controls: false, wheel: false, startScale: 0.95, maxScale: 0.95, minScale: 0.1, scaleSpeed: 1.15 },
    });
    workspace.current = ws;
    if (mission.conceptTask) setConceptWorkspace(ws);
    ws.scrollbar?.setContainerVisible(false);
    const palette = ws.getFlyout() as Blockly.VerticalFlyout | null;
    if (palette) {
      // The palette is an input, not a program preview. Never shrink its
      // targets to squeeze every option into a temporarily short container.
      // Blockly's native flyout scrolling exposes longer lists instead.
      palette.getFlyoutScale = () => .95;
      palette.reflow();
    }
    try {
      if (initial) {
        Blockly.serialization.workspaces.load(initial, ws);
        const starts = ws.getBlocksByType('ka_start', false);
        if (starts.length !== 1 || ws.getAllBlocks(false).length > instructionLimit(mission) + 1) throw new Error('Invalid workspace');
        starts[0].setDeletable(false); starts[0].setMovable(false); starts[0].setEditable(false);
      } else {
        seedWorkspace(ws, legacy, arrows);
        if (mission.conceptTask?.creative?.free) Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [creativeSolutions[mission.id]] } }, ws);
        if (relative && legacy.length) {
          const state = Blockly.serialization.workspaces.save(ws);
          const root = (state.blocks as { blocks: Blockly.serialization.blocks.State[] }).blocks[0];
          Blockly.serialization.workspaces.load({ ...state, blocks: { languageVersion: 0, blocks: [relativeProgram(root)] } }, ws);
        }
        if (drawing?.code) seedDrawingCode(ws,drawing.code, drawing.young);
      }
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
        if (resized) { Blockly.svgResize(ws); palette?.reflow(); }
        // These empty SVG paths paint connection outlines; the actual block
        // options carry their names. Do not expose them as listbox children.
        element.current?.querySelectorAll('.blocklyHighlightedConnectionPath').forEach(path => path.setAttribute('aria-hidden','true'));
        const bounds = ws.getBlocksBoundingBox();
        const metrics = ws.getMetrics();
        if (!metrics) return;
        const width = Math.max(1, bounds.right - bounds.left);
        const height = Math.max(1, bounds.bottom - bounds.top);
        const scale = Math.min(.95, (metrics.viewWidth - 48) / width, (metrics.viewHeight - 80) / height);
        const steps: OverviewStep[] = [];
        function visit(first: Blockly.Block | null, scope: string[] = []) {
          let block = first;
          while (block) {
            if (block.type !== 'ka_start') {
              const direction = directions.find(d => block!.type === `ka_${arrows ? 'arrow_' : ''}${d}`);
              const repeat = block.type === 'ka_repeat' || block.type === 'ka_draw_repeat';
              steps.push({ id: block.id, type: direction ?? (repeat ? 'repeat' : block.type), label: direction ? labels[direction] : repeat ? 'Repeat' : block.toString().split(' do ')[0], count: Number(block.getFieldValue('COUNT') ?? 0), depth: scope.length, scope });
            }
            const owner = block.type === 'ka_repeat' || block.type === 'ka_draw_repeat' ? `Repeat ×${block.getFieldValue('COUNT')}` : `IF ${block.getFieldValue('DIRECTION')} clear`;
            visit(block.getInputTargetBlock('DO'), [...scope, `${owner}: DO`]);
            visit(block.getInputTargetBlock('ELSE'), [...scope, `${owner}: ELSE`]);
            block = block.getNextBlock();
          }
        }
        for (const root of ws.getTopBlocks(true)) visit(root);
        // Keep the child's viewport stable for ordinary edits. Only shrink when
        // necessary; recovering space after deletion must not zoom the stack.
        const nextScale = Math.round(Math.max(.1, resized ? scale : Math.min(ws.scale, scale)) * 1000) / 1000;
        setOverview(!mission.conceptTask && nextScale < .55 ? steps : []);
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
        setPaletteWidth(stackedPalette ? 0 : palette?.getWidth() ?? 88);
        setPaletteHeight(stackedPalette ? palette?.getHeight() ?? 0 : 0);
      });
    }
    function publish() { change.current(Blockly.serialization.workspaces.save(ws), Math.max(0, ws.getAllBlocks(false).length - 1)); }
    const listener = (event: Blockly.Events.Abstract) => {
      if (event.isUiEvent || event.type === Blockly.Events.FINISHED_LOADING) return;
      if (mission.conceptTask && event.type === Blockly.Events.BLOCK_CREATE) for (const b of ws.getAllBlocks(false)) configureConceptFields(b, Number(mission.id[6]));
      publish(); fit();
    };
    if (mission.conceptTask) {
      for (const b of [...ws.getAllBlocks(false), ...(palette?.getWorkspace().getAllBlocks(false) ?? [])]) configureConceptFields(b, Number(mission.id[6]));
    }
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
      if (source && !event.target.closest('.blocklyEditableText')) pointer = { x: event.clientX, y: event.clientY, ids: new Set(ws.getAllBlocks(false).map(b => b.id)), direction: direction ?? source.type };
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
  }, [mission.id, arrows, stackedPalette]);
  useEffect(() => {
    if (!creative || !conceptWorkspace) return;
    const types = creativeCategories.find(c => c.name === category)!.types.filter(type => conceptTypes.includes(type));
    conceptWorkspace.updateToolbox({ kind: 'flyoutToolbox', contents: types.map(type => ({ kind: 'block', type, gap: 8 })) });
    for (const block of conceptWorkspace.getFlyout()?.getWorkspace().getAllBlocks(false) ?? []) configureConceptFields(block, Number(mission.id[6]));
  }, [category, conceptWorkspace, creative, mission.id]);

  function appendKeyboardBlock(direction = keyboardType) {
    const ws = workspace.current; if (!ws || runningRef.current) return;
    if (ws.remainingCapacity() < 1) { error.current(limitMessage(instructionLimit(mission))); return; }
    if (mission.conceptTask) { try { insertConceptBlock(ws, direction); } catch (error) { onError(error instanceof Error ? error.message : 'Choose an empty input.'); } return; }
    const root = ws.getBlocksByType('ka_start', false)[0]; if (!root) return;
    let last = root; while (last.getNextBlock()) last = last.getNextBlock()!;
    const b = ws.newBlock(direction.startsWith('ka_') ? direction : `ka_${arrows ? 'arrow_' : ''}${direction}`); b.initSvg();
    if (drawing) {
      if (b.getField('VALUE')) b.setFieldValue(String(direction.includes('forward') ? drawing.step : drawing.turn),'VALUE');
      if (b.getField('COUNT')) b.setFieldValue(String(drawing.repeats ?? 4),'COUNT');
    }
    b.render(); last.nextConnection!.connect(b.previousConnection!);
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
    {creative && <label className="creative-category">Block category<select value={category} disabled={running} onChange={e => setCategory(e.target.value)}>{creativeCategories.map(c => <option key={c.name}>{c.name}</option>)}</select></label>}
    <div className="blockly-labels"><h3>Blocks</h3><div><h3>Code canvas</h3><div className="history-buttons"><button aria-label="Undo block change" disabled={running} onClick={() => workspace.current?.undo(false)}><Undo2 size={16}/></button><button aria-label="Redo block change" disabled={running} onClick={() => workspace.current?.undo(true)}><Redo2 size={16}/></button></div></div></div>
    <div className={`blockly-container ${stackedPalette ? "data-palette-stacked" : ""}`} style={{ '--palette-width': `${paletteWidth}px`, '--palette-height': `${paletteHeight}px` } as CSSProperties}><div className="blockly-host" ref={element} role="group" aria-label="Drag blocks from the palette into the code canvas" />{overview.length > 0 && <section className="program-overview" aria-label="Program steps"><p>Read across, then down. Tap a step to edit.</p><ol>{overview.map((step, index) => { const Icon = ({ right: ArrowRight, down: ArrowDown, left: ArrowLeft, up: ArrowUp } as Record<string, typeof ArrowRight>)[step.type] ?? RotateCw; return <li key={step.id}><button className={`${step.type === 'repeat' ? 'overview-repeat' : ''} ${step.type.startsWith('ka_') ? 'overview-code' : ''} ${highlighted === step.id ? 'step-running' : ''}`} aria-label={`Step ${index + 1}: ${step.label}${step.type === 'repeat' ? ` ${step.count} times` : ''}${step.scope.length ? `, inside ${step.scope.join(', then ')}` : ''}`} aria-pressed={selected?.id === step.id} disabled={running} onClick={() => setSelectedId(step.id)}><small>{index + 1}{step.depth > 0 && <CornerDownRight size={10} />}</small>{step.scope.length > 0 && <em className="step-scope">{step.scope.join(' / ')}</em>}{step.type.startsWith('ka_') ? <span>{step.label}</span> : <Icon size={22} />}{step.type === 'repeat' && <span>×{step.count}</span>}</button></li>; })}</ol><div className="step-edit"><span>Step {overview.indexOf(selected) + 1}</span>{stepFields()}<button aria-label="Move step earlier" disabled={running || !workspace.current?.getBlockById(selected.id)?.getPreviousBlock() || workspace.current?.getBlockById(selected.id)?.getPreviousBlock()?.type === 'ka_start'} onClick={() => editStep('earlier')}><ChevronLeft size={20} /></button><button aria-label="Move step later" disabled={running || !workspace.current?.getBlockById(selected.id)?.getNextBlock()} onClick={() => editStep('later')}><ChevronRight size={20} /></button><button aria-label="Delete selected step" disabled={running} onClick={() => editStep('delete')}><Trash2 size={18} /></button></div></section>}{running && <div className="running-cover" role="status" aria-label="Code is running"/>}</div>
    {mission.conceptTask ? <ConceptKeyboard workspace={conceptWorkspace} types={conceptTypes} running={running} onError={onError} /> : <details className={`keyboard-tools ${overview.length ? 'overview-tools' : ''}`} style={{ '--palette-width': `${paletteWidth}px` } as CSSProperties}><summary>Keyboard helpers</summary><p>Add an instruction to the end of the program. Use Undo to reverse a change. Full keyboard editing of nested blocks is still being evaluated.</p><div><label htmlFor="keyboard-move">Instruction</label><select id="keyboard-move" value={keyboardType} onChange={e => setKeyboardType(e.target.value)}>{drawing ? <><option value={`ka_draw_${drawing.young ? 'arrow_' : ''}forward`}>Forward</option><option value={drawing.young ? 'ka_draw_arrow_left' : 'ka_draw_turn'}>Turn left</option>{drawing.young && <option value="ka_draw_arrow_right">Turn right</option>}{drawing.repeats && <option value="ka_draw_repeat">Repeat</option>}</> : <>{relative ? movementTypes.map(type => <option key={type} value={type}>{type.slice(3).replaceAll("_", " ")}</option>) : directions.map(d => <option key={d} value={d}>{labels[d]}</option>)}{dataBlocks(mission).map(type => <option key={type} value={`ka_${type}`}>{type.replaceAll("_", " ")}</option>)}</>}</select><button disabled={running} onClick={() => appendKeyboardBlock()}>Add block</button></div></details>}
  </>;
});
