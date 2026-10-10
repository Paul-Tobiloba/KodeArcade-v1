import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import { runDynamic } from './dynamicProgram';
import { instructionLimit, limitMessage } from './programLimits';
import { directions, labels, runProgram, type Block, type Mission, type RunResult } from './learning';

Blockly.setLocale(Object.fromEntries(Object.entries(En).filter((entry): entry is [string, string] => typeof entry[1] === 'string')));
Blockly.common.defineBlocksWithJsonArray([
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
  { type: 'ka_repeat', message0: 'repeat %1 times', args0: [{ type: 'field_number', name: 'COUNT', value: 2, min: 2, max: 5, precision: 1 }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: '#6d4aff', tooltip: 'Place blocks inside to repeat them. Choose 2 to 5 repeats.' },
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
  if (mission.conditionals || mission.variables || mission.collectibles || mission.gate || mission.river) return runDynamic(start.getNextBlock(), mission);
  const expanded: Block[] = [];
  let usedLoop = false;
  let error = '';
  function visit(first: Blockly.Block | null, depth = 0) {
    if (depth > 3) { error = 'Try fewer loops inside loops. This mission supports up to three levels.'; return; }
    let block = first;
    while (block && !error) {
      if (block.type === 'ka_repeat') {
        if (!mission.loops) { error = 'This mission uses movement blocks. Try Repeat in the loops mission.'; return; }
        const count = Number(block.getFieldValue('COUNT'));
        if (!Number.isInteger(count) || count < 2 || count > 5) { error = 'Choose a repeat count from 2 to 5.'; return; }
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
