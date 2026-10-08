import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly/core';
import { evaluateWorkspace } from './blockly';
import { missions } from './learning';
import { topicSolutions } from './topicMissions';

const evaluate = (id: string, program: Blockly.serialization.blocks.State) => {
  const ws = new Blockly.Workspace();
  try { Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: program } }] } }, ws); return evaluateWorkspace(ws, missions.find(m => m.id === id)!); } finally { ws.dispose(); }
};
describe('runtime decisions and memory', () => {
  it('rechecks the path after movement inside a loop', () => {
    const result = evaluate('conditionals-7', topicSolutions['conditionals-7']);
    expect(result.success).toBe(true);
    expect(result.frames.filter(f => f.note).map(f => f.note)).toEqual(['right is clear: run DO.', 'right is blocked: skip DO and run ELSE.']);
  });
  it('skips an IF body when false and continues afterwards', () => {
    const result = evaluate('conditionals-2', topicSolutions['conditionals-2']);
    expect(result.success).toBe(true); expect(result.frames.at(-1)).toMatchObject({ x: 1, y: 1 });
  });
  it('does not accept a route that bypasses the required conditional', () => {
    expect(evaluate('conditionals-1', { type: 'ka_right' }).success).toBe(false);
  });
  it('rejects empty conditional branches', () => {
    expect(evaluate('conditionals-3', { type: 'ka_if_else', fields: { DIRECTION: 'right' } }).message).toMatch(/every branch/);
  });
  it('changes the value at runtime and reuses it without consuming it', () => {
    const result = evaluate('variables-9', topicSolutions['variables-9']);
    expect(result.success).toBe(true);
    expect(result.frames.filter(f => f.note).map(f => f.score)).toEqual([3, 3, 1, 1]);
  });
  it('resets variables between runs and requires initialization', () => {
    expect(evaluate('variables-2', topicSolutions['variables-2']).success).toBe(true);
    expect(evaluate('variables-2', { type: 'ka_move_score', fields: { DIRECTION: 'right' } }).message).toMatch(/Set score before/);
    expect(evaluate('variables-4', { type: 'ka_change_score', fields: { VALUE: 1 } }).message).toMatch(/Set score first/);
  });
  it('preserves frames before a blocked variable movement', () => {
    const result = evaluate('variables-2', { type: 'ka_set_score', fields: { VALUE: 10 }, next: { block: { type: 'ka_move_score', fields: { DIRECTION: 'right' } } } });
    expect(result.success).toBe(false); expect(result.frames.at(-1)).toMatchObject({ x: 4, y: 4, score: 10 });
  });
});
