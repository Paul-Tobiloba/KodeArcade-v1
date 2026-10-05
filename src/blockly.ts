import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import { directions, labels, runProgram, type Block, type Mission, type RunResult } from './learning';

Blockly.setLocale(Object.fromEntries(Object.entries(En).filter((entry): entry is [string, string] => typeof entry[1] === 'string')));
Blockly.common.defineBlocksWithJsonArray([
  { type: 'ka_start', message0: 'when Run is pressed', nextStatement: null, colour: '#a76d08', tooltip: 'Connect your program below this block.', hat: 'cap' },
  ...directions.map(direction => ({ type: `ka_${direction}`, message0: labels[direction], previousStatement: null, nextStatement: null, colour: '#08796e', tooltip: `${labels[direction]} by one square.` })),
  { type: 'ka_repeat', message0: 'repeat %1 times', args0: [{ type: 'field_number', name: 'COUNT', value: 2, min: 2, max: 5, precision: 1 }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: '#6d4aff', tooltip: 'Place blocks inside to repeat them. Choose 2 to 5 repeats.' },
]);

export const theme = Blockly.Theme.defineTheme('kodearcade', {
  name: 'kodearcade', base: Blockly.Themes.Classic,
  componentStyles: { workspaceBackgroundColour: '#fafbfe', toolboxBackgroundColour: '#edf4f1', toolboxForegroundColour: '#172033', flyoutBackgroundColour: '#edf4f1', flyoutForegroundColour: '#172033', flyoutOpacity: 1, scrollbarColour: '#a8b5bf', scrollbarOpacity: 0.6, insertionMarkerColour: '#a287ff', insertionMarkerOpacity: 0.5, cursorColour: '#5332d6' },
  fontStyle: { family: 'Segoe UI, system-ui, sans-serif', weight: '600', size: 12 },
});

export function evaluateWorkspace(workspace: Blockly.Workspace, mission: Mission): RunResult {
  const failure = (message: string): RunResult => ({ frames: [], success: false, message });
  const roots = workspace.getTopBlocks(false);
  const start = roots.find(b => b.type === 'ka_start');
  if (!start) return failure('Add the start block before running your program.');
  if (roots.length > 1) return failure('Some blocks are not connected. Snap them below the start block, or drag unused blocks to the bin.');
  if (workspace.getAllBlocks(false).length > 25) return failure('Use up to 24 instruction blocks. Remove a few blocks and try again.');
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
        const direction = directions.find(d => block!.type === `ka_${d}`);
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

export function seedWorkspace(workspace: Blockly.WorkspaceSvg, blocks: Block[]) {
  const start = workspace.newBlock('ka_start');
  start.setDeletable(false); start.setMovable(false); start.setEditable(false);
  start.initSvg(); start.render(); start.moveBy(30, 45);
  let previous = start;
  for (const block of blocks) {
    const next = workspace.newBlock(block.kind === 'repeat' ? 'ka_repeat' : `ka_${block.kind}`);
    next.initSvg(); next.render();
    previous.nextConnection!.connect(next.previousConnection!);
    if (block.kind === 'repeat') {
      next.setFieldValue(String(block.count), 'COUNT');
      const child = workspace.newBlock(`ka_${block.direction}`); child.initSvg(); child.render();
      next.getInput('DO')!.connection!.connect(child.previousConnection!);
    }
    previous = next;
  }
}
