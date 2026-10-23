import { describe,expect,it } from 'vitest';
import {correctedPositions,typingCharacterState,typingLineIndex,typingLines} from './typingFeedback';

describe('typing passage feedback and visual line progression',()=>{
  it('keeps green/red/amber/current separate across backspace and repeated repair',()=>{
    let history=correctedPositions('fx','f','fj ',new Set());
    expect(typingCharacterState('fj ','fx',0,history)).toBe('correct');
    expect(typingCharacterState('fj ','fx',1,history)).toBe('incorrect');
    expect(typingCharacterState('fj ','f',1,history)).toBe('current');
    expect(typingCharacterState('fj ','fj',1,history)).toBe('corrected');
    history=correctedPositions('fj','f','fj ',history);
    expect(typingCharacterState('fj ','fj',1,history)).toBe('corrected');
    expect(typingCharacterState('fj ','',2,history)).toBe('untyped');
  });
  it('does not label an ordinary backspace as a mistake or lose correction history',()=>{
    expect(correctedPositions('fj','f','fj ',new Set()).size).toBe(0);
    expect([...correctedPositions('fj','f','fj ',new Set([0]))]).toEqual([0]);
  });
  it('preserves every space/newline and moves at the exact line boundary',()=>{
    for(const target of ['Curiosity helps us ask better questions.\nKeep trying.','a  b c  d','averylongwordwithoutspaces',''])for(const width of [2,7,18,40]){
      const lines=typingLines(target,width);expect(lines.map(line=>line.text).join('')).toBe(target);
      for(let i=0;i<lines.length;i++){expect(typingLineIndex(lines,lines[i].start)).toBe(i);if(i<lines.length-1)expect(typingLineIndex(lines,lines[i].end)).toBe(i+1);}
      expect(typingLineIndex(lines,target.length)).toBe(lines.length-1);
    }
  });
});
