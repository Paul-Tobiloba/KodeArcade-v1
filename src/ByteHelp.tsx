import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Bug, Flag, Send, X } from 'lucide-react';
import { byteTopics, byteQuestionAllowed, byteRedirect, type ByteTopic } from '../shared/byte';
import { byteProgramCheck, type ByteProgram } from './byteProgramHelp';
import { localByteAnswer } from './byteQuestionHelp';
import { accountRequest } from './account-api';
import { useAccountSession } from './SessionProvider';
import CharacterSprite from './CharacterSprite';
import ReadAloud from './ReadAloud';
import './byte.css';

type Message = { who: 'you' | 'byte'; text: string };
export default function ByteHelp({ topic, goal, program }: { topic: ByteTopic; goal: string; program?: ByteProgram }) {
  const [open, setOpen] = useState(false), [question, setQuestion] = useState(''), [messages, setMessages] = useState<Message[]>([]);
  const [pilot, setPilot] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const { session } = useAccountSession();
  const request = useRef<AbortController | null>(null), input = useRef<HTMLTextAreaElement>(null), launch = useRef<HTMLButtonElement>(null), transcript = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const controller = new AbortController(); setPilot(false);
    if (session?.user.principalKind === 'adult' && !program?.relative && !['statements', 'lists', 'objects', 'operators', 'boolean', 'functions', 'creative'].includes(topic)) void accountRequest<{ allowed: boolean }>('byte/pilot', undefined, controller.signal).then(data => { if (!controller.signal.aborted) setPilot(data.allowed); }).catch(() => undefined);
    return () => { controller.abort(); request.current?.abort(); };
  }, [session?.user.id, session?.user.principalKind, topic, program?.relative]);
  useEffect(() => { request.current?.abort(); request.current = null; setBusy(false); setMessages([]); setQuestion(''); setError(''); }, [topic, goal]);
  useEffect(() => { if (open) input.current?.focus({ preventScroll: true }); }, [open]);
  useEffect(() => { if (open && transcript.current) transcript.current.scrollTop = messages.length || busy ? transcript.current.scrollHeight : 0; }, [messages, busy, open]);
  function cancel() { request.current?.abort(); request.current = null; setBusy(false); }
  function close() { cancel(); setOpen(false); requestAnimationFrame(() => launch.current?.focus({ preventScroll: true })); }
  function append(who: Message['who'], text: string) { setMessages(previous => [...previous, { who, text }].slice(-12)); }
  async function send(text = question, local?: string) {
    if (busy || text.trim().length < 8) return;
    const value = text.trim(); setQuestion(''); setError(''); append('you', value); input.current?.focus({ preventScroll: true });
    if (local || !pilot || !byteQuestionAllowed(value)) { append('byte', local ?? (!byteQuestionAllowed(value) ? byteRedirect : localByteAnswer(value, topic, goal, program))); return; }
    const controller = new AbortController(); request.current = controller; setBusy(true);
    try {
      const response = await accountRequest<{ answer: string }>('byte/pilot', { topic, question: value }, controller.signal);
      if (!controller.signal.aborted) append('byte', response.answer);
    } catch {
      if (!controller.signal.aborted) { setError('The experimental AI is unavailable. Here is on-device lesson help instead.'); append('byte', localByteAnswer(value, topic, goal, program)); }
    } finally { if (request.current === controller) { request.current = null; setBusy(false); } }
  }
  const starters = [
    { label: 'Explain this topic', question: `Explain ${byteTopics[topic].title} in coding.`, answer: program?.relative ? byteTopics[topic].explanation + ' ' + localByteAnswer('Explain the coding topic and forward movement.', topic, goal, program) : byteTopics[topic].explanation, icon: BookOpen },
    { label: 'What is my task?', question: 'What is my activity goal?', answer: `${goal} Predict a step, try it, then compare what happens with your goal.`, icon: Flag },
    { label: 'Help check my code', question: 'Help me check my code.', answer: byteProgramCheck(topic, program), icon: Bug },
  ];
  return <><button ref={launch} type="button" className="byte-launch" onClick={() => setOpen(true)} aria-expanded={open} aria-controls={id}><CharacterSprite concept="Sequences" /><span>Ask Byte</span></button>{createPortal(<div className="byte-widget">
    {open && <section id={id} className="byte-chat" role="dialog" aria-modal="false" aria-labelledby={`${id}-title`} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
      <div className="byte-chat-heading"><CharacterSprite concept="Sequences" /><div><h2 id={`${id}-title`}>Ask Byte</h2><p>{pilot ? 'Experimental AI · adult tester only' : 'Lesson help · on this device'}</p></div><button type="button" aria-label="Close Byte chat" onClick={close}><X size={20} /></button></div>
      <div className="byte-transcript" ref={transcript} role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversation with Byte">
        {!messages.length && <><p className="byte-chat-intro">Ask about coding or this activity. I’ll help you think, not give the whole solution. Don’t share personal details.</p><p>Hi! What are you working on? Try a question below, or type your own.</p>
          <div className="byte-starters">{starters.map(({ label, question: value, answer, icon: Icon }) => <button type="button" key={label} disabled={busy} onClick={() => { void send(value, answer); }}><Icon size={16} />{label}</button>)}</div></>}
        {messages.map((message, index) => <div key={index} className={`byte-message byte-message-${message.who}`}><strong>{message.who === 'byte' ? 'Byte' : 'You'}</strong><p>{message.text}</p>{message.who === 'byte' && <ReadAloud text={message.text} label="Listen to Byte" />}</div>)}
        {busy && <p role="status">Byte is thinking… You can keep coding. The experimental model may take up to 45 seconds.</p>}
        {error && <p className="byte-chat-error" role="alert">{error}</p>}
      </div>
      <form onSubmit={event => { event.preventDefault(); void send(); }} aria-busy={busy}>
        <label htmlFor={`${id}-question`}>Your coding question</label><textarea ref={input} id={`${id}-question`} value={question} onChange={event => setQuestion(event.target.value)} required minLength={8} maxLength={300} rows={2} placeholder="Why does my loop repeat too many times?" disabled={busy} />
        <div><small>{question.length}/300</small>{busy ? <button type="button" onClick={cancel}>Cancel reply</button> : <button type="submit" disabled={question.trim().length < 8}><Send size={16} />Ask Byte</button>}<button type="button" disabled={busy || !messages.length} onClick={() => { setMessages([]); setError(''); input.current?.focus({ preventScroll: true }); }}>Clear chat</button></div>
      </form>
      <p className="byte-chat-note">{pilot ? 'Typed questions go to the private AI gateway. AI can be wrong. Code checks stay on-device.' : 'Authored coding help, not live AI. Your questions and program stay on this device.'} Chat clears when you leave this activity.</p>
    </section>}
  </div>, document.body)}</>;
}
