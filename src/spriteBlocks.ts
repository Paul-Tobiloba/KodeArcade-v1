import * as Blockly from 'blockly/core';
import { spriteNames, backdropNames } from './spriteModel';
const statement = { previousStatement: null, nextStatement: null };
const number = (name: string) => ({ type: 'input_value', name, check: 'Number' });
const dropdown = (name: string, values: readonly string[]) => ({ type: 'field_dropdown', name, options: values.map(v => [v, v]) });
Blockly.common.defineBlocksWithJsonArray([
  { type: 'ka_on_event', message0: 'when %1', args0: [{ type: 'field_dropdown', name: 'EVENT', options: [['sprite clicked', 'click'], ['touching border', 'edge'], ['touching other character', 'touch']] }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], ...statement, colour: '#a16908', tooltip: 'Connect below Play to register this event. Its body runs when that event happens, not during registration.' },
  { type: 'ka_sprite_move', message0: 'move %1 %2 steps', args0: [dropdown('DIRECTION', ['forward', 'backward']), number('VALUE')], ...statement, colour: '#08796e' },
  { type: 'ka_sprite_turn', message0: 'turn %1 %2 degrees', args0: [dropdown('SIDE', ['right', 'left']), { type: 'field_number', name: 'ANGLE', value: 90, min: 0, max: 360 }], ...statement, colour: '#08796e' },
  { type: 'ka_sprite_goto', message0: 'go to x %1 y %2', args0: [number('X'), number('Y')], ...statement, colour: '#08796e' },
  { type: 'ka_sprite_bounce', message0: 'if on border, bounce', ...statement, colour: '#08796e' },
  { type: 'ka_sprite_say', message0: 'say %1', args0: [{ type: 'field_input', name: 'TEXT', text: 'Hello!' }], ...statement, colour: '#6d4aff' },
  { type: 'ka_sprite_say_value', message0: 'say number %1', args0: [number('VALUE')], ...statement, colour: '#6d4aff' },
  { type: 'ka_sprite_character', message0: 'switch character to %1', args0: [dropdown('CHARACTER', spriteNames)], ...statement, colour: '#6d4aff' },
  { type: 'ka_sprite_backdrop', message0: 'switch background to %1', args0: [dropdown('BACKGROUND', backdropNames)], ...statement, colour: '#6d4aff' },
  { type: 'ka_sprite_visible', message0: '%1 sprite', args0: [dropdown('VISIBLE', ['show', 'hide'])], ...statement, colour: '#6d4aff' },
  { type: 'ka_sprite_wait', message0: 'wait %1 seconds', args0: [{ type: 'field_number', name: 'SECONDS', value: 0.5, min: 0.1, max: 2 }], ...statement, colour: '#b85a09' },
  { type: 'ka_sprite_touching', message0: 'touching %1 ?', args0: [dropdown('TARGET', ['edge', 'character'])], output: 'Boolean', colour: '#08796e' },
]);
