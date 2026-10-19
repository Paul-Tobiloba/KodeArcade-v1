import * as Blockly from 'blockly/core';
const numberInput = (name: string) => ({ type: 'input_value', name, check: 'Number' });
const boolInput = (name: string) => ({ type: 'input_value', name, check: 'Boolean' });
const statement = { previousStatement: null, nextStatement: null };
const name = { type: 'field_input', name: 'NAME', text: 'my_action' };
Blockly.common.defineBlocksWithJsonArray([
  { type: 'ka_number', message0: '%1', args0: [{ type: 'field_number', name: 'NUM', value: 2, min: -1000, max: 1000 }], output: 'Number', colour: '#08796e' },
  { type: 'ka_score_value', message0: 'score', output: 'Number', colour: '#b53e75' },
  { type: 'ka_arithmetic', message0: '%1 %2 %3', args0: [numberInput('A'), { type: 'field_dropdown', name: 'OP', options: [['+', '+'], ['−', '-'], ['×', '*'], ['÷', '/'], ['remainder', '%']] }, numberInput('B')], inputsInline: true, output: 'Number', colour: '#08796e' },
  { type: 'ka_compute_score', message0: 'set score to %1', args0: [numberInput('VALUE')], ...statement, colour: '#b53e75' },
  { type: 'ka_compare', message0: '%1 %2 %3', args0: [numberInput('A'), { type: 'field_dropdown', name: 'OP', options: [['=', '=='], ['≠', '!='], ['<', '<'], ['>', '>'], ['≤', '<='], ['≥', '>=']] }, numberInput('B')], inputsInline: true, output: 'Boolean', colour: '#b85a09' },
  { type: 'ka_boolean_value', message0: '%1', args0: [{ type: 'field_dropdown', name: 'BOOL', options: [['true', 'True'], ['false', 'False']] }], output: 'Boolean', colour: '#b85a09' },
  { type: 'ka_boolean_join', message0: '%1 %2 %3', args0: [boolInput('A'), { type: 'field_dropdown', name: 'OP', options: [['AND', 'and'], ['OR', 'or']] }, boolInput('B')], inputsInline: true, output: 'Boolean', colour: '#b85a09' },
  { type: 'ka_boolean_not', message0: 'NOT %1', args0: [boolInput('VALUE')], output: 'Boolean', colour: '#b85a09' },
  ...['number', 'boolean'].map(kind => ({ type: `ka_show_${kind}`, message0: `show ${kind} %1`, args0: [kind === 'number' ? numberInput('VALUE') : boolInput('VALUE')], ...statement, colour: '#08796e' })),
  { type: 'ka_logic_if', message0: 'if %1', args0: [boolInput('VALUE')], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], message2: 'else %1', args2: [{ type: 'input_statement', name: 'ELSE' }], ...statement, colour: '#b85a09' },
  { type: 'ka_function_define', message0: 'define %1 input %2', args0: [name, { type: 'field_dropdown', name: 'PARAM', options: [['none', 'none'], ['value', 'value']] }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], ...statement, colour: '#6d4aff', tooltip: 'Define a named group. Its body runs only when you call it. Inputs and returns are introduced in Grades 5–6.' },
  { type: 'ka_function_call', message0: 'call %1 argument %2', args0: [name, numberInput('ARG')], ...statement, colour: '#6d4aff', tooltip: 'Leave argument empty for a function with no input.' },
  { type: 'ka_parameter', message0: 'value (input)', output: 'Number', colour: '#b53e75' },
  { type: 'ka_function_return', message0: 'return %1', args0: [numberInput('VALUE')], ...statement, colour: '#6d4aff' },
  { type: 'ka_function_value', message0: '%1 ( %2 )', args0: [name, numberInput('ARG')], output: 'Number', colour: '#6d4aff' },
]);
export function configureConceptFields(block: Blockly.Block, grade: number) {
  const keep = (name: string, allowed: string[]) => {
    const field = block.getField(name);
    if (!(field instanceof Blockly.FieldDropdown)) return;
    const current = String(field.getValue());
    if (!allowed.includes(current)) return; // Never silently reinterpret an invalid saved value.
    field.setOptions(field.getOptions(false).filter(option => allowed.includes(option[1])));
    field.setValue(current);
  };
  if (block.type === 'ka_arithmetic') keep('OP', ['+', '-', '*', ...(grade >= 4 ? ['/'] : []), ...(grade >= 5 ? ['%'] : [])]);
  if (block.type === 'ka_compare') keep('OP', ['==', '<', '>', ...(grade >= 4 ? ['!=', '<=', '>='] : [])]);
  if (block.type === 'ka_function_define' && grade < 5) keep('PARAM', ['none']);
}
