import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { missions, type Mission } from './learning';
import { gradeSolutions } from './gradeMissions';
import { collectionSolutions } from './collectionMissions';
import { dataSolutions } from './dataMissions';
import { relativeMovement, degreeTurns, relativeProgram, relativeProgramText, turnHeading } from './relativeMovement';
import { relativeTeaching, relativeStarterText } from './relativeTeaching';
import { evaluateWorkspace } from './blockly';
import { runText } from './textCoding';
import { dataBlocks } from './dataProgram';
import { modulesFor } from './curriculum';

const task = (grade = 5): Mission => ({ id: `grade-${grade}-relative-test`, title: 'Facing test', concept: 'Sequences', description: '', goal: '', size: 7, start: { x: 3, y: 3 }, end: { x: 4, y: 2 }, walls: [], loops: true, starter: [], hints: [], reflection: '' });
function runState(mission: Mission, program: Blockly.serialization.blocks.State) {
  const ws = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: program } }] } }, ws);
    return evaluateWorkspace(ws, mission);
  } finally { ws.dispose(); }
}
describe('relative movement and safe legacy semantics', () => {
  it('enables only Grades 4–6, with degree controls in Grades 5–6', () => {
    expect([1, 2, 3, 4, 5, 6].map(grade => relativeMovement(task(grade)))).toEqual([false, false, false, true, true, true]);
    expect([3, 4, 5, 6].map(grade => degreeTurns(task(grade)))).toEqual([false, false, true, true]);
    expect(relativeMovement({ id: 'drawing-grade-6-square' })).toBe(false);
    expect(relativeMovement({ id: 'first-steps' })).toBe(false);
  });
  it('turns in place, then moves along the new facing direction', () => {
    const result = runText('forward()\nturn_left()\nforward()', task());
    expect(result.success, result.message).toBe(true);
    expect(result.frames.map(({ x, y, heading }) => [x, y, heading])).toEqual([[4, 3, 'right'], [4, 3, 'up'], [4, 2, 'up']]);
  });
  it('moves backward without turning around and resets facing on the next run', () => {
    const m = { ...task(), end: { x: 3, y: 4 } };
    const code = 'turn_left()\nbackward()';
    expect(runText(code, m).frames.at(-1)).toMatchObject({ x: 3, y: 4, heading: 'up' });
    expect(runText(code, m).success).toBe(true);
    expect(runText('move_down()', m).frames.at(-1)).toMatchObject({ heading: 'right' });
  });
  it('executes 90/180/270-degree turns while rejecting non-grid angles and Grade 4 degree calls', () => {
    expect(turnHeading('right', 'left', 270)).toBe('down');
    const result = runText('turn_right(180)\nbackward()', { ...task(), end: { x: 4, y: 3 } });
    expect(result.success).toBe(true); expect(result.frames.at(-1)?.heading).toBe('left');
    expect(runText('turn_right(45)\nforward()', task()).message).toContain('90, 180 or 270');
    expect(runText('turn_right(180)\nforward()', task(4)).message).toContain('Grade 4');
    expect(runText('forward()', task(3)).message).toContain('Grades 4–6');
  });
  it('checks paths from the current heading, including after a turn', () => {
    const m = { ...task(), conditionals: true, requireElse: true, walls: [{ x: 3, y: 2 }], end: { x: 4, y: 3 } };
    const result = runText('turn_left()\nif relative_path_clear("forward"):\n    forward()\nelse:\n    turn_right()\n    forward()', m);
    expect(result.success, result.message).toBe(true);
  });
  it('keeps turns inside repeat bodies and checks collisions instead of jumping', () => {
    const result = runText('for step in range(4):\n    forward()\n    turn_right()', { ...task(), end: task().start });
    expect(result.success).toBe(true); expect(result.frames.at(-1)?.heading).toBe('right');
    const obstacle = { ...task(), walls: [{ x: 4, y: 3 }], end: { x: 5, y: 3 }, dataTask: { topic: 'statements' as const, required: ['move_steps'] } };
    expect(runText('forward(2)', obstacle).message).toContain('blocked');
  });
  it('reads list, object and score distances relative to facing without modifying the data', () => {
    const list = missions.find(m => m.id === 'grade-5-lists-2')!;
    expect(runText('steps = [1, 3, 2]\nturn_left()\nforward(steps[1])', list).success).toBe(true);
    const object = missions.find(m => m.id === 'grade-6-objects-2')!;
    expect(runText('robot = {"speed": 1, "energy": 3}\nturn_left()\nforward(robot["energy"])', object).success).toBe(true);
    const score = { ...task(), variables: true, targetScore: 2, requireVariableRead: true, end: { x: 3, y: 1 } };
    expect(runText('score = 2\nturn_left()\nforward(score)', score).success).toBe(true);
  });
  it('preserves the meaning of absolute saved blocks and text, rather than converting them on load', () => {
    const m = task();
    expect(runText('turn_left()\nmove_right()\nmove_up()', m).success).toBe(true);
    expect(runState(m, { type: 'ka_right', next: { block: { type: 'ka_up' } } }).success).toBe(true);
  });
  it('uses relative fresh debugging starters and senior lessons, leaving Grade 3 alone', () => {
    const m = missions.find(m => m.id === 'grade-6-debugging-1')!;
    const code = relativeStarterText(m);
    expect(code).not.toContain('move_up()'); expect(code).toContain('forward()');
    expect(relativeTeaching(m).hints[3]).toContain('turn_');
    expect(modulesFor('grade-4')[0].lesson.sections[0].title).toBe('Watch the facing arrow');
    expect(modulesFor('grade-3')[0].lesson.sections[0].title).toBe('Instructions and screen directions');
  });
  it('introduces advanced blocks progressively, not all at the start of a topic', () => {
    const m = (id: string) => missions.find(item => item.id === id)!;
    expect(dataBlocks(m('grade-4-lists-1'))).toEqual(['list_set', 'relative_list_move']);
    expect(dataBlocks(m('grade-4-lists-4'))).toContain('list_append');
    expect(dataBlocks(m('grade-4-lists-5'))).toContain('list_update');
    expect(dataBlocks(m('grade-5-objects-1'))).not.toContain('object_update');
    expect(dataBlocks(m('grade-5-objects-3'))).toContain('object_update');
    expect(dataBlocks(m('grade-6-objects-6'))).toContain('object_from_list');
    expect(dataBlocks(m('grade-3-statements-1'))).toEqual(['move_steps']);
  });
  const solutions = { ...gradeSolutions, ...collectionSolutions, ...dataSolutions };
  for (const mission of missions.filter(m => relativeMovement(m) && solutions[m.id])) it(`${mission.id} is solvable with a relative block/text reference`, () => {
    const relative = relativeProgram(solutions[mission.id]);
    const blocks = runState(mission, relative), text = runText(relativeProgramText(relative), mission);
    expect(blocks.success, blocks.message).toBe(true);
    expect(text.success, text.message).toBe(true);
    expect(text.frames.at(-1)?.x).toBe(blocks.frames.at(-1)?.x);
    expect(text.frames.at(-1)?.y).toBe(blocks.frames.at(-1)?.y);
  });
});
