import * as Blockly from 'blockly/core';
import type { AppProject } from '../shared/appLab';
const projects = new WeakMap<Blockly.Workspace, AppProject>();
export function configureAppBlocks(ws: Blockly.Workspace, project: AppProject) {
  projects.set(ws, project);
  for (const block of ws.getAllBlocks(false)) for (const name of ['ID', 'TABLE']) {
    const field = block.getField(name);
    if (field instanceof Blockly.FieldDropdown) {
      const options = field.getOptions(false);
      if (field.getValue() === 'choose') { const valid = options.find(option => option[1] !== 'choose'); if (valid) field.setValue(valid[1]); }
    }
  }
}
function choices(kind: 'controls' | 'screens' | 'tables') {
  return function (this: Blockly.FieldDropdown): [string, string][] {
    const project = this.getSourceBlock() && projects.get(this.getSourceBlock()!.workspace);
    const ids = project ? kind === 'controls' ? project.elements.map(e => e.id) : kind === 'screens' ? project.screens.map(s => s.id) : project.tables.map(t => t.id) : [];
    const current = this.getValue();
    if (current && !ids.includes(current)) ids.push(current);
    return ids.length ? ids.map(id => [id, id]) : [['Choose an ID', 'choose']];
  };
}
const dropdown = (name: string, options: string[]) => ({ type: 'field_dropdown', name, options: options.map(value => [value, value]) });
const value = (name: string) => ({ type: 'input_value', name });
const statement = (name: string) => ({ type: 'input_statement', name });
const field = (name: string, text: string) => ({ type: 'field_input', name, text });
const action = { previousStatement: null, nextStatement: null };
const control = (kind: 'controls' | 'screens' | 'tables', name = 'ID') => ({ type: 'field_dropdown', name, options: choices(kind) });
Blockly.common.defineBlocksWithJsonArray([
  { type: 'al_start', message0: 'when Run starts', message1: 'do %1', args1: [statement('DO')], colour: '#a16908' },
  { type: 'al_event', message0: 'when %1 %2', args0: [control('controls'), dropdown('EVENT', ['click', 'change'])], message1: 'do %1', args1: [statement('DO')], colour: '#08796e' },
  { type: 'al_set_text', message0: 'set text of %1 to %2', args0: [control('controls'), value('VALUE')], ...action, colour: '#08796e' },
  { type: 'al_screen', message0: 'open screen %1', args0: [control('screens')], ...action, colour: '#08796e' },
  { type: 'al_read', message0: 'read %1 from %2', args0: [dropdown('MODE', ['text', 'number', 'checked']), control('controls')], output: null, colour: '#08796e' },
  { type: 'al_visible', message0: '%1 control %2', args0: [dropdown('MODE', ['show', 'hide']), control('controls')], ...action, colour: '#08796e' },
  { type: 'al_text', message0: 'text %1', args0: [field('TEXT', 'Hello!')], output: null, colour: '#5136ab' },
  { type: 'al_number', message0: '%1', args0: [{ type: 'field_number', name: 'NUM', value: 1, min: -1e6, max: 1e6 }], output: null, colour: '#5136ab' },
  { type: 'al_join', message0: 'join %1 and %2', args0: [value('A'), value('B')], output: null, colour: '#5136ab' },
  { type: 'al_math', message0: '%1 %2 %3', args0: [value('A'), dropdown('OP', ['+', '-', '*', '/']), value('B')], output: null, colour: '#5136ab' },
  { type: 'al_compare', message0: '%1 %2 %3', args0: [value('A'), dropdown('OP', ['=', '!=', '>', '<', 'and', 'or']), value('B')], output: 'Boolean', colour: '#b85a09' },
  { type: 'al_set_var', message0: 'set %1 to %2', args0: [field('NAME', 'score'), value('VALUE')], ...action, colour: '#b53e75' },
  { type: 'al_var', message0: 'value of %1', args0: [field('NAME', 'score')], output: null, colour: '#b53e75' },
  { type: 'al_if', message0: 'if %1', args0: [value('TEST')], message1: 'do %1', args1: [statement('DO')], message2: 'else %1', args2: [statement('ELSE')], ...action, colour: '#b85a09' },
  { type: 'al_repeat', message0: 'repeat %1 times', args0: [value('COUNT')], message1: 'do %1', args1: [statement('DO')], ...action, colour: '#b85a09' },
  { type: 'al_print', message0: 'print %1', args0: [value('VALUE')], ...action, colour: '#b53e75' },
  { type: 'al_rows', message0: 'row count of %1', args0: [control('tables', 'TABLE')], output: 'Number', colour: '#08796e' },
  { type: 'al_cell', message0: 'table %1 row %2 column %3', args0: [control('tables', 'TABLE'), value('ROW'), field('COLUMN', 'name')], output: null, colour: '#08796e' },
  { type: 'al_set_cell', message0: 'set table %1 row %2 column %3 to %4', args0: [control('tables', 'TABLE'), value('ROW'), field('COLUMN', 'name'), value('VALUE')], ...action, colour: '#08796e' },
]);
export const appBlockCategories = [
  { name: 'Events & screens', colour: '#08796e', types: ['al_start', 'al_event', 'al_screen', 'al_set_text', 'al_read', 'al_visible'] },
  { name: 'Text & maths', colour: '#5136ab', types: ['al_text', 'al_number', 'al_join', 'al_math', 'al_compare'] },
  { name: 'Variables & output', colour: '#b53e75', types: ['al_set_var', 'al_var', 'al_print'] },
  { name: 'Decisions & loops', colour: '#b85a09', types: ['al_if', 'al_repeat'] },
  { name: 'Project data', colour: '#08796e', types: ['al_cell', 'al_rows', 'al_set_cell'] },
];
