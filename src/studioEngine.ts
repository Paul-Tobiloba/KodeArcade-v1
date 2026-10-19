import * as Blockly from 'blockly/core';
import './blockly';
import './studioBlocks';
import { studioCategories, setStudioAssetContext } from './studioBlocks';
import { studioProjectSchema, isStudioBackground, type StudioProject } from './studioProject';
import { conceptFunctionName } from './conceptRuntime';
import { studioSystemFunctions, isSystemFunction } from './studioFunctions';
export type StudioLocation = { kind: 'location'; x: number; y: number };
type Selection = { kind: 'sprites'; ids: string[] };
type Value = number | boolean | string | StudioLocation | Selection;
export type StudioPrompt = { id: string; actorId: string; variable: string; question: string; choices: string[] };
export type StudioActor = { id: string; name: string; costume: string; x: number; y: number; angle: number; size: number; visible: boolean; speech: string; variables: Record<string, number>; monitors: string[]; output: (number | boolean | string)[]; sourceId?: string; textVariables?: Record<string, string>; tint?: string; draggable?: boolean; monitorPositions?: Record<string, StudioLocation> };
export type StudioScene = { actors: StudioActor[]; background: string; note: string; spriteId?: string; blockId?: string; events: string[]; backgroundColor?: string; title?: { title: string; subtitle: string }; prompts?: StudioPrompt[]; labels?: { id: string; text: string; location: StudioLocation }[]; sounds?: { id: number; name: string }[] };
type Action = { delay: number; blockId: string; note: string };
type Script = Generator<Action, number | undefined, void>;
type Task = { actor: Context; script: Script; at: number; key: string };
type Context = { actor: StudioActor; ws: Blockly.Workspace; functions: Map<string, Blockly.Block>; stack: string[]; ticks: number; halted?: boolean };
const allowed = new Set(['ka_start', 'ka_repeat', 'ka_sprite_character', 'ka_sprite_backdrop', 'ka_function_define', 'ka_studio_define', ...studioCategories.flatMap(c => c.types)]);
const messageName = (name: unknown) => { if (typeof name !== 'string' || !/^[a-z][a-z0-9_]{0,23}$/.test(name)) throw new Error('Messages use 1–24 lowercase letters, numbers or underscores, starting with a letter.'); return name; };
const variable = (name: unknown) => { if (typeof name !== 'string' || !/^[a-z][a-z0-9_]{0,15}$/.test(name)) throw new Error('Variable names use 1–16 lowercase letters, numbers or underscores, starting with a letter.'); return name; };
const num = (n: unknown): number => { if (typeof n !== 'number' || !Number.isFinite(n) || Math.abs(n) > 1e9) throw new Error('Use finite numbers from −1,000,000,000 to 1,000,000,000.'); return n; };
const bool = (b: unknown): boolean => { if (typeof b !== 'boolean') throw new Error('Use a true/false value in this input.'); return b; };
const input = (block: Blockly.Block, name: string) => { const b = block.getInputTargetBlock(name); if (!b) throw new Error(`Fill the ${name.toLowerCase()} input on ${block.toString()}.`); return b; };
const speech = (text: unknown) => { if (typeof text !== 'string' || text.length > 120 || /[\u0000-\u001f]/.test(text)) throw new Error('Use up to 120 printable characters for speech.'); return text; };
const text = (value: unknown) => { if (!['string', 'number', 'boolean'].includes(typeof value)) throw new Error('Use text, a number or true/false here.'); return speech(String(value)); };
const color = (value: unknown) => { if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error('Use a six-digit color such as #6d4aff.'); return value; };
const location = (value: Value): StudioLocation => { if (typeof value !== 'object' || value.kind !== 'location' || Math.abs(value.x) > 100 || Math.abs(value.y) > 100) throw new Error('Use a location with x/y from −100 to 100.'); return value; };
const selection = (value: Value): Selection => { if (typeof value !== 'object' || value.kind !== 'sprites') throw new Error('Choose a sprite or group of sprites.'); return value; };
/** Cooperative, bounded scripts: each action yields so other sprites and events can run. */
export class StudioEngine {
  readonly project: StudioProject;
  readonly contexts: Context[] = [];
  scene: StudioScene;
  private tasks: Task[] = [];
  private contacts = new Set<string>();
  private clock = 0;
  private steps = 0;
  private closed = false;
  private ended = false;
  private systemWorkspace: Blockly.Workspace | null = null;
  private timerStart = 0;
  private runStart = 0;
  private serial = 0;
  private creations = 0;
  private keys = new Set<string>();
  private keyRepeats = new Map<string, number>();
  private pointer: StudioLocation & { down: boolean; actorId?: string; offsetX?: number; offsetY?: number } = { kind: 'location', x: 0, y: 0, down: false };
  private schedules: { context: Context; root: Blockly.Block; next: number; interval: number }[] = [];
  private behaviors = new Set<string>();
  private answered = new Set<string>();
  private created = new Map<string, string[]>();
  constructor(project: StudioProject, private random = Math.random, private now = () => performance.now()) {
    this.project = studioProjectSchema.parse(project);
    this.scene = { actors: [], background: project.backdrop, note: 'Ready. Press Run to start every sprite.', events: [] };
    try {
      this.systemWorkspace = new Blockly.Workspace();
      const systemWorkspace = this.systemWorkspace;
      const system = new Map(studioSystemFunctions.map(f => [f.name, Blockly.serialization.blocks.append(structuredClone(f.block), systemWorkspace)]));
      for (const sprite of this.project.sprites) {
        const ws = new Blockly.Workspace();
        const actor: StudioActor = { id: sprite.id, name: sprite.name, costume: sprite.costume, x: sprite.x, y: sprite.y, angle: sprite.angle, size: sprite.size, visible: sprite.visible, speech: '', variables: { score: 0 }, monitors: [], output: [] };
        const context: Context = { actor, ws, functions: new Map(system), stack: [], ticks: 0 }; this.contexts.push(context); this.scene.actors.push(actor);
        setStudioAssetContext(ws, this.project, sprite.id);
        Blockly.serialization.workspaces.load(sprite.code, ws);
        if (ws.getAllBlocks(false).length > 65) throw new Error(`${sprite.name}: use at most 64 non-start blocks.`);
        for (const b of ws.getAllBlocks(false)) if (!allowed.has(b.type)) throw new Error(`${sprite.name}: remove unsupported block ${b.type}.`);
        const roots = ws.getTopBlocks(false);
        if (roots.filter(b => b.type === 'ka_start').length !== 1 || roots.some(b => b.type !== 'ka_start' && b.type !== 'ka_studio_define' && !/^ka_event_(click|key|edge|touch|message|at|every|answer|answers|created)$/.test(b.type))) throw new Error(`${sprite.name}: connect loose blocks to a Run or event hat.`);
        const definitions = ws.getAllBlocks(false).filter(b => b.type === 'ka_studio_define' || b.type === 'ka_function_define');
        if (definitions.length > 4) throw new Error('Use up to four different function definitions.');
        for (const definition of definitions) {
          const raw = definition.getFieldValue('NAME');
          if (isSystemFunction(raw)) throw new Error(`${raw} is a read-only built-in function. Choose a different name.`);
          const name = conceptFunctionName(raw);
          if (context.functions.has(name)) throw new Error('Use up to four different function definitions with unique names.');
          context.functions.set(name, definition);
        }
      }
      this.rememberContacts();
    } catch (error) { this.dispose(); throw error; }
  }
  snapshot() { return structuredClone(this.scene); }
  private hasHeldKeyEvents() {
    return [...this.keyRepeats.keys()].some(key => this.contexts.some(ctx => this.scene.actors.some(actor => actor.id === ctx.actor.id) && ctx.ws.getBlocksByType('ka_event_key', false).some(root => root.getFieldValue('KEY') === key && !!root.getNextBlock())));
  }
  get active() { return this.tasks.length > 0 || this.schedules.length > 0 || !!this.scene.prompts?.length || this.behaviors.size > 0 || this.hasHeldKeyEvents(); }
  start() {
    this.runStart = this.timerStart = this.now();
    for (const ctx of this.contexts) this.schedule(ctx);
    for (const ctx of this.contexts) for (const root of ctx.ws.getBlocksByType('ka_start', false)) this.enqueue(ctx, root.getNextBlock(), 'run');
    return this.snapshot();
  }
  trigger(event: 'click' | 'key' | 'edge' | 'touch' | 'message' | 'created' | 'answer' | 'answers', spriteId?: string, key?: string) {
    if (this.closed || this.ended) return;
    for (const ctx of this.contexts) if (!spriteId || ctx.actor.id === spriteId) for (const root of ctx.ws.getBlocksByType(`ka_event_${event}`, false)) {
      if (event === 'key' && root.getFieldValue('KEY') !== key) continue;
      if (event === 'message' && messageName(root.getFieldValue('MESSAGE')) !== key) continue;
      if (event === 'answer' && variable(root.getFieldValue('VAR')) !== key) continue;
      this.enqueue(ctx, root.getNextBlock(), root.id);
      this.scene.events = [...this.scene.events, `${ctx.actor.name}: ${event}`].slice(-12);
    }
  }
  setKey(key: string, pressed: boolean) {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' '].includes(key) || this.closed || this.ended || this.keys.has(key) === pressed) return false;
    if (pressed) {
      this.keys.add(key);
      // Repeat input, never movement: the child's ordinary key hats still decide what happens.
      if (key.startsWith('Arrow')) this.keyRepeats.set(key, this.now() + 180);
      this.trigger('key', undefined, key);
    } else { this.keys.delete(key); this.keyRepeats.delete(key); }
    return true;
  }
  clearInput() { this.keys.clear(); this.keyRepeats.clear(); this.pointer.down = false; delete this.pointer.actorId; }
  setPointer(x: number, y: number, down = this.pointer.down, actorId?: string) {
    if (this.closed || this.ended) return;
    this.pointer.x = Math.max(-100, Math.min(100, num(x))); this.pointer.y = Math.max(-100, Math.min(100, num(y)));
    if (down && !this.pointer.down && actorId) {
      const actor = this.scene.actors.find(a => a.id === actorId && a.draggable);
      if (actor) { this.pointer.actorId = actorId; this.pointer.offsetX = actor.x - x; this.pointer.offsetY = actor.y - y; }
    }
    this.pointer.down = down;
    if (!down) delete this.pointer.actorId;
    const actor = this.scene.actors.find(a => a.id === this.pointer.actorId && a.draggable);
    if (actor && down) { actor.x = Math.max(-100, Math.min(100, x + (this.pointer.offsetX ?? 0))); actor.y = Math.max(-100, Math.min(100, y + (this.pointer.offsetY ?? 0))); this.rememberContacts(true); }
  }
  answerPrompt(id: string, answer: string) {
    if (this.closed || this.ended) return;
    const prompt = this.scene.prompts?.find(p => p.id === id);
    if (!prompt) throw new Error('This question is no longer waiting for an answer.');
    const checked = speech(answer);
    if (prompt.choices.length && !prompt.choices.includes(checked)) throw new Error('Choose one of the displayed answers.');
    const actor = this.scene.actors.find(a => a.id === prompt.actorId);
    if (actor) { actor.textVariables ??= {}; actor.textVariables[prompt.variable] = checked; }
    this.scene.prompts = this.scene.prompts!.filter(p => p.id !== id); this.answered.add(id);
    this.trigger('answer', prompt.actorId, prompt.variable);
    if (!this.scene.prompts.length) this.trigger('answers');
  }
  private schedule(context: Context) {
    for (const root of context.ws.getTopBlocks(false).filter(b => ['ka_event_at', 'ka_event_every'].includes(b.type))) {
      const interval = Number(root.getFieldValue('SECONDS')) * 1000;
      if (!Number.isFinite(interval) || interval < 100 || interval > 3600000) throw new Error('Timer events use 0.1–3600 seconds.');
      if (this.schedules.length >= 64) throw new Error('Use at most 64 active timer events.');
      this.schedules.push({ context, root, next: this.now() + interval, interval: root.type === 'ka_event_every' ? interval : 0 });
    }
  }
  private poll() {
    const now = this.now();
    for (const [key, next] of this.keyRepeats) if (now >= next) {
      this.keyRepeats.set(key, now + 80); // Skip missed intervals; never replay a background backlog.
      this.trigger('key', undefined, key);
    }
    for (const timer of [...this.schedules]) if (now >= timer.next) {
      this.enqueue(timer.context, timer.root.getNextBlock(), timer.root.id);
      if (timer.interval) timer.next = now + timer.interval;
      else this.schedules = this.schedules.filter(item => item !== timer);
    }
  }
  private enqueue(ctx: Context, block: Blockly.Block | null, key: string, repeat = false) {
    if (!block || !this.scene.actors.some(a => a.id === ctx.actor.id) || this.tasks.some(t => t.actor.actor.id === ctx.actor.id && t.key === key)) return;
    if (this.tasks.length >= 32) throw new Error('Too many active event scripts. Simplify repeated responses.');
    const scope = { ...ctx, stack: [], ticks: 0 };
    this.tasks.push({ actor: scope, script: repeat ? this.behavior(scope, block, key) : this.statements(scope, block), at: this.clock, key });
  }
  private *behavior(ctx: Context, block: Blockly.Block, key: string): Script {
    while (this.behaviors.has(`${ctx.actor.id}:${key}`) && this.scene.actors.some(a => a.id === ctx.actor.id)) {
      yield* this.statements(ctx, block);
      yield this.action(block, `Behavior ${key.slice(9)}.`, 50);
    }
    return undefined;
  }
  private targets(ctx: Context, target: string) {
    if (target === 'all') return [...this.scene.actors];
    if (target === 'this') return this.scene.actors.filter(a => a.id === ctx.actor.id);
    if (!this.project.sprites.some(s => s.id === target)) throw new Error('Choose an existing sprite.');
    return this.scene.actors.filter(a => a.id === target);
  }
  private costume(ctx: Context, id: string) {
    const checked = id === 'current' ? ctx.actor.costume : id;
    if (!this.project.assets.some(a => a.id === checked && !isStudioBackground(a))) throw new Error('Add the chosen costume to the project first.');
    return checked;
  }
  private reserveVariable(actor: StudioActor, name: string, string = false) {
    const vars = string ? actor.textVariables ?? {} : actor.variables;
    if (!Object.hasOwn(vars, name) && Object.keys(actor.variables).length + Object.keys(actor.textVariables ?? {}).length >= 8) throw new Error('Use up to eight number/text variables per sprite.');
  }
  private spawn(ctx: Context, b: Blockly.Block, count: number, at: StudioLocation) {
    if (!Number.isInteger(count) || count < 1 || count > 20 || this.scene.actors.length + count > 32 || this.creations + count > 128) throw new Error('Create 1–20 sprites at a time, up to 32 on stage and 128 creations per run.');
    const target = this.targets(ctx, b.getFieldValue('SPRITE'));
    if (target.length !== 1) throw new Error('Choose one sprite template for creation.');
    const original = this.contexts.find(c => c.actor.id === target[0].id)!;
    const costume = this.costume(ctx, b.getFieldValue('ASSET')), name = speech(b.getFieldValue('NAME'));
    if (!name.trim() || name.length > 24) throw new Error('Sprite names use 1–24 characters.');
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      this.creations++;
      let id: string; do { id = `runtime-${++this.serial}`; } while (this.scene.actors.some(a => a.id === id));
      const actor: StudioActor = { ...structuredClone(target[0]), id, sourceId: target[0].sourceId ?? target[0].id, name: `${name.slice(0,18)} ${this.serial}`, costume, x: at.x, y: at.y, speech: '', variables: { score: 0 }, textVariables: {}, monitors: [], monitorPositions: {}, output: [], draggable: false };
      const next: Context = { ...original, actor, stack: [], ticks: 0, halted: false };
      this.scene.actors.push(actor); this.contexts.push(next); ids.push(id); this.schedule(next); this.trigger('created', id);
    }
    this.created.set(ctx.actor.id, ids);
  }
  private touching(actor: StudioActor, target: string) {
    return target === 'edge' ? Math.abs(actor.x) >= 100 || Math.abs(actor.y) >= 100 : actor.visible && this.scene.actors.some(other => other.id !== actor.id && other.visible && Math.hypot(actor.x - other.x, actor.y - other.y) <= (actor.size + other.size) / 10);
  }
  private other(actor: StudioActor, id: string) {
    const other = this.scene.actors.find(a => a.id === id && a.id !== actor.id);
    if (!other) throw new Error('Choose an existing other sprite in the sensing block.');
    return other;
  }
  private rememberContacts(trigger = false) {
    const current = new Set<string>();
    for (const actor of this.scene.actors) for (const target of ['edge', 'character']) if (this.touching(actor, target)) {
      const key = `${actor.id}:${target}`; current.add(key);
      if (trigger && !this.contacts.has(key)) this.trigger(target === 'edge' ? 'edge' : 'touch', actor.id);
    }
    this.contacts = current;
  }
  step(live = false): { scene: StudioScene; delay: number } | null {
    if (this.closed) return null;
    if (live) this.clock = Math.max(this.clock, this.now() - this.runStart);
    this.poll();
    while (this.tasks.length) {
      this.tasks.sort((a, b) => a.at - b.at);
      const task = this.tasks.shift()!;
      if (live && task.at > this.clock) { this.tasks.unshift(task); return { scene: this.snapshot(), delay: Math.max(16, Math.min(50, task.at - this.clock)) }; }
      if (++this.steps > 10000) { this.stop(); throw new Error('This run reached 10,000 steps. Press Run to start again, or simplify a forever loop.'); }
      if (!live) this.clock = task.at;
      task.actor.ticks = 0;
      let result: IteratorResult<Action, number | undefined>;
      try { result = task.script.next(); } catch (error) { this.stop(); throw error; }
      if (result.done) continue;
      this.scene.note = `${task.actor.actor.name}: ${result.value.note}`; this.scene.spriteId = task.actor.actor.id; this.scene.blockId = result.value.blockId;
      if (!this.ended && this.scene.actors.some(a => a.id === task.actor.actor.id)) { task.at = this.clock + result.value.delay; this.tasks.push(task); }
      this.rememberContacts(true);
      const next = this.tasks.length ? Math.min(...this.tasks.map(t => t.at)) : this.clock;
      return { scene: this.snapshot(), delay: Math.max(16, Math.min(this.schedules.length || this.keyRepeats.size ? 50 : 5000, next - this.clock)) };
    }
    if (!this.ended && this.active) return { scene: this.snapshot(), delay: 50 };
    if (!this.ended) this.scene.note = 'Run finished. Click a sprite or focus the stage and press an arrow/space key to test events.';
    return null;
  }
  stop() { this.tasks = []; this.schedules = []; this.behaviors.clear(); this.scene.prompts = []; this.answered.clear(); this.clearInput(); }
  dispose() { this.stop(); this.closed = true; for (const ws of new Set(this.contexts.map(ctx => ctx.ws))) ws.dispose(); this.systemWorkspace?.dispose(); this.systemWorkspace = null; }
  private tick(ctx: Context) { if (++ctx.ticks > 500) throw new Error('Too much work without a visible action. Simplify a nested loop or expression.'); }
  private action(block: Blockly.Block, note: string, delay = 180): Action { return { blockId: block.id, note, delay }; }
  private *call(ctx: Context, block: Blockly.Block, parameter?: number): Script {
    const raw = block.getFieldValue('NAME'), name = isSystemFunction(raw) ? raw : conceptFunctionName(raw), definition = ctx.functions.get(name);
    if (!definition) throw new Error(`Define ${name} before calling it.`);
    if (ctx.stack.includes(name) || ctx.stack.length >= 3) throw new Error('No recursion; use at most three nested function calls.');
    const arg = block.getInputTargetBlock('ARG'), expects = definition.getFieldValue('PARAM') === 'value';
    if (expects !== !!arg) throw new Error(expects ? `${name} needs a numeric argument.` : `${name} has no input; leave the argument empty.`);
    const value = arg ? num(yield* this.expression(ctx, arg, parameter)) : undefined;
    ctx.stack.push(name); try { return yield* this.statements(ctx, definition.getInputTargetBlock('DO'), value, 1); } finally { ctx.stack.pop(); }
  }
  private *expression(ctx: Context, b: Blockly.Block, parameter?: number, depth = 0): Generator<Action, Value, void> {
    this.tick(ctx); if (depth > 12) throw new Error('Use at most twelve nested expression inputs.');
    const type = b.type, actor = ctx.actor;
    const read = (name: string) => this.expression(ctx, input(b, name), parameter, depth + 1);
    if (type === 'ka_studio_text') return speech(b.getFieldValue('TEXT'));
    if (type === 'ka_studio_join') return speech(text(yield* read('A')) + text(yield* read('B')));
    if (type === 'ka_studio_text_compare') { const a = text(yield* read('A')), c = text(yield* read('B')); return b.getFieldValue('OP') === 'contains' ? a.includes(c) : a === c; }
    if (type === 'ka_studio_text_variable') { const name = variable(b.getFieldValue('VAR')), result = actor.textVariables?.[name]; if (result === undefined) throw new Error(`Set or answer text ${name} before reading it.`); return result; }
    if (type === 'ka_studio_timer') return Math.max(0, this.now() - this.timerStart) / (b.getFieldValue('UNIT') === 'milliseconds' ? 1 : 1000);
    if (type === 'ka_studio_key_down') return this.keys.has(b.getFieldValue('KEY'));
    if (type === 'ka_studio_pointer_down') return this.pointer.down;
    if (type === 'ka_studio_pointer_touch') return actor.visible && Math.hypot(actor.x - this.pointer.x, actor.y - this.pointer.y) <= actor.size / 10;
    if (type === 'ka_studio_color') return color(b.getFieldValue('COLOR'));
    if (type === 'ka_studio_random_color') return `#${Math.floor(this.random() * 0x1000000).toString(16).padStart(6, '0')}`;
    if (type === 'ka_studio_location') return location({ kind: 'location', x: num(yield* read('X')), y: num(yield* read('Y')) });
    if (type === 'ka_studio_random_location') return { kind: 'location', x: Math.floor(this.random() * 201) - 100, y: Math.floor(this.random() * 201) - 100 };
    if (type === 'ka_studio_pointer_location') return { kind: 'location', x: this.pointer.x, y: this.pointer.y };
    if (type === 'ka_studio_sprite_location') { const target = this.targets(ctx, b.getFieldValue('SPRITE'))[0]; if (!target) throw new Error('Choose a sprite with a location.'); return { kind: 'location', x: target.x, y: target.y }; }
    if (type === 'ka_studio_location_axis') { const at = location(yield* read('LOCATION')); return b.getFieldValue('AXIS') === 'y' ? at.y : at.x; }
    if (type === 'ka_studio_location_offset') { const at = location(yield* read('LOCATION')), distance = num(yield* read('VALUE')), direction = b.getFieldValue('DIRECTION'); return location({ kind: 'location', x: at.x + (direction === 'east' ? distance : direction === 'west' ? -distance : 0), y: at.y + (direction === 'north' ? distance : direction === 'south' ? -distance : 0) }); }
    if (type === 'ka_studio_sprite_ref') return { kind: 'sprites', ids: this.targets(ctx, b.getFieldValue('SPRITE')).map(a => a.id) };
    if (type === 'ka_studio_costume_group') { const id = this.costume(ctx, b.getFieldValue('ASSET')); return { kind: 'sprites', ids: this.scene.actors.filter(a => a.costume === id).map(a => a.id) }; }
    if (type === 'ka_studio_sprite_count') return selection(yield* read('TARGET')).ids.filter(id => this.scene.actors.some(a => a.id === id)).length;
    if (type === 'ka_studio_last_created') return { kind: 'sprites', ids: this.created.get(actor.id)?.filter(id => this.scene.actors.some(a => a.id === id)) ?? [] };
    if (type === 'ka_studio_group_touching') { const ids = new Set(selection(yield* read('TARGET')).ids); return actor.visible && this.scene.actors.some(a => a.id !== actor.id && ids.has(a.id) && a.visible && Math.hypot(actor.x - a.x, actor.y - a.y) <= (actor.size + a.size) / 10); }
    if (type === 'ka_studio_costume_is') return actor.costume === this.costume(ctx, b.getFieldValue('ASSET'));
    if (type === 'ka_studio_math') { const value = num(yield* read('VALUE')), op = b.getFieldValue('OP'); if (op === 'square_root' && value < 0) throw new Error('Square root needs a non-negative number.'); return num(op === 'round' ? Math.round(value) : op === 'floor' ? Math.floor(value) : op === 'ceiling' ? Math.ceil(value) : op === 'absolute' ? Math.abs(value) : Math.sqrt(value)); }
    if (type === 'ka_number') return num(Number(b.getFieldValue('NUM')));
    if (type === 'ka_score_value' || type === 'ka_studio_variable') { const name = type === 'ka_score_value' ? 'score' : variable(b.getFieldValue('VAR')); if (actor.variables[name] === undefined) throw new Error(`Set ${name} before reading it.`); return actor.variables[name]; }
    if (type === 'ka_parameter') { if (parameter === undefined) throw new Error('Use value only inside a function with an input.'); return parameter; }
    if (type === 'ka_boolean_value') return b.getFieldValue('BOOL') === 'True';
    if (type === 'ka_sprite_touching') return this.touching(actor, b.getFieldValue('TARGET'));
    if (type === 'ka_studio_touching' || type === 'ka_studio_other_position') {
      const other = this.other(actor, b.getFieldValue('SPRITE'));
      if (type === 'ka_studio_other_position') return b.getFieldValue('AXIS') === 'y' ? other.y : other.x;
      return actor.visible && other.visible && Math.hypot(actor.x - other.x, actor.y - other.y) <= (actor.size + other.size) / 10;
    }
    if (['ka_studio_x', 'ka_studio_y', 'ka_studio_heading', 'ka_studio_size_value'].includes(type)) return type === 'ka_studio_x' ? actor.x : type === 'ka_studio_y' ? actor.y : type === 'ka_studio_heading' ? actor.angle : actor.size;
    if (type === 'ka_function_value') { const value = yield* this.call(ctx, b, parameter); if (value === undefined) throw new Error('This function needs to RETURN a number.'); return value; }
    if (type === 'ka_boolean_not') return !bool(yield* read('VALUE'));
    if (type === 'ka_boolean_join') { const a = bool(yield* read('A')), op = b.getFieldValue('OP'); if (!['and', 'or'].includes(op)) throw new Error('Choose AND or OR.'); return op === 'and' ? a && bool(yield* read('B')) : a || bool(yield* read('B')); }
    const a = num(yield* read('A')), c = num(yield* read('B')), op = b.getFieldValue('OP');
    if (type === 'ka_studio_random') { if (!Number.isInteger(a) || !Number.isInteger(c) || c < a) throw new Error('Random needs ordered whole-number limits.'); return a + Math.floor(this.random() * (c - a + 1)); }
    if (type === 'ka_compare') { if (!['==', '!=', '<', '>', '<=', '>='].includes(op)) throw new Error('Choose a supported comparison.'); return op === '==' ? a === c : op === '!=' ? a !== c : op === '<' ? a < c : op === '>' ? a > c : op === '<=' ? a <= c : a >= c; }
    if (type !== 'ka_arithmetic' || !['+', '-', '*', '/', '%'].includes(op)) throw new Error('Use a value block in this input.');
    if ((op === '/' || op === '%') && c === 0) throw new Error('Cannot divide by zero.');
    return num(op === '+' ? a + c : op === '-' ? a - c : op === '*' ? a * c : op === '/' ? a / c : ((a % c) + c) % c);
  }
  private *statements(ctx: Context, first: Blockly.Block | null, parameter?: number, depth = 0): Script {
    if (depth > 4) throw new Error('Use at most four nested instruction groups.');
    const actor = ctx.actor;
    for (let b = first; b && !ctx.halted && this.scene.actors.some(a => a.id === actor.id); b = b.getNextBlock()) {
      this.tick(ctx); const type = b.type;
      const value = () => this.expression(ctx, input(b!, 'VALUE'), parameter);
      if (type === 'ka_studio_comment') { speech(b.getFieldValue('TEXT')); continue; }
      else if (type === 'ka_studio_set_text') {
        const name = variable(b.getFieldValue('VAR')); this.reserveVariable(actor, name, true); actor.textVariables ??= {}; actor.textVariables[name] = text(yield* value()); yield this.action(b, `Set text ${name}.`, 16);
      } else if (type === 'ka_studio_say_text') { actor.speech = text(yield* value()); yield this.action(b, `Says: ${actor.speech}`);
      } else if (type === 'ka_studio_print') {
        const label = text(yield* value()), at = location(yield* this.expression(ctx, input(b, 'LOCATION'), parameter));
        this.scene.labels = [...this.scene.labels ?? [], { id: b.id + ':' + actor.id, text: label, location: at }].slice(-12); yield this.action(b, `Print: ${label}`, 16);
      } else if (type === 'ka_studio_prompt' || type === 'ka_studio_prompt_choices') {
        const name = variable(b.getFieldValue('VAR')); this.reserveVariable(actor, name, true);
        const question = text(yield* this.expression(ctx, input(b, 'QUESTION'), parameter));
        const choices = type === 'ka_studio_prompt_choices' ? [1,2,3].map(i => speech(b!.getFieldValue(`CHOICE${i}`))) : [];
        if (choices.some(c => !c.trim()) || new Set(choices).size !== choices.length) throw new Error('Use three different, non-empty choices.');
        if ((this.scene.prompts?.length ?? 0) >= 4) throw new Error('Use at most four waiting questions.');
        const id = `question-${++this.serial}`;
        actor.textVariables ??= {}; actor.textVariables[name] = '';
        this.scene.prompts = [...this.scene.prompts ?? [], { id, actorId: actor.id, variable: name, question, choices }];
        while (!this.answered.has(id)) yield this.action(b, `Waiting for ${name}.`, 50);
        this.answered.delete(id);
      } else if (type === 'ka_studio_reset_timer') { this.timerStart = this.now(); yield this.action(b, 'Timer reset.', 16);
      } else if (type === 'ka_studio_background_color') { this.scene.backgroundColor = color(yield* this.expression(ctx, input(b, 'COLOR'), parameter)); yield this.action(b, 'Background color changed.', 16);
      } else if (type === 'ka_studio_title') { this.scene.title = { title: text(yield* this.expression(ctx, input(b, 'TITLE'), parameter)), subtitle: text(yield* this.expression(ctx, input(b, 'SUBTITLE'), parameter)) }; yield this.action(b, 'Title shown.', 16);
      } else if (type === 'ka_studio_hide_title') { delete this.scene.title; yield this.action(b, 'Title hidden.', 16);
      } else if (type === 'ka_studio_sound') { const name = b.getFieldValue('SOUND'); if (!['ping', 'jump', 'cheer', 'oops'].includes(name)) throw new Error('Choose a library sound.'); this.scene.sounds = [...this.scene.sounds ?? [], { id: ++this.serial, name }].slice(-8); yield this.action(b, `Sound ${name}.`, 150);
      } else if (type === 'ka_studio_tint' || type === 'ka_studio_clear_tint') { if (type === 'ka_studio_clear_tint') delete actor.tint; else actor.tint = color(yield* this.expression(ctx, input(b, 'COLOR'), parameter)); yield this.action(b, 'Sprite tint changed.', 16);
      } else if (type === 'ka_studio_goto_location') { const at = location(yield* this.expression(ctx, input(b, 'LOCATION'), parameter)); actor.x = at.x; actor.y = at.y; yield this.action(b, `Go to ${at.x}, ${at.y}.`, 16);
      } else if (type === 'ka_studio_spawn') { const count = num(yield* this.expression(ctx, input(b, 'COUNT'), parameter)), at = location(yield* this.expression(ctx, input(b, 'LOCATION'), parameter)); this.spawn(ctx, b, count, at); yield this.action(b, `Created ${count} sprites.`, 16);
      } else if (type === 'ka_studio_remove') {
        const ids = new Set(selection(yield* this.expression(ctx, input(b, 'TARGET'), parameter)).ids);
        this.scene.actors = this.scene.actors.filter(a => !ids.has(a.id)); this.tasks = this.tasks.filter(t => !ids.has(t.actor.actor.id)); this.schedules = this.schedules.filter(t => !ids.has(t.context.actor.id)); this.scene.prompts = this.scene.prompts?.filter(p => !ids.has(p.actorId));
        for (const key of this.behaviors) if ([...ids].some(id => key.startsWith(`${id}:`))) this.behaviors.delete(key);
        yield this.action(b, 'Removed sprites.', 16);
      } else if (type === 'ka_studio_for_sprites') {
        const ids = selection(yield* this.expression(ctx, input(b, 'TARGET'), parameter)).ids;
        for (const id of ids) { const target = this.scene.actors.find(a => a.id === id); if (!target) continue; const returned = yield* this.statements({ ...ctx, actor: target }, b.getInputTargetBlock('DO'), parameter, depth + 1); if (returned !== undefined) return returned; }
      } else if (type === 'ka_studio_monitor_at') {
        const name = variable(b.getFieldValue('VAR')); if (actor.variables[name] === undefined) throw new Error(`Set ${name} before showing its counter.`);
        actor.monitorPositions ??= {}; actor.monitorPositions[name] = location(yield* this.expression(ctx, input(b, 'LOCATION'), parameter)); actor.monitors = [...new Set([...actor.monitors, name])]; yield this.action(b, `Show ${name} counter.`, 16);
      } else if (type === 'ka_studio_draggable') { actor.draggable = b.getFieldValue('MODE') === 'start'; yield this.action(b, actor.draggable ? 'Drag this sprite on the stage.' : 'Dragging stopped.', 16);
      } else if (type === 'ka_studio_behavior') {
        const raw = b.getFieldValue('NAME'), name = isSystemFunction(raw) ? raw : conceptFunctionName(raw), key = `behavior:${name}`, tag = `${actor.id}:${key}`;
        if (b.getFieldValue('MODE') === 'stop') { this.behaviors.delete(tag); this.tasks = this.tasks.filter(t => !(t.actor.actor.id === actor.id && t.key === key)); }
        else if (!this.behaviors.has(tag)) {
          const definition = ctx.functions.get(name); if (!definition || definition.getFieldValue('PARAM') === 'value') throw new Error('Choose a defined behavior/function with no input.');
          const body = definition.getInputTargetBlock('DO'); if (!body) throw new Error('Put instructions inside this behavior.');
          this.behaviors.add(tag); this.enqueue(ctx, body, key, true);
        }
        yield this.action(b, `${b.getFieldValue('MODE')} ${name}.`, 16);
      } else if (type === 'ka_studio_stop_behaviors') {
        for (const key of this.behaviors) if (key.startsWith(`${actor.id}:`)) this.behaviors.delete(key);
        this.tasks = this.tasks.filter(t => !(t.actor.actor.id === actor.id && t.key.startsWith('behavior:'))); actor.draggable = false; yield this.action(b, 'All sprite behaviors stopped.', 16);
      } else if (type === 'ka_studio_for') {
        const name = variable(b.getFieldValue('VAR')), from = num(yield* this.expression(ctx, input(b, 'FROM'), parameter)), to = num(yield* this.expression(ctx, input(b, 'TO'), parameter)), by = num(yield* this.expression(ctx, input(b, 'BY'), parameter));
        if (![from,to,by].every(Number.isInteger) || by === 0 || Math.abs((to - from) / by) > 1000) throw new Error('Count with whole numbers, a non-zero step, and at most 1,001 iterations.');
        this.reserveVariable(actor, name);
        for (let i = from; by > 0 ? i <= to : i >= to; i += by) { actor.variables[name] = num(i); this.tick(ctx); const returned = yield* this.statements(ctx, b.getInputTargetBlock('DO'), parameter, depth + 1); if (returned !== undefined) return returned; if (ctx.halted) break; }
      } else if (type === 'ka_studio_chance') {
        const chance = num(yield* value()); if (chance < 0 || chance > 100) throw new Error('Chance ranges from 0 to 100 percent.');
        if (this.random() * 100 < chance) { const returned = yield* this.statements(ctx, b.getInputTargetBlock('DO'), parameter, depth + 1); if (returned !== undefined) return returned; }
      } else if (type === 'ka_function_define') {
        if (depth) throw new Error('Define functions directly below Run.');
        const name = conceptFunctionName(b.getFieldValue('NAME')); yield this.action(b, `Defined ${name}.`);
      } else if (type === 'ka_function_call') { yield* this.call(ctx, b, parameter); }
      else if (type === 'ka_function_return') { if (!ctx.stack.length) throw new Error('RETURN belongs inside a function.'); return num(yield* value()); }
      else if (type === 'ka_studio_stop') {
        ctx.halted = true;
        if (b.getFieldValue('SCOPE') === 'all') { this.stop(); this.ended = true; }
        if (b.getFieldValue('SCOPE') === 'sprite') {
          this.tasks = this.tasks.filter(t => t.actor.actor.id !== actor.id); this.schedules = this.schedules.filter(t => t.context.actor.id !== actor.id); this.scene.prompts = this.scene.prompts?.filter(p => p.actorId !== actor.id);
          for (const key of this.behaviors) if (key.startsWith(`${actor.id}:`)) this.behaviors.delete(key);
          actor.draggable = false;
        }
        yield this.action(b, b.getFieldValue('SCOPE') === 'all' ? 'All scripts stopped. Press Run to play again.' : 'This script stopped.', 16); return;
      } else if (type === 'ka_studio_monitor') {
        const name = variable(b.getFieldValue('VAR'));
        if (actor.variables[name] === undefined) throw new Error(`Set ${name} before showing its counter.`);
        actor.monitors = b.getFieldValue('MODE') === 'show' ? [...new Set([...actor.monitors, name])] : actor.monitors.filter(n => n !== name);
        yield this.action(b, `${b.getFieldValue('MODE')} ${name} counter.`, 16);
      } else if (type === 'ka_studio_broadcast') {
        const name = messageName(b.getFieldValue('MESSAGE')); this.trigger('message', undefined, name); yield this.action(b, `Broadcast ${name}.`, 16);
      } else if (type === 'ka_studio_wait_until') {
        while (!bool(yield* value())) yield this.action(b, 'Waiting for condition.', 50);
      } else if (type === 'ka_compute_score' || type === 'ka_studio_set_variable' || type === 'ka_studio_change_variable') {
        const name = type === 'ka_compute_score' ? 'score' : variable(b.getFieldValue('VAR'));
        this.reserveVariable(actor, name);
        actor.variables[name] = num((type === 'ka_studio_change_variable' ? actor.variables[name] ?? 0 : 0) + num(yield* value())); yield this.action(b, `${name} = ${actor.variables[name]}.`);
      } else if (type === 'ka_repeat' || type === 'ka_studio_repeat' || type === 'ka_studio_forever') {
        const count = type === 'ka_studio_forever' ? Infinity : Number(b.getFieldValue('COUNT'));
        if (type !== 'ka_studio_forever' && (!Number.isInteger(count) || count < 1 || count > 100)) throw new Error('Repeat 1–100 times.');
        for (let i = 0; i < count && !ctx.halted; i++) { this.tick(ctx); const returned = yield* this.statements(ctx, input(b, 'DO'), parameter, depth + 1); if (returned !== undefined) return returned; }
      } else if (type === 'ka_logic_if' || type === 'ka_studio_if') { const answer = bool(yield* value()), returned = yield* this.statements(ctx, b.getInputTargetBlock(answer ? 'DO' : 'ELSE'), parameter, depth + 1); if (returned !== undefined) return returned;
      } else if (type === 'ka_studio_axis') {
        const n = num(yield* value()), axis = b.getFieldValue('AXIS'), mode = b.getFieldValue('MODE');
        if (!['x', 'y'].includes(axis) || !['set', 'change'].includes(mode)) throw new Error('Choose x/y and set/change.');
        const key = axis as 'x' | 'y'; actor[key] = Math.max(-100, Math.min(100, (mode === 'set' ? 0 : actor[key]) + n)); yield this.action(b, `${key} = ${actor[key]}.`, 16);
      } else if (type === 'ka_studio_point') {
        actor.angle = ((num(yield* value()) % 360) + 360) % 360; yield this.action(b, `Direction ${actor.angle}°.`, 16);
      } else if (type === 'ka_sprite_move') {
        const distance = num(yield* value()), direction = b.getFieldValue('DIRECTION');
        if (Math.abs(distance) > 200 || !['forward', 'backward'].includes(direction)) throw new Error('Move forward/backward at most 200 steps.');
        const count = Math.max(1, Math.ceil(Math.abs(distance) / 10)), sign = direction === 'backward' ? -1 : 1;
        for (let i = 0; i < count; i++) { const angle = actor.angle * Math.PI / 180; actor.x = Math.max(-100, Math.min(100, actor.x + Math.cos(angle) * distance / count * sign)); actor.y = Math.max(-100, Math.min(100, actor.y + Math.sin(angle) * distance / count * sign)); yield this.action(b, `x ${Math.round(actor.x)}, y ${Math.round(actor.y)}.`, 50); if (this.touching(actor, 'edge')) break; }
      } else if (type === 'ka_sprite_goto') { const x = num(yield* this.expression(ctx, input(b, 'X'), parameter)), y = num(yield* this.expression(ctx, input(b, 'Y'), parameter)); if (Math.abs(x) > 100 || Math.abs(y) > 100) throw new Error('Stage coordinates range from −100 to 100.'); actor.x = x; actor.y = y; yield this.action(b, `Go to ${x}, ${y}.`);
      } else if (type === 'ka_sprite_turn') { const n = Number(b.getFieldValue('ANGLE')), side = b.getFieldValue('SIDE'); if (!Number.isFinite(n) || n < 0 || n > 360 || !['left', 'right'].includes(side)) throw new Error('Turn left/right by 0–360 degrees.'); actor.angle = (actor.angle + (side === 'left' ? n : -n) + 360) % 360; yield this.action(b, `Direction ${actor.angle}°.`);
      } else if (type === 'ka_sprite_bounce') { if (Math.abs(actor.x) >= 100) actor.angle = (180 - actor.angle + 360) % 360; if (Math.abs(actor.y) >= 100) actor.angle = (360 - actor.angle) % 360; yield this.action(b, 'Bounce at the border.');
      } else if (type === 'ka_sprite_say' || type === 'ka_studio_say_for' || type === 'ka_sprite_say_value') {
        actor.speech = type === 'ka_sprite_say_value' ? String(num(yield* value())) : speech(b.getFieldValue('TEXT'));
        const seconds = type === 'ka_studio_say_for' ? Number(b.getFieldValue('SECONDS')) : .2;
        if (!Number.isFinite(seconds) || seconds < .1 || seconds > 5) throw new Error('Say for 0.1–5 seconds.');
        yield this.action(b, `Says: ${actor.speech}`, seconds * 1000);
        if (type === 'ka_studio_say_for') { actor.speech = ''; yield this.action(b, 'Speech finished.'); }
      } else if (type === 'ka_studio_size') { const size = num(yield* value()); if (size < 20 || size > 180) throw new Error('Size ranges from 20 to 180 percent.'); actor.size = size; yield this.action(b, `Size ${size}%.`);
      } else if (type === 'ka_studio_costume' || type === 'ka_studio_next_costume' || type === 'ka_sprite_character') {
        const sprite = this.project.sprites.find(s => s.id === (actor.sourceId ?? actor.id))!;
        const id = type === 'ka_studio_next_costume' ? sprite.costumes[(sprite.costumes.indexOf(actor.costume) + 1) % sprite.costumes.length] : type === 'ka_sprite_character' ? this.project.assets.find(a => a.kind === 'character' && a.ref === b.getFieldValue('CHARACTER') && sprite.costumes.includes(a.id))?.id : b.getFieldValue('ASSET');
        if (!id || !sprite.costumes.includes(id)) throw new Error('Add this costume to the selected sprite first.'); actor.costume = id; yield this.action(b, 'Changed costume.');
      } else if (type === 'ka_studio_background' || type === 'ka_sprite_backdrop') {
        const id = type === 'ka_sprite_backdrop' ? this.project.assets.find(a => a.kind === 'background' && a.ref === b.getFieldValue('BACKGROUND'))?.id : b.getFieldValue('ASSET');
        if (!this.project.assets.some(a => a.id === id && isStudioBackground(a))) throw new Error('Add this background to the project first.'); this.scene.background = id; delete this.scene.backgroundColor; yield this.action(b, 'Changed background.');
      } else if (type === 'ka_sprite_visible') { actor.visible = b.getFieldValue('VISIBLE') === 'show'; yield this.action(b, actor.visible ? 'Show sprite.' : 'Hide sprite.');
      } else if (type === 'ka_sprite_wait') { const seconds = Number(b.getFieldValue('SECONDS')); if (!Number.isFinite(seconds) || seconds < .1 || seconds > 2) throw new Error('Wait 0.1–2 seconds.'); yield this.action(b, `Wait ${seconds}s.`, seconds * 1000);
      } else if (type === 'ka_show_number' || type === 'ka_show_boolean') { const result = yield* value(), checked = type === 'ka_show_number' ? num(result) : bool(result); actor.output = [...actor.output, checked].slice(-24); yield this.action(b, `Output: ${checked}.`);
      } else throw new Error('Put value blocks inside inputs and actions below an event hat.');
    }
  }
}
