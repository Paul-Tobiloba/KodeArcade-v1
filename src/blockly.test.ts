import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly/core';
import { evaluateWorkspace } from './blockly';
import { missions } from './learning';
const chain = (type: string, next?: object) => ({ type, ...(next ? { next: { block: next } } : {}) });
function evaluate(state: object, index = 0, maxBlocks?: number) {
  const ws = new Blockly.Workspace();
  try { Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [state] } }, ws); return evaluateWorkspace(ws, { ...missions[index], ...(maxBlocks ? { maxBlocks } : {}) }); }
  finally { ws.dispose(); }
}
describe('Blockly interpreter', () => {
  it('runs a connected movement stack without generating JavaScript', () => {
    expect(evaluate(chain('ka_start', chain('ka_right', chain('ka_right', chain('ka_right'))))).success).toBe(true);
  });
  it('runs a repeat body and validates the loop objective', () => {
    expect(evaluate(chain('ka_start', { type: 'ka_repeat', fields: { COUNT: 4 }, inputs: { DO: { block: chain('ka_right') } } }), 2).success).toBe(true);
  });
  it('explains an empty repeat block', () => {
    expect(evaluate(chain('ka_start', { type: 'ka_repeat', fields: { COUNT: 4 } }), 2).message).toContain('empty');
  });
  it('rejects disconnected blocks instead of silently ignoring them', () => {
    const ws = new Blockly.Workspace(); ws.newBlock('ka_start'); ws.newBlock('ka_right');
    expect(evaluateWorkspace(ws, missions[0]).message).toContain('not connected'); ws.dispose();
  });
  it('bounds repeated execution', () => {
    const loop = (body: object) => ({ type: 'ka_repeat', fields: { COUNT: 5 }, inputs: { DO: { block: body } } });
    // Test the independent execution bound, not the tighter teaching budget.
    expect(evaluate(chain('ka_start', loop(loop(loop(chain('ka_right'))))), 2, 24).message).toContain('120');
  });
});
