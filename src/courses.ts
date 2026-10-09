export type GradeId = 'grade-1' | 'grade-2' | 'grade-3' | 'grade-4' | 'grade-5' | 'grade-6';
export type CourseId = GradeId | 'arrows' | 'words' | 'builder';
export type Course = { id: CourseId; title: string; ages: string; description: string; grade?: number; size: number; arrows: boolean; topics: string[] };
const foundations = ['sequences', 'directions', 'debugging'];
const core = ['sequences', 'directions', 'loops', 'debugging'];
const complete = [...core, 'conditionals', 'variables'];
export const courses: Course[] = [
  { id: 'grade-1', grade: 1, title: 'Grade 1 · First Adventures', ages: '6–7', size: 5, arrows: true, topics: foundations, description: 'Arrow instructions, finding a route and fixing little mistakes. 30 challenges + a project.' },
  { id: 'grade-2', grade: 2, title: 'Grade 2 · Pattern Explorers', ages: '7–8', size: 5, arrows: true, topics: core, description: 'Longer arrow journeys and first repeat patterns. 40 challenges + a project.' },
  { id: 'grade-3', grade: 3, title: 'Grade 3 · Code Adventurers', ages: '8–9', size: 6, arrows: false, topics: complete, description: 'Text blocks, decisions and stored numbers on a 6×6 board. 60 challenges + a project.' },
  { id: 'grade-4', grade: 4, title: 'Grade 4 · World Builders', ages: '9–10', size: 7, arrows: false, topics: complete, description: 'Combine loops, decisions and variables on 7×7 boards. 60 challenges + a project.' },
  { id: 'grade-5', grade: 5, title: 'Grade 5 · Logic Explorers', ages: '10–11', size: 8, arrows: false, topics: complete, description: 'Blocks or Python-style text on an 8×8 world, plus drawing with loops and angles. 60 challenges + a project.' },
  { id: 'grade-6', grade: 6, title: 'Grade 6 · Independent Creators', ages: '11–12+', size: 10, arrows: false, topics: complete, description: 'Blocks or Python-style text on 10×10 routes, drawing patterns and your own project. 60 challenges + a project.' },
];
const legacy: Course[] = [
  { id: 'arrows', title: 'Little Explorers (previous course)', ages: '6–8', size: 5, arrows: true, topics: complete, description: 'Your previous arrow course and saved work.' },
  { id: 'words', title: 'Code Adventurers (previous course)', ages: '8–10', size: 5, arrows: false, topics: complete, description: 'Your previous text-block course and saved work.' },
  { id: 'builder', title: 'Independent Builders (previous course)', ages: '10–14', size: 5, arrows: false, topics: complete, description: 'Your previous builder course and saved work.' },
];
export const courseFor = (id: CourseId) => [...courses, ...legacy].find(course => course.id === id)!;
export const isCourse = (id: unknown): id is CourseId => [...courses, ...legacy].some(course => course.id === id);
export const firstChallenge = (id: CourseId) => id.startsWith('grade-') ? `${id}-sequences-1` : id === 'arrows' ? 'sequences-practice-1' : 'first-steps';
