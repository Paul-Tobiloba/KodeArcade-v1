import type { serialization } from 'blockly/core';
import { newStudioProject, studioProjectSchema, type StudioProject } from './studioProject.js';
import { studioStarterProject, type StudioStarter } from './studioStarters.js';

type B = serialization.blocks.State;
export type StudioTutorialId = 'tutorialQuestions' | 'tutorialTimers' | 'tutorialSprites' | 'tutorialBehaviors';
export type StudioProjectChoice = StudioStarter | StudioTutorialId;
type Step = { title: string; instruction: string; notice: string; category: string };
type Tutorial = { id: StudioTutorialId; title: string; description: string; background: string; characters: readonly string[]; steps: readonly Step[] };
export const studioTutorials: readonly Tutorial[] = [
  { id: 'tutorialQuestions', title: 'My space hero', description: 'Invent a hero, choose a planet and tell a new story.', background: 'space', characters: ['Byte'], steps: [
    { title: 'Meet your hero', instruction: 'Press Run. Invent a made-up hero name, answer the question, then choose a planet.', notice: 'The script waits for your answers. Never enter real names or personal details.', category: 'World' },
    { title: 'Change the greeting', instruction: 'Stop. In the text block inside join, change “Captain ” to another greeting. Keep a space at the end, then Run again.', notice: 'Join combines your words with the answer saved in hero.', category: 'Text' },
    { title: 'Invent a planet', instruction: 'Stop. Edit one of the three choices in the second ask block. Run and visit your new planet.', notice: 'Choices are part of your saved code; answers belong only to this run.', category: 'World' },
    { title: 'Tell your own story', instruction: 'Try new words in both joins. Open Show code to see how text and questions fit together.', notice: 'Your project saves privately. Check its save status before leaving; Reset clears the answers.', category: 'Text' },
  ] },
  { id: 'tutorialTimers', title: 'Beat the countdown', description: 'Click Byte before the clock runs out. Change the rules.', background: 'city', characters: ['Byte'], steps: [
    { title: 'Race the clock', instruction: 'Press Run, then click Byte as often as you can before five seconds pass.', notice: 'Score counts your clicks. Seconds uses a real timer; the game stops when time runs out.', category: 'Events' },
    { title: 'Change the time limit', instruction: 'Stop. Change 5 to 8 in BOTH the at-seconds hat and the less-than comparison inside the click script. Run again.', notice: 'The clock event ends the game; the click condition decides whether a click counts. Keep their limits equal.', category: 'Events' },
    { title: 'Give bonus points', instruction: 'Stop. In the click script, change “change score by 1” to 2. Run and compare your score.', notice: 'The score rule is an ordinary variable block you can edit.', category: 'Variables' },
    { title: 'Make a new challenge', instruction: 'Try a three-second game by changing both time limits. Open Show code and find the timer and click events.', notice: 'This is your own experiment, not a graded course task. Run always starts the counters again.', category: 'Sensing' },
  ] },
  { id: 'tutorialSprites', title: 'Butterfly swarm', description: 'Make, drag, count and remove a group of butterflies.', background: 'countryHome', characters: ['Butterfly'], steps: [
    { title: 'Grow a swarm', instruction: 'Press Run. Six new butterflies appear beside the original. Drag a new butterfly to another spot.', notice: 'Each new butterfly runs its created event. The counter includes the original, so it starts at seven.', category: 'Sprites' },
    { title: 'Change the group', instruction: 'Stop. Change 6 in the make-new-sprites block to 10, then Run.', notice: 'Creation is temporary: Run starts again from your one saved butterfly. Use 1–20 in this example.', category: 'Sprites' },
    { title: 'Change every new butterfly', instruction: 'Stop. Change size 45 inside the for-each block to 65. Run and compare the group with the original.', notice: 'Last-created selects just the new butterflies. The body acts on each selected sprite.', category: 'Looks' },
    { title: 'Clear and rebuild', instruction: 'After Run, focus the stage and press Space, or use its Space button. The new group disappears. Run brings it back.', notice: 'The count becomes one. Created sprites are not extra saved projects; Show code exposes the group actions.', category: 'Sprites' },
  ] },
  { id: 'tutorialBehaviors', title: 'Dance with Byte', description: 'Edit your dance and inspect an arrow-key behavior.', background: 'horizon', characters: ['Byte'], steps: [
    { title: 'Move and dance', instruction: 'Press Run. Byte spins. Hold an arrow button, or focus the stage and hold an arrow key, to move while dancing.', notice: 'Two independent behaviors run together: your dance and a built-in arrow movement.', category: 'Behaviors' },
    { title: 'Edit your dance', instruction: 'Stop. Open Behaviors → Edit my_dance. Change the turn angle from 15 to 30, then Save function and Run.', notice: 'Your personal definition stays editable. A behavior repeats its ordinary blocks until stopped.', category: 'Behaviors' },
    { title: 'Look inside the built-in', instruction: 'Stop. In Behaviors, choose “arrow moving” under Built-in definition and select View definition.', notice: 'The if, held-key and movement blocks are visible. Built-in definitions are read-only; close the definition to return.', category: 'Behaviors' },
    { title: 'Pause one behavior', instruction: 'Run, then click Byte to pause the dance. Arrow movement still works. Focus the stage and press Space, or use its Space button, to restart the dance.', notice: 'Start and stop target a named behavior. Show code includes both your definition and the built-in body.', category: 'Behaviors' },
  ] },
];
export function findStudioTutorial(id?: string) { return studioTutorials.find(tutorial => tutorial.id === id); }
const input = (block: B) => ({ block });
const b = (type: string, values: Record<string, B> = {}, fields: Record<string, string | number> = {}): B => ({ type, fields, inputs: Object.fromEntries(Object.entries(values).map(([name, block]) => [name, input(block)])) });
const chain = (blocks: B[]): B | undefined => blocks.reduceRight<B | undefined>((next, block) => ({ ...block, ...(next ? { next: input(next) } : {}) }), undefined);
const n = (NUM: number) => b('ka_number', {}, { NUM });
const text = (TEXT: string) => b('ka_studio_text', {}, { TEXT });
const at = (x = 0, y = 0) => b('ka_studio_location', { X: n(x), Y: n(y) });
const variable = (VAR: string) => b('ka_studio_variable', {}, { VAR });
const set = (VAR: string, VALUE: B) => b('ka_studio_set_variable', { VALUE }, { VAR });
const say = (TEXT: string) => b('ka_sprite_say', {}, { TEXT });
const joined = (prefix: string, VAR: string) => b('ka_studio_join', { A: text(prefix), B: b('ka_studio_text_variable', {}, { VAR }) });
const count = () => b('ka_studio_sprite_count', { TARGET: b('ka_studio_costume_group', {}, { ASSET: 'current' }) });
const behavior = (NAME: string, MODE = 'start') => b('ka_studio_behavior', {}, { NAME, MODE });
const hat = (type: string, actions: B[], fields: Record<string, string | number> = {}): B => ({ type: `ka_event_${type}`, fields, next: input(chain(actions)!) });
const code = (actions: B[], hats: B[] = []): Record<string, unknown> => ({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', x: 36, y: 36, ...(actions.length ? { next: input(chain(actions)!) } : {}) }, ...hats.map((root, i) => ({ ...root, x: 36, y: 440 + i * 300 }))] } });
export function studioTutorialProject(id: StudioTutorialId): StudioProject {
  const tutorial = findStudioTutorial(id); if (!tutorial) throw new Error('Choose an existing block tutorial.');
  const project = newStudioProject(), sprite = project.sprites[0];
  project.title = tutorial.title; project.starter = id; project.onboarding = 'skipped';
  project.assets[1].ref = tutorial.background; project.assets[1].name = tutorial.title;
  if (id === 'tutorialQuestions') sprite.code = code([
    b('ka_studio_prompt', { QUESTION: text('Invent a made-up hero name') }, { VAR: 'hero' }),
    b('ka_studio_say_text', { VALUE: joined('Captain ', 'hero') }),
    b('ka_studio_prompt_choices', { QUESTION: text('Where shall we explore?') }, { VAR: 'planet', CHOICE1: 'Nova', CHOICE2: 'Luma', CHOICE3: 'Zed' }),
    b('ka_studio_say_text', { VALUE: joined('Next stop: ', 'planet') }),
  ], [hat('answer', [b('ka_studio_sound', {}, { SOUND: 'cheer' })], { VAR: 'planet' })]);
  else if (id === 'tutorialTimers') sprite.code = code([
    set('score', n(0)), set('seconds', n(0)), b('ka_studio_monitor', {}, { VAR: 'score', MODE: 'show' }), b('ka_studio_monitor_at', { LOCATION: at(0, 80) }, { VAR: 'seconds' }), b('ka_studio_reset_timer'), say('Click me before time runs out!'),
  ], [hat('click', [b('ka_studio_if', { VALUE: b('ka_compare', { A: b('ka_studio_timer', {}, { UNIT: 'seconds' }), B: n(5) }, { OP: '<' }), DO: b('ka_studio_change_variable', { VALUE: n(1) }, { VAR: 'score' }) })]), hat('every', [set('seconds', b('ka_studio_math', { VALUE: b('ka_studio_timer', {}, { UNIT: 'seconds' }) }, { OP: 'floor' }))], { SECONDS: 1 }), hat('at', [say('Time is up! Press Run to try again.'), b('ka_studio_stop', {}, { SCOPE: 'all' })], { SECONDS: 5 })]);
  else if (id === 'tutorialSprites') {
    sprite.name = 'Butterfly'; sprite.size = 70; project.assets[0].name = 'Butterfly'; project.assets[0].ref = 'Butterfly';
    sprite.code = code([
      b('ka_studio_spawn', { COUNT: n(6), LOCATION: at() }, { SPRITE: 'this', NAME: 'Butterfly', ASSET: 'current' }),
      b('ka_studio_for_sprites', { TARGET: b('ka_studio_last_created'), DO: chain([b('ka_studio_goto_location', { LOCATION: b('ka_studio_random_location') }), b('ka_studio_size', { VALUE: n(45) })])! }),
      set('count', count()), b('ka_studio_monitor_at', { LOCATION: at(0, 80) }, { VAR: 'count' }),
    ], [hat('created', [b('ka_studio_draggable', {}, { MODE: 'start' })]), hat('key', [b('ka_studio_remove', { TARGET: b('ka_studio_last_created') }), set('count', count())], { KEY: ' ' })]);
  } else sprite.code = code([behavior('@arrow_moving'), behavior('my_dance')], [
    b('ka_studio_define', { DO: chain([b('ka_sprite_turn', {}, { SIDE: 'right', ANGLE: 15 }), b('ka_sprite_wait', {}, { SECONDS: .1 })])! }, { NAME: 'my_dance', PARAM: 'none' }),
    hat('click', [behavior('my_dance', 'stop'), say('I can still move! Space restarts my dance.')]), hat('key', [behavior('my_dance')], { KEY: ' ' }),
  ]);
  return studioProjectSchema.parse(project);
}
export function studioNewProject(choice: StudioProjectChoice | null) {
  const tutorial = findStudioTutorial(choice ?? undefined);
  return tutorial ? studioTutorialProject(tutorial.id) : choice ? studioStarterProject(choice as StudioStarter) : newStudioProject();
}
