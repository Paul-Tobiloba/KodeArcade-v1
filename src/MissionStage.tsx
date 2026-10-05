import type { CSSProperties, RefObject } from 'react';
import { BatteryCharging, Flag, Mountain, Square } from 'lucide-react';
import { same, type Mission, type Position, type RunResult } from './learning';
type Props = { stageRef: RefObject<HTMLElement | null>; mission: Mission; position: Position; step: number; result: RunResult | null; running: boolean; onChooseEnd: (end: Position) => void; onStop: () => void };
export default function MissionStage({ stageRef, mission, position, step, result, running, onChooseEnd, onStop }: Props) {
  const project = mission.id === 'rescue-project';
  return <section ref={stageRef} className="scene" aria-label="Robot board">
    <div className="scene-heading"><h2><Flag size={17} /> Your challenge</h2></div>
    <p className="goal">{mission.goal}</p>
    <div className="board-surround"><div className="board" role="group" aria-label={`5 by 5 board. Byte starts at row ${mission.start.y + 1}, column ${mission.start.x + 1}. Station at row ${mission.end.y + 1}, column ${mission.end.x + 1}.`}>
      {Array.from({ length: 25 }, (_, index) => {
        const cell = { x: index % 5, y: Math.floor(index / 5) };
        const wall = mission.walls.some(w => same(w, cell)); const goal = same(cell, mission.end);
        const content = wall ? <Mountain aria-hidden="true" size={30} /> : goal ? <BatteryCharging aria-hidden="true" size={28} /> : result?.frames.some(f => same(f, cell)) ? <span className="trail-dot" /> : null;
        const className = `cell ${wall ? 'rock' : ''} ${goal ? 'station' : ''}`;
        return project ? <button key={index} className={className} disabled={running || wall || same(cell, mission.start)} onClick={() => onChooseEnd(cell)} aria-label={`Set station to row ${cell.y + 1}, column ${cell.x + 1}${goal ? ', current station' : wall ? ', rock' : ''}`}>{content}</button> : <div key={index} className={className} aria-hidden="true">{content}</div>;
      })}
      <div className="robot-position" style={{ '--x': position.x, '--y': position.y } as CSSProperties} aria-hidden="true"><div className={`robot ${result?.success ? 'happy' : ''}`}><div className="antenna" /><div className="robot-face"><i /><i /></div><div className="robot-feet"><i /><i /></div></div></div>
    </div></div>
    <div className="board-legend"><span><span className="legend-byte" /> Byte</span><span><BatteryCharging size={17} /> Charging station</span>{mission.walls.length > 0 && <span><Mountain size={17} /> Rock</span>}</div>
    <div className="position-readout" aria-live="polite" aria-atomic="true">{running ? 'Running your instructions…' : `Byte: row ${position.y + 1}, column ${position.x + 1}. ${step ? `${step} steps run.` : 'Ready when you are.'}`}</div>
    {running && <button className="stage-stop secondary" onClick={onStop}><Square size={15} />Stop animation</button>}
    <details className="board-description"><summary>Read the board as text</summary><p>Rows count from top to bottom. Columns count from left to right. Start: row {mission.start.y + 1}, column {mission.start.x + 1}. Station: row {mission.end.y + 1}, column {mission.end.x + 1}. {mission.walls.length ? `Rocks: ${mission.walls.map(w => `row ${w.y + 1}, column ${w.x + 1}`).join('; ')}.` : 'There are no rocks.'}</p></details>
  </section>;
}
