import { describe, expect, it } from 'vitest';
import { readAppGallery } from '../shared/appLab';
import { appStarter, appStarterChoices } from './appLabStarters';
import { AppRuntime, type AppScene } from './appLabRuntime';
import { codeText, parseAppCode } from './appLabCode';
import { appCodeIssues } from './appLabDiagnostics';

const text = (scene: AppScene, id: string) => scene.elements.find(element => element.id === id)!.text;

describe('editable sample apps', () => {
  it.each(appStarterChoices)('$title has clean diagnostics and survives blocks/text/backup conversion', ({ id }) => {
    const project = appStarter(id);
    expect(appCodeIssues(codeText(project.code), project)).toEqual([]);
    project.code = parseAppCode(codeText(project.code));
    const saved = readAppGallery(JSON.parse(JSON.stringify({ version: 1, activeId: project.id, projects: [project] })));
    expect(new AppRuntime(saved.projects[0]).start().error).toBe('');
  });
  it('scores each quiz question once and starts a fresh round after the last question', () => {
    const runtime = new AppRuntime(appStarter('quiz')); runtime.start();
    for (const answer of ['5', '12', '8']) {
      runtime.inputValue('answer', answer);
      const result = runtime.event('checkAnswer', 'click');
      expect(result.error).toBe(''); expect(text(result, 'feedback')).toContain('Correct');
      expect(runtime.event('checkAnswer', 'click').variables).toEqual(result.variables);
      runtime.event('nextQuestion', 'click');
    }
    expect(text(runtime.snapshot(), 'question')).toBe('What is 2 + 3?');
    expect(text(runtime.snapshot(), 'quizScore')).toBe('Score: 0');
  });
  it('gives the answer for an incorrect attempt without awarding a point', () => {
    const runtime = new AppRuntime(appStarter('quiz')); runtime.start(); runtime.inputValue('answer', '12');
    expect(text(runtime.event('checkAnswer', 'click'), 'feedback')).toBe('The answer is 5');
    expect(text(runtime.snapshot(), 'quizScore')).toBe('Score: 0');
  });
  it('reads edited quiz data when starting', () => {
    const project = appStarter('quiz'); project.tables[0].rows[0][0] = 'An edited question';
    expect(text(new AppRuntime(project).start(), 'question')).toBe('An edited question');
  });
  it.each([['Add', '10'], ['Subtract', '2'], ['Multiply', '24']])('calculates %s from the two numeric inputs', (operation, expected) => {
    const runtime = new AppRuntime(appStarter('calculator')); runtime.start(); runtime.inputValue('operation', operation);
    const result = runtime.event('calculate', 'click'); expect(result.error).toBe(''); expect(text(result, 'calculation')).toBe(`Result: ${expected}`);
  });
  it('accepts edited negative and decimal calculator inputs', () => {
    const runtime = new AppRuntime(appStarter('calculator')); runtime.start(); runtime.inputValue('firstNumber', '-2.5'); runtime.inputValue('secondNumber', '4');
    expect(text(runtime.event('calculate', 'click'), 'calculation')).toBe('Result: 1.5');
  });
  it('connects both story paths and returns to the choice screen', () => {
    const runtime = new AppRuntime(appStarter('story')); runtime.start();
    expect(runtime.event('chooseForest', 'click').screen).toBe('forest');
    expect(runtime.event('forestBack', 'click').screen).toBe('home');
    expect(runtime.event('chooseTower', 'click').screen).toBe('skyTower');
    expect(runtime.event('towerBack', 'click').screen).toBe('home');
  });
  it('updates checklist data and counts accurately after unchecking; Run resets data', () => {
    const project = appStarter('checklist'), before = structuredClone(project), runtime = new AppRuntime(project); runtime.start();
    runtime.inputValue('mission1', true); runtime.inputValue('mission3', true);
    const result = runtime.event('updateMissions', 'click');
    expect(result.error).toBe(''); expect(text(result, 'missionProgress')).toBe('Completed: 2 of 3');
    expect(result.tables[0].rows.map(row => row[1])).toEqual([true, false, true]);
    runtime.inputValue('mission1', false);
    expect(text(runtime.event('updateMissions', 'click'), 'missionProgress')).toBe('Completed: 1 of 3');
    expect(project).toEqual(before);
    expect(new AppRuntime(project).start().tables[0].rows.map(row => row[1])).toEqual([false, false, false]);
  });
  it('creates independent copies rather than sharing template state', () => {
    const first = appStarter('quiz'), second = appStarter('quiz');
    first.tables[0].rows[0][0] = 'Changed'; first.elements[0].text = 'Changed';
    expect(second.id).not.toBe(first.id); expect(second.tables[0].rows[0][0]).toBe('What is 2 + 3?'); expect(second.elements[0].text).toBe('Number Detective');
  });
});
