import { ArrowRight } from 'lucide-react';
import { typingCourses } from '../shared/typingCurriculum';
import './typing.css';

export default function TypingCards({ grades = [1,2,3,4,5,6], student = false, completed = {} }: { grades?: number[]; student?: boolean; completed?: Record<number, number> }) {
  return <div className="typing-course-cards">{typingCourses.filter(course => grades.includes(course.grade)).map(course => <a className="typing-course-link" key={course.grade} href={student ? `/#/student-play/grade-${course.grade}/typing` : `/#/typing/grade-${course.grade}`}><div className="typing-course-art" aria-hidden="true"><kbd>{['F','D','W','A','1','?'][course.grade - 1]}</kbd><kbd>{['J','K','M','a','2','!'][course.grade - 1]}</kbd></div><div><span className="typing-grade-label">Grade {course.grade} · Typing</span><h3>{course.title}</h3><p>{course.description}</p><small>{completed[course.grade] === undefined ? '120 activities · 10 units' : `${completed[course.grade]} / 120 activities complete`}</small></div><ArrowRight size={22} aria-hidden="true" /></a>)}</div>;
}
