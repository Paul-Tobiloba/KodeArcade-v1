import type { serialization } from 'blockly/core';
import { studioProjectSchema, type StudioProject } from './studioProject.js';
type B = serialization.blocks.State;
const input = (block: B) => ({ block });
const chain = (blocks: B[]): B | undefined => blocks.reduceRight<B | undefined>((next, b) => ({ ...b, ...(next ? { next: input(next) } : {}) }), undefined);
const n = (NUM: number): B => ({ type: 'ka_number', fields: { NUM } });
const variable = (VAR: string): B => ({ type: 'ka_studio_variable', fields: { VAR } });
const position = (axis: 'x' | 'y'): B => ({ type: `ka_studio_${axis}` });
const arithmetic = (a: B, OP: string, b: B): B => ({ type: 'ka_arithmetic', fields: { OP }, inputs: { A: input(a), B: input(b) } });
const compare = (a: B, OP: string, b: B): B => ({ type: 'ka_compare', fields: { OP }, inputs: { A: input(a), B: input(b) } });
const join = (a: B, OP: string, b: B): B => ({ type: 'ka_boolean_join', fields: { OP }, inputs: { A: input(a), B: input(b) } });
const when = (value: B, blocks: B[]): B => ({ type: 'ka_studio_if', inputs: { VALUE: input(value), DO: input(chain(blocks)!) } });
const axis = (AXIS: 'x' | 'y', VALUE: B, MODE = 'change'): B => ({ type: 'ka_studio_axis', fields: { AXIS, MODE }, inputs: { VALUE: input(VALUE) } });
const set = (VAR: string, VALUE: B, change = false): B => ({ type: change ? 'ka_studio_change_variable' : 'ka_studio_set_variable', fields: { VAR }, inputs: { VALUE: input(VALUE) } });
const counter = (VAR: string): B => ({ type: 'ka_studio_monitor', fields: { VAR, MODE: 'show' } });
const say = (TEXT: string): B => ({ type: 'ka_sprite_say', fields: { TEXT } });
const wait = (SECONDS: number): B => ({ type: 'ka_sprite_wait', fields: { SECONDS } });
const touch = (SPRITE: string): B => ({ type: 'ka_studio_touching', fields: { SPRITE } });
const stop = (): B => ({ type: 'ka_studio_stop', fields: { SCOPE: 'all' } });
const forever = (blocks: B[]): B => ({ type: 'ka_studio_forever', inputs: { DO: input(chain(blocks)!) } });
const random = (a: number, b: number): B => ({ type: 'ka_studio_random', inputs: { A: input(n(a)), B: input(n(b)) } });
const hat = (type: string, body: B[], fields?: Record<string, string>): B => ({ type: `ka_event_${type}`, fields, next: input(chain(body)!) });
const script = (body: B[], hats: B[] = []): Record<string, unknown> => ({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', x: 36, y: 36, ...(body.length ? { next: input(chain(body)!) } : {}) }, ...hats.map((b, i) => ({ ...b, x: 360 + i * 280, y: 36 }))] } });
const arrows = (amount: number, bound: number): B[] => [-1, 1].map(sign => hat('key', [when(compare(position('x'), sign < 0 ? '>' : '<', n(sign * bound)), [axis('x', n(sign * amount))])], { KEY: sign < 0 ? 'ArrowLeft' : 'ArrowRight' }));
const sprite = (id: string, name: string, ref: string, x: number, y: number, size: number, code: Record<string, unknown>) => ({ id, name, ref, x, y, size, code });
function project(title: string, starter: StudioProject['starter'], background: string, cast: ReturnType<typeof sprite>[]): StudioProject {
  return studioProjectSchema.parse({ version: 1, title, starter, selected: cast[0].id, backdrop: 'scene', assets: [
    { id: 'scene', name: title, kind: 'background', ref: background },
    ...cast.map(s => ({ id: `${s.id}-art`, name: s.name, kind: 'character', ref: s.ref })),
  ], sprites: cast.map(({ ref: _ref, ...s }) => ({ ...s, costume: `${s.id}-art`, costumes: [`${s.id}-art`], angle: 0, visible: true })) });
}
export function studioGameStarter(kind: 'racing' | 'basketball' | 'catch' | 'garden' | 'spaceQuest' | 'tennis'): StudioProject {
  if (kind === 'tennis') return project('Tennis rally', kind, 'tennis', [
    sprite('ball', 'Tennis ball', 'TennisBall', -60, -30, 45, script([
      set('dx', n(4)), set('dy', n(-5)), counter('score'), forever([
        axis('x', variable('dx')), axis('y', variable('dy')), wait(.1),
        when(join(compare(position('x'), '>=', n(90)), 'or', compare(position('x'), '<=', n(-90))), [set('dx', arithmetic(variable('dx'), '*', n(-1)))]),
        when(join(join(touch('player'), 'and', compare(variable('dy'), '<', n(0))), 'or', join(touch('opponent'), 'and', compare(variable('dy'), '>', n(0)))), [set('dy', arithmetic(variable('dy'), '*', n(-1)))]),
        when(compare(position('y'), '>=', n(96)), [set('score', n(1), true), axis('y', n(0), 'set'), set('dy', n(-5))]),
        when(compare(position('y'), '<=', n(-96)), [say('Missed! Press Run for a new rally.'), stop()]),
      ]),
    ])),
    sprite('player', 'Your racket', 'TennisRacket', 0, -75, 100, script([], arrows(12, 84))),
    sprite('opponent', 'Other racket', 'TennisRacket', 0, 75, 100, script([forever([
      wait(.15), { type: 'ka_logic_if', inputs: {
        VALUE: input(compare({ type: 'ka_studio_other_position', fields: { SPRITE: 'ball', AXIS: 'x' } }, '>', position('x'))),
        DO: input(axis('x', n(2))), ELSE: input(axis('x', n(-2))),
      } },
    ])])),
  ]);
  if (kind === 'racing') {
    const traffic = (initialDelay: number) => script([set('speed', n(4)), wait(initialDelay), forever([
      axis('y', arithmetic(n(0), '-', variable('speed'))), wait(.1),
      when(touch('driver'), [say('Bump! Press Run to race again.'), stop()]),
      when(compare(position('y'), '<', n(-96)), [axis('x', arithmetic(random(-1, 1), '*', n(50)), 'set'), axis('y', n(96), 'set')]),
    ])], [hat('message', [set('speed', n(7))], { MESSAGE: 'speed_up' })]);
    return project('Three-lane racer', kind, 'racing', [
      sprite('driver', 'Your car', 'RaceCarRed', 0, -75, 72, script([counter('score'), set('boosted', n(0)), forever([
        wait(.5), set('score', n(1), true),
        when(join(compare(variable('score'), '>', n(50)), 'and', compare(variable('boosted'), '==', n(0))), [
          { type: 'ka_studio_broadcast', fields: { MESSAGE: 'speed_up' } }, set('boosted', n(1)),
        ]),
      ])], arrows(50, 50))),
      sprite('traffic-blue', 'Blue traffic', 'RaceCarBlue', -50, 90, 72, traffic(.1)),
      sprite('traffic-yellow', 'Yellow traffic', 'RaceCarYellow', 50, 35, 72, traffic(.8)),
    ]);
  }
  if (kind === 'basketball') return project('Basketball bounce', kind, 'basketballGame', [
    sprite('ball', 'Ball', 'Basketball', 0, 15, 45, script([
      set('dx', n(3)), set('dy', n(-4)), counter('score'), forever([
        axis('x', variable('dx')), axis('y', variable('dy')), wait(.1),
        when(join(compare(position('x'), '>=', n(94)), 'or', compare(position('x'), '<=', n(-94))), [set('dx', arithmetic(variable('dx'), '*', n(-1)))]),
        when(compare(position('y'), '>=', n(94)), [set('dy', n(-4))]),
        when(join(touch('player'), 'and', compare(variable('dy'), '<', n(0))), [set('dy', n(4))]),
        when(touch('hoop'), [set('score', n(1), true), axis('x', n(0), 'set'), axis('y', n(10), 'set'), set('dy', n(-4))]),
        when(compare(position('y'), '<', n(-94)), [say('Missed! Press Run to try again.'), stop()]),
      ]),
    ])),
    sprite('player', 'Player', 'BasketballBoy', 0, -75, 110, script([], arrows(12, 84))),
    sprite('hoop', 'Hoop', 'BasketballHoop', 0, 80, 110, script([])),
  ]);
  if (kind === 'catch') return project('Catch the fish', kind, 'underwater', [
    sprite('fish', 'Fish', 'Fish', -35, 80, 65, script([counter('score'), forever([
      axis('y', n(-4)), wait(.1), when(touch('cat'), [set('score', n(1), true), axis('x', random(-80, 80), 'set'), axis('y', n(90), 'set')]),
      when(compare(position('y'), '<', n(-94)), [say('Swam away! Try again.'), stop()]),
    ])])),
    sprite('cat', 'Diving cat', 'Cat', 0, -75, 100, script([], arrows(12, 84))),
  ]);
  if (kind === 'garden') {
    const greet: B = { type: 'ka_studio_define', fields: { NAME: 'greet', PARAM: 'none' }, inputs: { DO: input(chain([say('Welcome to our garden!'), { type: 'ka_studio_broadcast', fields: { MESSAGE: 'garden_time' } }])!) } };
    return project('Garden greetings', kind, 'countryHome', [
      sprite('grandma', 'Grandma', 'Grandma', -55, -25, 100, script([say('Click me to start our story.')], [greet, hat('click', [{ type: 'ka_function_call', fields: { NAME: 'greet' } }])])),
      sprite('grandpa', 'Grandpa', 'Grandpa', 50, -25, 100, script([], [hat('message', [wait(.5), say('I planted a surprise for you.'), { type: 'ka_studio_broadcast', fields: { MESSAGE: 'surprise' } }], { MESSAGE: 'garden_time' })])),
      sprite('butterfly', 'Butterfly', 'Butterfly', 0, 45, 65, script([], [hat('message', [{ type: 'ka_function_call', fields: { NAME: 'hop' } }, say('A garden for all of us!')], { MESSAGE: 'surprise' })])),
    ]);
  }
  return project('Rocket rescue', kind, 'space', [
    sprite('rocket', 'Rocket', 'Rocket', -40, -50, 90, script([say('Click me to launch.')], [
      { type: 'ka_studio_define', fields: { NAME: 'launch', PARAM: 'none' }, inputs: { DO: input(chain([{ type: 'ka_studio_repeat', fields: { COUNT: 6 }, inputs: { DO: input(axis('y', n(15))) } }, { type: 'ka_studio_broadcast', fields: { MESSAGE: 'arrived' } }])!) } },
      hat('click', [{ type: 'ka_function_call', fields: { NAME: 'launch' } }]),
    ])),
    sprite('byte', 'Byte', 'Byte', 45, 35, 85, script([], [hat('message', [say('Rescue complete! Where next?'), { type: 'ka_function_call', fields: { NAME: 'spin_right' } }], { MESSAGE: 'arrived' })])),
  ]);
}
