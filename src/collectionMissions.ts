import type { serialization } from 'blockly/core';
import type { Mission, Position } from './learning';
import { courses } from './courses';

type State = serialization.blocks.State;
const chain = (...blocks: State[]): State => blocks.reduceRight<State | undefined>((next, block) => ({ ...block, ...(next ? { next: { block: next } } : {}) }), undefined)!;
const move = (direction: string): State => ({ type: `ka_${direction}` });
const pick = (): State => ({ type: 'ka_pick_item' });
const repeat = (count: number, body: State): State => ({ type: 'ka_repeat', fields: { COUNT: count }, inputs: { DO: { block: body } } });
const check = (type: string, body: State, otherwise?: State): State => ({ type, inputs: { DO: { block: body }, ...(otherwise ? { ELSE: { block: otherwise } } : {}) } });
export const collectionSolutions: Record<string, State> = {};
export const collectionMissions: Mission[] = [];

// These replace selected core slots, with versioned IDs to preserve old work.
for (const course of courses.filter(c => c.grade! >= 3)) {
  const slots: Record<string, number> = { directions: 7, loops: 7, variables: 7, conditionals: 7 };
  const add = (slug: string, topic: string, mission: Partial<Mission>, solution: State, open: Position[]) => {
    const slot = slug === 'carrot-check' ? 3 : slug === 'carrot-empty' ? 4 : slots[topic]++;
    const replaces = `${course.id}-${topic}-${slot}`;
    const id = `${replaces}-world-v2`;
    const walls = Array.from({ length: course.size ** 2 }, (_, i) => ({ x: i % course.size, y: Math.floor(i / course.size) })).filter(p => !open.some(q => p.x === q.x && p.y === q.y));
    collectionSolutions[id] = solution;
    collectionMissions.push({ id, replaces, title: '', concept: '', description: slug, goal: '', size: course.size, start: { x: 0, y: 2 }, end: { x: 3, y: 2 }, walls, loops: true, conditionals: true, starter: [], hints: [], reflection: 'Explain which checks changed as your character moved.', ...mission });
  };
  const row = Array.from({ length: 5 }, (_, x) => ({ x, y: 2 }));
  const carrotHints = ['Check the square Dash is standing on, not the next square.', 'IF item here runs Pick up. ELSE runs Move to next path tile. Picking up does not move Dash.', 'Follow the numbered path around plants and holes. After a pickup that square is empty, so the next check moves on.', 'Repeat 3 times: Repeat 5 times: IF item here / Pick up; ELSE / Move to next path tile. Stop automatically at five carrots.'];
  const carrotTrails: Position[][] = [
    [{x:0,y:4},{x:1,y:4},{x:2,y:4},{x:2,y:3},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:4,y:1},{x:5,y:1}],
    [{x:5,y:4},{x:4,y:4},{x:3,y:4},{x:3,y:3},{x:3,y:2},{x:2,y:2},{x:1,y:2},{x:1,y:1},{x:0,y:1}],
  ];
  for (const [index, trail] of carrotTrails.entries()) add(index ? 'carrot-empty' : 'carrot-check', 'conditionals', {
    title: index ? 'Dash: Empty square first' : 'Dash: Carrot or clear path?', concept: 'Direction & order',
    description: 'Check each position: pick up a carrot if present; otherwise follow the next numbered path tile around plants and holes.',
    goal: 'Collect all five carrots. There is no finish line! Use IF / ELSE inside Repeat.',
    start: trail[0], end: trail[trail.length-1], collectOnly: true, trail,
    holes: index ? [{x:4,y:3},{x:2,y:3}] : [{x:1,y:3},{x:3,y:3}],
    collectibles: {kind:'carrot',positions:(index ? [1,2,4,5,7] : [0,2,4,6,8]).map(i => trail[i])},
    requireElse: true, requireLoop: true, maxBlocks: 5, hints: carrotHints,
  }, repeat(3,repeat(5,check('ka_if_item_else',pick(),{type:'ka_move_next'}))),trail);
  add('leaf-patrol', 'loops', { title: 'Gigi: Check after every jump', concept: 'Loops', description: 'Move first, then pick up a leaf. The order inside a loop matters: picking before moving tries to collect from the empty starting square.', goal: 'Collect all three leaves and reach the golden leaf. Repeat the whole move-and-pick pattern.', collectibles: { kind: 'leaf', positions: row.slice(1,4) }, requireLoop: true, maxBlocks: 3, conditionals: false, hints: ['The first leaf is one square right.', 'The loop body must move before it checks.', 'Both Move right and Pick up belong inside Repeat.', 'Repeat three times: Move right, then Pick up.'] }, repeat(3, chain(move('right'), pick())), row.slice(0,4));
  add('acorn-counter', 'variables', { title: 'Nova: Count only real finds', concept: 'Variables', description: 'Some squares have acorns and some are empty. Increase score only after a successful pickup, not after every movement.', goal: 'Collect three acorns and finish with score = 3. Use a changing variable inside a loop.', end: { x: 4, y: 2 }, collectibles: { kind: 'acorn', positions: [row[0],row[1],row[3]] }, variables: true, targetScore: 3, requireChange: true, requireLoop: true, maxBlocks: 6, countPickups: true, hints: ['SET score to zero before repeating.', 'Only the yes branch should pick up and CHANGE score by 1.', 'Move right after the check, whether an acorn was present or not.', 'SET 0; Repeat 4: IF item here / Pick up + CHANGE 1; Move right.'] }, chain({ type: 'ka_set_score', fields: { VALUE: 0 } }, repeat(4, chain(check('ka_if_item', chain(pick(), { type: 'ka_change_score', fields: { VALUE: 1 } })), move('right')))), row);
  const gatePlan = chain(move('right'), check('ka_if_gate_locked', chain(move('down'), pick(), move('up'), { type: 'ka_open_gate' })), move('right'), move('right'), move('right'));
  for (const locked of [true,false]) add(locked ? 'locked-gate' : 'open-gate', 'conditionals', {
    title: locked ? 'Milo: Find the key and come back' : 'Milo: The door is already open', concept: 'Conditionals',
    description: locked ? 'The locked gate is ahead. Check it, take the side path to the key, return and unlock it before crossing.' : 'Reuse your gate-check program. When the gate is already open, skip the key hunt and pass straight through.',
    goal: locked ? 'Collect the key, return to the gate, open it and reach the basket.' : 'Check the gate, skip the key branch and reach the basket.',
    end: { x: 4, y: 2 }, gate: { position: { x: 2, y: 2 }, locked }, collectibles: { kind: 'key', positions: locked ? [{ x: 1, y: 3 }] : [] }, maxBlocks: 9,
    hints: ['Move right once to stand beside the gate.', 'IF gate locked checks the adjacent gate now. If it is open, skip the whole branch.', 'The key is below the square beside the gate. Return to that square before opening.', 'Move right; IF gate locked: down, Pick up, up, Open gate; then right three times.'],
  }, gatePlan, [...row, { x: 1, y: 3 }]);
  for (const built of [false,true]) add(built ? 'safe-bridge' : 'build-bridge', 'conditionals', {
    title: built ? 'Milo: A bridge is already there' : 'Milo: Build before you cross', concept: 'Conditionals',
    description: built ? 'Check the crossing. The bridge already exists, so skip building and continue safely.' : 'Water blocks the route. Walking into it causes a splash. Stand beside it and build a bridge first.',
    goal: 'Check the river, build only if the bridge is missing, then reach the basket.', end: { x: 4, y: 2 }, river: { position: { x: 2, y: 2 }, built }, maxBlocks: 6,
    hints: ['Move right once to stand at the river bank.', 'IF bridge missing asks whether the adjacent river needs a bridge.', 'Put Build bridge inside the yes branch. Crossing before building is unsafe.', 'Move right; IF bridge missing / Build bridge; then Move right three times.'],
  }, chain(move('right'), check('ka_if_bridge_missing', { type: 'ka_build_bridge' }), move('right'), move('right'), move('right')), row);
}
