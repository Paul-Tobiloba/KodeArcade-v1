import { z } from 'zod';
export const importedStudent = z.object({ displayName: z.string().trim().min(1).max(60), grade: z.number().int().min(1).max(6), loginMethod: z.enum(['picture', 'text']) }).strict();
export type ImportedStudent = z.infer<typeof importedStudent>;
export const importLimit = 50;
export const csvTemplate = 'name,grade,login_method\nAlex Taylor,2,picture\nSam Ade,4,text\n';
export function parseClassroomCsv(source: string): { students: ImportedStudent[]; errors: string[] } {
  const errors: string[] = [], rows: string[][] = [];
  if (source.length > 12000) return { students: [], errors: ['The CSV is too large. Use at most 50 students per file.'] };
  let row: string[] = [], cell = '', quoted = false, afterQuote = false;
  const text = source.replace(/^\uFEFF/, '');
  for (let i = 0; i <= text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === undefined) return { students: [], errors: ['A quoted field is not closed.'] };
      if (char === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; afterQuote = true; } }
      else cell += char;
    } else if (char === '"' && !cell && !afterQuote) quoted = true;
    else if (char === ',' || char === '\n' || char === '\r' || char === undefined) {
      row.push(cell.trim()); cell = ''; afterQuote = false;
      if (char !== ',') { if (row.some(Boolean)) rows.push(row); row = []; if (char === '\r' && text[i + 1] === '\n') i++; }
    } else if (char === '"' || (afterQuote && char.trim())) return { students: [], errors: ['Check the CSV quotes and commas. Download the template for an example.'] };
    else if (!afterQuote) cell += char;
  }
  const headers = rows.shift()?.map(value => value.toLowerCase());
  if (!headers || headers.join(',') !== 'name,grade,login_method') return { students: [], errors: ['Use these headers, in order: name,grade,login_method.'] };
  if (!rows.length || rows.length > importLimit) return { students: [], errors: ['Include between 1 and 50 students per file.'] };
  const students: ImportedStudent[] = [], names = new Set<string>();
  rows.forEach((values, index) => {
    const grade = Number(values[1]);
    const parsed = importedStudent.safeParse({ displayName: values[0], grade, loginMethod: values[2]?.toLowerCase() || (grade <= 2 ? 'picture' : 'text') });
    if (values.length !== 3 || !parsed.success || /[\r\n\u0000-\u001f]/.test(values[0] ?? '')) { errors.push(`Row ${index + 2}: use a name (1–60 characters), grade 1–6, and picture or text.`); return; }
    const identity = parsed.data.displayName.normalize('NFKC').toLocaleLowerCase('en');
    if (names.has(identity)) { errors.push(`Row ${index + 2}: duplicate name in this file. Use a distinct classroom alias for students who share a name.`); return; }
    names.add(identity); students.push(parsed.data);
  });
  return { students, errors };
}
