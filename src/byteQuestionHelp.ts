import { byteQuestionAllowed, byteRedirect, byteTopics, type ByteTopic } from '../shared/byte';
import { byteProgramCheck, type ByteProgram } from './byteProgramHelp';

/** Bounded authored responses. Child questions and code never leave this device. */
export function localByteAnswer(question: string, topic: ByteTopic, goal: string, program?: ByteProgram) {
  if (!byteQuestionAllowed(question)) return byteRedirect;
  if (program?.relative && /\b(turns?|forward|backward|directions?|moves?|movement)\b/i.test(question)) return 'In this course, each run starts facing right. Forward follows the facing arrow; backward moves behind it without turning around. Left/right turns rotate 90° in place. A half turn is 180°; square-grid movement needs multiples of 90°. Check the arrow before the next movement.';
  if (/\b(functions?|returns?)\b/i.test(question)) return `${byteTopics.functions.explanation} ${byteTopics.functions.check}`;
  if (/\b(booleans?|logical|comparisons?)\b/i.test(question) || topic === 'boolean' && /\b(and|or|not)\b/i.test(question)) return `${byteTopics.boolean.explanation} ${byteTopics.boolean.check}`;
  if (/\b(operators?|operands?|arithmetic)\b/i.test(question)) return `${byteTopics.operators.explanation} ${byteTopics.operators.check}`;
  if (/\b(objects?|propert(?:y|ies))\b/i.test(question)) return `${byteTopics.objects.explanation} ${byteTopics.objects.check}`;
  if (/\b(statements?|arguments?|parameters?)\b/i.test(question)) return `${byteTopics.statements.explanation} ${byteTopics.statements.check}`;
  if (/\b(list|array)s?\b/i.test(question)) return 'A list or array stores several values in order. Each value has a position (often starting at 0). Try writing three items and pointing to the first, second and third before using a loop to visit them.';
  if (/\b(task|goal|carrot|gate|bridge)s?\b/i.test(question)) return `${goal} Predict one step, test it, then compare the result with your goal. Use the activity hints for a route-specific nudge.`;
  if (/\b(stuck|wrong|check|broken|debug|bug|fix|error)s?\b/i.test(question)) return byteProgramCheck(topic, program);
  const selected: ByteTopic = /\b(loop|repeat)s?\b/i.test(question) ? 'loops' : /\b(if|else|condition|conditional)s?\b/i.test(question) ? 'conditionals' : /\b(variable|score|set|change)s?\b/i.test(question) ? 'variables' : /\b(draw|drawing|pen|pencil|turn)s?\b/i.test(question) ? 'drawing' : /\b(direction|move|movement)s?\b/i.test(question) ? 'directions' : /\b(sequence|order|instruction)s?\b/i.test(question) ? 'sequences' : topic;
  return `${byteTopics[selected].explanation} ${byteTopics[selected].check}`;
}
