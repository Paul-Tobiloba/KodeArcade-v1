import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Code2, GripVertical, Plus, Redo2, Trash2, Undo2 } from 'lucide-react';
import type { AppBlock, AppCode, AppProject } from '../shared/appLab';
import { codeText, containers, parseAppCode, stampCodeLines, statementHead } from './appLabCode';
const AppLabTextEditor = lazy(() => import('./AppLabTextEditor'));
import { appCodeIssues } from './appLabDiagnostics';
import { commandFragment, commandSockets, editCommandSockets } from './appLabCodeStyle';
import { appToolboxCategories as categories } from './appLabToolbox';

type Item = { key: string; block: AppBlock; DO: Item[]; ELSE: Item[] };
type Target = { parent: string; branch: 'DO' | 'ELSE'; index: number };
function unpack(code: AppCode): Item[] {
  function list(first?: AppBlock): Item[] {
    const result: Item[] = []; let b = first;
    while (b) { const { next, ...block } = b; result.push({ key: crypto.randomUUID(), block, DO: list(block.inputs?.DO?.block), ELSE: list(block.inputs?.ELSE?.block) }); b = next?.block; }
    return result;
  }
  return (code.blocks?.blocks ?? []).flatMap(list);
}
function pack(items: Item[]): AppCode {
  function list(nodes: Item[]): AppBlock | undefined {
    let first: AppBlock | undefined, last: AppBlock | undefined;
    for (const item of nodes) {
      const b = structuredClone(item.block); delete b.next;
      if (containers.has(b.type)) {
        b.inputs = { ...b.inputs }; delete b.inputs.DO; delete b.inputs.ELSE;
        for (const branch of ['DO', 'ELSE'] as const) { const first = list(item[branch]); if (first) b.inputs[branch] = { block: first }; }
      }
      if (last) last.next = { block: b }; else first = b; last = b;
    }
    return first;
  }
  return stampCodeLines({ blocks: { languageVersion: 0, blocks: items.map(item => list([item])!) } });
}
function colour(b: AppBlock) { return ['al_start', 'al_if', 'al_repeat', 'al_not', 'al_number_fn'].includes(b.type) ? 'control' : ['al_set_var', 'al_var', 'al_text_fn'].includes(b.type) ? 'variable' : ['al_print', 'al_cell', 'al_rows', 'al_set_cell', 'al_add_row', 'al_delete_row'].includes(b.type) ? 'data' : 'ui'; }
function exampleBlock(source: string) {
  const block = parseAppCode(source).blocks!.blocks[0];
  return block.type === 'al_start' && !source.trim().startsWith('onStart') ? block.inputs!.DO!.block! : block;
}
const exampleBlocks = new Map(categories.flatMap(category => [...category.examples]).map(source => [source, exampleBlock(source)]));
function ExampleLabel({ block }: { block: AppBlock }) {
  const source = statementHead(block), sockets = commandSockets(source);
  return <span className="al-example-label">{sockets.map((socket, index) => <span className="al-js-fragment" key={index}>{commandFragment(block.type, source.slice(index ? sockets[index - 1].end : 0, socket.start), index)}<span className="al-example-socket">{socket.value}</span></span>)}<span>{commandFragment(block.type, source.slice(sockets.length ? sockets[sockets.length - 1].end : 0), sockets.length, true)}</span></span>;
}
function CodeLine({ item, disabled, onCommit }: { item: Item; disabled: boolean; onCommit: (block: AppBlock) => boolean }) {
  const original = statementHead(item.block), [draft, setDraft] = useState(original), [error, setError] = useState('');
  const [editingSource, setEditingSource] = useState(false);
  const name = item.block.type.replace('al_', '').replaceAll('_', ' ');
  const sockets = commandSockets(original);
  const [socketValues, setSocketValues] = useState(() => sockets.map(socket => socket.value));
  useEffect(() => { setDraft(original); setSocketValues(commandSockets(original).map(socket => socket.value)); setError(''); }, [original]);
  function commit() {
    if (draft === original) return;
    try {
      const close = containers.has(item.block.type) ? item.block.type === 'al_if' ? '\n}' : '\n});' : '';
      const parsed = parseAppCode(draft + close).blocks?.blocks ?? []; let b = parsed[0];
      if (!containers.has(item.block.type) && b?.type === 'al_start') b = b.inputs?.DO?.block!;
      if (!b || parsed.length !== 1 || b.next || b.type !== item.block.type) throw new Error('Edit arguments here. Use the toolbox or text view to change the command.');
      if (onCommit(b)) { setError(''); setDraft(statementHead(b)); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Check the command.'); }
  }
  const keyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } if (e.key === 'Escape') { setDraft(original); setSocketValues(sockets.map(socket => socket.value)); setError(''); } };
  function changeSocket(index: number, value: string) {
    const next = [...socketValues]; next[index] = value; setSocketValues(next); setDraft(editCommandSockets(original, next));
  }
  return <div className="al-js-line">
    {editingSource ? <input className="al-command-source" aria-label={`Edit ${name} command`} disabled={disabled} spellCheck={false} value={draft} aria-invalid={!!error} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={keyDown} /> : <div className="al-js-syntax">
      {sockets.map((socket, index) => <span className="al-js-fragment" key={index}>{commandFragment(item.block.type, original.slice(index ? sockets[index - 1].end : 0, socket.start), index)}<span className="al-js-socket">{socket.kind === 'boolean'
        ? <select aria-label={`${name} argument ${index + 1}`} disabled={disabled} value={socketValues[index] ?? socket.value} onChange={e => changeSocket(index, e.target.value)} onBlur={commit}><option>true</option><option>false</option></select>
        : <input aria-label={`${name} argument ${index + 1}`} disabled={disabled} spellCheck={false} value={socketValues[index] ?? socket.value} aria-invalid={!!error} style={{ width: `${Math.max(3, Math.min(20, (socketValues[index] ?? socket.value).length + 1.5))}ch` }} onChange={e => changeSocket(index, e.target.value)} onBlur={commit} onKeyDown={keyDown} />}</span></span>)}
      <span className="al-js-fragment">{commandFragment(item.block.type, original.slice(sockets.length ? sockets[sockets.length - 1].end : 0), sockets.length, true)}</span>
    </div>}
    <button type="button" className="al-edit-command" disabled={disabled} aria-label={`Edit ${name} command as text`} aria-pressed={editingSource} onClick={() => setEditingSource(!editingSource)}><Code2 size={15} /></button>
    {error && <small role="alert">{error}</small>}
  </div>;
}
export default function AppLabEditor({ project, running, onChange, onDraft }: { project: AppProject; running: boolean; onChange: (code: AppCode) => boolean; onDraft: (draft: string | undefined, code?: AppCode) => boolean }) {
  const [view, setView] = useState<'blocks' | 'text'>(project.codeDraft === undefined ? 'blocks' : 'text');
  const [items, setItems] = useState(() => unpack(project.code)), [category, setCategory] = useState(0), [message, setMessage] = useState('');
  const [history, setHistory] = useState<Item[][]>([]), [future, setFuture] = useState<Item[][]>([]);
  const [target, setTarget] = useState<Target>({ parent: '', branch: 'DO', index: items.length });
  const [draft, setDraft] = useState(project.codeDraft ?? codeText(project.code));
  const issues = useMemo(() => appCodeIssues(view === 'text' ? draft : codeText(project.code), project), [view, draft, project]);
  const lineNumbers = new Map<string, number>(), closingLines = new Map<string, number>(), elseLines = new Map<string, number>(); let lineNumber = 1;
  function numberLines(list: Item[], top = false) { for (const item of list) {
    const unattached = top && !['al_start', 'al_event'].includes(item.block.type), disabled = item.block.enabled === false || !!item.block.disabledReasons?.length;
    if (unattached) lineNumber++; if (disabled) lineNumber++;
    lineNumbers.set(item.key, lineNumber++);
    if (containers.has(item.block.type)) { numberLines(item.DO); if (item.block.type === 'al_if' && item.ELSE.length) { elseLines.set(item.key, lineNumber++); numberLines(item.ELSE); } closingLines.set(item.key, lineNumber++); }
    if (disabled) lineNumber++; if (unattached) lineNumber++; if (top) lineNumber++;
  } }
  numberLines(items, true);
  function commit(next: Item[]) {
    if (running || !onChange(pack(next))) return false;
    setHistory(h => [...h.slice(-19), items]); setFuture([]); setItems(next); setMessage('Code saved.'); return true;
  }
  function find(list: Item[], key: string): Item | undefined {
    for (const item of list) { if (item.key === key) return item; const nested = find([...item.DO, ...item.ELSE], key); if (nested) return nested; }
  }
  function remove(list: Item[], key: string): boolean { const i = list.findIndex(n => n.key === key); if (i >= 0) { list.splice(i, 1); return true; } return list.some(n => remove(n.DO, key) || remove(n.ELSE, key)); }
  function insert(source: string, at: Target, moving?: string) {
    try {
      const next = structuredClone(items), origin = moving ? find(next, moving) : undefined;
      if (origin && (origin.key === at.parent || find([...origin.DO, ...origin.ELSE], at.parent))) throw new Error('Drop a command outside itself.');
      const host = at.parent ? find(next, at.parent)?.[at.branch] : next;
      if (!host) throw new Error('Choose an insertion point again.');
      const node = origin ?? unpack(parseAppCode(source))[0];
      const action = !source.trim().startsWith('onStart') && !moving && node?.block.type === 'al_start' ? node.DO[0] : node;
      if (!action) throw new Error('Choose a complete command.');
      if (at.parent && ['al_start', 'al_event'].includes(action.block.type)) throw new Error('Put onStart and onEvent at the top level.');
      let index = at.index;
      if (origin) { const oldIndex = host.findIndex(n => n.key === moving); if (oldIndex >= 0 && oldIndex < index) index--; remove(next, moving!); }
      host.splice(index, 0, action);
      if (commit(next)) setTarget({ ...at, index: index + 1 });
    } catch (e) { setMessage(e instanceof Error ? e.message : 'That command could not be added.'); }
  }
  function gap(at: Target, empty: boolean) {
    const selected = target.parent === at.parent && target.branch === at.branch && target.index === at.index;
    return <button type="button" className={`al-code-gap ${empty ? 'al-code-gap-empty' : ''}`} disabled={running} aria-label={`Insert command ${at.parent ? 'in body' : 'at top level'} at ${at.index + 1}`} aria-pressed={selected} onClick={() => setTarget(at)} onDragOver={e => { e.preventDefault(); e.stopPropagation(); }} onDrop={e => { e.preventDefault(); e.stopPropagation(); const moving = e.dataTransfer.getData('application/kodearcade-code-id'); insert(e.dataTransfer.getData('application/kodearcade-command'), at, moving || undefined); }}>{empty ? 'Drop a command here, or select here then choose from the toolbox' : '+'}</button>;
  }
  function lineLabel(line?: number) {
    if (line === undefined) return null;
    const issue = issues.find(issue => issue.line === line);
    return <span className={`al-block-line ${issue ? `al-gutter-${issue.severity}` : ''}`} aria-label={`Line ${line}${issue ? `: ${issue.severity}` : ''}`}><span aria-hidden="true" className="al-gutter-marker">{issue ? '!' : ''}</span>{line}</span>;
  }
  function renderList(list: Item[], parent = '', branch: 'DO' | 'ELSE' = 'DO', depth = 0) {
    return <div className="al-js-list">{gap({ parent, branch, index: 0 }, !list.length)}{list.map((item, index) => <div className="al-js-entry" key={item.key}><div style={{ '--al-depth': depth } as CSSProperties} className={`al-js-block al-js-${colour(item.block)} ${['al_start', 'al_event'].includes(item.block.type) ? 'al-js-hat' : ''} ${containers.has(item.block.type) ? 'al-js-container' : ''} ${item.block.enabled === false || item.block.disabledReasons?.length ? 'al-js-disabled' : ''}`}>
      <div className="al-js-head">{lineLabel(lineNumbers.get(item.key))}<span className="al-code-grip" draggable={!running} onDragStart={e => { e.dataTransfer.setData('application/kodearcade-code-id', item.key); e.dataTransfer.effectAllowed = 'move'; }} title="Drag command"><GripVertical size={17} /></span><CodeLine item={item} disabled={running} onCommit={b => { const next = structuredClone(items), found = find(next, item.key)!, original = found.block; found.block = { ...b, enabled: original.enabled, disabledReasons: original.disabledReasons, inputs: { ...b.inputs, ...(original.inputs?.DO ? { DO: original.inputs.DO } : {}), ...(original.inputs?.ELSE ? { ELSE: original.inputs.ELSE } : {}) } }; return commit(next); }} /><button className="al-insert-command" aria-label="Insert after this command" disabled={running} onClick={() => setTarget({ parent, branch, index: index + 1 })}><Plus size={14} /></button><button className="al-delete-command" aria-label="Delete command" disabled={running} onClick={() => { const next = structuredClone(items); remove(next, item.key); commit(next); }}><Trash2 size={14} /></button></div>
      {issues.filter(issue => issue.line === lineNumbers.get(item.key)).map((issue, index) => <details className={`al-line-issue al-issue-${issue.severity}`} key={index}><summary>{issue.severity === 'error' ? 'Error' : 'Warning'} on line {issue.line}</summary><p>{issue.message}</p></details>)}
      {containers.has(item.block.type) && <><div className="al-js-body">{renderList(item.DO, item.key, 'DO', depth + 1)}</div>{item.block.type === 'al_if' && <><div className="al-js-close al-js-else">{lineLabel(elseLines.get(item.key))}{item.ELSE.length ? '} else {' : 'Else (optional)'}</div><div className="al-js-body">{renderList(item.ELSE, item.key, 'ELSE', depth + 1)}</div></>}<div className="al-js-close">{lineLabel(closingLines.get(item.key))}{item.block.type === 'al_if' ? '}' : '});'}</div></>}
    </div>{gap({ parent, branch, index: index + 1 }, false)}</div>)}</div>;
  }
  function apply() {
    try { const code = parseAppCode(draft); if (onDraft(undefined, code)) { setItems(unpack(code)); setHistory([]); setFuture([]); setDraft(codeText(code)); setMessage('Code applied. Blocks and text now match.'); } }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Check your text code.'); }
  }
  return <section className="al-code" aria-label="App code editor">
    <div className="al-workspace-heading"><h2>Code workspace</h2><div className="al-code-toggle"><button disabled={running || project.codeDraft !== undefined} aria-pressed={view === 'blocks'} onClick={() => setView('blocks')}>Show blocks</button><button disabled={running} aria-pressed={view === 'text'} onClick={() => { setDraft(project.codeDraft ?? codeText(project.code)); setView('text'); }}>Show text</button></div></div>
    <div className="al-js-editor"><aside className="al-code-toolbox"><h3>Toolbox</h3><nav className="al-code-categories" aria-label="App block categories">{categories.map((c, index) => <button key={c.name} aria-pressed={category === index} onClick={() => setCategory(index)}><span className={`al-category-${c.colour}`} />{c.name}</button>)}</nav><p>{view === 'blocks' ? 'Drag into a body, or select an insertion point then tap a command.' : 'Type supported commands. Apply to update blocks and preview.'}</p><div className="al-code-examples">{categories[category].examples.map(source => { const block = exampleBlocks.get(source)!; return <button aria-label={source} className={`al-example al-js-${colour(block)} ${['al_start', 'al_event'].includes(block.type) ? 'al-js-hat' : ''}`} key={source} disabled={running} draggable={view === 'blocks' && !running} onDragStart={e => { e.dataTransfer.setData('application/kodearcade-command', source); e.dataTransfer.effectAllowed = 'copy'; }} onClick={() => { if (view === 'blocks') insert(source, target); else { const next = draft + '\n' + source + '\n'; if (onDraft(next)) setDraft(next); } }}><ExampleLabel block={block} />{containers.has(block.type) && <span className="al-example-body" aria-hidden="true">Drop blocks here</span>}</button>; })}</div><details><summary>Values &amp; syntax</summary><code>getText("input1")<br />getNumber("input1")<br />getChecked("checkbox1")<br />getProperty("label1", "x")<br />upperCase("Hello")<br />textLength("Hello")<br />randomNumber(1, 6)<br />score &gt;= 5<br />!getChecked("checkbox1")</code><p>Text and Math templates assign results to variables. Edit command arguments or use Show text to combine expressions. Use IDs from Design/Data. Properties accept hex colours and sizes inside the screen. Table-row changes last only for this Run. Variables are app-wide; repeats are bounded. Not every JavaScript or browser API is supported.</p></details></aside>
      <div className="al-js-canvas"><div className="al-code-actions"><span>{view === 'blocks' ? 'JavaScript blocks' : 'Editable JavaScript subset'}</span>{view === 'blocks' ? <><button disabled={running || !history.length} aria-label="Undo code change" onClick={() => { const previous = history[history.length - 1]; if (onChange(pack(previous))) { setFuture(f => [...f, items]); setItems(previous); setHistory(h => h.slice(0, -1)); } }}><Undo2 size={17} /></button><button disabled={running || !future.length} aria-label="Redo code change" onClick={() => { const next = future[future.length - 1]; if (onChange(pack(next))) { setHistory(h => [...h, items]); setItems(next); setFuture(f => f.slice(0, -1)); } }}><Redo2 size={17} /></button></> : <><button className="al-primary" disabled={running || project.codeDraft === undefined} onClick={apply}>Apply code</button><button disabled={running || project.codeDraft === undefined} onClick={() => { if (onDraft(undefined)) { setDraft(codeText(project.code)); setMessage('Draft discarded. Last applied program restored.'); } }}>Discard draft</button></>}</div>
      {view === 'blocks' ? <div className="al-js-program"><div className="al-program-sheet"><div className="al-number-gutter" aria-hidden="true" />{renderList(items)}</div></div> : <><Suspense fallback={<p className="al-code-note">Opening text editor…</p>}><AppLabTextEditor value={draft} project={project} disabled={running} onChange={next => { if (onDraft(next)) { setDraft(next); setMessage('Draft saved. Apply before Run or switching to blocks.'); return true; } return false; }} /></Suspense><p className="al-code-note">Apply validates and formats supported commands; comments are not retained in blocks. An unfinished draft is saved separately and never runs. Ctrl+Space opens code suggestions.</p></>}
      {issues.length > 0 && <div className="al-code-issues" aria-label="Code warnings">{issues.slice(0, 12).map((issue, index) => <p key={index} className={`al-issue-${issue.severity}`}><strong>Line {issue.line} · {issue.severity}</strong> {issue.message}</p>)}</div>}
      <p className="al-code-status" role="status">{message || (running ? 'Stop the app to edit code.' : 'Blocks save automatically. Commands outside onStart/onEvent do not run. Run to try your app.')}</p></div>
    </div>
  </section>;
}
