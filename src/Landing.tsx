import { useState } from 'react';
import { adventures, MarketingNav, MarketingFooter } from './MarketingPages';
import { ArrowRight, Blocks, BookOpen, Check, Code2, Lightbulb, Gamepad2, Box, Trophy, ShieldCheck, Search, Play, Users, Zap, Star, Clock3, X } from 'lucide-react';
import './landing.css';

const learn = '/#/learn';
export default function Landing() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = adventures.filter(course => `${course.title} ${course.description} ${course.level}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <div className="landing">
    <figure className="hero-art"><img src="/images/adventure-sky.png" width="2098" height="750" fetchPriority="high" alt="Byte jumps across glowing code blocks toward a golden star, among floating islands and waterfalls." /></figure>
    <a className="skip-link" href="#main">Skip to content</a>
    <MarketingNav page="home" search={<button className="search-toggle" aria-label={searchOpen ? 'Close course search' : 'Search courses'} aria-expanded={searchOpen} aria-controls="course-search" onClick={() => { setSearchOpen(!searchOpen); setQuery(''); if (!searchOpen) requestAnimationFrame(() => document.getElementById('course-query')?.focus()); }}>{searchOpen ? <X size={19} /> : <Search size={19} />}</button>} />
    <main id="main">
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="hero-copy"><div className="hero-label"><Gamepad2 size={21} />Coding adventures for curious minds</div><h1 id="hero-title">Play. Build.<br /><span>Learn.</span></h1><p>Help Byte find a way forward, one block of code at a time. Interactive coding adventures that make learning fun, hands-on, and unforgettable.</p><div className="hero-actions"><a className="landing-button" href={learn}>Start your adventure<ArrowRight size={20} /></a><a className="landing-button secondary" href="#courses"><Play size={20} fill="currentColor" />Explore courses</a></div><ul className="hero-trust"><li><Users />Ages 6–14</li><li><Zap />No sign-up needed</li><li><Star />Hands-on coding</li></ul></div>
      </section>
      <section className="feature-grid landing-width" aria-label="Learning with KodeArcade">
        {[
          { icon: Gamepad2, title: 'Guided Missions', copy: 'Step-by-step adventures that teach real coding skills.', color: 'purple', href: '#how-it-works' },
          { icon: Box, title: 'Build Real Projects', copy: 'Put your ideas to work with a route of your own.', color: 'blue', href: '#explore' },
          { icon: Trophy, title: 'Game-like Progress', copy: 'Solve challenges and track your learning journey.', color: 'gold', href: '#explore' },
          { icon: ShieldCheck, title: 'Friendly for Beginners', copy: 'A welcoming, ad-free preview for ages 6–14.', color: 'green', href: '#parents' },
        ].map(({icon: Icon, title, copy, color, href}) => <a className="feature-card" href={href} key={title}><span className={`feature-icon ${color}`}><Icon size={35} strokeWidth={2.2} /></span><div><h2>{title}</h2><p>{copy}</p></div><span className="round-arrow"><ArrowRight size={17} /></span></a>)}
      </section>
      <section className="adventures landing-width" id="courses" aria-labelledby="adventures-title">
        <div className="adventures-heading"><div><h2 id="adventures-title">Featured Adventures</h2><p>Explore coding adventures designed for curious minds like yours.</p></div><a className="landing-button secondary small" href="/#/courses">View all courses<ArrowRight size={17} /></a></div>
        <div id="course-search" hidden={!searchOpen} className="course-search"><label htmlFor="course-query">Find an adventure</label><input id="course-query" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try Byte, space or beginner" /><span role="status">{filtered.length} {filtered.length === 1 ? 'adventure' : 'adventures'} found</span></div>
        <div className="adventure-grid">{filtered.map(course => <article className="adventure-card" key={course.title}><div className="adventure-image"><img src={`/images/${course.image}`} className={course.style} alt="" loading="lazy" /><span className="course-level"><Gamepad2 size={13} />{course.level}</span></div><div className="adventure-copy"><h3>{course.title}</h3><p>{course.description}</p><div className="course-status"><span><Clock3 size={14} />{course.activities}</span><a className="round-arrow" href={course.href} aria-label={`Start ${course.title}`}><ArrowRight size={17} /></a></div></div></article>)}</div>
        {filtered.length === 0 && <p className="search-empty">No adventures match that search. <button onClick={() => setQuery('')}>Show all adventures</button></p>}
      </section>
      <section className="learning-intro" id="how-it-works" aria-labelledby="how-title">
        <div className="section-intro"><h2 id="how-title">Big ideas.<br />Small, doable steps.</h2><p>You don’t need to know any code to begin. Read a short lesson, build a program, and see what happens.</p></div>
        <ol className="learning-steps">
          <li><BookOpen aria-hidden="true" /><div><h3>Meet a new idea</h3><p>A short explanation and example get you ready for each challenge.</p></div></li>
          <li><Blocks aria-hidden="true" /><div><h3>Snap your thinking together</h3><p>Drag blocks into place with a mouse or touch. Put your instructions in order.</p></div></li>
          <li><Play aria-hidden="true" /><div><h3>Play it. Notice. Try again.</h3><p>Watch Byte move, follow a helpful hint, and change your code. Mistakes are part of making.</p></div></li>
        </ol>
      </section>
      <section className="module-section" id="explore" aria-labelledby="explore-title">
        <div className="module-heading"><h2 id="explore-title">Your first world:<br />Robot Rescue.</h2><p>Six grade courses. Ten challenges per included topic. Then a route of your own.</p></div>
        <div className="module-rows">
          {[['Sequences','Give Byte instructions in the right order.'],['Direction & order','Find a route and steer around obstacles.'],['Loops','Make repeating actions work for you, from Grade 2.'],['Debugging','Spot a problem, change your code, and try again.'],['Conditionals','Check the path and choose an action, from Grade 3.'],['Variables','Store, change and use a number, from Grade 3.']].map(([title, description], i) => <div className="module-row" key={title}><span className="module-index" aria-label={`Topic ${i + 1}`}>{i + 1}</span><h3>{title}</h3><p>{description}</p><span className="challenge-count">10 challenges</span></div>)}
        </div>
        <div className="build-project"><Code2 size={25} aria-hidden="true" /><div><h3>Make it yours</h3><p>Finish with a creative project: choose a destination and build Byte’s route.</p></div><a href={learn}>Let’s build<ArrowRight size={18} /></a></div>
        <p className="upcoming-note">Grade 1 starts with sequences, directions and debugging. Grade 2 adds loops; Grades 3–6 include all six topics on progressively larger boards.</p>
      </section>
      <section className="support-section" id="parents" aria-labelledby="support-title"><div><Lightbulb size={32} aria-hidden="true" /><h2 id="support-title">A little help.<br />A lot of possibility.</h2><p>Hints give you a nudge, not a penalty. Feedback explains what happened, so your next try starts with a new idea.</p></div><ul><li><Check aria-hidden="true" />Progress saves in this browser</li><li><Check aria-hidden="true" />Optional sounds and reduced-motion settings</li><li><Check aria-hidden="true" />No leaderboard or race against other learners</li></ul></section>
      <section className="landing-faq" aria-labelledby="faq-title"><h2 id="faq-title">Before you begin</h2><details><summary>Is this a finished learning platform?</summary><p>This is a working learning preview. Robot Rescue is available now; more topics are planned. Curriculum review and testing with learners are still ahead.</p></details><details><summary>Where is my progress saved?</summary><p>On this device, in this browser. You don’t need an account. Clearing browser data removes saved progress, and progress does not sync between devices.</p></details><details><summary>Can I use a phone or tablet?</summary><p>Yes, the block editor supports touch as well as a mouse. A larger screen gives you more space to arrange blocks. Basic keyboard helpers are available; full keyboard and screen-reader editing is still being evaluated.</p></details></section>
      <section className="landing-final"><h2>Byte’s ready.<br />Where will you take them?</h2><p>Start the first challenge and join Byte on a coding adventure<br /> full of puzzles, creativity, and discovery.</p><a className="landing-button" href={learn}>Try your first challenge<ArrowRight size={20} /></a></section>
    </main>
    <MarketingFooter />
  </div>;
}
