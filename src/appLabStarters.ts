import { newAppProject, newElement, type AppBlock, type AppElement, type AppProject, type ElementKind } from '../shared/appLab.js';
export const literal = (value: string | number): AppBlock => typeof value === 'number' ? { type: 'al_number', fields: { NUM: value } } : { type: 'al_text', fields: { TEXT: value } };
export const connected = (block: AppBlock) => ({ block });
const setText = (id: string, value: AppBlock): AppBlock => ({ type: 'al_set_text', fields: { ID: id }, inputs: { VALUE: connected(value) } });
const event = (id: string, action: AppBlock): AppBlock => ({ type: 'al_event', x: 40, y: 180, fields: { ID: id, EVENT: 'click' }, inputs: { DO: connected(action) } });
function sequence(...blocks: AppBlock[]): AppBlock {
  blocks.slice(0, -1).forEach((block, index) => { block.next = connected(blocks[index + 1]); });
  return blocks[0];
}
const variable = (name: string): AppBlock => ({ type: 'al_var', fields: { NAME: name } });
const assign = (name: string, value: AppBlock): AppBlock => ({ type: 'al_set_var', fields: { NAME: name }, inputs: { VALUE: connected(value) } });
const read = (id: string, mode = 'text'): AppBlock => ({ type: 'al_read', fields: { ID: id, MODE: mode } });
const binary = (type: 'al_math' | 'al_compare' | 'al_join', op: string, a: AppBlock, b: AppBlock): AppBlock => ({ type, fields: type === 'al_join' ? {} : { OP: op }, inputs: { A: connected(a), B: connected(b) } });
const equal = (a: AppBlock, b: AppBlock) => binary('al_compare', '=', a, b);
const sum = (a: AppBlock, b: AppBlock) => binary('al_math', '+', a, b);
const join = (a: AppBlock, b: AppBlock) => binary('al_join', '', a, b);
const when = (test: AppBlock, yes: AppBlock, no?: AppBlock): AppBlock => ({ type: 'al_if', inputs: { TEST: connected(test), DO: connected(yes), ...(no ? { ELSE: connected(no) } : {}) } });
const navigate = (screen: string): AppBlock => ({ type: 'al_screen', fields: { ID: screen } });
const tableCell = (table: string, column: string, row: AppBlock): AppBlock => ({ type: 'al_cell', fields: { TABLE: table, COLUMN: column }, inputs: { ROW: connected(row) } });
function control(kind: ElementKind, id: string, text: string, y: number, extra: Partial<AppElement> = {}): AppElement {
  return { ...newElement(kind, id, 'home', 24, y), width: 272, text, ...extra };
}
export const appStarterChoices = [
  { id: 'greeting', title: 'Hello, app!', description: 'Read an input, greet your visitor and open another screen.' },
  { id: 'counter', title: 'Tap counter', description: 'Connect a button, a variable and a changing number.' },
  { id: 'data', title: 'Animal explorer', description: 'Read a project-local table and display a fact.' },
  { id: 'quiz', title: 'Number Detective', description: 'Answer three questions, check your score and explore a question table.' },
  { id: 'calculator', title: 'Mini Calculator', description: 'Read two numbers and choose addition, subtraction or multiplication.' },
  { id: 'story', title: 'Story Paths', description: 'Choose your adventure and connect three story screens.' },
  { id: 'checklist', title: 'Mission Checklist', description: 'Tick pretend goals, count completed tasks and update a local table.' },
  { id: 'blank', title: 'Blank app', description: 'Start with one screen and your own idea.' },
] as const;
export function appStarter(choice: string): AppProject {
  const p = newAppProject();
  if (choice === 'blank') { p.screens[0].background = '#ffffff'; return p; }
  const heading = { ...newElement('label', 'heading', 'home', 24, 32), text: 'Hello, app!', width: 272, height: 60, fontSize: 28, background: '#f7f4fe' };
  p.elements.push(heading);
  if (choice === 'greeting') {
    p.title = 'Hello, app!';
    p.screens.push({ id: 'welcome', background: '#e9f6f2' });
    p.elements.push({ ...newElement('input', 'nickname', 'home', 24, 130), width: 272, text: 'Coder' }, { ...newElement('button', 'hello', 'home', 24, 204), text: 'Say hello', width: 272 }, { ...newElement('label', 'message', 'welcome', 24, 100), text: 'Welcome!', width: 272, height: 100, fontSize: 26, background: '#e9f6f2' }, { ...newElement('button', 'back', 'welcome', 24, 280), text: 'Back to start', width: 272 });
    const greeting = setText('message', { type: 'al_join', inputs: { A: connected(literal('Hello, ')), B: connected({ type: 'al_read', fields: { ID: 'nickname', MODE: 'text' } }) } });
    greeting.next = { block: { type: 'al_screen', fields: { ID: 'welcome' } } };
    p.code.blocks!.blocks.push(event('hello', greeting), { ...event('back', { type: 'al_screen', fields: { ID: 'home' } }), y: 420 });
  } else if (choice === 'counter') {
    p.title = 'Tap counter'; heading.text = 'Make it count';
    p.elements.push({ ...newElement('label', 'total', 'home', 24, 140), text: '0', width: 272, height: 80, fontSize: 40, background: '#f7f4fe' }, { ...newElement('button', 'count', 'home', 24, 260), text: 'Add one', width: 272 });
    p.code.blocks!.blocks[0].inputs = { DO: connected({ type: 'al_set_var', fields: { NAME: 'score' }, inputs: { VALUE: connected(literal(0)) } }) };
    const increase: AppBlock = { type: 'al_set_var', fields: { NAME: 'score' }, inputs: { VALUE: connected({ type: 'al_math', fields: { OP: '+' }, inputs: { A: connected({ type: 'al_var', fields: { NAME: 'score' } }), B: connected(literal(1)) } }) }, next: { block: setText('total', { type: 'al_var', fields: { NAME: 'score' } }) } };
    p.code.blocks!.blocks.push(event('count', increase));
  } else if (choice === 'quiz') {
    p.title = 'Number Detective'; heading.text = p.title;
    p.tables = [{ id: 'questions', columns: ['question', 'answer'], rows: [['What is 2 + 3?', '5'], ['What is 3 x 4?', '12'], ['What is 10 - 2?', '8']] }];
    p.elements.push(
      control('label', 'question', 'What is 2 + 3?', 112, { height: 64, fontSize: 23, background: '#f7f4fe' }),
      control('dropdown', 'answer', '5', 196, { options: ['5', '12', '8'] }),
      control('button', 'checkAnswer', 'Check answer', 260, { width: 132 }),
      control('button', 'nextQuestion', 'Next question', 260, { x: 168, width: 128 }),
      control('label', 'feedback', 'Choose an answer, then check it.', 324, { height: 64, background: '#f7f4fe' }),
      control('label', 'quizScore', 'Score: 0', 408, { height: 36, background: '#f7f4fe' }),
    );
    p.code.blocks!.blocks[0].inputs = { DO: connected(sequence(assign('questionIndex', literal(0)), assign('points', literal(0)), assign('answered', literal(0)), setText('question', tableCell('questions', 'question', variable('questionIndex'))))) };
    p.code.blocks!.blocks.push(event('checkAnswer', sequence(
      when(equal(variable('answered'), literal(0)), sequence(assign('answered', literal(1)),
        when(equal(read('answer'), tableCell('questions', 'answer', variable('questionIndex'))),
          sequence(assign('points', sum(variable('points'), literal(1))), setText('feedback', literal('Correct! Try the next question.'))),
          setText('feedback', join(literal('The answer is '), tableCell('questions', 'answer', variable('questionIndex'))))))),
      setText('quizScore', join(literal('Score: '), variable('points'))),
    )), event('nextQuestion', sequence(
      assign('questionIndex', sum(variable('questionIndex'), literal(1))),
      when(equal(variable('questionIndex'), { type: 'al_rows', fields: { TABLE: 'questions' } }), sequence(assign('questionIndex', literal(0)), assign('points', literal(0)))),
      assign('answered', literal(0)), setText('question', tableCell('questions', 'question', variable('questionIndex'))),
      setText('feedback', literal('Choose an answer, then check it.')), setText('quizScore', join(literal('Score: '), variable('points'))),
    )));
  } else if (choice === 'calculator') {
    p.title = 'Mini Calculator'; heading.text = p.title;
    p.elements.push(
      control('label', 'firstLabel', 'First number', 104, { width: 128, height: 28, background: '#f7f4fe' }),
      control('label', 'secondLabel', 'Second number', 104, { x: 168, width: 128, height: 28, background: '#f7f4fe' }),
      control('input', 'firstNumber', '6', 140, { width: 128 }), control('input', 'secondNumber', '4', 140, { x: 168, width: 128 }),
      control('dropdown', 'operation', 'Add', 212, { options: ['Add', 'Subtract', 'Multiply'] }),
      control('button', 'calculate', 'Calculate', 280),
      control('label', 'calculation', 'Choose an operation and calculate.', 348, { height: 80, fontSize: 22, background: '#f7f4fe' }),
    );
    const calculations = (['Add', 'Subtract', 'Multiply'] as const).map((operation, index) => {
      const value = binary('al_math', ['+', '-', '*'][index], read('firstNumber', 'number'), read('secondNumber', 'number'));
      return when(equal(read('operation'), literal(operation)), setText('calculation', join(literal('Result: '), value)));
    });
    p.code.blocks!.blocks.push(event('calculate', sequence(...calculations)));
  } else if (choice === 'story') {
    p.title = 'Story Paths'; heading.text = 'The secret map';
    p.screens.push({ id: 'forest', background: '#e9f6f2' }, { id: 'skyTower', background: '#f1efff' });
    p.elements.push(
      control('label', 'storyIntro', 'A map points to two places. Follow the forest path or climb the sky tower. Which story will you choose?', 120, { height: 128, fontSize: 20, background: '#f7f4fe' }),
      control('button', 'chooseForest', 'Explore the forest', 280), control('button', 'chooseTower', 'Climb the sky tower', 348),
      control('label', 'forestTitle', 'The hidden garden', 40, { screen: 'forest', height: 64, fontSize: 28, background: '#e9f6f2' }),
      control('label', 'forestStory', 'You follow glowing footprints to a garden. A tiny robot gives you a seed: your next adventure is to help it grow.', 132, { screen: 'forest', height: 172, fontSize: 21, background: '#e9f6f2' }),
      control('button', 'forestBack', 'Choose another path', 348, { screen: 'forest' }),
      control('label', 'towerTitle', 'A signal in the stars', 40, { screen: 'skyTower', height: 64, fontSize: 28, background: '#f1efff' }),
      control('label', 'towerStory', 'At the top, you repair a telescope. A friendly explorer sends a star map, inviting you to imagine a new world.', 132, { screen: 'skyTower', height: 172, fontSize: 21, background: '#f1efff' }),
      control('button', 'towerBack', 'Choose another path', 348, { screen: 'skyTower' }),
    );
    p.code.blocks!.blocks.push(event('chooseForest', navigate('forest')), event('chooseTower', navigate('skyTower')), event('forestBack', navigate('home')), event('towerBack', navigate('home')));
  } else if (choice === 'checklist') {
    p.title = 'Mission Checklist'; heading.text = p.title;
    const missions = ['Read for ten minutes', 'Build a tiny app', 'Help a teammate'];
    p.tables = [{ id: 'missions', columns: ['task', 'done'], rows: missions.map(task => [task, false]) }];
    p.elements.push(...missions.map((text, index) => control('checkbox', `mission${index + 1}`, text, 120 + index * 60)),
      control('button', 'updateMissions', 'Update my progress', 316),
      control('label', 'missionProgress', 'Completed: 0 of 3', 388, { height: 56, fontSize: 22, background: '#f7f4fe' }),
    );
    const actions = missions.flatMap((_, index) => [
      { type: 'al_set_cell' as const, fields: { TABLE: 'missions', COLUMN: 'done' }, inputs: { ROW: connected(literal(index)), VALUE: connected(read(`mission${index + 1}`, 'checked')) } },
      when(read(`mission${index + 1}`, 'checked'), assign('completed', sum(variable('completed'), literal(1)))),
    ]);
    p.code.blocks!.blocks.push(event('updateMissions', sequence(assign('completed', literal(0)), ...actions, setText('missionProgress', join(literal('Completed: '), join(variable('completed'), literal(' of 3')))))));
  } else {
    p.title = 'Animal explorer'; heading.text = 'Animal explorer';
    p.tables = [{ id: 'animals', columns: ['name', 'fact'], rows: [['Butterfly', 'A butterfly tastes with its feet.'], ['Octopus', 'An octopus has three hearts.'], ['Elephant', 'Elephants use their trunks to smell and grasp.']] }];
    p.elements.push({ ...newElement('label', 'fact', 'home', 24, 140), text: 'Press the button to discover a fact.', width: 272, height: 140, background: '#f7f4fe' }, { ...newElement('button', 'discover', 'home', 24, 320), text: 'Show a fact', width: 272 });
    p.code.blocks!.blocks.push(event('discover', setText('fact', { type: 'al_cell', fields: { TABLE: 'animals', COLUMN: 'fact' }, inputs: { ROW: connected(literal(0)) } })));
  }
  return p;
}
