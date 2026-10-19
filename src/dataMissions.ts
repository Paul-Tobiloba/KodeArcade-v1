import type { serialization } from 'blockly/core';
import type { Mission } from './learning';
import { courses } from './courses';

type State = serialization.blocks.State;
const block = (type: string, fields: State['fields'] = {}): State => ({ type: `ka_${type}`, fields });
const chain = (...items: State[]): State => items.reduceRight<State | undefined>((next, item) => ({ ...item, ...(next ? { next: { block: next } } : {}) }), undefined)!;
const move = (direction: string, value: number) => block('move_steps', { DIRECTION: direction, VALUE: value });
const list = (values: number[]) => block('list_set', { ITEMS: values.join(', ') });
const read = (index: number, direction = 'right') => block('list_move', { INDEX: index, DIRECTION: direction });
const robot = (speed: number, energy: number) => block('object_set', { SPEED: speed, ENERGY: energy });
const property = (field: string, value: number) => block('object_update', { PROPERTY: field, VALUE: value });
const use = (field: string, direction = 'right') => block('object_move', { PROPERTY: field, DIRECTION: direction });
const repeat = (body: State): State => ({ type: 'ka_repeat', fields: { COUNT: 2 }, inputs: { DO: { block: body } } });
export const dataSolutions: Record<string, State> = {};
export const dataMissions: Mission[] = [];

for (const course of courses.filter(item => item.grade! >= 3)) {
  const grade = course.grade!, advanced = grade >= 5, n = grade - 1;
  type Plan = { title: string; goal: string; explanation: string; steps: State[]; x: number; y?: number; required: string[]; list?: number[]; robot?: { speed: number; energy: number } };
  const plans: Record<'statements' | 'lists' | 'objects', Plan[]> = {
    statements: [
      { title: 'One statement, one action', goal: 'Move right two squares using one Move by steps statement.', explanation: 'A statement is one instruction. The number 2 is an argument: it tells the movement how many steps to take.', steps: [move('right', 2)], x: 2, required: ['move_steps'] },
      { title: 'Change the argument', goal: `Move up ${n} squares with a distance argument.`, explanation: 'Keep the command but change the distance argument. A different input changes the result.', steps: [move('up', n)], x: 0, y: n, required: ['move_steps'] },
      { title: 'Two inputs', goal: 'Move right three squares, then up one. Choose both direction and distance.', explanation: 'move("right", 3) has two arguments: a direction and a distance. Their positions tell the command what each value means.', steps: [move('right', 3), move('up', 1)], x: 3, y: 1, required: ['move_steps'] },
      { title: 'Order still matters', goal: 'Move up before moving right to avoid the obstacle. Use distance arguments.', explanation: 'Arguments control each statement, but statements still run in order. Changing inputs does not remove obstacles.', steps: [move('up', 2), move('right', n)], x: n, y: 2, required: ['move_steps'] },
      { title: advanced ? 'Repeat a call' : 'Reuse a command', goal: advanced ? 'Repeat a right-two, up-one pattern twice using distance arguments and a loop.' : 'Use two movement statements with different distances: right two, then up three.', explanation: advanced ? 'A loop repeats the calls with their arguments each time, not just the last call.' : 'The same command can be called more than once with different input values.', steps: advanced ? [repeat(chain(move('right', 2), move('up', 1)))] : [move('right', 2), move('up', 3)], x: advanced ? 4 : 2, y: advanced ? 2 : 3, required: ['move_steps', ...(advanced ? ['repeat'] : [])] },
      { title: 'Choose precise inputs', goal: `Reach the station ${n} squares right and two up using distance arguments.`, explanation: 'Check the command, direction argument and distance argument separately. A valid statement can still have the wrong input.', steps: [move('right', n), move('up', 2)], x: n, y: 2, required: ['move_steps'] },
    ],
    lists: [
      { title: 'Keep values together', goal: 'Create steps = [2, 1]. Move right by its first item.', explanation: 'A list keeps several values in order. Index 0 reads the first item; reading does not remove it.', steps: [list([2, 1]), read(0)], x: 2, list: [2, 1], required: ['list_set', 'list_move'] },
      { title: 'Find the second item', goal: 'Create steps = [1, 3, 2]. Move up by the second item.', explanation: 'Indexes start at zero: first is 0, second is 1, third is 2. An index is a position, not the item value.', steps: [list([1, 3, 2]), read(1, 'up')], x: 0, y: 3, list: [1, 3, 2], required: ['list_set', 'list_move'] },
      { title: 'Read without removing', goal: 'Create steps = [2, 1]. Use the first item to move right and again to move up.', explanation: 'Reading the same item twice reuses its value. The list still contains both items afterwards.', steps: [list([2, 1]), read(0), read(0, 'up')], x: 2, y: 2, list: [2, 1], required: ['list_set', 'list_move'] },
      { title: 'Append at the end', goal: 'Start with steps = [1, 2], append 3, then move right by the new last item.', explanation: 'Append adds a new item after the existing items. It does not replace the first or second value.', steps: [list([1, 2]), block('list_append', { VALUE: 3 }), read(2)], x: 3, list: [1, 2, 3], required: ['list_set', 'list_append', 'list_move'] },
      { title: grade >= 4 ? 'Replace one item' : 'Choose the index', goal: grade >= 4 ? 'Create steps = [1, 2]. Replace item 0 with 3, then move right by item 0.' : 'Create steps = [1, 2, 3]. Move right by item 1 and up by item 2.', explanation: grade >= 4 ? 'Replacing an indexed item changes that value without growing the list. Other items keep their positions.' : 'Different indexes select different values from the same ordered list.', steps: grade >= 4 ? [list([1, 2]), block('list_update', { INDEX: 0, VALUE: 3 }), read(0)] : [list([1, 2, 3]), read(1), read(2, 'up')], x: grade >= 4 ? 3 : 2, y: grade >= 4 ? 0 : 3, list: grade >= 4 ? [3, 2] : [1, 2, 3], required: ['list_set', 'list_move', ...(grade >= 4 ? ['list_update'] : [])] },
      { title: advanced ? 'A list inside a loop' : 'A route from stored values', goal: advanced ? 'Create steps = [2, 1]. Repeat: right by item 0, up by item 1, twice.' : 'Create steps = [3, 2]. Move right by item 0 and up by item 1.', explanation: advanced ? 'Each repetition reads the current items. Indexes choose values; the loop controls how often they are used.' : 'Separate the route data from the commands that read it.', steps: advanced ? [list([2, 1]), repeat(chain(read(0), read(1, 'up')))] : [list([3, 2]), read(0), read(1, 'up')], x: advanced ? 4 : 3, y: 2, list: advanced ? [2, 1] : [3, 2], required: ['list_set', 'list_move', ...(advanced ? ['repeat'] : [])] },
    ],
    objects: [
      { title: 'Meet a data object', goal: 'Create robot with speed 2 and energy 3. Move right by robot.speed.', explanation: 'A data object groups related named properties. robot.speed reads the property named speed, not a list position.', steps: [robot(2, 3), use('speed')], x: 2, robot: { speed: 2, energy: 3 }, required: ['object_set', 'object_move'] },
      { title: 'Read a named property', goal: 'Create robot with speed 1 and energy 3. Move up by robot.energy.', explanation: 'The property name selects the value. Reading energy does not change speed or use up energy in this teaching lab.', steps: [robot(1, 3), use('energy', 'up')], x: 0, y: 3, robot: { speed: 1, energy: 3 }, required: ['object_set', 'object_move'] },
      { title: 'Update one property', goal: 'Create robot with speed 1 and energy 2. Set speed to 3, then move right by speed.', explanation: 'Updating robot.speed replaces just that property. robot.energy remains 2.', steps: [robot(1, 2), property('speed', 3), use('speed')], x: 3, robot: { speed: 3, energy: 2 }, required: ['object_set', 'object_update', 'object_move'] },
      { title: 'Keep properties independent', goal: 'Create robot with speed 2 and energy 1. Set energy to 3, move right by speed and up by energy.', explanation: 'Properties have names so related values can play different roles without being confused.', steps: [robot(2, 1), property('energy', 3), use('speed'), use('energy', 'up')], x: 2, y: 3, robot: { speed: 2, energy: 3 }, required: ['object_set', 'object_update', 'object_move'] },
      { title: advanced ? 'Reuse object data in a loop' : 'Read after a change', goal: advanced ? 'Create robot with speed 2 and energy 1. Repeat right by speed and up by energy twice.' : 'Create robot with speed 3 and energy 2. Move right by speed, set speed to 1, then move up by speed.', explanation: 'A property read uses the value stored at that moment, rather than remembering an earlier read.', steps: advanced ? [robot(2, 1), repeat(chain(use('speed'), use('energy', 'up')))] : [robot(3, 2), use('speed'), property('speed', 1), use('speed', 'up')], x: advanced ? 4 : 3, y: advanced ? 2 : 1, robot: { speed: advanced ? 2 : 1, energy: advanced ? 1 : 2 }, required: ['object_set', 'object_move', advanced ? 'repeat' : 'object_update'] },
      { title: grade === 6 ? 'List to object' : 'Configure a journey', goal: grade === 6 ? 'Create steps = [3, 2] and robot with speed 1 and energy 1. Copy item 0 into speed; move right by speed and up by item 1.' : `Create robot with speed 1 and energy 2. Set speed to ${n}, then move right by speed and up by energy.`, explanation: grade === 6 ? 'A list index selects a value; an object property gives it a name. Copying that number does not remove it from the list.' : 'Configure the object first, then let movement statements read its properties.', steps: grade === 6 ? [list([3, 2]), robot(1, 1), block('object_from_list', { INDEX: 0, PROPERTY: 'speed' }), use('speed'), read(1, 'up')] : [robot(1, 2), property('speed', n), use('speed'), use('energy', 'up')], x: grade === 6 ? 3 : n, y: 2, robot: { speed: grade === 6 ? 3 : n, energy: grade === 6 ? 1 : 2 }, ...(grade === 6 ? { list: [3, 2] } : {}), required: ['object_set', 'object_move', grade === 6 ? 'object_from_list' : 'object_update'] },
    ],
  };
  for (const topic of ['statements', 'lists', 'objects'] as const) plans[topic].forEach((plan, index) => {
    const id = `${course.id}-${topic}-${index + 1}`;
    dataSolutions[id] = chain(...plan.steps);
    dataMissions.push({
      id, title: `Byte: ${plan.title}`, concept: topic === 'statements' ? 'Statements & arguments' : topic === 'lists' ? 'Lists' : 'Objects',
      description: plan.explanation, goal: plan.goal, size: course.size,
      start: { x: 0, y: course.size - 1 }, end: { x: plan.x, y: course.size - 1 - (plan.y ?? 0) },
      walls: topic === 'statements' && index === 3 ? [{ x: 1, y: course.size - 1 }] : [],
      loops: advanced, requireLoop: plan.required.includes('repeat'), starter: [],
      hints: [plan.explanation, 'Read the goal for the exact starting data and required final values.', 'Read each instruction in order. Watch the data shown as the program runs.', 'Use Commands & examples to check the inputs, then test one change.'],
      reflection: plan.explanation, dataTask: { topic, required: plan.required, list: plan.list, robot: plan.robot },
    });
  });
}
