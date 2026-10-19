import type { serialization } from 'blockly/core';
type B = serialization.blocks.State;
const socket = (block: B) => ({ block });
const number = (NUM: number): B => ({ type: 'ka_number', fields: { NUM } });
const chain = (blocks: B[]): B | undefined => blocks.reduceRight<B | undefined>((next, b) => ({ ...b, ...(next ? { next: socket(next) } : {}) }), undefined);
const read = (axis: string): B => ({ type: `ka_studio_${axis}` });
const change = (axis: string, n: number): B => ({ type: 'ka_studio_axis', fields: { AXIS: axis, MODE: 'change' }, inputs: { VALUE: socket(number(n)) } });
const set = (axis: string, n: number): B => ({ type: 'ka_studio_axis', fields: { AXIS: axis, MODE: 'set' }, inputs: { VALUE: socket(number(n)) } });
const compare = (a: B, OP: string, b: B): B => ({ type: 'ka_compare', fields: { OP }, inputs: { A: socket(a), B: socket(b) } });
const arithmetic = (a: B, OP: string, b: B): B => ({ type: 'ka_arithmetic', fields: { OP }, inputs: { A: socket(a), B: socket(b) } });
const random = (a: number, b: number): B => ({ type: 'ka_studio_random', inputs: { A: socket(number(a)), B: socket(number(b)) } });
const when = (condition: B, actions: B[]): B => ({ type: 'ka_studio_if', inputs: { VALUE: socket(condition), DO: socket(chain(actions)!) } });
const point = (n: number): B => ({ type: 'ka_studio_point', inputs: { VALUE: socket(number(n)) } });
const move = (n: number): B => ({ type: 'ka_sprite_move', fields: { DIRECTION: 'forward' }, inputs: { VALUE: socket(number(n)) } });
const turn = (side: string, ANGLE: number): B => ({ type: 'ka_sprite_turn', fields: { SIDE: side, ANGLE } });
const key = (KEY: string): B => ({ type: 'ka_studio_key_down', fields: { KEY } });
const bodies: Record<string, B[]> = {};
for (const [direction, axis, delta] of [['east', 'x', 2], ['west', 'x', -2], ['north', 'y', 2], ['south', 'y', -2]] as const) {
  bodies[`moving_${direction}`] = [change(axis, delta)];
  bodies[`looping_${direction}`] = [change(axis, delta), when(compare(read(axis), delta > 0 ? '>=' : '<=', number(delta > 0 ? 100 : -100)), [set(axis, delta > 0 ? -100 : 100)])];
}
bodies.arrow_moving = [when(key('ArrowRight'), [change('x', 3)]), when(key('ArrowLeft'), [change('x', -3)]), when(key('ArrowUp'), [change('y', 3)]), when(key('ArrowDown'), [change('y', -3)])];
bodies.arrow_driving = [when(key('ArrowLeft'), [turn('left', 5)]), when(key('ArrowRight'), [turn('right', 5)]), when(key('ArrowUp'), [move(3)]), when(key('ArrowDown'), [move(-3)])];
bodies.spinning_left = [turn('left', 6)]; bodies.spinning_right = [turn('right', 6)];
for (const [name, delta, bound, op] of [['growing', 1, 180, '<'], ['shrinking', -1, 20, '>']] as const) bodies[name] = [when(compare(read('size_value'), op, number(bound)), [{ type: 'ka_studio_size', inputs: { VALUE: socket(arithmetic(read('size_value'), '+', number(delta))) } }])];
const jitter = (axis: string): B => ({ type: 'ka_studio_axis', fields: { AXIS: axis, MODE: 'change' }, inputs: { VALUE: socket(random(-2, 2)) } });
bodies.jittering = [jitter('x'), jitter('y')]; bodies.fluttering = [jitter('y'), change('x', 1)];
bodies.wandering = [turn('right', 15), move(2), { type: 'ka_sprite_bounce' }];
bodies.moving_forward = [move(2)];
bodies.wobbling = [{ type: 'ka_studio_point', inputs: { VALUE: socket(random(-8, 8)) } }];
bodies.patrolling = [when(compare(read('x'), '>=', number(90)), [point(180)]), when(compare(read('x'), '<=', number(-90)), [point(0)]), move(2)];
bodies.swimming = [...structuredClone(bodies.patrolling), jitter('y')];
const definition = (name: string, actions: B[], parameter = false) => ({ name, description: `Ordinary blocks for ${name.replace(/^@/, '').replaceAll('_', ' ')}. Behaviors repeat this body until stopped.`, block: { type: 'ka_studio_define', fields: { NAME: name, PARAM: parameter ? 'value' : 'none' }, inputs: { DO: socket(chain(actions)!) } } as B });
export const studioBehaviorFunctions = Object.entries(bodies).map(([name, blocks]) => definition(`@${name}`, blocks));
const index: B = { type: 'ka_studio_variable', fields: { VAR: 'grid_index' } };
const location = (X: B, Y: B): B => ({ type: 'ka_studio_location', inputs: { X: socket(X), Y: socket(Y) } });
const spawn = (at: B): B => ({ type: 'ka_studio_spawn', fields: { NAME: 'New sprite', SPRITE: 'this', ASSET: 'current' }, inputs: { COUNT: socket(number(1)), LOCATION: socket(at) } });
const counted = (at: B): B => ({ type: 'ka_studio_for', fields: { VAR: 'grid_index' }, inputs: { FROM: socket(number(0)), TO: socket(arithmetic({ type: 'ka_parameter' }, '-', number(1))), BY: socket(number(1)), DO: socket(spawn(at)) } });
export const studioCreationFunctions = [
  definition('@make_burst', [
    { type: 'ka_studio_spawn', fields: { NAME: 'Burst', SPRITE: 'this', ASSET: 'current' }, inputs: { COUNT: socket({ type: 'ka_parameter' }), LOCATION: socket({ type: 'ka_studio_sprite_location', fields: { SPRITE: 'this' } }) } },
    { type: 'ka_studio_for_sprites', inputs: { TARGET: socket({ type: 'ka_studio_last_created' }), DO: socket(chain([{ type: 'ka_studio_point', inputs: { VALUE: socket(random(0, 359)) } }, { type: 'ka_studio_behavior', fields: { MODE: 'start', NAME: '@moving_forward' } }])!) } },
  ], true),
  definition('@make_grid', [counted(location(arithmetic(arithmetic(arithmetic(index, '%', number(5)), '*', number(25)), '-', number(50)), arithmetic(arithmetic({ type: 'ka_studio_math', fields: { OP: 'floor' }, inputs: { VALUE: socket(arithmetic(index, '/', number(5))) } }, '*', number(25)), '-', number(75))))], true),
];
