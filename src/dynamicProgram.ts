import type * as Blockly from 'blockly/core';
import { directions, same, type Direction, type Frame, type Mission, type RunResult } from './learning';
import { characterFor } from './characters';

// Conditions and variables must be evaluated at runtime, not expanded before
// movement: both the character's position and the stored value can change.
export function runDynamic(first: Blockly.Block | null, mission: Mission): RunResult {
  let position = { ...mission.start }, score: number | undefined;
  let error = '', operations = 0, usedIf = false, usedElse = false, usedSet = false, usedChange = false, usedRead = false, usedLoop = false;
  const collected: { x: number; y: number }[] = [];
  let gateOpen = !mission.gate?.locked, bridgeBuilt = !!mission.river?.built, collectedGoal = false;
  const adjacent = (p: { x: number; y: number }) => Math.abs(p.x-position.x) + Math.abs(p.y-position.y) === 1;
  const itemHere = () => !!mission.collectibles?.positions.some(p => same(p, position) && !collected.some(c => same(c, p)));
  const frames: Frame[] = [];
  const delta = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] };
  const clear = (direction: Direction) => {
    const [x, y] = delta[direction]; const next = { x: position.x + x, y: position.y + y };
    return next.x >= 0 && next.x < mission.size && next.y >= 0 && next.y < mission.size && !mission.walls.some(w => same(w, next)) && !(mission.gate && !gateOpen && same(next,mission.gate.position)) && !(mission.river && !bridgeBuilt && same(next,mission.river.position));
  };
  const frame = (block: Blockly.Block, note?: string) => frames.push({ ...position, blockId: block.id, step: frames.length + 1, ...(score !== undefined ? { score } : {}), ...(note ? { note } : {}), ...(mission.collectibles ? { collected: [...collected] } : {}), ...(mission.gate ? { gateOpen } : {}), ...(mission.river ? { bridgeBuilt } : {}) });
  function move(block: Blockly.Block, direction: Direction) {
    if (mission.countPickups && score !== collected.length) { error = 'Count each pickup once: SET score to 0 first, then CHANGE by 1 after picking up. Do not count empty squares.'; return; }
    const [dx,dy] = delta[direction], next = { x: position.x+dx, y: position.y+dy };
    if (mission.river && !bridgeBuilt && same(next,mission.river.position)) { position = next; frame(block, 'Splash! Build the bridge before crossing.'); frames.at(-1)!.fell = true; error = 'Splash! The river has no bridge. Build a bridge from the bank before crossing.'; return; }
    if (mission.gate && !gateOpen && same(next,mission.gate.position)) { error = 'The gate is locked. Find the key, return beside the gate, then open it.'; return; }
    if (!clear(direction)) { error = mission.holes?.some(p => same(p,next)) ? 'There is a hole here! Stay on the numbered path and use Move to next path tile.' : `The path ${direction} is blocked by a plant, rock or the edge. Check the direction before moving.`; return; }
    const [x, y] = delta[direction]; position = { x: position.x + x, y: position.y + y }; frame(block);
  }
  function visit(firstBlock: Blockly.Block | null, depth = 0) {
    if (depth > 3) { error = 'Use no more than three levels of blocks inside blocks.'; return; }
    let block = firstBlock;
    while (block && !error && !collectedGoal) {
      if (++operations > 500 || frames.length >= 120) { error = 'This program runs too many steps. Use fewer repeats.'; break; }
      const direction = directions.find(d => block!.type === `ka_${d}` || block!.type === `ka_arrow_${d}`);
      if (direction) move(block, direction);
      else if (block.type === 'ka_move_next') {
        const index = mission.trail?.findIndex(p => same(p,position)) ?? -1;
        const next = index >= 0 ? mission.trail?.[index + 1] : undefined;
        if (!next) { error = 'There is no next trail tile here. Check for a carrot before moving, or return to the marked path.'; break; }
        const dx = next.x-position.x, dy = next.y-position.y;
        if (Math.abs(dx)+Math.abs(dy) !== 1) { error = 'This trail needs an adjacent next tile.'; break; }
        move(block, dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up');
      }
      else if (block.type === 'ka_repeat') {
        const count = Number(block.getFieldValue('COUNT')), body = block.getInputTargetBlock('DO');
        if (!mission.loops || !Number.isInteger(count) || count < 2 || count > 5 || !body) { error = 'Repeat needs a body and a count from 2 to 5.'; break; }
        usedLoop = true;
        for (let i = 0; i < count && !error && !collectedGoal; i++) visit(body, depth + 1);
      } else if (block.type === 'ka_open_gate' || block.type === 'ka_build_bridge') {
        if (block.type === 'ka_open_gate') {
          if (!mission.gate || !adjacent(mission.gate.position)) { error = 'Stand beside the gate before opening it.'; break; }
          if (!gateOpen && !(mission.collectibles?.kind === 'key' && collected.length)) { error = 'Find and pick up the key before opening the gate.'; break; }
          gateOpen = true; frame(block, 'Gate open. The route is clear!');
        } else {
          if (!mission.river || !adjacent(mission.river.position)) { error = 'Stand on the bank beside the river before building.'; break; }
          if (bridgeBuilt) { error = 'A bridge already exists. Check IF bridge missing to avoid building twice.'; break; }
          bridgeBuilt = true; frame(block, 'Bridge built. You can cross safely!');
        }
      } else if (block.type === 'ka_if_gate_locked' || block.type === 'ka_if_bridge_missing') {
        const gate = block.type === 'ka_if_gate_locked', obstacle = gate ? mission.gate : mission.river;
        if (!mission.conditionals || !obstacle || !adjacent(obstacle.position)) { error = `Stand beside the ${gate ? 'gate' : 'river'} before checking it.`; break; }
        const body = block.getInputTargetBlock('DO');
        if (!body) { error = 'Put actions inside your check.'; break; }
        usedIf = true; const answer = gate ? !gateOpen : !bridgeBuilt;
        frame(block, `${gate ? 'Gate locked' : 'Bridge missing'}: ${answer ? 'yes, run DO' : 'no, skip DO'}.`);
        if (answer) visit(body, depth + 1);
      } else if (block.type === 'ka_pick_item') {
        if (!itemHere()) { error = 'There is no item on this square. Check with IF item here before picking up.'; break; }
        collected.push({ ...position }); frame(block, `Picked up ${mission.collectibles!.kind}. ${collected.length} collected.`);
        collectedGoal = !!mission.collectOnly && collected.length === mission.collectibles!.positions.length;
      } else if (block.type === 'ka_if_item' || block.type === 'ka_if_item_else') {
        if (!mission.collectibles || !mission.conditionals) { error = 'Use item checks in a collecting activity.'; break; }
        const yes = block.getInputTargetBlock('DO'), no = block.getInputTargetBlock('ELSE');
        if (!yes || (block.type === 'ka_if_item_else' && !no)) { error = 'Add instructions to every branch of your item check.'; break; }
        const answer = itemHere(); usedIf = true; usedElse ||= !!no;
        frame(block, `${mission.collectibles.kind} ${answer ? 'found: run DO' : 'not here: ' + (no ? 'run ELSE' : 'skip DO')}.`);
        visit(answer ? yes : no, depth + 1);
      } else if (block.type === 'ka_if' || block.type === 'ka_if_else') {
        if (!mission.conditionals) { error = 'Use conditional blocks in the Conditionals topic.'; break; }
        const direction = block.getFieldValue('DIRECTION') as Direction;
        const yes = block.getInputTargetBlock('DO'), no = block.getInputTargetBlock('ELSE');
        if (!directions.includes(direction) || !yes || (block.type === 'ka_if_else' && !no)) { error = 'Add instructions to every branch of your IF block.'; break; }
        usedIf = true; usedElse ||= block.type === 'ka_if_else';
        const answer = clear(direction); frame(block, `${direction} is ${answer ? 'clear: run DO' : 'blocked: skip DO' + (no ? ' and run ELSE' : '')}.`);
        visit(answer ? yes : no, depth + 1);
      } else if (['ka_set_score', 'ka_change_score', 'ka_move_score'].includes(block.type)) {
        if (!mission.variables) { error = 'Use score blocks in the Variables topic.'; break; }
        if (block.type === 'ka_move_score') {
          if (score === undefined) { error = 'Set score before using it to move.'; break; }
          const direction = block.getFieldValue('DIRECTION') as Direction;
          if (!directions.includes(direction) || !Number.isInteger(score) || score < 0 || score > 10) { error = 'Use a score from 0 to 10 for movement.'; break; }
          usedRead = true;
          frame(block, `Read score = ${score}. Move ${direction} ${score} steps.`);
          for (let i = 0; i < score && !error; i++) move(block, direction);
        } else {
          const value = Number(block.getFieldValue('VALUE'));
          if (mission.countPickups && (block.type === 'ka_set_score' ? value !== 0 || collected.length > 0 : value !== 1 || score === undefined || score + value !== collected.length)) { error = 'Start score at 0. Add exactly 1 after each pickup, not after an empty square.'; break; }
          if (!Number.isInteger(value) || value < -10 || value > 10) { error = 'Choose a whole number from -10 to 10.'; break; }
          if (block.type === 'ka_change_score' && score === undefined) { error = 'Set score first, then change it.'; break; }
          if (block.type === 'ka_set_score') { score = value; usedSet = true; } else { score = score! + value; usedChange = true; }
          if (Math.abs(score) > 100) { error = 'Keep score between -100 and 100 for this activity.'; break; }
          frame(block, `score = ${score}`);
        }
      } else error = 'This block is not available in this topic. Replace it with a block from the palette.';
      block = block.getNextBlock();
    }
  }
  visit(first);
  if (!error && !first) error = 'Add blocks below the start block, then press Play.';
  if (!error && !mission.collectOnly && !same(position, mission.end)) error = `Stopped at row ${position.y + 1}, column ${position.x + 1}. Find a route to the star.`;
  if (!error && mission.collectibles && collected.length !== mission.collectibles.positions.length) error = `Collect all ${mission.collectibles.positions.length} ${mission.collectibles.kind} items before finishing. You collected ${collected.length}.`;
  if (!error && mission.requireLoop && !usedLoop) error = 'Use a Repeat block (for loop) to repeat the pattern, rather than writing every action again.';
  if (!error && mission.conditionals && (!usedIf || (mission.requireElse && !usedElse))) error = `${mission.collectOnly ? 'You found the carrots!' : 'You reached the star!'} Now solve it using ${mission.requireElse ? 'IF / ELSE' : 'IF'} to practise decisions.`;
  if (!error && mission.variables && (!usedSet || score !== mission.targetScore || (mission.requireChange && !usedChange) || (mission.requireVariableRead && !usedRead))) error = `Reach the star with score = ${mission.targetScore}. Use SET${mission.requireChange ? ', CHANGE' : ''}${mission.requireVariableRead ? ' and Move by score' : ''}.`;
  return { frames, success: !error, message: error || (mission.collectOnly ? `${characterFor(mission.concept).name} collected all ${collected.length} carrots! The collection is the goal—no finish tile needed.` : mission.variables ? `Nova reached the star with score = ${score}. Your variable worked!` : `${characterFor(mission.concept).name} reached the star. Your decisions found a clear path!`) };
}
