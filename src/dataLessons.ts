import type { LearningModule } from './curriculum';

export const dataLessons: LearningModule[] = [
  { id: 'statements', title: 'Statements & arguments', description: 'Tell a command what to do with direction and distance inputs.', status: 'available', challengeIds: [], lesson: {
    title: 'An instruction and its inputs', introduction: 'A statement is an instruction that a computer can carry out. A command call can be a statement. Arguments are the input values you pass to that command.',
    sections: [
      { title: 'Name the action', text: 'Move by steps is a movement command. Calling it once gives one statement. That statement may move several squares, so one statement is not always one movement step.' },
      { title: 'Supply the arguments', text: 'move("right", 3) passes two arguments: the direction "right" and the distance 3. Change the distance to 2 and the same command moves two squares. The direction argument must be a direction; the distance must be a number.' },
      { title: 'Keep statements in order', text: 'Statements still run from top to bottom. Move up before moving right when an obstacle blocks the right-hand square. With a loop, the command and its arguments run on every repetition.' },
      { title: 'Arguments and parameters', text: 'The values you supply, such as "right" and 3, are arguments. The names a command definition uses to receive them, such as direction and distance, are parameters. You are calling built-in commands here, not defining new functions yet.' },
    ], example: { title: 'Same command, different inputs', steps: ['Move right by 3 steps', 'Move up by 1 step'], explanation: 'Two statements use different argument values. Byte moves three squares right, then one up. There are four movement steps but only two statements.' },
    takeaway: 'A statement gives an instruction; arguments supply the values that instruction needs.',
  } },
  { id: 'lists', title: 'Lists', description: 'Store ordered values, read indexes, append and replace items.', status: 'available', challengeIds: [], lesson: {
    title: 'One name, several ordered values', introduction: 'A list stores several values in order. Instead of a separate name for every distance, keep distances in a list called steps.',
    sections: [
      { title: 'Create and index', text: 'Create steps = [2, 1, 3]. Its indexes are 0, 1 and 2. Item 0 has value 2; item 1 has value 1. An index tells you a position, not the value stored there.' },
      { title: 'Read without removing', text: 'Move by steps item 0 reads the first value as a distance. The value stays in the list so you can use it again, including inside a loop.' },
      { title: 'Append or replace', text: 'Append adds a new value at the end and increases the list length. Set an item replaces an existing value without changing the length. Check the index before reading or replacing: a list of three items has no item 3.' },
    ], example: { title: 'A stored route', steps: ['Create steps = [3, 2]', 'Move right by steps item 0', 'Move up by steps item 1'], explanation: 'The first item supplies three rightward steps; the second supplies two upward steps. The list remains [3, 2].' },
    takeaway: 'A list keeps values in order. Indexes start at zero; append adds and indexed assignment replaces.',
  } },
  { id: 'objects', title: 'Objects', description: 'Group related values into named properties and use them in a program.', status: 'available', challengeIds: [], lesson: {
    title: 'Related data with meaningful names', introduction: 'A data object groups related values. Our robot object has two properties: speed and energy. Each name tells you which value you are reading.',
    sections: [
      { title: 'Create an object', text: 'Create robot with speed 2 and energy 3. These are two properties of one object, not two list positions. This module introduces data objects; classes and inheritance come later.' },
      { title: 'Read and update a property', text: 'robot.speed reads the current speed. Setting robot.speed to 1 replaces that value without changing robot.energy. Reading a property does not automatically change it or use it up.' },
      { title: 'Choose the right structure', text: 'Use a list when the order or position of items matters. Use an object when names such as speed and energy describe different roles. In the older-grade lab you can copy a list value into an object property.' },
      { title: 'Our Python-style notation', text: 'The text lab writes robot = {"speed": 2, "energy": 3} and reads robot["speed"]. This is dictionary-style notation for named data. It is a small teaching language, not a full Python class system.' },
    ], example: { title: 'Change only the speed', steps: ['Create robot: speed 2, energy 3', 'Set robot.speed to 1', 'Move right by robot.speed'], explanation: 'Byte moves one square. Speed is now 1 and energy remains 3.' },
    takeaway: 'An object groups named properties. Updating one property leaves the others alone.',
  } },
];
