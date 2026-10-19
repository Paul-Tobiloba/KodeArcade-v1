import { describe, expect, it } from 'vitest';
import type { serialization } from 'blockly/core';
import { StudioEngine } from './studioEngine';
import { studioCodeView } from './studioCode';
import { readStudioBackup, saveStudioProject, studioProjectSchema, type StudioProject } from './studioProject';
import { galleryEntry, readStudioGallery, saveStudioGallery } from '../shared/studioGallery';
import { studioStarterProject } from './studioStarters';
import { findStudioTutorial, studioNewProject, studioTutorialProject, studioTutorials } from './studioTutorials';
type B = serialization.blocks.State;
function tick(e: StudioEngine, count = 200) { for (let i = 0; i < count; i++) if (!e.step()) break; return e.snapshot(); }
function blocks(project: StudioProject) { return (project.sprites[0].code.blocks as { blocks: B[] }).blocks; }
function visit(node: B, check: (node: B) => void) { check(node); for (const input of Object.values(node.inputs ?? {})) if (input.block) visit(input.block, check); if (node.next?.block) visit(node.next.block, check); }

describe('editable block tutorials', () => {
  it.each(studioTutorials)('$id is real bounded code with private backup metadata and four useful steps', tutorial => {
    const p = studioTutorialProject(tutorial.id), e = new StudioEngine(p);
    try {
      expect(p.sprites).toHaveLength(1); expect(p.starter).toBe(tutorial.id); expect(p.onboarding).toBe('skipped');
      expect(e.contexts[0].ws.getAllBlocks(false).length).toBeLessThanOrEqual(65);
      expect(readStudioBackup(saveStudioProject(p))).toEqual(p); expect(studioProjectSchema.parse(p)).toEqual(p);
      expect(tutorial.steps).toHaveLength(4); for (const step of tutorial.steps) { expect(step.instruction.length).toBeGreaterThan(30); expect(step.notice.length).toBeGreaterThan(25); }
      expect(studioCodeView(p.sprites[0].code, p.sprites[0].name)).toContain('onRun');
    } finally { e.dispose(); }
  });
  it('asks for made-up text and a choice, then joins the actual runtime answers without persisting them', () => {
    const p = studioTutorialProject('tutorialQuestions'), before = structuredClone(p), e = new StudioEngine(p);
    try { e.start(); tick(e, 5); expect(e.scene.prompts?.[0].choices).toEqual([]); e.answerPrompt(e.scene.prompts![0].id, 'Comet'); tick(e, 20); expect(e.scene.actors[0].speech).toBe('Captain Comet'); expect(e.scene.prompts?.[0].choices).toEqual(['Nova','Luma','Zed']); e.answerPrompt(e.scene.prompts![0].id, 'Luma'); tick(e); expect(e.scene.actors[0].speech).toBe('Next stop: Luma'); expect(p).toEqual(before); expect(JSON.stringify(p)).not.toContain('Comet'); } finally { e.dispose(); }
  });
  it('counts real clicks only before its clock deadline and stops with the final score', () => {
    let now = 0; const p = studioTutorialProject('tutorialTimers'), e = new StudioEngine(p, () => .5, () => now);
    try { e.start(); tick(e, 20); now = 1200; e.trigger('click', p.selected); tick(e, 10); expect(e.scene.actors[0].variables).toMatchObject({ score:1, seconds:1 }); now = 5100; e.trigger('click', p.selected); tick(e, 30); expect(e.scene.actors[0].variables.score).toBe(1); expect(e.scene.actors[0].speech).toContain('Time is up'); expect(e.active).toBe(false); e.trigger('click',p.selected); expect(e.step()).toBeNull(); } finally { e.dispose(); }
  });
  it('runs the documented timer and bonus-point edits as ordinary changed blocks', () => {
    let now = 0; const p = studioTutorialProject('tutorialTimers');
    for (const root of blocks(p)) visit(root, node => { if (node.type === 'ka_event_at') node.fields!.SECONDS=8; if(node.type==='ka_number' && node.fields?.NUM===5) node.fields.NUM=8; if(node.type==='ka_studio_change_variable') node.inputs!.VALUE.block!.fields!.NUM=2; });
    const e = new StudioEngine(p, () => .5, () => now); try { e.start(); tick(e,20); now=6000; e.trigger('click',p.selected); tick(e,20); expect(e.scene.actors[0].variables.score).toBe(2); expect(e.active).toBe(true); now=8100; tick(e,30); expect(e.active).toBe(false); } finally { e.dispose(); }
  });
  it('makes, retargets, counts, drags and removes temporary butterflies without changing its source', () => {
    const p = studioTutorialProject('tutorialSprites'), before=structuredClone(p), e=new StudioEngine(p,()=>.75);
    try { e.start(); tick(e); expect(e.scene.actors).toHaveLength(7); expect(e.scene.actors[0].variables.count).toBe(7); expect(e.scene.actors.slice(1).every(a=>a.draggable&&a.size===45&&a.x===50&&a.y===50)).toBe(true); const clone=e.scene.actors[1]; e.setPointer(50,50,true,clone.id);e.setPointer(25,15,true);expect(clone).toMatchObject({x:25,y:15}); e.trigger('key',undefined,' ');tick(e);expect(e.scene.actors).toHaveLength(1);expect(e.scene.actors[0].variables.count).toBe(1);expect(p).toEqual(before); } finally{e.dispose();}
  });
  it('runs both behaviors, pauses only the personal dance and restarts it through a key event', () => {
    const p=studioTutorialProject('tutorialBehaviors'), e=new StudioEngine(p);try{e.start();e.setKey('ArrowRight',true);tick(e,40);expect(e.scene.actors[0].x).toBeGreaterThan(0);expect(e.scene.actors[0].angle).not.toBe(0);e.trigger('click',p.selected);tick(e,25);const angle=e.scene.actors[0].angle;tick(e,30);expect(e.scene.actors[0].angle).toBe(angle);expect(e.active).toBe(true);e.trigger('key',undefined,' ');tick(e,20);expect(e.scene.actors[0].angle).not.toBe(angle);expect(studioCodeView(p.sprites[0].code,'Byte')).toContain('functions["@arrow_moving"]');}finally{e.dispose();}
  });
  it('creates fresh independent gallery entries without changing old work, grades or existing starter behavior', () => {
    const old=studioStarterProject('story');old.title='Keep my story'; const first=galleryEntry(old), gallery={version:1 as const, activeId:first.id,projects:[first]}; const snapshot=structuredClone(gallery);
    const tutorial=studioNewProject('tutorialQuestions'), next=galleryEntry(tutorial), reopened=readStudioGallery(saveStudioGallery({...gallery,activeId:next.id,projects:[...gallery.projects,next]}));
    expect(reopened.projects[0]).toEqual(snapshot.projects[0]);expect(gallery).toEqual(snapshot);expect(reopened.projects[1].project.starter).toBe('tutorialQuestions');tutorial.title='Changed';expect(studioNewProject('tutorialQuestions').title).toBe('My space hero');expect(studioNewProject('story')).toEqual(studioStarterProject('story'));expect(findStudioTutorial('unknown')).toBeUndefined();expect(studioProjectSchema.safeParse({...old,starter:'tutorialUnknown'}).success).toBe(false);
  });
});
