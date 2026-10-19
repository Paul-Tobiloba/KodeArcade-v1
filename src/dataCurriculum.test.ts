import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { evaluateWorkspace } from './blockly';
import { dataMissions, dataSolutions } from './dataMissions';
import { runText } from './textCoding';
import { missions } from './learning';
import { courses } from './courses';
import { modulesFor, moduleFor, nextChallenge } from './curriculum';
import { emptySave, freshProgress, parseSave, SAVE_KEY } from './storage';
import { collectCloud, hydrateCloud } from './cloudProgress';
import { progressDocument, validCourseDocument, summarizeProgress } from '../shared/progress';
import { courseQuizIds, currentQuizId, emptyQuiz, moduleQuiz } from '../shared/quizzes';
import { sequenceCore, sequenceEvidence, sequenceExtras, SEQUENCE_TOPIC } from './topicJourney';
import type { serialization } from 'blockly/core';

function source(first: serialization.blocks.State, indent = ''): string {
  const f = first.fields ?? {};
  const literal = String(f.VALUE), index = String(f.INDEX), direction = JSON.stringify(f.DIRECTION), property = JSON.stringify(f.PROPERTY);
  const lines: Record<string, string> = {
    ka_move_steps: `move(${direction}, ${literal})`,
    ka_list_set: `steps = [${f.ITEMS}]`,
    ka_list_append: `steps.append(${literal})`,
    ka_list_update: `steps[${index}] = ${literal}`,
    ka_list_move: `move(${direction}, steps[${index}])`,
    ka_object_set: `robot = {"speed": ${f.SPEED}, "energy": ${f.ENERGY}}`,
    ka_object_update: `robot[${property}] = ${literal}`,
    ka_object_move: `move(${direction}, robot[${property}])`,
    ka_object_from_list: `robot[${property}] = steps[${index}]`,
  };
  const line = first.type === 'ka_repeat' ? `for step in range(${f.COUNT}):\n${source(first.inputs!.DO.block!, indent + '    ')}` : lines[first.type];
  if (!line) throw new Error(`Missing test writer for ${first.type}`);
  return indent + line + (first.next?.block ? '\n' + source(first.next.block, indent) : '');
}

describe('consolidated foundations and real data modules', () => {
  it('has one ten-task sequence/direction module and six tasks for each new older-grade concept', () => {
    for (const course of courses) {
      const modules = modulesFor(course.id), foundations = modules[0];
      expect(foundations.title).toBe('Sequences, directions & order');
      expect(foundations.challengeIds).toHaveLength(10);
      expect(foundations.challengeIds.filter(id => id.includes('-directions-'))).toHaveLength(5);
      expect(modules.some(m => m.topicId === 'directions')).toBe(false);
      expect(courseQuizIds(course.id)).toEqual(modules.map(m => currentQuizId(m.id)));
      expect(modules.filter(m => ['statements', 'lists', 'objects'].includes(m.topicId!))).toHaveLength(course.grade! >= 3 ? 3 : 0);
      expect(modules.flatMap(m => m.challengeIds)).toHaveLength(course.grade === 1 ? 21 : course.grade === 2 ? 31 : 90);
    }
    expect(sequenceCore).toEqual(modulesFor('grade-1')[0].challengeIds);
    expect(dataMissions).toHaveLength(72);
  });
  it('retains original mission indices, saved older work and retired quiz answers', () => {
    expect(missions[61].id).toBe('grade-1-sequences-1');
    expect(missions[91].id).toBe('grade-1-rescue-project');
    const old = emptySave(), id = 'grade-1-directions-1', current = missions.findIndex(m => m.id === id);
    old.current = current; old.progress[id] = { ...freshProgress(current), complete: true, stars: 4 };
    old.quizzes['grade-1-directions'] = emptyQuiz();
    const reloaded = parseSave(JSON.stringify(old));
    expect(reloaded.current).toBe(current); expect(reloaded.progress[id].stars).toBe(4);
    expect(moduleFor(id).id).toBe('grade-1-sequences');
    expect(nextChallenge(id)).toBe('grade-1-debugging-1');
    const cloud = collectCloud('grade-1', { [SAVE_KEY]: JSON.stringify(reloaded) })!;
    expect(validCourseDocument('grade-1', progressDocument.parse(cloud))).toBe(true);
    expect(cloud.quizzes!['grade-1-directions']).toEqual(emptyQuiz());
    expect(moduleQuiz('grade-1-directions')).toHaveLength(5);
  });
  it('preserves previously earned Grade 1 badges without granting new challenge completions', () => {
    const save = emptySave();
    for (const id of [...Array.from({ length: 10 }, (_, i) => `grade-1-sequences-${i + 1}`), sequenceExtras[2], sequenceExtras[3]]) save.progress[id] = { ...freshProgress(missions.findIndex(m => m.id === id)), complete: true };
    save.topicRecords[SEQUENCE_TOPIC] = { watched: true, guided: true, mastered: true, masteryAttempts: 3 };
    expect(sequenceEvidence(save).badge).toBe(true);
    expect(save.progress['grade-1-directions-3']).toBeUndefined();
  });
  for (const mission of dataMissions) it(`${mission.id}: block and text references both execute correctly`, () => {
    const workspace = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: dataSolutions[mission.id] } }] } }, workspace);
      const blockResult = evaluateWorkspace(workspace, mission), textResult = runText(source(dataSolutions[mission.id]), mission);
      expect(blockResult.success, blockResult.message).toBe(true);
      expect(textResult.success, textResult.message).toBe(true);
      expect(textResult.frames.map(({ x, y }) => ({ x, y }))).toEqual(blockResult.frames.map(({ x, y }) => ({ x, y })));
      expect(moduleFor(mission.id).challengeIds).toContain(mission.id);
    } finally { workspace.dispose(); }
  });
  it('round trips new code, workspace, quiz and resume position through the student cloud contract', () => {
    const id = 'grade-6-objects-6', save = { ...emptySave(), course: 'grade-6' as const, current: missions.findIndex(m => m.id === id) };
    save.progress[id] = { ...freshProgress(save.current), complete: true, stars: 5, textCode: source(dataSolutions[id]), codingMode: 'text', workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: dataSolutions[id] } }] } } };
    for (const quiz of courseQuizIds('grade-6', true)) save.quizzes[quiz] = emptyQuiz();
    const doc = collectCloud('grade-6', { [SAVE_KEY]: JSON.stringify(save) })!;
    expect(validCourseDocument('grade-6', progressDocument.parse(doc))).toBe(true);
    const restored = collectCloud('grade-6', hydrateCloud('grade-6', doc));
    expect(restored).toEqual(doc);
    expect(summarizeProgress('grade-6', { revision: 1, document: doc, updatedAt: null })).toMatchObject({ completed: 1, total: 90, quizTotal: 13, currentId: id });
  });
});

describe('data interpreter mistakes and boundaries', () => {
  const mission = (id: string) => dataMissions.find(item => item.id === id)!;
  it.each([
    ['grade-5-lists-1', 'move("right", steps[0])', 'Create steps'],
    ['grade-5-lists-1', 'steps = [2, 1]\nmove("right", steps[2])', 'outside this list'],
    ['grade-5-lists-1', 'steps = [2, 1]\nmove("right", steps[8])', 'range from 0 to 7'],
    ['grade-5-lists-1', 'steps = [10, 1]\nmove("right", steps[0])', '0 to 9'],
    ['grade-5-lists-1', 'steps = [2, 1, 3, 4, 5, 6, 7, 8]\nsteps.append(1)', 'eight items'],
    ['grade-5-objects-1', 'move("right", robot["speed"])', 'Create robot'],
    ['grade-5-statements-1', 'steps = [2, 1]', 'palette'],
    ['grade-5-statements-1', 'move("right", 9)', 'blocked'],
    ['grade-5-statements-1', 'move_right()\nmove_right()', 'data instructions'],
    ['grade-5-lists-4', 'steps = [1, 2]\nsteps.append(2)\nmove("right", steps[2])\nmove_right()', 'Finish with steps'],
    ['grade-5-objects-3', 'robot = {"speed": 1, "energy": 2}\nrobot["speed"] = 3\nrobot["energy"] = 1\nmove("right", robot["speed"])', 'robot.energy = 2'],
    ['grade-5-statements-1', '__import__("os").system("echo unsafe")', 'supported'],
  ])('%s rejects an invalid program without awarding completion', (id, code, message) => {
    const result = runText(code, mission(id));
    expect(result.success).toBe(false); expect(result.message).toContain(message);
  });
  it('initialises fresh runtime data on every run', () => {
    const m = mission('grade-5-objects-1');
    expect(runText('robot = {"speed": 2, "energy": 3}\nmove("right", robot["speed"])', m).success).toBe(true);
    expect(runText('move("right", robot["speed"])', m).message).toContain('Create robot');
  });
});
