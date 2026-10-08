import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { courses } from './courses';
import { gradeMissions, gradeSolutions } from './gradeMissions';
import { modulesFor, moduleFor, nextChallenge } from './curriculum';
import { evaluateWorkspace } from './blockly';
import { emptySave, freshProgress, parseSave, switchCourse } from './storage';
import { missions } from './learning';

describe('Grade 1–6 mapping', () => {
  it('has the six grade routes, increasing sizes and appropriate topics', () => {
    expect(courses.map(c => c.size)).toEqual([5,5,6,7,8,10]);
    expect(courses.map(c => c.arrows)).toEqual([true,true,false,false,false,false]);
    for (const course of courses) {
      const modules = modulesFor(course.id);
      expect(modules.map(m => m.topicId)).toEqual([...course.topics, 'project']);
      for (const module of modules) {
        expect(module.challengeIds.length).toBe(module.topicId === 'project' ? 1 : 10);
        for (const id of module.challengeIds) {
          expect(moduleFor(id).id).toBe(module.id);
          expect(gradeMissions.find(m => m.id === id)?.size).toBe(course.size);
        }
      }
      expect(nextChallenge(`${course.id}-rescue-project`)).toBeUndefined();
    }
    expect(gradeMissions).toHaveLength(316);
    expect(new Set(gradeMissions.map(m => m.id)).size).toBe(316);
  });
  it('keeps grade and legacy work independent after reload', () => {
    let save = switchCourse(emptySave(), 'arrows');
    const legacyId = missions[save.current].id;
    save.progress[legacyId] = { ...freshProgress(save.current), complete: true };
    save = switchCourse(save, 'grade-6');
    expect(save.progress[legacyId]).toBeUndefined();
    const gradeId = missions[save.current].id;
    save.progress[gradeId] = { ...freshProgress(save.current), complete: true };
    save = switchCourse(parseSave(JSON.stringify(save)), 'arrows');
    expect(save.progress[legacyId].complete).toBe(true);
    save = switchCourse(parseSave(JSON.stringify(save)), 'grade-6');
    expect(save.progress[gradeId].complete).toBe(true);
  });
  it('preserves a chosen grade-six project destination outside the old 5×5 area', () => {
    const save = switchCourse(emptySave(), 'grade-6'), id = 'grade-6-rescue-project';
    save.progress[id] = { ...freshProgress(missions.findIndex(m => m.id === id)), end: { x: 9, y: 8 } };
    expect(parseSave(JSON.stringify(save)).progress[id].end).toEqual({ x: 9, y: 8 });
  });
  for (const mission of gradeMissions) it(`${mission.id} has a valid complete reference program`, () => {
    const ws = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: gradeSolutions[mission.id] } }] } }, ws);
      const outcome = evaluateWorkspace(ws, mission);
      expect(outcome.success, outcome.message).toBe(true);
      for (const frame of outcome.frames) {
        expect(frame.x).toBeGreaterThanOrEqual(0); expect(frame.x).toBeLessThan(mission.size);
        expect(frame.y).toBeGreaterThanOrEqual(0); expect(frame.y).toBeLessThan(mission.size);
      }
    } finally { ws.dispose(); }
  });
});
