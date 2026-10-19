import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import './conceptBlocks';
import './spriteBlocks';
import { runConcept } from './conceptRuntime';
import { runDynamic } from './dynamicProgram';
import { instructionLimit, limitMessage } from './programLimits';
import { validRepeatCount, repeatCountMessage } from '../shared/repeats.js';
import { relativeMovement } from './relativeMovement';
import { directions, labels, runProgram, type Block, type Mission, type RunResult } from './learning';

Blockly.setLocale(Object.fromEntries(Object.entries(En).filter((entry): entry is [string, string] => typeof entry[1] === 'string')));
Blockly.common.defineBlocksWithJsonArray([
  ...['forward', 'backward'].map(action => ({ type: `ka_${action}`, message0: `move ${action}`, previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: action === 'forward' ? 'Move one square in the facing direction.' : 'Move one square behind you without changing the facing direction.' })),
  ...['left', 'right'].map(side => ({ type: `ka_turn_${side}`, message0: `turn ${side}`, previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: `Turn ${side} 90 degrees without moving.` })),
  { type: 'ka_turn_degrees', message0: 'turn %1 by %2 °', args0: [{ type: 'field_dropdown', name: 'SIDE', options: [['left', 'left'], ['right', 'right']] }, { type: 'field_dropdown', name: 'DEGREES', options: [['90', '90'], ['180', '180'], ['270', '270']] }], previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: 'Grid turns use quarter turns: 90, 180 or 270 degrees. Drawing supports other angles.' },
  ...[['move_steps', 'steps'], ['list_move', 'steps item'], ['object_move', 'robot.'], ['move_score', 'score']].map(([kind, label]) => ({ type: `ka_relative_${kind}`, message0: kind === 'move_steps' ? 'move %1 by %2 steps' : kind === 'move_score' ? 'move %1 by score' : `move %1 by ${label} %2`, args0: [{ type: 'field_dropdown', name: 'DIRECTION', options: [['forward', 'forward'], ['backward', 'backward']] }, ...(kind === 'move_score' ? [] : [kind === 'object_move' ? { type: 'field_dropdown', name: 'PROPERTY', options: [['speed', 'speed'], ['energy', 'energy']] } : { type: 'field_number', name: kind === 'list_move' ? 'INDEX' : 'VALUE', value: kind === 'list_move' ? 0 : 2, min: 0, max: kind === 'list_move' ? 7 : 9, precision: 1 }])], previousStatement: null, nextStatement: null, colour: kind === 'list_move' ? '#6d4aff' : kind === 'object_move' || kind === 'move_score' ? '#b53e75' : '#08796e' })),
  ...[false, true].map(otherwise => ({ type: otherwise ? 'ka_relative_if_else' : 'ka_relative_if', message0: 'if path %1 is clear', args0: [{ type: 'field_dropdown', name: 'DIRECTION', options: [['forward', 'forward'], ['backward', 'backward'], ['left', 'left'], ['right', 'right']] }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], ...(otherwise ? { message2: 'else %1', args2: [{ type: 'input_statement', name: 'ELSE' }] } : {}), previousStatement: null, nextStatement: null, colour: '#b85a09', tooltip: 'Check a neighbouring square relative to the current facing direction.' })),
  { type: 'ka_move_steps', message0: 'move %1 by %2 steps', args0: [{ type: 'field_dropdown', name: 'DIRECTION', options: directions.map(d => [d, d]) }, { type: 'field_number', name: 'VALUE', value: 2, min: 0, max: 9, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: 'Direction and distance are the arguments passed to this movement statement.' },
  { type: 'ka_list_set', message0: 'create steps = [ %1 ]', args0: [{ type: 'field_input', name: 'ITEMS', text: '2, 1' }], previousStatement: null, nextStatement: null, colour: '#6d4aff', tooltip: 'Create an ordered list of 1–8 whole numbers from 0 to 9, separated by commas.' },
  { type: 'ka_list_append', message0: 'append %1 to steps', args0: [{ type: 'field_number', name: 'VALUE', value: 3, min: 0, max: 9, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#6d4aff' },
  { type: 'ka_list_update', message0: 'set steps item %1 to %2', args0: [{ type: 'field_number', name: 'INDEX', value: 0, min: 0, max: 7, precision: 1 }, { type: 'field_number', name: 'VALUE', value: 3, min: 0, max: 9, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#6d4aff' },
  { type: 'ka_list_move', message0: 'move %1 by steps item %2', args0: [{ type: 'field_dropdown', name: 'DIRECTION', options: directions.map(d => [d, d]) }, { type: 'field_number', name: 'INDEX', value: 0, min: 0, max: 7, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#6d4aff', tooltip: 'Read a list item. Index 0 is the first item. Reading leaves the list unchanged.' },
  { type: 'ka_object_set', message0: 'create robot: speed %1 energy %2', args0: [{ type: 'field_number', name: 'SPEED', value: 2, min: 0, max: 9, precision: 1 }, { type: 'field_number', name: 'ENERGY', value: 3, min: 0, max: 9, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#b53e75', tooltip: 'Group two related values into an object with named properties.' },
  { type: 'ka_object_update', message0: 'set robot.%1 to %2', args0: [{ type: 'field_dropdown', name: 'PROPERTY', options: [['speed', 'speed'], ['energy', 'energy']] }, { type: 'field_number', name: 'VALUE', value: 3, min: 0, max: 9, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#b53e75' },
  { type: 'ka_object_move', message0: 'move %1 by robot.%2', args0: [{ type: 'field_dropdown', name: 'DIRECTION', options: directions.map(d => [d, d]) }, { type: 'field_dropdown', name: 'PROPERTY', options: [['speed', 'speed'], ['energy', 'energy']] }], previousStatement: null, nextStatement: null, colour: '#b53e75' },
  { type: 'ka_object_from_list', message0: 'set robot.%1 to steps item %2', args0: [{ type: 'field_dropdown', name: 'PROPERTY', options: [['speed', 'speed'], ['energy', 'energy']] }, { type: 'field_number', name: 'INDEX', value: 0, min: 0, max: 7, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#b53e75' },
  { type: 'ka_move_next', message0: 'move to next path tile', previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: 'Follow the next tile of the marked trail, including its turns.' },
  ...[['gate_locked','gate ahead is locked'],['bridge_missing','bridge ahead is missing']].map(([type,label]) => ({ type: `ka_if_${type}`, message0: `if ${label}`, message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: '#b85a09' })),
  ...[['open_gate','open gate with key'],['build_bridge','build bridge']].map(([type,label]) => ({ type: `ka_${type}`, message0: label, previousStatement: null, nextStatement: null, colour: '#08796e' })),
  ...[false, true].map(otherwise => ({ type: otherwise ? 'ka_if_item_else' : 'ka_if_item', message0: 'if item on this square', message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], ...(otherwise ? { message2: 'else %1', args2: [{ type: 'input_statement', name: 'ELSE' }] } : {}), previousStatement: null, nextStatement: null, colour: '#b85a09', tooltip: 'Check for an uncollected item on the character’s current square.' })),
  { type: 'ka_pick_item', message0: 'pick up item', previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: 'Collect one item on this square. An empty square is not a valid pickup.' },
  ...[false, true].map(otherwise => ({ type: otherwise ? 'ka_if_else' : 'ka_if', message0: 'if path %1 is clear', args0: [{ type: 'field_dropdown', name: 'DIRECTION', options: directions.map(d => [d, d]) }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], ...(otherwise ? { message2: 'else %1', args2: [{ type: 'input_statement', name: 'ELSE' }] } : {}), previousStatement: null, nextStatement: null, colour: '#b85a09', tooltip: 'Check the path from the current square, then choose a branch.' })),
  ...['set', 'change'].map(action => ({ type: `ka_${action}_score`, message0: `${action} score ${action === 'set' ? 'to' : 'by'} %1`, args0: [{ type: 'field_number', name: 'VALUE', value: action === 'set' ? 0 : 1, min: -10, max: 10, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#b53e75', tooltip: action === 'set' ? 'Store a new number named score.' : 'Add this number to the stored score. Negative numbers subtract.' })),
  { type: 'ka_move_score', message0: 'move %1', args0: [{ type: 'field_dropdown', name: 'DIRECTION', options: directions.map(d => [d, d]) }], message1: 'by score steps', previousStatement: null, nextStatement: null, colour: '#b53e75', tooltip: 'Read score now and move that many squares. This does not change score.' },
  { type: 'ka_start', message0: 'when Play is pressed', nextStatement: null, colour: '#a16908', tooltip: 'Connect your program below this block.', hat: 'cap' },
  ...directions.map(direction => ({ type: `ka_${direction}`, message0: labels[direction], previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: `${labels[direction]} by one square.` })),
  ...directions.map(direction => ({ type: `ka_arrow_${direction}`, message0: '%1', args0: [{ type: 'field_image', src: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M6 16h20m-8-8 8 8-8 8" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${({ right: 0, down: 90, left: 180, up: 270 })[direction]} 16 16)"/></svg>`)}`, width: 36, height: 36, alt: labels[direction] }], previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: `${labels[direction]} by one square.` })),
  { type: 'ka_repeat', message0: 'repeat %1 times', args0: [{ type: 'field_number', name: 'COUNT', value: 2, min: 0, max: Number.MAX_SAFE_INTEGER, precision: 1 }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: '#6d4aff', tooltip: 'Place blocks inside to repeat them. Use a whole-number count of 0 or more.' },
]);

export const theme = Blockly.Theme.defineTheme('kodearcade', {
  name: 'kodearcade', base: Blockly.Themes.Classic,
  componentStyles: { workspaceBackgroundColour: '#ffffff', toolboxBackgroundColour: '#f2effb', toolboxForegroundColour: '#172033', flyoutBackgroundColour: '#f2effb', flyoutForegroundColour: '#172033', flyoutOpacity: 1, scrollbarColour: '#b2a7ce', scrollbarOpacity: 0.6, insertionMarkerColour: '#a287ff', insertionMarkerOpacity: 0.5, cursorColour: '#5332d6' },
  fontStyle: { family: 'Segoe UI, system-ui, sans-serif', weight: '600', size: 12 },
});

export function evaluateWorkspace(workspace: Blockly.Workspace, mission: Mission): RunResult {
  const failure = (message: string): RunResult => ({ frames: [], success: false, message });
  const roots = workspace.getTopBlocks(false);
  const start = roots.find(b => b.type === 'ka_start');
  if (!start) return failure('Add the start block before running your program.');
  if (roots.length > 1) return failure('Some blocks are not connected. Snap them below the start block, or drag unused blocks to the bin.');
  if (workspace.getAllBlocks(false).length - 1 > instructionLimit(mission)) return failure(limitMessage(instructionLimit(mission)));
  if (mission.conceptTask) return runConcept(workspace, mission);
  if (!relativeMovement(mission) && workspace.getAllBlocks(false).some(block => /^ka_(relative_|forward$|backward$|turn_left$|turn_right$|turn_degrees$)/.test(block.type))) return failure('Forward, backward and route turns are introduced in Grades 4–6.');
  if (relativeMovement(mission) || mission.dataTask || mission.conditionals || mission.variables || mission.collectibles || mission.gate || mission.river) return runDynamic(start.getNextBlock(), mission);
  const expanded: Block[] = [];
  let usedLoop = false;
  let error = '', operations = 0;
  function visit(first: Blockly.Block | null, depth = 0) {
    if (depth > 3) { error = 'Try fewer loops inside loops. This mission supports up to three levels.'; return; }
    let block = first;
    while (block && !error) {
      if (++operations > 500) { error = 'This program exceeds 500 operations. Simplify repeated or nested instructions.'; return; }
      if (block.type === 'ka_repeat') {
        if (!mission.loops) { error = 'This mission uses movement blocks. Try Repeat in the loops mission.'; return; }
        const count = Number(block.getFieldValue('COUNT'));
        if (!validRepeatCount(count)) { error = repeatCountMessage; return; }
        const body = block.getInputTargetBlock('DO');
        if (!body) { error = 'Your Repeat block is empty. Drag a movement block inside it.'; return; }
        usedLoop = true;
        for (let i = 0; i < count && !error; i++) visit(body, depth + 1);
      } else {
        const direction = directions.find(d => block!.type === `ka_${d}` || block!.type === `ka_arrow_${d}`);
        if (!direction) { error = 'This block cannot run in Robot Rescue. Remove it and try a movement block.'; return; }
        expanded.push({ id: block.id, kind: direction, direction, count: 1 });
        if (expanded.length > 120) { error = 'That repeats more than 120 steps. Reduce the repeat count and try again.'; return; }
      }
      block = block.getNextBlock();
    }
  }
  visit(start.getNextBlock());
  if (error) return failure(error);
  return runProgram(mission, expanded, { usedLoop });
}

export function seedWorkspace(workspace: Blockly.WorkspaceSvg, blocks: Block[], arrows = false) {
  const start = workspace.newBlock('ka_start');
  start.setDeletable(false); start.setMovable(false); start.setEditable(false);
  start.initSvg(); start.render(); start.moveBy(30, 45);
  let previous = start;
  for (const block of blocks) {
    const next = workspace.newBlock(block.kind === 'repeat' ? 'ka_repeat' : `ka_${arrows ? 'arrow_' : ''}${block.kind}`);
    next.initSvg(); next.render();
    previous.nextConnection!.connect(next.previousConnection!);
    if (block.kind === 'repeat') {
      next.setFieldValue(String(block.count), 'COUNT');
      const child = workspace.newBlock(`ka_${arrows ? 'arrow_' : ''}${block.direction}`); child.initSvg(); child.render();
      next.getInput('DO')!.connection!.connect(child.previousConnection!);
    }
    previous = next;
  }
}
