export type DataQuizItem = [prompt: string, correct: string, wrong1: string, wrong2: string, explanation: string, code?: string];
const statements: DataQuizItem[] = [
  ['In move("right", 3), which values are the arguments?', '"right" and 3', 'Only the word move', 'The brackets alone', 'Arguments are the input values passed to a command: here a direction and a distance.'],
  ['What is a statement in a program?', 'An instruction the computer carries out', 'Always exactly one movement square', 'Only a comment about the code', 'A statement is an instruction. One movement statement can request several movement steps.'],
  ['What changes when move("right", 3) becomes move("right", 2)?', 'The distance becomes two steps', 'The direction becomes left', 'The command runs twice automatically', 'The second argument supplies distance, so changing it changes how far the character moves.'],
  ['Which input is appropriate for the distance argument?', 'A number such as 3', 'The direction "right"', 'The name of a mascot', 'The distance input needs a numeric value, while the direction input describes where to move.'],
  ['Two movement statements run: right by 3, then up by 1. How many movement steps occur?', 'Four', 'Two', 'Three', 'There are two statements but their distances total four movement steps: three right and one up.'],
];
const statementsAdvanced: DataQuizItem[] = [
  ['Which distinction between parameters and arguments is correct?', 'Parameters name inputs; arguments are the supplied values', 'Arguments are always command names', 'Parameters are the returned movement steps', 'A definition names its parameters. A call supplies argument values for those inputs.'],
  ['How many rightward steps does this program request?', 'Six', 'Three', 'Two', 'Each of three calls uses distance two, so the total is three times two: six steps.', 'for step in range(3):\n    move("right", 2)'],
  ['Why is move(3, "right") not a valid call in this lab?', 'The direction and distance arguments are in the wrong positions', 'All commands need three arguments', 'Arguments cannot contain numbers', 'This command expects direction first and numeric distance second; the input positions matter.'],
  ['A valid movement call runs into a rock. What should you investigate?', 'Its inputs and its position in the sequence', 'Whether arguments can ever be used', 'Only the font used for the code', 'Correct syntax does not guarantee a safe route. Check the argument values and the earlier instructions.'],
  ['How many movement statements are written here, and how many steps run?', 'Two statements, six steps', 'Six statements, two steps', 'Two statements, four steps', 'The two statements are each called twice. Each repetition moves two right and one up: six steps total.', 'for step in range(2):\n    move("right", 2)\n    move("up", 1)'],
];
const lists: DataQuizItem[] = [
  ['For steps = [2, 1, 3], what is steps[0]?', '2', '0', '3', 'Index zero selects the first item, whose value is two. An index is not the item’s value.'],
  ['A list has three items. Which indexes are valid?', '0, 1 and 2', '1, 2 and 3', '0, 1, 2 and 3', 'Indexes start at zero. Three positions therefore have indexes zero through two.'],
  ['What does appending 3 to [1, 2] produce?', '[1, 2, 3]', '[3, 2]', '[3, 1, 2]', 'Append adds the new item at the end while keeping the existing items in order.'],
  ['What happens to a list item when a movement reads it?', 'It stays in the list unchanged', 'It is automatically removed', 'Every item becomes zero', 'Reading uses the stored value without changing or removing it, so it can be read again.'],
  ['What is the difference between replacing an item and appending?', 'Replacing changes an existing item; appending adds an item', 'Both always remove the last item', 'Replacing always doubles the list length', 'Indexed assignment replaces a value in its existing position. Append creates a new last position.'],
];
const listsAdvanced: DataQuizItem[] = [
  ['What is the final value of steps?', '[3, 2, 4]', '[1, 2, 3, 4]', '[4, 3, 2]', 'Replacing index zero changes one to three; appending four then adds a third item.', 'steps = [1, 2]\nsteps[0] = 3\nsteps.append(4)'],
  ['How far right does this program move on a clear board?', 'Six squares', 'Four squares', 'Two squares', 'Item one has value three. Two repetitions each move three squares, for six in total.', 'steps = [2, 3]\nfor step in range(2):\n    move("right", steps[1])'],
  ['Why does reading steps[2] fail when steps = [4, 1]?', 'The list has only indexes 0 and 1', 'Lists cannot contain the value 4', 'Index 2 always means the first item', 'A two-item list has two positions, indexed zero and one. Index two lies outside it.'],
  ['How far right does this program move on a clear board?', 'Five squares', 'Four squares', 'Three squares', 'The first read returns two. After replacing that item with three, the next read returns three: five steps in total.', 'steps = [2, 1]\nmove("right", steps[0])\nsteps[0] = 3\nmove("right", steps[0])'],
  ['When is a list a better fit than two named properties?', 'When ordered items are selected by their positions', 'When the only distinction is named roles such as speed and energy', 'When values must never be read again', 'Lists express an ordered collection. Named object properties express distinct roles or attributes.'],
];
const objects: DataQuizItem[] = [
  ['What does a data object group together?', 'Related values with named properties', 'Only movement arrows in a row', 'Only numbers selected by list indexes', 'An object groups related data under property names such as speed and energy.'],
  ['Robot has speed 2 and energy 3. What does reading robot.speed give?', '2', '3', 'The number of properties', 'The property name speed selects its value, two, independently of the energy property.'],
  ['Robot has speed 2 and energy 3. Set speed to 1. What is energy?', 'Still 3', '1', '0', 'Updating speed changes only that property; it does not change the energy value.'],
  ['What must happen before reading a property in this lab?', 'Create the robot object', 'Move to the last row', 'Append a number to every list', 'The object and its starting properties must exist before they can be read or updated.'],
  ['Which description distinguishes an object from a list?', 'Properties have names; list items have ordered indexes', 'Objects cannot store numbers', 'Reading an object always removes a value', 'Names identify the roles of object properties. List indexes identify positions in an ordered collection.'],
];
const objectsAdvanced: DataQuizItem[] = [
  ['What are the final speed and energy?', 'Speed 1, energy 3', 'Speed 1, energy 1', 'Speed 2, energy 3', 'The assignment updates only the named speed property; the energy property remains three.', 'robot = {"speed": 2, "energy": 3}\nrobot["speed"] = 1'],
  ['After this code, what is robot["speed"]?', '3', '1', '2', 'The property receives the number at index zero, which is three, and keeps that copied number after the list changes.', 'steps = [3, 2]\nrobot = {"speed": 1, "energy": 1}\nrobot["speed"] = steps[0]\nsteps[0] = 2'],
  ['In this lab, what does reading robot["energy"] do to its value?', 'Nothing; reading alone leaves it unchanged', 'Always subtracts one', 'Always resets it to zero', 'A property does not have automatic game behaviour. The program must explicitly update its value.'],
  ['Robot speed is 2. A loop moves right by speed twice. How far does it move?', 'Four squares', 'Two squares', 'Six squares', 'Each property read returns two. Two repetitions therefore move two plus two squares.'],
  ['What does the text form robot = {"speed": 2, "energy": 3} represent here?', 'Dictionary-style named data', 'A full class with inheritance and methods', 'A list with indexes speed and energy', 'The lab uses dictionary-style syntax for named properties; it does not implement general Python classes.'],
];
export const dataQuizBank: Record<'statements' | 'lists' | 'objects', [DataQuizItem[], DataQuizItem[], DataQuizItem[]]> = {
  statements: [statements, statements, statementsAdvanced], lists: [lists, lists, listsAdvanced], objects: [objects, objects, objectsAdvanced],
};
