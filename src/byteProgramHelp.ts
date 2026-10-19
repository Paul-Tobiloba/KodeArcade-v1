import { byteTopics, type ByteTopic } from '../shared/byte';
export type ByteProgram = { mode: 'blocks' | 'text'; relative?: boolean; workspace?: Record<string, unknown>; text?: string; requireLoop?: boolean; count?: number; limit?: number; outcome?: boolean | null };
type Block = { type?: string; next?: { block?: Block }; inputs?: Record<string, { block?: Block; shadow?: Block }> };
/** Inspect structure only. Never execute code, solve a route or send work to a server. */
export function byteProgramCheck(topic: ByteTopic, program?: ByteProgram): string {
  const general = program?.relative ? 'Trace position and facing from the initial right-facing direction. Forward follows the arrow; backward does not turn it. Turns happen in place. Check both again on each loop repetition.' : byteTopics[topic].check;
  if (!program) return general;
  if (program.outcome === true) return `Your last run reached its goal. Can you explain why your instructions worked? ${general}`;
  if (program.mode === 'blocks' && program.limit !== undefined && (program.count ?? 0) > program.limit) return `Your draft is above the ${program.limit}-instruction limit. Look for a repeated pattern you can put inside a loop; do not just remove needed steps. ${general}`;
  if (program.mode === 'text') {
    if (!program.text?.trim()) return 'Your program is empty. Start with one supported instruction, predict what it will do, then test it.';
    if (program.requireLoop && !/^\s*for \w+ in range\(/m.test(program.text)) return `This activity asks for a loop. Find the repeating part before writing more copies of an instruction. ${general}`;
    return `Check punctuation and the four-space indentation inside each group. ${general}`;
  }
  const saved = (program.workspace?.blocks as { blocks?: unknown } | undefined)?.blocks;
  const roots: Block[] = Array.isArray(saved) ? saved.filter(block => block && typeof block === 'object') : [];
  const start = roots.find(block => block.type === 'ka_start');
  if (!start?.next?.block) return 'No instructions are connected below “when Play is pressed”. Snap your first instruction underneath it. Floating blocks do not run.';
  if (roots.some(block => block.type !== 'ka_start')) return 'Some blocks are floating outside your connected program. Only instructions connected below the start block run. Check whether those loose blocks belong in your program.';
  let nodes = 0, emptyLoop = false, hasLoop = false;
  const visit = (block?: Block, depth = 0) => {
    if (!block || ++nodes > 250 || depth > 100) return;
    if (block.type === 'ka_repeat' || block.type === 'ka_draw_repeat') { hasLoop = true; if (!Object.values(block.inputs ?? {}).some(input => input?.block)) emptyLoop = true; }
    Object.values(block.inputs ?? {}).forEach(input => visit(input?.block, depth + 1));
    visit(block.next?.block, depth + 1);
  };
  visit(start);
  if (emptyLoop) return 'A Repeat block has no instructions inside it. Put the repeating pattern inside its “do” space, then check its count.';
  if (program.requireLoop && !hasLoop) return `This activity asks for a Repeat block. Find the repeating part before adding more copies. ${general}`;
  return `${program.outcome === false ? 'Your last run did not finish the goal. Change one thing, then test again. ' : 'Your instructions are connected. That does not guarantee the program reaches its goal. '}${general}`;
}
