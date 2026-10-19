import type { serialization } from 'blockly/core';
import { newStudioProject, studioProjectSchema, type StudioProject } from './studioProject.js';
import { studioGameStarter } from './studioGameStarters.js';
type Block = serialization.blocks.State;
export type StudioStarter = 'story' | 'keyboard' | 'bounce' | 'racing' | 'basketball' | 'catch' | 'garden' | 'spaceQuest' | 'tennis';
export const studioStarters = [
  { id: 'tennis', title: 'Tennis rally', description: 'Return the ball and beat the other racket.', tryThis: 'Move your bottom racket left/right. Return the ball across the net; score when the top racket misses. Missing the ball ends your rally. Change the ball or opponent speed blocks.', background: 'tennis', characters: ['TennisRacket', 'TennisBall'] },
  { id: 'racing', title: 'Three-lane racer', description: 'Steer between traffic. How long can you last?', tryThis: 'Use left/right arrows or the buttons to change lanes. Traffic speeds up after score > 50. Change the threshold in Your car; edit speed 4 or 7 in each traffic car.', background: 'racing', characters: ['RaceCarRed', 'RaceCarBlue', 'RaceCarYellow'] },
  { id: 'basketball', title: 'Basketball bounce', description: 'Meet the bouncing ball and send it into the hoop.', tryThis: 'Move left/right to meet the ball. Touching the hoop adds a point; missing the ball ends the game. Try a different player costume.', background: 'basketballGame', characters: ['BasketballBoy', 'Basketball', 'BasketballHoop'] },
  { id: 'catch', title: 'Catch the fish', description: 'Guide a diving cat to catch the falling fish.', tryThis: 'Move left/right to catch the fish. Change the falling speed or the random starting position.', background: 'underwater', characters: ['Cat', 'Fish'] },
  { id: 'garden', title: 'Garden greetings', description: 'Click Grandma to start a family story with a surprise.', tryThis: 'Click Grandma. Look at the message events on each sprite, and edit greet in Functions.', background: 'countryHome', characters: ['Grandma', 'Grandpa', 'Butterfly'] },
  { id: 'spaceQuest', title: 'Rocket rescue', description: 'Launch a rocket and let Byte answer its message.', tryThis: 'Click the rocket. Edit the launch function or change the arrival message.', background: 'space', characters: ['Rocket', 'Byte'] },
  { id: 'story', title: 'Space friends', description: 'Two characters tell a tiny story.', tryThis: 'Change the words in a SAY block, then run your new story.', background: 'sky', characters: ['Byte', 'Dash'] },
  { id: 'keyboard', title: 'Arrow-key adventure', description: 'You control where Dash goes.', tryThis: 'Press Run, then use the arrow buttons or focus the stage and use your keyboard.', background: 'city', characters: ['Dash'] },
  { id: 'bounce', title: 'Bounce around', description: 'Nova turns when a border is touched.', tryThis: 'Press Run. Try a different distance or direction, and use Stop to end the animation.', background: 'horizon', characters: ['Nova'] },
] as const;
const number = (NUM: number): Block => ({ type: 'ka_number', fields: { NUM } });
const chain = (blocks: Block[]): Block | undefined => blocks.reduceRight<Block | undefined>((next, block) => ({ ...block, ...(next ? { next: { block: next } } : {}) }), undefined);
const input = (block: Block) => ({ block });
const say = (TEXT: string, SECONDS = 1.2): Block => ({ type: 'ka_studio_say_for', fields: { TEXT, SECONDS } });
const wait = (SECONDS: number): Block => ({ type: 'ka_sprite_wait', fields: { SECONDS } });
const move = (distance: number): Block => ({ type: 'ka_sprite_move', fields: { DIRECTION: 'forward' }, inputs: { VALUE: input(number(distance)) } });
const script = (main: Block[], hats: Block[] = []): Record<string, unknown> => ({ blocks: { languageVersion: 0, blocks: [
  { type: 'ka_start', id: 'play', x: 36, y: 36, ...(main.length ? { next: input(chain(main)!) } : {}) },
  ...hats.map((hat, index) => ({ ...hat, x: 310, y: 36 + index * 150 })),
] } });
const event = (type: string, body: Block[], fields?: Record<string, string>): Block => ({ type: `ka_event_${type}`, ...(fields ? { fields } : {}), next: input(chain(body)!) });
export function studioStarterProject(kind: StudioStarter): StudioProject {
  if (kind === 'racing' || kind === 'basketball' || kind === 'catch' || kind === 'garden' || kind === 'spaceQuest' || kind === 'tennis') return studioGameStarter(kind);
  const p = newStudioProject(), definition = studioStarters.find(s => s.id === kind)!;
  p.title = definition.title; p.starter = kind;
  p.assets[1].ref = definition.background; p.assets[1].name = definition.background === 'sky' ? 'Floating islands' : definition.background === 'city' ? 'Adventure city' : 'Journey horizon';
  if (kind === 'story') {
    p.sprites[0].x = -55; p.sprites[0].size = 80;
    p.sprites[0].code = script([say('Hi, Dash!'), wait(1.4), say('Where shall we go?')], [event('click', [say('Click Dash to say hello!')])]);
    p.assets.push({ id: 'costume-dash', name: 'Dash', kind: 'character', ref: 'Dash' });
    p.sprites.push({ ...p.sprites[0], id: 'sprite-dash', name: 'Dash', costume: 'costume-dash', costumes: ['costume-dash'], x: 55, code: script([wait(1.3), say('An adventure!')], [event('click', [say('Make up our next line!')])]) });
  } else if (kind === 'keyboard') {
    p.assets[0].name = 'Dash'; p.assets[0].ref = 'Dash'; p.sprites[0].name = 'Dash'; p.sprites[0].size = 80;
    const hats = ([
      ['ArrowRight', 'x', 10], ['ArrowLeft', 'x', -10], ['ArrowUp', 'y', 10], ['ArrowDown', 'y', -10],
    ] as const).map(([KEY, axis, distance]) => {
      const position = (a: string): Block => ({ type: `ka_studio_${a}` });
      const destination: Block = { type: 'ka_arithmetic', fields: { OP: '+' }, inputs: { A: input(position(axis)), B: input(number(distance)) } };
      const go: Block = { type: 'ka_sprite_goto', inputs: { X: input(axis === 'x' ? destination : position('x')), Y: input(axis === 'y' ? destination : position('y')) } };
      return event('key', [{ type: 'ka_logic_if', inputs: {
        VALUE: input({ type: 'ka_compare', fields: { OP: distance > 0 ? '<' : '>' }, inputs: { A: input(position(axis)), B: input(number(distance > 0 ? 90 : -90)) } }),
        DO: input(go), ELSE: input(wait(.1)),
      } }], { KEY });
    });
    p.sprites[0].code = script([say('Arrow keys move me!')], hats);
  } else {
    p.assets[0].name = 'Nova'; p.assets[0].ref = 'Nova'; p.sprites[0].name = 'Nova'; p.sprites[0].x = 70; p.sprites[0].size = 80;
    p.sprites[0].code = script([{ type: 'ka_studio_forever', inputs: { DO: input(move(10)) } }], [event('edge', [{ type: 'ka_sprite_bounce' }, say('Bounce!', .4)])]);
  }
  return studioProjectSchema.parse(p);
}
/** Offer first-use guidance only for an untouched empty project; never for existing work. */
export function untouchedStudioProject(project: StudioProject): boolean {
  const empty = newStudioProject(), { onboarding: _a, ...current } = project;
  return JSON.stringify(current) === JSON.stringify(empty);
}
