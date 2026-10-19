import { useId, useState, type CSSProperties } from 'react';
import type { StudioPrompt, StudioScene } from './studioEngine';

const placement = (x: number, y: number): CSSProperties => ({ left: `${50 + x * .35}%`, top: `${50 - y * .35}%` });
/** Runtime strings are React text nodes, never markup or persisted answers. */
export function StudioWorldOverlay({ scene }: { scene: StudioScene | null }) {
  return <>
    {scene?.labels?.map((label, index) => <span className="studio-printed-text" key={`${label.id}-${index}`} style={placement(label.location.x, label.location.y)}>{label.text}</span>)}
    {scene?.title && <div className="studio-title-screen"><h2>{scene.title.title}</h2><p>{scene.title.subtitle}</p></div>}
    {scene?.actors.flatMap(actor => actor.monitors.filter(name => actor.monitorPositions?.[name]).map(name => {
      const at = actor.monitorPositions![name];
      return <output className="studio-positioned-counter" key={`${actor.id}-${name}`} style={placement(at.x, at.y)}>{actor.name} · {name}: {actor.variables[name]}</output>;
    }))}
  </>;
}
function Question({ prompt, onAnswer }: { prompt: StudioPrompt; onAnswer: (id: string, answer: string) => void }) {
  const [answer, setAnswer] = useState(''), id = useId();
  return <form className="studio-question" aria-label="Project question" onSubmit={event => { event.preventDefault(); onAnswer(prompt.id, answer); }}>
    <p id={id}>{prompt.question}</p>
    <small>Use a made-up answer. Don’t enter personal details. Answers disappear when the run resets.</small>
    {prompt.choices.length ? <div className="studio-question-choices" role="group" aria-labelledby={id}>{prompt.choices.map(choice => <button type="button" key={choice} onClick={() => onAnswer(prompt.id, choice)}>{choice}</button>)}</div> : <><label htmlFor={`${id}-answer`}>Your answer</label><input id={`${id}-answer`} autoFocus autoComplete="off" maxLength={120} value={answer} onChange={event => setAnswer(event.target.value)} /><button type="submit">Answer</button></>}
  </form>;
}
export function StudioQuestion({ scene, onAnswer }: { scene: StudioScene | null; onAnswer: (id: string, answer: string) => void }) {
  const prompt = scene?.prompts?.[0];
  return prompt ? <Question key={prompt.id} prompt={prompt} onAnswer={onAnswer} /> : null;
}
export function studioTint(color?: string) {
  if (!color) return undefined;
  const [r,g,b] = [1,3,5].map(index => parseInt(color.slice(index, index + 2), 16) / 255), max = Math.max(r,g,b), min = Math.min(r,g,b), delta = max - min;
  const hue = !delta ? 0 : max === r ? ((g - b) / delta) * 60 : max === g ? ((b - r) / delta + 2) * 60 : ((r - g) / delta + 4) * 60;
  return !delta ? `grayscale(1) brightness(${.5 + max})` : `sepia(1) saturate(5) hue-rotate(${hue - 45}deg)`;
}
