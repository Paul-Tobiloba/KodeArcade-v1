import { useState, type CSSProperties, type RefObject, type ReactNode } from 'react';
import { Flag, MapPin, Grid2X2, Sparkles, Carrot, Leaf, Nut, KeyRound, DoorClosed, DoorOpen, Fence } from 'lucide-react';
import { same, type Frame, type Mission, type Position, type RunResult } from './learning';
import { characterFor, worldGoals } from './characters';
import CharacterSprite from './CharacterSprite';
import useStageVisible from './useStageVisible';
type Props = { stageRef: RefObject<HTMLElement | null>; mission: Mission; position: Position; step: number; score?: number; runtimeNote?: string; result: RunResult | null; running: boolean; arriving?: boolean; onChooseEnd: (end: Position) => void; children: ReactNode; notice?: ReactNode };
export default function MissionStage({ stageRef, mission, position, step, score, runtimeNote, result, running, arriving = false, onChooseEnd, children, notice }: Props) {
  const project = mission.id.endsWith('rescue-project');
  const character = characterFor(mission.concept);
  const [coordinates, setCoordinates] = useState(false);
  const visible = useStageVisible(stageRef);
  const celebrating = arriving || !!result?.success;
  const state = celebrating ? 'success' : running ? 'running' : result ? 'retry' : 'ready';
  const destination = mission.collectOnly ? `Collect ${mission.collectibles?.positions.length ?? 0} carrots` : worldGoals[character.name];
  const destinationDescription = mission.collectOnly ? 'Collect every carrot; no finish tile is required.' : `Destination (${destination}): row ${mission.end.y + 1}, column ${mission.end.x + 1}.`;
  const trailDescription = mission.trail ? `Follow path tiles in order: ${mission.trail.map((p,i) => `${i+1}: row ${p.y+1}, column ${p.x+1}`).join('; ')}. Holes: ${mission.holes?.map(p => `row ${p.y+1}, column ${p.x+1}`).join('; ')}.` : '';
  const frame = running || arriving ? position as Partial<Frame> : result?.frames.at(-1);
  const collected = frame?.collected ?? [];
  const gateOpen = frame?.gateOpen ?? !mission.gate?.locked;
  const bridgeBuilt = frame?.bridgeBuilt ?? !!mission.river?.built;
  const Item = ({ carrot: Carrot, leaf: Leaf, acorn: Nut, key: KeyRound, banana: Leaf })[mission.collectibles?.kind ?? 'carrot'];
  const terrain = (index: number, width = mission.size) => {
    const x = index % width, y = Math.floor(index / width);
    if (x >= width - 2 && y >= Math.ceil(width * .6)) return 'water';
    return (x * 11 + y * 7) % 13 === 0 ? 'rocks' : 'hedge';
  };
  return <section ref={stageRef} className="scene tile-scene" aria-label={`${character.name} challenge board`} data-character={character.name} data-state={state} data-motion-paused={!visible} style={{ '--world-atlas': `url('/images/worlds/${character.name.toLowerCase()}.png')`, '--map-size': mission.size } as CSSProperties}>
    {notice}
    <div className="scene-heading"><div className="stage-heading-copy"><h2><Flag size={20} /> {mission.title}</h2><p className="goal">{mission.goal}</p></div><CharacterSprite concept={mission.concept} />{mission.variables && <output className="score-display" aria-label="Current score">score: {score ?? 'not set'} / {mission.targetScore}</output>}</div>
    <div className="world-status"><span className="character-world">{character.title} · {character.world}</span><span className="world-destination"><MapPin size={14} />{destination}</span></div>
    {!!mission.collectibles?.positions.length && <output className="collection-progress" aria-label="Collected items">{mission.collectibles.kind}: {collected.length} / {mission.collectibles.positions.length} collected</output>}
    <div className="board-surround"><div className="tile-map"><div className="board" style={{ '--board-size': mission.size } as CSSProperties} role="group" aria-label={`${mission.size} by ${mission.size} board. ${character.name} starts at row ${mission.start.y + 1}, column ${mission.start.x + 1}. ${destinationDescription} ${trailDescription} ${mission.collectibles ? `${mission.collectibles.kind} positions: ${mission.collectibles.positions.map(p => `row ${p.y+1}, column ${p.x+1}`).join('; ')}.` : ''} ${mission.gate ? `Gate at row ${mission.gate.position.y+1}, column ${mission.gate.position.x+1}: ${gateOpen ? 'open' : 'locked'}.` : ''} ${mission.river ? `River at row ${mission.river.position.y+1}, column ${mission.river.position.x+1}: ${bridgeBuilt ? 'bridge built' : 'no bridge'}.` : ''}`}>
      {Array.from({ length: mission.size * mission.size }, (_, index) => {
        const cell = { x: index % mission.size, y: Math.floor(index / mission.size) };
        const wall = mission.walls.some(w => same(w, cell)); const goal = !mission.collectOnly && same(cell, mission.end);
        const hole = mission.holes?.some(p => same(p,cell));
        const trailIndex = mission.trail?.findIndex(p => same(p,cell)) ?? -1;
        const river = !!mission.river && same(cell,mission.river.position);
        const gate = !!mission.gate && same(cell,mission.gate.position);
        const item = mission.collectibles?.positions.some(p => same(p,cell) && !collected.some(c => same(c,p)));
        const content = <><span className={`tile-art terrain-${river && !bridgeBuilt ? 'water' : hole ? 'path' : wall ? terrain(index) : 'path'}`} />{hole && <span className="trail-hole" />}{trailIndex >= 0 && <span className="path-marker">{trailIndex + 1}</span>}{item && <Item className={`collectible collectible-${mission.collectibles!.kind}`} fill="currentColor" aria-hidden="true" />}{gate && (gateOpen ? <DoorOpen className="world-object gate-open" aria-hidden="true"/> : <DoorClosed className="world-object gate-locked" aria-hidden="true"/>)}{river && bridgeBuilt && <Fence className="world-object river-bridge" aria-hidden="true"/>}{goal && <><span className="goal-beacon" /><span className="destination-sprite" />{celebrating && <span className="goal-celebration">{[0,1,2,3].map(i => <Sparkles key={i} style={{ '--spark': i } as CSSProperties} />)}</span>}</>}{!wall && !goal && result?.frames.some(f => same(f, cell)) && <span className="trail-dot" />}{coordinates && <span className="cell-coordinate">{cell.y + 1},{cell.x + 1}</span>}</>;
        const className = `cell ${wall ? 'rock' : ''} ${goal ? 'station' : ''}`;
        return project ? <button key={index} className={className} disabled={running || wall || same(cell, mission.start)} onClick={() => onChooseEnd(cell)} aria-label={`Set station to row ${cell.y + 1}, column ${cell.x + 1}${goal ? ', current station' : wall ? ', rock' : ''}`}>{content}</button> : <div key={index} className={className} aria-hidden="true">{content}</div>;
      })}
      <div className="robot-position" style={{ '--x': position.x, '--y': position.y } as CSSProperties} aria-hidden="true"><span className="character-ground-shadow" /><span key={`${mission.id}-${celebrating ? 'arrival' : running ? step : 'rest'}`} className={`character-motion ${frame?.fell ? 'is-fallen' : ''} ${running && step > 0 && !celebrating ? 'is-stepping' : ''}`}><CharacterSprite concept={mission.concept} />{running && step > 0 && !celebrating && <span className="step-dust" />}</span></div>
    </div></div>{runtimeNote && <span className="runtime-note" role="status">{runtimeNote}</span>}</div>
    <div className="world-toolbar"><span>{celebrating ? mission.collectOnly ? `All ${collected.length} carrots collected!` : character.name === 'Byte' ? 'Recharged! Great instructions!' : `${character.name} made it! Great instructions!` : running ? `Step ${step} · Watch ${character.name}!` : project ? 'Choose a clear tile for your destination' : mission.collectOnly ? 'Check, collect, or follow the path.' : 'One command. One square.'}</span><button aria-pressed={coordinates} onClick={() => setCoordinates(v => !v)}><Grid2X2 size={15} />Rows & columns</button></div>
    <div className="position-readout" aria-live="polite" aria-atomic="true">{running ? `Watch ${character.name}! ${step ? `Step ${step}: row ${position.y + 1}, column ${position.x + 1}.` : 'Getting ready…'}` : `${character.name}: row ${position.y + 1}, column ${position.x + 1}. ${step ? `${step} steps run.` : 'Ready when you are.'}`}</div>
    {children}
    <details className="board-description"><summary>Read the board as text</summary><p>Rows count from top to bottom. Columns count from left to right. Start: row {mission.start.y + 1}, column {mission.start.x + 1}. {destinationDescription} {trailDescription} {mission.walls.length ? `Blocked tiles: ${mission.walls.map(w => `row ${w.y + 1}, column ${w.x + 1}`).join('; ')}.` : 'There are no blocked tiles.'}</p></details>
  </section>;
}
