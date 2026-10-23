import { z } from 'zod';

export const APP_LAB_VERSION = 1;
export const appLabStorageKey = (course: string) => `kodearcade-app-lab-v1:${course}`;
const identifier = z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,29}$/);
const colour = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const text = z.string().max(300);
export const elementKinds = ['button', 'label', 'input', 'textarea', 'dropdown', 'checkbox', 'slider'] as const;
export type ElementKind = typeof elementKinds[number];
export const elementSchema = z.object({
  id: identifier, screen: identifier, kind: z.enum(elementKinds), text, x: z.number().int().min(0).max(300), y: z.number().int().min(0).max(460),
  width: z.number().int().min(20).max(320), height: z.number().int().min(20).max(480),
  colour, background: colour, fontSize: z.number().int().min(10).max(40), hidden: z.boolean(),
  options: z.array(z.string().max(100)).min(1).max(20), checked: z.boolean(), value: z.number().min(0).max(100),
}).strict().refine(e => e.x + e.width <= 320 && e.y + e.height <= 480, 'Keep the control inside the 320 × 480 screen.');
export type AppElement = z.infer<typeof elementSchema>;

export const blockTypes = ['al_start', 'al_event', 'al_text', 'al_number', 'al_read', 'al_set_text', 'al_screen', 'al_visible', 'al_set_var', 'al_var', 'al_math', 'al_join', 'al_compare', 'al_if', 'al_repeat', 'al_print', 'al_cell', 'al_rows', 'al_set_cell', 'al_property', 'al_set_property', 'al_position', 'al_size', 'al_number_fn', 'al_text_fn', 'al_not', 'al_add_row', 'al_delete_row', 'al_boolean'] as const;
export type AppBlock = { type: typeof blockTypes[number]; id?: string; x?: number; y?: number; fields?: Record<string, string | number | boolean>; inputs?: Record<string, { block?: AppBlock; shadow?: AppBlock }>; next?: { block: AppBlock }; enabled?: boolean; disabledReasons?: string[]; collapsed?: boolean; inline?: boolean; deletable?: boolean; movable?: boolean; editable?: boolean; data?: string };
const fieldValue = z.union([z.string().max(300), z.number().finite().min(-1e6).max(1e6), z.boolean()]);
const blockSchema: z.ZodType<AppBlock> = z.lazy(() => z.object({
  type: z.enum(blockTypes), id: z.string().max(100).optional(), x: z.number().finite().min(-1e6).max(1e6).optional(), y: z.number().finite().min(-1e6).max(1e6).optional(),
  fields: z.record(z.string().max(30), fieldValue).refine(fields => Object.keys(fields).length <= 6).optional(),
  inputs: z.record(z.string().max(30), z.object({ block: blockSchema.optional(), shadow: blockSchema.optional() }).strict()).refine(inputs => Object.keys(inputs).length <= 4).optional(),
  next: z.object({ block: blockSchema }).strict().optional(), enabled: z.boolean().optional(), disabledReasons: z.array(z.string().max(100)).max(8).optional(),
  collapsed: z.boolean().optional(), inline: z.boolean().optional(), deletable: z.boolean().optional(), movable: z.boolean().optional(), editable: z.boolean().optional(), data: z.string().max(300).optional(),
}).strict());
export type AppCode = { blocks?: { languageVersion: number; blocks: AppBlock[] } };
export const codeSchema = z.object({ blocks: z.object({ languageVersion: z.number().int().min(0).max(1), blocks: z.array(blockSchema).max(120) }).strict().optional() }).strict();
const cell = z.union([z.string().max(300), z.number().finite().min(-1e6).max(1e6), z.boolean()]);
export const tableSchema = z.object({ id: identifier, columns: z.array(identifier).min(1).max(8), rows: z.array(z.array(cell).max(8)).max(50) }).strict().refine(table => new Set(table.columns).size === table.columns.length && table.rows.every(row => row.length === table.columns.length), 'Use unique columns and one value per column.');
export type AppTable = z.infer<typeof tableSchema>;
export const projectSchema = z.object({
  id: z.string().uuid(), title: z.string().trim().min(1).max(60), screens: z.array(z.object({ id: identifier, background: colour }).strict()).min(1).max(6),
  initialScreen: identifier, elements: z.array(elementSchema).max(40), code: codeSchema, codeDraft: z.string().max(20000).optional(), tables: z.array(tableSchema).max(6),
}).strict().superRefine((p, ctx) => {
  const ids = [...p.screens.map(s => s.id), ...p.elements.map(e => e.id)];
  if (new Set(ids).size !== ids.length || !p.screens.some(s => s.id === p.initialScreen) || p.elements.some(e => !p.screens.some(s => s.id === e.screen)) || new Set(p.tables.map(t => t.id)).size !== p.tables.length) ctx.addIssue({ code: 'custom', message: 'Use unique IDs and valid screens.' });
});
export type AppProject = z.infer<typeof projectSchema>;
export const appGallerySchema = z.object({ version: z.literal(1), activeId: z.string().uuid(), projects: z.array(projectSchema).min(1).max(8) }).strict().superRefine((g, ctx) => {
  if (new Set(g.projects.map(p => p.id)).size !== g.projects.length || !g.projects.some(p => p.id === g.activeId)) ctx.addIssue({ code: 'custom', message: 'Choose an existing project with a unique ID.' });
});
export type AppGallery = z.infer<typeof appGallerySchema>;

// Bound unknown JSON before recursive schema parsing (including imported backups).
export function boundedAppData(value: unknown) {
  let nodes = 0;
  const visit = (item: unknown, depth: number): boolean => {
    if (++nodes > 18000 || depth > 42) return false;
    if (item === null || typeof item !== 'object') return true;
    return Object.values(item).every(child => visit(child, depth + 1));
  };
  try { return JSON.stringify(value).length <= 220000 && visit(value, 0); } catch { return false; }
}
export function readAppGallery(value: unknown): AppGallery {
  if (!boundedAppData(value)) throw new Error('This App Lab backup is too large or too deeply nested. Your project is unchanged.');
  const parsed = appGallerySchema.safeParse(value);
  if (!parsed.success) throw new Error('This is not a supported App Lab project backup. Your existing projects are unchanged.');
  for (const project of parsed.data.projects) {
    let count = 0;
    const visit = (block: AppBlock, depth: number) => {
      if (++count > 120 || depth > 18) throw new Error('Use up to 120 code blocks with no more than 18 nested connections.');
      Object.values(block.inputs ?? {}).forEach(input => { if (input.block) visit(input.block, depth + 1); if (input.shadow) visit(input.shadow, depth + 1); });
      if (block.next) visit(block.next.block, depth + 1);
    };
    project.code.blocks?.blocks.forEach(block => visit(block, 0));
  }
  return parsed.data;
}
export function validAppGallery(value: unknown) { try { readAppGallery(value); return true; } catch { return false; } }

export function newElement(kind: ElementKind, id: string, screen: string, x = 30, y = 60): AppElement {
  return { id, screen, kind, text: kind === 'button' ? 'Tap me' : kind === 'label' ? 'Your idea starts here' : kind === 'checkbox' ? 'Choose me' : '', x, y, width: 240, height: kind === 'textarea' ? 90 : 44, colour: kind === 'button' ? '#ffffff' : '#181339', background: kind === 'button' ? '#6237df' : '#ffffff', fontSize: 16, hidden: false, options: ['Option 1', 'Option 2'], checked: false, value: 50 };
}
export function newAppProject(title = 'My first app'): AppProject {
  return { id: crypto.randomUUID(), title, screens: [{ id: 'home', background: '#f7f4fe' }], initialScreen: 'home', elements: [], tables: [], code: { blocks: { languageVersion: 0, blocks: [{ type: 'al_start', x: 40, y: 40 }] } } };
}
