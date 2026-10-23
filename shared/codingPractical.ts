import { z } from 'zod';

export const controlProgram = z.object({ kind:z.literal('controls'), event:z.enum(['tap','held']), release:z.enum(['stop','continue']), right:z.enum(['right','left']), speed:z.number().int().min(10).max(60), character:z.enum(['Byte','Dash']) }).strict();
export const basketProgram = z.object({ kind:z.literal('basketball'), functionDefined:z.boolean(), onStart:z.enum(['call','inline','none']), onHoop:z.enum(['call','inline','none']), resetX:z.number().int().min(15).max(85), startScore:z.number().int().min(0).max(5), point:z.literal(1), miss:z.enum(['stop','continue']) }).strict();
export type ControlProgram = z.infer<typeof controlProgram>;
export type BasketProgram = z.infer<typeof basketProgram>;
export type PracticalProgram = ControlProgram | BasketProgram;
const program = z.discriminatedUnion('kind',[controlProgram,basketProgram]);
const count = z.number().int().min(0).max(100000);
export const codingPractical = z.object({
  version:z.literal(1), unitId:z.enum(['g2-controls-v1','g4-basketball-v1']),
  steps:z.array(z.boolean()).length(5), attempts:count, supportUsed:z.boolean(),
  mastery:z.object({ demonstrated:z.boolean(), transfer:z.boolean(), attempts:count, last:z.enum(['none','not-yet','supported','demonstrated']) }).strict(),
  draft:z.object({ step:z.number().int().min(0).max(5), programs:z.array(program).length(6), responses:z.array(z.object({prediction:z.number().int().min(-1).max(2),reason:z.number().int().min(-1).max(2)}).strict()).length(6), checkSupport:z.boolean(), variant:z.number().int().min(0).max(1) }).strict(),
}).strict();
export type CodingPractical = z.infer<typeof codingPractical>;
export const practicalGrade = (id:string) => id==='g2-controls-v1' ? 2 : id==='g4-basketball-v1' ? 4 : 0;
export const practicalKey = (course:string) => `kodearcade-practical-v1:${course}`;
export function starter(grade:number, step:number): PracticalProgram {
  if(grade===2) return {kind:'controls',event:step===3 || step===5 ? 'tap':'held',release:step===3 || step===5?'continue':'stop',right:step===5?'left':'right',speed:20,character:'Byte'};
  return {kind:'basketball',functionDefined:step>=3,onStart:step>=3?'call':'inline',onHoop:step===3 || step===5?'none':step>=3?'call':'inline',resetX:50,startScore:step===3 || step===5?2:0,point:1,miss:step===3 || step===5?'continue':'stop'};
}
export function emptyPractical(grade:number): CodingPractical {
  if(grade!==2 && grade!==4) throw new Error('This practical unit is not available for this grade.');
  return {version:1,unitId:grade===2?'g2-controls-v1':'g4-basketball-v1',steps:Array(5).fill(false),attempts:0,supportUsed:false,mastery:{demonstrated:false,transfer:false,attempts:0,last:'none'},draft:{step:0,programs:Array.from({length:6},(_,step)=>starter(grade,step)),responses:Array.from({length:6},()=>({prediction:-1,reason:-1})),checkSupport:false,variant:0}};
}
export function readPractical(value:unknown,grade:number) {
  const parsed=codingPractical.parse(value);
  if(practicalGrade(parsed.unitId)!==grade || parsed.draft.programs.some(p=>p.kind!==(grade===2?'controls':'basketball'))) throw new Error('This practical save belongs to another unit.');
  return parsed;
}
export function mergePractical(old:CodingPractical|undefined,next:CodingPractical):CodingPractical {
  if(!old) return next;
  if(old.unitId!==next.unitId) throw new Error('Practical versions must not be silently remapped.');
  return {...next,steps:next.steps.map((done,i)=>done||old.steps[i]),attempts:Math.max(old.attempts,next.attempts),supportUsed:old.supportUsed||next.supportUsed,mastery:{...next.mastery,demonstrated:old.mastery.demonstrated||next.mastery.demonstrated,transfer:old.mastery.transfer||next.mastery.transfer,attempts:Math.max(old.mastery.attempts,next.mastery.attempts)}};
}

export type ControlState={x:number;velocity:number;held:number};
export const controlStart=():ControlState=>({x:50,velocity:0,held:0});
export function controlTick(state:ControlState,p:ControlProgram,held:number,seconds:number):ControlState {
  const dt=Math.min(.1,Math.max(0,seconds)),sign=p.right==='right'?1:-1;
  const velocity=held ? p.event==='held'?held*p.speed*sign:0 : p.release==='stop'?0:state.velocity;
  const tap=p.event==='tap' && held && held!==state.held ? held*5*sign:0;
  return {x:Math.max(5,Math.min(95,state.x+velocity*dt+tap)),velocity,held};
}
export type BasketState={player:number;x:number;y:number;dx:number;dy:number;score:number;playing:boolean};
function resetBall(s:BasketState,p:BasketProgram,action:BasketProgram['onStart']):BasketState {
  if(action==='call' && p.functionDefined) return {...s,x:p.resetX,y:45,dx:14,dy:38};
  if(action==='inline') return {...s,x:50,y:45,dx:14,dy:38};
  return s;
}
export function basketEvent(s:BasketState,p:BasketProgram,event:'start'|'hoop'|'miss'):BasketState {
  if(event==='start') return resetBall({...s,player:50,score:p.startScore,playing:true},p,p.onStart);
  if(event==='miss') return {...s,playing:p.miss!=='stop',y:100,dy:0};
  return resetBall({...s,score:s.score+p.point},p,p.onHoop);
}
export function basketStart(p:BasketProgram):BasketState { return basketEvent({player:50,x:50,y:45,dx:14,dy:38,score:0,playing:false},p,'start'); }
export function basketTick(s:BasketState,p:BasketProgram,held:number,seconds:number):BasketState {
  if(!s.playing) return s;
  const dt=Math.min(.1,Math.max(0,seconds));
  const next={...s,player:Math.max(10,Math.min(90,s.player+held*45*dt)),x:s.x+s.dx*dt,y:s.y+s.dy*dt};
  if(next.x<5 || next.x>95) {next.x=Math.max(5,Math.min(95,next.x));next.dx*=-1;}
  if(next.y<5) {next.y=5;next.dy=Math.abs(next.dy);}
  if(next.dy>0 && Math.hypot(next.x-next.player,next.y-84)<=13) next.dy=-Math.abs(next.dy);
  if(Math.hypot(next.x-50,next.y-20)<=12) return basketEvent(next,p,'hoop');
  return next.y>96?basketEvent(next,p,'miss'):next;
}
export type CheckCase={name:string;pass:boolean};
export function practicalChecks(p:PracticalProgram,step:number,variant=0):CheckCase[] {
  if(p.kind==='controls') {
    const run=(held:number,ticks:number,s=controlStart())=>{for(let i=0;i<ticks;i++)s=controlTick(s,p,held,.05);return s;};
    const short=run(1,4),long=run(1,12),released=run(0,5,long),neutral=run(0,5);
    const speed=step===2?40:step===4?30:step===5?(variant?30:50):undefined;
    return [{name:'Holding moves continuously, not once per tap',pass:long.x-short.x>p.speed*.3},{name:'Right moves right; left moves left',pass:long.x>50 && run(-1,4).x<50},{name:'Release stops movement',pass:Math.abs(released.x-long.x)<.001},{name:'Opposite controls together are neutral; a new Run starts at 50',pass:neutral.x===50 && controlStart().x===50},...(speed===undefined?[]:[{name:`The movement speed is ${speed} units per second`,pass:p.speed===speed}]),...(step>=4?[{name:'Transfer the controls to Dash',pass:p.character==='Dash'}]:[])];
  }
  const start=basketStart(p),scored=basketEvent({...start,x:50,y:20},p,'hoop'),again=basketTick(scored,p,0,.05),miss=basketEvent(start,p,'miss');
  const changed={...p,resetX:p.resetX===30?70:30},newStart=basketStart(changed),newHoop=basketEvent(start,changed,'hoop');
  const targetX=step===2?30:step===4?70:step===5?(variant?25:70):undefined;
  return [{name:'New Run resets the score to zero',pass:start.score===0},{name:'One hoop encounter gives the intended points, then resets the ball',pass:scored.score===p.point && scored.y===45 && again.score===scored.score},{name:'A miss stops the round',pass:!miss.playing},...(step>=2?[{name:'Both events call the visible resetRound function',pass:p.functionDefined && p.onStart==='call' && p.onHoop==='call' && newStart.x===changed.resetX && newHoop.x===changed.resetX}]:[]),...(targetX===undefined?[]:[{name:`Changing the definition starts both callers at x = ${targetX}`,pass:start.x===targetX && scored.x===targetX}]),{name:'A ball outside the hoop does not score',pass:basketTick({...start,x:10,y:45},p,0,.05).score===start.score}];
}
