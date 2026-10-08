import type { Mission, Position } from './learning';
import type { serialization } from 'blockly/core';
type State = serialization.blocks.State;
const move = (direction: string): State => ({ type: `ka_${direction}` });
const join = (...blocks: State[]): State => blocks.reduceRight<State | undefined>((next, block) => ({ ...block, ...(next ? { next: { block: next } } : {}) }), undefined)!;
const check = (direction: string, yes: State, no?: State): State => ({ type: no ? 'ka_if_else' : 'ka_if', fields: { DIRECTION: direction }, inputs: { DO: { block: yes }, ...(no ? { ELSE: { block: no } } : {}) } });
const set = (value: number): State => ({ type: 'ka_set_score', fields: { VALUE: value } });
const change = (value: number): State => ({ type: 'ka_change_score', fields: { VALUE: value } });
const use = (direction: string): State => ({ type: 'ka_move_score', fields: { DIRECTION: direction } });
const repeat = (n: number, body: State): State => ({ type: 'ka_repeat', fields: { COUNT: n }, inputs: { DO: { block: body } } });

const choices: { title: string; start: Position; end: Position; walls: Position[]; solution: State; tip: string; else?: boolean }[] = [
  { title: 'Milo checks the path', start: { x: 1, y: 2 }, end: { x: 2, y: 2 }, walls: [], solution: check('right', move('right')), tip: 'Use IF path right is clear, with Move right inside.' },
  { title: 'Not this way!', start: { x: 1, y: 2 }, end: { x: 1, y: 1 }, walls: [{ x: 2, y: 2 }], solution: join(check('right', move('right')), move('up')), tip: 'The right path is blocked. An IF with Move right skips its body; add Move up afterwards.' },
  { title: 'Another way around', start: { x: 1, y: 2 }, end: { x: 1, y: 1 }, walls: [{ x: 2, y: 2 }], solution: check('right', move('right'), move('up')), tip: 'Use IF / ELSE: if right is clear move right, else move up.', else: true },
  { title: 'The open branch', start: { x: 1, y: 2 }, end: { x: 2, y: 2 }, walls: [], solution: check('right', move('right'), move('down')), tip: 'Right is clear. Put Move right in DO, and Move down in ELSE.', else: true },
  { title: 'Look up first', start: { x: 2, y: 2 }, end: { x: 1, y: 2 }, walls: [{ x: 2, y: 1 }], solution: check('up', move('up'), move('left')), tip: 'Check UP. If it is blocked, the ELSE branch should move left.', else: true },
  { title: 'The edge is a clue', start: { x: 4, y: 2 }, end: { x: 4, y: 1 }, walls: [], solution: check('right', move('right'), move('up')), tip: 'An edge also blocks the path. Check right, then use ELSE to move up.', else: true },
  { title: 'Check again after moving', start: { x: 0, y: 2 }, end: { x: 1, y: 1 }, walls: [{ x: 2, y: 2 }], solution: repeat(2, check('right', move('right'), move('up'))), tip: 'Repeat twice: if right is clear move right, else move up. The second check happens from a new square.', else: true },
  { title: 'Two decisions', start: { x: 2, y: 3 }, end: { x: 1, y: 2 }, walls: [{ x: 2, y: 2 }], solution: join(check('up', move('up'), move('left')), check('up', move('up'))), tip: 'First check up and choose left in ELSE. Then check up again from the new square.', else: true },
  { title: 'Across, then choose', start: { x: 0, y: 3 }, end: { x: 2, y: 2 }, walls: [{ x: 3, y: 3 }], solution: join(repeat(2, move('right')), check('right', move('right'), move('up'))), tip: 'Repeat right twice, then check right. Move up in ELSE.', else: true },
  { title: 'Decision jungle mission', start: { x: 0, y: 3 }, end: { x: 2, y: 1 }, walls: [{ x: 2, y: 3 }, { x: 3, y: 2 }], solution: repeat(4, check('right', move('right'), move('up'))), tip: 'Repeat four times: if right is clear move right, else move up. Watch the decision change along the route.', else: true },
];
const values: { title: string; score: number; route: State[]; end: Position; tip: string; change?: boolean; read?: boolean }[] = [
  { title: 'Nova remembers a number', score: 1, route: [set(1), move('right')], end: { x: 1, y: 4 }, tip: 'Set score to 1, then move right to the star.' },
  { title: 'Use the number', score: 2, route: [set(2), use('right')], end: { x: 2, y: 4 }, tip: 'Set score to 2, then use Move right by score steps.', read: true },
  { title: 'A longer treasure trail', score: 3, route: [set(3), use('up')], end: { x: 0, y: 1 }, tip: 'Set score to 3, then move up by score steps.', read: true },
  { title: 'One more acorn', score: 3, route: [set(2), change(1), use('right')], end: { x: 3, y: 4 }, tip: 'Set score to 2, change it by 1, then move right by score.', change: true, read: true },
  { title: 'Spend an acorn', score: 2, route: [set(3), change(-1), use('up')], end: { x: 0, y: 2 }, tip: 'Set score to 3, change it by -1, then move up by score.', change: true, read: true },
  { title: 'A new value replaces the old', score: 2, route: [set(4), set(2), use('right')], end: { x: 2, y: 4 }, tip: 'Try setting score to 4 and then to 2. The last value is the one Move by score uses.', read: true },
  { title: 'Count with a loop', score: 3, route: [set(0), repeat(3, change(1)), use('up')], end: { x: 0, y: 1 }, tip: 'Set score to 0. Repeat Change score by 1 three times, then move up by score.', change: true, read: true },
  { title: 'Reuse your score', score: 2, route: [set(2), use('right'), use('up')], end: { x: 2, y: 2 }, tip: 'Set score to 2. Move right by score, then up by score. Reading it does not use it up.', read: true },
  { title: 'Update between journeys', score: 1, route: [set(3), use('right'), change(-2), use('up')], end: { x: 3, y: 3 }, tip: 'Set score to 3 and move right by score. Change by -2, then move up by the new score.', change: true, read: true },
  { title: 'Treasure grove mission', score: 3, route: [set(0), repeat(2, change(1)), use('right'), change(1), use('up')], end: { x: 2, y: 1 }, tip: 'Set score to 0. Repeat +1 twice, move right by score, add 1 more, then move up by score.', change: true, read: true },
];
export const topicSolutions: Record<string, State> = {};
export const topicMissions: Mission[] = [
  ...choices.map((item, i): Mission => {
    const id = `conditionals-${i + 1}`; topicSolutions[id] = item.solution;
    return { id, title: item.title, concept: 'Conditionals', description: 'Milo chooses a route by checking what is clear right now.', goal: `Guide Milo to the star using ${item.else ? 'IF / ELSE' : 'IF'}.`, size: 5, start: item.start, end: item.end, walls: item.walls, loops: true, conditionals: true, requireElse: item.else, starter: [], hints: ['Trace the clear squares between Milo and the star.', 'A check uses Milo’s current square, not the starting square. Rocks and edges mean blocked.', 'DO runs when the checked direction is clear; ELSE runs when it is blocked.', item.tip], reflection: 'The same condition can give a different answer after the character moves.' };
  }),
  ...values.map((item, i): Mission => {
    const id = `variables-${i + 1}`; topicSolutions[id] = join(...item.route);
    return { id, title: item.title, concept: 'Variables', description: 'Nova stores a number named score, changes it, and uses it to plan a treasure trail.', goal: `Reach the star with score = ${item.score}${item.read ? ' using Move by score' : ''}${item.change ? ' and Change score' : ''}.`, size: 5, start: { x: 0, y: 4 }, end: item.end, walls: [], loops: true, variables: true, targetScore: item.score, requireChange: item.change, requireVariableRead: item.read, starter: [], hints: ['Read the target score and find the star.', 'SET replaces score. CHANGE adds to the value already stored; negative numbers subtract.', 'Move by score reads the value at that moment. It does not change score.', item.tip], reflection: 'A variable remembers its value until a SET or CHANGE instruction updates it.' };
  }),
];
