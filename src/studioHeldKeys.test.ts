import { describe, expect, it } from 'vitest';
import { StudioEngine } from './studioEngine';
import { newStudioProject } from './studioProject';
import { parseConceptCode } from './conceptText';
import { studioStarterProject, type StudioStarter } from './studioStarters';

function rig(body = 'forward(1)', key = 'ArrowRight') {
  const project = newStudioProject();
  project.sprites[0].code = { blocks: { languageVersion: 0, blocks: [
    parseConceptCode(''), { type: 'ka_event_key', fields: { KEY: key }, next: parseConceptCode(body).next },
  ] } };
  let now = 0;
  const engine = new StudioEngine(project, () => .5, () => now);
  engine.start(); engine.step(true);
  return { engine, at(time: number) { now = time; for (let i = 0; i < 8; i++) engine.step(true); } };
}
describe('shared held-arrow input', () => {
  it('repeats ordinary key hats after a short delay, ignores OS repeats, and stops on release', () => {
    const { engine: e, at } = rig();
    try {
      expect(e.active).toBe(false);
      expect(e.setKey('ArrowRight', true)).toBe(true); at(0);
      expect(e.snapshot().actors[0].x).toBe(1);
      expect(e.setKey('ArrowRight', true)).toBe(false); at(179);
      expect(e.snapshot().actors[0].x).toBe(1); at(180); at(260);
      expect(e.snapshot().actors[0].x).toBe(2); at(440); at(520);
      expect(e.snapshot().actors[0].x).toBe(3);
      e.setKey('ArrowRight', false); at(1000);
      expect(e.snapshot().actors[0].x).toBe(3); expect(e.active).toBe(false);
    } finally { e.dispose(); }
  });
  it('skips missed repeat intervals rather than replaying a backlog', () => {
    const { engine: e, at } = rig();
    try { e.setKey('ArrowRight', true); at(0); at(179); at(180); at(10000); expect(e.snapshot().actors[0].x).toBe(2); }
    finally { e.dispose(); }
  });
  it('does not queue overlapping copies of a long key script', () => {
    const { engine: e, at } = rig('wait(1)\nforward(1)');
    try {
      e.setKey('ArrowRight', true); at(0); at(180); at(260); at(500);
      e.setKey('ArrowRight', false); at(1100); at(2200);
      expect(e.snapshot().actors[0].x).toBe(1); expect(e.active).toBe(false);
    } finally { e.dispose(); }
  });
  it.each(['ArrowLeft', 'ArrowUp', 'ArrowDown'])('supports %s identically', key => {
    const { engine: e, at } = rig('forward(1)', key);
    try { e.setKey(key, true); at(0); at(180); at(260); expect(e.snapshot().actors[0].x).toBe(2); }
    finally { e.dispose(); }
  });
  it('leaves Space single-shot and inactive arrows idle', () => {
    const { engine: e, at } = rig('forward(1)', ' ');
    try { e.setKey(' ', true); at(0); at(1000); expect(e.snapshot().actors[0].x).toBe(1); e.setKey('ArrowUp', true); expect(e.active).toBe(false); }
    finally { e.dispose(); }
  });
  it.each(['clearInput', 'stop', 'dispose'] as const)('%s clears pending repeat input', action => {
    const { engine: e, at } = rig();
    try { e.setKey('ArrowRight', true); at(0); e[action](); at(1000); expect(e.snapshot().actors[0].x).toBe(1); expect(e.active).toBe(false); }
    finally { e.dispose(); }
  });
  it.each(['basketball', 'tennis', 'racing', 'catch', 'keyboard'] as StudioStarter[])('works with unchanged saved %s blocks', kind => {
    const p = studioStarterProject(kind), before = JSON.stringify(p);
    let now = 0; const e = new StudioEngine(p, () => .5, () => now);
    try {
      e.start(); e.setKey('ArrowRight', true);
      for (now = 0; now <= 600; now += 20) for (let i = 0; i < 8; i++) e.step(true);
      const actor = e.snapshot().actors.find(a => a.id === (kind === 'basketball' || kind === 'tennis' ? 'player' : kind === 'catch' ? 'cat' : p.sprites[0].id))!;
      expect(actor.x).toBeGreaterThan(kind === 'racing' ? 0 : 20);
      e.clearInput(); expect(JSON.stringify(p)).toBe(before);
    } finally { e.dispose(); }
  });
});
