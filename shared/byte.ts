/** Authored learning help, not generated responses or a general chat knowledge base. */
export const byteTopics = {
  sequences: { title: 'Sequences', explanation: 'A sequence is a set of instructions in order. The first connected instruction runs first, then the next. Changing the order can change what happens.', check: 'Trace your connected instructions from the start, one at a time. Does each instruction match what you want to happen next?' },
  directions: { title: 'Direction & order', explanation: 'Up, down, left and right refer to the screen. Each movement goes one square. The order matters when an obstacle blocks the way.', check: 'Check the next square before each move. If it is blocked, rethink the order rather than adding more moves into the obstacle.' },
  loops: { title: 'Loops', explanation: 'A loop repeats the instructions inside it. Repeat 3 times runs the whole inside pattern three times in total—not once plus three extra times.', check: 'Find the smallest repeating pattern. Check both the instructions inside Repeat and its count. An empty Repeat has nothing to run.' },
  conditionals: { title: 'Conditionals', explanation: 'A condition asks a yes-or-no question right now. IF runs its inside instructions when the answer is yes. ELSE runs its other instructions when the answer is no.', check: 'Check the question from the character’s current square. Trace the yes branch and the no branch separately; only one runs each time.' },
  debugging: { title: 'Debugging', explanation: 'Debugging means finding a problem, making a useful change and testing again. A failed run gives you a clue—it is not a reason to start everything over.', check: 'Watch the first place your program does something unexpected. Inspect that instruction, change one thing, then test again.' },
  variables: { title: 'Variables', explanation: 'A variable remembers a value. SET replaces the value, CHANGE updates it, and reading it does not use it up. Set score before changing or using it.', check: 'Write down score after each SET or CHANGE. A movement that reads score uses its value at that moment.' },
  project: { title: 'Build project', explanation: 'A project combines ideas you have practised. Plan a small part, build it, test it and improve it. More than one program can work.', check: 'Break your plan into small parts. Test one part before combining it with the rest. Look for repeated instructions that a loop could express.' },
  drawing: { title: 'Drawing', explanation: 'Forward follows the pencil’s arrow and draws when the pen is down. Turn changes the direction of the next line; a turn does not draw a line itself.', check: 'Compare the first place your line differs from the target. Check the distance, turn direction and turn angle there. For a repeating shape, inspect the loop body.' },
} as const;
export type ByteTopic = keyof typeof byteTopics;
export type ByteAction = 'explain' | 'goal' | 'debug';
export const byteRedirect = 'I help with coding and this activity. Choose a lesson question or ask about a coding idea.';
export function byteTopic(concept: string): ByteTopic {
  return ({ Sequences: 'sequences', 'Direction & order': 'directions', Loops: 'loops', Conditionals: 'conditionals', Debugging: 'debugging', Variables: 'variables', 'Build project': 'project', Drawing: 'drawing' } as Record<string, ByteTopic>)[concept] ?? 'sequences';
}
// Deliberately conservative prototype filters, NOT a child-safety guarantee.
const privateOrUnsafe = /https?:|www\.|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\d[\d ()+-]{6,}\d|\b(password|credential|address|phone|email|my name|real name|api.?key|secret|token|suicide|kill|weapon|sex|porn|drug|politic|religion|dating|football|weather|recipe|celebrity)\b/i;
const instructionAttack = /\b(ignore|disregard|override|pretend|roleplay|jailbreak|system prompt|developer message|previous instructions|full solution|complete solution|solve for me|do my homework)\b|[<>`\u0000-\u001f\u007f]/i;
const coding = /\b(code|coding|program(?:s|ming)?|blocks?|loops?|repeats?|sequences?|debug(?:ging)?|bugs?|variables?|score|conditions?|conditionals?|if|else|moves?|movement|directions?|instructions?|drawing|pencil|pen|turns?|gates?|bridges?|carrots?|activit(?:y|ies)|arrays?|lists?)\b/i;
export function byteQuestionAllowed(question: string) {
  return question.length >= 8 && question.length <= 300 && coding.test(question) && !privateOrUnsafe.test(question) && !instructionAttack.test(question);
}
export function byteAnswerAllowed(answer: string) {
  return answer.length >= 8 && answer.length <= 900 && coding.test(answer) && !privateOrUnsafe.test(answer) && !instructionAttack.test(answer);
}
