export type TypingLine = { start:number; end:number; text:string };

/** Preserve every character (including the trailing separator) across visual wraps. */
export function typingLines(target:string, columns:number):TypingLine[] {
  const lines:TypingLine[]=[]; const width=Math.max(2,Math.floor(columns));
  for(let start=0;start<target.length;) {
    let end=Math.min(target.length,start+width);
    const newline=target.indexOf('\n',start);
    if(newline>=start&&newline<end) end=newline+1;
    else if(end<target.length) { const space=target.lastIndexOf(' ',end-1); if(space>=start+width/2) end=space+1; }
    lines.push({start,end,text:target.slice(start,end)});start=end;
  }
  return lines.length?lines:[{start:0,end:0,text:''}];
}

export function typingLineIndex(lines:TypingLine[],position:number) {
  const index=lines.findIndex(line=>position<line.end);return index<0?lines.length-1:index;
}

/** A repaired position stays marked, even across another backspace/retype. */
export function correctedPositions(previous:string,next:string,target:string,history:ReadonlySet<number>) {
  const result=new Set(history);
  for(let index=next.length;index<previous.length;index++) if(previous[index]!==target[index]) result.add(index);
  return result;
}

export function typingCharacterState(target:string,value:string,index:number,corrected:ReadonlySet<number>) {
  if(index===value.length) return 'current';
  if(index>=value.length) return 'untyped';
  if(target[index]!==value[index]) return 'incorrect';
  return corrected.has(index)?'corrected':'correct';
}
