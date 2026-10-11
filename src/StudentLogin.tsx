import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Sun, Moon, Star, Flower2, Fish, Bird, TreePine, Apple, Undo2, X, LockKeyhole } from 'lucide-react';
import { accountErrorMessage, accountRequest, type Capabilities } from './account-api';
import { LoginCardExample, Notice, Password, Submit } from './AccountUI';
import { pictures as credentialPictures } from '../shared/pictures';

const pictures = [{ name: 'Sun', icon: Sun }, { name: 'Moon', icon: Moon }, { name: 'Star', icon: Star }, { name: 'Flower', icon: Flower2 }, { name: 'Fish', icon: Fish }, { name: 'Bird', icon: Bird }, { name: 'Tree', icon: TreePine }, { name: 'Apple', icon: Apple }];

export default function StudentLogin({ capabilities }: { capabilities?: Capabilities }) {
  return capabilities?.classroomLogin ? <LiveStudentLogin /> : <StudentPreview capabilities={capabilities} />;
}
function StudentPreview({ capabilities }: { capabilities?: Capabilities }) {
  const [preview, setPreview] = useState(false);
  const [method, setMethod] = useState('picture');
  const [sequence, setSequence] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  function showPreview(value: boolean) {
    setPreview(value); setSequence([]);
    requestAnimationFrame(() => heading.current?.focus());
  }
  return <section className="account-panel account-student-panel">
    <div className="account-student-content">
      <h1 ref={heading} tabIndex={-1}>Student <span>sign in</span></h1>
      <p className="account-step-copy">{preview ? 'Explore your login method.' : 'Step 1 of 2: Enter your classroom code.'}</p>
      <Notice>{capabilities ? 'Classroom login is being connected. This is a design preview; don’t enter real login details.' : 'Classroom login is unavailable. You can explore this preview or try a public activity.'}</Notice>
      {!preview ? <>
        <fieldset disabled><legend className="sr-only">Student login details</legend><label className="account-field">Classroom code<input name="classCode" placeholder="Enter your code (e.g. ABC123)" autoComplete="off" maxLength={12} spellCheck={false} autoCapitalize="characters" /></label><label className="account-field">Student username<input name="username" placeholder="On your login card" autoComplete="off" maxLength={80} /></label><button className="account-button primary" type="button">Continue<ArrowRight size={20} /></button></fieldset>
        <button className="account-text-button" onClick={() => showPreview(true)}>Preview password methods<ArrowRight size={18} /></button>
        <p className="account-student-privacy"><LockKeyhole size={19} />Students do not need email.</p>
      </> : <>
        <button className="account-text-button" onClick={() => showPreview(false)}><ArrowLeft size={18} />Back to classroom code</button>
        <div className="account-methods" role="group" aria-label="Password method"><button type="button" aria-pressed={method === 'picture'} onClick={() => { setMethod('picture'); setSequence([]); }}>Picture password<span>Usually Grades 1–2</span></button><button type="button" aria-pressed={method === 'text'} onClick={() => { setMethod('text'); setSequence([]); }}>Text password<span>Usually Grades 3–6</span></button></div>
        {method === 'text' ? <fieldset disabled><legend className="sr-only">Text password preview</legend><label className="account-field">Student username<input autoComplete="off" placeholder="Username on your card" /></label><Password /></fieldset> : <>
          <p>Try tapping four pictures in order. This practice sequence is not sent or saved.</p>
          <div className="account-picture-slots" aria-label={`${sequence.length} pictures selected`} aria-live="polite">{Array.from({ length: 4 }, (_, i) => { const Picture = sequence[i] === undefined ? undefined : pictures[sequence[i]]; return <span key={i} aria-label={`Picture ${i + 1}: ${Picture?.name ?? 'empty'}`}>{Picture ? <Picture.icon size={32} /> : i + 1}</span>; })}</div>
          <div className="account-picture-grid">{pictures.map(({ name, icon: Icon }, i) => <button key={name} type="button" disabled={sequence.length === 4} onClick={() => setSequence(current => [...current, i])}><Icon size={32} /><span>{name}</span></button>)}</div>
          <div className="account-picture-edit"><button type="button" disabled={!sequence.length} onClick={() => setSequence(current => current.slice(0, -1))}><Undo2 size={17} />Undo</button><button type="button" disabled={!sequence.length} onClick={() => setSequence([])}><X size={17} />Clear</button></div>
        </>}
        <button className="account-button primary" disabled>Start learning<ArrowRight size={20} /></button>
      </>}
      <a className="account-button" href="/#/learn">Try an activity instead<ArrowRight size={18} /></a>
    </div><LoginCardExample />
  </section>;
}

function LiveStudentLogin() {
  const [classCode, setClassCode] = useState(''), [step, setStep] = useState(1);
  const [method, setMethod] = useState<'picture' | 'text'>('picture');
  const [sequence, setSequence] = useState<string[]>([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <section className="account-panel account-student-panel"><div className="account-student-content"><h1>Student <span>sign in</span></h1><p className="account-step-copy">{step === 1 ? 'Step 1 of 2: Enter your classroom code.' : 'Step 2 of 2: Use the username and password on your card.'}</p>{error && <Notice error>{error}</Notice>}
    {step === 1 ? <form aria-busy={busy} onSubmit={async event => { event.preventDefault(); setBusy(true); setError(''); try { await accountRequest('student/classroom', { classCode }); setStep(2); } catch (failure) { setError(accountErrorMessage(failure)); } finally { setBusy(false); } }}><label className="account-field">Classroom code<input name="classCode" value={classCode} onChange={event => setClassCode(event.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="Code on your card" autoComplete="off" maxLength={8} minLength={8} spellCheck={false} autoCapitalize="characters" required /></label><Submit busy={busy}>Continue</Submit></form> : <>
      <button className="account-text-button" onClick={() => { setStep(1); setSequence([]); setError(''); }}><ArrowLeft size={18} />Change classroom code</button>
      <form aria-busy={busy} onSubmit={async event => { event.preventDefault(); const form = event.currentTarget, data = new FormData(form); setBusy(true); setError(''); try { await accountRequest('student/login', { classCode, username: data.get('username'), method, ...(method === 'picture' ? { pictures: sequence } : { password: String(data.get('password')) }) }); form.reset(); setSequence([]); location.hash = '/student-courses'; } catch (failure) { setError(accountErrorMessage(failure)); setSequence([]); const password = form.elements.namedItem('password'); if (password instanceof HTMLInputElement) password.value = ''; } finally { setBusy(false); } }}>
        <label className="account-field">Student username<input name="username" placeholder="Username on your card" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={60} minLength={1} required /></label>
        <div className="account-methods" role="group" aria-label="Password method"><button type="button" aria-pressed={method === 'picture'} onClick={() => { setMethod('picture'); setSequence([]); }}>Picture password<span>Usually Grades 1–2</span></button><button type="button" aria-pressed={method === 'text'} onClick={() => { setMethod('text'); setSequence([]); }}>Text password<span>Usually Grades 3–6</span></button></div>
        {method === 'text' ? <Password /> : <><p>Tap the four pictures from your card in order. The same picture can appear more than once.</p><div className="account-picture-slots" aria-label={`${sequence.length} pictures selected`} aria-live="polite">{Array.from({ length: 4 }, (_, index) => { const picture = credentialPictures.find(picture => picture.id === sequence[index]); return <span key={index} aria-label={`Picture ${index + 1}: ${picture?.name ?? 'empty'}`}>{picture ? <picture.icon size={32} /> : index + 1}</span>; })}</div><div className="account-picture-grid">{credentialPictures.map(({ id, name, icon: Icon }) => <button type="button" key={id} disabled={busy || sequence.length >= 4} onClick={() => setSequence(current => [...current, id])}><Icon size={30} /><span>{name}</span></button>)}</div><div className="account-picture-edit"><button type="button" disabled={busy || !sequence.length} onClick={() => setSequence(current => current.slice(0, -1))}><Undo2 size={17} />Undo</button><button type="button" disabled={busy || !sequence.length} onClick={() => setSequence([])}><X size={17} />Clear</button></div></>}
        <Submit busy={busy} disabled={method === 'picture' && sequence.length !== 4}>Start learning</Submit>
      </form>
    </>}
    <p className="account-student-privacy"><LockKeyhole size={19} />Students do not need email. Your class code never shows classmates’ names.</p><a className="account-button" href="/#/learn">Try an activity instead<ArrowRight size={18} /></a><a className="account-inline-link" href="/#/student-courses">Already signed in? Open my courses</a>
  </div><LoginCardExample /></section>;
}
