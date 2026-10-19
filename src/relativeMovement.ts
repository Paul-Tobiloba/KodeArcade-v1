import type { serialization } from 'blockly/core';
import type { Direction } from './learning';
export const relativeMovement = (mission: { id?: string }) => /^grade-[4-6]-/.test(mission.id ?? '');
export const degreeTurns = (mission: { id?: string }) => /^grade-[5-6]-/.test(mission.id ?? '');
export const headings: Direction[] = ['right', 'down', 'left', 'up'];
export const turnHeading = (heading: Direction, side: 'left' | 'right', degrees = 90): Direction =>
  headings[(headings.indexOf(heading) + (side === 'right' ? 1 : -1) * degrees / 90 + 4) % 4];
export const relativeDirection = (heading: Direction, direction: string): Direction | undefined =>
  direction === 'forward' ? heading : direction === 'backward' ? turnHeading(heading, 'right', 180)
  : direction === 'left' || direction === 'right' ? turnHeading(heading, direction) : undefined;
export const relativeTypes: Record<string, string> = {
  move_steps: 'relative_move_steps', list_move: 'relative_list_move', object_move: 'relative_object_move',
};
type State = serialization.blocks.State;
const chain = (items: State[]): State => items.reduceRight<State | undefined>((next, item) => ({ ...item, ...(next ? { next: { block: next } } : {}) }), undefined)!;

// Convert fresh starter/reference programs only. Saved programs are never rewritten.
// Restoring heading after each absolute operation also preserves loop/branch semantics.
export function relativeProgram(first: State): State {
  const current = { ...first, next: undefined };
  if (current.inputs) current.inputs = Object.fromEntries(Object.entries(current.inputs).map(([key, input]) => [key, { ...input, ...(input.block ? { block: relativeProgram(input.block) } : {}) }]));
  const direct = /^ka_(?:arrow_)?(right|down|left|up)$/.exec(current.type);
  const valueMove = ['ka_move_steps', 'ka_move_score', 'ka_list_move', 'ka_object_move'].includes(current.type);
  const direction = direct?.[1] ?? (valueMove ? current.fields?.DIRECTION as string : undefined);
  let items: State[] = [current];
  if (direction) {
    const body: State = direct ? { type: direction === 'left' ? 'ka_backward' : 'ka_forward', id: current.id }
      : { ...current, type: current.type === 'ka_move_score' ? 'ka_relative_move_score' : `ka_${relativeTypes[current.type.slice(3)]}`, fields: { ...current.fields, DIRECTION: direction === 'left' ? 'backward' : 'forward' } };
    items = direction === 'up' || direction === 'down'
      ? [{ type: direction === 'up' ? 'ka_turn_left' : 'ka_turn_right' }, body, { type: direction === 'up' ? 'ka_turn_right' : 'ka_turn_left' }]
      : [body];
  } else if (current.type === 'ka_if' || current.type === 'ka_if_else') {
    current.type = current.type === 'ka_if' ? 'ka_relative_if' : 'ka_relative_if_else';
    current.fields = { ...current.fields, DIRECTION: ({ right: 'forward', left: 'backward', up: 'left', down: 'right' } as Record<string, string>)[String(current.fields?.DIRECTION)] };
  }
  if (first.next?.block) items.push(relativeProgram(first.next.block));
  const result = chain(items);
  // Remove adjacent opposite turns in fresh generated starters/references.
  const flat: State[] = [];
  for (let node: State | undefined = result; node; node = node.next?.block) {
    const previous = flat.at(-1);
    if (previous && (previous.type === 'ka_turn_left' && node.type === 'ka_turn_right' || previous.type === 'ka_turn_right' && node.type === 'ka_turn_left')) flat.pop();
    else flat.push({ ...node, next: undefined });
  }
  return chain(flat);
}
export function relativeProgramText(first: State, indent = ''): string {
  const f = first.fields ?? {}, d = String(f.DIRECTION ?? 'forward'), call = d === 'backward' ? 'backward' : 'forward';
  let line = ({
    ka_forward: 'forward()', ka_backward: 'backward()', ka_turn_left: 'turn_left()', ka_turn_right: 'turn_right()',
    ka_relative_move_steps: `${call}(${f.VALUE})`, ka_relative_move_score: `${call}(score)`,
    ka_relative_list_move: `${call}(steps[${f.INDEX}])`, ka_relative_object_move: `${call}(robot["${f.PROPERTY}"])`,
    ka_set_score: `score = ${f.VALUE}`, ka_change_score: `score += ${f.VALUE}`,
    ka_list_set: `steps = [${f.ITEMS}]`, ka_list_append: `steps.append(${f.VALUE})`, ka_list_update: `steps[${f.INDEX}] = ${f.VALUE}`,
    ka_object_set: `robot = {"speed": ${f.SPEED}, "energy": ${f.ENERGY}}`, ka_object_update: `robot["${f.PROPERTY}"] = ${f.VALUE}`,
    ka_object_from_list: `robot["${f.PROPERTY}"] = steps[${f.INDEX}]`,
    ka_pick_item: 'pick_up()', ka_move_next: 'move_next()', ka_open_gate: 'open_gate()', ka_build_bridge: 'build_bridge()',
  } as Record<string, string>)[first.type];
  if (first.type === 'ka_repeat') line = `for step in range(${f.COUNT}):`;
  if (first.type.startsWith('ka_relative_if')) line = `if relative_path_clear("${d}"):`;
  if (first.type.startsWith('ka_if_item')) line = 'if item_here():';
  if (first.type === 'ka_if_gate_locked') line = 'if gate_locked():';
  if (first.type === 'ka_if_bridge_missing') line = 'if bridge_missing():';
  if (!line) throw new Error(`Missing relative reference for ${first.type}`);
  return indent + line + (first.inputs?.DO?.block ? '\n' + relativeProgramText(first.inputs.DO.block, indent + '    ') : '')
    + (first.inputs?.ELSE?.block ? '\n' + indent + 'else:\n' + relativeProgramText(first.inputs.ELSE.block, indent + '    ') : '')
    + (first.next?.block ? '\n' + relativeProgramText(first.next.block, indent) : '');
}
