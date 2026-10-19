import type { ReactNode, RefObject } from 'react';
import { Flag, Code2 } from 'lucide-react';
import type { Frame, Mission, Position, RunResult } from './learning';
import './concept-lab.css';

export default function ConceptStage({ stageRef, mission, position, result, running, runtimeNote, children, notice }: { stageRef: RefObject<HTMLElement | null>; mission: Mission; position: Position; result: RunResult | null; running: boolean; runtimeNote?: string; children: ReactNode; notice?: ReactNode }) {
  const frame = running ? position as Frame : result?.frames.at(-1), task = mission.conceptTask!;
  const output = frame?.lab?.output ?? [];
  return <section ref={stageRef} className="scene concept-stage" aria-label={`${mission.concept} results lab`}>
    {notice}<div className="scene-heading"><div className="stage-heading-copy"><h2><Flag size={20} />{mission.title}</h2><p className="goal">{mission.goal}</p></div></div>
    <div className="concept-result-area" tabIndex={0} aria-label="Program results and trace"><h3><Code2 size={20} />Program results</h3><dl><div><dt>Goal</dt><dd>{task.score !== undefined ? `score = ${task.score}` : `Output: ${task.output?.map(String).join(', ')}`}</dd></div>{task.score !== undefined && <div><dt>Score value</dt><dd>{frame?.score ?? 'Not set'}</dd></div>}{task.topic === 'functions' && <div><dt>Function calls</dt><dd>{frame?.lab?.calls ?? 0}</dd></div>}</dl>
      <h3>Output</h3>{output.length ? <ol className="concept-output" aria-label="Program output">{output.map((value, index) => <li key={index}><code>{String(value)}</code><span>{typeof value === 'boolean' ? 'Boolean' : 'Number'}</span></li>)}</ol> : <p>No output yet. SHOW sends a value here; setting score only updates the value above.</p>}
      <p role="status" className="concept-trace">{runtimeNote || frame?.note || 'Predict the result, then press Play to trace your code.'}</p>
      {result && <p className={result.success ? 'concept-success' : 'concept-error'}>{result.message}</p>}
    </div>{children}
  </section>;
}
