import type { Mission } from './learning';

export const instructionLimit = (mission: Pick<Mission, 'maxBlocks'>) => mission.maxBlocks ?? 24;
export const limitMessage = (limit: number) => `Use no more than ${limit} instruction blocks or commands. Group repeated actions inside Repeat (a for loop in Text mode). The start block does not count.`;

type WrittenStatement = { body?: WrittenStatement[]; otherwise?: WrittenStatement[] };
/** Written instructions, including nested bodies, not execution steps. */
export function statementCount(nodes: WrittenStatement[]): number {
  return nodes.reduce((total, node) => total + 1 + statementCount(node.body ?? []) + statementCount(node.otherwise ?? []), 0);
}
