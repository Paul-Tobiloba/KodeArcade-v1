import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { collectionMissions, collectionSolutions } from './collectionMissions';
import { evaluateWorkspace } from './blockly';
import { missions, type Mission } from './learning';
import { modulesFor, moduleFor } from './curriculum';
import { emptySave, parseSave } from './storage';
import { drawProgram, parseCode, runText } from './textCoding';
import { statementCount } from './programLimits';
import { drawingActivities } from './drawingActivities';

const task = (slot: string) => collectionMissions.find(m => m.id === `grade-5-${slot}-world-v2`)!;
const runState = (mission: Mission, state: Blockly.serialization.blocks.State) => {
  const ws = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load({blocks:{languageVersion:0,blocks:[{type:'ka_start',next:{block:state}}]}},ws);
    return evaluateWorkspace(ws,mission);
  } finally { ws.dispose(); }
};
describe('authored core world challenges', () => {
  for (const mission of collectionMissions) it(`${mission.id}: complete reference fits its budget`, () => {
    const outcome = runState(mission,collectionSolutions[mission.id]);
    expect(outcome.success,outcome.message).toBe(true);
    expect(moduleFor(mission.id).challengeIds).toContain(mission.id);
    expect(moduleFor(mission.id).challengeIds).not.toContain(mission.replaces);
    if (mission.collectibles) expect(outcome.frames.at(-1)?.collected).toHaveLength(mission.collectibles.positions.length);
  });
  it('keeps ten core challenges, no extra practice section, and archives old work', () => {
    for (const grade of ['grade-3','grade-4','grade-5','grade-6'] as const) for (const module of modulesFor(grade)) expect(module.challengeIds).toHaveLength(module.topicId === 'project' ? 1 : 10);
    const changed = task('conditionals-3'), save = emptySave();
    save.course = 'grade-5'; save.current = missions.findIndex(m => m.id === changed.replaces);
    save.progress[changed.replaces!] = {blocks:[],attempts:1,hints:0,complete:true,stars:5,lessonSeen:true};
    const loaded = parseSave(JSON.stringify(save));
    expect(missions[loaded.current].id).toBe(changed.id);
    expect(loaded.progress[changed.replaces!].complete).toBe(true);
    expect(loaded.progress[changed.id]).toBeUndefined();
  });
  it('rechecks carrot presence after a pickup, taking both branches', () => {
    const outcome = runText('for group in range(3):\n    for check in range(5):\n        if item_here():\n            pick_up()\n        else:\n            move_next()',task('conditionals-3'));
    expect(outcome.success,outcome.message).toBe(true);
    expect(outcome.frames.filter(f => f.note?.includes('Picked up'))).toHaveLength(5);
    expect(outcome.frames.some(f => f.note?.includes('not here: run ELSE'))).toBe(true);
  });
  it('cannot collect an item twice or pick from an empty square', () => {
    expect(runText('pick_up()\npick_up()',task('conditionals-3')).message).toContain('no item');
    expect(runText('pick_up()',task('conditionals-4')).message).toContain('no item');
  });
  it('following the path without pickups is not success', () => {
    const outcome = runText('move_next()\nmove_next()', {...task('conditionals-3'),requireLoop:false});
    expect(outcome.success).toBe(false); expect(outcome.message).toContain('Collect all');
  });
  it('finishes immediately after five carrots, before the path ends', () => {
    const mission = task('conditionals-4');
    const outcome = runState(mission,collectionSolutions[mission.id]);
    expect(outcome.success,outcome.message).toBe(true);
    expect(outcome.frames.at(-1)?.collected).toHaveLength(5);
    expect(outcome.frames.at(-1)).toMatchObject(mission.trail![7]);
    expect(outcome.frames.at(-1)).not.toMatchObject(mission.end);
    expect(outcome.message).toContain('no finish tile');
    expect(runState(mission,collectionSolutions[mission.id]).frames).toHaveLength(outcome.frames.length);
  });
  it('uses five distinct carrots and contiguous trails around visible holes', () => {
    for (const mission of collectionMissions.filter(m => m.collectOnly)) {
      expect(new Set(mission.collectibles!.positions.map(p => `${p.x},${p.y}`)).size).toBe(5);
      mission.trail!.forEach((p,i,trail) => {
        expect(mission.walls).not.toContainEqual(p);
        if (i) expect(Math.abs(p.x-trail[i-1].x)+Math.abs(p.y-trail[i-1].y)).toBe(1);
      });
      for (const hole of mission.holes!) expect(mission.walls).toContainEqual(hole);
    }
    expect(runText('move_next()',task('conditionals-3')).message).toContain('Collect all');
    expect(runText('move_next()\nmove_up()',task('conditionals-3')).message).toContain('hole');
  });
  it('needs the key and proximity to unlock; cannot walk through a locked gate', () => {
    expect(runText('move_right()\nopen_gate()',task('conditionals-7')).message).toContain('key');
    expect(runText('open_gate()',task('conditionals-7')).message).toContain('beside');
    expect(runText('move_right()\nmove_right()',task('conditionals-7')).message).toContain('locked');
    const outcome = runState(task('conditionals-7'),collectionSolutions[task('conditionals-7').id]);
    expect(outcome.frames.some(f => f.gateOpen === false)).toBe(true);
    expect(outcome.frames.at(-1)?.gateOpen).toBe(true);
  });
  it('skips the key hunt for an already-open gate', () => {
    const mission = task('conditionals-8'), outcome = runState(mission,collectionSolutions[mission.id]);
    expect(outcome.success).toBe(true);
    expect(outcome.frames.every(f => f.y === 2)).toBe(true);
    expect(outcome.frames.some(f => f.note?.includes('no, skip DO'))).toBe(true);
  });
  it('falls into an unbridged river and restores the world on the next run', () => {
    const mission = task('conditionals-9');
    const failure = runText('move_right()\nmove_right()',mission);
    expect(failure.success).toBe(false); expect(failure.message).toContain('Splash');
    expect(failure.frames.at(-1)?.fell).toBe(true);
    const good = runState(mission,collectionSolutions[mission.id]);
    expect(good.success).toBe(true); expect(good.frames.at(-1)?.bridgeBuilt).toBe(true);
    expect(runText('move_right()\nmove_right()',mission).success).toBe(false);
  });
  it('skips building when the bridge is already safe', () => {
    const mission = task('conditionals-10'), outcome = runState(mission,collectionSolutions[mission.id]);
    expect(outcome.success).toBe(true);
    expect(outcome.frames.some(f => f.note?.startsWith('Bridge built.'))).toBe(false);
    expect(runText('move_right()\nbuild_bridge()',mission).message).toContain('already exists');
  });
  it('counts only pickups, not empty squares', () => {
    const mission = task('variables-7'), outcome = runState(mission,collectionSolutions[mission.id]);
    expect(outcome.success).toBe(true); expect(outcome.frames.at(-1)?.score).toBe(3);
    expect(runText('score = 3',mission).message).toContain('Start score at 0');
    expect(runText('score = 0\nscore += 1',mission).message).toContain('after each pickup');
  });
});

describe('instruction budgets', () => {
  it('counts nested commands once, with ELSE part of the IF block', () => {
    expect(statementCount(parseCode('for step in range(5):\n    if item_here():\n        pick_up()\n    else:\n        move_right()'))).toBe(4);
  });
  it('enforces the same budget in headless Blockly and Text mode', () => {
    const mission = missions.find(m => m.id === 'grade-5-loops-9')!;
    const source = [...Array(2).fill('move_up()'),...Array(2).fill('move_right()'),...Array(20).fill('move_up()')].join('\n');
    expect(runText(source,mission).message).toContain(`no more than ${mission.maxBlocks}`);
    expect(runState({...mission,maxBlocks:1},{type:'ka_repeat',fields:{COUNT:2},inputs:{DO:{block:{type:'ka_up'}}}}).message).toContain('no more than 1');
  });
  it('allows every existing drawing reference within a written-instruction budget', () => {
    for (const activities of Object.values(drawingActivities)) for (const activity of activities.filter(a => a.reference)) {
      const limit = statementCount(parseCode(activity.reference,true));
      expect(() => drawProgram(activity.reference,limit,activity.reference.includes('for '))).not.toThrow();
    }
  });
  it('rejects unrolled drawing repetitions and supports the compact loop', () => {
    const square = 'for side in range(4):\n    forward(40)\n    turn(90)';
    expect(() => drawProgram(square,3,true)).not.toThrow();
    expect(() => drawProgram('forward(40)\nturn(90)\n'.repeat(4),3,true)).toThrow('no more than 3');
    expect(() => drawProgram('forward(40)',3,true)).toThrow('for loop');
  });
});
