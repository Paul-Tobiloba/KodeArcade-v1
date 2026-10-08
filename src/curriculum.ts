import { missions } from './learning';
import { characterFor } from './characters';
import { courses, type CourseId } from './courses';

export type Lesson = {
  title: string; introduction: string;
  sections: { title: string; text: string }[];
  example: { title: string; steps: string[]; explanation: string };
  takeaway: string;
};
export type LearningModule = {
  id: string; title: string; description: string; challengeIds: string[];
  status: 'available' | 'upcoming'; lesson: Lesson;
  plannedChallenges?: string[];
  topicId?: string;
};
export const modules: LearningModule[] = [
  { id: 'sequences', title: 'Sequences', description: 'Give clear instructions, one step at a time.', status: 'available', challengeIds: ['first-steps', 'sequence-up', 'sequence-corner'],
    lesson: { title: 'Every program starts with a sequence', introduction: 'Think about getting ready in the morning: put on your socks, then your shoes. You follow instructions in an order. Computers follow ordered instructions too. We call that order a sequence.',
      sections: [{ title: 'One block, one instruction', text: 'In Robot Rescue, each movement block tells Byte to move exactly one square. Three Move right blocks move Byte three squares right. Byte does only what your program says, so every step needs an instruction.' }, { title: 'Read from top to bottom', text: 'Snap your first block under “when Play is pressed”. The block below it runs next, and the rest follow in order. Blocks left floating on the canvas are not part of your connected program.' }, { title: 'Predict, run, and notice', text: 'Before you press Play, follow the instructions with your finger or imagine Byte moving. After the run, compare your prediction with where Byte stopped. You can change the blocks and try again.' }],
      example: { title: 'A two-step journey', steps: ['Move right', 'Move right'], explanation: 'Byte moves one square right, then another square right. The total movement is two squares.' }, takeaway: 'A sequence is a set of instructions carried out in order.' } },
  { id: 'directions', title: 'Direction & order', description: 'Plan a route and choose what happens first.', status: 'available', challengeIds: ['take-a-turn', 'direction-gap', 'direction-home'],
    lesson: { title: 'The order changes the journey', introduction: 'Two programs can use the same movement blocks and still visit different squares. When rocks are in the way, the order of your instructions can decide whether Byte reaches the station.',
      sections: [{ title: 'Directions follow the screen', text: 'Move up means toward the top of the board. Move down means toward the bottom. Left and right follow the screen too; these commands do not turn when Byte changes position.' }, { title: 'Look at the whole route', text: 'Start with Byte’s square, then find the station and any rocks. Choose clear squares for the route. Sometimes you need to move away from the station for a moment to get around a rock.' }, { title: 'Try a different order', text: 'If moving right leads into a rock, moving up first might open a path. Drag blocks apart and snap them into a new order. Run the new sequence and compare it with the old one.' }],
      example: { title: 'Same moves, different squares', steps: ['Move up', 'Move right'], explanation: 'Byte visits the square above its start before moving right. Reversing these blocks visits the square to the right first.' }, takeaway: 'Think about every square on the route, not only the destination.' } },
  { id: 'loops', title: 'Loops', description: 'Find a pattern and make it repeat.', status: 'available', challengeIds: ['on-repeat', 'loop-corner', 'loop-stairs'],
    lesson: { title: 'Say it once, repeat it with a loop', introduction: 'When you clap four times, you repeat the same action. A loop lets a computer repeat instructions without writing the same blocks over and over.',
      sections: [{ title: 'The count tells us how many times', text: 'A Repeat block has a number. Set it to 4 and the instructions inside run four times. The number is the total number of repetitions, not extra repeats after a first run.' }, { title: 'The body is what repeats', text: 'Drag movement blocks into the space marked “do”. This inside section is the loop body. An empty body gives Byte nothing to do. You can put one movement or a connected sequence inside.' }, { title: 'Combine loops with other blocks', text: 'You can put a normal movement before or after a loop, or connect two loops in a row. The whole program still runs from top to bottom. Look for the part of the route that repeats.' }],
      example: { title: 'Repeat a small pattern', steps: ['Repeat 2 times', '    Move right', '    Move up'], explanation: 'The order is right, up, right, up. Both instructions repeat together.' }, takeaway: 'A loop repeats its whole body the number of times you choose.' } },
  { id: 'debugging', title: 'Debugging', description: 'Use what happened to work out what to change.', status: 'available', challengeIds: ['fix-the-route', 'debug-short', 'debug-order'],
    lesson: { title: 'A bug is a clue', introduction: 'A program does not always do what you intended on the first try. A bug is a problem in the instructions. Debugging means finding that problem, making a change, and checking the result.',
      sections: [{ title: 'Start by watching', text: 'Run the supplied program. Notice the first step where Byte’s route differs from the route you wanted. The highlighted block shows which instruction is running.' }, { title: 'Make one useful change', text: 'A block might point the wrong way, be missing, or appear in the wrong place. Change the part your observation points to. A small change makes it easier to understand why the result changes.' }, { title: 'Test your repair', text: 'Run the program again. Did it reach the station? If not, compare the new feedback with the old feedback. Asking for a hint and trying again are both part of debugging.' }],
      example: { title: 'A missing step', steps: ['Move right', 'Move right', 'Add one more Move right'], explanation: 'If the station is three squares away and Byte stops after two, another rightward step finishes the route.' }, takeaway: 'Observe, change, test. Getting a first attempt wrong is useful information.' } },
  { id: 'variables', title: 'Variables', description: 'Store, change and reuse a number with Nova.', status: 'available', challengeIds: Array.from({ length: 10 }, (_, i) => `variables-${i + 1}`),
    lesson: { title: 'Nova’s treasure memory', introduction: 'Nova the Squirrel needs to remember a number. A variable is a named place to store a value. In this adventure, its name is score. Watch the score display as your blocks run.', sections: [{ title: 'SET puts a value in memory', text: 'Set score to 2 stores the number 2. Setting it again replaces the old number. Every new run starts fresh, so always SET score before reading or changing it.' }, { title: 'CHANGE updates the number', text: 'Change score by 1 adds one to the stored value. Change by -1 subtracts one. Repeating CHANGE with a loop counts up or down.' }, { title: 'Use the value', text: 'Move right by score steps reads the current value and moves that many squares. It does not use up or change score. If you update score, the next movement reads the new value. Finish at the star with the target score.' }], example: { title: 'Remember, update, use', steps: ['Set score to 2', 'Change score by 1', 'Move right by score steps'], explanation: 'Score starts at 2 and becomes 3. Nova moves three squares right. The value is still 3 afterwards.' }, takeaway: 'SET replaces a value. CHANGE updates it. Reading a variable leaves its value in memory.' } },
  { id: 'conditionals', title: 'Conditionals', description: 'Check a path and choose a branch with Milo.', status: 'available', challengeIds: Array.from({ length: 10 }, (_, i) => `conditionals-${i + 1}`),
    lesson: { title: 'Milo’s decision jungle', introduction: 'Milo the Monkey checks the path before choosing a move. A condition asks a yes-or-no question. IF path right is clear checks the square to Milo’s right at that moment.', sections: [{ title: 'IF runs when the answer is yes', text: 'Place a movement inside DO. If the checked path is clear, those instructions run. If it is blocked by a rock or the edge, DO is skipped. The next block after IF still runs.' }, { title: 'ELSE gives another choice', text: 'An IF / ELSE block has two branches. DO runs when the checked path is clear. ELSE runs when it is blocked. Only one branch runs each time; put instructions in both.' }, { title: 'Check from the current square', text: 'After Milo moves, the answer may change. Putting a decision inside Repeat checks again on every repetition. The direction you check and the direction you move are choices you make.' }], example: { title: 'Choose the clear route', steps: ['If path right is clear', '    Move right', 'Else', '    Move up'], explanation: 'With a rock to the right, Milo skips Move right and moves up instead. With a clear square to the right, only Move right runs.' }, takeaway: 'A conditional chooses which instructions run using a check made right now.' } },
  { id: 'project', title: 'Build project', description: 'Bring your ideas together in a route of your own.', status: 'available', challengeIds: ['rescue-project'],
    lesson: { title: 'Make a plan, then make it yours', introduction: 'Now you can use sequences, directions, loops, and debugging together. Your project is to choose a station and build a working route to it.', sections: [{ title: 'Choose your destination', text: 'Select a free square on the board to move the charging station. The starting square and the rock cannot be destinations.' }, { title: 'Build and improve', text: 'Make one working route, then see whether you can find a different one. You might replace repeated movements with a loop or take a different path around the rock.' }], example: { title: 'Your project plan', steps: ['Choose the destination', 'Build a route', 'Run and revise', 'Try another solution'], explanation: 'There is more than one way to solve this project. Explain one choice you made in your program.' }, takeaway: 'A program is something you can create, test, and improve.' } },
];

for (const module of modules.filter(m => ['sequences', 'directions', 'loops', 'debugging'].includes(m.id))) {
  const practiceIds = missions.filter(m => m.id.startsWith(`${module.id}-practice-`)).map(m => m.id);
  // Start the youngest learners with one step before longer sequences.
  module.challengeIds = module.id === 'sequences'
    ? [...practiceIds.slice(0, 2), ...module.challengeIds, ...practiceIds.slice(2)]
    : [...module.challengeIds, ...practiceIds];
}

for (const module of modules) {
  const character = characterFor(module.title);
  if (character.name === 'Byte') continue;
  const adapt = (s: string) => s.replaceAll('Byte', character.name).replaceAll('charging station', 'star');
  const l = module.lesson;
  module.lesson = { ...l, introduction: adapt(l.introduction), sections: l.sections.map(s => ({ title: s.title, text: adapt(s.text) })), example: { ...l.example, explanation: adapt(l.example.explanation) } };
}
const gradedModules = courses.flatMap(course => [...course.topics, 'project'].map(topic => {
  const base = modules.find(m => m.id === topic)!;
  return { ...base, id: `${course.id}-${topic}`, topicId: topic,
    description: `Grade ${course.grade} · ${course.size}×${course.size} board. ${base.description}`,
    challengeIds: topic === 'project' ? [`${course.id}-rescue-project`] : Array.from({ length: 10 }, (_, i) => `${course.id}-${topic}-${i + 1}`) };
}));
export function modulesFor(course: CourseId) { return course.startsWith('grade-') ? gradedModules.filter(m => m.id.startsWith(`${course}-`)) : modules; }
export function moduleFor(missionId: string): LearningModule { return [...modules, ...gradedModules].find(m => m.challengeIds.includes(missionId))!; }
export const challengeOrder = modules.flatMap(m => m.challengeIds);
export function nextChallenge(missionId: string) {
  const course = courses.find(c => missionId.startsWith(`${c.id}-`));
  const order = course ? modulesFor(course.id).flatMap(m => m.challengeIds) : challengeOrder;
  return order[order.indexOf(missionId) + 1];
}
export function missionIndex(id: string) { return missions.findIndex(m => m.id === id); }
