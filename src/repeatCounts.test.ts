import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import './blockly';
import { parseCode, runText, drawProgram } from './textCoding';
import { missions, makeBlock, runProgram, type Mission } from './learning';
import { emptySave, parseSave, SAVE_KEY } from './storage';
import { progressDocument } from '../shared/progress';
import { collectCloud, hydrateCloud } from './cloudProgress';
import { validRepeatCount } from '../shared/repeats';
const route: Mission = { ...missions[2], id: 'grade-3-loops-1', title: 'Synthetic loop check', concept: 'loops', description: '', goal: '', size: 10, start: { x: 0, y: 0 }, end: { x: 9, y: 0 }, walls: [], maxBlocks: 24, loops: true, requireLoop: true };
describe('repeat counts are not capped by lesson difficulty', () => {
  it.each([0, 1, 6, 10, 25, 100, 1000, Number.MAX_SAFE_INTEGER])('accepts whole count %s in fields and text', count => {
    expect(validRepeatCount(count)).toBe(true);
    expect(parseCode(`for step in range(${count}):\n    move_right()`)[0].value).toBe(count);
    const ws = new Blockly.Workspace();
    try { const block = ws.newBlock('ka_repeat'); block.setFieldValue(String(count), 'COUNT'); expect(block.getFieldValue('COUNT')).toBe(count); } finally { ws.dispose(); }
  });
  it.each([-1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])('rejects invalid numeric representation %s', count => expect(validRepeatCount(count)).toBe(false));
  it('runs nine movements in both block and text route programs', () => {
    expect(runText('for step in range(9):\n    move_right()', route)).toMatchObject({ success: true });
    expect(runProgram(route, [{ ...makeBlock('repeat'), count: 9 }]).frames).toHaveLength(9);
  });
  it('runs larger relative, function and drawing loops without an authoring cap', () => {
    expect(runText('for step in range(25):\n    turn_left()', { ...route, id: 'grade-4-loops-1', end: route.start }).success).toBe(true);
    const mission = missions.find(m => m.id === 'grade-5-functions-3')!;
    const result = runText('for step in range(10):\n    show_number(3)', { ...mission, conceptTask: { topic: 'functions', required: ['repeat'], output: Array(10).fill(3) } });
    expect(result.success).toBe(true);
    expect(drawProgram('for side in range(36):\n    turn(10)')).toHaveLength(37);
  });
  it('keeps operation guards for huge and nested zero-work loops', () => {
    const huge = 'for step in range(1000000000):\n    for skip in range(0):\n        move_right()';
    expect(runText(huge, route).message).toContain('500 operations');
    expect(runText(huge, { ...route, id: 'grade-4-loops-1' }).message).toContain('too many steps');
    expect(() => drawProgram('for side in range(1000000000):\n    turn(0)')).toThrow('500 drawing steps');
  });
  it('roundtrips higher legacy counts through local and private cloud validation', () => {
    const save = emptySave(), id = 'grade-2-loops-1';
    save.course = 'grade-2'; save.current = missions.findIndex(m => m.id === id);
    save.progress[id] = { blocks: [{ ...makeBlock('repeat'), count: 25 }], attempts: 0, hints: 0, complete: false };
    expect(parseSave(JSON.stringify(save)).progress[id].blocks[0].count).toBe(25);
    const document = collectCloud('grade-2', { [SAVE_KEY]: JSON.stringify(save) })!;
    expect(progressDocument.parse(document).progress[id].blocks[0].count).toBe(25);
    expect(collectCloud('grade-2', hydrateCloud('grade-2', document))!.progress[id].blocks[0].count).toBe(25);
  });
  it('preserves higher counts when serialized Blockly work is restored', () => {
    const ws = new Blockly.Workspace(), restored = new Blockly.Workspace();
    try { const block = ws.newBlock('ka_repeat'); block.setFieldValue('25', 'COUNT'); Blockly.serialization.workspaces.load(Blockly.serialization.workspaces.save(ws), restored); expect(restored.getBlocksByType('ka_repeat', false)[0].getFieldValue('COUNT')).toBe(25); } finally { ws.dispose(); restored.dispose(); }
  });
});
