import { describe, expect, it } from 'vitest';
import { appStarter } from './appLabStarters';
import { AppRuntime } from './appLabRuntime';
import { codeText, parseAppCode, stampCodeLines } from './appLabCode';
import { appCodeIssues } from './appLabDiagnostics';
import { readAppGallery } from '../shared/appLab';

describe('App Lab JavaScript-shaped code', () => {
  for (const starter of ['blank', 'greeting', 'counter', 'data']) it(`round-trips ${starter} without changing runtime behavior`, () => {
    const p = appStarter(starter), text = codeText(p.code), parsed = parseAppCode(text);
    expect(codeText(parsed)).toBe(text);
    const a = new AppRuntime(p), b = new AppRuntime({ ...p, code: parsed });
    expect(b.start()).toEqual(a.start());
    for (const e of p.elements) expect(b.event(e.id, 'click')).toEqual(a.event(e.id, 'click'));
  });
  it('runs typed variables, event handlers and expressions in the bounded runtime', () => {
    const p = appStarter('counter');
    p.code = parseAppCode('var score = 0;\nonEvent("count", "click", function() {\n score = score + 2;\n setText("total", score);\n});');
    const runtime = new AppRuntime(p); runtime.start();
    expect(runtime.event('count', 'click').elements.find(e => e.id === 'total')!.text).toBe('2');
  });
  it('supports if/else, repeats, booleans, local table reads and updates', () => {
    const p = appStarter('data');
    p.code = parseAppCode('onStart(function() { var score = 0; repeat(3, function() { score = score + 1; }); if (score === 3) { console.log(joinText("Rows: ", getRowCount("animals"))); setCell("animals", 0, "name", "Sample"); } else { console.log(false); } });');
    const result = new AppRuntime(p).start();
    expect(result.error).toBe(''); expect(result.output).toEqual(['Rows: 3']); expect(result.tables[0].rows[0][0]).toBe('Sample');
    expect(codeText(parseAppCode(codeText(p.code)))).toBe(codeText(p.code));
  });
  it('keeps disabled and unattached commands inactive after conversion', () => {
    const p = appStarter('blank');
    p.code = parseAppCode('disabled(function() { onStart(function() { console.log("disabled"); }); });\nunattached(function() { console.log("unused"); });');
    expect(new AppRuntime(p).start().output).toEqual([]);
    p.code = parseAppCode(codeText(p.code)); expect(new AppRuntime(p).start().output).toEqual([]);
  });
  it('persists incomplete text drafts without replacing the applied program', () => {
    const p = { ...appStarter('counter'), codeDraft: 'onEvent(' };
    const saved = readAppGallery({ version: 1, activeId: p.id, projects: [p] });
    expect(saved.projects[0].codeDraft).toBe('onEvent('); expect(saved.projects[0].code).toEqual(p.code);
    expect(() => new AppRuntime(saved.projects[0])).toThrow(/draft/);
  });
  for (const source of ['fetch("https://example.com")', 'window.alert("x")', 'eval("1")', 'new Function("x")', 'document.body.innerHTML = "x"', 'while (true) {}', 'onEvent("a", "click", function(event) {})', 'console["log"]("x")', 'onStart(async function(){})', 'var x = () => 1;', 'var a = [1,2];', 'setText(...items);']) it(`rejects unsupported code without evaluating: ${source}`, () => expect(() => parseAppCode(source)).toThrow());
  it('rejects oversized text', () => expect(() => parseAppCode(' '.repeat(20001))).toThrow(/20,000/));
  it('rejects programs beyond existing block limits', () => expect(() => parseAppCode('console.log(1);'.repeat(121))).toThrow());
  it('reports syntax errors at their code line', () => {
    const issues = appCodeIssues('onStart(function() {\n console.log(;\n});', appStarter('blank'));
    expect(issues[0]).toMatchObject({ line: 2, severity: 'error' });
  });
  it('reports missing controls, tables, columns and variables at their lines', () => {
    const p = appStarter('data');
    const issues = appCodeIssues('onStart(function() {\n setText("missing", "x");\n console.log(getCell("animals", 0, "unknown"));\n console.log(score);\n});', p);
    expect(issues.map(i => [i.line, i.severity])).toEqual([[2, 'error'], [3, 'error'], [4, 'warning']]);
  });
  it('does not accept browser objects as values', () => expect(() => parseAppCode('var x = window.location;')).toThrow());
  it('adds runtime line context for typed calculation errors', () => {
    const p = appStarter('blank'); p.code = parseAppCode('onStart(function() {\n console.log(1 / 0);\n});');
    expect(new AppRuntime(p).start().error).toMatch(/Line 2.*zero/);
  });
  it('recalculates runtime line numbers after block placement or argument edits', () => {
    const p = appStarter('blank'); p.code = parseAppCode('onStart(function() { console.log("first"); console.log(1 / 0); });');
    p.code = stampCodeLines(p.code);
    expect(new AppRuntime(p).start().error).toMatch(/Line 3.*zero/);
  });
  it('shows missing or wrongly connected saved inputs without crashing or inventing values', () => {
    const p = appStarter('blank'); p.code.blocks!.blocks[0].inputs = { DO: { block: { type: 'al_print' } } };
    expect(codeText(p.code)).toContain('missingValue()');
    expect(() => parseAppCode(codeText(p.code))).toThrow();
    p.code.blocks!.blocks[0].inputs.DO.block!.inputs = { VALUE: { block: { type: 'al_print' } } };
    expect(codeText(p.code)).toContain('invalidValue()');
  });
});
