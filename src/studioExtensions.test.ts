import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly/core';
import type { serialization } from 'blockly/core';
import { StudioEngine } from './studioEngine';
import { newStudioProject, saveStudioProject } from './studioProject';
import { studioCategories } from './studioBlocks';
import { studioCodeView } from './studioCode';
import { studioBehaviorFunctions, studioCreationFunctions } from './studioBehaviorDefinitions';
type B = serialization.blocks.State;
const n = (NUM: number): B => ({ type: 'ka_number', fields: { NUM } });
const t = (TEXT: string): B => ({ type: 'ka_studio_text', fields: { TEXT } });
const b = (type: string, values: Record<string, B> = {}, fields: Record<string, string | number> = {}): B => ({ type, fields, inputs: Object.fromEntries(Object.entries(values).map(([name, block]) => [name, { block }])) });
const chain = (blocks: B[]): B | undefined => blocks.reduceRight<B | undefined>((next, block) => ({ ...block, ...(next ? { next: { block: next } } : {}) }), undefined);
const at = (x = 0, y = 0) => b('ka_studio_location', { X: n(x), Y: n(y) });
const refs = (SPRITE = 'all') => b('ka_studio_sprite_ref', {}, { SPRITE });
const emit = (value: B) => b('ka_show_number', { VALUE: value });
const set = (VALUE: B, VAR = 'score') => b('ka_studio_set_variable', { VALUE }, { VAR });
const created = (COUNT = 1) => b('ka_studio_spawn', { COUNT: n(COUNT), LOCATION: at(30, 20) }, { SPRITE: 'this', ASSET: 'current', NAME: 'Friend' });
function project(main: B[], hats: B[] = []) {
  const p = newStudioProject();
  p.sprites[0].code = { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', ...(main.length ? { next: { block: chain(main)! } } : {}) }, ...hats] } };
  return p;
}
function finish(e: StudioEngine, limit = 400) { for (let i = 0; i < limit; i++) if (!e.step()) return e.snapshot(); throw new Error('Unexpected live scripts in finite test'); }
function run(main: B[], hats: B[] = []) { const e = new StudioEngine(project(main, hats), () => .5); try { e.start(); return finish(e); } finally { e.dispose(); } }
const hat = (type: string, main: B[], fields: Record<string,string|number> = {}): B => ({ type, fields, next: { block: chain(main)! } });

describe('Byte Lab screenshot-capability expansion', () => {
  it('composes text, number/Boolean joins, string variables, comparisons and stage text without HTML', () => {
    const result = run([b('ka_studio_set_text', { VALUE: b('ka_studio_join', { A: t('<script>'), B: n(7) }) }, { VAR: 'answer' }), b('ka_studio_say_text', { VALUE: b('ka_studio_text_variable', {}, { VAR: 'answer' }) }), b('ka_studio_print', { VALUE: t('Hello stage'), LOCATION: at(20,-30) }), b('ka_show_boolean', { VALUE: b('ka_studio_text_compare', { A: t('hello'), B: t('ell') }, { OP: 'contains' }) })]);
    expect(result.actors[0].speech).toBe('<script>7'); expect(result.actors[0].output).toEqual([true]);
    expect(result.labels?.[0]).toMatchObject({ text: 'Hello stage', location: { x: 20, y: -30 } });
  });
  it('rejects oversize/control-character text, object text conversions and invalid colors', () => {
    expect(() => run([b('ka_studio_say_text', { VALUE: t('a'.repeat(121)) })])).toThrow('120');
    expect(() => run([b('ka_studio_say_text', { VALUE: t('hello\nsecret') })])).toThrow('printable');
    expect(() => run([b('ka_studio_say_text', { VALUE: at() })])).toThrow();
    expect(() => run([b('ka_studio_background_color', { COLOR: t('url(https://bad.test)') })])).toThrow('six-digit');
  });
  it('queues a question, resumes its script and triggers answer/all-answer events without changing saved source', () => {
    const p = project([b('ka_studio_prompt', { QUESTION: t('Invent a hero name') }, { VAR: 'answer' }), b('ka_studio_say_text', { VALUE: b('ka_studio_text_variable', {}, { VAR: 'answer' }) })], [hat('ka_event_answer', [set(n(2))], { VAR: 'answer' }), hat('ka_event_answers', [set(n(3), 'done')])]);
    const original = saveStudioProject(p), e = new StudioEngine(p);
    try { e.start(); e.step(); expect(e.scene.prompts).toHaveLength(1); const prompt = e.scene.prompts![0]; e.answerPrompt(prompt.id, '<hero>'); const result = finish(e); expect(result.actors[0]).toMatchObject({ speech: '<hero>', variables: { score: 2, done: 3 } }); expect(saveStudioProject(p)).toEqual(original); expect(JSON.stringify(original)).not.toContain('<hero>'); expect(() => e.answerPrompt(prompt.id, 'again')).toThrow('no longer'); } finally { e.dispose(); }
  });
  it('validates choice answers and Stop discards pending questions', () => {
    const e = new StudioEngine(project([b('ka_studio_prompt_choices', { QUESTION: t('Pick') }, { VAR: 'answer', CHOICE1: 'A', CHOICE2: 'B', CHOICE3: 'C' })]));
    try { e.start(); e.step(); const id = e.scene.prompts![0].id; expect(() => e.answerPrompt(id, 'D')).toThrow('displayed'); e.answerPrompt(id, 'B'); finish(e); expect(e.scene.actors[0].textVariables?.answer).toBe('B'); } finally { e.dispose(); }
    const waiting = new StudioEngine(project([b('ka_studio_prompt', { QUESTION: t('Wait') }, { VAR: 'answer' })]));
    waiting.start(); waiting.step(); waiting.stop(); expect(waiting.scene.prompts).toEqual([]); expect(waiting.active).toBe(false); waiting.dispose();
  });
  it('limits pending questions and combined numeric/text variable slots', () => {
    const statements = Array.from({ length: 8 }, (_, i) => b('ka_studio_set_text', { VALUE: t('x') }, { VAR: `text${i}` }));
    expect(() => run(statements)).toThrow('eight');
  });
  it('reads a real monotonic timer in seconds/milliseconds and resets it separately from event schedules', () => {
    let now = 1000; const e = new StudioEngine(project([emit(b('ka_studio_timer', {}, { UNIT: 'milliseconds' })), b('ka_studio_reset_timer'), emit(b('ka_studio_timer', {}, { UNIT: 'seconds' }))]), () => .5, () => now);
    try { e.start(); now = 3500; e.step(); e.step(); now = 4250; e.step(); expect(e.scene.actors[0].output).toEqual([2500, .75]); } finally { e.dispose(); }
  });
  it('fires clock events during a two-second wait without finishing that wait early', () => {
    let now = 0; const e = new StudioEngine(project([b('ka_sprite_wait', {}, { SECONDS: 2 }), b('ka_sprite_say', {}, { TEXT: 'after wait' })], [hat('ka_event_at', [set(n(5))], { SECONDS: .1 }), hat('ka_event_every', [set(n(7), 'repeated')], { SECONDS: .2 })]), () => .5, () => now);
    try { e.start(); e.step(true); for (now = 50; now <= 500; now += 50) e.step(true); expect(e.scene.actors[0].variables).toMatchObject({ score: 5, repeated: 7 }); expect(e.scene.actors[0].speech).toBe(''); now = 2000; for (let i=0;i<10;i++) e.step(true); expect(e.scene.actors[0].speech).toBe('after wait'); e.stop(); expect(e.active).toBe(false); } finally { e.dispose(); }
  });
  it('reads held keys and pointer state, applies drag offsets and clears input', () => {
    const p = project([b('ka_studio_draggable', {}, { MODE: 'start' })], [hat('ka_event_click', [b('ka_show_boolean', { VALUE: b('ka_studio_key_down', {}, { KEY: 'ArrowRight' }) }), b('ka_studio_goto_location', { LOCATION: b('ka_studio_pointer_location') })])]);
    const e = new StudioEngine(p); try { e.start(); finish(e); e.setKey('ArrowRight', true); e.setPointer(20,30); e.trigger('click', p.selected); finish(e); expect(e.scene.actors[0]).toMatchObject({ x:20, y:30, output:[true] }); e.setPointer(18,28,true,p.selected); e.setPointer(40,50,true); expect(e.scene.actors[0]).toMatchObject({ x:42,y:52 }); e.clearInput(); e.setPointer(90,90); expect(e.scene.actors[0].x).toBe(42); } finally { e.dispose(); }
  });
  it('supports location values, offsets, components and random jumps with explicit coordinate bounds', () => {
    const result = run([b('ka_studio_goto_location', { LOCATION: b('ka_studio_location_offset', { LOCATION: at(10,20), VALUE: n(30) }, { DIRECTION: 'north' }) }), emit(b('ka_studio_location_axis', { LOCATION: b('ka_studio_sprite_location', {}, { SPRITE: 'this' }) }, { AXIS: 'y' })), b('ka_studio_goto_location', { LOCATION: b('ka_studio_random_location') })]);
    expect(result.actors[0]).toMatchObject({ x:0,y:0,output:[50] });
    expect(() => run([b('ka_studio_goto_location', { LOCATION: at(101,0) })])).toThrow('location');
  });
  it('spawns named temporary sprites, runs their created hats and retains their template for costume changes', () => {
    const p = project([created(2)], [hat('ka_event_created', [b('ka_sprite_say', {}, { TEXT: 'Born' }), b('ka_studio_next_costume')])]);
    const before = structuredClone(p), e = new StudioEngine(p); try { e.start(); const scene = finish(e); expect(scene.actors).toHaveLength(3); expect(scene.actors.slice(1).map(a=>a.speech)).toEqual(['Born','Born']); expect(scene.actors[1]).toMatchObject({ x:30,y:20,sourceId:p.selected }); expect(p).toEqual(before); } finally { e.dispose(); }
  });
  it('targets last-created/all/costume groups for actions, counting, touching and removal', () => {
    const scene = run([created(3), b('ka_studio_for_sprites', { TARGET: b('ka_studio_last_created'), DO: b('ka_studio_size', { VALUE:n(40) }) }), emit(b('ka_studio_sprite_count', { TARGET: b('ka_studio_costume_group', {}, { ASSET:'current' }) })), b('ka_studio_remove', { TARGET:b('ka_studio_last_created') }), emit(b('ka_studio_sprite_count', { TARGET:refs() }))]);
    expect(scene.actors).toHaveLength(1); expect(scene.actors[0].output).toEqual([4,1]);
  });
  it('enforces spawn budgets, name/template/asset references and does not spawn from all sprites', () => {
    expect(()=>run([created(21)])).toThrow('1–20'); expect(()=>run([created(20),created(20)])).toThrow('32');
    const invalid = created(); invalid.fields!.SPRITE = 'all'; const p = project([invalid]); p.sprites.push({...p.sprites[0], id:'friend', name:'Friend'}); expect(()=>{const e=new StudioEngine(p);try{e.start();finish(e);}finally{e.dispose();}}).toThrow('one sprite');
    expect(()=>run([b('ka_studio_spawn',{ COUNT:n(1), LOCATION:at() },{SPRITE:'this',NAME:'X',ASSET:'missing'})])).toThrow('costume');
  });
  it('keeps behavior lifecycle independent from ordinary scripts and accepts personal editable function bodies', () => {
    const definition = b('ka_studio_define', { DO:b('ka_studio_axis',{VALUE:n(2)},{MODE:'change',AXIS:'x'}) }, { NAME:'my_behavior',PARAM:'none' });
    const e = new StudioEngine(project([b('ka_studio_behavior',{}, {MODE:'start',NAME:'my_behavior'})],[definition,hat('ka_event_key',[b('ka_studio_behavior',{}, {MODE:'stop',NAME:'my_behavior'})],{KEY:' '})]));
    try{e.start();for(let i=0;i<8;i++)e.step();expect(e.scene.actors[0].x).toBeGreaterThan(2);e.trigger('key',undefined,' ');finish(e);const x=e.scene.actors[0].x;expect(e.active).toBe(false);expect(e.step()).toBeNull();expect(e.scene.actors[0].x).toBe(x);}finally{e.dispose();}
  });
  it('preserves personal functions whose names resemble new built-in helpers', () => {
    const definition = b('ka_studio_define', { DO: set(n(42)) }, { NAME: 'sys_moving_east', PARAM: 'none' });
    expect(run([b('ka_function_call', {}, { NAME: 'sys_moving_east' })], [definition]).actors[0].variables.score).toBe(42);
  });
  it.each(studioBehaviorFunctions)('executes $name from inspectable ordinary blocks and refuses system replacement', f => {
    const e = new StudioEngine(project([b('ka_studio_behavior',{}, {NAME:f.name,MODE:'start'})]));
    try{e.start();e.setKey('ArrowRight',true);for(let i=0;i<12;i++)expect(e.step()).not.toBeNull();e.stop();expect(e.active).toBe(false);}finally{e.dispose();}
    expect(()=>new StudioEngine(project([], [f.block]))).toThrow('read-only');
    expect(studioCodeView(project([b('ka_studio_behavior',{}, {NAME:f.name,MODE:'start'})]).sprites[0].code,'Byte')).toContain(`functions["${f.name}"]`);
  });
  it('builds a grid with counted loops, arithmetic and spawn primitives rather than a hidden game instruction', () => {
    const scene=run([b('ka_function_call',{ARG:n(10)},{NAME:'@make_grid'})]);expect(scene.actors).toHaveLength(11);expect(new Set(scene.actors.slice(1).map(a=>`${a.x},${a.y}`)).size).toBe(10);
    const code=studioCodeView(project([b('ka_function_call',{ARG:n(10)},{NAME:'@make_grid'})]).sprites[0].code,'Byte');expect(code).toContain('createSprites(');expect(code).toContain('for (vars[');expect(code).toContain('Math.floor');
  });
  it('builds a moving burst from creation, group iteration, random headings and an inspectable motion behavior', () => {
    const e=new StudioEngine(project([b('ka_function_call',{ARG:n(3)},{NAME:'@make_burst'})]),()=>.25);
    try{e.start();for(let i=0;i<35;i++)e.step();expect(e.scene.actors).toHaveLength(4);expect(e.scene.actors.slice(1).every(a=>a.x!==0||a.y!==0)).toBe(true);}finally{e.dispose();}
    const code=studioCodeView(project([b('ka_function_call',{ARG:n(3)},{NAME:'@make_burst'})]).sprites[0].code,'Byte');expect(code).toContain('functions["@moving_forward"]');
  });
  it('supports background colors/title/hide, color predicates/tint/remove, sound requests and positioned counters', () => {
    const scene=run([b('ka_studio_background_color',{COLOR:b('ka_studio_random_color')}),b('ka_studio_title',{TITLE:t('Welcome'),SUBTITLE:t('Play')}),b('ka_studio_tint',{COLOR:b('ka_studio_color',{}, {COLOR:'#ff0000'})}),b('ka_studio_clear_tint'),b('ka_studio_sound',{}, {SOUND:'ping'}),b('ka_studio_monitor_at',{LOCATION:at(20,40)},{VAR:'score'}),b('ka_show_boolean',{VALUE:b('ka_studio_costume_is',{}, {ASSET:'current'})})]);
    expect(scene.backgroundColor).toBe('#800000');expect(scene.title?.title).toBe('Welcome');expect(scene.actors[0].tint).toBeUndefined();expect(scene.sounds?.[0].name).toBe('ping');expect(scene.actors[0].monitorPositions?.score).toMatchObject({x:20,y:40});expect(scene.actors[0].output).toEqual([true]);
    expect(run([b('ka_studio_title',{TITLE:t('A'),SUBTITLE:t('B')}),b('ka_studio_hide_title')]).title).toBeUndefined();
  });
  it.each([['round',2.6,3],['floor',-2.1,-3],['ceiling',2.1,3],['square_root',81,9],['absolute',-4,4]] as const)('executes %s', (OP,value,result)=>{expect(run([emit(b('ka_studio_math',{VALUE:n(value)},{OP}))]).actors[0].output).toEqual([result]);});
  it('supports descending/inclusive counted loops, chance 0/100, comments, and rejects invalid steps/math',()=>{
    const count=b('ka_studio_for',{FROM:n(5),TO:n(1),BY:n(-2),DO:emit(b('ka_studio_variable',{}, {VAR:'counter'}))},{VAR:'counter'});
    const scene=run([b('ka_studio_comment',{}, {TEXT:'Count down'}),count,b('ka_studio_chance',{VALUE:n(0),DO:emit(n(99))}),b('ka_studio_chance',{VALUE:n(100),DO:emit(n(10))})]);expect(scene.actors[0].output).toEqual([5,3,1,10]);
    expect(()=>run([b('ka_studio_for',{FROM:n(0),TO:n(10),BY:n(0),DO:emit(n(1))},{VAR:'i'})])).toThrow('non-zero');expect(()=>run([emit(b('ka_studio_math',{VALUE:n(-1)},{OP:'square_root'}))])).toThrow('non-negative');
  });
  it('registers every category type and translates each new visible block, including shadow arguments',()=>{
    const ws=new Blockly.Workspace();try{for(const type of new Set(studioCategories.flatMap(c=>c.types))){const block=ws.newBlock(type),state=Blockly.serialization.blocks.save(block)!;const output=!!block.outputConnection;const source=type.startsWith('ka_event_')?project([], [state]):project([output?b('ka_studio_print',{VALUE:state,LOCATION:at()}):state]);expect(()=>studioCodeView(source.sprites[0].code,'Byte'),type).not.toThrow();}}finally{ws.dispose();}
    expect(studioCodeView(project([{type:'ka_function_call',fields:{NAME:studioCreationFunctions[1].name},inputs:{ARG:{shadow:n(2)}}}]).sprites[0].code,'Byte')).toContain('functions["@make_grid"](2)');
  });
});
