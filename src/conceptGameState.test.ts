import { describe, expect, it } from 'vitest';
import { conceptMissions, conceptSources } from './conceptMissions';
import { runText } from './textCoding';
import { bridgeState, gateState, workshopState, traceValue } from './conceptGameState';
import type { Frame } from './learning';

const mission = (id: string) => conceptMissions.find(item => item.id === id)!;
describe('code-driven concept game evidence', () => {
  for (const item of conceptMissions) it(`${item.id} keeps the authored result and exposes game evidence`, () => {
    const result = runText(conceptSources[item.id], item), frame = result.frames.at(-1);
    expect(result.success, result.message).toBe(true);
    if (item.conceptTask!.topic === 'operators') {
      expect(bridgeState(item, frame, result.success)).toMatchObject({ crossed: true, planks: item.conceptTask!.score });
      expect(frame?.lab?.expression?.kind).toBe('arithmetic');
    } else if (item.conceptTask!.topic === 'boolean' && item.conceptTask!.output) {
      expect(gateState(item, frame).answer).toBe(item.conceptTask!.output[0]);
    } else if (item.conceptTask!.topic === 'functions') {
      expect(workshopState(item, frame).output).toEqual(item.conceptTask!.output);
      expect(workshopState(item, frame).calls).toBeGreaterThanOrEqual(item.conceptTask!.minCalls!);
      expect(workshopState(item, frame).current?.phase).not.toBe('defined');
    }
  });
  it('does not reward a literal answer and has a clean reset state', () => {
    const item = mission('grade-5-operators-1'), result = runText('score = 5', item);
    expect(result.success).toBe(false);
    expect(bridgeState(item, result.frames.at(-1), result.success)).toMatchObject({ planks: 5, crossed: false });
    expect(bridgeState(item)).toMatchObject({ value: undefined, planks: 0, crossed: false });
    expect(workshopState(mission('grade-5-functions-3'))).toMatchObject({ calls: 0, output: [], definitions: [] });
  });
  it.each([-3, .5, 0, 3, 7, 1000])('reports %s honestly without fractional or unbounded plank pictures', value => {
    const state = bridgeState(mission('grade-5-operators-1'), { score: value } as Frame);
    expect(state.value).toBe(value); expect(state.planks).toBeGreaterThanOrEqual(0); expect(state.planks).toBeLessThanOrEqual(5);
    if (!Number.isInteger(value) || value < 0) expect(state.planks).toBe(0);
  });
  it('shows a correct False as a closed gate, not a failed mission', () => {
    const item = mission('grade-5-boolean-2'), result = runText(conceptSources[item.id], item);
    expect(result.success).toBe(true); expect(gateState(item, result.frames.at(-1))).toMatchObject({ answer: false, open: false, expected: false });
  });
  it('retains the actual branch condition after its numeric score assignment', () => {
    const item = mission('grade-6-boolean-6'), result = runText(conceptSources[item.id], item);
    expect(result.success).toBe(true);
    expect(result.frames.at(-1)?.score).toBe(1);
    expect(gateState(item, result.frames.at(-1))).toMatchObject({ answer: true, open: true, expression: { kind: 'comparison', label: 'score >= 3', value: true } });
  });
  it.each([['False and (3 > 2)', false, 'and'], ['True or (3 > 2)', true, 'or']] as const)('does not evaluate the skipped side of %s', (source, answer, operator) => {
    const item = { ...mission('grade-6-boolean-6'), conceptTask: { topic: 'boolean' as const, required: [`logic:${operator}`], output: [answer] } };
    const result = runText(`show_boolean(${source})`, item), frame = result.frames.at(-1);
    expect(result.success, result.message).toBe(true);
    expect(gateState(item, frame).answer).toBe(answer);
    expect(frame?.lab?.expression?.inputs?.[1]).toMatchObject({ skipped: true });
    expect(frame?.lab?.expression?.inputs?.[1]?.value).toBeUndefined();
    expect(traceValue(frame?.lab?.expression?.inputs?.[1])).toBe('Not evaluated');
  });
  it('preserves call inputs, returned values and nested caller identity in independent snapshots', () => {
    const item = mission('grade-6-functions-6'), result = runText(conceptSources[item.id], item);
    const calls = result.frames.filter(frame => frame.note?.startsWith('Call '));
    expect(calls.map(frame => [frame.lab?.function?.name, frame.lab?.function?.argument])).toEqual([['boost', 3], ['double', 3]]);
    const returns = result.frames.filter(frame => frame.note?.startsWith('Return '));
    expect(returns.map(frame => [frame.lab?.function?.name, frame.lab?.function?.returned])).toEqual([['double', 6], ['boost', 7]]);
    expect(result.frames.at(-1)?.lab?.output).toEqual([7]);
    expect(calls[0].lab?.output).toEqual([]);
  });
  it('a definition alone produces no input, call, return or output', () => {
    const item = mission('grade-3-functions-1'), result = runText('def waiting():\n    show_number(2)', item);
    expect(result.success).toBe(false);
    expect(workshopState(item, result.frames.at(-1))).toMatchObject({ calls: 0, output: [], definitions: ['waiting'], current: { name: 'waiting', phase: 'defined' } });
    expect(workshopState(item, result.frames.at(-1)).current?.argument).toBeUndefined();
  });
});
