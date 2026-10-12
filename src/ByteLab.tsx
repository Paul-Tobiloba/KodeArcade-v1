import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { accountRequest } from './account-api';
import { Notice } from './AccountUI';
import { byteTopics, type ByteTopic } from '../shared/byte';
import './byte.css';

export default function ByteLab() {
  const [access, setAccess] = useState<{ enabled: boolean; allowed: boolean }>();
  const [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const [topic, setTopic] = useState<ByteTopic>('loops'), [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false), [answer, setAnswer] = useState<{ kind: string; answer: string }>();
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController(); setError(''); setAccess(undefined);
    void accountRequest<{ enabled: boolean; allowed: boolean }>('byte/pilot', undefined, controller.signal).then(setAccess).catch(() => { if (!controller.signal.aborted) setError('The private lab is unavailable. You can keep using the approved lesson help.'); });
    return () => { controller.abort(); request.current?.abort(); };
  }, [retry]);
  function cancel() { request.current?.abort(); request.current = null; setBusy(false); }
  return <section className="byte-lab">
    <a className="account-back" href="/#/account-settings"><ArrowLeft size={17} />Back to account settings</a>
    <h1><FlaskConical size={28} aria-hidden="true" /> Byte private AI lab</h1>
    <p>For approved adult testers only. Students use authored lesson help—not this model. This lab tests explanations, not activity solutions.</p>
    {error && <Notice error>{error}</Notice>}
    {!access && !error && <p role="status">Checking private lab access…</p>}
    {!access && error && <button className="account-button" onClick={() => setRetry(n => n + 1)}>Check access again</button>}
    {access && !access.allowed && <div className="byte-lab-status"><h2>{access.enabled ? 'This account is not a tester' : 'AI testing is switched off'}</h2><p>The server must be configured and your verified adult account explicitly approved before you can test. There is no student AI switch in this release.</p></div>}
    {access?.allowed && <>
      <Notice>Experimental AI can be wrong. Do not enter names, passwords, contact details, student work or other private information. Questions are sent to the configured private gateway; no chat history is saved by KodeArcade.</Notice>
      <form aria-busy={busy} onSubmit={async event => {
        event.preventDefault(); cancel(); const controller = new AbortController(); request.current = controller; setBusy(true); setError(''); setAnswer(undefined);
        try { const result = await accountRequest<{ kind: string; answer: string }>('byte/pilot', { topic, question }, controller.signal); if (!controller.signal.aborted) setAnswer(result); }
        catch { if (!controller.signal.aborted) setError('Byte could not answer. Wait a moment and try again, or use the approved lesson help.'); }
        finally { if (request.current === controller) { setBusy(false); request.current = null; } }
      }}>
        <label className="account-field">Coding topic<select disabled={busy} value={topic} onChange={event => { setTopic(event.target.value as ByteTopic); setAnswer(undefined); }}>{Object.entries(byteTopics).map(([key, value]) => <option key={key} value={key}>{value.title}</option>)}</select></label>
        <label className="account-field">Test question<textarea disabled={busy} value={question} minLength={8} maxLength={300} required placeholder="Why does a loop need a repeat count?" onChange={event => { setQuestion(event.target.value); setAnswer(undefined); }} /></label>
        <button className="account-button primary" disabled={busy} type="submit">{busy ? 'Byte is thinking…' : 'Test explanation'}</button>
        {busy && <><button className="account-button" type="button" onClick={cancel}>Cancel</button><p role="status">This small model can take 10–45 seconds. You can cancel and keep working.</p></>}
      </form>
      {answer && <div className="byte-answer" role="status"><h2>{answer.kind === 'answer' ? 'Experimental AI response' : 'Question redirected or response withheld'}</h2><p>{answer.answer}</p><p className="byte-help-note">Review for accuracy, age suitability and topic relevance. Passing a filter is not a safety guarantee.</p></div>}
    </>}
  </section>;
}
