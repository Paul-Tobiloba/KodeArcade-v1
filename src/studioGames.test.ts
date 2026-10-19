import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly/core';
import { StudioEngine } from './studioEngine';
import { studioStarterProject, studioStarters } from './studioStarters';
import { studioCodeView } from './studioCode';
import { newStudioProject, saveStudioProject, readStudioBackup } from './studioProject';
import { studioSystemFunctions } from './studioFunctions';
import { parseConceptCode } from './conceptText';
type B = Blockly.serialization.blocks.State;
const number = (NUM: number): B => ({ type: 'ka_number', fields: { NUM } });
const sequence = (...blocks: B[]): B | undefined => blocks.reduceRight<B | undefined>((next, block) => ({ ...block, ...(next ? { next: { block: next } } : {}) }), undefined);
const code = (blocks: B[], hats: B[] = []) => ({ blocks: { languageVersion: 0, blocks: [{ type: 'ka_start', ...(blocks.length ? { next: { block: sequence(...blocks) } } : {}) }, ...hats] } });
function drain(engine: StudioEngine, max = 400) { for (let i = 0; i < max; i++) if (!engine.step()) return; throw new Error('Did not finish'); }
describe('editable games, stories, functions and code view', () => {
  it('includes every starter and exports their complete editable code without evaluating it', () => {
    expect(studioStarters).toHaveLength(9);
    for (const starter of studioStarters) {
      const p = studioStarterProject(starter.id);
      expect(readStudioBackup(saveStudioProject(p))).toEqual(p);
      for (const sprite of p.sprites) {
        const text = studioCodeView(sprite.code, sprite.name);
        expect(text).toContain('onRun('); expect(text).toContain('read-only');
        expect(text).not.toContain('undefined);');
      }
    }
  });
  it('code view preregisters legacy functions, preserves modulo semantics and initializes changed counters', () => {
    const legacy = { blocks: { languageVersion: 0, blocks: [parseConceptCode('def double(value):\n    return value * 2\nscore = double(3)')] } };
    const text = studioCodeView(legacy, 'Byte');
    expect(text.indexOf('functions["double"] =')).toBeLessThan(text.indexOf('onRun('));
    const view = studioCodeView(code([{ type: 'ka_studio_change_variable', fields: { VAR: 'points' }, inputs: { VALUE: { block: { type: 'ka_arithmetic', fields: { OP: '%' }, inputs: { A: { block: number(-1) }, B: { block: number(3) } } } } } }]), 'Byte');
    expect(view).toContain('vars["points"] = (vars["points"] ?? 0) + positiveModulo(-1, 3)');
  });
  it('racing keeps three lanes, supports steering and ends on an ordinary collision conditional', () => {
    const p = studioStarterProject('racing'), before = structuredClone(p), engine = new StudioEngine(p, () => .5);
    try {
      engine.start(); engine.trigger('key', undefined, 'ArrowLeft');
      for (let i = 0; i < 300 && engine.active; i++) engine.step();
      const scene = engine.snapshot(); expect(scene.actors[0].x).toBe(-50); expect(scene.actors[0].variables.score).toBeGreaterThan(0);
      expect(scene.actors.some(a => a.speech.includes('Bump'))).toBe(true); expect(engine.active).toBe(false);
      engine.trigger('key', undefined, 'ArrowRight'); expect(engine.active).toBe(false);
      expect(p).toEqual(before);
    } finally { engine.dispose(); }
  });
  it('racing accelerates both traffic cars only above 50, once per run, and resets on restart', () => {
    // Keep respawned traffic in the right lane, leaving the unsteered player safe.
    const p = studioStarterProject('racing'), before = structuredClone(p), engine = new StudioEngine(p, () => .99);
    try {
      engine.start(); let at50 = false, at51 = false, fast = false;
      for (let i = 0; i < 5000 && engine.active; i++) {
        engine.step(); const [driver, ...traffic] = engine.scene.actors;
        if (driver.variables.score === 50) { at50 = true; expect(traffic.map(a => a.variables.speed)).toEqual([4, 4]); }
        if (driver.variables.score === 51) at51 = true;
        if (at51 && traffic.every(a => a.variables.speed === 7)) { fast = true; break; }
      }
      expect(at50).toBe(true); expect(at51).toBe(true); expect(fast).toBe(true);
      for (let i = 0; i < 250; i++) engine.step();
      expect(engine.scene.actors.slice(1).map(a => a.variables.speed)).toEqual([7, 7]);
      expect(engine.scene.actors[0].variables.boosted).toBe(1);
      expect(engine.scene.events.filter(event => event.endsWith(': message'))).toHaveLength(2);
      expect(p).toEqual(before);
      const text = studioCodeView(p.sprites[0].code, 'Your car');
      expect(text).toContain('(vars["score"] > 50)'); expect(text).toContain('broadcast("speed_up")');
    } finally { engine.dispose(); }
    const restarted = new StudioEngine(p);
    try {
      restarted.start(); for (let i = 0; i < 12; i++) restarted.step();
      expect(restarted.scene.actors[0].variables.score).toBeLessThan(50);
      expect(restarted.scene.actors.slice(1).map(a => a.variables.speed)).toEqual([4, 4]);
    } finally { restarted.dispose(); }
  });
  it('lets children change the racing threshold and faster speed using the existing blocks', () => {
    const engine = new StudioEngine(studioStarterProject('racing'), () => .99);
    try {
      const check = engine.contexts[0].ws.getBlocksByType('ka_compare', false).find(b => b.getInputTargetBlock('A')?.getFieldValue('VAR') === 'score')!;
      check.getInputTargetBlock('B')!.setFieldValue(2, 'NUM');
      for (const traffic of engine.contexts.slice(1)) {
        const boost = traffic.ws.getBlocksByType('ka_event_message', false)[0].getNextBlock()!;
        boost.getInputTargetBlock('VALUE')!.setFieldValue(9, 'NUM');
      }
      engine.start();
      for (let i = 0; i < 400 && !engine.scene.actors.slice(1).every(a => a.variables.speed === 9); i++) engine.step();
      expect(engine.scene.actors[0].variables.score).toBe(3);
      expect(engine.scene.actors.slice(1).map(a => a.variables.speed)).toEqual([9, 9]);
    } finally { engine.dispose(); }
  });
  it('basketball bounces off its player, scores at the hoop and continues until a miss', () => {
    const engine = new StudioEngine(studioStarterProject('basketball'));
    try {
      engine.start(); let bounced = false, scored = false;
      for (let i = 0; i < 1800 && engine.active; i++) {
        const ball = engine.scene.actors[0], player = engine.scene.actors[1];
        if (Math.abs(ball.x - player.x) > 6) engine.trigger('key', undefined, ball.x > player.x ? 'ArrowRight' : 'ArrowLeft');
        engine.step();
        if (ball.variables.dy === 4) bounced = true;
        if (ball.variables.score > 0) { scored = true; break; }
      }
      expect(bounced).toBe(true); expect(scored).toBe(true); expect(engine.active).toBe(true);
      // Let it go without input; the ordinary miss rule eventually stops it.
      for (let i = 0; i < 2000 && engine.active; i++) engine.step();
      expect(engine.active).toBe(false); expect(engine.scene.actors[0].speech).toContain('Missed');
    } finally { engine.dispose(); }
  });
  it('basketball fails without a catch and selected-sprite sensing does not count the hoop as the player', () => {
    const engine = new StudioEngine(studioStarterProject('basketball'));
    try { engine.start(); drain(engine); expect(engine.scene.actors[0].variables.score).toBe(0); expect(engine.scene.actors[0].speech).toContain('Missed'); } finally { engine.dispose(); }
  });
  it('tennis returns with either racket, scores an opponent miss and ends on a player miss', () => {
    const p = studioStarterProject('tennis'), before = structuredClone(p), engine = new StudioEngine(p);
    try {
      engine.start(); let returned = false, scored = false;
      for (let i = 0; i < 2600 && engine.active; i++) {
        const ball = engine.scene.actors[0], player = engine.scene.actors[1];
        if (Math.abs(ball.x - player.x) > 5) engine.trigger('key', undefined, ball.x > player.x ? 'ArrowRight' : 'ArrowLeft');
        engine.step();
        if (ball.variables.dy === 5) returned = true;
        if (ball.variables.score > 0) { scored = true; break; }
      }
      expect(returned).toBe(true); expect(scored).toBe(true); expect(engine.active).toBe(true);
      // The opponent's tracking is also ordinary editable position/if blocks.
      expect(engine.scene.actors[2].x).not.toBe(0);
      for (let i = 0; i < 2000 && engine.active; i++) engine.step();
      expect(engine.active).toBe(false); expect(engine.scene.actors[0].speech).toContain('Missed');
      expect(p).toEqual(before);
    } finally { engine.dispose(); }
  });
  it('tennis stops on a miss without input and prevents post-game movement', () => {
    const engine = new StudioEngine(studioStarterProject('tennis'));
    try {
      engine.start(); drain(engine); expect(engine.scene.actors[0].variables.score).toBe(0);
      const x = engine.scene.actors[1].x; engine.trigger('key', undefined, 'ArrowLeft');
      expect(engine.active).toBe(false); expect(engine.scene.actors[1].x).toBe(x);
    } finally { engine.dispose(); }
  });
  it('tennis opponent returns a rising ball through the same touching/direction conditional', () => {
    const p = studioStarterProject('tennis'); p.sprites[0].x = 0; p.sprites[0].y = 60;
    const root = (p.sprites[0].code.blocks as { blocks: B[] }).blocks[0];
    let velocity = root.next?.block;
    for (const value of [0, 5]) {
      const fields = velocity?.inputs?.VALUE?.block?.fields;
      if (!fields) throw new Error('Expected authored velocity input');
      fields.NUM = value; velocity = velocity?.next?.block;
    }
    const engine = new StudioEngine(p);
    try {
      engine.start(); let returned = false;
      for (let i = 0; i < 100 && engine.active; i++) {
        engine.step();
        if (engine.scene.actors[0].variables.dy === -5) { returned = true; break; }
      }
      expect(returned).toBe(true); expect(engine.scene.actors[0].variables.score).toBe(0);
    } finally { engine.dispose(); }
  });
  it('catch game scores using collision blocks and resets the fish to a random position', () => {
    const engine = new StudioEngine(studioStarterProject('catch'), () => .5);
    try {
      engine.start(); engine.trigger('key', undefined, 'ArrowLeft'); engine.step(); engine.trigger('key', undefined, 'ArrowLeft');
      for (let i = 0; i < 180 && engine.active && !engine.scene.actors[0].variables.score; i++) { if (engine.scene.actors[1].x > -30) engine.trigger('key', undefined, 'ArrowLeft'); engine.step(); }
      expect(engine.scene.actors[0].variables.score).toBe(1);
    } finally { engine.dispose(); }
  });
  it.each(['garden', 'spaceQuest'] as const)('%s reacts to messages and a real editable function', kind => {
    const p = studioStarterProject(kind), engine = new StudioEngine(p);
    try { engine.start(); drain(engine); engine.trigger('click', p.sprites[0].id); drain(engine); expect(engine.scene.actors[1].speech).toContain(kind === 'garden' ? 'surprise' : 'Rescue complete'); if (kind === 'garden') expect(engine.scene.actors[2].speech).toContain('garden'); } finally { engine.dispose(); }
  });
  it('preregisters personal functions so event calls do not depend on Run execution order', () => {
    const p = newStudioProject(); p.sprites[0].code = code([], [{ type: 'ka_studio_define', fields: { NAME: 'greet', PARAM: 'none' }, inputs: { DO: { block: { type: 'ka_sprite_say', fields: { TEXT: 'Hello' } } } } }, { type: 'ka_event_click', next: { block: { type: 'ka_function_call', fields: { NAME: 'greet' } } } }]);
    const engine = new StudioEngine(p); try { engine.start(); engine.trigger('click', p.selected); drain(engine); expect(engine.scene.actors[0].speech).toBe('Hello'); } finally { engine.dispose(); }
  });
  it.each(studioSystemFunctions.filter(f => ['spin_right', 'hop'].includes(f.name)))('built-in $name executes its visible ordinary blocks and cannot be overridden', f => {
    const p = newStudioProject(); p.sprites[0].code = code([{ type: 'ka_function_call', fields: { NAME: f.name } }]); const engine = new StudioEngine(p);
    try { engine.start(); drain(engine); expect(engine.scene.actors[0]).toMatchObject({ x: 0, y: 0, angle: 0 }); } finally { engine.dispose(); }
    p.sprites[0].code = code([], [f.block]); expect(() => new StudioEngine(p)).toThrow('read-only built-in');
  });
  it('stopping this script inside a function does not run later blocks or stop another sprite', () => {
    const p = studioStarterProject('story'); p.sprites[0].code = code([{ type: 'ka_function_call', fields: { NAME: 'halt' } }, { type: 'ka_sprite_say', fields: { TEXT: 'should not run' } }], [{ type: 'ka_studio_define', fields: { NAME: 'halt', PARAM: 'none' }, inputs: { DO: { block: { type: 'ka_studio_stop', fields: { SCOPE: 'script' } } } } }]);
    p.sprites[1].code = code([{ type: 'ka_sprite_say', fields: { TEXT: 'Other sprite keeps running' } }]);
    const engine = new StudioEngine(p); try { engine.start(); drain(engine); expect(engine.scene.actors[0].speech).toBe(''); expect(engine.scene.actors[1].speech).toBe('Other sprite keeps running'); } finally { engine.dispose(); }
  });
  it('rejects missing sprite references, invalid messages and unknown code-view blocks without changing work', () => {
    const p = newStudioProject(); p.sprites[0].code = code([{ type: 'ka_show_boolean', inputs: { VALUE: { block: { type: 'ka_studio_touching', fields: { SPRITE: 'none' } } } } }]);
    const engine = new StudioEngine(p); try { engine.start(); expect(() => drain(engine)).toThrow('existing other sprite'); } finally { engine.dispose(); }
    p.sprites[0].code = code([{ type: 'ka_studio_broadcast', fields: { MESSAGE: '<script>' } }]); const bad = new StudioEngine(p); try { bad.start(); expect(() => drain(bad)).toThrow('Messages use'); } finally { bad.dispose(); }
    expect(() => studioCodeView(code([{ type: 'not_a_block' }]), 'Byte')).toThrow('Connect');
    const text = studioCodeView(code([{ type: 'ka_sprite_say', fields: { TEXT: '<script>not executable</script>' } }, { type: 'ka_studio_point', inputs: { VALUE: { block: number(90) } } }]), 'Byte'); expect(text).toContain('"<script>not executable</script>"');
  });
});
