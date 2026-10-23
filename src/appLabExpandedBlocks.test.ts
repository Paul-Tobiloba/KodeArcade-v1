import { afterEach, describe, expect, it, vi } from 'vitest';
import { newElement, readAppGallery } from '../shared/appLab';
import { appStarter } from './appLabStarters';
import { codeText, parseAppCode } from './appLabCode';
import { AppRuntime } from './appLabRuntime';
import { appCodeIssues } from './appLabDiagnostics';
import { appToolboxCategories } from './appLabToolbox';

function project(source: string) {
  const p = appStarter('blank');
  for (const [kind, id] of [['label', 'label1'], ['input', 'input1'], ['button', 'button1'], ['checkbox', 'checkbox1'], ['slider', 'slider1']] as const) p.elements.push(newElement(kind, id, 'home'));
  p.elements.find(e => e.id === 'input1')!.text = '4';
  p.tables = [{ id: 'table1', columns: ['value', 'name'], rows: [[1, 'First']] }];
  p.code = parseAppCode(source); return p;
}
const run = (source: string) => new AppRuntime(project(source)).start();
afterEach(() => vi.restoreAllMocks());

describe('expanded App Lab toolbox', () => {
  for (const category of appToolboxCategories) it.each(category.examples)(`${category.name}: %s parses, runs and round-trips`, source => {
    const p = project(`var score = 0;\n${source}`), original = structuredClone(p);
    expect(appCodeIssues(codeText(p.code), p)).toEqual([]);
    const normalized = codeText(p.code); p.code = parseAppCode(normalized);
    expect(codeText(p.code)).toBe(normalized);
    expect(new AppRuntime(readAppGallery({ version: 1, activeId: p.id, projects: [p] }).projects[0]).start().error).toBe('');
    expect(p.elements).toEqual(original.elements); expect(p.tables).toEqual(original.tables);
  });
  it('offers six categories and at least fifty complete command templates', () => {
    expect(appToolboxCategories).toHaveLength(6);
    expect(appToolboxCategories.flatMap(c => c.examples).length).toBeGreaterThanOrEqual(50);
  });
  it.each([
    ['7 % 3', '1'], ['4 >= 4', 'true'], ['4 <= 3', 'false'], ['!false', 'true'],
    ['roundNumber(2.6)', '3'], ['floorNumber(2.6)', '2'], ['ceilNumber(2.1)', '3'], ['absNumber(-5)', '5'],
    ['minNumber(7, 3)', '3'], ['maxNumber(7, 3)', '7'], ['textLength("Hello")', '5'],
    ['upperCase("Hi")', 'HI'], ['lowerCase("Hi")', 'hi'], ['containsText("Hello", "ell")', 'true'], ['sliceText("Hello", 1, 4)', 'ell'],
  ])('%s has a real runtime result', (expression, expected) => {
    const result = run(`console.log(${expression});`); expect(result.error).toBe(''); expect(result.output).toEqual([expected]);
  });
  it('generates inclusive random whole numbers at either endpoint', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); expect(run('console.log(randomNumber(1, 6));').output).toEqual(['1']);
    vi.mocked(Math.random).mockReturnValue(0.999999); expect(run('console.log(randomNumber(1, 6));').output).toEqual(['6']);
  });
  it('styles, positions and resizes controls without changing the saved design', () => {
    const p = project('setProperty("label1", "background-color", "#6d4aff"); setProperty("label1", "text-color", "#ffffff"); setProperty("label1", "font-size", 24); setPosition("label1", 20, 100); setSize("label1", 200, 60); setNumber("label1", 12); console.log(getProperty("label1", "x"));');
    const before = structuredClone(p), result = new AppRuntime(p).start();
    expect(result.error).toBe(''); expect(result.elements[0]).toMatchObject({ x: 20, y: 100, width: 200, height: 60, background: '#6d4aff', colour: '#ffffff', fontSize: 24, text: '12' });
    expect(result.output).toEqual(['20']); expect(p).toEqual(before);
  });
  it('updates checkbox and slider values with correct types', () => {
    const result = run('setChecked("checkbox1", true); setProperty("slider1", "value", 75); console.log(getChecked("checkbox1")); console.log(getNumber("slider1"));');
    expect(result.error).toBe(''); expect(result.output).toEqual(['true', '75']);
  });
  it('adds a blank row and deletes a row only in the running table', () => {
    const p = project('addRow("table1"); setCell("table1", 1, "name", "Second"); deleteRow("table1", 0); console.log(getRowCount("table1"));');
    const result = new AppRuntime(p).start(); expect(result.error).toBe(''); expect(result.tables[0].rows).toEqual([['', 'Second']]); expect(result.output).toEqual(['1']); expect(p.tables[0].rows).toEqual([[1, 'First']]);
  });
  it('enforces the 50-row limit', () => {
    const p = project('addRow("table1");'); p.tables[0].rows = Array.from({ length: 50 }, () => [0, '']);
    expect(new AppRuntime(p).start().error).toContain('50-row');
  });
  it.each(['console.log(2 % 0);', 'console.log(!1);', 'console.log(randomNumber(6, 1));', 'console.log(randomNumber(1.5, 6));', 'console.log(sliceText("Hello", -1, 3));', 'setPosition("label1", 310, 0);', 'setSize("label1", 200, 500);', 'setProperty("label1", "font-size", 100);', 'setProperty("label1", "background-color", "red");', 'setChecked("label1", true);', 'setChecked("checkbox1", "true");', 'setProperty("slider1", "value", 101);', 'setNumber("label1", "hello");', 'deleteRow("table1", -1);'])('rejects invalid runtime inputs: %s', source => {
    expect(run(source).error).not.toBe('');
  });
  it.each(['getProperty("label1", "__proto__");', 'setProperty("label1", "innerHTML", "x");', 'console.log(Math.random());', 'console.log(upperCase.constructor("x"));'])('does not expand to arbitrary property or method calls: %s', source => expect(() => parseAppCode(source)).toThrow());
  it('rejects corrupted imported function and property names at runtime too', () => {
    const p = project('console.log(roundNumber(2));'); p.code.blocks!.blocks[0].inputs!.DO!.block!.inputs!.VALUE!.block!.fields!.FN = 'constructor';
    expect(new AppRuntime(p).start().error).toContain('supported number function');
    const q = project('setProperty("label1", "x", 20);'); q.code.blocks!.blocks[0].inputs!.DO!.block!.fields!.PROPERTY = '__proto__';
    expect(new AppRuntime(q).start().error).toContain('supported control property');
  });
  it('includes new control and table references in diagnostics', () => {
    const p = project('console.log(getProperty("missing", "x")); addRow("missing"); deleteRow("missing", 0);');
    expect(appCodeIssues(codeText(p.code), p).map(i => i.message)).toEqual(expect.arrayContaining([expect.stringContaining('Control “missing”'), expect.stringContaining('Table “missing”')]));
  });
});
