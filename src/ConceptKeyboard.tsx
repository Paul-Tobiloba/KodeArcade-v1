import { useEffect, useState } from 'react';
import * as Blockly from 'blockly/core';
const targetParts = (target: string) => { const index = target.lastIndexOf(':'); return index < 0 ? ['', ''] : [target.slice(0, index), target.slice(index + 1)]; };

export function insertConceptBlock(ws: Blockly.WorkspaceSvg, type: string, target = '') {
  const b = ws.newBlock(type); b.initSvg(); b.render();
  try {
    if (!b.outputConnection && !b.previousConnection) { b.moveBy(220, 40 + ws.getTopBlocks(false).length * 80); }
    else if (b.outputConnection) {
      const [id, name] = targetParts(target);
      const chosen = id ? ws.getBlockById(id)?.getInput(name)?.connection : undefined;
      const socket = chosen ?? ws.getAllBlocks(false).filter(item => item !== b).flatMap(item => item.inputList).find(input => input.type === Blockly.inputs.inputTypes.VALUE && !input.connection?.isConnected() && ws.connectionChecker.canConnect(b.outputConnection!, input.connection!, false))?.connection;
      if (!socket || socket.isConnected() || !ws.connectionChecker.canConnect(b.outputConnection, socket, false)) throw new Error('Choose an empty input of the matching type, or add an instruction with a value input first.');
      socket.connect(b.outputConnection);
    } else {
      const [id, name] = targetParts(target);
      const parent = id ? ws.getBlockById(id) : ws.getBlocksByType('ka_start', false)[0];
      let socket = name && name !== 'NEXT' ? parent?.getInput(name)?.connection : parent?.nextConnection;
      if (!socket || name && name !== 'NEXT' && parent?.getInput(name)?.type !== Blockly.inputs.inputTypes.STATEMENT) throw new Error('Choose the main program or a DO/ELSE instruction group.');
      let last = socket.targetBlock(); while (last?.getNextBlock()) last = last.getNextBlock();
      if (last) socket = last.nextConnection;
      socket!.connect(b.previousConnection!);
    }
    return b.id;
  } catch (error) { b.dispose(false); throw error; }
}

export default function ConceptKeyboard({ workspace, types, running, onError }: { workspace: Blockly.WorkspaceSvg | null; types: string[]; running: boolean; onError: (message: string) => void }) {
  const [revision, setRevision] = useState(0), [selected, setSelected] = useState(''), [type, setType] = useState(types[0]), [target, setTarget] = useState('');
  useEffect(() => { if (!types.includes(type)) setType(types[0]); }, [types, type]);
  useEffect(() => {
    if (!workspace) return;
    const change = (event: Blockly.Events.Abstract) => { if (!event.isUiEvent) setRevision(n => n + 1); };
    workspace.addChangeListener(change); return () => workspace.removeChangeListener(change);
  }, [workspace]);
  void revision;
  const blocks = workspace?.getAllBlocks(true).filter(b => b.type !== 'ka_start') ?? [];
  const block = workspace?.getBlockById(selected) ?? blocks[0];
  const fields = block?.inputList.flatMap(input => input.fieldRow).filter(field => field.name) ?? [];
  const sockets = workspace?.getAllBlocks(true).flatMap(b => [...(b.type.startsWith('ka_event_') ? [{ value: `${b.id}:NEXT`, label: `${b.toString().slice(0, 50)} · event script` }] : []), ...b.inputList.filter(input => input.connection).map(input => ({ value: `${b.id}:${input.name}`, label: `${b.toString().slice(0, 50)} · ${input.name}` }))]) ?? [];
  function add() {
    if (!workspace || running) return;
    if (workspace.remainingCapacity() < 1) { onError('The program is at its block limit. Delete an unused block or simplify an expression.'); return; }
    try { setSelected(insertConceptBlock(workspace, type, target)); setTarget(''); } catch (error) { onError(error instanceof Error ? error.message : 'Choose a matching connection.'); }
  }
  return <details className="concept-keyboard"><summary>Build & edit with keyboard</summary>
    <p>Instructions connect below Play or inside DO/ELSE. Number and true/false blocks fill expression inputs. You can also drag blocks on the canvas.</p>
    <div className="concept-keyboard-fields"><label>Block type<select value={type} disabled={running} onChange={e => setType(e.target.value)}>{types.map(t => <option key={t} value={t}>{t.slice(3).replaceAll('_', ' ')}</option>)}</select></label><label>Insert into<select value={target} disabled={running} onChange={e => setTarget(e.target.value)}><option value="">Main program / first matching empty input</option>{sockets.map(socket => <option key={socket.value} value={socket.value}>{socket.label}</option>)}</select></label><button type="button" className="secondary" disabled={running || !workspace} onClick={add}>Add block</button></div>
    {blocks.length > 0 && <><label>Edit block<select value={block?.id ?? ''} disabled={running} onChange={e => setSelected(e.target.value)}>{blocks.map((b, index) => <option key={b.id} value={b.id}>{index + 1}. {b.toString()}</option>)}</select></label><div className="concept-keyboard-fields">{fields.map(field => <label key={`${block!.id}:${field.name}`}>{field.name!.toLowerCase()}{field instanceof Blockly.FieldDropdown ? <select disabled={running} value={String(field.getValue())} onChange={e => field.setValue(e.target.value)}>{field.getOptions(false).map(option => <option key={option[1]} value={option[1]}>{String(option[0])}</option>)}</select> : <input disabled={running} type={field instanceof Blockly.FieldNumber ? 'number' : 'text'} value={String(field.getValue())} maxLength={field.name === 'TEXT' ? 120 : 20} onChange={e => field.setValue(e.target.value)} />}</label>)}<button type="button" className="secondary" disabled={running || !block?.isDeletable()} onClick={() => { block?.unplug(true); block?.dispose(false); setSelected(''); }}>Delete selected block</button></div></>}
  </details>;
}
