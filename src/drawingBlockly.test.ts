import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import './blockly';
import { drawingWorkspaceCode } from './drawingBlockly';
import { drawProgram } from './textCoding';

describe('drawing instructions in the shared Blockly canvas', () => {
  it('compiles arrow movements and left turns with the same direction as the pen', () => {
    const ws = new Blockly.Workspace();
    try {
      const start = ws.newBlock('ka_start'), first = ws.newBlock('ka_draw_arrow_forward'), turn = ws.newBlock('ka_draw_arrow_left'), last = ws.newBlock('ka_draw_arrow_forward');
      start.nextConnection!.connect(first.previousConnection!); first.nextConnection!.connect(turn.previousConnection!); turn.nextConnection!.connect(last.previousConnection!);
      const code = drawingWorkspaceCode(ws);
      expect(code).toBe('forward(40)\nturn(90)\nforward(40)');
      expect(drawProgram(code).at(-1)).toMatchObject({x:190,y:220,heading:-90});
    } finally { ws.dispose(); }
  });
  it('compiles nested drawing groups and rejects loose blocks', () => {
    const ws = new Blockly.Workspace();
    try {
      const start = ws.newBlock('ka_start'), loop = ws.newBlock('ka_draw_repeat'), forward = ws.newBlock('ka_draw_forward'), turn = ws.newBlock('ka_draw_turn');
      loop.setFieldValue('4','COUNT'); start.nextConnection!.connect(loop.previousConnection!); loop.getInput('DO')!.connection!.connect(forward.previousConnection!); forward.nextConnection!.connect(turn.previousConnection!);
      expect(drawingWorkspaceCode(ws)).toBe('for pattern in range(4):\n    forward(40)\n    turn(90)');
      ws.newBlock('ka_draw_forward');
      expect(() => drawingWorkspaceCode(ws)).toThrow('Snap every drawing block');
    } finally { ws.dispose(); }
  });
});
