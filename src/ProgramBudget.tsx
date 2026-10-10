import type { Mission } from './learning';
import { parseCode } from './textCoding';
import { instructionLimit, statementCount } from './programLimits';

export default function ProgramBudget({ mission, count, code, drawing = false, showCount = true }: { mission: Mission; count: number; code?: string; drawing?: boolean; showCount?: boolean }) {
  if (mission.maxBlocks === undefined) return null;
  let written: number | undefined = count;
  if (code !== undefined) {
    try { written = statementCount(parseCode(code, drawing)); } catch { written = undefined; }
  }
  const limit = instructionLimit(mission);
  return <p className="program-budget" data-full={written !== undefined && written > limit} role="status">
    {showCount && <strong>{written ?? '—'} / {limit} {code === undefined ? 'blocks' : 'instructions'}</strong>}
    <span>{written !== undefined && written > limit ? 'Over the limit. ' : written === limit ? 'Limit reached. ' : ''}Group repeated actions with {code === undefined ? 'Repeat' : 'a for loop'}. {code === undefined ? 'Start does not count.' : 'Count written commands, not repeated steps.'}</span>
  </p>;
}
