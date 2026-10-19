import type * as Blockly from 'blockly/core';
import { validRepeatCount, repeatCountMessage } from '../shared/repeats.js';
import type { Mission, Frame, RunResult } from './learning';
import { conceptPalette } from './conceptModel';
import { initialSprite, spriteSettings, spriteNames, backdropNames } from './spriteModel';

const reserved = new Set(['score', 'value', 'show_number', 'show_boolean', 'True', 'False', 'for', 'if', 'else', 'return', 'def', 'range', 'and', 'or', 'not', 'say', 'say_number', 'forward', 'backward', 'go_to', 'turn_left', 'turn_right', 'background', 'character', 'show', 'hide', 'bounce', 'wait', 'touching_edge', 'touching_character']);
export function conceptFunctionName(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-z][a-z0-9_]{0,19}$/.test(value) || reserved.has(value)) throw new Error('Use a function name of 1–20 lowercase letters, numbers or underscores, starting with a letter. Do not use a command or variable name.');
  return value;
}
export function runConcept(workspace: Blockly.Workspace, mission: Mission): RunResult {
  const frames: Frame[] = [], task = mission.conceptTask!, grade = Number(mission.id.match(/^grade-([3-6])-/)?.[1]);
  const root = workspace.getBlocksByType('ka_start', false)[0];
  let settings = spriteSettings({}); try { settings = spriteSettings(JSON.parse(root?.data ?? '{}')); } catch { /* Invalid optional scene metadata uses safe defaults. */ }
  const sprite = mission.spriteEvent && mission.spriteInitial ? structuredClone(mission.spriteInitial) : initialSprite(settings);
  const output: (number | boolean)[] = mission.spriteEvent ? [...sprite.output] : [], used = new Set<string>(mission.spriteEvent ? sprite.used : []), definitions = new Map<string, Blockly.Block>(), active: string[] = [];
  const handlers = new Map<string, Blockly.Block>();
  let score: number | undefined = mission.spriteEvent ? sprite.score : undefined, calls = mission.spriteEvent ? sprite.calls : 0, operations = 0, eventCount = 0;
  const touching = (target: string) => target === 'edge' ? Math.abs(sprite.x) >= 100 || Math.abs(sprite.y) >= 100 : sprite.visible && Math.hypot(sprite.x - sprite.buddyX, sprite.y - sprite.buddyY) <= 20;
  const allowed = new Set(['ka_start', ...conceptPalette(task.topic, grade, task.required)]);
  const tick = () => { if (++operations > 500) throw new Error('Keep the calculation under 500 operations. Reduce repeated or nested calls.'); };
  const num = (n: unknown): number => { if (typeof n !== 'number' || !Number.isFinite(n) || Math.abs(n) > 1000) throw new Error('Use a finite number between −1000 and 1000.'); return n; };
  const bool = (b: unknown): boolean => { if (typeof b !== 'boolean') throw new Error('Use a true/false expression here, not a number.'); return b; };
  const note = (block: Blockly.Block, message: string, durationMs?: number) => {
    if (frames.length >= 120) throw new Error('Use at most 120 output and instruction steps.');
    Object.assign(sprite, { score, calls, output: [...output], used: [...used] });
    frames.push({ ...mission.start, blockId: block.id, step: frames.length + 1, score, note: message, durationMs, ...(task.creative ? { sprite: structuredClone(sprite) } : {}), lab: { output: [...output], calls } });
  };
  const input = (block: Blockly.Block, key: string) => { const value = block.getInputTargetBlock(key); if (!value) throw new Error(`Fill the ${key.toLowerCase()} input on ${block.toString()}.`); return value; };
  function invoke(block: Blockly.Block, parameter: number | undefined): number | undefined {
    const name = conceptFunctionName(block.getFieldValue('NAME')), definition = definitions.get(name);
    if (!definition) throw new Error(`Define ${name} before calling it.`);
    if (active.includes(name)) throw new Error('Recursive calls are not supported. Call a different function or use a bounded repeat.');
    if (active.length >= (grade === 6 ? 3 : 1)) throw new Error('Nested function calls are introduced in Grade 6 and are limited to three levels.');
    const expects = definition.getFieldValue('PARAM') === 'value', arg = block.getInputTargetBlock('ARG');
    if (grade < 6 && arg?.getDescendants(false).some(item => item.type === 'ka_function_value')) throw new Error('Composed function arguments are introduced in Grade 6.');
    if (expects !== !!arg) throw new Error(expects ? `${name} needs one numeric argument.` : `${name} has no input; leave its argument empty.`);
    const value = expects ? num(expression(arg!, parameter)) : undefined;
    active.push(name); calls++; used.add('function_call'); note(block, `Call ${name}${expects ? `(${value})` : '()'}.`);
    try { return statements(input(definition, 'DO'), value, 1); } finally { active.pop(); }
  }
  function expression(block: Blockly.Block, parameter?: number, depth = 0): number | boolean {
    tick(); if (depth > 12) throw new Error('Use no more than twelve nested expression levels.');
    const type = block.type.slice(3); used.add(type);
    const read = (key: string) => expression(input(block, key), parameter, depth + 1);
    if (type === 'number') return num(Number(block.getFieldValue('NUM')));
    if (type === 'score_value') { if (score === undefined) throw new Error('Set score before reading it.'); return score; }
    if (type === 'parameter') { if (parameter === undefined) throw new Error('Use value only inside a function with that input.'); return parameter; }
    if (type === 'boolean_value') return block.getFieldValue('BOOL') === 'True';
    if (type === 'sprite_touching') { const target = block.getFieldValue('TARGET'); if (!['edge', 'character'].includes(target)) throw new Error('Choose border or character for the touch check.'); return touching(target); }
    if (type === 'arithmetic') {
      const a = num(read('A')), b = num(read('B')), op = block.getFieldValue('OP'); used.add(`operator:${op}`);
      if ((op === '/' && grade < 4) || (op === '%' && grade < 5)) throw new Error('Division starts in Grade 4; remainder starts in Grade 5.');
      if ((op === '/' || op === '%') && b === 0) throw new Error('You cannot divide by zero. Change the second input.');
      if (!['+', '-', '*', '/', '%'].includes(op)) throw new Error('Choose a supported arithmetic operator.');
      return num(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : ((a % b) + b) % b);
    }
    if (type === 'compare') {
      const a = num(read('A')), b = num(read('B')), op = block.getFieldValue('OP'); used.add(`compare:${op}`);
      if (!['==', '!=', '<', '>', '<=', '>='].includes(op)) throw new Error('Choose a supported comparison.');
      if (grade === 3 && ['!=', '<=', '>='].includes(op)) throw new Error('Use equals, less than or greater than in Grade 3.');
      return op === '==' ? a === b : op === '!=' ? a !== b : op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b;
    }
    if (type === 'boolean_not') return !bool(read('VALUE'));
    if (type === 'boolean_join') {
      const a = bool(read('A')), op = block.getFieldValue('OP'); used.add(`logic:${op}`);
      if (op !== 'and' && op !== 'or') throw new Error('Choose AND or OR.');
      return op === 'and' ? a && bool(read('B')) : a || bool(read('B'));
    }
    if (type === 'function_value') { const value = invoke(block, parameter); if (value === undefined) throw new Error('This function does not return a number. Use a call statement, or add RETURN to its definition.'); return value; }
    throw new Error('Use a value block in an expression input.');
  }
  function dispatch(event: string) {
    const handler = handlers.get(event); if (!handler) return;
    if (++eventCount > 16) throw new Error('Too many triggered events. Change a handler so it moves away from the border or character.');
    used.add(`event:${event}`); sprite.events.push(event); sprite.events = sprite.events.slice(-16);
    note(handler, `${event === 'edge' ? 'Border touch' : event === 'touch' ? 'Character touch' : 'Sprite click'} event.`);
    statements(input(handler, 'DO'), undefined, 1);
  }
  function move(block: Blockly.Block, x: number, y: number) {
    const previousEdge = touching('edge'), previousTouch = touching('character');
    // Walk in small increments: crossing the other sprite must not teleport through it.
    const dx = x - sprite.x, dy = y - sprite.y, steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 10));
    for (let i = 0; i < steps; i++) {
      tick(); const wasEdge = i ? touching('edge') : previousEdge, wasTouch = i ? touching('character') : previousTouch;
      sprite.x = Math.max(-100, Math.min(100, sprite.x + dx / steps)); sprite.y = Math.max(-100, Math.min(100, sprite.y + dy / steps));
      if (!wasEdge && touching('edge')) dispatch('edge');
      if (!wasTouch && touching('character')) dispatch('touch');
      if (touching('edge')) break; // The next MOVE uses the bounced/new heading.
    }
    note(block, `Position x ${Math.round(sprite.x)}, y ${Math.round(sprite.y)}.`);
  }
  function statements(first: Blockly.Block | null, parameter?: number, depth = 0, single = false): number | undefined {
    if (depth > 3) throw new Error('Use no more than three nested instruction groups.');
    let block = first;
    while (block) {
      tick(); const type = block.type.slice(3); used.add(type);
      if (type === 'on_event') {
        if (depth || active.length) throw new Error('Connect event registrations directly below Play, outside other groups.');
        const event = block.getFieldValue('EVENT');
        if (!['click', 'edge', 'touch'].includes(event) || handlers.has(event)) throw new Error('Use one handler per event: click, border or character touch.');
        input(block, 'DO'); handlers.set(event, block); if (!mission.spriteEvent) note(block, `Ready for ${event} events.`);
      } else if (type === 'function_define') {
        if (depth || active.length) throw new Error('Define functions directly below Play, outside loops and other functions.');
        const name = conceptFunctionName(block.getFieldValue('NAME'));
        if (definitions.has(name) || definitions.size >= 4) throw new Error('Use up to four functions, each with a different name.');
        if (grade < 5 && block.getFieldValue('PARAM') !== 'none') throw new Error('Function inputs start in Grade 5.');
        input(block, 'DO'); definitions.set(name, block); note(block, `Defined ${name}. Its body has not run.`);
      } else if (type === 'function_call') { invoke(block, parameter); }
      else if (type === 'function_return') {
        if (!active.length) throw new Error('RETURN belongs inside a function definition.');
        const value = num(expression(input(block, 'VALUE'), parameter)); note(block, `Return ${value}.`); return value;
      } else if (type === 'compute_score') {
        if (active.length) throw new Error('Set score in the main program. A function can return a number for its caller to use.');
        score = num(expression(input(block, 'VALUE'), parameter)); note(block, `score = ${score}`);
      } else if (type === 'show_number' || type === 'show_boolean') {
        const value = expression(input(block, 'VALUE'), parameter), checked = type === 'show_number' ? num(value) : bool(value);
        if (output.length >= 24) throw new Error('Show at most 24 values in one run.');
        output.push(checked); note(block, `Output ${String(checked)}.`);
      } else if (type === 'logic_if') {
        const answer = bool(expression(input(block, 'VALUE'), parameter)); note(block, `Condition is ${answer}. Run ${answer ? 'DO' : 'ELSE'}.`);
        const returned = statements(input(block, answer ? 'DO' : 'ELSE'), parameter, depth + 1); if (returned !== undefined) return returned;
      } else if (type === 'repeat') {
        const count = Number(block.getFieldValue('COUNT')); if (!validRepeatCount(count)) throw new Error(repeatCountMessage);
        for (let i = 0; i < count; i++) { const returned = statements(input(block, 'DO'), parameter, depth + 1); if (returned !== undefined) return returned; }
      } else if (type === 'sprite_say') {
        const text = block.getFieldValue('TEXT'); if (typeof text !== 'string' || text.length > 120 || /[\u0000-\u001f]/.test(text)) throw new Error('Use a message of at most 120 printable characters.');
        sprite.speech = text; note(block, `${sprite.character} says: ${text}`);
      } else if (type === 'sprite_say_value') { sprite.speech = String(num(expression(input(block, 'VALUE'), parameter))); note(block, `${sprite.character} says: ${sprite.speech}`);
      } else if (type === 'sprite_move') {
        const direction = block.getFieldValue('DIRECTION'); if (!['forward', 'backward'].includes(direction)) throw new Error('Choose forward or backward.');
        const distance = num(expression(input(block, 'VALUE'), parameter)); if (Math.abs(distance) > 200) throw new Error('Move at most 200 steps in one instruction.');
        const angle = sprite.angle * Math.PI / 180, sign = direction === 'backward' ? -1 : 1;
        move(block, sprite.x + Math.cos(angle) * distance * sign, sprite.y + Math.sin(angle) * distance * sign);
      } else if (type === 'sprite_goto') {
        const x = num(expression(input(block, 'X'), parameter)), y = num(expression(input(block, 'Y'), parameter));
        if (Math.abs(x) > 100 || Math.abs(y) > 100) throw new Error('Stage coordinates range from −100 to 100.');
        // GO TO is a teleport; it checks only the destination.
        const edge = touching('edge'), touch = touching('character'); sprite.x = x; sprite.y = y;
        note(block, `Go to x ${x}, y ${y}.`); if (!edge && touching('edge')) dispatch('edge'); if (!touch && touching('character')) dispatch('touch');
      } else if (type === 'sprite_turn') {
        const angle = Number(block.getFieldValue('ANGLE')), side = block.getFieldValue('SIDE'); if (!Number.isFinite(angle) || angle < 0 || angle > 360 || !['left', 'right'].includes(side)) throw new Error('Choose a turn of 0–360 degrees.');
        sprite.angle = (sprite.angle + (side === 'left' ? angle : -angle) + 360) % 360; note(block, `Facing ${sprite.angle}° (0° is right).`);
      } else if (type === 'sprite_bounce') {
        if (Math.abs(sprite.x) >= 100) sprite.angle = (180 - sprite.angle + 360) % 360;
        if (Math.abs(sprite.y) >= 100) sprite.angle = (360 - sprite.angle) % 360;
        note(block, 'Checked border bounce.');
      } else if (type === 'sprite_character') {
        const name = block.getFieldValue('CHARACTER'); if (!spriteNames.includes(name)) throw new Error('Choose a platform character.'); sprite.character = name; note(block, `Character is ${name}.`);
      } else if (type === 'sprite_backdrop') {
        const name = block.getFieldValue('BACKGROUND'); if (!backdropNames.includes(name)) throw new Error('Choose a platform background.'); sprite.background = name; note(block, `Background is ${name}.`);
      } else if (type === 'sprite_visible') {
        const value = block.getFieldValue('VISIBLE'); if (!['show', 'hide'].includes(value)) throw new Error('Choose show or hide.'); sprite.visible = value === 'show'; note(block, `${value} sprite.`);
      } else if (type === 'sprite_wait') {
        const seconds = Number(block.getFieldValue('SECONDS')); if (!Number.isFinite(seconds) || seconds < .1 || seconds > 2) throw new Error('Wait between 0.1 and 2 seconds.'); note(block, `Wait ${seconds} seconds.`, seconds * 1000);
      } else throw new Error('Connect an instruction below Play; put value blocks into its inputs.');
      block = single ? null : block.getNextBlock();
    }
  }
  try {
    for (const b of workspace.getAllBlocks(false)) if (!allowed.has(b.type)) throw new Error('Use the blocks introduced in this concept lab. Movement blocks are not part of this task.');
    const start = workspace.getBlocksByType('ka_start', false)[0]; if (!start?.getNextBlock()) throw new Error('Add an instruction below Play.');
    if (mission.spriteEvent) {
      if (!task.creative || !mission.spriteInitial) throw new Error('Press Play before clicking your sprite.');
      // Reconstruct declarations only. Do not rerun initialization or move the sprite again.
      for (let block = start.getNextBlock(); block; block = block.getNextBlock()) if (['ka_function_define', 'ka_on_event'].includes(block.type)) {
        statements(block, undefined, 0, true);
      }
      if (!handlers.has('click')) throw new Error('Add a sprite-click event from Events, then press Play.');
      dispatch('click');
    } else statements(start.getNextBlock());
    if (task.creative?.free) return { frames, success: true, message: 'Your project ran. Change it, test another idea, or click your sprite.' };
    const missing = task.required.filter(type => !used.has(type));
    if (missing.length) throw new Error('Use the operators or function instructions named in the goal, not only the final answer.');
    if (task.minCalls && calls < task.minCalls) throw new Error(`Call your reusable function at least ${task.minCalls} times.`);
    if (task.score !== undefined && score !== task.score) throw new Error(`The goal is score = ${task.score}. Your result is ${score ?? 'not set'}. Trace the expression before changing it.`);
    if (task.output && JSON.stringify(output) !== JSON.stringify(task.output)) throw new Error(`Expected output: ${task.output.map(String).join(', ')}. Compare each value with your trace.`);
    if (task.creative?.x !== undefined && Math.abs(sprite.x - task.creative.x) > .01) throw new Error(`Finish at x ${task.creative.x}. Current x is ${Math.round(sprite.x)}.`);
    if (task.creative?.speech !== undefined && sprite.speech !== task.creative.speech) throw new Error(`Finish by saying “${task.creative.speech}”.`);
    if (task.creative?.event && !used.has(`event:${task.creative.event}`)) throw new Error(`Trigger the ${task.creative.event} event to test your handler.`);
    return { frames, success: true, message: 'Your code produced the required result using this topic’s instructions.' };
  } catch (error) { return { frames, success: false, message: error instanceof Error ? error.message : 'Check the expression inputs and try again.' }; }
}
