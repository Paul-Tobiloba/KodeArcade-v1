import type { serialization } from 'blockly/core';
import { validRepeatCount, repeatCountMessage } from '../shared/repeats.js';
import { conceptFunctionName } from './conceptRuntime';
type State = serialization.blocks.State;
export const conceptChain = (items: State[]): State | undefined => items.reduceRight<State | undefined>((next, item) => ({ ...item, ...(next ? { next: { block: next } } : {}) }), undefined);
const valueInput = (block: State) => ({ block });
export function conceptExpression(source: string): State {
  if (source.length > 500) throw new Error('Keep one expression under 500 characters.');
  const tokens: string[] = []; let rest = source.trim();
  while (rest) {
    const match = /^(\d+(?:\.\d+)?|[a-zA-Z_][a-zA-Z0-9_]*|==|!=|<=|>=|[()+*/%<>-])/.exec(rest);
    if (!match || tokens.length >= 100) throw new Error('Use numbers, score, value, supported operators and parentheses. Strings, imports and attribute access are not supported.');
    tokens.push(match[0]); rest = rest.slice(match[0].length).trimStart();
  }
  let cursor = 0;
  const precedence: Record<string, number> = { or: 1, and: 2, '==': 4, '!=': 4, '<': 4, '>': 4, '<=': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };
  function parse(min = 0, depth = 0): State {
    if (depth > 12) throw new Error('Use no more than twelve nested expression levels.');
    const token = tokens[cursor++]; let node: State;
    if (token === '(') { node = parse(0, depth + 1); if (tokens[cursor++] !== ')') throw new Error('Close each expression with a matching parenthesis.'); }
    else if (token === 'not') node = { type: 'ka_boolean_not', inputs: { VALUE: valueInput(parse(3, depth + 1)) } };
    else if (token === '-') node = { type: 'ka_arithmetic', fields: { OP: '-' }, inputs: { A: valueInput({ type: 'ka_number', fields: { NUM: 0 } }), B: valueInput(parse(7, depth + 1)) } };
    else if (/^\d+(\.\d+)?$/.test(token ?? '')) { const n = Number(token); if (!Number.isFinite(n) || n > 1000) throw new Error('Numbers must be at most 1000.'); node = { type: 'ka_number', fields: { NUM: n } }; }
    else if (token === 'True' || token === 'False') node = { type: 'ka_boolean_value', fields: { BOOL: token } };
    else if (token === 'score' || token === 'value') node = { type: token === 'score' ? 'ka_score_value' : 'ka_parameter' };
    else if (token === 'touching_edge' || token === 'touching_character') { if (tokens[cursor++] !== '(' || tokens[cursor++] !== ')') throw new Error('Touch checks take no arguments.'); node = { type: 'ka_sprite_touching', fields: { TARGET: token === 'touching_edge' ? 'edge' : 'character' } }; }
    else if (token && /^[a-z]/.test(token)) {
      const name = conceptFunctionName(token); if (tokens[cursor++] !== '(') throw new Error('Use score, value or a named function call in an expression.');
      const arg = tokens[cursor] === ')' ? undefined : parse(0, depth + 1);
      if (tokens[cursor++] !== ')') throw new Error('Function calls take zero or one numeric argument.');
      node = { type: 'ka_function_value', fields: { NAME: name }, ...(arg ? { inputs: { ARG: valueInput(arg) } } : {}) };
    } else throw new Error('Add a value on both sides of each operator.');
    while (cursor < tokens.length && (precedence[tokens[cursor]] ?? -1) >= min) {
      const op = tokens[cursor++], p = precedence[op], right = parse(p + 1, depth + 1);
      if (p === 4 && node.type === 'ka_compare') throw new Error('Write separate comparisons and join them with AND; chained comparisons are not supported.');
      node = { type: p === 4 ? 'ka_compare' : p <= 2 ? 'ka_boolean_join' : 'ka_arithmetic', fields: { OP: op }, inputs: { A: valueInput(node), B: valueInput(right) } };
    }
    return node;
  }
  const result = parse(); if (cursor !== tokens.length) throw new Error('Check the operators, parentheses and function arguments.'); return result;
}
export function parseConceptCode(source: string): State {
  if (source.length > 10000) throw new Error('Keep your program under 10,000 characters.');
  const uncomment = (raw: string) => { let quoted = false, escaped = false; for (let i = 0; i < raw.length; i++) { if (escaped) { escaped = false; continue; } if (raw[i] === '\\' && quoted) { escaped = true; continue; } if (raw[i] === '"') quoted = !quoted; if (raw[i] === '#' && !quoted) return raw.slice(0, i).trim(); } return raw.trim(); };
  const lines = source.split('\n').map((raw, i) => ({ raw, line: i + 1, text: uncomment(raw) })).filter(l => l.text);
  if (lines.length > 100) throw new Error('Use at most 100 lines.');
  let cursor = 0;
  const indent = (raw: string) => { if (raw.includes('\t')) throw new Error('Indent with four spaces, not tabs.'); return raw.length - raw.trimStart().length; };
  function group(spaces: number, depth = 0): State[] {
    if (depth > 3) throw new Error('Use no more than three nested instruction groups.');
    const result: State[] = [];
    while (cursor < lines.length) {
      const line = lines[cursor], n = indent(line.raw); if (n < spaces || line.text === 'else:') break;
      if (n !== spaces) throw new Error(`Line ${line.line}: indent each group by four spaces.`);
      try {
        let state: State, match: RegExpExecArray | null;
        const expr = (text: string) => ({ VALUE: valueInput(conceptExpression(text)) });
        if ((match = /^on_(click|edge|touch):$/.exec(line.text))) state = { type: 'ka_on_event', fields: { EVENT: match[1] } };
        else if ((match = /^say\(("(?:[^"\\]|\\.)*")\)$/.exec(line.text))) { const text: unknown = JSON.parse(match[1]); if (typeof text !== 'string' || text.length > 120 || /[\u0000-\u001f]/.test(text)) throw new Error('Use a message of at most 120 printable characters.'); state = { type: 'ka_sprite_say', fields: { TEXT: text } }; }
        else if ((match = /^say_number\((.+)\)$/.exec(line.text))) state = { type: 'ka_sprite_say_value', inputs: expr(match[1]) };
        else if ((match = /^(forward|backward)\((.+)\)$/.exec(line.text))) state = { type: 'ka_sprite_move', fields: { DIRECTION: match[1] }, inputs: expr(match[2]) };
        else if ((match = /^turn_(left|right)\((\d+(?:\.\d+)?)\)$/.exec(line.text))) state = { type: 'ka_sprite_turn', fields: { SIDE: match[1], ANGLE: Number(match[2]) } };
        else if ((match = /^go_to\(([^,]+),\s*([^,]+)\)$/.exec(line.text))) state = { type: 'ka_sprite_goto', inputs: { X: valueInput(conceptExpression(match[1])), Y: valueInput(conceptExpression(match[2])) } };
        else if ((match = /^background\("(sky|city|meadow|horizon)"\)$/.exec(line.text))) state = { type: 'ka_sprite_backdrop', fields: { BACKGROUND: match[1] } };
        else if ((match = /^character\("(Byte|Dash|Gigi|Fix|Milo|Nova|Pip)"\)$/.exec(line.text))) state = { type: 'ka_sprite_character', fields: { CHARACTER: match[1] } };
        else if ((match = /^(show|hide|bounce)\(\)$/.exec(line.text))) state = match[1] === 'bounce' ? { type: 'ka_sprite_bounce' } : { type: 'ka_sprite_visible', fields: { VISIBLE: match[1] } };
        else if ((match = /^wait\((\d+(?:\.\d+)?)\)$/.exec(line.text))) state = { type: 'ka_sprite_wait', fields: { SECONDS: Number(match[1]) } };
        else if ((match = /^def ([a-z][a-z0-9_]{0,19})\((value)?\):$/.exec(line.text))) state = { type: 'ka_function_define', fields: { NAME: conceptFunctionName(match[1]), PARAM: match[2] ?? 'none' } };
        else if ((match = /^for [a-zA-Z_]\w* in range\((\d+)\):$/.exec(line.text))) state = { type: 'ka_repeat', fields: { COUNT: Number(match[1]) } };
        else if ((match = /^if (.+):$/.exec(line.text))) state = { type: 'ka_logic_if', inputs: expr(match[1]) };
        else if ((match = /^score\s*=\s*(.+)$/.exec(line.text))) state = { type: 'ka_compute_score', inputs: expr(match[1]) };
        else if ((match = /^return (.+)$/.exec(line.text))) state = { type: 'ka_function_return', inputs: expr(match[1]) };
        else if ((match = /^show_(number|boolean)\((.+)\)$/.exec(line.text))) state = { type: `ka_show_${match[1]}`, inputs: expr(match[2]) };
        else if ((match = /^([a-z][a-z0-9_]{0,19})\((.*)\)$/.exec(line.text))) state = { type: 'ka_function_call', fields: { NAME: conceptFunctionName(match[1]) }, ...(match[2].trim() ? { inputs: { ARG: valueInput(conceptExpression(match[2])) } } : {}) };
        else throw new Error('Use the concept lab’s score, show, def, return, if/else or bounded for syntax.');
        state.id = `line-${line.line}`; cursor++;
        if (state.type === 'ka_repeat' && !validRepeatCount(state.fields?.COUNT)) throw new Error(repeatCountMessage);
        if (['ka_on_event', 'ka_function_define', 'ka_repeat', 'ka_logic_if'].includes(state.type)) {
          const body = group(spaces + 4, depth + 1); if (!body.length) throw new Error('Add an indented instruction to this group.');
          state.inputs = { ...state.inputs, DO: valueInput(conceptChain(body)!) };
          if (state.type === 'ka_logic_if') {
            if (lines[cursor]?.text !== 'else:' || indent(lines[cursor].raw) !== spaces) throw new Error('This lab’s IF block needs an ELSE branch too.');
            cursor++; const otherwise = group(spaces + 4, depth + 1); if (!otherwise.length) throw new Error('Add an instruction inside ELSE.');
            state.inputs.ELSE = valueInput(conceptChain(otherwise)!);
          }
        }
        result.push(state);
      } catch (error) { throw new Error(`Line ${line.line}: ${error instanceof Error ? error.message : 'Check this instruction.'}`); }
    }
    return result;
  }
  const items = group(0); if (cursor !== lines.length) throw new Error(`Line ${lines[cursor].line}: check where this ELSE belongs.`);
  const first = conceptChain(items); return { type: 'ka_start', ...(first ? { next: { block: first } } : {}) };
}
