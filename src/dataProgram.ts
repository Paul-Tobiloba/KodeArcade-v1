import type * as Blockly from 'blockly/core';
import type { Direction, Mission } from './learning';
import { directions } from './learning';
import { relativeMovement, relativeTypes } from './relativeMovement';

export const dataBlockTypes = ['move_steps', 'list_set', 'list_append', 'list_update', 'list_move', 'object_set', 'object_update', 'object_move', 'object_from_list'];
export function dataBlocks(mission: Mission, original = false) {
  const topic = mission.dataTask?.topic;
  const types = !topic ? [] : topic === 'statements' ? ['move_steps'] : topic === 'lists'
    ? ['list_set', 'list_move', 'list_append', 'list_update']
    : ['object_set', 'object_move', 'object_update', ...(mission.dataTask?.list ? ['list_set', 'list_move', 'object_from_list'] : [])];
  const introduced = original ? types : types.filter(type => !['list_append', 'list_update', 'object_update', 'object_from_list'].includes(type) || mission.dataTask!.required.includes(type));
  return original || !relativeMovement(mission) ? introduced : introduced.map(type => relativeTypes[type] ?? type);
}
export function createDataRuntime(mission: Mission) {
  let list: number[] | undefined, robot: { speed: number; energy: number } | undefined;
  const used = new Set<string>();
  const whole = (value: unknown, max = 9) => {
    const n = Number(value);
    if (value === null || value === '' || !Number.isInteger(n) || n < 0 || n > max) throw new Error(`Use a whole number from 0 to ${max}.`);
    return n;
  };
  const indexed = (block: Blockly.Block) => {
    if (!list) throw new Error('Create steps before reading or changing an item.');
    const index = whole(block.getFieldValue('INDEX'));
    if (index >= list.length) throw new Error(`Index ${index} is outside this list. Its indexes run from 0 to ${list.length - 1}.`);
    return index;
  };
  const property = (block: Blockly.Block): 'speed' | 'energy' => {
    if (!robot) throw new Error('Create robot before reading or changing a property.');
    const name = block.getFieldValue('PROPERTY');
    if (name !== 'speed' && name !== 'energy') throw new Error('Choose the speed or energy property.');
    return name;
  };
  return {
    describe: () => [list && `steps = [${list.join(', ')}]`, robot && `robot: speed = ${robot.speed}, energy = ${robot.energy}`].filter(Boolean).join(' · '),
    execute(block: Blockly.Block, move: (direction: Direction | 'forward' | 'backward', count: number) => void, note: (text: string) => void): string | undefined {
      const relative = block.type.startsWith('ka_relative_');
      const type = block.type.replace(/^ka_(relative_)?/, '');
      if (!dataBlockTypes.includes(type)) return undefined;
      try {
        if (!dataBlocks(mission, true).includes(type) || relative && !relativeMovement(mission)) throw new Error('Use data blocks from this activity’s palette.');
        used.add(type);
        if (type === 'list_set') {
          const raw = String(block.getFieldValue('ITEMS'));
          if (!/^\s*\d+(\s*,\s*\d+){0,7}\s*$/.test(raw)) throw new Error('Enter 1–8 numbers separated by commas, such as 2, 1, 3.');
          list = raw.split(',').map(item => whole(item.trim()));
        } else if (type === 'list_append') {
          if (!list) throw new Error('Create steps before appending an item.');
          if (list.length >= 8) throw new Error('Keep at most eight items in steps.');
          list.push(whole(block.getFieldValue('VALUE')));
        } else if (type === 'list_update') {
          const index = indexed(block); list![index] = whole(block.getFieldValue('VALUE'));
        } else if (type === 'object_set') {
          robot = { speed: whole(block.getFieldValue('SPEED')), energy: whole(block.getFieldValue('ENERGY')) };
        } else if (type === 'object_update') {
          const name = property(block); robot![name] = whole(block.getFieldValue('VALUE'));
        } else if (type === 'object_from_list') {
          const name = property(block), index = indexed(block); robot![name] = list![index];
        } else {
          const direction = block.getFieldValue('DIRECTION') as Direction | 'forward' | 'backward';
          if (!(relative ? ['forward', 'backward'].includes(direction) : directions.includes(direction as Direction))) throw new Error('Choose a direction available in this activity.');
          const count = type === 'list_move' ? list![indexed(block)] : type === 'object_move' ? robot![property(block)] : whole(block.getFieldValue('VALUE'));
          note(`Read ${count}. Move ${direction} ${count} steps.`);
          move(direction, count);
          return '';
        }
        note([list && `steps = [${list.join(', ')}]`, robot && `robot: speed = ${robot.speed}, energy = ${robot.energy}`].filter(Boolean).join(' · '));
        return '';
      } catch (error) { return error instanceof Error ? error.message : 'Check your data and try again.'; }
    },
    finish(): string {
      const task = mission.dataTask;
      if (!task) return '';
      const missing = task.required.filter(type => type !== 'repeat' && !used.has(type));
      if (missing.length) return 'You reached the destination. Now use the data instructions named in the goal, rather than only movement blocks.';
      if (task.list && JSON.stringify(list) !== JSON.stringify(task.list)) return `Finish with steps = [${task.list.join(', ')}]. Check which item you changed.`;
      if (task.robot && (!robot || robot.speed !== task.robot.speed || robot.energy !== task.robot.energy)) return `Finish with robot.speed = ${task.robot.speed} and robot.energy = ${task.robot.energy}.`;
      return '';
    },
  };
}
