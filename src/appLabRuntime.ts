import { elementSchema, readAppGallery, type AppBlock, type AppElement, type AppProject, type AppTable } from '../shared/appLab';
import { appNumberFunctions, appPropertyFields, appTextFunctions } from '../shared/appLabApi';

export type AppValue = string | number | boolean;
export type AppScene = { screen: string; elements: AppElement[]; tables: AppTable[]; variables: [string, AppValue][]; output: string[]; error: string; steps: number };
export class AppRuntime {
  readonly scene: AppScene;
  private variables = new Map<string, AppValue>();
  private budget = 0;
  private eventCount = 0;
  private started = false;
  private activeLine = 0;
  constructor(private project: AppProject) {
    if (project.codeDraft !== undefined) throw new Error('Apply or discard your saved text draft before running this app.');
    const safe = readAppGallery({ version: 1, activeId: project.id, projects: [project] }).projects[0];
    this.project = safe;
    this.scene = { screen: safe.initialScreen, elements: structuredClone(safe.elements), tables: structuredClone(safe.tables), variables: [], output: [], error: '', steps: 0 };
    for (const e of this.scene.elements) if (e.kind === 'dropdown' && !e.options.includes(e.text)) e.text = e.options[0];
  }
  private tick(block?: AppBlock) {
    const line = block?.data?.match(/^line:(\d+)$/)?.[1]; if (line) this.activeLine = Number(line);
    if (++this.budget > 1000 || ++this.scene.steps > 10000) throw new Error('This run reached its safe step limit. Try a smaller repeat or simplify your code.');
  }
  private text(value: unknown) { return String(value).slice(0, 300); }
  private number(value: unknown): number {
    const parsed = typeof value === 'boolean' ? Number(value) : typeof value === 'number' ? value : String(value).trim() ? Number(value) : NaN;
    if (!Number.isFinite(parsed) || Math.abs(parsed) > 1e6) throw new Error('Expected a number between −1,000,000 and 1,000,000. Check your inputs and calculation.');
    return parsed;
  }
  private element(id: unknown) {
    const element = this.scene.elements.find(e => e.id === id);
    if (!element) throw new Error(`Control “${this.text(id)}” does not exist. Choose its ID in the block.`);
    return element;
  }
  private setText(element: AppElement, value: unknown) {
    const text = this.text(value);
    if (element.kind === 'dropdown' && !element.options.includes(text)) throw new Error(`Choose one of ${element.id}'s dropdown options before setting its text. The selected option is unchanged.`);
    element.text = text;
  }
  private propertyKey(property: unknown) {
    const name = String(property);
    if (!Object.hasOwn(appPropertyFields, name)) throw new Error('Choose a supported control property.');
    return appPropertyFields[name as keyof typeof appPropertyFields];
  }
  private updateElement(element: AppElement, patch: Partial<AppElement>) {
    const result = elementSchema.safeParse({ ...element, ...patch });
    if (!result.success) throw new Error('Check the property value: use hex colours, valid sizes and positions inside the 320 × 480 screen.');
    Object.assign(element, result.data);
  }
  private setProperty(element: AppElement, property: unknown, value: AppValue) {
    const key = this.propertyKey(property);
    if (key === 'text') { this.setText(element, value); return; }
    if (key === 'checked' && element.kind !== 'checkbox') throw new Error('Set checked only on a checkbox.');
    if (key === 'value' && element.kind !== 'slider') throw new Error('Set value only on a slider.');
    this.updateElement(element, { [key]: value });
  }
  private table(id: unknown) {
    const table = this.scene.tables.find(t => t.id === id);
    if (!table) throw new Error(`Table “${this.text(id)}” does not exist. Create it in Data first.`);
    return table;
  }
  private input(block: AppBlock, name: string): AppValue {
    const connection = block.inputs?.[name], child = connection?.block ?? connection?.shadow;
    if (!child) throw new Error(`Connect a value to ${name.toLowerCase()} in your ${block.type.replace('al_', '')} block.`);
    return this.value(child);
  }
  private cell(block: AppBlock) {
    const table = this.table(block.fields?.TABLE);
    const row = this.number(this.input(block, 'ROW')), column = table.columns.indexOf(String(block.fields?.COLUMN));
    if (!Number.isInteger(row) || row < 0 || row >= table.rows.length) throw new Error(`Table row ${row} is missing. The first row is 0.`);
    if (column < 0) throw new Error('That column is missing. Check its name in Data.');
    return { table, row, column };
  }
  private value(block: AppBlock): AppValue {
    this.tick(block);
    const f = block.fields ?? {};
    switch (block.type) {
      case 'al_text': return this.text(f.TEXT ?? '');
      case 'al_number': return this.number(f.NUM ?? 0);
      case 'al_boolean': {
        if (typeof f.BOOL !== 'boolean') throw new Error('Choose true or false.');
        return f.BOOL;
      }
      case 'al_var': {
        if (!this.variables.has(String(f.NAME))) throw new Error(`Set variable “${this.text(f.NAME)}” before reading it.`);
        return this.variables.get(String(f.NAME))!;
      }
      case 'al_read': {
        const e = this.element(f.ID);
        return f.MODE === 'number' ? this.number(e.kind === 'slider' ? e.value : e.text) : f.MODE === 'checked' ? e.checked : e.text;
      }
      case 'al_join': return this.text(this.text(this.input(block, 'A')) + this.text(this.input(block, 'B')));
      case 'al_property': return this.element(f.ID)[this.propertyKey(f.PROPERTY)];
      case 'al_not': {
        const value = this.input(block, 'VALUE');
        if (typeof value !== 'boolean') throw new Error('Connect a true/false value to not.');
        return !value;
      }
      case 'al_number_fn': {
        const fn = String(f.FN);
        if (!Object.hasOwn(appNumberFunctions, fn)) throw new Error('Choose a supported number function.');
        const a = this.number(this.input(block, 'A'));
        if (fn === 'roundNumber') return Math.round(a);
        if (fn === 'floorNumber') return Math.floor(a);
        if (fn === 'ceilNumber') return Math.ceil(a);
        if (fn === 'absNumber') return Math.abs(a);
        const b = this.number(this.input(block, 'B'));
        if (fn === 'minNumber') return Math.min(a, b);
        if (fn === 'maxNumber') return Math.max(a, b);
        if (!Number.isInteger(a) || !Number.isInteger(b) || a > b) throw new Error('Random number needs whole-number limits, with the minimum no greater than the maximum.');
        return Math.floor(Math.random() * (b - a + 1)) + a;
      }
      case 'al_text_fn': {
        const fn = String(f.FN);
        if (!Object.hasOwn(appTextFunctions, fn)) throw new Error('Choose a supported text function.');
        const a = this.text(this.input(block, 'A'));
        if (fn === 'textLength') return a.length;
        if (fn === 'upperCase') return this.text(a.toUpperCase());
        if (fn === 'lowerCase') return this.text(a.toLowerCase());
        if (fn === 'containsText') return a.includes(this.text(this.input(block, 'B')));
        const start = this.number(this.input(block, 'B')), end = this.number(this.input(block, 'C'));
        if (![start, end].every(n => Number.isInteger(n) && n >= 0 && n <= 300)) throw new Error('Text positions must be whole numbers from 0 to 300.');
        return a.slice(start, end);
      }
      case 'al_math': {
        const a = this.number(this.input(block, 'A')), b = this.number(this.input(block, 'B'));
        if ((f.OP === '/' || f.OP === '%') && b === 0) throw new Error('Cannot divide by zero. Check the second number.');
        return this.number(f.OP === '+' ? a + b : f.OP === '-' ? a - b : f.OP === '*' ? a * b : f.OP === '/' ? a / b : f.OP === '%' ? a % b : (() => { throw new Error('Choose a supported arithmetic operator.'); })());
      }
      case 'al_compare': {
        const a = this.input(block, 'A'), b = this.input(block, 'B');
        if (f.OP === '=') return a === b;
        if (f.OP === '!=') return a !== b;
        if (f.OP === '>') return this.number(a) > this.number(b);
        if (f.OP === '<') return this.number(a) < this.number(b);
        if (f.OP === '>=') return this.number(a) >= this.number(b);
        if (f.OP === '<=') return this.number(a) <= this.number(b);
        if (f.OP === 'and') return Boolean(a) && Boolean(b);
        if (f.OP === 'or') return Boolean(a) || Boolean(b);
        throw new Error('Choose a supported comparison.');
      }
      case 'al_rows': return this.table(f.TABLE).rows.length;
      case 'al_cell': { const { table, row, column } = this.cell(block); return table.rows[row][column]; }
      default: throw new Error('Use a value block inside this input, not an action.');
    }
  }
  private actions(first?: AppBlock) {
    let block = first;
    while (block) {
      this.tick(block);
      if (block.enabled === false || block.disabledReasons?.length) { block = block.next?.block; continue; }
      const f = block.fields ?? {};
      switch (block.type) {
        case 'al_set_text': { const value = this.input(block, 'VALUE'); this.setText(this.element(f.ID), f.MODE === 'number' ? this.number(value) : value); break; }
        case 'al_set_property': this.setProperty(this.element(f.ID), f.PROPERTY, this.input(block, 'VALUE')); break;
        case 'al_position': this.updateElement(this.element(f.ID), { x: this.number(this.input(block, 'X')), y: this.number(this.input(block, 'Y')) }); break;
        case 'al_size': this.updateElement(this.element(f.ID), { width: this.number(this.input(block, 'WIDTH')), height: this.number(this.input(block, 'HEIGHT')) }); break;
        case 'al_screen': {
          if (!this.project.screens.some(s => s.id === f.ID)) throw new Error('That screen is missing. Choose an existing screen.');
          this.scene.screen = String(f.ID); break;
        }
        case 'al_visible': this.element(f.ID).hidden = f.MODE === 'hide'; break;
        case 'al_set_var': {
          const name = String(f.NAME ?? '');
          if (!/^[A-Za-z][A-Za-z0-9_]{0,29}$/.test(name)) throw new Error('Variable names start with a letter and use letters, numbers or underscores.');
          if (!this.variables.has(name) && this.variables.size >= 20) throw new Error('Use up to 20 variables in one app.');
          this.variables.set(name, this.input(block, 'VALUE')); break;
        }
        case 'al_print': this.scene.output = [...this.scene.output, this.text(this.input(block, 'VALUE'))].slice(-30); break;
        case 'al_if': {
          const condition = this.input(block, 'TEST');
          if (typeof condition !== 'boolean') throw new Error('Connect a true/false comparison to your if block.');
          this.actions(block.inputs?.[condition ? 'DO' : 'ELSE']?.block); break;
        }
        case 'al_repeat': {
          const count = this.number(this.input(block, 'COUNT'));
          if (!Number.isInteger(count) || count < 0) throw new Error('Repeat needs a whole number of 0 or more.');
          for (let i = 0; i < count; i++) { this.tick(); this.actions(block.inputs?.DO?.block); } break;
        }
        case 'al_set_cell': { const { table, row, column } = this.cell(block); table.rows[row][column] = this.input(block, 'VALUE'); break; }
        case 'al_add_row': {
          const table = this.table(f.TABLE);
          if (table.rows.length >= 50) throw new Error('This table has reached its 50-row limit.');
          table.rows.push(table.columns.map(() => '')); break;
        }
        case 'al_delete_row': {
          const table = this.table(f.TABLE), row = this.number(this.input(block, 'ROW'));
          if (!Number.isInteger(row) || row < 0 || row >= table.rows.length) throw new Error('Choose an existing whole-number row index, starting at 0.');
          table.rows.splice(row, 1); break;
        }
        default: throw new Error('Connect action blocks below Run or an event.');
      }
      block = block.next?.block;
    }
  }
  private execute(roots: AppBlock[]) {
    if (this.scene.error) return;
    this.budget = 0;
    try { for (const block of roots) this.actions(block.inputs?.DO?.block); }
    catch (failure) { this.scene.error = `${this.activeLine ? `Line ${this.activeLine}: ` : ''}${failure instanceof Error ? failure.message : 'Check your blocks.'}`; }
    this.scene.variables = [...this.variables];
  }
  start() {
    if (this.started) return this.snapshot();
    this.started = true;
    this.execute(this.project.code.blocks?.blocks.filter(b => b.type === 'al_start' && b.enabled !== false && !b.disabledReasons?.length) ?? []);
    return this.snapshot();
  }
  event(id: string, event: 'click' | 'change') {
    if (!this.started || this.scene.error) return this.snapshot();
    const control = this.scene.elements.find(e => e.id === id);
    if (!control || control.hidden || control.screen !== this.scene.screen) return this.snapshot();
    if (++this.eventCount > 500) { this.scene.error = 'This run reached 500 events. Stop and Run again to continue.'; return this.snapshot(); }
    this.execute(this.project.code.blocks?.blocks.filter(b => b.type === 'al_event' && b.fields?.ID === id && b.fields?.EVENT === event && b.enabled !== false && !b.disabledReasons?.length) ?? []);
    return this.snapshot();
  }
  inputValue(id: string, value: string | number | boolean) {
    const e = this.element(id);
    if (!this.started || this.scene.error || e.hidden || e.screen !== this.scene.screen) return this.snapshot();
    if (e.kind === 'checkbox') e.checked = Boolean(value);
    else if (e.kind === 'slider') e.value = Math.max(0, Math.min(100, this.number(value)));
    else this.setText(e, value);
    return this.snapshot();
  }
  snapshot(): AppScene { return structuredClone(this.scene); }
}
