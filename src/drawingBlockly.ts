import * as Blockly from 'blockly/core';
import { parseCode, type Statement } from './textCoding';

Blockly.common.defineBlocksWithJsonArray([
  ...['forward','left','right'].map(action => ({ type: `ka_draw_arrow_${action}`, message0: '%1 %2', args0: [{ type: 'field_image', src: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="${action === 'forward' ? 'M5 16h22m-9-9 9 9-9 9' : action === 'left' ? 'M26 26V14a8 8 0 0 0-8-8H6m7-5L6 6l7 7' : 'M6 26V14a8 8 0 0 1 8-8h12m-7-5 7 5-7 7'}" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)}`,width:32,height:32,alt: action === 'forward' ? 'Forward' : `Turn ${action}` },{type:'field_number',name:'VALUE',value:action === 'forward' ? 40 : 90,min:1,max:action === 'forward' ? 150 : 360,precision:1}],previousStatement:null,nextStatement:null,colour:'#08796e',tooltip:action === 'forward' ? 'Draw forward in the direction of the pointer.' : `Turn ${action}.` })),
  { type: 'ka_draw_forward', message0: 'forward %1', args0: [{ type: 'field_number', name: 'VALUE', value: 40, min: 1, max: 150, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#08796e' },
  { type: 'ka_draw_turn', message0: 'turn %1 %2 °', args0: [{ type: 'field_dropdown', name: 'SIDE', options: [['left','left'],['right','right']] }, { type: 'field_number', name: 'VALUE', value: 90, min: 0, max: 360, precision: 1 }], previousStatement: null, nextStatement: null, colour: '#08796e' },
  { type: 'ka_draw_repeat', message0: 'repeat %1 times', args0: [{ type: 'field_number', name: 'COUNT', value: 4, min: 2, max: 12, precision: 1 }], message1: 'do %1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, colour: '#6d4aff' },
  ...['push','pop','pen_up','pen_down'].map(type => ({ type: `ka_draw_${type}`, message0: ({push:'remember position',pop:'return to position',pen_up:'lift pencil',pen_down:'lower pencil'} as Record<string,string>)[type], previousStatement: null, nextStatement: null, colour: '#b53e75' })),
]);

/** Shared Blockly surface, task-specific instructions. The bounded pen engine runs these commands. */
export function drawingWorkspaceCode(ws: Blockly.Workspace) {
  const roots = ws.getTopBlocks(false);
  if (roots.length !== 1 || roots[0].type !== 'ka_start') throw new Error('Snap every drawing block below the start block.');
  if (ws.getAllBlocks(false).length > 25) throw new Error('Use up to 24 drawing blocks.');
  function visit(first: Blockly.Block | null, depth = 0): string[] {
    if (depth > 3) throw new Error('Use no more than three nested repeat groups.');
    const lines: string[] = [], pad = '    '.repeat(depth);
    for (let b = first; b; b = b.getNextBlock()) {
      const value = Number(b.getFieldValue('VALUE'));
      if (b.type === 'ka_draw_forward' || b.type === 'ka_draw_arrow_forward') lines.push(`${pad}forward(${value})`);
      else if (b.type === 'ka_draw_arrow_left' || b.type === 'ka_draw_arrow_right') lines.push(`${pad}turn(${b.type.endsWith('right') ? -value : value})`);
      else if (b.type === 'ka_draw_turn') lines.push(`${pad}turn(${b.getFieldValue('SIDE') === 'right' ? -value : value})`);
      else if (b.type === 'ka_draw_repeat') {
        if (!b.getInputTargetBlock('DO')) throw new Error('Put drawing instructions inside Repeat.');
        lines.push(`${pad}for pattern in range(${b.getFieldValue('COUNT')}):`, ...visit(b.getInputTargetBlock('DO'),depth+1));
      } else if (['push','pop','pen_up','pen_down'].some(type => b!.type === `ka_draw_${type}`)) lines.push(`${pad}${b.type.slice(8)}()`);
      else throw new Error('Use drawing blocks for this activity.');
    }
    return lines;
  }
  return visit(roots[0].getNextBlock()).join('\n');
}

export function seedDrawingCode(ws: Blockly.WorkspaceSvg, source: string, young = false) {
  const root = ws.getBlocksByType('ka_start',false)[0];
  function group(nodes: Statement[], previous: Blockly.Block) {
    for (const node of nodes) {
      const type = node.type === 'ka_repeat' ? 'ka_draw_repeat' : young && node.type === 'forward' ? 'ka_draw_arrow_forward' : young && node.type === 'turn' ? `ka_draw_arrow_${(node.value ?? 0)<0 ? 'right' : 'left'}` : `ka_draw_${node.type}`;
      if (!Blockly.Blocks[type]) throw new Error('This text command needs Text mode. Your original code is safe.');
      const b = ws.newBlock(type); b.initSvg();
      if (node.value !== undefined) b.setFieldValue(String(Math.abs(node.value)),node.body ? 'COUNT' : 'VALUE');
      if (node.type === 'turn' && !young) b.setFieldValue((node.value ?? 0) < 0 ? 'right' : 'left','SIDE');
      b.render(); previous.nextConnection!.connect(b.previousConnection!);
      if (node.body) {
        const anchor = ws.newBlock('ka_start'); anchor.initSvg(); anchor.render(); group(node.body,anchor);
        const first = anchor.getNextBlock(); first?.previousConnection?.disconnect();
        if (first) b.getInput('DO')!.connection!.connect(first.previousConnection!);
        anchor.dispose(false);
      }
      previous = b;
    }
  }
  group(parseCode(source,true),root);
}
