import { parse, type Node } from 'acorn';
import { readAppGallery, type AppBlock, type AppCode } from '../shared/appLab';
import { connected, literal } from './appLabStarters';
import { appNumberFunctions, appPropertyFields, appTextFunctions } from '../shared/appLabApi';

// These fields are read only after the corresponding ESTree type check.
type Syntax = Node & {
  name: string; value: string | number | boolean; callee: Syntax; computed: boolean;
  object: Syntax; property: Syntax; arguments: Syntax[]; async: boolean; generator: boolean;
  id: Syntax | null; params: Syntax[]; body: Syntax & Syntax[]; argument: Syntax;
  operator: string; left: Syntax; right: Syntax; kind: string; declarations: { id: Syntax; init: Syntax | null }[];
  consequent: Syntax; alternate: Syntax | null; test: Syntax; expression: Syntax;
};
const quote = (value: unknown) => JSON.stringify(String(value ?? ''));
const child = (b: AppBlock, key: string) => b.inputs?.[key]?.block ?? b.inputs?.[key]?.shadow;
export function expressionText(b?: AppBlock): string {
  if (!b) return 'missingValue()';
  const f = b.fields ?? {}, v = (key: string) => expressionText(child(b, key));
  switch (b.type) {
    case 'al_text': return quote(f.TEXT);
    case 'al_number': return String(f.NUM ?? 0);
    case 'al_boolean': return typeof f.BOOL === 'boolean' ? String(f.BOOL) : 'invalidValue()';
    case 'al_var': return /^[A-Za-z][A-Za-z0-9_]*$/.test(String(f.NAME)) && !reserved.has(String(f.NAME)) ? String(f.NAME) : `getVariable(${quote(f.NAME)})`;
    case 'al_read': return `${f.MODE === 'number' ? 'getNumber' : f.MODE === 'checked' ? 'getChecked' : 'getText'}(${quote(f.ID)})`;
    case 'al_join': return `joinText(${v('A')}, ${v('B')})`;
    case 'al_math': return `(${v('A')} ${f.OP} ${v('B')})`;
    case 'al_compare': return `(${v('A')} ${{ '=': '===', '!=': '!==', and: '&&', or: '||' }[String(f.OP)] ?? f.OP} ${v('B')})`;
    case 'al_cell': return `getCell(${quote(f.TABLE)}, ${v('ROW')}, ${quote(f.COLUMN)})`;
    case 'al_rows': return `getRowCount(${quote(f.TABLE)})`;
    case 'al_property': return `getProperty(${quote(f.ID)}, ${quote(f.PROPERTY)})`;
    case 'al_not': return `(!${v('VALUE')})`;
    case 'al_number_fn': case 'al_text_fn': {
      const functions: Readonly<Record<string, number>> = b.type === 'al_number_fn' ? appNumberFunctions : appTextFunctions;
      const fn = String(f.FN);
      if (!Object.hasOwn(functions, fn)) return 'invalidValue()';
      const count = functions[fn];
      return `${fn}(${['A', 'B', 'C'].slice(0, count).map(v).join(', ')})`;
    }
    default: return 'invalidValue()';
  }
}
export function statementHead(b: AppBlock): string {
  const f = b.fields ?? {}, v = (key: string) => expressionText(child(b, key));
  switch (b.type) {
    case 'al_start': return 'onStart(function() {';
    case 'al_event': return `onEvent(${quote(f.ID)}, ${quote(f.EVENT)}, function() {`;
    case 'al_set_text': return `${f.MODE === 'number' ? 'setNumber' : 'setText'}(${quote(f.ID)}, ${v('VALUE')});`;
    case 'al_screen': return `setScreen(${quote(f.ID)});`;
    case 'al_visible': return `${f.MODE === 'hide' ? 'hideElement' : 'showElement'}(${quote(f.ID)});`;
    case 'al_set_var': return /^[A-Za-z][A-Za-z0-9_]*$/.test(String(f.NAME)) && !reserved.has(String(f.NAME)) ? `var ${f.NAME} = ${v('VALUE')};` : `setVariable(${quote(f.NAME)}, ${v('VALUE')});`;
    case 'al_print': return `console.log(${v('VALUE')});`;
    case 'al_if': return `if (${v('TEST')}) {`;
    case 'al_repeat': return `repeat(${v('COUNT')}, function() {`;
    case 'al_set_cell': return `setCell(${quote(f.TABLE)}, ${v('ROW')}, ${quote(f.COLUMN)}, ${v('VALUE')});`;
    case 'al_set_property': return `setProperty(${quote(f.ID)}, ${quote(f.PROPERTY)}, ${v('VALUE')});`;
    case 'al_position': return `setPosition(${quote(f.ID)}, ${v('X')}, ${v('Y')});`;
    case 'al_size': return `setSize(${quote(f.ID)}, ${v('WIDTH')}, ${v('HEIGHT')});`;
    case 'al_add_row': return `addRow(${quote(f.TABLE)});`;
    case 'al_delete_row': return `deleteRow(${quote(f.TABLE)}, ${v('ROW')});`;
    default: return `unattached(${expressionText(b)});`;
  }
}
export const containers = new Set(['al_start', 'al_event', 'al_if', 'al_repeat']);
export function blockText(b: AppBlock, indent = ''): string {
  let text = indent + statementHead(b);
  if (containers.has(b.type)) {
    text += '\n' + chainText(child(b, 'DO'), indent + '  ');
    if (b.type === 'al_if' && child(b, 'ELSE')) text += `${indent}} else {\n${chainText(child(b, 'ELSE'), indent + '  ')}`;
    text += indent + (b.type === 'al_if' ? '}' : '});');
  }
  if (b.enabled === false || b.disabledReasons?.length) text = `${indent}disabled(function() {\n${text.split('\n').map(line => '  ' + line).join('\n')}\n${indent}});`;
  return text;
}
function chainText(first?: AppBlock, indent = ''): string {
  let result = '', b = first;
  while (b) { result += blockText(b, indent) + '\n'; b = b.next?.block; }
  return result;
}
export function codeText(code: AppCode): string {
  return (code.blocks?.blocks ?? []).map(b => ['al_start', 'al_event'].includes(b.type) ? blockText(b) : `unattached(function() {\n${chainText(b, '  ')}});`).join('\n\n') + '\n';
}
export function stampCodeLines(code: AppCode): AppCode {
  const next = structuredClone(code); let line = 1;
  const expressions = (b: AppBlock, at: number) => { b.data = `line:${at}`; Object.entries(b.inputs ?? {}).forEach(([key, connection]) => { if (key === 'DO' || key === 'ELSE') return; const child = connection.block ?? connection.shadow; if (child) expressions(child, at); }); };
  const chain = (first?: AppBlock) => {
    let b = first;
    while (b) {
      const disabled = b.enabled === false || !!b.disabledReasons?.length;
      if (disabled) line++;
      expressions(b, line++);
      if (containers.has(b.type)) { chain(child(b, 'DO')); if (b.type === 'al_if' && child(b, 'ELSE')) { line++; chain(child(b, 'ELSE')); } line++; }
      if (disabled) line++;
      b = b.next?.block;
    }
  };
  for (const b of next.blocks?.blocks ?? []) { const unattached = !['al_start', 'al_event'].includes(b.type); if (unattached) line++; chain(b); if (unattached) line++; line++; }
  return next;
}
const reserved = new Set(['var', 'let', 'const', 'if', 'else', 'for', 'while', 'function', 'return', 'true', 'false', 'null', 'new', 'this', 'class', 'delete', 'throw', 'try', 'catch', 'switch', 'case', 'default', 'break', 'continue', 'in', 'instanceof', 'typeof', 'void', 'with', 'do', 'debugger', 'import', 'export', 'extends', 'super', 'yield', 'await', 'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static']);
function fail(n: Syntax, message: string): never { throw new Error(`Line ${n.loc?.start.line ?? 1}: ${message}`); }
function name(n: Syntax): string {
  if (n.type !== 'Identifier' || !/^[A-Za-z][A-Za-z0-9_]{0,29}$/.test(n.name)) fail(n, 'Use a name starting with a letter, up to 30 letters, numbers or underscores.');
  return n.name;
}
function string(n: Syntax): string {
  if (!n || n.type !== 'Literal' || typeof n.value !== 'string' || n.value.length > 300) fail(n, 'Use a quoted ID or text of up to 300 characters.');
  return n.value;
}
function callName(n: Syntax): string {
  if (n.callee.type === 'Identifier') return n.callee.name;
  if (n.callee.type === 'MemberExpression' && !n.callee.computed && n.callee.object.name === 'console' && n.callee.property.name === 'log') return 'console.log';
  return fail(n, 'Use a supported App Lab command, not a property or method call.');
}
function args(n: Syntax, count: number): Syntax[] { if (n.arguments.length !== count || n.arguments.some((a: Syntax) => a.type === 'SpreadElement')) fail(n, `This command needs ${count} argument${count === 1 ? '' : 's'}.`); return n.arguments; }
function callback(n: Syntax): Syntax[] {
  if (n.type !== 'FunctionExpression' || n.async || n.generator || n.id || n.params.length || n.body.type !== 'BlockStatement') fail(n, 'Use function() { ... } without parameters here.');
  return n.body.body;
}
function value(n: Syntax): AppBlock { return { ...readValue(n), data: `line:${n.loc?.start.line ?? 1}` }; }
function readValue(n: Syntax): AppBlock {
  if (n.type === 'Literal' && typeof n.value === 'string' && n.value.length <= 300) return literal(n.value);
  if (n.type === 'Literal' && typeof n.value === 'number' && Number.isFinite(n.value) && Math.abs(n.value) <= 1e6) return literal(n.value);
  if (n.type === 'Literal' && typeof n.value === 'boolean') return { type: 'al_boolean', fields: { BOOL: n.value } };
  if (n.type === 'Identifier') return { type: 'al_var', fields: { NAME: name(n) } };
  if (n.type === 'UnaryExpression' && n.operator === '-' && n.argument.type === 'Literal' && typeof n.argument.value === 'number' && Math.abs(n.argument.value) <= 1e6) return literal(-n.argument.value);
  if (n.type === 'UnaryExpression' && n.operator === '!') return { type: 'al_not', inputs: { VALUE: connected(value(n.argument)) } };
  if (n.type === 'BinaryExpression' || n.type === 'LogicalExpression') {
    const operators: Record<string, string> = { '===': '=', '!==': '!=', '==': '=', '!=': '!=', '>': '>', '<': '<', '>=': '>=', '<=': '<=', '&&': 'and', '||': 'or' };
    if (!['+', '-', '*', '/', '%', ...Object.keys(operators)].includes(n.operator)) fail(n, 'Use supported arithmetic, comparison or Boolean operators.');
    const a = value(n.left), b = value(n.right), comparison = operators[n.operator];
    const isText = (x: AppBlock) => x.type === 'al_text' || x.type === 'al_join' || (x.type === 'al_read' && x.fields?.MODE === 'text');
    return { type: comparison ? 'al_compare' : n.operator === '+' && (isText(a) || isText(b)) ? 'al_join' : 'al_math', fields: comparison ? { OP: comparison } : { OP: n.operator }, inputs: { A: connected(a), B: connected(b) } };
  }
  if (n.type === 'CallExpression') {
    const command = callName(n);
    if (command === 'getProperty') { const [id, property] = args(n, 2); return { type: 'al_property', fields: { ID: string(id), PROPERTY: propertyName(property) } }; }
    if (Object.hasOwn(appNumberFunctions, command) || Object.hasOwn(appTextFunctions, command)) {
      const numeric = Object.hasOwn(appNumberFunctions, command), functions: Readonly<Record<string, number>> = numeric ? appNumberFunctions : appTextFunctions;
      const count = functions[command];
      return { type: numeric ? 'al_number_fn' : 'al_text_fn', fields: { FN: command }, inputs: Object.fromEntries(args(n, count).map((arg, index) => [['A', 'B', 'C'][index], connected(value(arg))])) };
    }
    if (['getText', 'getNumber', 'getChecked'].includes(command)) { const [id] = args(n, 1); return { type: 'al_read', fields: { ID: string(id), MODE: command === 'getText' ? 'text' : command === 'getNumber' ? 'number' : 'checked' } }; }
    if (command === 'getVariable') { const [id] = args(n, 1); return { type: 'al_var', fields: { NAME: string(id) } }; }
    if (command === 'joinText') { const [a, b] = args(n, 2); return { type: 'al_join', inputs: { A: connected(value(a)), B: connected(value(b)) } }; }
    if (command === 'getRowCount') { const [table] = args(n, 1); return { type: 'al_rows', fields: { TABLE: string(table) } }; }
    if (command === 'getCell') { const [table, row, column] = args(n, 3); return { type: 'al_cell', fields: { TABLE: string(table), COLUMN: string(column) }, inputs: { ROW: connected(value(row)) } }; }
  }
  return fail(n, 'Use a supported value: text, a number, a variable, a calculation or an App Lab read command.');
}
function chain(nodes: Syntax[]): AppBlock | undefined {
  let first: AppBlock | undefined, last: AppBlock | undefined;
  for (const node of nodes) {
    if (node.type === 'EmptyStatement') continue;
    const b = statement(node);
    if (last) last.next = { block: b }; else first = b;
    last = b;
  }
  return first;
}
function body(n: Syntax) { return chain(n.type === 'BlockStatement' ? n.body : [n]); }
function statement(n: Syntax): AppBlock { return { ...readStatement(n), data: `line:${n.loc?.start.line ?? 1}` }; }
function propertyName(n: Syntax) {
  const property = string(n);
  if (!Object.hasOwn(appPropertyFields, property)) fail(n, 'Choose a supported control property, such as text, background-color, x or width.');
  return property;
}
function readStatement(n: Syntax): AppBlock {
  if (n.type === 'VariableDeclaration') {
    if (n.kind === 'const' || n.declarations.length !== 1 || !n.declarations[0].init) fail(n, 'Declare one initialized var or let at a time. Variables are app-wide in App Lab.');
    const d = n.declarations[0]; return { type: 'al_set_var', fields: { NAME: name(d.id) }, inputs: { VALUE: connected(value(d.init!)) } };
  }
  if (n.type === 'IfStatement') {
    const yes = body(n.consequent), no = n.alternate ? body(n.alternate) : undefined;
    return { type: 'al_if', inputs: { TEST: connected(value(n.test)), ...(yes ? { DO: connected(yes) } : {}), ...(no ? { ELSE: connected(no) } : {}) } };
  }
  if (n.type !== 'ExpressionStatement') return fail(n, 'Use App Lab commands, variables, if/else and repeat(count, function() { ... }).');
  const exp = n.expression;
  if (exp.type === 'AssignmentExpression' && exp.operator === '=') return { type: 'al_set_var', fields: { NAME: name(exp.left) }, inputs: { VALUE: connected(value(exp.right)) } };
  if (exp.type !== 'CallExpression') return fail(n, 'Use a supported App Lab action here.');
  const command = callName(exp);
  if (['setText', 'setNumber', 'setVariable'].includes(command)) { const [id, v] = args(exp, 2); return { type: command === 'setVariable' ? 'al_set_var' : 'al_set_text', fields: { [command === 'setVariable' ? 'NAME' : 'ID']: string(id), ...(command === 'setNumber' ? { MODE: 'number' } : {}) }, inputs: { VALUE: connected(value(v)) } }; }
  if (command === 'setProperty') { const [id, property, v] = args(exp, 3); return { type: 'al_set_property', fields: { ID: string(id), PROPERTY: propertyName(property) }, inputs: { VALUE: connected(value(v)) } }; }
  if (command === 'setChecked') { const [id, checked] = args(exp, 2); return { type: 'al_set_property', fields: { ID: string(id), PROPERTY: 'checked' }, inputs: { VALUE: connected(value(checked)) } }; }
  if (command === 'setPosition' || command === 'setSize') {
    const [id, a, b] = args(exp, 3), position = command === 'setPosition';
    return { type: position ? 'al_position' : 'al_size', fields: { ID: string(id) }, inputs: { [position ? 'X' : 'WIDTH']: connected(value(a)), [position ? 'Y' : 'HEIGHT']: connected(value(b)) } };
  }
  if (command === 'addRow') { const [table] = args(exp, 1); return { type: 'al_add_row', fields: { TABLE: string(table) } }; }
  if (command === 'deleteRow') { const [table, row] = args(exp, 2); return { type: 'al_delete_row', fields: { TABLE: string(table) }, inputs: { ROW: connected(value(row)) } }; }
  if (['setScreen', 'showElement', 'hideElement'].includes(command)) { const [id] = args(exp, 1); return { type: command === 'setScreen' ? 'al_screen' : 'al_visible', fields: { ID: string(id), ...(command === 'setScreen' ? {} : { MODE: command === 'hideElement' ? 'hide' : 'show' }) } }; }
  if (command === 'console.log') { const [v] = args(exp, 1); return { type: 'al_print', inputs: { VALUE: connected(value(v)) } }; }
  if (command === 'repeat') { const [count, fn] = args(exp, 2), actions = chain(callback(fn)); return { type: 'al_repeat', inputs: { COUNT: connected(value(count)), ...(actions ? { DO: connected(actions) } : {}) } }; }
  if (command === 'setCell') { const [table, row, column, v] = args(exp, 4); return { type: 'al_set_cell', fields: { TABLE: string(table), COLUMN: string(column) }, inputs: { ROW: connected(value(row)), VALUE: connected(value(v)) } }; }
  if (command === 'unattached') { const [v] = args(exp, 1); if (v.type !== 'FunctionExpression') return value(v); return chain(callback(v)) ?? fail(n, 'An unattached group needs a value or action.'); }
  if (command === 'disabled') { const [fn] = args(exp, 1), items = callback(fn); if (items.length !== 1) fail(n, 'Disable one command or event at a time.'); const b = root(items[0]); return { ...b, enabled: false }; }
  return fail(n, `“${command}” is not supported. Choose a command from the toolbox. No browser or network APIs run here.`);
}
function root(n: Syntax): AppBlock {
  if (n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression') {
    const exp = n.expression, command = callName(exp);
    if (command === 'onStart' || command === 'onEvent') {
      const a = args(exp, command === 'onStart' ? 1 : 3), first = chain(callback(a[a.length - 1]));
      if (command === 'onEvent' && !['click', 'change'].includes(string(a[1]))) fail(n, 'Choose a click or change event.');
      return { type: command === 'onStart' ? 'al_start' : 'al_event', data: `line:${n.loc?.start.line ?? 1}`, ...(command === 'onEvent' ? { fields: { ID: string(a[0]), EVENT: string(a[1]) } } : {}), ...(first ? { inputs: { DO: connected(first) } } : {}) };
    }
  }
  return statement(n);
}
export function parseAppCode(source: string): AppCode {
  if (source.length > 20000) throw new Error('Keep text code under 20,000 characters.');
  const ast = parse(source, { ecmaVersion: 2020, locations: true });
  let count = 0;
  const guard = (node: unknown, depth: number) => { if (++count > 12000 || depth > 80) throw new Error('This program is too deeply nested or too large.'); if (node && typeof node === 'object') Object.values(node).forEach(v => guard(v, depth + 1)); };
  guard(ast, 0);
  const roots: AppBlock[] = [], starts: Syntax[] = [];
  for (const n of ast.body as Syntax[]) {
    if (n.type === 'EmptyStatement') continue;
    const b = root(n);
    const explicit = n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' && ['onStart', 'onEvent', 'unattached', 'disabled'].includes(callName(n.expression));
    if (explicit) { if (starts.length) { const first = chain(starts.splice(0)); roots.push({ type: 'al_start', inputs: first ? { DO: connected(first) } : {} }); } roots.push(b); }
    else starts.push(n);
  }
  if (starts.length) roots.push({ type: 'al_start', inputs: { DO: connected(chain(starts)!) } });
  const code: AppCode = { blocks: { languageVersion: 0, blocks: roots } };
  readAppGallery({ version: 1, activeId: '00000000-0000-4000-8000-000000000000', projects: [{ id: '00000000-0000-4000-8000-000000000000', title: 'Validation', screens: [{ id: 'home', background: '#ffffff' }], initialScreen: 'home', elements: [], tables: [], code }] });
  return code;
}
