import { typingHint } from '../shared/typing';
import {Hand} from 'lucide-react';

const rows = [['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],['Caps','a','s','d','f','g','h','j','k','l',';',"'",'Enter'],['ShiftLeft','z','x','c','v','b','n','m',',','.','/','ShiftRight'],['Ctrl','Alt','Space','Alt','Ctrl']];
const labels: Record<string, string> = { Backspace: 'Back', ShiftLeft: 'Shift', ShiftRight: 'Shift', Space: 'space' };
function FingerPanel({side,next}:{side:'left'|'right';next?:string}){
  const hint=typingHint(next);
  return <aside className={`typing-finger-panel ${side}`} aria-label={`${side==='left'?'Left':'Right'} finger guide`}><h2><Hand size={21}/>{side==='left'?'Left':'Right'} hand</h2><ul>{['Little finger','Ring finger','Middle finger','Index finger','Thumb'].map((name,finger)=>{
    const active=!!hint&&((hint.finger===finger&&(hint.hand===side||hint.hand==='either'))||(hint.shift&&hint.hand!==side&&finger===0));
    return <li key={name} className={`finger-${finger}${active?' selected':''}`} aria-current={active?'true':undefined}><i aria-hidden="true"/>{name}</li>;
  })}</ul></aside>;
}
export default function TypingKeyboard({ next }: { next?: string }) {
  const hint = typingHint(next), shift = hint?.shift ? hint.hand === 'left' ? 'ShiftRight' : 'ShiftLeft' : undefined;
  return <section className="typing-guide" aria-label="Keyboard and finger guidance"><FingerPanel side="left" next={next}/><div className="typing-keyboard-center"><div className="typing-guide-label"><strong>Next key: <kbd>{hint ? hint.key === 'Space' || hint.key === 'Enter' ? hint.key : next?.toUpperCase() : '—'}</kbd></strong><span>{hint?.label}{hint?.shift && ' + opposite Shift'}</span><small>English · US QWERTY</small></div><div className="typing-placement">
    <div className="typing-keyboard" role="img" aria-label={hint ? `QWERTY keyboard: ${hint.key}, ${hint.label}${hint.shift ? ' and opposite Shift' : ''}` : 'English QWERTY keyboard'}>{rows.map((row, i) => <div className="typing-key-row" key={i}>{row.map((key, j) => <kbd key={`${key}-${j}`} data-key={key} className={`typing-key${key.length > 1 ? ' utility' : ''}${key === 'Space' ? ' space' : ''}${key === 'f' || key === 'j' ? ' home' : ''}${hint && (key === hint.key || key === shift) ? ' next' : ''}`}>{labels[key] ?? key.toUpperCase()}</kbd>)}</div>)}</div>
  </div></div><FingerPanel side="right" next={next}/></section>;
}
