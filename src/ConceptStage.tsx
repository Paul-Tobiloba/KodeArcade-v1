import type { ReactNode, RefObject } from 'react';
import { Flag, Code2, ChevronDown } from 'lucide-react';
import type { Frame, Mission, Position, RunResult } from './learning';
import { conceptGameTitles } from './conceptGameState';
import { RescueIslands, SecretGates, RobotWorkshop } from './ConceptGames';
import useStageVisible from './useStageVisible';
import type { ConceptTrace } from './conceptTrace';
import { traceValue } from './conceptGameState';
import './concept-lab.css';

function ExpressionTrace({ trace }: { trace: ConceptTrace }) {
  return <li><code>{trace.label}</code><span> → {traceValue(trace)}</span>{trace.inputs?.length ? <ul>{trace.inputs.map((input, index) => <ExpressionTrace key={index} trace={input} />)}</ul> : null}</li>;
}

export default function ConceptStage({ stageRef, mission, position, result, running, arriving = false, runtimeNote, children, notice }: { stageRef: RefObject<HTMLElement | null>; mission: Mission; position: Position; result: RunResult | null; running: boolean; arriving?: boolean; runtimeNote?: string; children: ReactNode; notice?: ReactNode }) {
  const visible = useStageVisible(stageRef);
  const frame = running || arriving ? position as Frame : result?.frames.at(-1), task = mission.conceptTask!;
  const output = frame?.lab?.output ?? [];
  const Game = task.topic === 'operators' ? RescueIslands : task.topic === 'boolean' ? SecretGates : RobotWorkshop;
  return <section ref={stageRef} className="scene concept-stage" data-game={task.topic} data-active={visible && running} aria-label={`${mission.concept} results lab`}>
    {notice}<div className="scene-heading"><div className="stage-heading-copy"><h2><Flag size={20} />{conceptGameTitles[task.topic]}</h2><p className="goal">{mission.goal}</p></div></div>
    <Game mission={mission} frame={frame} completed={arriving || !!result?.success} />
    <p className="concept-game-status" role="status">{runtimeNote || frame?.note || 'Build your code, then press Play to bring the scene to life.'}</p>
    <div className="concept-stage-actions">{children}<details className="concept-results" onKeyDown={event => { if (event.key === 'Escape' && event.currentTarget.open) { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); event.stopPropagation(); } }}><summary>Results <ChevronDown size={16} aria-hidden="true" /></summary>
    <div className="concept-result-area" tabIndex={0} aria-label="Program results and trace"><h3><Code2 size={20} />Program results</h3><dl><div><dt>Goal</dt><dd>{task.score !== undefined ? `score = ${task.score}` : `Output: ${task.output?.map(String).join(', ')}`}</dd></div>{task.score !== undefined && <div><dt>Score value</dt><dd>{frame?.score ?? 'Not set'}</dd></div>}{task.topic === 'functions' && <div><dt>Function calls</dt><dd>{frame?.lab?.calls ?? 0}</dd></div>}</dl>
      <h3>Output</h3>{output.length ? <ol className="concept-output" aria-label="Program output">{output.map((value, index) => <li key={index}><code>{String(value)}</code><span>{typeof value === 'boolean' ? 'Boolean' : 'Number'}</span></li>)}</ol> : <p>No output yet. SHOW sends a value here; setting score only updates the value above.</p>}
      {(frame?.lab?.condition ?? frame?.lab?.expression) && <><h3>Expression trace</h3><ul className="concept-expression-trace"><ExpressionTrace trace={(frame!.lab!.condition ?? frame!.lab!.expression)!} /></ul></>}
      <p className="concept-trace">{runtimeNote || frame?.note || 'Predict the result, then press Play to trace your code.'}</p>
      {result && <p className={result.success ? 'concept-success' : 'concept-error'}>{result.message}</p>}
    </div></details></div>
  </section>;
}
