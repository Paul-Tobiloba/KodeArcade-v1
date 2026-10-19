// Question-bank revision 2. Never edit a published bank in place: introduce a
// new revision so persisted answers continue to refer to their original questions.
export type RelativeQuizItem = [string, string, string, string, string, string?];
export const relativeQuizTopics = ['sequences', 'statements', 'loops', 'debugging', 'conditionals', 'variables', 'lists', 'objects', 'project'] as const;
type Topic = typeof relativeQuizTopics[number];
const grade4: Record<Topic, RelativeQuizItem[]> = {
  sequences: [
    ['Byte starts facing right. After turn right, then move forward, where does Byte move?', 'One square down', 'One square right', 'One square up', 'A right turn changes facing from right to down. Forward then follows that new facing.'],
    ['Byte faces down. What does move backward do?', 'Moves up without changing facing', 'Moves up and faces up', 'Turns left without moving', 'Backward moves opposite the facing direction; Byte keeps facing down.'],
    ['Which instruction changes facing without changing the square?', 'Turn left', 'Move forward', 'Move backward', 'A turn stays on the same square. Movement changes the square.'],
    ['Why can swapping a turn and a forward move change the route?', 'Forward uses the facing when it runs', 'Every turn moves two squares', 'The computer sorts moves before turns', 'Instructions run in order. Turning first changes the direction used by the next forward move.'],
    ['Byte starts facing right. Turn left twice, then move forward. Where does Byte move?', 'One square left', 'One square right', 'One square down', 'The two left turns change facing from right to up, then left. Forward therefore moves left.'],
  ],
  statements: [
    ['In move forward 3 steps, what does the argument 3 control?', 'The number of squares travelled', 'The direction of a turn', 'The number of robot objects', 'The movement statement names the action; its distance argument supplies how far to move.'],
    ['Byte faces down. Move backward 2 steps travels where?', 'Two squares up', 'Two squares down', 'Two squares left', 'Backward uses the opposite of the current facing. Opposite down is up; the distance is two.'],
    ['Byte starts facing right. Move forward 2 steps, turn right, move forward 1 step. What is the final displacement?', 'Two right and one down', 'Three right', 'Two down and one right', 'The first movement travels right. The turn then makes forward point down.'],
    ['Does changing a movement distance argument also change facing?', 'No; it changes distance only', 'Yes; every argument turns left', 'Yes; larger distances face down', 'Distance and facing have separate roles. A movement argument does not perform a turn.'],
    ['A three-step move has a wall on its second square. What happens?', 'It stops at the obstacle rather than jumping over it', 'It jumps to the third square', 'It automatically turns around', 'Each square is checked during a multi-step movement. A distance argument does not bypass obstacles.'],
  ],
  loops: [
    ['Byte starts facing right. Repeat twice: move forward, turn right. Where does Byte finish relative to the start?', 'One right and one down', 'Two right', 'Back at the start', 'The first pass moves right and faces down. The second moves down and faces left.'],
    ['Repeat four times: turn right. What changes?', 'Facing returns to its start; position stays the same', 'Byte travels four squares right', 'Byte moves around a four-square route', 'Four quarter-turns make a full turn, and none of these instructions moves Byte.'],
    ['How many forward movements run in repeat 3 times: move forward, move forward?', '6', '3', '2', 'Both movements are inside the loop, so two movements run on each of three passes.'],
    ['Why must you trace facing across loop repetitions?', 'A turn in one pass affects the next pass', 'Every pass automatically faces right', 'Loops ignore turns', 'Facing carries through the loop. It resets only when a new program run begins.'],
    ['Which part of a loop sets how many times its instructions run?', 'The repeat count', 'The character colour', 'The last movement direction', 'The repeat count controls the number of passes through the enclosed instructions.'],
  ],
  debugging: [
    ['Byte starts facing right. You need to move up, but turn right then forward moves down. What is the smallest repair?', 'Change turn right to turn left', 'Add another forward', 'Change forward to two forward moves', 'A left turn from right faces up. Changing the incorrect turn repairs the direction.'],
    ['Your backward move goes down when you expected left. What should you check first?', 'Byte’s facing immediately before that move', 'The star colour', 'Whether backward always means left', 'Backward is relative to facing. Inspect the earlier turns to understand its direction.'],
    ['A repeated route works once but fails on its second pass. What is a useful check?', 'Trace position and facing after the first pass', 'Assume loops reset facing', 'Delete all turns without testing', 'The second pass starts with the position and facing left by the first pass.'],
    ['What should you do after repairing an incorrect turn?', 'Run the program again and watch the route', 'Assume it is fixed without running', 'Remove the goal', 'Retesting checks the repair and helps reveal whether it changed any later movements.'],
    ['A multi-step move stops at a wall. Which repair respects the board rules?', 'Plan a clear route around the wall', 'Increase the distance to jump over it', 'Hide the error message', 'Movement checks each square, so a route must avoid the obstacle instead of skipping over it.'],
  ],
  conditionals: [
    ['Byte faces down. Which square does path ahead check?', 'The square immediately below Byte', 'The square immediately right of Byte', 'The final destination only', 'Ahead follows the current facing. Facing down makes the neighbouring square below the one to check.'],
    ['Byte faces right with a wall ahead. If path ahead is clear, move forward. What happens?', 'The forward movement is skipped', 'Byte walks into the wall', 'Byte turns right automatically', 'The check is false, so the instructions inside that IF do not run.'],
    ['Does checking whether a path is clear move Byte?', 'No; it reads the situation', 'Yes; it moves one square', 'Yes; it turns toward the goal', 'A condition examines the current state. Movement happens only when a movement instruction runs.'],
    ['Byte turns left from facing right. What direction does the next path ahead check inspect?', 'Up', 'Right', 'Down', 'The turn changes facing to up. A later relative check uses that updated facing.'],
    ['If the next square is clear, is a move forward 3 steps guaranteed safe?', 'No; later squares may contain obstacles', 'Yes; one clear square means all squares are clear', 'Yes; checks remove obstacles', 'A neighbouring-square check only describes the next square, not every square in a longer move.'],
  ],
  variables: [
    ['Set score to 2, then move forward by score steps. How far does Byte move on a clear path?', 'Two squares', 'One square', 'Four squares', 'The movement reads the stored value two and uses it as the distance.'],
    ['Set score to 4, then set score to 1. What is stored?', '1', '5', '4', 'SET replaces the previous value. It does not add the new number to the old one.'],
    ['Set score to 2, then change score by 1. What is stored?', '3', '1', '2', 'CHANGE adds to the stored value: two plus one equals three.'],
    ['Byte faces down and score is 2. Move backward by score steps travels where?', 'Two squares up', 'Two squares down', 'Two squares right', 'Score chooses distance, while backward chooses the opposite of the current facing.'],
    ['Does reading score as a movement distance change score?', 'No; reading leaves its value unchanged', 'Yes; it always subtracts one', 'Yes; it resets to zero', 'Reading retrieves a value. A separate SET or CHANGE instruction is needed to update it.'],
  ],
  lists: [
    ['For steps = [2, 3], what does steps[0] give?', '2', '3', '0', 'List indexes start at zero. Index zero selects the first item, whose value is two.'],
    ['Byte faces down. Read index 1 of steps = [2, 3] for a forward distance. Where does Byte move?', 'Three squares down', 'Two squares down', 'Three squares right', 'Index one selects three. Forward follows the current facing, which is down.'],
    ['Start with steps = [2, 1], then append 3. What is the list?', '[2, 1, 3]', '[3, 2, 1]', '[2, 3]', 'Append adds a new item at the end without replacing the earlier items.'],
    ['Start with steps = [2, 1], then set item at index 0 to 3. What is the list?', '[3, 1]', '[2, 1, 3]', '[2, 3]', 'Indexed assignment replaces the item at that position; it does not append a new item.'],
    ['Why is index 2 invalid for steps = [2, 1]?', 'The list has only indexes 0 and 1', 'The value 2 is not allowed', 'The list must contain three identical items', 'Two items occupy positions zero and one. Position two is outside this list.'],
  ],
  objects: [
    ['What does a data object group together?', 'Related values with named properties', 'Only unnamed arrows', 'Only positions selected by numeric indexes', 'Named properties describe related values, such as a robot’s speed and energy.'],
    ['Robot speed is 2 and energy is 3. Read speed as a forward distance. How far does Byte move?', 'Two squares', 'Three squares', 'Five squares', 'The property name speed selects its own value, two, rather than energy or the sum of both values.'],
    ['Set robot speed to 1. Its energy was 3. What is energy now?', 'Still 3', '1', '0', 'Updating one named property does not update the other properties. Energy remains three.'],
    ['What must happen before reading robot speed in this lab?', 'Create the robot object', 'Append a value to a list', 'Turn twice', 'The object and its starting properties must exist before its properties can be read.'],
    ['Does reading robot energy automatically use up energy in this lab?', 'No; an explicit update is needed', 'Yes; every read subtracts one', 'Yes; all movement resets it', 'These are named data values, not automatic game mechanics. Reading alone does not change them.'],
  ],
  project: [
    ['What belongs in a plan for a forward-and-turn route?', 'The start facing, clear route and task requirements', 'Only the total number of forward moves', 'Only the destination colour', 'Facing affects each movement, and a successful project must satisfy every stated requirement safely.'],
    ['Your route repeats forward then turn right four times. What can express that pattern?', 'A loop containing both instructions', 'A loop containing only the turns', 'Deleting three required forward moves', 'The repeated unit includes movement and turning. Keeping both inside the loop preserves the pattern.'],
    ['The route reaches the goal but misses a required key. Is the project complete?', 'No; all stated requirements must be met', 'Yes; the destination is the only requirement', 'Yes; keys are always optional', 'Project success includes required objects and constraints as well as the destination.'],
    ['What should you do after shortening a working program?', 'Retest its route and facing changes', 'Assume fewer blocks always means correct', 'Remove the old goal', 'Shorter code can change behaviour. Running it again checks that the intended route still works.'],
    ['Can different programs both solve the same project?', 'Yes, if both meet the goal and constraints', 'No; every project has one exact program', 'Only if neither uses turns', 'A project can have several valid solutions. Verified behaviour matters more than matching one block arrangement.'],
  ],
};
const senior: Record<Topic, RelativeQuizItem[]> = {
  sequences: [
    ['Starting facing right, where does this code finish relative to its start?', 'Two right and one down', 'Three right', 'Two down and one right', 'The first two forward moves travel right. A right quarter-turn then makes forward travel down.', 'forward()\nforward()\nturn_right(90)\nforward()'],
    ['Byte faces down. After turn left 180°, then backward, which direction does Byte move?', 'Down', 'Up', 'Right', 'The half-turn changes facing from down to up. Backward then moves down while facing stays up.'],
    ['What does turn right 270° do to position and facing when starting right?', 'Stays in place and faces up', 'Moves three squares right', 'Stays in place and faces down', 'Three right quarter-turns pass through down, left and up. Turning never changes the square.'],
    ['Which angle makes a half-turn on this square grid?', '180°', '90°', '270°', 'A half-turn reverses facing. It is two quarter-turns, or 180 degrees.'],
    ['Why can backward after a turn move differently from backward before it?', 'Backward uses the facing when it executes', 'Backward always means left', 'Turns sort the instructions automatically', 'Relative movements are interpreted in sequence using the current facing, including earlier turns.'],
  ],
  statements: [
    ['In forward(3), what does the argument 3 specify?', 'A distance of three squares', 'Three right turns', 'The third list item', 'The statement calls the movement action; its numeric argument supplies the distance.'],
    ['Starting facing right, what is the final displacement?', 'Two right and one up', 'Two right and one down', 'Three right', 'Forward travels two squares right. After turning to face down, backward travels one square up.', 'forward(2)\nturn_right(90)\nbackward(1)'],
    ['Does turn_left(180) move Byte two squares?', 'No; it reverses facing on the same square', 'Yes; degrees are movement distance', 'Yes; every turn moves forward', 'A turn angle specifies rotation, not travel. A half-turn changes facing without changing position.'],
    ['Which angle is supported by the grid-turn block?', '270°', '45°', '60°', 'The square-grid block supports 90, 180 and 270 degrees so Byte remains aligned to the grid.'],
    ['Why can forward(3) fail after a path-ahead check succeeds?', 'The check covers only the next square, not all three', 'Arguments ignore the board', 'A true check disables movement', 'Each travelled square is checked. An obstacle farther along can block a multi-step movement.'],
  ],
  loops: [
    ['On a clear board, where does this finish relative to the start, facing right initially?', 'Back at the start, facing right', 'Four squares right, facing right', 'At the start, facing left', 'Four forward-and-quarter-turn pairs trace a square and complete a full turn.', 'for step in range(4):\n    forward()\n    turn_right(90)'],
    ['How many forward movements execute?', '6', '5', '3', 'The inner three-move loop runs twice, so two times three equals six.', 'for i in range(2):\n    for j in range(3):\n        forward()'],
    ['Byte starts facing right. Repeat twice: turn right 180°, move forward. What is the final displacement?', 'Zero squares', 'Two squares right', 'Two squares left', 'The first pass moves left. The next half-turn faces right, and the second move returns to the start.'],
    ['A loop turns on each pass. Does the next pass automatically face right?', 'No; facing carries over from the previous pass', 'Yes; every pass resets it', 'Only nested loops reset it', 'A loop continues the current program state. Position and facing are not reset between passes.'],
    ['Which change preserves a repeat of forward then turn left three times?', 'Put both instructions inside a repeat-three loop', 'Repeat only forward and turn once afterwards', 'Turn once before three forward moves', 'The whole ordered pair must repeat. Moving the turn outside changes the route.'],
  ],
  debugging: [
    ['Starting facing right, this should move up but moves down. Which repair works?', 'Replace turn_right(90) with turn_left(90)', 'Add another forward()', 'Replace 90 with 180', 'A left quarter-turn from right faces up; a right quarter-turn faces down.', 'turn_right(90)\nforward()'],
    ['Why does turn_right(45) fail in the square-grid lab?', 'Grid turns require 90, 180 or 270 degrees', 'All right turns are forbidden', 'Turns need a movement distance instead', 'This grid supports quarter-turn multiples so the character remains aligned to rows and columns.'],
    ['Your second loop pass moves the wrong way. What trace is most useful?', 'Position and facing after each instruction', 'Only the number of lines', 'Only the final score label', 'Tracing the state reveals the turn that affected the next pass, not merely the length of the program.'],
    ['A list-based forward move goes too far. What should you inspect?', 'The selected index and the value stored there when read', 'Only the robot colour', 'Whether lists always start with one', 'The selected item supplies the distance. Earlier list updates can change the value read later.'],
    ['After fixing a turn, what checks the repair best?', 'Rerun and compare the entire route with the requirements', 'Count the letters in the code', 'Assume a valid angle guarantees success', 'A valid instruction can still be in the wrong place. Testing the whole route checks behaviour and requirements.'],
  ],
  conditionals: [
    ['Starting facing right, which neighbouring square does this check inspect?', 'The square below Byte', 'The square right of Byte', 'The square above Byte', 'The quarter-turn faces down, so the relative forward-path check inspects the neighbouring square below.', 'turn_right(90)\nif relative_path_clear("forward"):\n    forward()'],
    ['What happens if the condition is false?', 'Only the ELSE movement runs', 'Both movements run', 'Neither movement runs', 'IF/ELSE selects exactly one branch according to the check at that point.', 'if relative_path_clear("forward"):\n    forward()\nelse:\n    backward()'],
    ['Does a path check change Byte’s facing?', 'No; it only reads the current situation', 'Yes; it always faces the checked square', 'Yes; a false check turns around', 'Checks inspect state. A turn instruction is needed to change facing.'],
    ['Byte faces left. Which square does relative_path_clear("right") inspect?', 'The square above Byte', 'The square to the screen’s right', 'The square below Byte', 'Relative right is a quarter-turn clockwise from facing left, so the checked neighbour is up.'],
    ['An ELSE branch moves backward. What must you still consider?', 'Whether the square behind is clear', 'Nothing; ELSE guarantees a safe path', 'Only whether the goal is visible', 'A false forward check says nothing about the square behind. Each movement still needs a safe route.'],
  ],
  variables: [
    ['What distance does the movement use on a clear path?', '3', '1', '2', 'CHANGE adds one to two. Forward then reads the current value three.', 'score = 2\nscore += 1\nforward(score)'],
    ['What is the final value of score?', '3', '6', '2', 'The loop adds one three times to an initial zero, so the stored value becomes three.', 'score = 0\nfor step in range(3):\n    score += 1'],
    ['Score is 2. Byte turns right 180° from facing right, then moves forward by score. Where does Byte move?', 'Two squares left', 'Two squares right', 'One square left', 'The half-turn faces left. The variable supplies the distance two, not a direction.'],
    ['What value remains after this code?', '1', '5', '4', 'The second assignment replaces four with one; reading that value for movement does not change it.', 'score = 4\nscore = 1\nforward(score)'],
    ['Why can forward(score) use different distances on successive loop passes?', 'Earlier updates can change score before each read', 'Forward randomly changes the variable', 'Every loop doubles all variables', 'Each movement reads the value at execution time, so updates on earlier passes affect later distances.'],
  ],
  lists: [
    ['What is the final list?', '[3, 2, 4]', '[1, 2, 3, 4]', '[4, 3, 2]', 'Replacing index zero changes the first value to three. Append then adds four at the end.', 'steps = [1, 2]\nsteps[0] = 3\nsteps.append(4)'],
    ['Byte faces down. How far does this move on a clear path?', 'Six squares down', 'Four squares down', 'Six squares right', 'Index one selects three. The loop repeats that three-square forward movement twice.', 'steps = [2, 3]\nfor step in range(2):\n    forward(steps[1])'],
    ['How many squares are travelled in total on a clear path?', '5', '4', '3', 'The first read gives two and the second gives three after the replacement: two plus three equals five.', 'steps = [2, 1]\nforward(steps[0])\nsteps[0] = 3\nforward(steps[0])'],
    ['Why is steps[2] invalid when steps = [4, 1]?', 'Only indexes 0 and 1 exist', 'Lists cannot contain four', 'Index two means the first item', 'A two-item list has positions zero and one; index two is outside its current length.'],
    ['When is a list a better fit than named properties?', 'For ordered values selected by position', 'For distinct named roles such as speed and energy', 'When reading must delete every value', 'A list expresses ordered items. An object expresses values with distinct named roles.'],
  ],
  objects: [
    ['What are the final speed and energy?', 'Speed 1, energy 3', 'Speed 1, energy 1', 'Speed 2, energy 3', 'Only the speed property is updated. The separate energy property retains its value three.', 'robot = {"speed": 2, "energy": 3}\nrobot["speed"] = 1'],
    ['Byte faces down. How far does this move on a clear path?', 'Four squares down', 'Two squares down', 'Four squares right', 'Each property read gives speed two. Two loop passes each move two squares forward, in the current downward facing.', 'robot = {"speed": 2, "energy": 3}\nfor step in range(2):\n    forward(robot["speed"])'],
    ['In this lab, does reading robot["energy"] change energy?', 'No; an explicit update is needed', 'Yes; every read subtracts one', 'Yes; reading resets it to zero', 'These named data values do not have automatic game behaviour. Reading retrieves a value without changing it.'],
    ['What does robot = {"speed": 2, "energy": 3} represent here?', 'Dictionary-style named data', 'A full class with inheritance and methods', 'A list with numeric indexes speed and energy', 'The lab teaches named data properties using dictionary-style syntax, not general classes or inheritance.'],
    ['After speed changes from 2 to 1, what distance does the next forward(robot["speed"]) use?', 'One square', 'Two squares', 'Three squares', 'A property read uses the current value when it executes, so it sees the updated speed one.'],
  ],
  project: [
    ['What should a route plan include before using degree-turn blocks?', 'Starting facing, clear squares and required goals', 'Only how many degrees are written', 'Only the final square’s colour', 'Relative movement depends on facing, and project completion also requires safe movement and all stated goals.'],
    ['Why test a conditional project with both clear and blocked paths?', 'To check both branch outcomes', 'To make all obstacles disappear', 'To guarantee the shortest possible code', 'Different conditions select different instructions. Testing both outcomes checks behaviour beyond one easy case.'],
    ['A route works but exceeds the block limit by repeating a pattern. What is a useful revision?', 'Use a loop for the full pattern, then retest', 'Delete required safety checks', 'Ignore the limit', 'A loop can reduce written blocks while preserving the ordered pattern, including its turns.'],
    ['Why keep a known working version before a large change?', 'To compare behaviour and recover the earlier approach', 'To automatically prevent every bug', 'To stop anyone reading the new version', 'A working reference helps you evaluate a revision and recover if its behaviour is incorrect.'],
    ['What is the strongest evidence a project is complete?', 'Tests pass for the goal and every stated constraint', 'It contains the most blocks', 'It matches a friend’s code exactly', 'Verified behaviour and requirements determine completion, not code length or visual similarity.'],
  ],
};
const grade6Copy: RelativeQuizItem = ['After this code, what is robot["speed"]?', '3', '2', '1', 'The property receives a copy of the value three. Replacing the list afterwards does not change that already copied number.', 'steps = [3, 2]\nrobot = {"speed": 1, "energy": 1}\nrobot["speed"] = steps[0]\nsteps = [2, 2]'];
export function relativeQuizItems(topic: string, grade: number): RelativeQuizItem[] {
  if (!relativeQuizTopics.includes(topic as Topic)) return [];
  const items = (grade === 4 ? grade4 : senior)[topic as Topic];
  return grade === 6 && topic === 'objects' ? [...items.slice(0, 4), grade6Copy] : items;
}
