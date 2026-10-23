import { expect, it } from 'vitest';
import { basketEvent,basketStart,basketTick,controlStart,controlTick,emptyPractical,mergePractical,practicalChecks,readPractical,starter,type BasketProgram,type ControlProgram } from '../shared/codingPractical';
import { completePractice,readPractice } from '../shared/codingPractice';
import { collectCloud,hydrateCloud } from './cloudProgress';
import { preserveAchievements,validCourseDocument,type ProgressDocument } from '../shared/progress';
import { emptySave,parseSave } from './storage';

const doc=():ProgressDocument=>({version:1,currentId:'grade-2-sequences-1',view:'challenge',progress:{},drawings:{},preferences:{largeText:false,reducedMotion:false,soundEnabled:false,musicEnabled:false},basicsComplete:[],topicRecords:{}});
it('runs held movement by elapsed time, not browser key repeat, and keeps opposed controls neutral',()=>{
  const p=starter(2,1) as ControlProgram;
  let a=controlStart(),b=controlStart();for(let i=0;i<20;i++)a=controlTick(a,p,1,.05);for(let i=0;i<10;i++)b=controlTick(b,p,1,.1);
  expect(a.x).toBeCloseTo(70);expect(b.x).toBeCloseTo(a.x);
  const release=controlTick(a,p,0,.1);expect(release.x).toBe(a.x);expect(release.velocity).toBe(0);expect(controlTick(controlStart(),p,0,.1).x).toBe(50);
  const broken=starter(2,3) as ControlProgram;let tap=controlStart();for(let i=0;i<20;i++)tap=controlTick(tap,broken,1,.05);expect(tap.x).toBe(55);
  expect(practicalChecks(broken,3).some(test=>!test.pass)).toBe(true);
});
it('detects the actual hold/release, direction, speed and new-character requirements',()=>{
  for(const step of [1,2,3,4,5]){
    const p:ControlProgram={...starter(2,step) as ControlProgram,event:'held',release:'stop',right:'right',speed:step===2?40:step===4?30:step===5?50:20,character:step>=4?'Dash':'Byte'};
    expect(practicalChecks(p,step).every(test=>test.pass)).toBe(true);
    if(step===5){expect(practicalChecks(p,step,1).every(test=>test.pass)).toBe(false);expect(practicalChecks({...p,speed:30},step,1).every(test=>test.pass)).toBe(true);}
  }
  const stuck={...starter(2,1) as ControlProgram,release:'continue' as const};expect(practicalChecks(stuck,1).find(test=>test.name==='Release stops movement')!.pass).toBe(false);
});
it('basketball executes visible event rules, avoids repeated hoop scoring, and resets at each caller',()=>{
  const p:BasketProgram={...starter(4,5) as BasketProgram,functionDefined:true,onStart:'call',onHoop:'call',resetX:70,startScore:0,miss:'stop'};
  expect(practicalChecks(p,5).every(test=>test.pass)).toBe(true);
  const begin=basketStart(p),point=basketEvent({...begin,x:50,y:20},p,'hoop');expect(point.score).toBe(1);expect(point.x).toBe(70);expect(basketTick(point,p,0,.05).score).toBe(1);
  expect(basketEvent(point,p,'start').score).toBe(0);expect(basketEvent(point,p,'miss').playing).toBe(false);
  expect(practicalChecks({...p,onHoop:'inline'},5).some(test=>!test.pass)).toBe(true);
  expect(practicalChecks(starter(4,3),3).some(test=>!test.pass)).toBe(true);
  expect(practicalChecks({...p,resetX:25},5,1).every(test=>test.pass)).toBe(true);
});
it('round-trips versioned practical drafts without changing old course work or public namespaces',()=>{
  const practical=emptyPractical(2),base=doc();base.practical=practical;
  expect(collectCloud('grade-2',hydrateCloud('grade-2',base))).toEqual(base);
  expect(validCourseDocument('grade-2',base)).toBe(true);expect(validCourseDocument('grade-2',{...base,practical:emptyPractical(4)})).toBe(false);
  expect(()=>readPractical({...practical,privateText:'not allowed'},2)).toThrow();expect(()=>readPractical(practical,4)).toThrow();
  expect(()=>readPractical({...practical,draft:{...practical.draft,programs:[]}},2)).toThrow();expect(()=>emptyPractical(3)).toThrow();
});
it('keeps demonstrated practical evidence and practice completion through retries and old-client omission',()=>{
  const old=emptyPractical(2);old.steps.fill(true);old.mastery={demonstrated:true,transfer:true,attempts:3,last:'demonstrated'};old.supportUsed=true;
  const next=emptyPractical(2);next.mastery.last='not-yet';
  const merged=mergePractical(old,next);expect(merged.steps.every(Boolean)).toBe(true);expect(merged.mastery).toEqual({demonstrated:true,transfer:true,attempts:3,last:'not-yet'});expect(merged.supportUsed).toBe(true);
  expect(preserveAchievements({...doc(),practical:old},doc()).practical).toEqual(old);
});
it('never fabricates historical practice or mastery from legacy stars; preserves explicit help history',()=>{
  const save=emptySave();save.progress['grade-1-sequences-1']={blocks:[],attempts:15,hints:4,complete:true,stars:2};
  expect(parseSave(JSON.stringify(save)).progress['grade-1-sequences-1']).toMatchObject({stars:2});expect(parseSave(JSON.stringify(save)).progress['grade-1-sequences-1'].practice).toBeUndefined();
  const practice=completePractice(undefined,true);save.progress['grade-1-sequences-1'].practice=practice;
  expect(parseSave(JSON.stringify(save)).progress['grade-1-sequences-1'].practice).toEqual(practice);
  expect(completePractice(practice,false).supportUsed).toBe(true);expect(readPractice({...practice,mastered:true})).toBeUndefined();
  const old=doc();old.progress['grade-2-sequences-1']={blocks:[],attempts:12,hints:4,complete:true,stars:5,practice};
  const next=doc();next.progress['grade-2-sequences-1']={blocks:[],attempts:1,hints:0,complete:false};
  expect(preserveAchievements(old,next).progress['grade-2-sequences-1']).toMatchObject({complete:true,stars:5,practice});
});
