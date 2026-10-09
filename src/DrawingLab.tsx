import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Code2, Flag, Play, RotateCcw, Square, X } from 'lucide-react';
import { drawProgram, drawingMatches, penPath, type PenPoint } from './textCoding';
import { drawingActivities, drawingSaveKey, type DrawingActivity } from './drawingActivities';
import BlockEditor, { type EditorHandle } from './BlockEditor';
import TextEditor from './TextEditor';
import FeedbackDialog from './FeedbackDialog';
import { challengeStars } from './rewards';
import type { Mission } from './learning';
import type { SoundCue } from './sound';

const start: PenPoint = { x: 150, y: 260, heading: 0, line: 0 };
type Work = { code?: string; workspace?: Record<string,unknown>; blockCode?: string; mode?: 'blocks'|'text'; complete?: boolean; ink?: string; width?: number; attempts?: number; stars?: number };
export function readDrawingWork(grade: string, id: string): Work {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(drawingSaveKey(grade,id)) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const v = value as Record<string,unknown>;
    return { code: typeof v.code === 'string' ? v.code.slice(0,10000) : undefined, blockCode: typeof v.blockCode === 'string' ? v.blockCode.slice(0,10000) : undefined, workspace: v.workspace && typeof v.workspace === 'object' && !Array.isArray(v.workspace) ? v.workspace as Record<string,unknown> : undefined, mode: v.mode === 'text' ? 'text' : 'blocks', complete: v.complete === true, ink: ['#6d4aff','#08796e','#b53e75'].includes(String(v.ink)) ? String(v.ink) : '#6d4aff', width: [2,4,6].includes(Number(v.width)) ? Number(v.width) : 4, attempts: Math.max(0,Math.min(1000,Number(v.attempts)||0)), stars: Math.max(0,Math.min(5,Number(v.stars)||0)) };
  } catch { return {}; }
}
type Props = { grade: string; selected: number; reduced: boolean; hint: number; onSelect: (index: number) => void; onComplete: () => void; onRunning: (running: boolean) => void; onCelebrating: (open: boolean) => void; onSound: (cue: SoundCue) => void };
export default function DrawingLab(props: Props) {
  const activity = drawingActivities[props.grade][props.selected];
  return <DrawingChallenge key={`${props.grade}-${activity.id}`} {...props} activity={activity}/>;
}
function DrawingChallenge({ grade, selected, activity, reduced, hint, onSelect, onComplete, onRunning, onCelebrating, onSound }: Props & { activity: DrawingActivity }) {
  const supportsText = grade === 'grade-5' || grade === 'grade-6', young = grade === 'grade-1' || grade === 'grade-2';
  const [saved] = useState(() => readDrawingWork(grade,activity.id));
  const [code,setCode] = useState(() => {
    if (saved.code !== undefined) return saved.code;
    const previous = ({'grade-3':'square','grade-4':'triangle','grade-5':'hexagon','grade-6':'octagon'} as Record<string,string>)[grade];
    try { return previous === activity.id ? localStorage.getItem(`kodearcade-drawing-v1-${grade}`)?.slice(0,10000) ?? '' : ''; } catch { return ''; }
  });
  const [mode,setMode] = useState<'blocks'|'text'>(supportsText && !saved.workspace && saved.blockCode === undefined ? 'text' : supportsText ? saved.mode ?? 'text' : 'blocks');
  const [workspace,setWorkspace] = useState(saved.workspace);
  const [blockCode,setBlockCode] = useState(saved.blockCode ?? (!supportsText ? code : ''));
  const [count,setCount] = useState(0), [ink,setInk] = useState(saved.ink ?? '#6d4aff'), [width,setWidth] = useState(saved.width ?? 4);
  const [points,setPoints] = useState<PenPoint[]>([start]), [running,setRunning] = useState(false), [message,setMessage] = useState('Dash is ready. The small arrow shows which way he will draw.');
  const [toast,setToast] = useState(''), [warning,setWarning] = useState(''), [tools,setTools] = useState(false), [guide,setGuide] = useState(false);
  const [feedback,setFeedback] = useState(false), [reward,setReward] = useState(5);
  const complete = useRef(saved.complete === true), attempts = useRef(saved.attempts ?? 0), best = useRef(saved.stars ?? 0);
  const editor = useRef<EditorHandle>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = useMemo(() => activity.free ? [] : drawProgram(activity.reference),[activity]);
  const mission = useMemo<Mission>(() => ({id:`drawing-${grade}-${activity.id}`,title:activity.title,concept:'Drawing',description:activity.objective,goal:activity.objective,size:5,start:{x:0,y:0},end:{x:0,y:0},walls:[],loops:true,starter:[],hints:[],reflection:''}),[grade,activity]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); onRunning(false); },[onRunning]);
  useEffect(() => { onCelebrating(feedback); return () => onCelebrating(false); },[feedback,onCelebrating]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''),3000); return () => clearTimeout(id); },[toast]);
  useEffect(() => { if (hint) setGuide(true); },[hint]);
  function persist() {
    try { localStorage.setItem(drawingSaveKey(grade,activity.id),JSON.stringify({code,workspace,blockCode,mode,ink,width,complete:complete.current,attempts:attempts.current,stars:best.current})); setWarning(''); }
    catch { setWarning('Your drawing cannot save in this browser. Keep this tab open.'); }
  }
  useEffect(() => { persist(); /* Persist tool-only choices as well as code changes. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[grade,activity.id,code,workspace,blockCode,mode,ink,width,feedback]);
  function stop() { if (timer.current) clearTimeout(timer.current); setRunning(false); onRunning(false); editor.current?.highlight(''); }
  function retry(text: string) { setMessage(text); setToast(text); onSound('retry'); }
  function run() {
    if (running) { stop(); setMessage('Drawing stopped. Your code is unchanged.'); return; }
    attempts.current++; setToast(''); setGuide(false);
    try {
      const source = mode === 'text' ? code : editor.current?.drawingCode?.() ?? '';
      const frames = drawProgram(source);
      if (!frames.some(p => p.draw)) { retry('Add a forward block or command so Dash can draw a line.'); return; }
      // Reveal the ink under the moving pencil, rather than teleporting to
      // each command's endpoint. Bound visual frames independently of code.
      const pieces = reduced ? 1 : Math.max(1,Math.min(8,Math.floor(600/frames.length)));
      const visual = frames.flatMap((point,index) => {
        if (!index || !point.draw) return [point];
        const previous = frames[index-1];
        return Array.from({length:pieces},(_,part) => ({...point,x:previous.x+(point.x-previous.x)*(part+1)/pieces,y:previous.y+(point.y-previous.y)*(part+1)/pieces}));
      });
      let i = 0; setPoints([start]); setRunning(true); onRunning(true); setMessage('Watch Dash draw your instructions.');
      const interval = Math.max(16,Math.min(reduced ? 80 : 70,10000/visual.length));
      function advance() {
        i++; setPoints(visual.slice(0,i+1)); editor.current?.highlight(`line-${visual[i]?.line ?? 1}`);
        if (visual[i]?.draw && i % Math.max(1,Math.ceil(visual.length/20)) === 0) onSound('move');
        if (i < visual.length-1) timer.current = setTimeout(advance,interval);
        else {
          stop();
          if (activity.free || drawingMatches(frames,target)) {
            complete.current = true; const stars = challengeStars(attempts.current,0); best.current = Math.max(best.current,stars); setReward(stars);
            persist(); setMessage(`${activity.title} complete! Dash followed your instructions.`); setFeedback(true); onSound('success'); onComplete();
          } else retry('Compare Dash’s lines with the dotted target. Change your code and try again.');
        }
      }
      timer.current = setTimeout(advance,100);
    } catch (error) { stop(); retry(error instanceof Error ? error.message : 'Check your drawing instructions.'); }
  }
  const lastPoint = points[points.length-1];
  return <>
    <div className="workspace-grid drawing-workspace">
      <section className="scene drawing-scene" aria-label="Dash drawing challenge" data-character="Dash">
        {toast && <div className="retry-toast" role="status"><div><strong>A little adjustment</strong><p>{toast}</p></div><span aria-hidden="true">3s</span><button aria-label="Dismiss retry message" onClick={() => setToast('')}><X size={20}/></button></div>}
        <div className="scene-heading"><h2><Flag size={17}/>{activity.title}</h2></div><p className="goal">{activity.objective}</p>
        <div className="drawing-artboard">
          <svg viewBox="0 0 400 400" role="img" aria-label={`White drawing artboard. ${activity.title}: Dash with a pencil, dotted target and your drawn lines`}>
            {target.length > 0 && <path d={penPath(target)} fill="none" stroke="#68738b" strokeWidth="2" strokeDasharray="5 5"/>}
            <path className="drawing-ink" d={penPath(points)} fill="none" stroke={ink} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"/>
            <g className="drawing-dash" data-x={lastPoint.x} data-y={lastPoint.y}>
              <image href="/images/dash-pencil.png" x={lastPoint.x-66} y={lastPoint.y-65} width="70" height="65" preserveAspectRatio="none"/>
              <path className="drawing-heading-pointer" d="M 5 -4 L 13 0 L 5 4 Z" fill="#08796e" transform={`translate(${lastPoint.x} ${lastPoint.y}) rotate(${lastPoint.heading})`}/>
            </g>
          </svg>
        </div>
        <p className="position-readout" role="status">{message}</p>
        <div className="run-controls"><button className="primary run-button" aria-label={running ? 'Stop run' : 'Run code'} onClick={run}>{running ? <Square size={22}/> : <Play size={22} fill="currentColor"/>}{running ? 'Stop' : 'Play'}</button><button className="clear-button" disabled={running} onClick={() => { if (mode === 'blocks') editor.current?.clear(); else setCode(''); setPoints([start]); setMessage('Dash is ready for a new plan.'); }}><RotateCcw size={17}/>Clear code</button><button className="stage-tool" aria-label="Drawing tools" aria-expanded={tools} onClick={() => setTools(!tools)}>Tools</button></div>
        {tools && <div className="drawing-tools-popover"><div className="dialog-heading"><h3>Pencil tools</h3><button aria-label="Close drawing tools" onClick={() => setTools(false)}><X size={18}/></button></div><div className="drawing-tools" role="group" aria-label="Drawing tools"><span>Ink</span>{[['Violet','#6d4aff'],['Teal','#08796e'],['Berry','#b53e75']].map(([name,color]) => <button key={color} aria-label={`${name} ink`} aria-pressed={ink===color} style={{background:color}} onClick={() => setInk(color)}><Check size={16} style={{visibility:ink===color ? 'visible' : 'hidden'}}/></button>)}<label>Pen<select aria-label="Pen width" value={width} onChange={e => setWidth(Number(e.target.value))}><option value={2}>Fine</option><option value={4}>Medium</option><option value={6}>Bold</option></select></label></div></div>}
      </section>
      <section className="editor" aria-label="Code editor"><div className="editor-title"><h2><Code2 size={20}/>Your code</h2>{supportsText ? <div className="coding-mode" aria-label="Coding mode"><button aria-pressed={mode==='blocks'} disabled={running} onClick={() => setMode('blocks')}>Blocks</button><button aria-pressed={mode==='text'} disabled={running} onClick={() => setMode('text')}>Text</button></div> : <span>{count} / 24 blocks</span>}</div>
        {mode === 'text' ? <TextEditor ref={editor} code={code} mission={mission} drawing={activity.reference || 'forward(40)\nturn(90)'} running={running} onChange={setCode}/> : <BlockEditor ref={editor} mission={mission} initial={workspace} legacy={[]} running={running} drawing={{code:blockCode,step:activity.step,turn:activity.turn,repeats:grade==='grade-1' ? undefined : activity.repeats ?? 4,advanced:activity.advanced,young}} onChange={(state,n) => { setWorkspace(state); setCount(n); try { setBlockCode(editor.current?.drawingCode?.() ?? blockCode); } catch { /* Keep disconnected blocks saved for repair. */ } }} onError={setWarning}/>}
        <p className="sr-only">Optional drawing practice saves separately. It does not grant core challenge mastery.</p>
      </section>
    </div>
    {warning && <p className="warning" role="alert">{warning}</p>}
    {guide && <section className="game-help" aria-label="Drawing help"><div className="dialog-heading"><h2>Drawing with Dash</h2><button aria-label="Close drawing help" onClick={() => setGuide(false)}><X size={20}/></button></div><p>{activity.objective}</p><p>Forward follows the small arrow. Turn changes the direction. Dotted lines show the target.</p><details><summary>Grown-up help & example</summary><pre>{activity.reference || 'forward(40)\nturn(90)'}</pre><p>Drawing supports up to 500 operations, three nested groups and 2–12 repeats. This is a bounded teaching language, not full Python.</p></details></section>}
    <FeedbackDialog open={feedback} stars={reward} message={`${activity.title} complete! Dash followed your instructions.`} reduced={reduced} nextTitle={drawingActivities[grade][selected+1]?.title} onStar={() => onSound('star')} onClose={() => setFeedback(false)} onNext={() => { setFeedback(false); if (selected < drawingActivities[grade].length-1) onSelect(selected+1); }}/>
  </>;
}
