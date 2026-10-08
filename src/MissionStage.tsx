import type { CSSProperties, RefObject, ReactNode } from 'react';
import { Flag, Mountain, Star } from 'lucide-react';
import { same, type Mission, type Position, type RunResult } from './learning';
import { characterFor } from './characters';
import CharacterSprite from './CharacterSprite';
type Props = { stageRef: RefObject<HTMLElement | null>; mission: Mission; position: Position; step: number; score?: number; runtimeNote?: string; result: RunResult | null; running: boolean; onChooseEnd: (end: Position) => void; children: ReactNode; notice?: ReactNode };
export default function MissionStage({ stageRef, mission, position, step, score, runtimeNote, result, running, onChooseEnd, children, notice }: Props) {
  const project = mission.id.endsWith('rescue-project');
  const character = characterFor(mission.concept);
  return <section ref={stageRef} className="scene" aria-label={`${character.name} challenge board`} data-character={character.name}>
    {notice}
    <div className="scene-heading"><h2><Flag size={17} /> {mission.title}</h2>{mission.variables && <output className="score-display" aria-label="Current score">score: {score ?? 'not set'} / {mission.targetScore}</output>}</div>
    <p className="goal">{mission.goal}</p>
    <div className="board-surround" style={{ '--world-x': `${character.column * 50}%`, '--world-y': `${character.row * 100}%` } as CSSProperties}><span className="character-world">{character.title} · {character.world}</span>{runtimeNote && <span className="runtime-note" role="status">{runtimeNote}</span>}<div className="board" style={{ '--board-size': mission.size } as CSSProperties} role="group" aria-label={`${mission.size} by ${mission.size} board. ${character.name} starts at row ${mission.start.y + 1}, column ${mission.start.x + 1}. Station at row ${mission.end.y + 1}, column ${mission.end.x + 1}.`}>
      {Array.from({ length: mission.size * mission.size }, (_, index) => {
        const cell = { x: index % mission.size, y: Math.floor(index / mission.size) };
        const wall = mission.walls.some(w => same(w, cell)); const goal = same(cell, mission.end);
        const content = wall ? <Mountain aria-hidden="true" size={30} /> : goal ? <Star aria-hidden="true" size={28} fill="currentColor" /> : result?.frames.some(f => same(f, cell)) ? <span className="trail-dot" /> : null;
        const className = `cell ${wall ? 'rock' : ''} ${goal ? 'station' : ''}`;
        return project ? <button key={index} className={className} disabled={running || wall || same(cell, mission.start)} onClick={() => onChooseEnd(cell)} aria-label={`Set station to row ${cell.y + 1}, column ${cell.x + 1}${goal ? ', current station' : wall ? ', rock' : ''}`}>{content}</button> : <div key={index} className={className} aria-hidden="true">{content}</div>;
      })}
      <div className="robot-position" style={{ '--x': position.x, '--y': position.y } as CSSProperties} aria-hidden="true">{character.name !== 'Byte' ? <CharacterSprite concept={mission.concept} /> : <div className={`robot ${result?.success ? 'happy' : ''}`}><div className="antenna" /><div className="robot-face"><i /><i /></div><div className="robot-feet"><i /><i /></div></div>}</div>
    </div></div>
    <div className="board-legend"><span><span className="legend-byte" /> {character.name}</span><span><Star size={17} /> {character.name === 'Byte' ? 'Charging station' : 'Star'}</span>{mission.walls.length > 0 && <span><Mountain size={17} /> Rock</span>}</div>
    <div className="position-readout" aria-live="polite" aria-atomic="true">{running ? `Watch ${character.name}! ${step ? `Step ${step}: row ${position.y + 1}, column ${position.x + 1}.` : 'Getting ready…'}` : `${character.name}: row ${position.y + 1}, column ${position.x + 1}. ${step ? `${step} steps run.` : 'Ready when you are.'}`}</div>
    {result?.success && <p className="byte-celebration"><Star size={19} fill="currentColor" />{character.name === 'Byte' ? 'Island recharged! Byte says thank you.' : `${character.name} reached the star!`}</p>}
    {children}
    <details className="board-description"><summary>Read the board as text</summary><p>Rows count from top to bottom. Columns count from left to right. Start: row {mission.start.y + 1}, column {mission.start.x + 1}. Station: row {mission.end.y + 1}, column {mission.end.x + 1}. {mission.walls.length ? `Rocks: ${mission.walls.map(w => `row ${w.y + 1}, column ${w.x + 1}`).join('; ')}.` : 'There are no rocks.'}</p></details>
  </section>;
}
