import { useState, type CSSProperties, type RefObject, type ReactNode } from 'react';
import { Flag, MapPin, Grid2X2 } from 'lucide-react';
import { same, type Mission, type Position, type RunResult } from './learning';
import { characterFor, worldGoals } from './characters';
import CharacterSprite from './CharacterSprite';
type Props = { stageRef: RefObject<HTMLElement | null>; mission: Mission; position: Position; step: number; score?: number; runtimeNote?: string; result: RunResult | null; running: boolean; onChooseEnd: (end: Position) => void; children: ReactNode; notice?: ReactNode };
export default function MissionStage({ stageRef, mission, position, step, score, runtimeNote, result, running, onChooseEnd, children, notice }: Props) {
  const project = mission.id.endsWith('rescue-project');
  const character = characterFor(mission.concept);
  const [coordinates, setCoordinates] = useState(false);
  const destination = worldGoals[character.name];
  const terrain = (index: number, width = mission.size) => {
    const x = index % width, y = Math.floor(index / width);
    if (x >= width - 2 && y >= Math.ceil(width * .6)) return 'water';
    return (x * 11 + y * 7) % 13 === 0 ? 'rocks' : 'hedge';
  };
  return <section ref={stageRef} className="scene tile-scene" aria-label={`${character.name} challenge board`} data-character={character.name} style={{ '--world-atlas': `url('/images/worlds/${character.name.toLowerCase()}.png')`, '--map-size': mission.size } as CSSProperties}>
    {notice}
    <div className="scene-heading"><div className="stage-heading-copy"><h2><Flag size={20} /> {mission.title}</h2><p className="goal">{mission.goal}</p></div><CharacterSprite concept={mission.concept} />{mission.variables && <output className="score-display" aria-label="Current score">score: {score ?? 'not set'} / {mission.targetScore}</output>}</div>
    <div className="world-status"><span className="character-world">{character.title} · {character.world}</span><span className="world-destination"><MapPin size={14} />{destination}</span></div>
    <div className="board-surround"><div className="tile-map"><div className="board" style={{ '--board-size': mission.size } as CSSProperties} role="group" aria-label={`${mission.size} by ${mission.size} board. ${character.name} starts at row ${mission.start.y + 1}, column ${mission.start.x + 1}. Station at row ${mission.end.y + 1}, column ${mission.end.x + 1}. Destination: ${destination}.`}>
      {Array.from({ length: mission.size * mission.size }, (_, index) => {
        const cell = { x: index % mission.size, y: Math.floor(index / mission.size) };
        const wall = mission.walls.some(w => same(w, cell)); const goal = same(cell, mission.end);
        const content = <><span className={`tile-art terrain-${wall ? terrain(index) : 'path'}`} />{goal && <span className="destination-sprite" />}{!wall && !goal && result?.frames.some(f => same(f, cell)) && <span className="trail-dot" />}{coordinates && <span className="cell-coordinate">{cell.y + 1},{cell.x + 1}</span>}</>;
        const className = `cell ${wall ? 'rock' : ''} ${goal ? 'station' : ''}`;
        return project ? <button key={index} className={className} disabled={running || wall || same(cell, mission.start)} onClick={() => onChooseEnd(cell)} aria-label={`Set station to row ${cell.y + 1}, column ${cell.x + 1}${goal ? ', current station' : wall ? ', rock' : ''}`}>{content}</button> : <div key={index} className={className} aria-hidden="true">{content}</div>;
      })}
      <div className="robot-position" style={{ '--x': position.x, '--y': position.y } as CSSProperties} aria-hidden="true"><CharacterSprite concept={mission.concept} /></div>
    </div></div>{runtimeNote && <span className="runtime-note" role="status">{runtimeNote}</span>}</div>
    <div className="world-toolbar"><span>{running ? `Step ${step} · Watch ${character.name}!` : result?.success ? 'Destination reached!' : project ? 'Choose a clear tile for your destination' : 'One command. One square.'}</span><button aria-pressed={coordinates} onClick={() => setCoordinates(v => !v)}><Grid2X2 size={15} />Rows & columns</button></div>
    <div className="position-readout" aria-live="polite" aria-atomic="true">{running ? `Watch ${character.name}! ${step ? `Step ${step}: row ${position.y + 1}, column ${position.x + 1}.` : 'Getting ready…'}` : `${character.name}: row ${position.y + 1}, column ${position.x + 1}. ${step ? `${step} steps run.` : 'Ready when you are.'}`}</div>
    {children}
    <details className="board-description"><summary>Read the board as text</summary><p>Rows count from top to bottom. Columns count from left to right. Start: row {mission.start.y + 1}, column {mission.start.x + 1}. Destination ({destination}): row {mission.end.y + 1}, column {mission.end.x + 1}. {mission.walls.length ? `Blocked tiles: ${mission.walls.map(w => `row ${w.y + 1}, column ${w.x + 1}`).join('; ')}.` : 'There are no blocked tiles.'}</p></details>
  </section>;
}
