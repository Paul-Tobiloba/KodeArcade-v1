import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import TypingKeyboard from './TypingKeyboard';
import { typingCharacterState, typingLineIndex, typingLines, type TypingLine } from './typingFeedback';
import {Flame,Target} from 'lucide-react';

function useLineProgression(target:string,position:number,element:RefObject<HTMLDivElement|null>,short:boolean,large:boolean) {
  const [columns,setColumns]=useState(35);
  useEffect(()=>{
    const node=element.current;if(!node)return;
    const measure=()=>{const style=getComputedStyle(node),canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)return;context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;const line=node.querySelector('.typing-conveyor-line'),gap=line?parseFloat(getComputedStyle(line).columnGap)||0:0,tile=node.querySelector('.typing-character')?.getBoundingClientRect().width||parseFloat(style.getPropertyValue('--typing-tile-width'))||52;setColumns(Math.max(2,Math.floor((node.clientWidth-40)/(short?tile+gap:context.measureText('M').width))));};
    const observer=new ResizeObserver(measure);observer.observe(node);void document.fonts.ready.then(measure);measure();return()=>observer.disconnect();
  },[element,short,large]);
  const lines=typingLines(target,columns);return {lines,index:typingLineIndex(lines,position)};
}

export function TypingLegend(){return <div className="typing-legend" aria-label="Character feedback legend"><span><i className="correct"/>Correct</span><span><i className="incorrect"/>Mistake <small>underlined</small></span><span><i className="corrected"/>Corrected after Backspace</span><span><i className="current"/>Current position</span></div>;}

function PracticeLine({line,target,value,corrected,active}:{line:TypingLine;target:string;value:string;corrected:ReadonlySet<number>;active:boolean}) {
  return <div className={`typing-conveyor-line${active?' active':''}`} aria-hidden="true">{[...line.text].map((character,offset)=>{const index=line.start+offset,state=typingCharacterState(target,value,index,corrected);return <span key={index} data-position={index} className={`typing-character ${state}${character===' '?' separator':''}`}>{character==='\n'?'↵':character===' '?'\u00a0':character}</span>;})}</div>;
}

export function TypingViewport({target,value,corrected,short,large,inputRef,onChange,onFocus,onBlur,onPaste}:{target:string;value:string;corrected:ReadonlySet<number>;short:boolean;large:boolean;inputRef:RefObject<HTMLDivElement|null>;onChange:(next:string)=>void;onFocus:()=>void;onBlur:()=>void;onPaste:()=>void}) {
  const measure=useRef<HTMLDivElement>(null);const {lines,index}=useLineProgression(target,value.length,measure,short,large);
  function key(event:KeyboardEvent<HTMLDivElement>){
    if(event.ctrlKey||event.metaKey||event.altKey||event.nativeEvent.isComposing)return;
    if(event.key==='Backspace'){event.preventDefault();onChange(value.slice(0,-1));}
    else if(event.key.length===1||event.key==='Enter'&&target.includes('\n')){event.preventDefault();if(value.length<Math.max(100,target.length*2+10))onChange(value+(event.key==='Enter'?'\n':event.key));}
  }
  return <div id="typing-entry" ref={inputRef} role="textbox" aria-label="Type the practice passage" aria-multiline="true" aria-describedby="typing-instruction typing-feedback typing-position" tabIndex={0} className={`typing-passage-input${short?' short-pattern':''}`} onKeyDown={key} onFocus={onFocus} onBlur={onBlur} onPaste={event=>{event.preventDefault();onPaste();onChange((value+event.clipboardData.getData('text/plain')).slice(0,Math.max(100,target.length*2+10)));}}>
    <span className="sr-only">Model: {target}</span><span className="sr-only" id="typing-position">Position {Math.min(target.length,value.length+1)} of {target.length}. Next: {target[value.length]===' '?'Space':target[value.length]==='\n'?'Enter':target[value.length]??'complete'}.</span>
    <div className="typing-conveyor" ref={measure}><div className="typing-conveyor-track" style={{transform:`translateY(calc(${-index} * var(--typing-line-height)))`}}>{lines.map(line=><PracticeLine key={`${line.start}-${line.end}`} line={line} target={target} value={value} corrected={corrected} active={line===lines[index]}/>)}</div></div>
    <span className="typing-focus-prompt">Click here or Tab to the passage, then type on your keyboard.</span>
  </div>;
}

export function TypingStats({wpm,accuracy,streak}:{wpm:number|undefined;accuracy:number|undefined;streak:number}){return <div className="typing-live-stats" aria-label="Live typing metrics"><span>WPM <strong>{wpm??'—'}</strong></span><span>Accuracy <strong>{accuracy===undefined?'—':`${accuracy}%`}</strong></span><span>Streak <strong>{streak}</strong><small> characters</small></span></div>;}
function ByteTyping(){
  return <img className="typing-coach-art byte-typing" src="/images/typing/byte-typing.png" width="140" height="140" alt=""/>;
}
export function TypingLessonHero({title,number,mode,percentage,detail,accuracy,streak,wrong,measured=true}:{title:string;number:number;mode:string;percentage:number;detail:string;accuracy?:number;streak:number;wrong:boolean;measured?:boolean}){
  return <section className="typing-lesson-hero" aria-label="Current typing lesson"><ByteTyping/><div className="typing-hero-title"><h1>{title}</h1><p>Lesson {number} of 120 · {mode}</p><span>Build your typing superpowers, one careful key at a time.</span></div><div className="typing-hero-details"><p className="typing-coach"><strong>{wrong?'You can fix this!':streak>=5?'Great focus!':'Ready when you are!'}</strong><span>{wrong?'Backspace, then try that key again.':'Take your time. Accuracy comes first.'}</span></p><div className="typing-hero-metrics"><div className="typing-hero-progress"><label htmlFor="typing-activity-progress">Activity progress <span>{detail}</span></label><progress id="typing-activity-progress" value={percentage} max={100}/></div>{measured&&<div className="typing-live-stats" aria-label="Live typing metrics"><span><Target size={25}/><span>Accuracy<strong>{accuracy===undefined?'—':`${accuracy}%`}</strong></span></span><span><Flame size={25}/><span>Streak <strong>{streak}</strong></span></span></div>}</div></div></section>;
}
export function KeyboardPanel({guide,next}:{guide:boolean;next?:string}){return <section className={`typing-keyboard-panel${guide?'':' guide-hidden'}`} aria-label="Typing guidance">{guide?<TypingKeyboard next={next}/>:<div className="typing-guide-off">Guide off · turn it on whenever you need.</div>}</section>;}
