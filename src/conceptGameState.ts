import type { Frame, Mission } from './learning';
import type { ConceptTrace } from './conceptTrace';

export const conceptGameTitles = { operators: 'Rescue Islands', boolean: 'Secret Gates', functions: 'Robot Workshop', creative: 'Creative studio' } as const;

/** The pictures are bounded; the reported value is never rounded or clamped. */
export function bridgeState(mission: Mission, frame?: Frame, completed = false) {
  const target = mission.conceptTask?.score ?? 0;
  const value = frame?.score;
  const countable = value !== undefined && Number.isInteger(value) && value >= 0;
  const planks = countable ? Math.min(value, target) : 0;
  return { target, value, planks, countable, extra: countable ? Math.max(0, value - target) : 0, crossed: completed && value === target };
}

/** A numeric branch result is not itself a Boolean. Use the evaluated condition. */
export function gateState(mission: Mission, frame?: Frame) {
  const expression = typeof frame?.lab?.expression?.value === 'boolean' ? frame.lab.expression : frame?.lab?.condition;
  const answer = typeof expression?.value === 'boolean' ? expression.value : [...(frame?.lab?.output ?? [])].reverse().find(value => typeof value === 'boolean');
  const expected = mission.conceptTask?.output?.find(value => typeof value === 'boolean');
  return { answer, expected, open: answer === true, expression, switches: expression && ['and', 'or', 'not'].includes(expression.kind) ? expression.inputs ?? [] : expression ? [expression] : [] };
}

export function traceValue(trace?: ConceptTrace): string {
  return trace?.skipped ? 'Not evaluated' : trace?.value === undefined ? 'Waiting' : typeof trace.value === 'boolean' ? trace.value ? 'True' : 'False' : String(trace.value);
}

export function workshopState(mission: Mission, frame?: Frame) {
  const evidence = frame?.lab;
  return { calls: evidence?.calls ?? 0, definitions: evidence?.definitions ?? [], current: evidence?.function, output: evidence?.output ?? [], target: mission.conceptTask?.output ?? [] };
}
