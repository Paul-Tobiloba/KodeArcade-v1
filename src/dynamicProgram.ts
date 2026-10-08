import type * as Blockly from 'blockly/core';
import { directions, same, type Direction, type Frame, type Mission, type RunResult } from './learning';

// Conditions and variables must be evaluated at runtime, not expanded before
// movement: both the character's position and the stored value can change.
export function runDynamic(first: Blockly.Block | null, mission: Mission): RunResult {
  let position = { ...mission.start }, score: number | undefined;
  let error = '', operations = 0, usedIf = false, usedElse = false, usedSet = false, usedChange = false, usedRead = false;
  const frames: Frame[] = [];
  const delta = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] };
  const clear = (direction: Direction) => {
    const [x, y] = delta[direction]; const next = { x: position.x + x, y: position.y + y };
    return next.x >= 0 && next.x < mission.size && next.y >= 0 && next.y < mission.size && !mission.walls.some(w => same(w, next));
  };
  const frame = (block: Blockly.Block, note?: string) => frames.push({ ...position, blockId: block.id, step: frames.length + 1, ...(score !== undefined ? { score } : {}), ...(note ? { note } : {}) });
  function move(block: Blockly.Block, direction: Direction) {
    if (!clear(direction)) { error = `The path ${direction} is blocked by a rock or the edge. Check the direction before moving.`; return; }
    const [x, y] = delta[direction]; position = { x: position.x + x, y: position.y + y }; frame(block);
  }
  function visit(firstBlock: Blockly.Block | null, depth = 0) {
    if (depth > 3) { error = 'Use no more than three levels of blocks inside blocks.'; return; }
    let block = firstBlock;
    while (block && !error) {
      if (++operations > 500 || frames.length >= 120) { error = 'This program runs too many steps. Use fewer repeats.'; break; }
      const direction = directions.find(d => block!.type === `ka_${d}` || block!.type === `ka_arrow_${d}`);
      if (direction) move(block, direction);
      else if (block.type === 'ka_repeat') {
        const count = Number(block.getFieldValue('COUNT')), body = block.getInputTargetBlock('DO');
        if (!mission.loops || !Number.isInteger(count) || count < 2 || count > 5 || !body) { error = 'Repeat needs a body and a count from 2 to 5.'; break; }
        for (let i = 0; i < count && !error; i++) visit(body, depth + 1);
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
  if (!error && !same(position, mission.end)) error = `Stopped at row ${position.y + 1}, column ${position.x + 1}. Find a route to the star.`;
  if (!error && mission.conditionals && (!usedIf || (mission.requireElse && !usedElse))) error = `You reached the star! Now solve it using ${mission.requireElse ? 'IF / ELSE' : 'IF'} to practise decisions.`;
  if (!error && mission.variables && (!usedSet || score !== mission.targetScore || (mission.requireChange && !usedChange) || (mission.requireVariableRead && !usedRead))) error = `Reach the star with score = ${mission.targetScore}. Use SET${mission.requireChange ? ', CHANGE' : ''}${mission.requireVariableRead ? ' and Move by score' : ''}.`;
  return { frames, success: !error, message: error || (mission.variables ? `Nova reached the star with score = ${score}. Your variable worked!` : 'Milo reached the star. Your decisions found a clear path!') };
}
