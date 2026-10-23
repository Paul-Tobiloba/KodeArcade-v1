import type { AppBlock } from '../shared/appLab';

const friendlyPrefixes: Partial<Record<AppBlock['type'], [RegExp, string]>> = {
  al_set_text: [/^setText\(/, 'set text of '], al_set_var: [/^var\s+/, 'make variable '],
  al_screen: [/^setScreen\(/, 'open screen '], al_visible: [/^showElement\(/, 'show element '],
  al_if: [/^if\s*\(/, 'if '], al_repeat: [/^repeat\(/, 'repeat '],
  al_set_cell: [/^setCell\(/, 'set cell '], al_print: [/^console\.log\(/, 'print '],
  al_set_property: [/^setProperty\(/, 'set property of '], al_position: [/^setPosition\(/, 'position '],
  al_size: [/^setSize\(/, 'resize '], al_add_row: [/^addRow\(/, 'add blank row to '], al_delete_row: [/^deleteRow\(/, 'delete row from '],
};

/** Presentation-only sockets. The existing parser still validates every edit. */
export function commandSockets(source: string) {
  return [...source.matchAll(/"(?:\\.|[^"\\])*"|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|\bvar\s+([A-Za-z][A-Za-z0-9_]*)|\b(true|false)\b/gi)].map(match => {
    const name = match[1];
    const text = name ?? match[0];
    const start = match.index! + (name ? match[0].length - name.length : 0);
    return { start, end: start + text.length, kind: name ? 'name' : text.startsWith('"') ? 'text' : match[2] ? 'boolean' : 'number', value: text.startsWith('"') ? JSON.parse(text) as string : text };
  });
}

export function editCommandSockets(source: string, values: string[]) {
  return commandSockets(source).reduceRight((draft, socket, index) => {
    const value = values[index] ?? socket.value;
    return draft.slice(0, socket.start) + (socket.kind === 'text' ? JSON.stringify(value) : value) + draft.slice(socket.end);
  }, source);
}

/** Friendly block labels never become executable source or alter saved code. */
export function commandFragment(type: AppBlock['type'], text: string, index: number, last = false) {
  if (type === 'al_start') return 'when app starts';
  if (type === 'al_event') return last ? '' : index === 0 ? 'when ' : ' triggers ';
  if (index === 0) {
    const prefix = friendlyPrefixes[type];
    if (prefix) text = text.replace(prefix[0], prefix[1]);
    if (type === 'al_set_text') text = text.replace(/^setNumber\(/, 'set number of ');
    if (type === 'al_visible') text = text.replace(/^hideElement\(/, 'hide element ');
  }
  if (type === 'al_set_text' && index === 1) text = text.replace(/^,\s*/, ' to ');
  if (last) {
    if (type === 'al_if') return text.replace(/\)\s*\{$/, '');
    if (type === 'al_repeat') return text.replace(/,\s*function\(\)\s*\{$/, ' times');
    text = text.replace(/\);$/, '').replace(/;$/, '');
  }
  return text;
}
