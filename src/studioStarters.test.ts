import { describe, expect, it } from 'vitest';
import { StudioEngine } from './studioEngine';
import { newStudioProject, readStudioBackup, saveStudioProject, studioProjectSchema } from './studioProject';
import { studioStarterProject, studioStarters, untouchedStudioProject } from './studioStarters';

function finish(engine: StudioEngine) {
  for (let i = 0; i < 200; i++) if (!engine.step()) return engine.snapshot();
  throw new Error('Starter did not finish');
}
describe('editable Byte Lab starters', () => {
  it.each(studioStarters)('$id validates and stays inside the ordinary editor block budget', ({ id }) => {
    const project = studioStarterProject(id), engine = new StudioEngine(project);
    try {
      expect(studioProjectSchema.safeParse(project).success).toBe(true);
      for (const ctx of engine.contexts) expect(ctx.ws.getAllBlocks(false).length).toBeLessThanOrEqual(65);
      expect(readStudioBackup(saveStudioProject(project))).toEqual(project);
      expect(project.starter).toBe(id);
    } finally { engine.dispose(); }
  });
  it('runs both story sprites independently and responds to clicks', () => {
    const engine = new StudioEngine(studioStarterProject('story'));
    try {
      engine.start(); const lines: string[] = [];
      for (let i = 0; i < 100; i++) { const step = engine.step(); if (!step) break; lines.push(...step.scene.actors.map(a => a.speech)); }
      expect(lines).toContain('Hi, Dash!'); expect(lines).toContain('An adventure!'); expect(lines).toContain('Where shall we go?');
      engine.trigger('click', 'sprite-dash'); const step = engine.step();
      expect(step?.scene.actors[1].speech).toBe('Make up our next line!');
    } finally { engine.dispose(); }
  });
  it('moves with all four keys and safely stops at the edges', () => {
    const engine = new StudioEngine(studioStarterProject('keyboard'));
    try {
      engine.start(); finish(engine);
      for (const [key, x, y] of [['ArrowRight', 10, 0], ['ArrowUp', 10, 10], ['ArrowLeft', 0, 10], ['ArrowDown', 0, 0]] as const) {
        engine.trigger('key', undefined, key); expect(finish(engine).actors[0]).toMatchObject({ x, y });
      }
      for (let i = 0; i < 30; i++) { engine.trigger('key', undefined, 'ArrowRight'); finish(engine); }
      expect(engine.snapshot().actors[0].x).toBe(90);
    } finally { engine.dispose(); }
  });
  it('bounces repeatedly in a cooperative forever script that Stop ends', () => {
    const engine = new StudioEngine(studioStarterProject('bounce'));
    try {
      engine.start();
      for (let i = 0; i < 100; i++) { const step = engine.step(); expect(step).not.toBeNull(); expect(Math.abs(step!.scene.actors[0].x)).toBeLessThanOrEqual(100); }
      expect(engine.snapshot().events).toContain('Nova: edge');
      expect(engine.active).toBe(true); engine.stop(); expect(engine.step()).toBeNull();
    } finally { engine.dispose(); }
  });
  it('does not share mutable state between projects or overwrite old drafts', () => {
    const first = studioStarterProject('story'), second = studioStarterProject('story');
    first.sprites[0].name = 'Changed'; expect(second.sprites[0].name).toBe('Byte');
    expect(untouchedStudioProject(newStudioProject())).toBe(true);
    expect(untouchedStudioProject({ ...newStudioProject(), onboarding: 'skipped' })).toBe(true);
    expect(untouchedStudioProject(second)).toBe(false);
    const old = newStudioProject(); old.title = 'Keep this'; expect(untouchedStudioProject(old)).toBe(false);
  });
  it('round-trips optional onboarding metadata without requiring it in old saves', () => {
    const p = studioStarterProject('keyboard'); p.onboarding = 'completed';
    expect(readStudioBackup(saveStudioProject(p))).toEqual(p);
    expect(studioProjectSchema.safeParse(newStudioProject()).success).toBe(true);
    expect(studioProjectSchema.safeParse({ ...p, onboarding: 'invalid' }).success).toBe(false);
  });
});
