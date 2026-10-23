import { counterIncrement, greetingPrefix, lessonIds } from '../shared/appPractical';
import type { AppProject } from '../shared/appLab';
import { AppRuntime, type AppScene } from './appLabRuntime';
export function appLessonChecks(project:AppProject,step:number,variant=0) {
  const id=lessonIds(step),prefix=greetingPrefix(step,variant),increment=counterIncrement(step,variant);
  const text=(scene:AppScene,id:string)=>{if(scene.error)throw new Error(scene.error);return scene.elements.find(e=>e.id===id)?.text;};
  const engine=()=>{const runtime=new AppRuntime(project);const scene=runtime.start();if(scene.error)throw new Error(scene.error);return runtime;};
  const check=(name:string,test:()=>boolean)=>{try{return {name,pass:test()};}catch(error){return {name,pass:false,detail:error instanceof Error?error.message:'Check the program.'};}};
  const greeting=()=>['Byte','Nova',''].every(name=>{const runtime=engine();runtime.inputValue(id.input,name);return text(runtime.event(id.hello,'click'),id.message)===prefix+name;});
  const cases=[
    check('Run shows Ready before the greeting event',()=>text(engine().snapshot(),id.message)==='Ready'),
    check('The greeting reads different inputs, including empty text',greeting),
    check('Changing input alone does not greet; the button click does',()=>{const runtime=engine();runtime.inputValue(id.input,'Milo');return text(runtime.event(id.input,'change'),id.message)==='Ready'&&text(runtime.event(id.hello,'click'),id.message)===prefix+'Milo';}),
  ];
  if(step>=3)cases.push(
    check('Start initializes count and its label to zero',()=>{const s=engine().snapshot();return text(s,id.total)==='0'&&new Map(s.variables).get('count')===0;}),
    check(`Three clicks update the count and label by ${increment} each time`,()=>{const r=engine();return [1,2,3].every(n=>{const s=r.event(id.tap,'click');return text(s,id.total)===String(n*increment)&&new Map(s.variables).get('count')===n*increment;});}),
    check('Reset changes the variable too; the next click starts over',()=>{const r=engine();r.event(id.tap,'click');r.event(id.tap,'click');const reset=r.event(id.reset,'click');return text(reset,id.total)==='0'&&new Map(reset.variables).get('count')===0&&text(r.event(id.tap,'click'),id.total)===String(increment);}),
    check('Greeting and counter events keep each other’s output',()=>{const r=engine();r.inputValue(id.input,'Dash');r.event(id.hello,'click');r.event(id.tap,'click');const s=r.event(id.reset,'click');return text(s,id.message)===prefix+'Dash'&&text(s,id.total)==='0';}),
  );
  return cases;
}
