import { topicMissions } from './topicMissions';
import { gradeMissions } from './gradeMissions';
export type Direction = 'right' | 'down' | 'left' | 'up';
export type Block = { id: string; kind: Direction | 'repeat'; direction: Direction; count: number };
export type Position = { x: number; y: number };
export type Mission = {
  id: string; title: string; concept: string; description: string; goal: string;
  size: number; start: Position; end: Position; walls: Position[]; loops: boolean;
  requireLoop?: boolean; starter: Direction[]; hints: string[]; reflection: string;
  solution?: Direction[];
  conditionals?: boolean; variables?: boolean; targetScore?: number;
  requireElse?: boolean; requireChange?: boolean; requireVariableRead?: boolean;
};
export const directions: Direction[] = ['right', 'down', 'left', 'up'];
export const labels: Record<Direction, string> = { right: 'Move right', down: 'Move down', left: 'Move left', up: 'Move up' };
export const missions: Mission[] = [
  { id: 'first-steps', title: 'A little help for Byte', concept: 'Sequences',
    description: 'Byte’s battery is running low. Give our little robot a path to the charging station.',
    goal: 'Move Byte three squares right to the charging station.', size: 5,
    start: { x: 0, y: 2 }, end: { x: 3, y: 2 }, walls: [], loops: false, starter: [],
    hints: ['Look at Byte and the yellow charging station. Are they in the same row?', 'A sequence is a set of instructions in order. Each movement block moves Byte one square.', 'For a station two squares away, you could use two Move right blocks.', 'Add a Move right block. You need three of these blocks in total, then select Play.'],
    reflection: 'Each block is one step. Changing the number of blocks changes where Byte stops.' },
  { id: 'take-a-turn', title: 'The way around', concept: 'Direction & order',
    description: 'There’s a rock in the route. Plan a path around it and bring Byte safely to the station.',
    goal: 'Reach the station in row 2, column 4. Avoid the rocks.', size: 5,
    start: { x: 0, y: 3 }, end: { x: 3, y: 1 }, walls: [{ x: 2, y: 3 }, { x: 2, y: 2 }], loops: false, starter: [],
    hints: ['Find the two rock squares. Byte cannot move through them.', 'Order matters: moving up before moving right can change which squares Byte visits.', 'If a rock blocks a row, move to a clear row before crossing it.', 'Try moving up twice from the start. Then check the clear route to the right.'],
    reflection: 'Different orders visit different squares, even when you use the same movement blocks.' },
  { id: 'on-repeat', title: 'Less code, same journey', concept: 'Loops',
    description: 'A long stretch of path needs the same move again and again. A repeat block can help.',
    goal: 'Move four squares right using a Repeat block.', size: 5,
    start: { x: 0, y: 2 }, end: { x: 4, y: 2 }, walls: [], loops: true, requireLoop: true, starter: [],
    hints: ['Count how many squares lie between Byte’s starting position and the station.', 'A loop repeats the instructions inside it. Drag movement blocks into a Repeat block.', 'Repeating Move down 3 times does the same work as three Move down blocks.', 'Connect Repeat below the start block. Drag Move right inside it and set the count to 4. Then run your code.'],
    reflection: 'A repeat block can replace several identical movement blocks. The count says how many times it runs.' },
  { id: 'fix-the-route', title: 'A bug in the route', concept: 'Debugging',
    description: 'Someone left Byte a program, but one instruction points the wrong way. Run it, notice what happens, and repair it.',
    goal: 'Fix the starter program to reach row 3, column 3.', size: 5,
    start: { x: 0, y: 4 }, end: { x: 2, y: 2 }, walls: [{ x: 3, y: 4 }], loops: true,
    starter: ['right', 'right', 'up', 'right'],
    hints: ['Watch the last block. Does Byte move toward the station or away from it?', 'Debugging means finding a problem, changing it, and trying again.', 'If a robot ends one square to the right of where it should go, inspect its rightward moves.', 'The first three blocks bring Byte just below the station. Change the final Move right to Move up.'],
    reflection: 'Running and watching a program gives you evidence about what to change. A bug is something to investigate.' },
  { id: 'rescue-project', title: 'Your route, your rules', concept: 'Build project',
    description: 'You’re the route designer now. Choose the station’s position, then build a rescue route of your own.',
    goal: 'Choose a destination and guide Byte there. Try a second route when you’re done.', size: 5,
    start: { x: 0, y: 4 }, end: { x: 4, y: 0 }, walls: [{ x: 2, y: 2 }], loops: true, starter: [],
    hints: ['Choose a station square that leaves space for a route around the rock.', 'Break your route into parts: across a row, then up or down a column.', 'A repeated move and a few single moves can work together in one program.', 'Try a clear outside edge of the board first, then turn toward your station.'],
    reflection: 'There can be more than one correct program. Can you reach the same station by a different route?' },
  { id: 'sequence-up', title: 'A different direction', concept: 'Sequences', description: 'Byte’s next charging station is above the starting square. Build a new sequence to reach it.',
    goal: 'Move Byte three squares up.', size: 5, start: { x: 2, y: 4 }, end: { x: 2, y: 1 }, walls: [], loops: false, starter: [],
    hints: ['Find the station above Byte.', 'Each Move up block changes the row by one.', 'Two Move up blocks move two squares toward the top.', 'Connect three Move up blocks below the start block.'], reflection: 'A sequence works in any direction. Each instruction still happens one at a time.' },
  { id: 'sequence-corner', title: 'First across, then up', concept: 'Sequences', description: 'The station is in a different row and column. Combine two kinds of movement in one sequence.',
    goal: 'Reach row 3, column 3 from the bottom-left corner.', size: 5, start: { x: 0, y: 4 }, end: { x: 2, y: 2 }, walls: [], loops: false, starter: [],
    hints: ['Byte needs to move both right and up.', 'One program can contain different movement instructions.', 'To move one square across and one square up, use Move right followed by Move up.', 'Try two Move right blocks, then two Move up blocks.'], reflection: 'Combining simple instructions lets you describe a more interesting journey.' },
  { id: 'direction-gap', title: 'Through the gap', concept: 'Direction & order', description: 'A wall of rocks has one opening. Find the opening before you cross the board.',
    goal: 'Pass through the gap in row 2 and reach row 3, column 5.', size: 5, start: { x: 0, y: 2 }, end: { x: 4, y: 2 }, walls: [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], loops: false, starter: [],
    hints: ['The rock wall has a gap in row 2.', 'Choose a clear row before moving across the rocks.', 'A detour can move away from the goal before getting closer.', 'Move up once, right four times, then down once.'], reflection: 'A correct route sometimes takes a detour. Order keeps Byte away from obstacles.' },
  { id: 'direction-home', title: 'A new point of view', concept: 'Direction & order', description: 'Byte starts on the right this time. Plan carefully: left and right always refer to the screen.',
    goal: 'Reach row 2, column 2 without touching the rock.', size: 5, start: { x: 4, y: 3 }, end: { x: 1, y: 1 }, walls: [{ x: 2, y: 3 }], loops: false, starter: [],
    hints: ['The station is above and to the left of Byte.', 'Move left goes toward the left edge of the screen, wherever Byte starts.', 'Move to a clear row before crossing an obstacle.', 'Move up twice, then left three times.'], reflection: 'Directions stay the same even when the starting position changes.' },
  { id: 'loop-corner', title: 'Two little loops', concept: 'Loops', description: 'Byte needs repeated moves in two directions. Give each part of the journey its own loop.',
    goal: 'Reach the top-right station using at least one Repeat block.', size: 5, start: { x: 0, y: 4 }, end: { x: 4, y: 0 }, walls: [], loops: true, requireLoop: true, starter: [],
    hints: ['Count the rightward steps and upward steps separately.', 'A Repeat block repeats everything inside it, then the next block runs.', 'Two Repeat blocks can sit one after the other.', 'Repeat Move right 4 times, then repeat Move up 4 times.'], reflection: 'A program can combine loops in a sequence. Each loop has its own repeated instructions.' },
  { id: 'loop-stairs', title: 'A repeating pattern', concept: 'Loops', description: 'This time, the repeating part has two moves. Put the whole pattern inside your loop.',
    goal: 'Reach row 3, column 3 using a Repeat block.', size: 5, start: { x: 0, y: 4 }, end: { x: 2, y: 2 }, walls: [{ x: 2, y: 4 }, { x: 0, y: 2 }], loops: true, requireLoop: true, starter: [],
    hints: ['Try a short step right, followed by a short step up.', 'A loop can repeat more than one instruction.', 'Repeating [right, up] twice runs right, up, right, up.', 'Put Move right and Move up inside Repeat. Set its count to 2.'], reflection: 'The loop body can be a pattern of several instructions, not only a single move.' },
  { id: 'debug-short', title: 'One step missing', concept: 'Debugging', description: 'The supplied program goes in the right direction but stops too early. Find the smallest repair.',
    goal: 'Repair the program to reach row 3, column 4.', size: 5, start: { x: 0, y: 2 }, end: { x: 3, y: 2 }, walls: [], loops: true, starter: ['right', 'right'],
    hints: ['Run the program and count the empty squares left to the station.', 'A bug can be a missing instruction.', 'If a robot stops one step early, an extra movement can finish the journey.', 'Snap one more Move right block onto the end.'], reflection: 'Debugging is often a small, deliberate change guided by what you observed.' },
  { id: 'debug-order', title: 'Right moves, wrong order', concept: 'Debugging', description: 'All the moves you need are here, but the robot runs into a rock. Rearrange the program.',
    goal: 'Reach row 2, column 3 by changing the order of the starter blocks.', size: 5, start: { x: 0, y: 3 }, end: { x: 2, y: 1 }, walls: [{ x: 1, y: 3 }], loops: true, starter: ['right', 'up', 'right', 'up'],
    hints: ['The very first move points at a rock.', 'You can fix a program by changing its order.', 'Moving up before right can avoid a rock beside the starting square.', 'Rearrange the blocks to Move up, Move up, Move right, Move right.'], reflection: 'The same set of blocks can behave differently when you change the order.' },
];
// Deliberately varied practice routes: straight paths, corners, detours and patterns.
const practice: { topic: string; title: string; start: Position; route: Direction[]; walls?: Position[] }[] = [
  { topic: 'sequences', title: 'One tiny step', start: { x: 1, y: 2 }, route: ['right'] },
  { topic: 'sequences', title: 'Two steps to sunshine', start: { x: 0, y: 1 }, route: ['right','right'] },
  { topic: 'sequences', title: 'Back to the treehouse', start: { x: 4, y: 2 }, route: ['left','left','left'] },
  { topic: 'sequences', title: 'Down to the garden', start: { x: 2, y: 0 }, route: ['down','down','down'] },
  { topic: 'sequences', title: 'Around the little corner', start: { x: 1, y: 3 }, route: ['up','right'] },
  { topic: 'sequences', title: 'Across the sky', start: { x: 0, y: 0 }, route: ['right','right','right','right'] },
  { topic: 'sequences', title: 'Find the picnic spot', start: { x: 4, y: 0 }, route: ['down','down','left','left'] },
  { topic: 'directions', title: 'Below the boulder', start: { x: 0, y: 1 }, route: ['down','right','right','up'], walls: [{ x: 1, y: 1 }] },
  { topic: 'directions', title: 'The upper bridge', start: { x: 0, y: 3 }, route: ['up','right','right','right','down'], walls: [{ x: 1, y: 3 },{ x: 2, y: 3 }] },
  { topic: 'directions', title: 'Left at the lookout', start: { x: 4, y: 4 }, route: ['up','up','left','left'], walls: [{ x: 3, y: 4 }] },
  { topic: 'directions', title: 'A winding trail', start: { x: 0, y: 4 }, route: ['right','up','right','up'], walls: [{ x: 0, y: 3 },{ x: 2, y: 4 }] },
  { topic: 'directions', title: 'The far side', start: { x: 4, y: 0 }, route: ['left','left','down','down','down'], walls: [{ x: 4, y: 1 },{ x: 3, y: 2 }] },
  { topic: 'directions', title: 'The hidden opening', start: { x: 0, y: 0 }, route: ['down','down','right','right','right','right','up'], walls: [{ x: 2, y: 0 },{ x: 2, y: 1 },{ x: 2, y: 3 }] },
  { topic: 'directions', title: 'Home through the canyon', start: { x: 4, y: 4 }, route: ['left','left','left','left','up','up','up'], walls: [{ x: 3, y: 3 },{ x: 2, y: 3 },{ x: 1, y: 3 }] },
  { topic: 'loops', title: 'Two little hops', start: { x: 0, y: 2 }, route: ['right','right'] },
  { topic: 'loops', title: 'Up the waterfall', start: { x: 1, y: 4 }, route: ['up','up','up'] },
  { topic: 'loops', title: 'Left on repeat', start: { x: 4, y: 1 }, route: ['left','left','left','left'] },
  { topic: 'loops', title: 'Down the rainbow', start: { x: 3, y: 0 }, route: ['down','down','down','down'] },
  { topic: 'loops', title: 'A loop and a turn', start: { x: 0, y: 4 }, route: ['right','right','right','up'], walls: [{ x: 1, y: 3 }] },
  { topic: 'loops', title: 'Dancing down the stairs', start: { x: 0, y: 0 }, route: ['right','down','right','down','right','down'] },
  { topic: 'loops', title: 'The double bridge', start: { x: 4, y: 4 }, route: ['left','left','left','up','up','up'], walls: [{ x: 3, y: 3 }] },
  { topic: 'debugging', title: 'Too many steps', start: { x: 0, y: 2 }, route: ['right','right'] },
  { topic: 'debugging', title: 'Point to the sky', start: { x: 2, y: 4 }, route: ['up','up','up'] },
  { topic: 'debugging', title: 'Turn before the rock', start: { x: 0, y: 2 }, route: ['up','right','right'], walls: [{ x: 1, y: 2 }] },
  { topic: 'debugging', title: 'The left-hand clue', start: { x: 4, y: 1 }, route: ['left','left','down'] },
  { topic: 'debugging', title: 'Finish the staircase', start: { x: 0, y: 4 }, route: ['right','up','right','up','right','up'] },
  { topic: 'debugging', title: 'Down, then across', start: { x: 1, y: 0 }, route: ['down','down','right','right'], walls: [{ x: 2, y: 0 }] },
  { topic: 'debugging', title: 'Byte’s final repair', start: { x: 4, y: 4 }, route: ['left','left','up','up','left'], walls: [{ x: 3, y: 3 }] },
];
for (const [index, item] of practice.entries()) {
  let end = { ...item.start };
  for (const direction of item.route) end = { x: end.x + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0), y: end.y + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0) };
  const debugging = item.topic === 'debugging';
  missions.push({ id: `${item.topic}-practice-${index + 1}`, title: item.title, concept: item.topic === 'directions' ? 'Direction & order' : item.topic[0].toUpperCase() + item.topic.slice(1),
    description: debugging ? 'Byte has a mixed-up program. Watch it, change a block, and try again.' : 'Another island needs a little energy. Plan a route and help Byte recharge.',
    goal: `Guide Byte to the yellow station${item.topic === 'loops' ? ' using a Repeat block' : ''}.`, size: 5, start: item.start, end, walls: item.walls ?? [], loops: item.topic === 'loops' || debugging, requireLoop: item.topic === 'loops',
    starter: debugging ? [...item.route.slice(0, -1), item.route.at(-1) === 'up' ? 'right' : 'up'] : [], solution: item.route,
    hints: ['Find Byte and the yellow station. Trace a clear path with your finger.', 'Each arrow or movement block takes one step. Rocks block the way.', item.topic === 'loops' ? 'Look for a move or a small pattern that repeats. Put it inside Repeat.' : 'Run your program and watch the highlighted block. Where does the route change?', `One route is: ${item.route.map(d => labels[d]).join(', ')}.${item.topic === 'loops' ? ' Group repeated moves in a Repeat block.' : ''}`],
    reflection: item.topic === 'loops' ? 'Spotting a repeating pattern helps you write less code.' : debugging ? 'Watching, changing and testing turns a mistake into a discovery.' : 'A big journey is made from small instructions in the right order.' });
}
missions.push(...topicMissions);
missions.push(...gradeMissions);
export const same = (a: Position, b: Position) => a.x === b.x && a.y === b.y;
export function makeBlock(kind: Block['kind']): Block {
  return { id: crypto.randomUUID(), kind, direction: 'right', count: 2 };
}
export function initialProgram(mission: Mission): Block[] { return mission.starter.map(makeBlock); }
export type Frame = Position & { blockId: string; step: number; score?: number; note?: string };
export type RunResult = { frames: Frame[]; success: boolean; message: string };
const delta: Record<Direction, Position> = { right: { x: 1, y: 0 }, left: { x: -1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } };

export function runProgram(mission: Mission, blocks: Block[], compiled?: { usedLoop: boolean }): RunResult {
  const frames: Frame[] = [];
  const fail = (message: string): RunResult => ({ frames, success: false, message });
  if (!blocks.length) return fail('Add a movement block first. Then run your code to see what it does.');
  if (blocks.length > (compiled ? 120 : 24)) return fail('This program is too long. Shorten the route or use fewer repeats.');
  let position = { ...mission.start };
  for (const block of blocks) {
    if (!directions.includes(block.kind as Direction) && block.kind !== 'repeat') return fail('One block is not recognised. Remove it and add a movement block.');
    if (block.kind === 'repeat' && (!mission.loops || !Number.isInteger(block.count) || block.count < 2 || block.count > 5 || !directions.includes(block.direction))) return fail('Check your repeat block. Choose a direction and a count from 2 to 5.');
    const direction = block.kind === 'repeat' ? block.direction : block.kind;
    const count = block.kind === 'repeat' ? block.count : 1;
    for (let n = 0; n < count; n++) {
      const next = { x: position.x + delta[direction].x, y: position.y + delta[direction].y };
      if (next.x < 0 || next.x >= mission.size || next.y < 0 || next.y >= mission.size) return fail(`Step ${frames.length + 1} would leave the board. Check the direction of block ${blocks.indexOf(block) + 1}.`);
      if (mission.walls.some(wall => same(wall, next))) return fail(`A rock blocks step ${frames.length + 1}. Try a different direction before that step.`);
      position = next;
      frames.push({ ...position, blockId: block.id, step: frames.length + 1 });
    }
  }
  if (!same(position, mission.end)) return fail(`Byte stopped at row ${position.y + 1}, column ${position.x + 1}. The station is at row ${mission.end.y + 1}, column ${mission.end.x + 1}. Which move would bring them closer?`);
  if (mission.requireLoop && !compiled?.usedLoop && !blocks.some(b => b.kind === 'repeat')) return fail('You reached the station! Now try the loop challenge: replace repeated moves with a Repeat block.');
  return { frames, success: true, message: mission.id === 'rescue-project' ? 'Rescue complete. You designed a working route!' : 'Byte is recharged. Your instructions reached the station!' };
}

export function recommend(success: boolean, attempts: number, index: number) {
  if (success) return { action: 'advance', title: index === 4 ? 'Try another route' : 'Ready for your next challenge', reason: 'Your program reached its goal. You can continue, or replay to explore another solution.' };
  if (attempts >= 3 && index > 0) return { action: 'review', title: 'Revisit the first steps', reason: 'The last few runs have not reached the goal. A simpler route may help. You can also keep working here.' };
  return { action: 'practise', title: 'Try one small change', reason: 'Use the feedback to change one part of your program, then run it again. Hints are always available.' };
}
