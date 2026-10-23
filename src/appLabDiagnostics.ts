import type { AppBlock, AppProject } from '../shared/appLab';
import { parseAppCode } from './appLabCode';
import { appPropertyFields } from '../shared/appLabApi';
export type CodeIssue = { line: number; message: string; severity: 'error' | 'warning' };
export function appCodeIssues(source: string, project: AppProject): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const add = (b: AppBlock, message: string, severity: 'error' | 'warning' = 'error') => issues.push({ line: Number(b.data?.match(/^line:(\d+)$/)?.[1] ?? 1), message, severity });
  try {
    const code = parseAppCode(source), roots = code.blocks?.blocks ?? [], assigned = new Set<string>();
    const visit = (b: AppBlock, fn: (b: AppBlock) => void) => { fn(b); Object.values(b.inputs ?? {}).forEach(i => { const child = i.block ?? i.shadow; if (child) visit(child, fn); }); if (b.next) visit(b.next.block, fn); };
    roots.forEach(b => visit(b, b => { if (b.type === 'al_set_var') assigned.add(String(b.fields?.NAME)); }));
    roots.forEach(b => {
      if (!['al_start', 'al_event'].includes(b.type)) add(b, 'This command is unattached and does not run. Move it inside onStart or onEvent.', 'warning');
      visit(b, b => {
        const f = b.fields ?? {};
        if (['al_event', 'al_read', 'al_set_text', 'al_visible', 'al_property', 'al_set_property', 'al_position', 'al_size'].includes(b.type) && !project.elements.some(e => e.id === f.ID)) add(b, `Control “${f.ID}” does not exist. Add it in Design or change this ID.`);
        if (['al_property', 'al_set_property'].includes(b.type) && !Object.hasOwn(appPropertyFields, String(f.PROPERTY))) add(b, 'Choose a supported control property.');
        if (b.type === 'al_screen' && !project.screens.some(s => s.id === f.ID)) add(b, `Screen “${f.ID}” does not exist. Choose an ID from Design.`);
        if (['al_cell', 'al_set_cell', 'al_rows', 'al_add_row', 'al_delete_row'].includes(b.type)) {
          const table = project.tables.find(t => t.id === f.TABLE);
          if (!table) add(b, `Table “${f.TABLE}” does not exist. Add it in Data.`);
          else if (['al_cell', 'al_set_cell'].includes(b.type) && !table.columns.includes(String(f.COLUMN))) add(b, `Column “${f.COLUMN}” does not exist in ${table.id}.`);
        }
        if (b.type === 'al_var' && !assigned.has(String(f.NAME))) add(b, `Variable “${f.NAME}” is never set. Add var ${f.NAME} = … before reading it.`, 'warning');
      });
    });
  } catch (e) {
    const failure = e as Error & { loc?: { line: number } };
    issues.push({ line: failure.loc?.line ?? Number(failure.message.match(/^Line (\d+):/)?.[1] ?? 1), message: failure.message, severity: 'error' });
  }
  return issues;
}
