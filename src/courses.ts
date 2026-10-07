export type CourseId = 'arrows' | 'words' | 'builder';
export const courses: { id: CourseId; title: string; ages: string; description: string }[] = [
  { id: 'arrows', title: 'Little Explorers', ages: '6–8', description: 'Big arrow blocks, short instructions, and click-to-add controls.' },
  { id: 'words', title: 'Code Adventurers', ages: '8–10', description: 'Read movement blocks and practise sequences, loops and debugging.' },
  { id: 'builder', title: 'Independent Builders', ages: '10–14', description: 'Plan routes, explain your solutions and create your own rescue project.' },
];
export const isCourse = (id: unknown): id is CourseId => courses.some(course => course.id === id);
