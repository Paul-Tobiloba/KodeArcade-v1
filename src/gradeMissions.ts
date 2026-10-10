import type { Mission, Direction, Position } from './learning';
import type { serialization } from 'blockly/core';
import { courses } from './courses';
type State = serialization.blocks.State;
const move = (d: Direction): State => ({ type: `ka_${d}` });
const chain = (...blocks: State[]): State => blocks.reduceRight<State | undefined>((next, block) => ({ ...block, ...(next ? { next: { block: next } } : {}) }), undefined)!;
const repeat = (n: number, body: State): State => ({ type: 'ka_repeat', fields: { COUNT: n }, inputs: { DO: { block: body } } });
const times = (n: number, body: State): State[] => { const out: State[] = []; while (n > 0) { const count = Math.min(5, n); out.push(count === 1 ? structuredClone(body) : repeat(count, structuredClone(body))); n -= count; } return out; };
const check = (yes: State, no?: State): State => ({ type: no ? 'ka_if_else' : 'ka_if', fields: { DIRECTION: 'right' }, inputs: { DO: { block: yes }, ...(no ? { ELSE: { block: no } } : {}) } });
const set = (n: number): State => ({ type: 'ka_set_score', fields: { VALUE: n } });
const change = (n: number): State => ({ type: 'ka_change_score', fields: { VALUE: n } });
const read = (d: Direction): State => ({ type: 'ka_move_score', fields: { DIRECTION: d } });
const names: Record<string, string> = { sequences: 'Sequences', directions: 'Direction & order', loops: 'Loops', debugging: 'Debugging', conditionals: 'Conditionals', variables: 'Variables' };
const guides: Record<string, string> = { sequences: 'Byte', directions: 'Dash', loops: 'Gigi', debugging: 'Fix', conditionals: 'Milo', variables: 'Nova' };
const titles = ['First discovery', 'A different direction', 'Take the corner', 'Choose your path', 'A longer journey', 'Look before moving', 'Patterns on the trail', 'Across the world', 'Put it together', 'Your final mission'];
const countBlocks = (block: State): number => 1 + Object.values(block.inputs ?? {}).reduce((n, input) => n + (input.block ? countBlocks(input.block) : 0), 0) + (block.next?.block ? countBlocks(block.next.block) : 0);
export const gradeSolutions: Record<string, State> = {};
export const gradeMissions: Mission[] = [];
for (const course of courses) {
  const grade = course.grade!, size = course.size;
  for (const topic of course.topics) for (let i = 0; i < 10; i++) {
    const id = `${course.id}-${topic}-${i + 1}`, guide = guides[topic];
    const h = grade <= 2 ? Math.min(4, 1 + Math.floor(i / 2)) : Math.min(size - 1, grade - 1 + Math.floor(i / 2));
    const v = grade <= 2 ? (i < 2 ? 0 : 1 + i % 3) : Math.min(size - 1, 1 + (i % (size - 1)));
    let start = { x: 0, y: size - 1 }, end = { x: h, y: size - 1 - v }, walls: Position[] = [];
    let route: Direction[] = [...Array<Direction>(v).fill('up'), ...Array<Direction>(h).fill('right')];
    let solution: State = chain(...route.map(move)), flags: Partial<Mission> = {}, goal = `Guide ${guide} to the star.`, tip = '';
    if (topic === 'directions' && v > 0) walls = [{ x: 1, y: size - 1 }];
    if (topic === 'loops') {
      const across = Math.max(2, h), up = Math.max(2, v);
      end = { x: across, y: size - 1 - up }; route = [...Array<Direction>(up).fill('up'), ...Array<Direction>(across).fill('right')];
      solution = chain(...times(up, move('up')), ...times(across, move('right'))); flags.requireLoop = true; goal += ' Use a Repeat block.';
    }
    if (topic === 'conditionals') {
      const across = Math.min(size - 2, Math.max(2, h)), rise = Math.min(4, Math.max(1, v));
      if (i < 3) {
        walls = [{ x: across + 1, y: size - 1 }]; end = { x: across, y: size - 1 - rise };
        solution = chain(...times(across, check(move('right'))), check(move('right')), ...times(rise, move('up')));
        tip = `Repeat IF right is clear / Move right ${across} times. Check once more (it skips the rock), then move up ${rise} steps.`;
      } else {
        walls = Array.from({ length: rise + 1 }, (_, j) => ({ x: across, y: size - 1 - j })); end = { x: across - 1, y: size - 1 - rise };
        solution = chain(...times(across - 1 + rise, check(move('right'), move('up')))); flags.requireElse = true;
        tip = `Repeat IF right is clear / Move right, ELSE / Move up ${across - 1 + rise} times. Split counts above five into two Repeat blocks.`;
      }
      flags.conditionals = true; goal = `Guide Milo to the star using ${i < 3 ? 'IF' : 'IF / ELSE'}.`;
    }
    if (topic === 'variables') {
      const a = Math.max(2, h), b = Math.min(size - 2, Math.max(2, Math.min(5, v)));
      const plans = [
        { steps: [set(a), read('right')], x: a, y: 0, score: a },
        { steps: [set(b), read('up')], x: 0, y: b, score: b },
        { steps: [set(a - 1), change(1), read('right')], x: a, y: 0, score: a, change: true },
        { steps: [set(a), change(-1), read('right')], x: a - 1, y: 0, score: a - 1, change: true },
        { steps: [set(0), repeat(b, change(1)), read('up')], x: 0, y: b, score: b, change: true },
        { steps: [set(a), set(b), read('up')], x: 0, y: b, score: b },
        { steps: [set(a), read('right'), read('up')], x: a, y: a, score: a },
        { steps: [set(a), read('right'), change(b - a), read('up')], x: a, y: b, score: b, change: true },
        { steps: [set(0), repeat(b, change(1)), read('right'), change(1), read('up')], x: b, y: b + 1, score: b + 1, change: true },
        { steps: [set(a), read('right'), set(b), read('up')], x: a, y: b, score: b },
      ];
      const p = plans[i]; solution = chain(...p.steps); end = { x: p.x, y: size - 1 - p.y };
      flags = { variables: true, targetScore: p.score, requireChange: p.change, requireVariableRead: true };
      goal = `Reach the star with score = ${p.score}. Use Move by score${p.change ? ' and CHANGE' : ''}.`;
      tip = p.steps.map(s => s.type === 'ka_set_score' ? `SET score to ${s.fields!.VALUE}` : s.type === 'ka_change_score' ? `CHANGE score by ${s.fields!.VALUE}` : s.type === 'ka_repeat' ? `Repeat CHANGE +1 ${b} times` : `Move ${s.fields!.DIRECTION} by score`).join('; ') + '.';
    }
    // Budgets follow a verified compact reference, not its expanded steps.
    if (topic === 'loops' || (topic === 'variables' && [4,8].includes(i))) {
      flags.maxBlocks = countBlocks(solution); flags.requireLoop = true;
    } else if (topic === 'conditionals' && i >= 3) flags.maxBlocks = countBlocks(solution) + 1;
    // Alternate orientation transforms coordinates, commands and conditions together.
    const flipX = i % 2 === 1, flipY = i % 3 === 2;
    const point = (p: Position) => ({ x: flipX ? size - 1 - p.x : p.x, y: flipY ? size - 1 - p.y : p.y });
    const direction = (d: Direction): Direction => flipX && (d === 'right' || d === 'left') ? (d === 'right' ? 'left' : 'right') : flipY && (d === 'up' || d === 'down') ? (d === 'up' ? 'down' : 'up') : d;
    const transform = (s: State): State => ({ ...s, type: ['ka_up','ka_down','ka_left','ka_right'].includes(s.type) ? `ka_${direction(s.type.slice(3) as Direction)}` : s.type, ...(s.fields ? { fields: { ...s.fields, ...(s.fields.DIRECTION ? { DIRECTION: direction(s.fields.DIRECTION as Direction) } : {}) } } : {}), ...(s.inputs ? { inputs: Object.fromEntries(Object.entries(s.inputs).map(([key, input]) => [key, { block: transform(input.block!) }])) } : {}), ...(s.next ? { next: { block: transform(s.next.block!) } } : {}) });
    const words = (s: string) => s.replace(/\b(right|left|up|down)\b/g, d => direction(d as Direction));
    route = route.map(direction); start = point(start); end = point(end); walls = walls.map(point); solution = transform(solution);
    if (!tip) tip = `One route: ${route.join(', ')}.${topic === 'loops' ? ' Group repeated moves with Repeat.' : ''}`; else tip = words(tip);
    gradeSolutions[id] = solution;
    gradeMissions.push({ id, title: `${guide}: ${titles[i]}`, concept: names[topic], description: `Grade ${grade}: practise ${names[topic].toLowerCase()} with ${guide}.`, goal, size, start, end, walls, loops: ['loops','conditionals','variables'].includes(topic), starter: topic === 'debugging' ? [...route.slice(0,-1), route.at(-1) === 'up' ? 'right' : 'up'] : [], solution: route, hints: [`Find ${guide} and the star. Trace a clear route.`, topic === 'variables' ? 'SET stores a number; CHANGE updates it. Read score at each step.' : topic === 'conditionals' ? 'Check from the current square. DO means clear; ELSE means blocked.' : 'Count the rows and columns. Each movement changes one square.', topic === 'loops' ? 'Split long repeated stretches into counts of two to five.' : 'Predict the next step, then run and watch your program.', tip], reflection: 'Explain what your program does, then try a different solution.', ...flags });
  }
  const id = `${course.id}-rescue-project`, n = size - 1;
  gradeSolutions[id] = grade === 1 ? chain(...Array.from({ length: n }, () => move('right')), ...Array.from({ length: n }, () => move('up'))) : chain(...times(n, move('right')), ...times(n, move('up')));
  gradeMissions.push({ id, title: 'Your world, your route', concept: 'Build project', description: `Design your own Grade ${grade} route.`, goal: 'Choose a destination and guide Byte there.', size, start: { x: 0, y: n }, end: { x: n, y: 0 }, walls: [{ x: Math.floor(size / 2), y: Math.floor(size / 2) }], loops: grade >= 2, starter: [], hints: ['Choose a clear destination.', 'Plan a route before adding blocks.', 'Use the outside edges to avoid the rock.', 'Go across the bottom, then up the right edge.'], reflection: 'Can you design a different route to the same goal?' });
}
