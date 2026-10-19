import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { conceptMissions, conceptSources, conceptSolutions } from './conceptMissions';
import { evaluateWorkspace } from './blockly';
import { runText } from './textCoding';
import { parseConceptCode } from './conceptText';
import { missions } from './learning';
import { modulesFor } from './curriculum';
import { emptySave, freshProgress, SAVE_KEY } from './storage';
import { collectCloud, hydrateCloud, NAV_KEY } from './cloudProgress';
import { courseQuizIds, moduleQuiz, quizScore } from '../shared/quizzes';
import { progressDocument, validCourseDocument, summarizeProgress } from '../shared/progress';
import { localByteAnswer } from './byteQuestionHelp';
import { conceptPalette } from './conceptModel';
import { insertConceptBlock } from './ConceptKeyboard';
const task = (id: string) => conceptMissions.find(m => m.id === id)!;
describe('operators, Boolean logic and functions', () => {
  for (const mission of conceptMissions) it(`${mission.id}: authored block/text references demonstrate the concept`, () => {
    const ws = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [conceptSolutions[mission.id]] } }, ws);
      const block = evaluateWorkspace(ws, mission), text = runText(conceptSources[mission.id], mission);
      expect(block.success, block.message).toBe(true); expect(text.success, text.message).toBe(true);
      expect(text.frames.at(-1)?.score).toEqual(block.frames.at(-1)?.score);
      expect(text.frames.at(-1)?.lab).toEqual(block.frames.at(-1)?.lab);
      expect(modulesFor(`grade-${mission.id[6]}` as 'grade-3')[['operators', 'boolean', 'functions'].indexOf(mission.conceptTask!.topic) + 6].challengeIds).toContain(mission.id);
    } finally { ws.dispose(); }
  });
  it('adds 72 stable concept activities without altering existing numeric mission positions', () => {
    expect(conceptMissions).toHaveLength(72); expect(missions[61].id).toBe('grade-1-sequences-1');
    expect(modulesFor('grade-3')).toHaveLength(13); expect(modulesFor('grade-6').flatMap(m => m.challengeIds)).toHaveLength(90);
    expect(modulesFor('grade-1')).toHaveLength(3);
  });
  it('introduces parameter, return and logical blocks when their activity teaches them', () => {
    expect(conceptPalette('functions', 3, ['parameter', 'function_return'])).not.toContain('ka_parameter');
    expect(conceptPalette('functions', 5, ['function_call'])).not.toContain('ka_function_return');
    expect(conceptPalette('functions', 5, ['parameter'])).toContain('ka_parameter');
    expect(conceptPalette('functions', 5, ['function_return'])).toContain('ka_function_value');
    expect(conceptPalette('boolean', 3, ['compare:>'])).not.toContain('ka_boolean_not');
    expect(conceptPalette('boolean', 3, ['boolean_not'])).toContain('ka_boolean_not');
  });
  it('keyboard insertion builds typed expressions and preserves block IDs containing colons', () => {
    const ws = new Blockly.Workspace(), create = ws.newBlock.bind(ws); let sequence = 0;
    ws.newBlock = (type, id) => { const block = create(type, id ?? `block:${sequence++}`); Object.assign(block, { initSvg() {}, render() {} }); return block; };
    try {
      ws.newBlock('ka_start');
      const svg = ws as unknown as Blockly.WorkspaceSvg;
      const assign = insertConceptBlock(svg, 'ka_compute_score');
      const arithmetic = insertConceptBlock(svg, 'ka_arithmetic', `${assign}:VALUE`);
      insertConceptBlock(svg, 'ka_number', `${arithmetic}:A`);
      const second = insertConceptBlock(svg, 'ka_number', `${arithmetic}:B`);
      ws.getBlockById(second)!.setFieldValue('3', 'NUM');
      expect(evaluateWorkspace(ws, task('grade-3-operators-1')).success).toBe(true);
      expect(() => insertConceptBlock(svg, 'ka_boolean_value', `${arithmetic}:A`)).toThrow('matching type');
      expect(evaluateWorkspace(ws, task('grade-3-operators-1')).success).toBe(true);
    } finally { ws.dispose(); }
  });
  it.each([
    ['grade-3-operators-1', 'score = 5', 'named in the goal'],
    ['grade-4-operators-4', 'score = 12 / 0', 'divide by zero'],
    ['grade-3-operators-1', 'score = 4 / 2', 'Division starts'],
    ['grade-4-operators-1', 'score = 11 % 4', 'remainder starts'],
    ['grade-6-operators-1', 'score = 1000 * 1000', 'finite number'],
    ['grade-5-operators-1', 'score = score + 1', 'Set score before'],
    ['grade-3-boolean-1', 'show_boolean(1)', 'true/false expression'],
    ['grade-3-boolean-1', 'show_boolean(True + 1)', 'Type mismatch'],
    ['grade-3-boolean-1', 'show_boolean(2 >= 1)', 'Grade 3'],
    ['grade-5-functions-1', 'missing()', 'Define missing'],
    ['grade-5-functions-3', 'return 2', 'inside a function'],
    ['grade-5-functions-2', 'show_number(value)', 'inside a function'],
    ['grade-3-functions-1', 'def f(value):\n    show_number(value)\nf(2)', 'blocks introduced'],
    ['grade-5-functions-2', 'def f(value):\n    show_number(value)\nf()', 'needs one numeric argument'],
    ['grade-5-functions-1', 'def f():\n    show_number(2)\nf(3)', 'has no input'],
    ['grade-5-functions-3', 'def f():\n    show_number(2)\nshow_number(f())', 'does not return'],
    ['grade-6-functions-1', 'def f():\n    f()\nf()', 'Recursive calls'],
    ['grade-6-functions-1', 'def f():\n    show_number(2)\ndef f():\n    show_number(3)', 'different name'],
    ['grade-6-functions-1', 'def f():\n    score = 2\nf()', 'blocks introduced'],
  ])('%s rejects a mistaken or unsupported program', (id, code, error) => { const result = runText(code, task(id)); expect(result.success).toBe(false); expect(result.message).toContain(error); });
  it.each(['__import__("os")', 'score = obj.secret', 'score = (1).__class__', 'while True:\n    show_number(1)', 'score = 1 < 2 < 3', 'score = 1e999', 'show_number([1,2])', 'def bad-name():\n    show_number(2)', 'def f(x):\n    show_number(x)'])('rejects arbitrary Python syntax %s', source => expect(() => parseConceptCode(source)).toThrow());
  it('follows arithmetic precedence and Python remainder for negative operands', () => {
    const base = task('grade-6-operators-1');
    expect(runText('score = 2 + 3 * 2', { ...base, conceptTask: { topic: 'operators', required: [], score: 8 } }).success).toBe(true);
    expect(runText('score = (2 + 3) * 2', { ...base, conceptTask: { topic: 'operators', required: [], score: 10 } }).success).toBe(true);
    expect(runText('score = -5 % 3', { ...base, conceptTask: { topic: 'operators', required: [], score: 1 } }).success).toBe(true);
  });
  it('treats showing a value and returning it as different operations, and return ends one call', () => {
    const base = task('grade-6-functions-3');
    const result = runText('def f(value):\n    return value + 1\n    show_number(9)\nshow_number(f(2))\nshow_number(f(4))', { ...base, conceptTask: { topic: 'functions', required: ['function_return'], output: [3, 5] } });
    expect(result.success, result.message).toBe(true); expect(result.frames.at(-1)?.lab?.calls).toBe(2);
  });
  it('bounds repeated calls and output', () => {
    const base = task('grade-6-functions-1');
    const result = runText('def f():\n    show_number(1)\nfor i in range(5):\n    for j in range(5):\n        f()', { ...base, conceptTask: { topic: 'functions', required: ['repeat'], output: [1] } });
    expect(result.success).toBe(false); expect(result.message).toMatch(/24 values|nested/);
  });
  it('saves expression blocks, typed function definitions and exact quiz versions in the cloud contract', () => {
    const id = 'grade-6-functions-6', save = { ...emptySave(), course: 'grade-6' as const, current: missions.findIndex(m => m.id === id) };
    save.progress[id] = { ...freshProgress(save.current), workspace: { blocks: { languageVersion: 0, blocks: [conceptSolutions[id]] } }, codingMode: 'text', textCode: conceptSources[id], complete: true, stars: 5 };
    const entries = { [SAVE_KEY]: JSON.stringify(save), [NAV_KEY]: JSON.stringify({ view: 'challenge' }) }, value = collectCloud('grade-6', entries)!;
    expect(validCourseDocument('grade-6', progressDocument.parse(value))).toBe(true);
    expect(collectCloud('grade-6', hydrateCloud('grade-6', value))).toEqual(value);
    expect(summarizeProgress('grade-6', { revision: 1, document: value, updatedAt: null })).toMatchObject({ completed: 1, total: 90, quizTotal: 13 });
  });
  it('provides topic-centred questions and on-device help, not route trivia', () => {
    for (const grade of [3, 4, 5, 6]) for (const id of courseQuizIds(`grade-${grade}`)) {
      const questions = moduleQuiz(id); expect(questions).toHaveLength(5); expect(quizScore(id, questions.map(q => q.correct))).toBe(5);
      if (!id.includes('sequences')) expect(JSON.stringify(questions)).not.toMatch(/Byte|facing|squares|path ahead|turn_right|turn_left/);
    }
    expect(localByteAnswer('Explain functions in coding.', 'functions', '')).toContain('definition');
    expect(localByteAnswer('Explain Boolean operators.', 'boolean', '')).toContain('AND');
  });
});
