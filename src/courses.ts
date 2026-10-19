export type GradeId = 'grade-1' | 'grade-2' | 'grade-3' | 'grade-4' | 'grade-5' | 'grade-6';
export type CourseId = GradeId | 'arrows' | 'words' | 'builder';
export type Course = { id: CourseId; title: string; ages: string; description: string; grade?: number; size: number; arrows: boolean; topics: string[] };
import { activeTopics, originalTopics } from '../shared/curriculum-topics';
const foundations = activeTopics(1);
const core = activeTopics(2);
const complete = activeTopics(3);
export const courses: Course[] = [
  { id: 'grade-1', grade: 1, title: 'Grade 1 · First Adventures', ages: '6–7', size: 5, arrows: true, topics: foundations, description: 'Sequences, directions and order together, then fixing little mistakes. 20 challenges + a project.' },
  { id: 'grade-2', grade: 2, title: 'Grade 2 · Pattern Explorers', ages: '7–8', size: 5, arrows: true, topics: core, description: 'Sequences, safe routes and first repeat patterns. 30 challenges + a project.' },
  { id: 'grade-3', grade: 3, title: 'Grade 3 · Code Adventurers', ages: '8–9', size: 6, arrows: false, topics: complete, description: 'Discover operators, true/false logic and reusable functions alongside data and coding foundations. 89 challenges + a route project, plus a free-build Byte Lab.' },
  { id: 'grade-4', grade: 4, title: 'Grade 4 · World Builders', ages: '9–10', size: 7, arrows: false, topics: complete, description: 'Combine arithmetic, Boolean decisions, reusable functions and data in blocks. 89 challenges + a route project, plus a free-build Byte Lab.' },
  { id: 'grade-5', grade: 5, title: 'Grade 5 · Logic Explorers', ages: '10–11', size: 8, arrows: false, topics: complete, description: 'Blocks or Python-style text: operators, Boolean logic, function parameters and return values. 89 challenges + a route project, plus a free-build Byte Lab.' },
  { id: 'grade-6', grade: 6, title: 'Grade 6 · Independent Creators', ages: '11–12+', size: 10, arrows: false, topics: complete, description: 'Compose functions, expressions and Boolean logic with data, plus drawing and a project. 89 challenges + a route project, plus a free-build Byte Lab.' },
];
const legacyTopics = originalTopics(3);
const legacy: Course[] = [
  { id: 'arrows', title: 'Little Explorers (previous course)', ages: '6–8', size: 5, arrows: true, topics: legacyTopics, description: 'Your previous arrow course and saved work.' },
  { id: 'words', title: 'Code Adventurers (previous course)', ages: '8–10', size: 5, arrows: false, topics: legacyTopics, description: 'Your previous text-block course and saved work.' },
  { id: 'builder', title: 'Independent Builders (previous course)', ages: '10–14', size: 5, arrows: false, topics: legacyTopics, description: 'Your previous builder course and saved work.' },
];
export const courseFor = (id: CourseId) => [...courses, ...legacy].find(course => course.id === id)!;
export const isCourse = (id: unknown): id is CourseId => [...courses, ...legacy].some(course => course.id === id);
export const firstChallenge = (id: CourseId) => id.startsWith('grade-') ? `${id}-sequences-1` : id === 'arrows' ? 'sequences-practice-1' : 'first-steps';
