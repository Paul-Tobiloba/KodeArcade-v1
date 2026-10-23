import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { creativeMissions, creativeSources, creativeSolutions } from './creativeMissions';
import { evaluateWorkspace } from './blockly';
import { runText } from './textCoding';
import { parseConceptCode } from './conceptText';
import { conceptPalette, creativeCategories } from './conceptModel';
import { readSpriteSettings, spriteSettings } from './spriteModel';
import { missions } from './learning';
import { modulesFor, moduleFor } from './curriculum';
import { emptySave, freshProgress, SAVE_KEY } from './storage';
import { collectCloud, hydrateCloud } from './cloudProgress';
import { progressDocument, validCourseDocument, summarizeProgress } from '../shared/progress';
import { courseQuizIds, moduleQuiz, quizScore } from '../shared/quizzes';
const free = creativeMissions.find(m => m.id === 'grade-6-creative-4')!;
function execute(code: string, event?: 'click', prior?: ReturnType<typeof evaluateWorkspace>['frames'][number]['sprite']) {
  const ws = new Blockly.Workspace();
  try { Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [parseConceptCode(code)] } }, ws); return evaluateWorkspace(ws, { ...free, spriteEvent: event, spriteInitial: prior }); } finally { ws.dispose(); }
}
describe('creative projects and free Byte Lab', () => {
  for (const mission of creativeMissions) it(`${mission.id} reference runs in blocks and teaching text`, () => {
    const ws = new Blockly.Workspace(); try {
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [creativeSolutions[mission.id]] } }, ws);
      const result = evaluateWorkspace(ws, mission), text = runText(creativeSources[mission.id], mission);
      expect(result.success, result.message).toBe(true); expect(text.success, text.message).toBe(true);
      expect(text.frames.at(-1)?.sprite).toEqual(result.frames.at(-1)?.sprite);
    } finally { ws.dispose(); }
  });
  it('keeps original indices stable and excludes free build from scoring', () => {
    expect(missions[61].id).toBe('grade-1-sequences-1'); expect(creativeMissions).toHaveLength(16);
    for (const grade of [3, 4, 5, 6]) {
      const module = moduleFor(`grade-${grade}-creative-4`);
      expect(module.sandboxId).toBe(`grade-${grade}-creative-4`); expect(module.challengeIds).toHaveLength(3);
      expect(modulesFor(`grade-${grade}` as 'grade-3').flatMap(m => m.challengeIds)).not.toContain(module.sandboxId);
    }
  });
  it('categorizes every available creative block exactly once and bands function inputs', () => {
    const types = creativeCategories.flatMap(c => c.types);
    expect(new Set(types).size).toBe(types.length); expect(new Set(types)).toEqual(new Set(conceptPalette('creative', 6)));
    expect(conceptPalette('creative', 3)).not.toContain('ka_parameter'); expect(conceptPalette('creative', 5)).toContain('ka_function_return');
  });
  it('clicks run only the registered body and retain variables and position across clicks', () => {
    const code = 'on_click:\n    score = score + 1\n    forward(10)\n    say_number(score)\nscore = 0';
    const play = execute(code); expect(play.success, play.message).toBe(true); expect(play.frames.at(-1)?.sprite?.events).toEqual([]);
    const one = execute(code, 'click', play.frames.at(-1)?.sprite); expect(one.success, one.message).toBe(true);
    expect(one.frames.at(-1)?.sprite).toMatchObject({ x: 10, score: 1, speech: '1', events: ['click'] });
    const two = execute(code, 'click', one.frames.at(-1)?.sprite); expect(two.frames.at(-1)?.sprite).toMatchObject({ x: 20, score: 2, speech: '2', events: ['click', 'click'] });
  });
  it('reconstructs functions for a click without mutating or resaving the workspace', () => {
    const code = 'def greet():\n    say("hello")\non_click:\n    greet()\nscore = 1';
    const ws = new Blockly.Workspace(); try {
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [parseConceptCode(code)] } }, ws);
      const prior = evaluateWorkspace(ws, free).frames.at(-1)?.sprite, before = Blockly.serialization.workspaces.save(ws);
      expect(evaluateWorkspace(ws, { ...free, spriteEvent: 'click', spriteInitial: prior }).success).toBe(true);
      expect(Blockly.serialization.workspaces.save(ws)).toEqual(before);
    } finally { ws.dispose(); }
  });
  it('detects crossing another character, not just landing on it', () => {
    const result = execute('on_touch:\n    say("Met you")\nforward(90)');
    expect(result.success, result.message).toBe(true); expect(result.frames.at(-1)?.sprite).toMatchObject({ x: 90, speech: 'Met you', events: ['touch'] });
  });
  it('does not repeatedly fire while remaining in contact, but fires on re-entry', () => {
    const result = execute('on_touch:\n    say("hello")\nforward(50)\nforward(5)\nbackward(55)\nforward(50)');
    expect(result.frames.at(-1)?.sprite?.events).toEqual(['touch', 'touch']);
  });
  it('stops at the border; a bounce reflects the next move', () => {
    const result = execute('on_edge:\n    bounce()\nforward(150)\nforward(20)');
    expect(result.success, result.message).toBe(true); expect(result.frames.at(-1)?.sprite).toMatchObject({ x: 80, angle: 180, events: ['edge'] });
  });
  it('go_to checks its destination, unlike continuous movement', () => {
    const result = execute('on_touch:\n    say("hello")\ngo_to(90, 0)'); expect(result.frames.at(-1)?.sprite?.events).toEqual([]);
  });
  it.each([
    ['show_boolean(not touching_edge())', [true]],
    ['show_boolean(touching_edge() or touching_character())', [false]],
    ['show_boolean(not touching_edge() and not touching_character())', [true]],
    ['go_to(100, 0)\nshow_boolean(not touching_edge())', [false]],
  ] as const)('keeps collision predicates composable after adding concept traces: %s', (code, output) => {
    const blocks = execute(code), text = runText(code, free);
    expect(blocks.success, blocks.message).toBe(true);
    expect(text.success, text.message).toBe(true);
    expect(blocks.frames.at(-1)?.lab?.output).toEqual(output);
    expect(text.frames.at(-1)?.lab?.output).toEqual(output);
    // Creative projects keep their existing lab-frame shape, not game metadata.
    expect(blocks.frames.at(-1)?.lab).toEqual({ calls: 0, output: [...output] });
  });
  it('turns by degrees and backward preserves facing', () => {
    const result = execute('turn_left(90)\nforward(20)\nbackward(10)');
    expect(result.frames.at(-1)?.sprite?.y).toBeCloseTo(10); expect(result.frames.at(-1)?.sprite?.angle).toBe(90);
  });
  it('allows safe speech, including # and escaped quotes, as data rather than HTML', () => {
    const result = execute('say("<b>Code #1</b> \\"hello\\"")');
    expect(result.success, result.message).toBe(true); expect(result.frames.at(-1)?.sprite?.speech).toBe('<b>Code #1</b> "hello"');
  });
  it.each([
    ['on_click:\n    say("hi")\non_click:\n    say("again")', 'one handler'],
    ['for step in range(2):\n    on_click:\n        say("hi")', 'directly below Play'],
    ['forward(201)', 'at most 200'],
    ['go_to(101, 0)', 'coordinates'],
    ['if 1:\n    say("yes")\nelse:\n    say("no")', 'Type mismatch'],
    ['say_number(1 / 0)', 'divide by zero'],
    ['def again():\n    again()\nagain()', 'Recursive'],
  ])('rejects invalid program %s', (code, message) => { const result = runText(code, free); expect(result.success).toBe(false); expect(result.message).toContain(message); });
  it('bounds chains of collision events', () => {
    const result = execute('on_edge:\n    go_to(0, 0)\n    go_to(100, 0)\ngo_to(100, 0)');
    expect(result.success).toBe(false); expect(result.message).toContain('Too many triggered events');
  });
  it('reports missing click handlers and does not invent state before Play', () => {
    expect(execute('say("hi")', 'click').message).toContain('Press Play');
    const prior = execute('say("hi")').frames.at(-1)?.sprite; expect(execute('say("hi")', 'click', prior).message).toContain('Add a sprite-click');
  });
  it('stores choices with private program drafts and includes no sandbox points in reports', () => {
    const id = 'grade-6-creative-4', save = { ...emptySave(), course: 'grade-6' as const, current: missions.findIndex(m => m.id === id) };
    const settings = spriteSettings({ character: 'Fix', buddy: 'Gigi', background: 'meadow', buddyX: -30, buddyY: 20 });
    save.progress[id] = { ...freshProgress(save.current), workspace: { blocks: { languageVersion: 0, blocks: [{ ...creativeSolutions[id], data: JSON.stringify(settings) }] } }, complete: true, stars: 5 };
    const document = progressDocument.parse(collectCloud('grade-6', { [SAVE_KEY]: JSON.stringify(save) }));
    expect(validCourseDocument('grade-6', document)).toBe(true);
    const restored = JSON.parse(hydrateCloud('grade-6', document)[SAVE_KEY]);
    expect(readSpriteSettings(restored.progress[id].workspace)).toEqual(settings);
    expect(summarizeProgress('grade-6', { revision: 1, document, updatedAt: null })).toMatchObject({ completed: 0, stars: 0, total: 90, quizTotal: 13 });
  });
  it('sanitizes scene metadata and teaches creative concepts with real quiz answers', () => {
    expect(spriteSettings({ character: '<script>', buddyX: Infinity, buddyY: 10000 })).toMatchObject({ character: 'Byte', buddyX: 50, buddyY: 100 });
    expect(readSpriteSettings({ blocks: { blocks: [{ type: 'ka_start', data: 'not JSON' }] } })).toEqual(spriteSettings({}));
    for (const grade of [3, 4, 5, 6]) { const id = `grade-${grade}-creative`; expect(courseQuizIds(`grade-${grade}`)).toContain(id); expect(moduleQuiz(id)).toHaveLength(5); expect(quizScore(id, moduleQuiz(id).map(q => q.correct))).toBe(5); }
  });
});
