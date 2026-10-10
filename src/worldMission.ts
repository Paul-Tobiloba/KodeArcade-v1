import * as Blockly from 'blockly/core';
import { evaluateWorkspace } from './blockly';
import { gradeSolutions } from './gradeMissions';
import { directions, runProgram, same, type Direction, type Mission, type Position } from './learning';

const delta: Record<Direction, Position> = { right: { x: 1, y: 0 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, up: { x: 0, y: -1 } };
const key = (p: Position) => `${p.x},${p.y}`;
const inside = (p: Position, size: number) => p.x >= 0 && p.y >= 0 && p.x < size && p.y < size;

function referenceRun(mission: Mission) {
  const solution = gradeSolutions[mission.id];
  if (solution) {
    const ws = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: solution } }] } }, ws);
      return evaluateWorkspace(ws, mission);
    } finally { ws.dispose(); }
  }
  if (mission.solution && !mission.conditionals && !mission.variables) return runProgram(mission, mission.solution.map((direction, i) => ({ id: `reference-${i}`, kind: direction, direction, count: 1 })), { usedLoop: true });
  return null;
}

/** One semantic map drives painted terrain, movement and conditional checks. */
export function worldMission(mission: Mission, layout: 'tiles-v1' | 'open-v1' = 'open-v1'): Mission {
  if (layout !== 'tiles-v1' || mission.id.endsWith('rescue-project') || mission.replaces) return mission;
  const reference = referenceRun(mission);
  if (reference && !reference.success) return mission;
  // Without an authored reference, do not narrow the routes described by old hints.
  if (!reference) return mission;
  const path = [mission.start, ...reference.frames];
  if (!path.length) return mission;
  const open = new Set([...path, mission.end].map(key));
  // Preserve the original debugging evidence, including its supplied wrong turn.
  let p = mission.start;
  for (const d of mission.starter) {
    const next = { x: p.x + delta[d].x, y: p.y + delta[d].y };
    if (!inside(next, mission.size) || mission.walls.some(w => same(w, next))) break;
    open.add(key(next)); p = next;
  }
  // Preserve adjacent clearance evidence on every conditional test square.
  if (mission.conditionals) for (const p of path) for (const d of directions) {
    const next = { x: p.x + delta[d].x, y: p.y + delta[d].y };
    if (inside(next, mission.size) && !mission.walls.some(w => same(w, next))) open.add(key(next));
  }
  const walls = Array.from({ length: mission.size ** 2 }, (_, i) => ({ x: i % mission.size, y: Math.floor(i / mission.size) })).filter(p => !open.has(key(p)));
  const transformed = { ...mission, walls };
  if (reference && !referenceRun(transformed)?.success) return mission;
  return transformed;
}
