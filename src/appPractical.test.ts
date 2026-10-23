import { expect,it } from 'vitest';
import { appLessonProject, appPracticalKey, emptyAppPractical, lessonIds, mergeAppPractical, readAppPractical } from '../shared/appPractical';
import { preserveAchievements, progressDocument, summarizeProgress, validCourseDocument, type ProgressDocument } from '../shared/progress';
import { appLabStorageKey } from '../shared/appLab';
import { appLessonChecks } from './appPracticalChecks';
import { collectCloud,hydrateCloud } from './cloudProgress';
import { codeText,parseAppCode } from './appLabCode';
import { AppRuntime } from './appLabRuntime';
const doc=():ProgressDocument=>({version:1,currentId:'grade-3-sequences-1',view:'challenge',progress:{},drawings:{},preferences:{largeText:false,reducedMotion:false,soundEnabled:false,musicEnabled:false},basicsComplete:[],topicRecords:{}});
const passes=(step:number,variant=0)=>appLessonChecks(appLessonProject(step,variant,true),step,variant).every(t=>t.pass);
it('all authored lesson and fresh variants validate, round-trip through real text/blocks and run',()=>{
  const unit=emptyAppPractical();expect(readAppPractical(unit)).toEqual(unit);
  for(const step of [1,2,3,4,5])for(const variant of [0,1]){const p=appLessonProject(step,variant,true);p.code=parseAppCode(codeText(p.code));expect(appLessonChecks(p,step,variant).every(t=>t.pass)).toBe(true);expect(passes(step,variant)).toBe(true);}
});
it('greeting checks reject hard-coded input and change-only triggers',()=>{
  const p=appLessonProject(1);p.code=parseAppCode('onStart(function(){setText("message","Ready");});onEvent("hello","click",function(){setText("message","Hello, Byte");});');
  expect(appLessonChecks(p,1).find(t=>t.name.includes('different inputs'))!.pass).toBe(false);
  p.code=parseAppCode('onStart(function(){setText("message","Ready");});onEvent("nickname","change",function(){setText("message",joinText("Hello, ",getText("nickname")));});');
  expect(appLessonChecks(p,1).some(t=>!t.pass)).toBe(true);
});
it('repair and adaptation exercise repeated clicks, actual variable reset and independent outputs',()=>{
  expect(appLessonChecks(appLessonProject(3),3).some(t=>!t.pass)).toBe(true);
  expect(appLessonChecks(appLessonProject(4),4).some(t=>!t.pass)).toBe(true);
  const p=appLessonProject(3,0,true),reset=p.code.blocks!.blocks[3];reset.inputs!.DO=reset.inputs!.DO.block!.next!;
  expect(appLessonChecks(p,3).find(t=>t.name.includes('Reset changes'))!.pass).toBe(false);
  const v0=appLessonProject(5,0,true);expect(appLessonChecks(v0,5,1).some(t=>!t.pass)).toBe(true);
  expect(lessonIds(5).input).not.toBe(lessonIds(1).input);
});
it('the preview runtime changes temporary input without rewriting the project',()=>{
  const p=appLessonProject(1),before=structuredClone(p),runtime=new AppRuntime(p);runtime.start();runtime.inputValue('nickname','Temporary name');runtime.event('hello','click');
  expect(runtime.snapshot().elements.find(e=>e.id==='message')!.text).toBe('Hello, Temporary name');expect(p).toEqual(before);expect(JSON.stringify(emptyAppPractical())).not.toContain('Temporary name');
});
it('keeps unfinished code drafts, rejects invalid/deep/oversized or non-lesson saves',()=>{
  const u=emptyAppPractical();u.draft.projects[2].codeDraft='onEvent(';expect(readAppPractical(u).draft.projects[2].codeDraft).toBe('onEvent(');
  expect(appLessonChecks(u.draft.projects[2],2).every(t=>!t.pass)).toBe(true);
  expect(()=>readAppPractical({...u,privateNotes:'not accepted'})).toThrow();expect(()=>readAppPractical({...u,draft:{...u.draft,projects:[]}})).toThrow();
  const bad=emptyAppPractical();bad.draft.projects[0].tables=[{id:'records',columns:['name'],rows:[]}];expect(()=>readAppPractical(bad)).toThrow();
  bad.draft.projects[0].tables=[];bad.draft.projects[0].codeDraft='x'.repeat(30000);expect(()=>readAppPractical(bad)).toThrow();
  let nested:unknown={};for(let i=0;i<60;i++)nested={next:nested};expect(()=>readAppPractical(nested)).toThrow();
});
it('safe runtime limits fail checks instead of awarding evidence or hanging',()=>{
  const p=appLessonProject(5);p.code=parseAppCode('onStart(function(){repeat(1000000,function(){console.log("bounded");});});');expect(appLessonChecks(p,5).every(t=>!t.pass)).toBe(true);
});
it('preserves achieved practice/mastery and support through retries and old-client omission',()=>{
  const old=emptyAppPractical();old.steps.fill(true);old.supportUsed=true;old.mastery={demonstrated:true,transfer:true,attempts:3,last:'demonstrated'};const next=emptyAppPractical();next.mastery.last='not-yet';
  const merged=mergeAppPractical(old,next);expect(merged.steps.every(Boolean)).toBe(true);expect(merged.mastery).toMatchObject({demonstrated:true,transfer:true,attempts:3,last:'not-yet'});expect(merged.supportUsed).toBe(true);
  expect(preserveAchievements({...doc(),appPractical:old},doc()).appPractical).toEqual(old);
});
it('round-trips private lesson work separately from personal apps and legacy course totals',()=>{
  const d={...doc(),appPractical:emptyAppPractical()},entries=hydrateCloud('grade-3',d);expect(entries[appPracticalKey]).toBeTruthy();expect(entries[appLabStorageKey('grade-3')]).toBeUndefined();expect(collectCloud('grade-3',entries)).toEqual(d);
  expect(validCourseDocument('grade-3',progressDocument.parse(d))).toBe(true);expect(validCourseDocument('grade-2',{...d,currentId:'grade-2-sequences-1'})).toBe(false);
  const before=summarizeProgress('grade-3');d.appPractical.steps.fill(true);d.appPractical.mastery.demonstrated=true;const after=summarizeProgress('grade-3',{revision:1,document:d,updatedAt:null});expect(after.total).toBe(before.total);expect(after.stars).toBe(before.stars);expect(after).toMatchObject({practicalCompleted:1,practicalTotal:1,practicalStars:5,practicalMastery:1});
});
