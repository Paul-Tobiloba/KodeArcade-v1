import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { emptySave, parseSave, switchCourse, freshProgress } from './storage';
import { evaluateWorkspace } from './blockly';
import { missions } from './learning';
describe('age courses', () => {
  it('starts new young learners with a single arrow step', () => {
    const save = emptySave(); expect(save.course).toBe('arrows');
    expect(missions[save.current].solution).toEqual(['right']);
    const ws = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: { type: 'ka_arrow_right' } } }] } }, ws);
      expect(evaluateWorkspace(ws, missions[save.current]).success).toBe(true);
    } finally { ws.dispose(); }
  });
  it('keeps independent programs and completion after switching and reloading', () => {
    let save = emptySave(); const index = save.current; const id = missions[index].id;
    save.progress[id] = { ...freshProgress(index), complete: true };
    save = switchCourse(save, 'words'); expect(save.progress[id]).toBeUndefined();
    save.progress['first-steps'] = { ...freshProgress(0), attempts: 2 };
    save = switchCourse(parseSave(JSON.stringify(save)), 'arrows');
    expect(save.current).toBe(index); expect(save.progress[id].complete).toBe(true);
    save = switchCourse(parseSave(JSON.stringify(save)), 'words');
    expect(save.progress['first-steps'].attempts).toBe(2);
  });
  it('migrates existing text-course saves without losing progress', () => {
    const progress = { 'first-steps': { ...freshProgress(0), complete: true } };
    const save = parseSave(JSON.stringify({ version: 1, current: 0, progress }));
    expect(save.course).toBe('words'); expect(save.progress['first-steps'].complete).toBe(true);
  });
});
