import { describe, expect, it } from 'vitest';
import type { serialization } from 'blockly/core';
import { parseCode, runText, drawProgram, drawingMatches, penPath } from './textCoding';
import { drawingActivities } from './drawingActivities';
import { gradeMissions, gradeSolutions } from './gradeMissions';
import { emptySave, freshProgress, parseSave, switchCourse } from './storage';
import { SEQUENCE_TOPIC, sequenceCore, sequenceExtras, sequenceEvidence } from './topicJourney';
import { missionIndex } from './curriculum';
type State = serialization.blocks.State;
function text(block: State | undefined, indent = ''): string {
  if (!block) return '';
  const body = (name: string) => text(block.inputs?.[name]?.block, indent + '    ');
  const direction = block.fields?.DIRECTION ?? 'right';
  const line = block.type === 'ka_repeat' ? `for step in range(${block.fields?.COUNT}):\n${body('DO')}`
    : block.type === 'ka_if' || block.type === 'ka_if_else' ? `if path_clear("${direction}"):\n${body('DO')}${block.type === 'ka_if_else' ? `\n${indent}else:\n${body('ELSE')}` : ''}`
    : block.type === 'ka_set_score' ? `score = ${block.fields?.VALUE}`
    : block.type === 'ka_change_score' ? `score += ${block.fields?.VALUE}`
    : block.type === 'ka_move_score' ? `move_by_score("${direction}")`
    : `move_${block.type.slice(3)}()`;
  return `${indent}${line}${block.next?.block ? `\n${text(block.next.block, indent)}` : ''}`;
}
describe('typed coding bridge', () => {
  for (const mission of gradeMissions.filter(m => /^grade-[56]-/.test(m.id))) it(`typed solution works: ${mission.id}`, () => {
    expect(runText(text(gradeSolutions[mission.id]), mission).success).toBe(true);
  });
  it('gives line-specific errors and never runs arbitrary code', () => {
    expect(() => parseCode('import os')).toThrow('Line 1');
    expect(() => parseCode('for step in range(3):\n  move_right()')).toThrow('four spaces');
    expect(() => parseCode('for step in range(999):\n    move_right()')).toThrow('2 to 5');
    expect(() => parseCode('score = 100')).toThrow('−10 to 10');
    expect(() => parseCode('else:\n    move_right()')).toThrow();
    expect(() => parseCode('move_right()\n'.repeat(101))).toThrow('100 lines');
    expect(() => parseCode('for step in range(2):\n    for step in range(2):\n        for step in range(2):\n            for step in range(2):\n                move_right()')).toThrow('three nested');
  });
  it('keeps text and blocks independently across save and course changes', () => {
    const save = emptySave(), id = 'grade-5-sequences-1';
    save.progress[id] = { ...freshProgress(missionIndex(id)), textCode: 'move_up()', codingMode: 'text', workspace: { blocks: {} } };
    const changed = switchCourse(switchCourse(save, 'grade-6'), 'grade-1');
    expect(parseSave(JSON.stringify(changed)).progress[id]).toMatchObject({ textCode: 'move_up()', codingMode: 'text', workspace: { blocks: {} } });
  });
});
describe('drawing practice', () => {
  for (const [sides, angle] of [[4,90],[3,120],[6,60],[8,45]]) it(`${sides} sides close using ${angle} degree exterior turns`, () => {
    const frames = drawProgram(`for side in range(${sides}):\n    forward(60)\n    turn(${angle})`), end = frames.at(-1)!;
    expect(end.x).toBeCloseTo(frames[0].x); expect(end.y).toBeCloseTo(frames[0].y);
  });
  it('bounds operations and the drawing page', () => {
    expect(() => drawProgram('forward(150)\nforward(150)')).toThrow('leaves the page');
    expect(() => drawProgram('for a in range(12):\n    for b in range(12):\n        for c in range(12):\n            turn(0)')).toThrow('500 drawing steps');
  });
  for (const [grade, activities] of Object.entries(drawingActivities)) {
    it(`${grade} has multiple activities and creative practice`, () => { expect(activities.length).toBeGreaterThanOrEqual(5); expect(activities.some(a => a.free)).toBe(true); });
    for (const activity of activities.filter(a => !a.free)) it(`${grade}: ${activity.title} reference draws within bounds and matches`, () => {
      const path = drawProgram(activity.reference);
      expect(path.some(p => p.draw)).toBe(true);
      expect(drawingMatches(path,path)).toBe(true);
      expect(penPath(path)).not.toContain('NaN');
    });
  }
  it('merges consecutive straight strokes without accepting a different shape', () => {
    expect(drawingMatches(drawProgram('forward(40)\nforward(40)'),drawProgram('forward(80)'))).toBe(true);
    expect(drawingMatches(drawProgram('forward(40)\nturn(90)\nforward(40)'),drawProgram('forward(80)'))).toBe(false);
  });
  it('bounds branch state and changing distances, and does not connect lifted ink', () => {
    expect(() => drawProgram('pop()')).toThrow('Use push()');
    expect(() => drawProgram('push()\nforward(20)')).toThrow('Finish each saved branch');
    expect(() => drawProgram('forward(distance)')).toThrow('Set distance');
    expect(() => drawProgram('distance = 150\ndistance += 10\nforward(distance)')).toThrow('1 to 150');
    const path = drawProgram('pen_up()\nforward(20)\npen_down()\nforward(20)');
    expect(path.filter(p => p.draw)).toHaveLength(1);
  });
});
describe('Grade 1 complete-topic evidence', () => {
  it('requires every learning stage, but neither bonuses nor perfect stars', () => {
    const save = emptySave();
    for (const id of [...sequenceCore, sequenceExtras[2],sequenceExtras[3]]) save.progress[id] = { ...freshProgress(missionIndex(id)), complete: true, stars: 1 };
    expect(sequenceEvidence(save).badge).toBe(false);
    save.topicRecords[SEQUENCE_TOPIC] = { watched: true, guided: true, mastered: true, masteryAttempts: 5 };
    expect(sequenceEvidence(save)).toMatchObject({ stars: 10, completed: 10, badge: true });
    expect(sequenceEvidence(parseSave(JSON.stringify(save))).badge).toBe(true);
    save.progress[sequenceExtras[2]].complete = false;
    expect(sequenceEvidence(save).badge).toBe(false);
  });
  it('old saves do not acquire a mastery badge', () => {
    expect(parseSave(JSON.stringify({ version: 1, progress: {} })).topicRecords).toEqual({});
  });
});
