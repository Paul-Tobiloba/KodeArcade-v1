import { expect, it } from 'vitest';
import { csvTemplate, parseClassroomCsv } from '../shared/classroom-import';
it('parses the template, BOM/CRLF/quoted commas and grade-based method defaults', () => {
  expect(parseClassroomCsv(csvTemplate).students).toHaveLength(2);
  expect(parseClassroomCsv('\uFEFFname,grade,login_method\r\n"Taylor, Alex",2,\r\nSam Ade,6,\r\n')).toEqual({ errors: [], students: [{ displayName: 'Taylor, Alex', grade: 2, loginMethod: 'picture' }, { displayName: 'Sam Ade', grade: 6, loginMethod: 'text' }] });
});
it('rejects invalid headers, quotes, grades, methods, control characters and duplicates', () => {
  for (const text of ['student,email\nAlex,a@b.com', 'name,grade,login_method\n"Alex,2,picture', 'name,grade,login_method\nAlex,9,text', 'name,grade,login_method\nAlex,2,secret', 'name,grade,login_method\nAlex,2,picture\nALEX,2,picture', 'name,grade,login_method\n"Al\nex",2,picture']) expect(parseClassroomCsv(text).errors.length).toBeGreaterThan(0);
});
it('bounds file and row counts before import', () => {
  expect(parseClassroomCsv('x'.repeat(12001)).errors.length).toBe(1);
  expect(parseClassroomCsv('name,grade,login_method\n' + Array.from({ length: 51 }, (_, i) => `Student ${i},2,picture`).join('\n')).errors.length).toBe(1);
});
