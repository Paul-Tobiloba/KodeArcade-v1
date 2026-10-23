export type TypingKind = 'keys' | 'copy' | 'game' | 'story' | 'edit' | 'create' | 'review' | 'check';
export type TypingActivity = { id: string; grade: number; unit: number; number: number; title: string; kind: TypingKind; instruction: string; target: string; initial: string; rounds: string[]; minWords: number; independent: boolean };
export type TypingUnit = { id: string; title: string; keys: string; words: string[]; passage: string; activities: TypingActivity[] };
export type TypingCourse = { grade: number; id: string; title: string; description: string; units: TypingUnit[] };
type Seed = [title: string, keys: string, words: string, passage: string];
const seeds: Seed[][] = [
  [
    ['Keyboard discovery', 'fj ', 'f j fj jf', 'f j\nj f'],
    ['F and J friends', 'fj ', 'ff jj fj jf', 'ff jj fj jf'],
    ['Home-key neighbours', 'asdfjkl; ', 'sad lad fall ask', 'a sad lad'],
    ['Top-row left', 'qwert ', 'red tree wet sweet', 'a red tree'],
    ['Top-row right', 'yuiop ', 'you our top toy', 'our red toy'],
    ['Bottom-row left', 'zxcvb ', 'cat box cab cave', 'a cat by a box'],
    ['Bottom-row right', 'nm,. ', 'moon name mix mum', 'a cat on a mat.'],
    ['Little word builders', 'abcdefghijklmnopqrstuvwxyz ', 'sun fish book bird', 'a red fish in a pond.'],
    ['Phrases and greetings', 'HIm,. ', 'Hello friend happy kind', 'Hello, my friend.'],
    ['My first typing adventure', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ. ', 'I can type note', 'I can type a short note.'],
  ],
  [
    ['Find your starting point', 'asdfjkl; ', 'sad lad fall ask', 'a lad asks dad'],
    ['Top-row control', 'qwertyuiop ', 'tree quiet yellow pet', 'our quiet pet plays'],
    ['Bottom-row confidence', 'zxcvbnm ', 'box zebra moon van', 'a zebra by a van'],
    ['Word families', 'abcdefghijklmnopqrstuvwxyz ', 'bell shell tall small', 'a small shell on the sand'],
    ['Spaces and rhythm', ' ', 'we can read and type', 'we can read and type'],
    ['Capital starts', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ. ', 'The We I My', 'The little bird can sing.'],
    ['Everyday lists', '\n', 'bread milk apples rice', 'bread\nmilk\napples'],
    ['Sentence builders', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ. ', 'bright garden yellow flower', 'A yellow flower grows in the garden.'],
    ['Story steps', '. ', 'cat sat red mat', 'The cat sat on a red mat. It saw a bird.'],
    ['My typing showcase', '. ', 'friend read kind note', 'My friend can read my kind note.'],
  ],
  [
    ['Keyboard confidence', 'abcdefghijklmnopqrstuvwxyz ', 'steady hands gentle rhythm', 'steady hands find a gentle rhythm'],
    ['Word patterns', 'abcdefghijklmnopqrstuvwxyz ', 'little letter green happy', 'a little green tree near a happy home'],
    ['Capitals and full stops', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ. ', 'The River Garden Park', 'The river flows past the garden.'],
    ['Questions and commas', ',? ', 'Who What Where Why', 'Where are the red, blue and green books?'],
    ['Apostrophes in context', "' ", "can't it's Sam's don't", "It is Sam's kite. It can't fly without wind."],
    ['Numbers around us', '0123456789/- ', '12 24 36 2026', 'We counted 12 birds and 24 bright leaves.'],
    ['Connected sentences', '\n. ', 'First Next Then Finally', 'First, open the book.\nNext, read a short page.'],
    ['Read and discover', '. ', 'plant roots leaves water', 'A plant has roots and leaves. The roots take in water.'],
    ['Repair workshop', 'abcdefghijklmnopqrstuvwxyz. ', 'careful correct replace check', 'Careful writers check each word before they finish.'],
    ['My typed story', '. ', 'forest path bird nest', 'A bird found a quiet tree. It built a little nest.'],
  ],
  [
    ['Reliable letter control', 'abcdefghijklmnopqrstuvwxyz ', 'reliable practice careful transitions', 'careful practice makes familiar letters easier to find'],
    ['Confident Shift', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!? ', 'Welcome Thank You Great', 'Welcome! Can you find the correct Shift key?'],
    ['Punctuation in sentences', ",.'?! ", 'Really Where Yes Please', "Really? Yes, the little boat is here!"],
    ['Numbers and measurements', '0123456789:/. ', '10:30 15/06 25cm 8kg', 'At 10:30, we measured a plant that was 25 cm tall.'],
    ['Sentence flow', ',. ', 'because while after before', 'The rain stopped, and the children went outside to play.'],
    ['Paragraph building', '\n', 'topic details paragraph idea', 'The school garden is a peaceful place.\nSmall flowers grow beside the path.'],
    ['Stories and dialogue', '"', 'said asked replied smiled', '"Look at the sky," said Ada. "The birds are coming home."'],
    ['Useful everyday text', '0123456789:.-\n', 'notice schedule list steps', 'Garden club\nTuesday at 14:00\nBring a notebook and a pencil.'],
    ['Editing toolkit', 'abcdefghijklmnopqrstuvwxyz ', 'select replace undo revise', 'Replace one word carefully, then read the whole sentence again.'],
    ['My information page', '.\n', 'heading paragraph explain review', 'Bees visit flowers to collect food.\nAs they move, they can carry pollen between flowers.'],
  ],
  [
    ['Personal typing goals', 'abcdefghijklmnopqrstuvwxyz ', 'accuracy rhythm transitions confidence', 'Choose one useful practice target and work on it carefully.'],
    ['Punctuation control', '"()\',. ', 'interview speaker question answer', '"What did you notice?" asked the guide. "A tiny nest," I replied.'],
    ['Symbols and number text', '0123456789:%+-=/() ', '25% 18:45 12cm 3+4=7', 'At 18:45, the team recorded 12 cm of growth (25% more than before).'],
    ['Paragraph fluency', '.\n', 'observation change detail explain', 'Water can change from a liquid to a gas.\nWe can describe what we observe without guessing what we cannot see.'],
    ['Story and description', ',." ', 'quiet lantern journey doorway', 'A small lantern lit the quiet doorway. Beyond it, a new journey was waiting.'],
    ['Practical instructions', '0123456789.\n', 'prepare measure record compare', '1. Prepare a clear space.\n2. Measure the paper.\n3. Record what you notice.'],
    ['Messages and summaries', ':,. ', 'message summary request announcement', 'Please bring a notebook to the reading club. We will meet after lunch in the library.'],
    ['Efficient editing', 'abcdefghijklmnopqrstuvwxyz ', 'select replace recover organise', 'A useful edit improves the text without changing its meaning.'],
    ['Revision studio', 'abcdefghijklmnopqrstuvwxyz,. ', 'clear precise revise explain', 'Read the draft carefully, replace an unclear word, and check the punctuation.'],
    ['My writing collection', '.\n', 'reflect evidence improve choose', 'My collection shows careful copying, useful editing and a piece of original writing.'],
  ],
  [
    ['Start where you are', 'abcdefghijklmnopqrstuvwxyz ', 'independence evidence reflection accuracy', 'Choose a realistic goal, practise deliberately, and reflect on the result.'],
    ['Mixed-text control', '0123456789:;%()[]+-=/ ', '08:30 45% [note] 12+8=20', 'Record 08:30 as the start time, then label the result [sample A] (45%).'],
    ['Comfortable writing flow', 'abcdefghijklmnopqrstuvwxyz,. ', 'steady sustainable accurate fluent', 'A steady rhythm leaves room to notice a mistake and correct it without rushing.'],
    ['Reports and explanations', '.\n', 'evidence observation conclusion detail', 'Our group observed the garden over three days.\nThis report separates what we saw from what we still need to investigate.'],
    ['Creative writing', ',."!? ', 'character setting dialogue atmosphere', '"Did you hear that?" Mira whispered. A soft tapping came from the other side of the gate.'],
    ['Practical communication', ':,.\n', 'subject greeting request update', 'Subject: Reading club update\nHello team,\nPlease bring your draft to our next meeting. Thank you.'],
    ['Notes, lists and summaries', '-:\n', 'main detail concise structure', 'Main idea: protect the garden.\n- Water the young plants.\n- Keep the path clear.'],
    ['Independent editing', 'abcdefghijklmnopqrstuvwxyz ', 'navigate select revise recover', 'Navigate to the unclear phrase, make a useful replacement, and recover any accidental edit.'],
    ['Personal mastery studio', 'abcdefghijklmnopqrstuvwxyz,. ', 'review compare reflect improve', 'Compare similar tasks fairly. A thoughtful correction is part of learning, not a reason to give up.'],
    ['My independent portfolio', '.\n', 'copy edit compose reflect', 'My portfolio includes a copied passage, a revised draft and an original piece.\nI can explain one improvement and choose my next practice target.'],
  ],
];
const titles = ['Keyboard explorers', 'Home-row heroes', 'Word builders', 'Sentence makers', 'Fluent writers', 'Independent typists'];
const descriptions = ['Find letters, follow the highlighted keys and make your first words.', 'Build both-hand confidence with words and little stories.', 'Connect words, punctuation and numbers in useful text.', 'Shape sentences and paragraphs, then edit with care.', 'Find a steady rhythm in practical writing and revision.', 'Copy, edit and compose independently with a personal portfolio.'];
const roleTitles = ['Meet the keys', 'Follow the key guide', 'Mix and match', 'Recall and return', 'Read and type', 'Use it', 'Key garden', 'Story steps', 'Repair it', 'Personal practice', 'Independent check', 'Make something'];
function activities(grade: number, unit: number, seed: Seed, previous?: Seed): TypingActivity[] {
  const [title, keys, words, passage] = seed, vocabulary = words.split(' ').filter(Boolean);
  const characters = Array.from(new Set((keys.replace(/\s/g, '') || words.replace(/\s/g, '')).split(''))).slice(0, 8);
  const keyLine = (characters.length ? characters : ['f', 'j']).join(' ');
  const alternate = [...characters.slice(0, 4), ...characters.slice(0, 4).reverse()].join(' ');
  const young = grade === 1 && unit < 7;
  const kinds: TypingKind[] = ['keys', 'keys', 'keys', 'keys', 'copy', 'copy', 'game', 'story', 'edit', 'review', 'check', young ? 'copy' : 'create'];
  return kinds.map((kind, index) => {
    const target = index === 0 || index === 1 ? keyLine : index === 2 || index === 3 ? alternate : index === 4 ? words : index === 9 ? (previous?.[2] ?? words) : passage;
    const editable = target.replace(/\n/g, '\n');
    const instruction = kind === 'edit' ? 'This draft has one extra character. Move the caret or use Backspace to make it match the model. You can use selection and undo.' : kind === 'create' ? `Make a short ${grade < 3 ? 'message' : grade < 5 ? 'paragraph' : 'piece of writing'} about ${title.toLowerCase()}. Use fictional details. There is no single correct answer.` : kind === 'game' ? 'Grow your key garden: type each displayed word or pattern to help the next plant grow. There is no countdown.' : kind === 'story' ? 'Reveal the story one step at a time. Type each supplied part to continue.' : kind === 'check' ? 'Try this short check independently. You can turn the guide on if you need it; practice and best stars are kept.' : kind === 'keys' ? 'Follow the highlighted key and finger. Type the pattern carefully; use Backspace whenever you need.' : 'Read the model, then type it carefully. Accuracy matters more than speed.';
    return { id: `typing-g${grade}-u${String(unit + 1).padStart(2, '0')}-a${String(index + 1).padStart(2, '0')}`, grade, unit, number: unit * 12 + index + 1, title: `${roleTitles[index]} · ${title}`, kind, instruction, target: editable, initial: kind === 'edit' ? editable.slice(0, Math.min(3, editable.length)) + editable.charAt(Math.min(2, editable.length - 1)) + editable.slice(Math.min(3, editable.length)) : '', rounds: kind === 'game' ? vocabulary.slice(0, 6) : kind === 'story' ? (young ? vocabulary : passage.split(/(?<=[.!?])\s+|\n/).filter(Boolean)) : [], minWords: grade < 3 ? 3 : grade === 3 ? 6 : grade === 4 ? 10 : grade === 5 ? 15 : 20, independent: kind === 'check' };
  });
}
export const typingCourses: TypingCourse[] = seeds.map((units, i) => ({ grade: i + 1, id: `grade-${i + 1}`, title: titles[i], description: descriptions[i], units: units.map((seed, unit) => ({ id: `typing-g${i + 1}-u${String(unit + 1).padStart(2, '0')}`, title: seed[0], keys: seed[1], words: seed[2].split(' '), passage: seed[3], activities: activities(i + 1, unit, seed, units[unit - 1]) })) }));
export function typingCourse(grade: number) { return typingCourses[Math.max(0, Math.min(5, Math.floor(grade) - 1))]; }
export function typingActivities(grade: number) { return typingCourse(grade).units.flatMap(unit => unit.activities); }
export function typingActivity(id: string) { const grade = Number(/^typing-g([1-6])-/.exec(id)?.[1]); return grade ? typingActivities(grade).find(activity => activity.id === id) : undefined; }
