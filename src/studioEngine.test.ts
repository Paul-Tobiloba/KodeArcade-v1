import { describe, expect, it } from 'vitest';
import { StudioEngine } from './studioEngine';
import { newStudioProject, readStudioProject, readStudioBackup, migrateStudioCode, saveStudioProject, studioProjectSchema, blankStudioCode, type StudioProject } from './studioProject';
import { parseConceptCode } from './conceptText';
import type { serialization } from 'blockly/core';
type State = serialization.blocks.State;
const code = (main: string, events: [string, string, Record<string, string>?][] = []) => ({ blocks: { languageVersion: 0, blocks: [parseConceptCode(main), ...events.map(([type, body, fields], i) => ({ type: `ka_event_${type}`, id: `event-${i}`, fields, next: parseConceptCode(body).next, x: 300, y: i * 150 }))] } });
const project = (main: string, events?: [string, string, Record<string, string>?][]) => { const p = newStudioProject(); p.sprites[0].code = code(main, events); return p; };
function finish(engine: StudioEngine, limit = 200) { for (let i = 0; i < limit; i++) if (!engine.step()) return engine.snapshot(); throw new Error('Test frame limit exceeded'); }
function run(main: string, events?: [string, string, Record<string, string>?][]) { const engine = new StudioEngine(project(main, events)); try { engine.start(); return finish(engine); } finally { engine.dispose(); } }
function second(p: StudioProject, main: string, events?: [string, string, Record<string, string>?][]) {
  p.assets.push({ id: 'dash', name: 'Dash', kind: 'character', ref: 'Dash' }); p.sprites.push({ ...p.sprites[0], id: 'friend', name: 'Dash', costume: 'dash', costumes: ['dash'], x: 50, code: code(main, events) }); return p;
}
describe('dedicated multi-sprite Byte Lab', () => {
  it('keeps the first editor’s raw saved workspace while migrating registrations to native hats', () => {
    const old = { blocks: { languageVersion: 0, blocks: [{ ...parseConceptCode('on_click:\n    say("Clicked")\nscore = 1'), data: JSON.stringify({ character: 'Fix', buddy: 'Gigi', background: 'meadow', buddyX: -40, buddyY: 30 }) }] } };
    const p = readStudioProject(old); expect(p.legacy).toEqual(old); expect(p.sprites[0].name).toBe('Fix'); expect(p.sprites[1]).toMatchObject({ name: 'Gigi', x: -40, y: 30 });
    const blocks = (p.sprites[0].code.blocks as { blocks: State[] }).blocks; expect(blocks.map(b => b.type)).toEqual(['ka_start', 'ka_event_click']);
    const engine = new StudioEngine(p); try { engine.start(); finish(engine); engine.trigger('click', p.sprites[0].id); expect(finish(engine).actors[0].speech).toBe('Clicked'); } finally { engine.dispose(); }
    expect(readStudioProject(saveStudioProject(p))).toEqual(p);
  });
  it('runs two sprite scripts cooperatively, with independent variables', () => {
    const p = second(project('score = 1\nforward(20)\nsay_number(score)'), 'score = 9\nbackward(20)\nsay_number(score)');
    const e = new StudioEngine(p); try { e.start(); const scene = finish(e); expect(scene.actors[0]).toMatchObject({ x: 20, speech: '1', variables: { score: 1 } }); expect(scene.actors[1]).toMatchObject({ x: 30, speech: '9', variables: { score: 9 } }); } finally { e.dispose(); }
  });
  it('reacts on both sprites when either moves into contact', () => {
    const p = second(project('forward(50)', [['touch', 'say("I met you")']]), '', [['touch', 'say("Hello friend")']]);
    const e = new StudioEngine(p); try { e.start(); const scene = finish(e); expect(scene.actors.map(a => a.speech)).toEqual(['I met you', 'Hello friend']); expect(scene.events.filter(s => s.includes('touch'))).toHaveLength(2); } finally { e.dispose(); }
  });
  it('does not trigger contact repeatedly while overlapping', () => {
    const scene = run('forward(50)\nforward(5)', [['touch', 'say("hello")']]); expect(scene.events).toEqual([]);
    const p = second(project('forward(50)\nforward(5)', [['touch', 'score = score + 1']]), ''); const e = new StudioEngine(p);
    try { e.start(); expect(finish(e).actors[0].variables.score).toBe(1); } finally { e.dispose(); }
  });
  it('routes repeated clicks to the correct sprite without restarting other scripts', () => {
    const p = second(project('score = 1', [['click', 'score = score + 1\nsay_number(score)']]), 'score = 10', [['click', 'score = score + 2']]);
    const e = new StudioEngine(p); try { e.start(); finish(e); e.trigger('click', 'friend'); finish(e); e.trigger('click', p.selected); const scene = finish(e); expect(scene.actors.map(a => a.variables.score)).toEqual([2, 12]); } finally { e.dispose(); }
  });
  it('handles arrow/space events only for the selected key', () => {
    const e = new StudioEngine(project('', [['key', 'forward(10)', { KEY: 'ArrowRight' }]]));
    try { e.start(); finish(e); e.trigger('key', undefined, 'ArrowLeft'); expect(e.active).toBe(false); e.trigger('key', undefined, 'ArrowRight'); expect(finish(e).actors[0].x).toBe(10); } finally { e.dispose(); }
  });
  it('stops forever scripts, without deleting code or state', () => {
    const p = project(''); const root = parseConceptCode('forward(10)'); p.sprites[0].code = { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: { type: 'ka_studio_forever', inputs: { DO: { block: root.next!.block! } } } } }] } };
    const e = new StudioEngine(p); try { e.start(); for (let i = 0; i < 5; i++) expect(e.step()).not.toBeNull(); e.stop(); expect(e.active).toBe(false); expect(e.step()).toBeNull(); expect(e.snapshot().actors[0].x).toBe(50); } finally { e.dispose(); }
  });
  it('bounces on a border event and retains a safe bounded stage', () => {
    const scene = run('forward(150)\nforward(20)', [['edge', 'bounce()\nsay("Edge")']]); expect(scene.actors[0].angle).toBe(180); expect(scene.actors[0].x).toBeLessThan(100); expect(scene.actors[0].speech).toBe('Edge');
  });
  it('supports independent function call stacks in concurrent scripts', () => {
    const p = project('def greet():\n    wait(1)\n    say("Hello")\ngreet()', [['click', 'greet()']]); const e = new StudioEngine(p);
    try { e.start(); e.step(); e.step(); e.trigger('click', p.selected); expect(finish(e).actors[0].speech).toBe('Hello'); } finally { e.dispose(); }
  });
  it('composes numeric returns with Boolean decisions and movement', () => {
    expect(run('def double(value):\n    return value * 2\nscore = double(3)\nif score > 5 and not False:\n    forward(score)\nelse:\n    say("No")').actors[0]).toMatchObject({ x: 6, variables: { score: 6 } });
  });
  it('preserves safe text as data, not HTML', () => { expect(run('say("<script>not markup</script>")').actors[0].speech).toBe('<script>not markup</script>'); });
  it.each([
    ['forward(201)', 'at most 200'], ['go_to(101, 0)', 'coordinates'], ['score = 1 / 0', 'divide by zero'],
    ['def f():\n    f()\nf()', 'recursion'], ['say_number(value)', 'inside a function'],
  ])('rejects %s', (main, error) => { expect(() => run(main)).toThrow(error); });
  it('rejects floating blocks without rewriting the original draft', () => {
    const p = project('say("keep me")'); const old = structuredClone(p); (p.sprites[0].code.blocks as { blocks: State[] }).blocks.push({ type: 'ka_sprite_say', fields: { TEXT: 'loose' } });
    expect(() => new StudioEngine(p)).toThrow('loose blocks'); expect(old.sprites[0].code).not.toEqual(p.sprites[0].code);
  });
  it('bounds project size, sprite count, metadata and drawing coordinates', () => {
    const p = newStudioProject(); expect(studioProjectSchema.safeParse(p).success).toBe(true);
    expect(studioProjectSchema.safeParse({ ...p, title: '<hello>' }).success).toBe(true);
    expect(studioProjectSchema.safeParse({ ...p, sprites: Array(5).fill(p.sprites[0]) }).success).toBe(false);
    expect(studioProjectSchema.safeParse({ ...p, assets: [...p.assets, { id: 'bad', name: 'bad', kind: 'character', ref: 'https://external.test/img.png' }] }).success).toBe(false);
    expect(studioProjectSchema.safeParse({ ...p, selected: 'missing' }).success).toBe(false);
    expect(studioProjectSchema.safeParse({ ...p, assets: [...p.assets, { id: 'draw', name: 'draw', kind: 'drawing', strokes: [{ tool: 'pen', color: '#ffffff', width: 4, points: [[900, 20]] }] }] }).success).toBe(false);
    expect(() => readStudioProject({ byteStudio: { version: 999 } })).toThrow();
  });
  it('does not mutate saved block layouts while running', () => { const p = project('say("hi")', [['click', 'forward(10)']]), before = structuredClone(p); const e = new StudioEngine(p); try { e.start(); finish(e); e.trigger('click', p.selected); finish(e); expect(p).toEqual(before); } finally { e.dispose(); } });
  it('keeps blank scripts valid and upgrades only top-level legacy registrations', () => { expect(migrateStudioCode(blankStudioCode())).toEqual(blankStudioCode()); const e = new StudioEngine(newStudioProject()); try { e.start(); expect(e.step()).toBeNull(); } finally { e.dispose(); } });
  it('accepts only known library bases and keeps painted costumes separate from backgrounds', () => {
    const p = newStudioProject();
    p.assets.push({ id: 'paint', name: 'Painted Byte', kind: 'drawing', purpose: 'costume', base: { kind: 'character', ref: 'Byte' }, strokes: [{ tool: 'eraser', color: '#ffffff', width: 8, points: [[10, 10], [20, 20]] }] });
    p.sprites[0].costumes.push('paint'); p.sprites[0].costume = 'paint';
    expect(readStudioProject(saveStudioProject(p))).toEqual(p);
    const bad = structuredClone(p); bad.assets[2].base = { kind: 'character', ref: 'https://external.test/image.png' };
    expect(studioProjectSchema.safeParse(bad).success).toBe(false);
    expect(studioProjectSchema.safeParse({ ...p, backdrop: 'paint' }).success).toBe(false);
    p.assets[2].purpose = 'background';
    expect(studioProjectSchema.safeParse(p).success).toBe(false);
  });
  it('supports practical lab repeat counts without changing guided lesson limits', () => {
    const p = project('');
    const body = parseConceptCode('show_number(1)').next!;
    const repeat = { type: 'ka_studio_repeat', fields: { COUNT: 10 }, inputs: { DO: body } };
    p.sprites[0].code = { blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', next: { block: repeat } }] } };
    const e = new StudioEngine(p);
    try { e.start(); expect(finish(e).actors[0].output).toHaveLength(10); expect(e.contexts[0].ws.getBlocksByType('ka_studio_repeat', false)[0].getFieldValue('COUNT')).toBe(10); } finally { e.dispose(); }
  });
  it('rejects unsupported backups and invalid stored projects rather than replacing them with empty work', () => {
    for (const data of [{}, [], null, { byteStudio: null }, { byteStudio: false }, { blocks: {} }, { blocks: { blocks: [] } }]) expect(() => readStudioBackup(data)).toThrow();
    for (const data of [{ byteStudio: null }, { byteStudio: false }]) expect(() => readStudioProject(data)).toThrow();
    const p = newStudioProject(); expect(readStudioBackup(saveStudioProject(p))).toEqual(p);
    expect(readStudioBackup(blankStudioCode()).legacy).toEqual(blankStudioCode());
  });
});
