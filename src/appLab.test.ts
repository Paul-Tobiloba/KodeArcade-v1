import { describe, expect, it } from 'vitest';
import { appGallerySchema, appLabStorageKey, boundedAppData, newAppProject, newElement, readAppGallery, validAppGallery, type AppBlock, type AppGallery, type AppProject } from '../shared/appLab';
import { preserveAchievements, progressDocument, validCourseDocument } from '../shared/progress';
import { collectCloud, hydrateCloud } from './cloudProgress';
import { AppRuntime } from './appLabRuntime';
import { appStarter, appStarterChoices, connected, literal } from './appLabStarters';

const gallery = (p = appStarter('counter')): AppGallery => ({ version: 1, activeId: p.id, projects: [p] });
const withAction = (action: AppBlock, p = appStarter('counter')) => { p.code = { blocks: { languageVersion: 0, blocks: [{ type: 'al_start', inputs: { DO: connected(action) } }] } }; return p; };
const print = (value: AppBlock): AppBlock => ({ type: 'al_print', inputs: { VALUE: connected(value) } });
const cellRead = (row = 0, column = 'fact'): AppBlock => ({ type: 'al_cell', fields: { TABLE: 'animals', COLUMN: column }, inputs: { ROW: connected(literal(row)) } });

describe('App Lab private project contract', () => {
  it.each(appStarterChoices)('$id is a validated, editable starter', choice => { const g = gallery(appStarter(choice.id)); expect(readAppGallery(JSON.parse(JSON.stringify(g)))).toEqual(g); expect(new AppRuntime(g.projects[0]).start().error).toBe(''); });
  it('round trips multiple independent apps and their local tables', () => { const g = gallery(); g.projects.push(appStarter('data')); expect(readAppGallery(g)).toEqual(g); });
  it('keeps unique identities for new apps', () => { expect(newAppProject().id).not.toBe(newAppProject().id); });
  it.each(['bad id', '__proto__', '', '1abc', 'x'.repeat(31)])('rejects invalid control ID %j', id => { const g = gallery(); g.projects[0].elements[0].id = id; expect(validAppGallery(g)).toBe(false); });
  it('rejects duplicate screen/control IDs and missing screen references', () => { const g = gallery(); g.projects[0].elements[0].id = 'home'; expect(validAppGallery(g)).toBe(false); g.projects[0].elements[0].id = 'heading'; g.projects[0].elements[0].screen = 'missing'; expect(validAppGallery(g)).toBe(false); });
  it('bounds control geometry inside the phone screen', () => { const g = gallery(); g.projects[0].elements[0].x = 300; expect(validAppGallery(g)).toBe(false); });
  it('rejects unsupported executable blocks and extra serialized state', () => { const g = gallery(); (g.projects[0].code.blocks!.blocks[0] as { type: string }).type = 'javascript_eval'; expect(validAppGallery(g)).toBe(false); expect(appGallerySchema.safeParse({ ...gallery(), remoteUrl: 'https://example.com' }).success).toBe(false); });
  it('rejects deeply nested or cyclic unknown JSON before recursive schema parsing', () => { const root: { child?: unknown } = {}; let node = root; for (let i = 0; i < 100; i++) { const next = {}; node.child = next; node = next; } expect(boundedAppData(root)).toBe(false); root.child = root; expect(boundedAppData(root)).toBe(false); expect(() => readAppGallery(root)).toThrow(); });
  it('bounds gallery count, code chains and data shapes', () => { const g = gallery(); g.projects = Array.from({ length: 9 }, () => appStarter('blank')); g.activeId = g.projects[0].id; expect(validAppGallery(g)).toBe(false); const p = appStarter('data'); p.tables[0].rows.push(['missing field']); expect(validAppGallery(gallery(p))).toBe(false); });
  it('rejects duplicate table/column names', () => { const p = appStarter('data'); p.tables[0].columns = ['fact', 'fact']; expect(validAppGallery(gallery(p))).toBe(false); });
});

describe('App Lab bounded event runtime', () => {
  it('runs greeting input, navigation and return event without changing the design', () => {
    const p = appStarter('greeting'), original = structuredClone(p), runtime = new AppRuntime(p);
    runtime.start(); runtime.inputValue('nickname', 'Ada'); const welcome = runtime.event('hello', 'click');
    expect(welcome.screen).toBe('welcome'); expect(welcome.elements.find(e => e.id === 'message')?.text).toBe('Hello, Ada');
    expect(runtime.event('back', 'click').screen).toBe('home'); expect(p).toEqual(original);
  });
  it('counts once per click and resets on a new Run', () => { const p = appStarter('counter'), runtime = new AppRuntime(p); runtime.start(); runtime.event('count', 'click'); expect(runtime.event('count', 'click').elements.find(e => e.id === 'total')?.text).toBe('2'); expect(new AppRuntime(p).start().variables).toEqual([['score', 0]]); });
  it('does not execute start twice in one instance or events before start', () => { const r = new AppRuntime(appStarter('counter')); expect(r.event('count', 'click').variables).toEqual([]); r.start(); r.event('count', 'click'); expect(r.start().variables).toEqual([['score', 1]]); });
  it('ignores hidden and off-screen event targets', () => { const p = appStarter('counter'); p.elements.find(e => e.id === 'count')!.hidden = true; const r = new AppRuntime(p); r.start(); expect(r.event('count', 'click').variables).toEqual([['score', 0]]); expect(r.event('missing', 'click').error).toBe(''); });
  it('reads project-local table cells', () => { const r = new AppRuntime(appStarter('data')); r.start(); expect(r.event('discover', 'click').elements.find(e => e.id === 'fact')?.text).toContain('feet'); });
  it('runtime table writes do not mutate saved data and restart restores the fixture', () => {
    const p = appStarter('data'), before = p.tables[0].rows[0][1];
    const r = new AppRuntime(withAction({ type: 'al_set_cell', fields: { TABLE: 'animals', COLUMN: 'fact' }, inputs: { ROW: connected(literal(0)), VALUE: connected(literal('Changed')) } }, p));
    expect(r.start().tables[0].rows[0][1]).toBe('Changed'); expect(p.tables[0].rows[0][1]).toBe(before); expect(appStarter('data').tables[0].rows[0][1]).toBe(before);
  });
  it.each([-1, 0.5, 99])('reports invalid row index %s rather than accessing arbitrary data', row => { const r = new AppRuntime(withAction(print(cellRead(row)), appStarter('data'))); expect(r.start().error).toContain('row'); });
  it('reports missing columns, tables, controls and unset variables', () => {
    for (const expr of [cellRead(0, 'absent'), { type: 'al_rows', fields: { TABLE: 'absent' } }, { type: 'al_read', fields: { ID: 'absent', MODE: 'text' } }, { type: 'al_var', fields: { NAME: 'absent' } }] as AppBlock[]) expect(new AppRuntime(withAction(print(expr), appStarter('data'))).start().error).not.toBe('');
  });
  it('rejects division by zero, non-numeric inputs and missing connections', () => {
    const math: AppBlock = { type: 'al_math', fields: { OP: '/' }, inputs: { A: connected(literal(2)), B: connected(literal(0)) } };
    expect(new AppRuntime(withAction(print(math))).start().error).toContain('zero');
    math.inputs!.B = connected(literal('nope')); expect(new AppRuntime(withAction(print(math))).start().error).toContain('number');
    expect(new AppRuntime(withAction({ type: 'al_print' })).start().error).toContain('Connect');
  });
  it('does not accept unbounded repeat work', () => { const p = withAction({ type: 'al_repeat', inputs: { COUNT: connected(literal(1000000)) } }); const result = new AppRuntime(p).start(); expect(result.error).toContain('limit'); expect(result.steps).toBeLessThanOrEqual(1001); });
  it('requires a Boolean in if and skips a disabled script', () => {
    expect(new AppRuntime(withAction({ type: 'al_if', inputs: { TEST: connected(literal('true')) } })).start().error).toContain('true/false');
    const p = withAction(print(literal('skipped'))); p.code.blocks!.blocks[0].disabledReasons = ['MANUALLY_DISABLED']; expect(new AppRuntime(p).start().output).toEqual([]);
  });
  it('supports comparisons and selected branches', () => { const test: AppBlock = { type: 'al_compare', fields: { OP: '>' }, inputs: { A: connected(literal(51)), B: connected(literal(50)) } }; const p = withAction({ type: 'al_if', inputs: { TEST: connected(test), DO: connected(print(literal('boost'))), ELSE: connected(print(literal('normal'))) } }); expect(new AppRuntime(p).start().output).toEqual(['boost']); });
  it('reads the displayed default dropdown value and checked input value', () => { const p = appStarter('blank'); p.elements.push(newElement('dropdown', 'choice', 'home')); const r = new AppRuntime(withAction(print({ type: 'al_read', fields: { ID: 'choice', MODE: 'text' } }), p)); expect(r.start().output).toEqual(['Option 1']); });
  it('sets only an existing dropdown option and reads the same value that is displayed', () => {
    const p = appStarter('blank'); p.elements.push(newElement('dropdown', 'choice', 'home'));
    const action: AppBlock = { type: 'al_set_text', fields: { ID: 'choice' }, inputs: { VALUE: connected(literal('Option 2')) }, next: { block: print({ type: 'al_read', fields: { ID: 'choice', MODE: 'text' } }) } };
    const state = new AppRuntime(withAction(action, p)).start(); expect(state.elements[0].text).toBe('Option 2'); expect(state.output).toEqual(['Option 2']);
  });
  it('rejects a non-option dropdown value without changing its visible/readable selection', () => {
    const p = appStarter('blank'); p.elements.push(newElement('dropdown', 'choice', 'home'));
    const action: AppBlock = { type: 'al_set_text', fields: { ID: 'choice' }, inputs: { VALUE: connected(literal('Not an option')) } };
    const state = new AppRuntime(withAction(action, p)).start(); expect(state.error).toContain('dropdown options'); expect(state.elements[0].text).toBe('Option 1');
    const runtime = new AppRuntime({ ...p, code: {} }); runtime.start(); expect(() => runtime.inputValue('choice', 'Not an option')).toThrow('dropdown options'); expect(runtime.snapshot().elements[0].text).toBe('Option 1');
  });
  it('caps text and console output without interpreting markup', () => { const p = withAction({ type: 'al_repeat', inputs: { COUNT: connected(literal(35)), DO: connected(print(literal('<script>not code</script>'))) } }); const s = new AppRuntime(p).start(); expect(s.output).toHaveLength(30); expect(s.output[0]).toContain('<script>'); });
  it('limits variables and event counts', () => { const r = new AppRuntime(appStarter('counter')); r.start(); for (let i = 0; i < 501; i++) r.event('count', 'click'); expect(r.snapshot().error).toContain('500 events'); });
});

describe('App Lab additive account integration', () => {
  function document() { return collectCloud('grade-4', hydrateCloud('grade-4', null, true))!; }
  it('hydrates a new assigned course without importing public preview work', () => { const d = document(); expect(d.currentId).toBe('grade-4-sequences-1'); expect(d.appLab).toBeUndefined(); expect(validCourseDocument('grade-4', d)).toBe(true); });
  it('round trips apps in their own course-scoped storage key', () => { const d = { ...document(), appLab: gallery(appStarter('data')) }; const entries = hydrateCloud('grade-4', d); expect(JSON.parse(entries[appLabStorageKey('grade-4')])).toEqual(d.appLab); expect(collectCloud('grade-4', entries)).toEqual(d); expect(entries[appLabStorageKey('preview')]).toBeUndefined(); });
  it('validates account data and keeps App Lab out of Grades 1–2', () => { const d = { ...document(), appLab: gallery() }; expect(progressDocument.safeParse(d).success).toBe(true); const young = { ...d, currentId: 'grade-2-sequences-1' }; expect(validCourseDocument('grade-2', young)).toBe(false); expect(progressDocument.safeParse({ ...d, appLab: { arbitrary: true } }).success).toBe(false); });
  it('an older client cannot erase apps by omitting the additive field', () => { const previous = { ...document(), appLab: gallery() }; const next = preserveAchievements(previous, document()); expect(next.appLab).toEqual(previous.appLab); });
  it('keeps protected stars when an app changes', () => { const previous = document(); previous.progress['grade-4-sequences-1'] = { complete: true, attempts: 1, stars: 5, hints: 0, blocks: [] }; const next = preserveAchievements(previous, { ...document(), appLab: gallery() }); expect(next.progress['grade-4-sequences-1'].stars).toBe(5); expect(next.appLab?.projects).toHaveLength(1); });
});
