import type { ReactNode, RefObject } from 'react';
import { Flag, ArrowRight } from 'lucide-react';
import type { Frame, Mission, Position, RunResult } from './learning';
import { initialSprite, spriteNames, backdropNames, type SpriteSettings } from './spriteModel';
import './sprite-studio.css';
type Props = { stageRef: RefObject<HTMLElement | null>; mission: Mission; position: Position; result: RunResult | null; running: boolean; settings: SpriteSettings; onSettings: (scene: SpriteSettings) => void; onClick: () => void; children: ReactNode; notice?: ReactNode };
export default function SpriteStage({ stageRef, mission, position, result, running, settings, onSettings, onClick, children, notice }: Props) {
  const frame = running ? position as Frame : result?.frames.at(-1), sprite = frame?.sprite ?? initialSprite(settings);
  const style = { left: `${50 + sprite.x * .4}%`, top: `${50 - sprite.y * .4}%` };
  const change = (patch: Partial<SpriteSettings>) => onSettings({ ...settings, ...patch });
  return <section ref={stageRef} className="scene sprite-stage" aria-label="Creative coding stage">
    {notice}<div className="scene-heading"><div className="stage-heading-copy"><h2><Flag size={20} />{mission.title}</h2><p className="goal">{mission.goal}</p></div></div>
    <div className="sprite-stage-content" tabIndex={0} aria-label="Stage and character choices">
      <div className={`sprite-theatre backdrop-${sprite.background}`} role="group" aria-label={`${sprite.character} at x ${Math.round(sprite.x)}, y ${Math.round(sprite.y)}; ${sprite.buddy} at x ${sprite.buddyX}, y ${sprite.buddyY}. ${sprite.speech ? `Says: ${sprite.speech}` : ''}`}>
        {sprite.speech && <span className="sprite-bubble">{sprite.character}: {sprite.speech}</span>}<span className="sprite-buddy" style={{ left: `${50 + sprite.buddyX * .4}%`, top: `${50 - sprite.buddyY * .4}%` }}><span className="character-sprite world-sprite" style={{ backgroundImage: `url('/images/worlds/${sprite.buddy.toLowerCase()}.png')` }} aria-hidden="true" /><span>{sprite.buddy}</span></span>
        {sprite.visible && <button className="studio-character" disabled={running || !result} onClick={onClick} aria-label={`Click ${sprite.character} sprite`} style={style}>
          <span className="character-sprite world-sprite" style={{ backgroundImage: `url('/images/worlds/${sprite.character.toLowerCase()}.png')` }} aria-hidden="true" />
          <span className="sprite-direction"><ArrowRight size={20} style={{ transform: `rotate(${-sprite.angle}deg)` }} aria-hidden="true" />{sprite.character}</span>
        </button>}
      </div>
      <output className="sprite-readout" aria-label="Sprite state">x {Math.round(sprite.x)} · y {Math.round(sprite.y)} · facing {Math.round(sprite.angle)}° · score {frame?.score ?? 'not set'}</output>
      <fieldset className="sprite-choices" disabled={running}><legend>Make it yours</legend><label>Main character<select value={settings.character} onChange={e => change({ character: e.target.value as SpriteSettings['character'] })}>{spriteNames.map(name => <option key={name}>{name}</option>)}</select></label><label>Background<select value={settings.background} onChange={e => change({ background: e.target.value as SpriteSettings['background'] })}>{backdropNames.map(name => <option key={name}>{name}</option>)}</select></label><label>Other character<select value={settings.buddy} onChange={e => change({ buddy: e.target.value as SpriteSettings['buddy'] })}>{spriteNames.map(name => <option key={name}>{name}</option>)}</select></label>{(['buddyX', 'buddyY'] as const).map(key => <label key={key}>Other character {key === 'buddyX' ? 'x' : 'y'}<input type="number" min={-100} max={100} value={settings[key]} onChange={e => { const n = e.target.valueAsNumber; if (Number.isFinite(n) && Math.abs(n) <= 100) change({ [key]: n }); }} /></label>)}</fieldset>
      <p className="sprite-trace" role="status">{frame?.note ?? 'Press Play to start. Then click or tap your main character to test its click event.'}</p>
      {sprite.events.length > 0 && <p>Triggered events: {sprite.events.join(' → ')}</p>}
      {result && <p className={result.success ? 'concept-success' : 'concept-error'}>{result.message}</p>}
      {mission.conceptTask?.creative?.free && <p>Free build · no stars or required answer. Your draft saves with this course.</p>}
    </div>{children}
  </section>;
}
