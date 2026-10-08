import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { evaluateWorkspace } from './blockly';
import { modules, challengeOrder, nextChallenge } from './curriculum';
import { missions } from './learning';
import { topicSolutions } from './topicMissions';
type State = Blockly.serialization.blocks.State;
const chain = (...types: string[]): State => {
  const [type, ...rest] = types;
  return { type: `ka_${type}`, ...(rest.length ? { next: { block: chain(...rest) } } : {}) };
};
const repeat = (count: number, body: State, next?: State): State => ({ type: 'ka_repeat', fields: { COUNT: count }, inputs: { DO: { block: body } }, ...(next ? { next: { block: next } } : {}) });
const solutions: Record<string, State> = {
  'first-steps': chain('right', 'right', 'right'),
  'sequence-up': chain('up', 'up', 'up'),
  'sequence-corner': chain('right', 'right', 'up', 'up'),
  'take-a-turn': chain('up', 'up', 'right', 'right', 'right'),
  'direction-gap': chain('up', 'right', 'right', 'right', 'right', 'down'),
  'direction-home': chain('up', 'up', 'left', 'left', 'left'),
  'on-repeat': repeat(4, chain('right')),
  'loop-corner': repeat(4, chain('right'), repeat(4, chain('up'))),
  'loop-stairs': repeat(2, chain('right', 'up')),
  'fix-the-route': chain('right', 'right', 'up', 'up'),
  'debug-short': chain('right', 'right', 'right'),
  'debug-order': chain('up', 'up', 'right', 'right'),
  'rescue-project': repeat(4, chain('right'), repeat(4, chain('up'))),
};
describe('module curriculum', () => {
  it('gives each available topic several distinct challenges', () => {
    expect(new Set(challengeOrder).size).toBe(challengeOrder.length);
    for (const module of modules.filter(m => m.status === 'available' && m.id !== 'project')) expect(module.challengeIds.length).toBe(10);
    expect(new Set(challengeOrder)).toEqual(new Set(missions.filter(m => !m.id.startsWith('grade-')).map(m => m.id)));
    expect(nextChallenge('first-steps')).toBe('sequence-up');
    expect(nextChallenge('sequence-corner')).toBe('sequences-practice-3');
    expect(nextChallenge('rescue-project')).toBeUndefined();
  });
  it('does not expose unfinished modules as playable challenges', () => {
    for (const module of modules.filter(m => m.status === 'upcoming')) expect(module.challengeIds).toEqual([]);
  });
  for (const mission of missions.filter(m => !m.id.startsWith('grade-'))) it(`${mission.id} has a working authored solution`, () => {
    const workspace = new Blockly.Workspace();
    try {
      let solution = solutions[mission.id] ?? topicSolutions[mission.id];
      if (mission.solution) {
        solution = chain(...mission.solution);
        if (mission.requireLoop) {
          const route = mission.solution;
          if (route.every(d => d === route[0])) solution = repeat(route.length, chain(route[0]));
          else if (mission.id === 'loops-practice-20') solution = repeat(3, chain('right', 'down'));
          else if (mission.id === 'loops-practice-19') solution = repeat(3, chain('right'), chain('up'));
          else solution = repeat(3, chain('left'), repeat(3, chain('up')));
        }
      }
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: solution } }] } }, workspace);
      expect(evaluateWorkspace(workspace, mission).success).toBe(true);
    } finally { workspace.dispose(); }
  });
});
