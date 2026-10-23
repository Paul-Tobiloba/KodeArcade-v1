import { z } from 'zod';
import { boundedAppData, newElement, readAppGallery, type AppBlock, type AppProject } from './appLab.js';
import { codingPractical } from './codingPractical.js';

export const appPracticalKey = 'kodearcade-app-practical-v1:grade-3';
export function lessonIds(step:number) { return step===5 ? {input:'visitor',hello:'welcome',message:'greeting',total:'points',tap:'earn',reset:'clear'} : {input:'nickname',hello:'hello',message:'message',total:'total',tap:'tap',reset:'reset'}; }
export const greetingPrefix = (step:number,variant=0) => step===2?'Welcome, ':step===5?(variant?'Welcome, ':'Hi, '):'Hello, ';
export const counterIncrement = (step:number,variant=0) => step===4?2:step===5?(variant?2:3):1;
const value=(v:string|number):AppBlock=>typeof v==='number'?{type:'al_number',fields:{NUM:v}}:{type:'al_text',fields:{TEXT:v}};
const connect=(block:AppBlock)=>({block});
const variable=():AppBlock=>({type:'al_var',fields:{NAME:'count'}});
const setCount=(v:AppBlock):AppBlock=>({type:'al_set_var',fields:{NAME:'count'},inputs:{VALUE:connect(v)}});
const text=(id:string,v:AppBlock):AppBlock=>({type:'al_set_text',fields:{ID:id},inputs:{VALUE:connect(v)}});
function chain(...blocks:AppBlock[]):AppBlock { blocks.slice(0,-1).forEach((b,i)=>b.next=connect(blocks[i+1]));return blocks[0]; }
function handler(id:string,action:AppBlock,event='click'):AppBlock {return {type:'al_event',fields:{ID:id,EVENT:event},inputs:{DO:connect(action)}};}
/** Authored lesson copies are separate from the child's personal App Lab gallery. */
export function appLessonProject(step:number,variant=0,solved=false):AppProject {
  const id=lessonIds(step),broken=!solved&&(step===3||step===5),prefix=solved?greetingPrefix(step,variant):'Hello, ',increment=solved?counterIncrement(step,variant):1;
  const controls:[Parameters<typeof newElement>[0],string,string,number,number,number,number][]=[
    ['label','heading','Hello & Count',24,18,272,38],['label','inputHelp','Use a pretend nickname',24,62,272,28],
    ['input',id.input,'Coder',24,98,272,44],['button',id.hello,'Say hello',24,154,272,44],
    ['label',id.message,'Ready',24,210,272,52],['label',id.total,'0',24,272,272,48],
    ['button',id.tap,'Add points',24,338,130,44],['button',id.reset,'Reset counter',166,338,130,44],
  ];
  const greeting:AppBlock={type:'al_join',inputs:{A:connect(value(prefix)),B:connect({type:'al_read',fields:{ID:broken&&step===5?id.message:id.input,MODE:'text'}})}};
  return {id:'3a000000-0000-4000-8000-000000000003',title:'Hello & Count',screens:[{id:'home',background:'#f7f4fe'}],initialScreen:'home',tables:[],elements:controls.map(([kind,key,label,x,y,width,height])=>({...newElement(kind,key,'home',x,y),text:label,width,height,fontSize:key==='heading'?26:key===id.total?30:16})),code:{blocks:{languageVersion:0,blocks:[
    {type:'al_start',inputs:{DO:connect(chain(setCount(value(broken?5:0)),text(id.total,variable()),text(id.message,value('Ready'))))}},
    handler(id.hello,text(id.message,greeting)),
    handler(id.tap,chain(setCount({type:'al_math',fields:{OP:'+'},inputs:{A:connect(variable()),B:connect(value(increment))}}),text(id.total,variable())),broken?'change':'click'),
    handler(id.reset,broken?text(id.total,value(0)):chain(setCount(value(0)),text(id.total,variable()))),
  ]}}};
}

function lessonProject(value:unknown):AppProject {
  if(!boundedAppData(value)||JSON.stringify(value).length>30000)throw new Error('Keep each lesson app under 30 KB.');
  const p=value as AppProject;
  const safe=readAppGallery({version:1,activeId:p?.id,projects:[p]}).projects[0];
  if(safe.tables.length||safe.screens.length!==1||safe.initialScreen!=='home'||safe.elements.length>12)throw new Error('This unit uses one screen and no data tables. Keep personal projects in App Lab.');
  return safe;
}
const project = z.unknown().transform((value,ctx)=>{try{return lessonProject(value);}catch{ctx.addIssue({code:'custom',message:'Invalid bounded lesson app.'});return z.NEVER;}});
const schema=codingPractical.omit({unitId:true,draft:true}).extend({unitId:z.literal('g3-app-events-v1'),draft:z.object({step:z.number().int().min(0).max(5),projects:z.array(project).length(6),responses:z.array(z.object({prediction:z.number().int().min(-1).max(2),reason:z.number().int().min(-1).max(2)}).strict()).length(6),checkSupport:z.boolean(),variant:z.number().int().min(0).max(1)}).strict()});
export type AppPracticalSave=z.infer<typeof schema>;
export function readAppPractical(value:unknown):AppPracticalSave {if(!boundedAppData(value))throw new Error('This lesson save is too large or nested.');return schema.parse(value);}
export function emptyAppPractical():AppPracticalSave {return {version:1,unitId:'g3-app-events-v1',steps:Array(5).fill(false),attempts:0,supportUsed:false,mastery:{demonstrated:false,transfer:false,attempts:0,last:'none'},draft:{step:0,projects:Array.from({length:6},(_,step)=>appLessonProject(step)),responses:Array.from({length:6},()=>({prediction:-1,reason:-1})),checkSupport:false,variant:0}};}
export function mergeAppPractical(old:AppPracticalSave|undefined,next:AppPracticalSave):AppPracticalSave {if(!old)return next;return {...next,steps:next.steps.map((v,i)=>v||old.steps[i]),attempts:Math.max(old.attempts,next.attempts),supportUsed:old.supportUsed||next.supportUsed,mastery:{...next.mastery,demonstrated:old.mastery.demonstrated||next.mastery.demonstrated,transfer:old.mastery.transfer||next.mastery.transfer,attempts:Math.max(old.mastery.attempts,next.mastery.attempts)}};}
