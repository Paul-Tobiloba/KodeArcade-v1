import { ArrowRight, Smartphone } from 'lucide-react';
import CharacterSprite from './CharacterSprite';
import './coding-practical.css';
export default function PracticalCards({grades=[2,3,4],student=false,results={}}:{grades?:number[];student?:boolean;results?:Record<number,{completed:number;mastery:number}>}) {
  const available=[2,3,4].filter(grade=>grades.includes(grade)); if(!available.length)return null;
  const titles:Record<number,string>={2:'Tap, hold, release',3:'Build a greeting app and click counter',4:'Basketball bounce: reusable actions'};
  const descriptions:Record<number,string>={2:'Events, held controls and safe stopping',3:'App Lab input, events, variables and reset',4:'Functions, score, reset and useful tests'};
  return <section className="practical-cards" aria-label="New practical coding units"><h2>Code, test and make a change</h2><p>Guided coding units. Practice stars and app-checked mastery are separate.</p><div>{available.map(grade=><a key={grade} href={`/#/${student?'student-play':'learn'}/grade-${grade}/practical`}><span className="practical-card-art" aria-hidden="true">{grade===2?<CharacterSprite concept="Sequences"/>:grade===3?<Smartphone size={48}/>:<img src="/images/studio/basketball.png" alt="" width="64" height="64"/>}</span><span><strong>{titles[grade]}</strong><small>Grade {grade} · Practical coding</small><span>{descriptions[grade]}</span><span>{results[grade]?.mastery ? 'App-checked mastery demonstrated' : results[grade]?.completed ? 'Practice complete · 5 stars' : '5 practice steps · a fresh mastery check'}</span></span><ArrowRight size={21}/></a>)}</div></section>;
}
