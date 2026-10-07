import { useRef, useState } from 'react';
import { MousePointer2, Keyboard, Star, ArrowRight, Check, RotateCcw } from 'lucide-react';
import ReadAloud from './ReadAloud';

const mouseLessons = [
  ['Meet your pointer', 'Move the pointer to the star and click it. On a tablet, tap the star.'],
  ['Aim for the star', 'Find the star in its new place and click it.'],
  ['Pick up and carry', 'Press and hold the star. Carry it to the purple home, then let go.'],
  ['Across the garden', 'Drag the star across the garden into its home.'],
  ['A new direction', 'Drag the star down to its home.'],
  ['Back to the left', 'Drag the star left to its home.'],
  ['Up to the clouds', 'Drag the star up to its home.'],
  ['A longer journey', 'Keep holding as you carry the star to the far corner.'],
  ['Careful landing', 'Put the star inside the smaller home.'],
  ['Ready to build', 'One last delivery! Drag and release the star inside its home.'],
];
const keyboardLessons = [
  { title: 'Hello, Space', text: 'Click the practice area, then press the Space bar.', key: ' ', label: 'Space' },
  { title: 'Meet Enter', text: 'Press Enter to send Byte a hello.', key: 'Enter', label: 'Enter' },
  { title: 'Right arrow', text: 'Press the right arrow key.', key: 'ArrowRight', label: 'Right arrow' },
  { title: 'Left arrow', text: 'Press the left arrow key.', key: 'ArrowLeft', label: 'Left arrow' },
  { title: 'Up arrow', text: 'Press the up arrow key.', key: 'ArrowUp', label: 'Up arrow' },
  { title: 'Down arrow', text: 'Press the down arrow key.', key: 'ArrowDown', label: 'Down arrow' },
  { title: 'Find a letter', text: 'Press the B key. Uppercase or lowercase both work.', key: 'b', label: 'B' },
  { title: 'Type Byte', text: 'Type byte in the box, then press Enter.', word: 'byte' },
  { title: 'Fix a letter', text: 'The word has an extra x. Click after the x, press Backspace to remove it, then Enter.', word: 'byte', initial: 'bytex' },
  { title: 'Your first message', text: 'Type hello byte, then press Enter.', word: 'hello byte' },
];
type Props = { complete: string[]; onComplete: (id: string) => void; onBack: () => void };
export default function ComputerBasics({ complete, onComplete, onBack }: Props) {
  const [module, setModule] = useState<'mouse' | 'keyboard'>('mouse');
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [text, setText] = useState('');
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const zone = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef({ x: 0, y: 0 });
  const suppressClick = useRef(false);
  const id = `${module}-${index}`;
  const done = complete.includes(id) && !replaying;
  const keyboard = keyboardLessons[index];
  function change(nextModule: typeof module, nextIndex: number) {
    suppressClick.current = false;
    setModule(nextModule); setIndex(nextIndex); setMessage(''); setDrag(null); setSelected(false); setReplaying(false);
    setText(nextModule === 'keyboard' ? keyboardLessons[nextIndex].initial ?? '' : '');
  }
  function win() { onComplete(id); setReplaying(false); setMessage('You did it! Byte is ready for another discovery.'); setDrag(null); setSelected(false); }
  const places = [{ left: 76, top: 25 }, { left: 65, top: 68 }, { left: 74, top: 66 }, { left: 72, top: 26 }, { left: 25, top: 70 }, { left: 23, top: 28 }, { left: 72, top: 22 }, { left: 78, top: 76 }];
  const destination = places[(index - 2 + places.length) % places.length];
  const origin = { left: 100 - destination.left, top: 100 - destination.top };
  return <section className="computer-basics" aria-label="Computer Explorers">
    <button className="secondary" onClick={onBack}>Back to coding courses</button>
    <div className="basics-heading"><div><h1>Computer Explorers</h1><p>Get comfortable with a mouse, touch and keyboard. Ages 6 and up.</p></div><span>{complete.length} / 20 activities complete</span></div>
    <div className="basics-tabs" aria-label="Computer basics modules">{(['mouse','keyboard'] as const).map(m => <button className={module === m ? 'primary' : 'secondary'} key={m} aria-pressed={module === m} onClick={() => change(m, 0)}>{m === 'mouse' ? <MousePointer2 /> : <Keyboard />}{m === 'mouse' ? 'Mouse & touch' : 'Keyboard'}<span>{complete.filter(item => item.startsWith(m)).length}/10</span></button>)}</div>
    <nav className="basics-activities" aria-label="Activities">{Array.from({ length: 10 }, (_, n) => <button key={n} aria-label={`Activity ${n + 1}${complete.includes(`${module}-${n}`) ? ', complete' : ''}`} aria-current={n === index ? 'step' : undefined} onClick={() => change(module, n)}>{complete.includes(`${module}-${n}`) ? <Check size={18} /> : n + 1}</button>)}</nav>
    <section className="basics-lesson"><h2>{module === 'mouse' ? mouseLessons[index][0] : keyboard.title}</h2><p>{module === 'mouse' ? mouseLessons[index][1] : keyboard.text}</p><ReadAloud text={module === 'mouse' ? mouseLessons[index].join('. ') : `${keyboard.title}. ${keyboard.text}`} label="Listen to activity" />{module === 'mouse' && index >= 2 && <p className="basics-alternative">You can also click the star, then click its home. With a keyboard, Tab to each and press Enter.</p>}</section>
    {module === 'mouse' ? <div className="mouse-garden" ref={zone} aria-label="Mouse practice garden">
      {index >= 2 && <button ref={target} className={`star-home ${index === 8 ? 'small-home' : ''}`} style={{ left: `${destination.left}%`, top: `${destination.top}%` }} aria-label="Star home" onClick={() => { if (selected && !done) win(); else if (!done) setMessage('Pick up the star first, then choose its home.'); }}>Home</button>}
      <button className={`practice-star ${selected ? 'picked-up' : ''}`} style={drag ? { left: drag.x, top: drag.y } : index < 2 ? { left: index === 0 ? '50%' : '75%', top: index === 0 ? '50%' : '30%' } : { left: `${origin.left}%`, top: `${origin.top}%` }} aria-label="Pick up star" disabled={done}
        onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } if (index < 2) win(); else { setSelected(true); setMessage('Star picked up. Now click its home.'); } }}
        onPointerDown={event => { if (index < 2 || done) return; pointerStart.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); const box = zone.current!.getBoundingClientRect(); setDrag({ x: event.clientX - box.left, y: event.clientY - box.top }); }}
        onPointerMove={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const box = zone.current!.getBoundingClientRect(); setDrag({ x: Math.max(24, Math.min(box.width - 24, event.clientX - box.left)), y: Math.max(24, Math.min(box.height - 24, event.clientY - box.top)) }); }}
        onPointerCancel={() => setDrag(null)}
        onPointerUp={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; event.currentTarget.releasePointerCapture(event.pointerId); if (Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y) < 5) { setDrag(null); return; } suppressClick.current = true; const home = target.current!.getBoundingClientRect(); if (event.clientX >= home.left && event.clientX <= home.right && event.clientY >= home.top && event.clientY <= home.bottom) win(); else { setDrag(null); setMessage('Nearly! Carry the star inside its home before letting go.'); } }}><Star size={38} fill="currentColor" /></button>
      {done && <div className="garden-success"><Check size={36} /><span>Star delivered!</span></div>}
    </div> : <div className="keyboard-practice" tabIndex={keyboard.word ? -1 : 0} aria-label="Keyboard practice area" onKeyDown={event => { if (done || keyboard.word || event.key === 'Tab') return; event.preventDefault(); if (event.key.toLowerCase() === keyboard.key?.toLowerCase()) win(); else setMessage(`Try the ${keyboard.label} key. You can take your time.`); }}>
      <Keyboard size={42} />{keyboard.word ? <label>Type here<input autoComplete="off" spellCheck={false} value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key !== 'Enter') return; event.preventDefault(); if (text.toLowerCase().trim() === keyboard.word) win(); else setMessage('Check the letters and try again.'); }} /></label> : <><p>Click here, then press <strong>{keyboard.label}</strong>.</p><button className="secondary" onClick={win}>Practise {keyboard.label} on screen</button><small>On a tablet without a keyboard, use this button.</small></>}
    </div>}
    <div className="basics-result" role="status">{message || (done ? 'You have completed this activity. Try the next one!' : 'Take your time. Every try helps you learn.')}</div>
    <div className="basics-next"><button className="secondary" onClick={() => { change(module, index); setReplaying(true); }}><RotateCcw size={16} />Reset position</button>{done && <button className="primary" onClick={() => index < 9 ? change(module, index + 1) : module === 'mouse' ? change('keyboard', 0) : onBack()}>{index === 9 ? module === 'mouse' ? 'Try the keyboard' : 'Ready for coding' : 'Next activity'}<ArrowRight size={18} /></button>}</div>
  </section>;
}
