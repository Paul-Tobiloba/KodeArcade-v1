import { describe, expect, it } from 'vitest';
import { commandFragment, commandSockets, editCommandSockets } from './appLabCodeStyle';

describe('App Lab presentation sockets', () => {
  it('finds quoted arguments, numbers and variable names, not digits inside IDs', () => {
    expect(commandSockets('var score2 = getNumber("input3") + 1e2;').map(s => [s.kind, s.value])).toEqual([
      ['name', 'score2'], ['text', 'input3'], ['number', '1e2'],
    ]);
  });
  it('preserves nested expressions and escapes edited text without executing it', () => {
    const source = 'setText("result", joinText("Hi, ", getText("name")));';
    const greeting = 'Say "hello"\n';
    expect(editCommandSockets(source, ['result', greeting, 'name'])).toBe(`setText("result", joinText(${JSON.stringify(greeting)}, getText("name")));`);
  });
  it('keeps empty or invalid number/name drafts available for parser validation', () => {
    expect(editCommandSockets('var score = 10;', ['', ''])).toBe('var  = ;');
    expect(editCommandSockets('repeat(4, function() {', ['not a number'])).toBe('repeat(not a number, function() {');
  });
  it('does not mistake escaped quotes or numeric text for extra arguments', () => {
    expect(commandSockets(`setText("label1", ${JSON.stringify('Age "8"')});`).map(s => s.value)).toEqual(['label1', 'Age "8"']);
  });
  it('edits Boolean sockets as real values rather than quoted text', () => {
    const source = 'setProperty("check", "checked", true);';
    expect(commandSockets(source).at(-1)).toMatchObject({ kind: 'boolean', value: 'true' });
    expect(editCommandSockets(source, ['check', 'checked', 'false'])).toBe('setProperty("check", "checked", false);');
  });
  it('uses friendly event and startup labels without changing the serialized command', () => {
    expect(commandFragment('al_start', 'onStart(function() {', 0, true)).toBe('when app starts');
    expect(commandFragment('al_event', 'onEvent(', 0)).toBe('when ');
    expect(commandFragment('al_event', ', ', 1)).toBe(' triggers ');
    expect(commandFragment('al_event', ', function() {', 2, true)).toBe('');
  });
  it('keeps expression syntax intact while replacing only command chrome', () => {
    expect(commandFragment('al_set_text', ', joinText(', 1)).toBe(' to joinText(');
    expect(commandFragment('al_set_text', ', name));', 2, true)).toBe(', name)');
    expect(commandFragment('al_set_var', 'var ', 0)).toBe('make variable ');
    expect(commandFragment('al_repeat', ', function() {', 1, true)).toBe(' times');
    expect(commandFragment('al_if', ')) {', 1, true)).toBe(')');
  });
});
