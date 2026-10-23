import { useState, type CSSProperties, type ReactNode } from 'react';
import { Check, LockKeyhole, UnlockKeyhole } from 'lucide-react';
import type { Frame, Mission } from './learning';
import { bridgeState, gateState, traceValue, workshopState } from './conceptGameState';
import byte from '../assets/plates/byte-actor.png';
import islands from '../assets/plates/island-world.png';
import plank from '../assets/plates/bridge-plank.png';
import supply from '../assets/plates/wood-supply.png';
import garden from '../assets/plates/gate-garden.png';
import door from '../assets/plates/garden-door.png';
import workshop from '../assets/plates/workshop-room.png';
import cell from '../assets/plates/energy-cell.png';

type Props = { mission: Mission; frame?: Frame; completed: boolean };

function World({ source, kind, children }: { source: string; kind: string; children: ReactNode }) {
  const [unavailable, setUnavailable] = useState(false);
  return <div className={`concept-game-space ${kind}`}><div className="concept-game-world">
    <img className="concept-world-art" src={source} alt="" draggable={false} onError={() => setUnavailable(true)} hidden={unavailable} />
    {children}
    {unavailable && <p className="concept-art-unavailable">The scene artwork could not load. Your code still works; open Results to follow it.</p>}
  </div></div>;
}

function Byte({ crossed = false }: { crossed?: boolean }) {
  return <img className="concept-byte" data-crossed={crossed} src={byte} alt={crossed ? 'Byte has crossed safely to the other island' : 'Byte is ready to help'} draggable={false} />;
}

export function RescueIslands({ mission, frame, completed }: Props) {
  const bridge = bridgeState(mission, frame, completed);
  const inputs = frame?.lab?.expression?.inputs;
  return <World source={islands} kind="rescue-islands">
    <div className="concept-scene-badge" aria-label="Bridge status">Bridge: <strong>{bridge.value === undefined ? 0 : bridge.value} / {bridge.target}</strong></div>
    <div className="concept-bridge" role="img" aria-label={`${bridge.planks} of ${bridge.target} bridge planks placed${bridge.extra ? `; ${bridge.extra} extra` : ''}`}>
      {Array.from({ length: bridge.target }, (_, index) => <img key={index} className="concept-plank" data-built={index < bridge.planks} src={plank} alt="" draggable={false} style={{ '--plank-x': `${35 + 29 * (index + .5) / bridge.target}%`, '--plank-y': `${63 - 30 * (index + .5) / bridge.target}%`, '--plank-order': index } as CSSProperties} />)}
    </div>
    <Byte crossed={bridge.crossed} />
    {[0, 1].map(index => <div className={`concept-supply supply-${index}`} key={index} aria-label={`Operand ${index + 1}: ${inputs?.[index]?.value ?? 'run your code to see it'}`}>
      <img src={supply} alt="" draggable={false} /><span>{inputs?.[index]?.value ?? '?'}</span>
    </div>)}
    <p className="concept-scene-message">{bridge.crossed ? 'You built a safe crossing!' : bridge.value === undefined ? 'Your code builds the bridge.' : !bridge.countable ? 'A bridge needs a whole, non-negative number of planks. Try a different calculation.' : bridge.extra ? `${bridge.extra} extra ${bridge.extra === 1 ? 'plank' : 'planks'}. Check your calculation.` : bridge.planks < bridge.target ? `${bridge.target - bridge.planks} more ${bridge.target - bridge.planks === 1 ? 'plank' : 'planks'} to reach the other island.` : 'The bridge fits. Use the instructions in the goal to help Byte cross.'}</p>
  </World>;
}

export function SecretGates({ mission, frame, completed }: Props) {
  const gate = gateState(mission, frame);
  const required = mission.conceptTask!.required;
  const operation = gate.expression?.kind ?? (required.includes('logic:or') ? 'or' : required.includes('logic:and') ? 'and' : required.includes('boolean_not') ? 'not' : 'comparison');
  const junction = operation === 'and' || operation === 'or' || operation === 'not' ? operation.toUpperCase() : 'CHECK';
  return <World source={garden} kind="secret-gates">
    <div className="concept-scene-badge">{gate.open ? <UnlockKeyhole size={16} /> : <LockKeyhole size={16} />}<strong>{gate.answer === undefined ? 'Gate waiting' : gate.open ? 'Gate open · True' : 'Gate closed · False'}</strong>{completed && <Check size={16} aria-label="Goal met" />}</div>
    <div className="concept-gate-doors" data-open={gate.open} aria-hidden="true"><span className="gate-leaf gate-leaf-left"><img src={door} alt="" draggable={false} /></span><span className="gate-leaf gate-leaf-right"><img src={door} alt="" draggable={false} /></span></div>
    {[0, 1].map(index => {
      const input = gate.switches[index], inactive = index === 1 && operation !== 'and' && operation !== 'or';
      const value = input?.value;
      return <div className={`concept-switch switch-${index}`} key={index} data-state={input?.skipped ? 'skipped' : value === true ? 'true' : value === false ? 'false' : 'waiting'}>
        <span className="concept-switch-label" title={input?.label}>{input?.label ?? (inactive ? 'Not needed' : `Switch ${index + 1}`)}</span>
        <span className="concept-switch-lens" aria-hidden="true">{value === true ? <Check /> : value === false ? <LockKeyhole /> : null}</span>
        <span className="concept-switch-answer">{inactive ? 'One input' : traceValue(input)}</span>
      </div>;
    })}
    <span className="concept-gate-junction">{junction}</span>
    <Byte />
    <p className="concept-scene-message">{completed ? gate.open ? 'Your logic opened the gate!' : 'False is the right answer. The gate stays safely closed.' : gate.answer === undefined ? gate.expected === false ? 'Can your comparison keep the gate safely closed?' : 'Your conditions control the gate.' : gate.expression?.inputs?.some(input => input.skipped) ? 'The first answer decided it. The other side was not evaluated.' : `The gate follows ${traceValue(gate.expression)}. Check the lesson goal before your next run.`}</p>
  </World>;
}

function EnergyCells({ value, ghost = false }: { value?: number | boolean; ghost?: boolean }) {
  const count = typeof value === 'number' && Number.isInteger(value) && value > 0 ? Math.min(value, 8) : 0;
  return <span className="concept-energy-cells" data-ghost={ghost} aria-hidden="true">{Array.from({ length: count }, (_, index) => <img key={index} src={cell} alt="" draggable={false} />)}{typeof value === 'number' && value > count && count > 0 && <small>+{value - count}</small>}</span>;
}

export function RobotWorkshop({ mission, frame, completed }: Props) {
  const machine = workshopState(mission, frame), current = machine.current;
  const lastOutput = machine.output.at(-1), target = machine.target[Math.min(machine.output.length, machine.target.length - 1)];
  const currentName = current?.name ?? 'Your function';
  return <World source={workshop} kind="robot-workshop">
    <div className="concept-scene-badge">Calls: <strong>{machine.calls}</strong>{completed && <Check size={16} aria-label="Goal met" />}</div>
    <Byte />
    <span className="concept-machine-name" title={currentName}>{currentName}</span>
    <div className="concept-input-cells"><EnergyCells value={current?.argument} /></div>
    <div className="concept-output-cells"><EnergyCells value={lastOutput ?? target} ghost={lastOutput === undefined} /></div>
    <span className="concept-tray-label input-label">{current?.phase === 'defined' || !current ? 'No call yet' : current.argument === undefined ? 'No input' : `Input: ${current.argument}`}</span>
    <span className="concept-tray-label output-label">{lastOutput === undefined ? `Target: ${machine.target.join(', ')}` : `Output: ${String(lastOutput)}`}</span>
    {current && <p className="concept-machine-event" key={`${frame?.step}-${current.phase}`} data-phase={current.phase}>
      {current.phase === 'defined' ? `${current.name} is defined. Call it to run its instructions.` : current.phase === 'returned' ? `${current.name} returned ${current.returned}.` : `Call ${current.name}(${current.argument ?? ''})`}
    </p>}
    <div className="concept-workshop-output" aria-label="Workshop output sequence"><span>Target: <code>{machine.target.join(' → ')}</code></span><span>Shown: <code>{machine.output.length ? machine.output.map(String).join(' → ') : 'Nothing yet'}</code></span></div>
    <p className="concept-scene-message">{completed ? 'Your reusable machine did the job!' : !current ? 'Define a function, then call it.' : current.phase === 'returned' && !machine.output.length ? 'RETURN gives a number back. SHOW sends it to the output tray.' : 'Each call runs the same instructions with its own input.'}</p>
  </World>;
}
