import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { GripVertical } from 'lucide-react';
import './workspace-divider.css';

type Geometry = { left: number; top: number; height: number; width: number; min: number; max: number };
const initial: Geometry = { left: 0, top: 0, height: 0, width: 0, min: 240, max: 600 };

/** Overlays the existing stage/code edge; never occupies a grid cell. */
export default function WorkspaceDivider({ studio = false }: { studio?: boolean }) {
  const handle = useRef<HTMLDivElement>(null);
  const requested = useRef<number | null>(null);
  const drag = useRef<{ pointerId: number; x: number; width: number } | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [geometry, setGeometry] = useState(initial);
  const geometryRef = useRef(geometry); geometryRef.current = geometry;

  useEffect(() => {
    const parent = handle.current?.parentElement;
    const stage = parent?.querySelector<HTMLElement>(studio ? ':scope > .studio-scene-panel' : ':scope > .scene');
    const editor = parent?.querySelector<HTMLElement>(studio ? ':scope > .studio-tool-panel' : ':scope > .editor');
    if (!parent || !stage || !editor) return;
    const query = matchMedia('(min-width: 951px) and (min-height: 601px)');
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const active = query.matches && stage.getBoundingClientRect().width > 0;
        setEnabled(active);
        if (!active) {
          drag.current = null;
          parent.removeAttribute('data-stage-resizing');
          parent.style.removeProperty('--stage-width');
          return;
        }
        const area = parent.getBoundingClientRect(), box = stage.getBoundingClientRect(), code = editor.getBoundingClientRect();
        const gap = Math.max(0, code.left - box.right);
        const max = Math.max(240, Math.min(600, area.right - box.left - gap - (studio ? 520 : 400)));
        if (requested.current !== null) {
          const width = Math.max(240, Math.min(max, requested.current));
          requested.current = width;
          if (Math.abs(box.width - width) > .5) { parent.style.setProperty('--stage-width', `${width}px`); return; }
        }
        const next = { left: box.right - area.left + gap / 2 - 8, top: box.top - area.top, height: box.height, width: Math.round(box.width), min: 240, max: Math.floor(max) };
        geometryRef.current = next;
        setGeometry(previous => Object.keys(next).every(key => previous[key as keyof Geometry] === next[key as keyof Geometry]) ? previous : next);
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(parent); observer.observe(stage); observer.observe(editor);
    const guide = parent.querySelector(':scope > .activity-guide');
    if (guide) observer.observe(guide);
    query.addEventListener('change', measure); measure();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); query.removeEventListener('change', measure);
      parent.style.removeProperty('--stage-width'); parent.removeAttribute('data-stage-resizing');
    };
  }, [studio]);

  function resize(width: number) {
    const bounds = geometryRef.current;
    requested.current = Math.max(bounds.min, Math.min(bounds.max, width));
    handle.current?.parentElement?.style.setProperty('--stage-width', `${requested.current}px`);
  }
  function reset() { requested.current = null; handle.current?.parentElement?.style.removeProperty('--stage-width'); }
  function finish(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    event.currentTarget.parentElement?.removeAttribute('data-stage-resizing');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    const { min, max } = geometryRef.current;
    const width = requested.current ?? geometryRef.current.width;
    const step = event.shiftKey ? 64 : 24;
    if (event.key === 'ArrowLeft') resize(width - step);
    else if (event.key === 'ArrowRight') resize(width + step);
    else if (event.key === 'Home') resize(min);
    else if (event.key === 'End') resize(max);
    else if (event.key === 'Enter') reset();
    else return;
    event.preventDefault();
  }
  return <div ref={handle} className="workspace-divider" hidden={!enabled} role="separator" tabIndex={enabled ? 0 : -1} aria-label="Resize stage and coding area" aria-orientation="vertical" aria-valuemin={geometry.min} aria-valuemax={geometry.max} aria-valuenow={geometry.width} aria-valuetext={`Stage width ${geometry.width} pixels`} title="Drag to resize. Left/Right arrows adjust; Home/End reach limits. Double-click or Enter resets."
    style={{ left: geometry.left, top: geometry.top, height: geometry.height }} onKeyDown={keyboard} onDoubleClick={reset}
    onPointerDown={event => { if (!enabled || event.button !== 0) return; event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); drag.current = { pointerId: event.pointerId, x: event.clientX, width: geometryRef.current.width }; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.parentElement?.setAttribute('data-stage-resizing', 'true'); }}
    onPointerMove={event => { const current = drag.current; if (current?.pointerId === event.pointerId) resize(current.width + event.clientX - current.x); }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}><GripVertical size={18} aria-hidden="true" /></div>;
}
