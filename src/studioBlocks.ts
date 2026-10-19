import * as Blockly from 'blockly/core';
import type { StudioProject } from './studioProject';
import { isStudioBackground } from './studioProject';
import { defineStudioExtensions, studioExtensionCategories } from './studioBlockExtensions';
const statement = { previousStatement: null, nextStatement: null };
const numeric = (name: string) => ({ type: 'input_value', name, check: 'Number' });
const dropdown = (name: string, options: [string, string][]) => ({ type: 'field_dropdown', name, options });
const contexts = new WeakMap<Blockly.Workspace, { project: StudioProject; spriteId: string }>();
export const setStudioAssetContext = (ws: Blockly.Workspace, project: StudioProject, spriteId: string) => contexts.set(ws, { project, spriteId });
const assetChoices = (project: StudioProject, spriteId: string, type: string): [string, string][] => {
  const sprite = project.sprites.find(s => s.id === spriteId)!;
  const choices = project.assets.filter(a => type === 'ka_studio_costume' ? sprite.costumes.includes(a.id) : isStudioBackground(a)).map(a => [a.name, a.id] as [string, string]);
  // Deserialization validates dropdown values before configureStudioAssets runs.
  // Keep stale IDs visible rather than silently running a different selection.
  const pending: unknown[] = [...((sprite.code.blocks as { blocks?: unknown[] } | undefined)?.blocks ?? [])];
  for (let visited = 0; pending.length && visited < 1000; visited++) {
    const value = pending.pop(); if (!value || typeof value !== 'object') continue;
    const block = value as { type?: string; fields?: { ASSET?: unknown }; next?: { block?: unknown }; inputs?: Record<string, { block?: unknown; shadow?: unknown }> };
    const id = block.fields?.ASSET;
    if (block.type === type && typeof id === 'string' && id !== 'none' && id.length <= 50 && !choices.some(c => c[1] === id)) choices.push(['Missing asset', id]);
    if (block.next?.block) pending.push(block.next.block);
    for (const input of Object.values(block.inputs ?? {})) { if (input?.block) pending.push(input.block); if (input?.shadow) pending.push(input.shadow); }
  }
  return choices.length ? choices : [['choose…', 'none']];
};
const asset = (name: string) => ({ type: 'field_dropdown', name, options: function(this: Blockly.FieldDropdown): [string, string][] {
  const block = this.getSourceBlock(), context = block && contexts.get(block.workspace);
  return context ? assetChoices(context.project, context.spriteId, block!.type) : [['choose…', 'none']];
} });
const spriteChoice = { type: 'field_dropdown', name: 'SPRITE', options: function(this: Blockly.FieldDropdown): [string, string][] {
  const block = this.getSourceBlock(), context = block && contexts.get(block.workspace);
  const choices: [string, string][] = context?.project.sprites.filter(s => s.id !== context.spriteId).map(s => [s.name, s.id]) ?? [];
  const old = this.getValue();
  if (old && old !== 'none' && !choices.some(c => c[1] === old)) choices.push(['Missing sprite', old]);
  return choices.length ? choices : [['choose sprite…', 'none']];
} };
Blockly.common.defineBlocksWithJsonArray([
  { type: 'ka_studio_define', message0: 'define %1 input %2', args0: [{ type: 'field_input', name: 'NAME', text: 'my_function' }, dropdown('PARAM', [['none', 'none'], ['value', 'value']])], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], colour: '#6d4aff', hat: 'cap' },
  { type: 'ka_event_message', message0: 'when I receive %1', args0: [{ type: 'field_input', name: 'MESSAGE', text: 'hello' }], nextStatement: null, colour: '#a16908', hat: 'cap' },
  { type: 'ka_studio_broadcast', message0: 'broadcast %1', args0: [{ type: 'field_input', name: 'MESSAGE', text: 'hello' }], ...statement, colour: '#a16908' },
  { type: 'ka_studio_axis', message0: '%1 %2 by %3', args0: [dropdown('MODE', [['change', 'change'], ['set', 'set']]), dropdown('AXIS', [['x', 'x'], ['y', 'y']]), numeric('VALUE')], ...statement, colour: '#08796e' },
  { type: 'ka_studio_point', message0: 'point in direction %1 degrees', args0: [numeric('VALUE')], ...statement, colour: '#08796e' },
  { type: 'ka_studio_touching', message0: 'touching %1 ?', args0: [spriteChoice], output: 'Boolean', colour: '#08796e' },
  { type: 'ka_studio_other_position', message0: '%1 position of %2', args0: [dropdown('AXIS', [['x', 'x'], ['y', 'y']]), spriteChoice], output: 'Number', colour: '#08796e' },
  { type: 'ka_studio_if', message0: 'if %1', args0: [{ type: 'input_value', name: 'VALUE', check: 'Boolean' }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], ...statement, colour: '#b85a09' },
  { type: 'ka_studio_wait_until', message0: 'wait until %1', args0: [{ type: 'input_value', name: 'VALUE', check: 'Boolean' }], ...statement, colour: '#b85a09' },
  { type: 'ka_studio_stop', message0: 'stop %1', args0: [dropdown('SCOPE', [['this script', 'script'], ['this sprite', 'sprite'], ['all scripts', 'all']])], previousStatement: null, colour: '#b85a09' },
  { type: 'ka_studio_monitor', message0: '%1 counter %2', args0: [dropdown('MODE', [['show', 'show'], ['hide', 'hide']]), { type: 'field_input', name: 'VAR', text: 'score' }], ...statement, colour: '#b53e75' },
  ...[['click', 'when this sprite is clicked'], ['edge', 'when this sprite touches a border'], ['touch', 'when this sprite touches another sprite']].map(([event, label]) => ({ type: `ka_event_${event}`, message0: label, nextStatement: null, colour: '#a16908', hat: 'cap' })),
  { type: 'ka_event_key', message0: 'when %1 key pressed', args0: [dropdown('KEY', [['space', ' '], ['right arrow', 'ArrowRight'], ['left arrow', 'ArrowLeft'], ['up arrow', 'ArrowUp'], ['down arrow', 'ArrowDown']])], nextStatement: null, colour: '#a16908', hat: 'cap' },
  { type: 'ka_studio_size', message0: 'set size to %1 percent', args0: [numeric('VALUE')], ...statement, colour: '#6d4aff' },
  { type: 'ka_studio_costume', message0: 'switch costume to %1', args0: [asset('ASSET')], ...statement, colour: '#6d4aff' },
  { type: 'ka_studio_next_costume', message0: 'next costume', ...statement, colour: '#6d4aff' },
  { type: 'ka_studio_background', message0: 'switch background to %1', args0: [asset('ASSET')], ...statement, colour: '#6d4aff' },
  { type: 'ka_studio_say_for', message0: 'say %1 for %2 seconds', args0: [{ type: 'field_input', name: 'TEXT', text: 'Hello!' }, { type: 'field_number', name: 'SECONDS', value: 1, min: .1, max: 5 }], ...statement, colour: '#6d4aff' },
  { type: 'ka_studio_random', message0: 'pick random %1 to %2', args0: [numeric('A'), numeric('B')], inputsInline: true, output: 'Number', colour: '#08796e' },
  ...[['x', 'x position'], ['y', 'y position'], ['heading', 'direction'], ['size_value', 'size']].map(([type, label]) => ({ type: `ka_studio_${type}`, message0: label, output: 'Number', colour: '#08796e' })),
  { type: 'ka_studio_set_variable', message0: 'set %1 to %2', args0: [{ type: 'field_input', name: 'VAR', text: 'points' }, numeric('VALUE')], ...statement, colour: '#b53e75' },
  { type: 'ka_studio_change_variable', message0: 'change %1 by %2', args0: [{ type: 'field_input', name: 'VAR', text: 'points' }, numeric('VALUE')], ...statement, colour: '#b53e75' },
  { type: 'ka_studio_variable', message0: '%1', args0: [{ type: 'field_input', name: 'VAR', text: 'points' }], output: 'Number', colour: '#b53e75' },
  { type: 'ka_studio_forever', message0: 'forever', message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], ...statement, colour: '#b85a09' },
  { type: 'ka_studio_repeat', message0: 'repeat %1 times', args0: [{ type: 'field_number', name: 'COUNT', value: 10, min: 1, max: 100, precision: 1 }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], ...statement, colour: '#b85a09' },
]);
defineStudioExtensions(ws => contexts.get(ws));
export const studioCategories = [
  { name: 'Events', colour: '#a16908', types: ['ka_event_click', 'ka_event_key', 'ka_event_edge', 'ka_event_touch', 'ka_event_message', 'ka_studio_broadcast'] },
  { name: 'Motion', colour: '#08796e', types: ['ka_sprite_move', 'ka_sprite_turn', 'ka_sprite_goto', 'ka_studio_axis', 'ka_studio_point', 'ka_sprite_bounce', 'ka_studio_x', 'ka_studio_y', 'ka_studio_heading'] },
  { name: 'Looks', colour: '#6d4aff', types: ['ka_sprite_say', 'ka_studio_say_for', 'ka_sprite_say_value', 'ka_studio_costume', 'ka_studio_next_costume', 'ka_studio_size', 'ka_sprite_visible', 'ka_studio_size_value'] },
  { name: 'World', colour: '#6d4aff', types: ['ka_studio_background'] },
  { name: 'Control', colour: '#b85a09', types: ['ka_studio_repeat', 'ka_studio_forever', 'ka_sprite_wait', 'ka_studio_wait_until', 'ka_studio_if', 'ka_logic_if', 'ka_studio_stop'] },
  { name: 'Sensing', colour: '#08796e', types: ['ka_sprite_touching', 'ka_studio_touching', 'ka_studio_other_position'] },
  { name: 'Variables', colour: '#b53e75', types: ['ka_studio_set_variable', 'ka_studio_change_variable', 'ka_studio_variable', 'ka_compute_score', 'ka_score_value', 'ka_studio_monitor'] },
  { name: 'Operators', colour: '#08796e', types: ['ka_number', 'ka_arithmetic', 'ka_studio_random', 'ka_compare', 'ka_boolean_value', 'ka_boolean_join', 'ka_boolean_not'] },
  { name: 'Functions', colour: '#6d4aff', types: ['ka_function_call', 'ka_parameter', 'ka_function_return', 'ka_function_value'] },
  { name: 'Output', colour: '#08796e', types: ['ka_show_number', 'ka_show_boolean'] },
];
for (const [category, types] of Object.entries({
  Events: ['ka_event_at', 'ka_event_every', 'ka_event_answer', 'ka_event_answers', 'ka_event_created'],
  World: ['ka_studio_background_color', 'ka_studio_color', 'ka_studio_random_color', 'ka_studio_title', 'ka_studio_hide_title', 'ka_studio_sound', 'ka_studio_prompt', 'ka_studio_prompt_choices', 'ka_studio_reset_timer'],
  Looks: ['ka_studio_tint', 'ka_studio_clear_tint', 'ka_studio_say_text'],
  Control: ['ka_studio_for', 'ka_studio_chance'], Sensing: ['ka_studio_timer', 'ka_studio_key_down', 'ka_studio_pointer_down', 'ka_studio_pointer_touch', 'ka_studio_costume_is'],
  Variables: ['ka_studio_set_text', 'ka_studio_text_variable', 'ka_studio_monitor_at'], Operators: ['ka_studio_math'], Output: ['ka_studio_print'],
})) studioCategories.find(c => c.name === category)!.types.push(...types);
studioCategories.push(...studioExtensionCategories);
export function configureStudioAssets(ws: Blockly.Workspace, project: StudioProject, spriteId: string) {
  setStudioAssetContext(ws, project, spriteId);
  const sprite = project.sprites.find(s => s.id === spriteId)!;
  for (const block of ws.getBlocksByType('ka_repeat', false)) (block.getField('COUNT') as Blockly.FieldNumber).setConstraints(1, 100, 1);
  for (const block of ws.getAllBlocks(false)) if (block.type === 'ka_studio_touching' || block.type === 'ka_studio_other_position') {
    const field = block.getField('SPRITE') as Blockly.FieldDropdown, previous = String(field.getValue());
    const choices: [string, string][] = project.sprites.filter(s => s.id !== spriteId).map(s => [s.name, s.id]);
    if (previous !== 'none' && !choices.some(c => c[1] === previous)) choices.push(['Missing sprite', previous]);
    field.setOptions(choices.length ? choices : [['choose sprite…', 'none']]); field.setValue(previous === 'none' ? choices[0]?.[1] ?? 'none' : previous);
  }
  for (const block of ws.getAllBlocks(false)) if (block.type === 'ka_studio_costume' || block.type === 'ka_studio_background') {
    const field = block.getField('ASSET') as Blockly.FieldDropdown, previous = String(field.getValue());
    const choices = assetChoices(project, spriteId, block.type);
    if (!choices.length) continue;
    // Keep an invalid old selection visible so the run can explain it, never reinterpret it silently.
    if (previous !== 'none' && !choices.some(c => c[1] === previous)) choices.push(['Missing asset', previous]);
    field.setOptions(choices); field.setValue(previous === 'none' ? block.type === 'ka_studio_costume' ? sprite.costume : project.backdrop : previous);
  }
}
