import { useEffect, useRef, useState } from 'react';
import { Pencil, Minus, Square, Circle, Undo2, Redo2, Eraser } from 'lucide-react';
import type { PaintStroke, StudioAsset } from './studioProject';
import { backgroundImage } from './studioProject';
import { characterImage, characterIsAtlas } from './studioCatalog';
const images = new Map<string, HTMLImageElement>(), painting = new WeakMap<HTMLCanvasElement, StudioAsset>(), waiting = new Map<string, Set<HTMLCanvasElement>>();
export function paintStudioAsset(canvas: HTMLCanvasElement, asset: StudioAsset) {
  painting.set(canvas, asset);
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, 400, 400); if (asset.paper) { ctx.fillStyle = asset.paper; ctx.fillRect(0, 0, 400, 400); }
  if (asset.base) {
    const source = asset.base.kind === 'image' ? asset.base.imageData : asset.base.kind === 'character' ? characterImage(asset.base.ref) : backgroundImage[asset.base.ref];
    let img = images.get(source);
    if (!img) { img = new Image(); waiting.set(source, new Set()); img.onload = () => { const canvases = waiting.get(source); waiting.delete(source); for (const target of canvases ?? []) { const latest = painting.get(target); if (latest && target.isConnected) paintStudioAsset(target, latest); } }; img.onerror = () => waiting.delete(source); img.src = source; images.set(source, img); }
    if (!img.complete) waiting.get(source)?.add(canvas);
    if (img.complete && img.naturalWidth) {
      if (asset.base.kind === 'character' && characterIsAtlas(asset.base.ref)) { const cellWidth = img.width / 3, inset = cellWidth * .04; ctx.drawImage(img, cellWidth + inset, img.height / 2, cellWidth - inset * 2, img.height / 2, 16, 0, 368, 400); }
      else if (asset.base.kind === 'character') ctx.drawImage(img, 0, 0, 400, 400);
      else { const size = Math.min(img.width, img.height); ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 400, 400); }
    }
  }
  for (const stroke of asset.strokes ?? []) {
    if (!stroke.points.length) continue;
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color; ctx.fillStyle = stroke.color; ctx.lineWidth = stroke.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const first = stroke.points[0], last = stroke.points.at(-1)!; ctx.beginPath();
    if (stroke.tool === 'rectangle') ctx.rect(first[0], first[1], last[0] - first[0], last[1] - first[1]);
    else if (stroke.tool === 'ellipse') ctx.ellipse((first[0] + last[0]) / 2, (first[1] + last[1]) / 2, Math.max(.1, Math.abs(last[0] - first[0]) / 2), Math.max(.1, Math.abs(last[1] - first[1]) / 2), 0, 0, Math.PI * 2);
    else { ctx.moveTo(...first); for (const p of stroke.points.slice(1)) ctx.lineTo(...p); if (stroke.points.length === 1) { ctx.arc(first[0], first[1], stroke.width / 2, 0, Math.PI * 2); ctx.fill(); } }
    if (stroke.filled && ['rectangle', 'ellipse'].includes(stroke.tool)) ctx.fill(); else ctx.stroke();
  }
}
export function StudioDrawing({ asset, className = '', decorative = false }: { asset: StudioAsset; className?: string; decorative?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { if (ref.current) paintStudioAsset(ref.current, asset); }, [asset]);
  return <canvas ref={ref} width={400} height={400} className={className} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : asset.name} aria-hidden={decorative || undefined} />;
}
export default function StudioArt({ asset, onChange, onError }: { asset: StudioAsset; onChange: (asset: StudioAsset) => void; onError: (message: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null), pending = useRef<PaintStroke | null>(null), latest = useRef(asset); latest.current = asset;
  const [tool, setTool] = useState<PaintStroke['tool']>('pen'), [color, setColor] = useState('#6d4aff'), [width, setWidth] = useState(8), [filled, setFilled] = useState(false), [redo, setRedo] = useState<PaintStroke[]>([]);
  useEffect(() => { if (ref.current) paintStudioAsset(ref.current, asset); }, [asset]);
  const point = (event: React.PointerEvent<HTMLCanvasElement>): [number, number] => { const r = event.currentTarget.getBoundingClientRect(); return [Math.round(Math.max(0, Math.min(400, (event.clientX - r.left) * 400 / r.width))), Math.round(Math.max(0, Math.min(400, (event.clientY - r.top) * 400 / r.height)))]; };
  function preview() { if (ref.current) paintStudioAsset(ref.current, { ...latest.current, strokes: [...(latest.current.strokes ?? []), ...(pending.current ? [pending.current] : [])] }); }
  function finish() { if (!pending.current) return; const strokes = [...(latest.current.strokes ?? []), pending.current]; pending.current = null; if (strokes.length > 40) { onError('Use at most 40 strokes in one drawing. Undo or simplify some strokes.'); preview(); return; } onChange({ ...latest.current, strokes }); setRedo([]); preview(); }
  return <section className="studio-paint" aria-label={`Drawing editor for ${asset.name}`}>
    <div className="studio-paint-tools" role="toolbar" aria-label="Drawing tools">{([{ key: 'pen', name: 'Pencil', Icon: Pencil }, { key: 'line', name: 'Line', Icon: Minus }, { key: 'rectangle', name: 'Rectangle', Icon: Square }, { key: 'ellipse', name: 'Ellipse', Icon: Circle }, { key: 'eraser', name: 'Eraser', Icon: Eraser }] as const).map(({ key, name, Icon }) => <button key={key} aria-label={name} aria-pressed={tool === key} onClick={() => setTool(key)}><Icon size={21} /></button>)}<label><input type="checkbox" checked={filled} onChange={e => setFilled(e.target.checked)} />Fill shapes</label><label>Color<input type="color" value={color} onChange={e => setColor(e.target.value)} /></label><label>Width<input type="range" min={1} max={24} value={width} onChange={e => setWidth(Number(e.target.value))} /></label><button aria-label="Undo drawing stroke" disabled={!asset.strokes?.length} onClick={() => { const strokes = asset.strokes ?? []; setRedo(r => [...r, strokes.at(-1)!]); onChange({ ...asset, strokes: strokes.slice(0, -1) }); }}><Undo2 size={20} /></button><button aria-label="Redo drawing stroke" disabled={!redo.length} onClick={() => { onChange({ ...asset, strokes: [...(asset.strokes ?? []), redo.at(-1)!] }); setRedo(r => r.slice(0, -1)); }}><Redo2 size={20} /></button></div>
    <div className="studio-paint-paper"><canvas ref={ref} width={400} height={400} tabIndex={0} role="img" aria-label={`Draw ${asset.name} with pointer or touch. Keyboard users can add shapes below.`} onPointerDown={e => { if (e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); pending.current = { tool, color, width, filled, points: [point(e)] }; preview(); }} onPointerMove={e => { const stroke = pending.current; if (!stroke) return; const p = point(e); if ((stroke.tool === 'pen' || stroke.tool === 'eraser')) { if (stroke.points.length < 200 && Math.hypot(p[0] - stroke.points.at(-1)![0], p[1] - stroke.points.at(-1)![1]) > 2) stroke.points.push(p); } else stroke.points = [stroke.points[0], p]; preview(); }} onPointerUp={finish} onPointerCancel={() => { pending.current = null; preview(); }} /></div>
    <details className="studio-keyboard-paint"><summary>Add a shape with the keyboard</summary><form onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget), p: PaintStroke = { tool: tool === 'pen' ? 'line' : tool, color, width, filled, points: [[Number(data.get('x1')), Number(data.get('y1'))], [Number(data.get('x2')), Number(data.get('y2'))]] }; if ((asset.strokes?.length ?? 0) >= 40) { onError('Use at most 40 strokes.'); return; } onChange({ ...asset, strokes: [...(asset.strokes ?? []), p] }); }}><div>{['x1', 'y1', 'x2', 'y2'].map((key, i) => <label key={key}>{key}<input name={key} type="number" min={0} max={400} defaultValue={i < 2 ? 100 : 300} required /></label>)}</div><button>Add {tool === 'pen' ? 'line' : tool}</button></form></details>
    <p>Drawings stay in this private project. Undo removes a stroke; costumes can keep transparent paper.</p>
  </section>;
}
