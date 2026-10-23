import { useState } from 'react';
import type { Course } from './courses';
import LabCards, { labDefinitions, type LabKey, type LabLink } from './LabCards';

export default function StudentLabs({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState('');
  // The selector changes only the launch destination, never where existing work is saved.
  const course = courses.find(item => item.id === courseId) ?? courses.find(item => (item.grade ?? 0) >= 3) ?? courses[0];
  const links: Partial<Record<LabKey, LabLink>> = {};
  for (const lab of labDefinitions) if (course && (course.grade ?? 0) >= lab.minimumGrade) links[lab.id] = { href: `/#/student-play/${course.id}/${lab.path}`, label: `Open ${lab.name} · Grade ${course.grade}` };
  return <section className="student-labs" aria-labelledby="student-labs-title">
    <div className="student-labs-heading">
      <div><h2 id="student-labs-title">Labs</h2><p>Make games, build apps or draw with code. Your work saves privately to your account.</p></div>
      {courses.length > 1 && <label className="student-labs-course">Project course<select value={course?.id ?? ''} onChange={event => setCourseId(event.target.value)} aria-describedby="student-labs-scope">{courses.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
    </div>
    <p className="student-labs-scope" id="student-labs-scope">{course ? courses.length > 1 ? 'Choose a course to open its saved projects. Earlier work stays with its original course.' : `Projects open in ${course.title}.` : 'Your teacher, parent or guardian needs to choose a course before you can open a lab.'}</p>
    <LabCards links={links} unavailableMessage={course ? 'Available with a Grade 3–6 course' : 'A course needs to be assigned first'} />
  </section>;
}
