import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { AppElement, AppProject, ElementKind } from '../shared/appLab';
import type { AppScene } from './appLabRuntime';
import { Smartphone } from 'lucide-react';

type Props = { project: AppProject; scene: AppScene | null; screen: string; designing: boolean; selected: string; onSelect: (id: string) => void; onMove: (id: string, x: number, y: number) => void; onAdd: (kind: ElementKind, x: number, y: number) => void; onEvent: (id: string, type: 'click' | 'change', value?: string | number | boolean) => void };
export default function AppLabPreview({ project, scene, screen, designing, selected, onSelect, onMove, onAdd, onEvent }: Props) {
  const host = useRef<HTMLDivElement>(null), drag = useRef<{ id: string; x: number; y: number; originX: number; originY: number; pointer: number } | null>(null);
  const [scale, setScale] = useState(1);
  const activeScreen = scene?.screen ?? screen, elements = scene?.elements ?? project.elements;
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let active = true;
    const resize = () => { if (active) setScale(Math.min(1, node.clientWidth / 320)); };
    const observer = new ResizeObserver(resize); observer.observe(node); resize(); return () => { active = false; observer.disconnect(); };
  }, []);
  function runtimeControl(e: AppElement) {
    if (e.kind === 'button') return <button type="button">{e.text || e.id}</button>;
    if (e.kind === 'label') return <span>{e.text}</span>;
    if (e.kind === 'checkbox') return <label><input type="checkbox" checked={e.checked} onChange={event => onEvent(e.id, 'change', event.target.checked)} />{e.text || e.id}</label>;
    if (e.kind === 'slider') return <input aria-label={e.text || e.id} type="range" min={0} max={100} value={e.value} onChange={event => onEvent(e.id, 'change', Number(event.target.value))} />;
    if (e.kind === 'dropdown') return <select aria-label={e.id} value={e.options.includes(e.text) ? e.text : e.options[0]} onChange={event => onEvent(e.id, 'change', event.target.value)}>{e.options.map((option, index) => <option key={index}>{option}</option>)}</select>;
    if (e.kind === 'textarea') return <textarea aria-label={e.id} maxLength={300} value={e.text} onChange={event => onEvent(e.id, 'change', event.target.value)} />;
    return <input aria-label={e.id} maxLength={300} value={e.text} onChange={event => onEvent(e.id, 'change', event.target.value)} />;
  }
  return <div className="al-preview-width" ref={host} style={{ height: 480 * scale }}>
    <div className={`al-preview ${designing ? 'al-designing' : ''}`} role="group" aria-label={designing ? 'App screen designer' : 'Running app preview'} style={{ transform: `scale(${scale})`, background: project.screens.find(s => s.id === activeScreen)?.background ?? '#ffffff' }}
      onDragOver={event => { if (designing && event.dataTransfer.types.includes('application/kodearcade-control')) event.preventDefault(); }}
      onDrop={event => { if (!designing) return; event.preventDefault(); const kind = event.dataTransfer.getData('application/kodearcade-control') as ElementKind; if (!['button', 'label', 'input', 'textarea', 'dropdown', 'checkbox', 'slider'].includes(kind)) return; const rect = event.currentTarget.getBoundingClientRect(); onAdd(kind, (event.clientX - rect.left) / scale, (event.clientY - rect.top) / scale); }}>
      {!elements.some(e => e.screen === activeScreen) && <div className="al-empty-screen"><Smartphone size={48} aria-hidden="true" /><p>{designing ? 'Add a control from the toolbox, or drag it onto this screen.' : 'This screen has no controls yet. Stop, then open Design to add one.'}</p></div>}
      {elements.filter(e => e.screen === activeScreen && (designing || !e.hidden)).map(e => {
        const style = { left: e.x, top: e.y, width: e.width, height: e.height, color: e.colour, background: e.background, fontSize: e.fontSize, '--control-colour': e.colour, '--control-background': e.background } as CSSProperties;
        return designing ? <button key={e.id} type="button" style={style} className={`al-control al-design-control ${selected === e.id ? 'al-selected' : ''} ${e.hidden ? 'al-hidden-control' : ''}`} aria-label={`Select ${e.id}, ${e.kind}`} aria-pressed={selected === e.id} onClick={() => onSelect(e.id)}
          onKeyDown={event => { const offset = event.shiftKey ? 10 : 1; const directions: Record<string, [number, number]> = { ArrowLeft: [-offset, 0], ArrowRight: [offset, 0], ArrowUp: [0, -offset], ArrowDown: [0, offset] }; const delta = directions[event.key]; if (!delta) return; event.preventDefault(); onMove(e.id, e.x + delta[0], e.y + delta[1]); }}
          onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); onSelect(e.id); drag.current = { id: e.id, x: event.clientX, y: event.clientY, originX: e.x, originY: e.y, pointer: event.pointerId }; }}
          onPointerMove={event => { const d = drag.current; if (d?.pointer === event.pointerId) onMove(e.id, d.originX + (event.clientX - d.x) / scale, d.originY + (event.clientY - d.y) / scale); }}
          onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
          {e.kind === 'checkbox' ? <><span className="al-checkbox-shape" aria-hidden="true">{e.checked ? '✓' : ''}</span>{e.text || e.id}</> : e.kind === 'slider' ? <span className="al-slider-shape" aria-hidden="true" /> : e.text || (e.kind === 'dropdown' ? e.options[0] : e.id)}
        </button> : <div key={e.id} style={style} className={`al-control al-runtime-${e.kind}`} inert={!scene} onClick={event => { if (event.target instanceof HTMLInputElement && e.kind === 'checkbox') onEvent(e.id, 'click', event.target.checked); else onEvent(e.id, 'click'); }}>{runtimeControl(e)}</div>;
      })}
    </div>
  </div>;
}
