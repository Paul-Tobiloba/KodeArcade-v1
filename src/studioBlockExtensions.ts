import * as Blockly from 'blockly/core';
import { isStudioBackground, type StudioProject } from './studioProject';

type Context = { project: StudioProject; spriteId: string };
const action = { previousStatement: null, nextStatement: null };
const value = (name: string, check?: string | string[]) => ({ type: 'input_value', name, ...(check ? { check } : {}) });
const field = (name: string, text: string) => ({ type: 'field_input', name, text });
const choice = (name: string, options: string[]) => ({ type: 'field_dropdown', name, options: options.map(s => [s === ' ' ? 'space' : s.replace(/^Arrow(.+)$/, '$1 arrow').replaceAll('_', ' '), s]) });
const body = { message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }] };
const name = () => field('VAR', 'answer');
export const studioBehaviorNames = ['moving_east', 'moving_west', 'moving_north', 'moving_south', 'looping_east', 'looping_west', 'looping_north', 'looping_south', 'arrow_moving', 'arrow_driving', 'spinning_left', 'spinning_right', 'growing', 'shrinking', 'jittering', 'fluttering', 'wandering', 'wobbling', 'patrolling', 'swimming'];

export function defineStudioExtensions(context: (ws: Blockly.Workspace) => Context | undefined) {
  const retainMissing = (data: Context | null | undefined, field: 'ASSET' | 'SPRITE', choices: [string,string][]) => {
    const roots = (data?.project.sprites.find(s => s.id === data.spriteId)?.code.blocks as { blocks?: unknown[] } | undefined)?.blocks;
    const pending: unknown[] = [...roots ?? []];
    for (let count = 0; pending.length && count < 2000; count++) {
      const value = pending.pop(); if (!value || typeof value !== 'object') continue;
      const node = value as { fields?: Record<string,unknown>; inputs?: Record<string,{ block?: unknown; shadow?: unknown }>; next?: { block?: unknown } };
      const id = node.fields?.[field]; if (typeof id === 'string' && id.length <= 50 && !choices.some(c => c[1] === id)) choices.push([field === 'ASSET' ? 'Missing costume' : 'Missing sprite', id]);
      if (node.next?.block) pending.push(node.next.block);
      for (const input of Object.values(node.inputs ?? {})) { if (input?.block) pending.push(input.block); if (input?.shadow) pending.push(input.shadow); }
    }
  };
  const assets = { type: 'field_dropdown', name: 'ASSET', options: function(this: Blockly.FieldDropdown): [string, string][] {
    const block = this.getSourceBlock(), data = block && context(block.workspace);
    const choices: [string, string][] = [['current costume', 'current'], ...(data?.project.assets.filter(a => !isStudioBackground(a)).map(a => [a.name, a.id] as [string, string]) ?? [])];
    retainMissing(data, 'ASSET', choices);
    const old = this.getValue(); if (old && !choices.some(c => c[1] === old)) choices.push(['Missing costume', old]);
    return choices;
  } };
  const sprites = { type: 'field_dropdown', name: 'SPRITE', options: function(this: Blockly.FieldDropdown): [string, string][] {
    const block = this.getSourceBlock(), data = block && context(block.workspace);
    const choices: [string, string][] = [['this sprite', 'this'], ['all sprites', 'all'], ...(data?.project.sprites.map(s => [s.name, s.id] as [string, string]) ?? [])];
    retainMissing(data, 'SPRITE', choices);
    const old = this.getValue(); if (old && !choices.some(c => c[1] === old)) choices.push(['Missing sprite', old]);
    return choices;
  } };
  Blockly.common.defineBlocksWithJsonArray([
    { type: 'ka_studio_text', message0: 'text %1', args0: [field('TEXT', 'Hello!')], output: 'String', colour: '#08796e' },
    { type: 'ka_studio_join', message0: 'join %1 and %2', args0: [value('A'), value('B')], output: 'String', colour: '#08796e' },
    { type: 'ka_studio_set_text', message0: 'set text %1 to %2', args0: [name(), value('VALUE')], ...action, colour: '#b53e75' },
    { type: 'ka_studio_text_variable', message0: 'text variable %1', args0: [name()], output: 'String', colour: '#b53e75' },
    { type: 'ka_studio_text_compare', message0: '%1 %2 %3', args0: [value('A'), choice('OP', ['equals', 'contains']), value('B')], output: 'Boolean', colour: '#08796e' },
    { type: 'ka_studio_say_text', message0: 'say text %1', args0: [value('VALUE')], ...action, colour: '#6d4aff' },
    { type: 'ka_studio_print', message0: 'print %1 at %2', args0: [value('VALUE'), value('LOCATION', 'Location')], ...action, colour: '#08796e' },
    { type: 'ka_studio_prompt', message0: 'ask %1 save answer in %2', args0: [value('QUESTION'), name()], ...action, colour: '#08796e' },
    { type: 'ka_studio_prompt_choices', message0: 'ask %1 save answer in %2', args0: [value('QUESTION'), name()], message1: 'choices %1 %2 %3', args1: [field('CHOICE1', 'Red'), field('CHOICE2', 'Blue'), field('CHOICE3', 'Green')], ...action, colour: '#08796e' },
    { type: 'ka_event_answer', message0: 'when %1 is answered', args0: [name()], nextStatement: null, hat: 'cap', colour: '#a16908' },
    { type: 'ka_event_answers', message0: 'when all questions are answered', nextStatement: null, hat: 'cap', colour: '#a16908' },
    { type: 'ka_studio_timer', message0: 'time in %1', args0: [choice('UNIT', ['seconds', 'milliseconds'])], output: 'Number', colour: '#08796e' },
    { type: 'ka_studio_reset_timer', message0: 'reset timer', ...action, colour: '#6d4aff' },
    ...['at', 'every'].map(event => ({ type: `ka_event_${event}`, message0: `${event === 'at' ? 'at' : 'repeat every'} %1 seconds`, args0: [{ type: 'field_number', name: 'SECONDS', value: 1, min: .1, max: 3600 }], nextStatement: null, hat: 'cap', colour: '#a16908' })),
    { type: 'ka_event_created', message0: 'when this sprite is created', nextStatement: null, hat: 'cap', colour: '#a16908' },
    { type: 'ka_studio_key_down', message0: '%1 key is held?', args0: [choice('KEY', ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' '])], output: 'Boolean', colour: '#08796e' },
    { type: 'ka_studio_pointer_down', message0: 'pointer is pressed?', output: 'Boolean', colour: '#08796e' },
    { type: 'ka_studio_pointer_touch', message0: 'this sprite touches pointer?', output: 'Boolean', colour: '#08796e' },
    { type: 'ka_studio_location', message0: 'location x %1 y %2', args0: [value('X', 'Number'), value('Y', 'Number')], output: 'Location', colour: '#a16908' },
    { type: 'ka_studio_random_location', message0: 'random location', output: 'Location', colour: '#a16908' },
    { type: 'ka_studio_pointer_location', message0: 'pointer location', output: 'Location', colour: '#a16908' },
    { type: 'ka_studio_sprite_location', message0: 'location of %1', args0: [sprites], output: 'Location', colour: '#a16908' },
    { type: 'ka_studio_location_offset', message0: '%1 steps %2 of %3', args0: [value('VALUE', 'Number'), choice('DIRECTION', ['north', 'east', 'south', 'west']), value('LOCATION', 'Location')], output: 'Location', colour: '#a16908' },
    { type: 'ka_studio_location_axis', message0: '%1 of %2', args0: [choice('AXIS', ['x', 'y']), value('LOCATION', 'Location')], output: 'Number', colour: '#a16908' },
    { type: 'ka_studio_goto_location', message0: 'jump to %1', args0: [value('LOCATION', 'Location')], ...action, colour: '#08796e' },
    { type: 'ka_studio_sprite_ref', message0: '%1', args0: [sprites], output: 'Sprites', colour: '#b53e75' },
    { type: 'ka_studio_costume_group', message0: 'sprites with costume %1', args0: [assets], output: 'Sprites', colour: '#b53e75' },
    { type: 'ka_studio_sprite_count', message0: 'number of %1', args0: [value('TARGET', 'Sprites')], output: 'Number', colour: '#08796e' },
    { type: 'ka_studio_last_created', message0: 'last created sprites', output: 'Sprites', colour: '#b53e75' },
    { type: 'ka_studio_group_touching', message0: 'touching any of %1 ?', args0: [value('TARGET', 'Sprites')], output: 'Boolean', colour: '#08796e' },
    { type: 'ka_studio_for_sprites', message0: 'for each sprite in %1', args0: [value('TARGET', 'Sprites')], ...body, ...action, colour: '#b85a09' },
    { type: 'ka_studio_remove', message0: 'remove %1', args0: [value('TARGET', 'Sprites')], ...action, colour: '#b53e75' },
    { type: 'ka_studio_spawn', message0: 'make %1 new sprites from %2', args0: [value('COUNT', 'Number'), sprites], message1: 'named %1 costume %2 at %3', args1: [field('NAME', 'New sprite'), assets, value('LOCATION', 'Location')], ...action, colour: '#b53e75' },
    { type: 'ka_studio_costume_is', message0: 'costume is %1 ?', args0: [assets], output: 'Boolean', colour: '#08796e' },
    { type: 'ka_studio_tint', message0: 'tint this sprite %1', args0: [value('COLOR', 'String')], ...action, colour: '#6d4aff' },
    { type: 'ka_studio_clear_tint', message0: 'remove sprite tint', ...action, colour: '#6d4aff' },
    { type: 'ka_studio_color', message0: 'color %1', args0: [field('COLOR', '#6d4aff')], output: 'String', colour: '#6d4aff' },
    { type: 'ka_studio_random_color', message0: 'random color', output: 'String', colour: '#6d4aff' },
    { type: 'ka_studio_background_color', message0: 'set background color %1', args0: [value('COLOR', 'String')], ...action, colour: '#6d4aff' },
    { type: 'ka_studio_title', message0: 'show title %1 subtitle %2', args0: [value('TITLE'), value('SUBTITLE')], ...action, colour: '#6d4aff' },
    { type: 'ka_studio_hide_title', message0: 'hide title screen', ...action, colour: '#6d4aff' },
    { type: 'ka_studio_sound', message0: 'play sound %1', args0: [choice('SOUND', ['ping', 'jump', 'cheer', 'oops'])], ...action, colour: '#6d4aff' },
    { type: 'ka_studio_for', message0: 'count %1 from %2 to %3 by %4', args0: [field('VAR', 'counter'), value('FROM', 'Number'), value('TO', 'Number'), value('BY', 'Number')], ...body, ...action, colour: '#b85a09' },
    { type: 'ka_studio_chance', message0: 'if %1 percent chance', args0: [value('VALUE', 'Number')], ...body, ...action, colour: '#b85a09' },
    { type: 'ka_studio_math', message0: '%1 of %2', args0: [choice('OP', ['round', 'floor', 'ceiling', 'square_root', 'absolute']), value('VALUE', 'Number')], output: 'Number', colour: '#08796e' },
    { type: 'ka_studio_monitor_at', message0: 'show counter %1 at %2', args0: [field('VAR', 'score'), value('LOCATION', 'Location')], ...action, colour: '#b53e75' },
    { type: 'ka_studio_behavior', message0: '%1 behavior %2', args0: [choice('MODE', ['start', 'stop']), field('NAME', '@moving_east')], ...action, colour: '#6d4aff' },
    { type: 'ka_studio_stop_behaviors', message0: 'stop all behaviors for this sprite', ...action, colour: '#6d4aff' },
    { type: 'ka_studio_draggable', message0: '%1 being draggable', args0: [choice('MODE', ['start', 'stop'])], ...action, colour: '#6d4aff' },
    { type: 'ka_studio_comment', message0: 'comment %1', args0: [field('TEXT', 'Explain your idea')], ...action, colour: '#08796e' },
  ]);
}

export const studioExtensionCategories = [
  { name: 'Sprites', colour: '#b53e75', types: ['ka_studio_spawn', 'ka_studio_remove', 'ka_studio_sprite_ref', 'ka_studio_costume_group', 'ka_studio_last_created', 'ka_studio_sprite_count', 'ka_studio_group_touching', 'ka_studio_for_sprites'] },
  { name: 'Locations', colour: '#a16908', types: ['ka_studio_location', 'ka_studio_random_location', 'ka_studio_pointer_location', 'ka_studio_sprite_location', 'ka_studio_location_offset', 'ka_studio_location_axis', 'ka_studio_goto_location'] },
  { name: 'Behaviors', colour: '#6d4aff', types: ['ka_studio_behavior', 'ka_studio_stop_behaviors', 'ka_studio_draggable'] },
  { name: 'Text', colour: '#08796e', types: ['ka_studio_text', 'ka_studio_join', 'ka_studio_set_text', 'ka_studio_text_variable', 'ka_studio_text_compare', 'ka_studio_say_text', 'ka_studio_print'] },
  { name: 'Comments', colour: '#08796e', types: ['ka_studio_comment'] },
];
