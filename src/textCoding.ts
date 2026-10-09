import * as Blockly from 'blockly/core';
import { evaluateWorkspace } from './blockly';
import type { Mission, RunResult } from './learning';

export type Statement = { line: number; type: string; value?: number; direction?: string; body?: Statement[]; otherwise?: Statement[] };
export class CodeError extends Error {
  constructor(public line: number, message: string) { super(`Line ${line}: ${message}`); }
}

// A deliberately small, bounded Python-style teaching language. Never eval user code.
export function parseCode(source: string, drawing = false): Statement[] {
  if (source.length > 10000) throw new CodeError(1, 'Keep your program under 10,000 characters.');
  const lines = source.split('\n').map((raw, i) => ({ line: i + 1, raw, text: raw.split('#')[0].trim() })).filter(l => l.text);
  if (lines.length > 100) throw new CodeError(1, 'Use at most 100 lines.');
  let cursor = 0;
  const indentation = (raw: string, line: number) => {
    if (raw.includes('\t')) throw new CodeError(line, 'Use spaces, not tabs. Indent a group by four spaces.');
    return raw.length - raw.trimStart().length;
  };
  function group(indent: number, depth = 0): Statement[] {
    if (depth > 3) throw new CodeError(lines[cursor]?.line ?? 1, 'Use no more than three nested groups.');
    const nodes: Statement[] = [];
    while (cursor < lines.length) {
      const current = lines[cursor], spaces = indentation(current.raw, current.line);
      if (spaces < indent) break;
      if (spaces > indent) throw new CodeError(current.line, 'Indent this line by exactly four spaces inside a group.');
      if (current.text === 'else:' && indent > 0) break;
      const node: Statement = { line: current.line, type: '' };
      const movement = /^move_(right|left|up|down)\(\)$/.exec(current.text);
      const loop = /^for [a-zA-Z_]\w* in range\((\d+)\):$/.exec(current.text);
      const condition = /^if path_clear\(["'](right|left|up|down)["']\):$/.exec(current.text);
      const variable = /^score (\+=|=) (-?\d+)$/.exec(current.text);
      const scoreMove = /^move_by_score\(["'](right|left|up|down)["']\)$/.exec(current.text);
      const pen = /^(forward|turn)\((-?\d+)\)$/.exec(current.text);
      const distance = /^distance (\+=|=) (-?\d+)$/.exec(current.text);
      const penControl = /^(push|pop|pen_up|pen_down)\(\)$/.exec(current.text);
      if (movement && !drawing) { node.type = `ka_${movement[1]}`; }
      else if (loop) {
        node.type = 'ka_repeat'; node.value = Number(loop[1]);
        if (node.value < 2 || node.value > (drawing ? 12 : 5)) throw new CodeError(current.line, `Use a repeat count from 2 to ${drawing ? 12 : 5} in this lab.`);
      } else if (condition && !drawing) { node.type = 'ka_if'; node.direction = condition[1]; }
      else if (variable && !drawing) {
        node.type = variable[1] === '=' ? 'ka_set_score' : 'ka_change_score'; node.value = Number(variable[2]);
        if (Math.abs(node.value) > 10) throw new CodeError(current.line, 'Use a score value from −10 to 10.');
      } else if (scoreMove && !drawing) { node.type = 'ka_move_score'; node.direction = scoreMove[1]; }
      else if (drawing && distance) {
        node.type = distance[1] === '=' ? 'distance_set' : 'distance_change'; node.value = Number(distance[2]);
        if (Math.abs(node.value) > 150) throw new CodeError(current.line, 'Use a distance value from −150 to 150.');
      } else if (drawing && current.text === 'forward(distance)') node.type = 'forward_distance';
      else if (drawing && penControl) node.type = penControl[1];
      else if (pen && drawing) {
        node.type = pen[1]; node.value = Number(pen[2]);
        if (node.type === 'forward' && (node.value < 1 || node.value > 150)) throw new CodeError(current.line, 'Choose a distance from 1 to 150.');
        if (node.type === 'turn' && Math.abs(node.value) > 360) throw new CodeError(current.line, 'Choose a turn from −360 to 360 degrees.');
      } else throw new CodeError(current.line, drawing ? 'Use forward(60), turn(90), or a for loop. Other Python commands are not supported here.' : 'Check the command and punctuation. This lab supports movement, for loops, path_clear and score only.');
      cursor++;
      if (loop || condition) {
        if (!lines[cursor] || indentation(lines[cursor].raw, lines[cursor].line) !== indent + 4) throw new CodeError(current.line, 'Add instructions below this line, indented by four spaces.');
        node.body = group(indent + 4, depth + 1);
        if (condition && lines[cursor]?.text === 'else:' && indentation(lines[cursor].raw, lines[cursor].line) === indent) {
          const elseLine = lines[cursor++].line;
          if (!lines[cursor] || indentation(lines[cursor].raw, lines[cursor].line) !== indent + 4) throw new CodeError(elseLine, 'Add an indented instruction inside else.');
          node.type = 'ka_if_else'; node.otherwise = group(indent + 4, depth + 1);
        }
      }
      nodes.push(node);
    }
    return nodes;
  }
  const result = group(0);
  if (cursor !== lines.length) throw new CodeError(lines[cursor].line, 'Check where this else belongs.');
  return result;
}

export function runText(source: string, mission: Mission): RunResult {
  const workspace = new Blockly.Workspace();
  try {
    const nodes = parseCode(source);
    const start = workspace.newBlock('ka_start');
    function connect(items: Statement[], connection: Blockly.Connection | null) {
      for (const node of items) {
        const block = workspace.newBlock(node.type, `line-${node.line}`);
        if (node.value !== undefined) block.setFieldValue(String(node.value), node.type === 'ka_repeat' ? 'COUNT' : 'VALUE');
        if (node.direction) block.setFieldValue(node.direction, 'DIRECTION');
        connection!.connect(block.previousConnection!);
        if (node.body) connect(node.body, block.getInput('DO')!.connection);
        if (node.otherwise) connect(node.otherwise, block.getInput('ELSE')!.connection);
        connection = block.nextConnection;
      }
    }
    connect(nodes, start.nextConnection);
    return evaluateWorkspace(workspace, mission);
  } catch (error) { return { frames: [], success: false, message: error instanceof Error ? error.message : 'Check your code and try again.' }; }
  finally { workspace.dispose(); }
}

export type PenPoint = { x: number; y: number; heading: number; line: number; draw?: boolean };
export function drawProgram(source: string): PenPoint[] {
  const nodes = parseCode(source, true);
  const points: PenPoint[] = [{ x: 150, y: 260, heading: 0, line: 0 }];
  let operations = 0;
  let distance: number | undefined, penDown = true;
  const stack: { point: PenPoint; penDown: boolean }[] = [];
  function visit(items: Statement[]) {
    for (const node of items) {
      if (++operations > 500) throw new CodeError(node.line, 'Use fewer than 500 drawing steps.');
      if (node.body) { for (let i = 0; i < node.value!; i++) visit(node.body); continue; }
      const previous = points[points.length - 1];
      if (node.type === 'distance_set') { distance = node.value; continue; }
      if (node.type === 'distance_change') { if (distance === undefined) throw new CodeError(node.line, 'Set distance before changing it.'); distance += node.value!; continue; }
      if (node.type === 'pen_up' || node.type === 'pen_down') { penDown = node.type === 'pen_down'; continue; }
      if (node.type === 'push') { if (stack.length >= 12) throw new CodeError(node.line, 'Use at most 12 saved branch positions.'); stack.push({ point: previous, penDown }); continue; }
      if (node.type === 'pop') {
        const saved = stack.pop(); if (!saved) throw new CodeError(node.line, 'Use push() before pop() to remember a branch position.');
        penDown = saved.penDown; points.push({ ...saved.point, line: node.line, draw: false }); continue;
      }
      const value = node.type === 'forward_distance' ? distance : node.value;
      if (value === undefined) throw new CodeError(node.line, 'Set distance before using forward(distance).');
      if (node.type !== 'turn' && (value < 1 || value > 150)) throw new CodeError(node.line, 'Keep each distance from 1 to 150.');
      const radians = previous.heading * Math.PI / 180;
      const point = node.type === 'turn' ? { ...previous, heading: previous.heading - value } : { ...previous, x: previous.x + Math.cos(radians) * value, y: previous.y + Math.sin(radians) * value };
      if (point.x < 10 || point.x > 390 || point.y < 10 || point.y > 390) throw new CodeError(node.line, 'Your line leaves the page. Try a shorter distance or another turn.');
      points.push({ ...point, line: node.line, draw: node.type !== 'turn' && penDown });
    }
  }
  visit(nodes);
  if (stack.length) throw new CodeError(nodes.at(-1)?.line ?? 1, 'Finish each saved branch with pop().');
  return points;
}

export function penPath(points: PenPoint[]) {
  return points.map((p, i) => `${i && p.draw ? 'L' : 'M'}${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ');
}
export function drawingMatches(actual: PenPoint[], target: PenPoint[]) {
  const lines = (points: PenPoint[]) => {
    const segments: { from: PenPoint; to: PenPoint }[] = [];
    for (let i=1;i<points.length;i++) {
      const from = points[i-1], to = points[i];
      if (!to.draw || Math.hypot(to.x-from.x,to.y-from.y) < .01) continue;
      const last = segments.at(-1), x = to.x-from.x, y = to.y-from.y;
      if (last && Math.hypot(last.to.x-from.x,last.to.y-from.y)<.01 && Math.abs((last.to.x-last.from.x)*y-(last.to.y-last.from.y)*x)<.01 && (last.to.x-last.from.x)*x+(last.to.y-last.from.y)*y>0) last.to=to;
      else segments.push({ from,to });
    }
    return segments.map(s => [s.from,s.to].map(end => `${end.x.toFixed(2)},${end.y.toFixed(2)}`).sort().join(':')).sort();
  };
  const a = lines(actual), b = lines(target);
  return a.length === b.length && a.every((line,i) => line === b[i]);
}
