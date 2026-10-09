import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { evaluateWorkspace } from './blockly';
import { gradeMissions, gradeSolutions } from './gradeMissions';
import { worldMission } from './worldMission';
import { emptySave, freshProgress, parseSave } from './storage';
import { missions, same } from './learning';

describe('semantic tile worlds', () => {
  for (const mission of gradeMissions) it(`${mission.id} preserves its reference solution and goals`, () => {
    const rendered = worldMission(mission, 'tiles-v1');
    const ws = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: gradeSolutions[mission.id] } }] } }, ws);
      const outcome = evaluateWorkspace(ws, rendered);
      expect(outcome.success, outcome.message).toBe(true);
      expect(rendered.end).toEqual(mission.end);
      expect(rendered.start).toEqual(mission.start);
      for (const wall of mission.walls) expect(rendered.walls.some(p => same(p, wall))).toBe(true);
      expect(rendered.walls.some(p => same(p, rendered.start) || same(p, rendered.end))).toBe(false);
    } finally { ws.dispose(); }
  });
  it('keeps old collision maps and user-designed projects untouched', () => {
    for (const mission of missions) expect(worldMission(mission, 'open-v1')).toBe(mission);
    for (const mission of gradeMissions.filter(m => m.id.endsWith('rescue-project'))) expect(worldMission(mission, 'tiles-v1')).toBe(mission);
  });
  it('persists map version and safely defaults old saves to their original maps', () => {
    const save = emptySave(), id = missions[save.current].id;
    save.progress[id] = freshProgress(save.current);
    expect(parseSave(JSON.stringify(save)).progress[id].worldLayout).toBe('tiles-v1');
    delete save.progress[id].worldLayout;
    expect(parseSave(JSON.stringify(save)).progress[id].worldLayout).toBeUndefined();
    expect(worldMission(missions[save.current], parseSave(JSON.stringify(save)).progress[id].worldLayout)).toBe(missions[save.current]);
  });
});
