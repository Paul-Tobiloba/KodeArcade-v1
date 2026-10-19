import { useRef } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
type Props = { onState: (key: string, pressed: boolean) => void; onActivate: (key: string) => void };
function ArrowButton({ arrow, name, Icon, onState, onActivate }: Props & { arrow: string; name: string; Icon: typeof ArrowLeft }) {
  const pressed = useRef(false);
  function press() { if (!pressed.current) { pressed.current = true; onState(arrow, true); } }
  function release() { if (pressed.current) { pressed.current = false; onState(arrow, false); } }
  return <button type="button" aria-label={name}
    onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.focus({ preventScroll: true }); event.currentTarget.setPointerCapture(event.pointerId); press(); }}
    onPointerUp={event => { release(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
    onPointerCancel={release} onLostPointerCapture={release} onBlur={release}
    onKeyDown={event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); if (!event.repeat) press(); } }}
    onKeyUp={event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); release(); } }}
    onContextMenu={event => event.preventDefault()}
    onClick={event => { if (event.detail === 0 && !pressed.current) onActivate(arrow); }}>
    <Icon size={22} aria-hidden="true" />
  </button>;
}
export default function StudioKeyControls(props: Props) {
  return <div className="studio-key-controls" role="group" aria-label="Arrow-key controls">
    <ArrowButton {...props} arrow="ArrowLeft" name="Move left" Icon={ArrowLeft} />
    <ArrowButton {...props} arrow="ArrowUp" name="Move up" Icon={ArrowUp} />
    <ArrowButton {...props} arrow="ArrowDown" name="Move down" Icon={ArrowDown} />
    <ArrowButton {...props} arrow="ArrowRight" name="Move right" Icon={ArrowRight} />
  </div>;
}
