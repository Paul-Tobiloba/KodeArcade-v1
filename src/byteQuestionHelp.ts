import { byteQuestionAllowed, byteRedirect, byteTopics, type ByteTopic } from '../shared/byte';
import { byteProgramCheck, type ByteProgram } from './byteProgramHelp';

/** Bounded authored responses. Child questions and code never leave this device. */
export function localByteAnswer(question: string, topic: ByteTopic, goal: string, program?: ByteProgram) {
  if (!byteQuestionAllowed(question)) return byteRedirect;
  if (/\b(list|array)s?\b/i.test(question)) return 'A list or array stores several values in order. Each value has a position (often starting at 0). Try writing three items and pointing to the first, second and third before using a loop to visit them.';
  if (/\b(task|goal|carrot|gate|bridge)s?\b/i.test(question)) return `${goal} Predict one step, test it, then compare the result with your goal. Use the activity hints for a route-specific nudge.`;
  if (/\b(stuck|wrong|check|broken|debug|bug|fix|error)s?\b/i.test(question)) return byteProgramCheck(topic, program);
  const selected: ByteTopic = /\b(loop|repeat)s?\b/i.test(question) ? 'loops' : /\b(if|else|condition|conditional)s?\b/i.test(question) ? 'conditionals' : /\b(variable|score|set|change)s?\b/i.test(question) ? 'variables' : /\b(draw|drawing|pen|pencil|turn)s?\b/i.test(question) ? 'drawing' : /\b(direction|move|movement)s?\b/i.test(question) ? 'directions' : /\b(sequence|order|instruction)s?\b/i.test(question) ? 'sequences' : topic;
  return `${byteTopics[selected].explanation} ${byteTopics[selected].check}`;
}
