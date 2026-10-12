import { useId, useRef, useState } from 'react';
import { BookOpen, Bug, ChevronDown, Flag, MessageCircle } from 'lucide-react';
import { byteTopics, type ByteAction, type ByteTopic } from '../shared/byte';
import { byteProgramCheck, type ByteProgram } from './byteProgramHelp';
import CharacterSprite from './CharacterSprite';
import ReadAloud from './ReadAloud';
import './byte.css';

export default function ByteHelp({ topic, goal, program }: { topic: ByteTopic; goal: string; program?: ByteProgram }) {
  const [answer, setAnswer] = useState<{ action: ByteAction; text: string }>();
  const answerRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const actions = [{ action: 'explain', label: 'Explain this topic', icon: BookOpen }, { action: 'goal', label: 'What is my task?', icon: Flag }, { action: 'debug', label: 'Help check my code', icon: Bug }] as const;
  function choose(action: ByteAction) {
    setAnswer({ action, text: action === 'explain' ? byteTopics[topic].explanation : action === 'goal' ? `${goal} Make a prediction, try your instructions, then compare what happens with your goal.` : byteProgramCheck(topic, program) });
    requestAnimationFrame(() => answerRef.current?.focus({ preventScroll: true }));
  }
  return <details className="byte-help">
    <summary><CharacterSprite concept="Sequences" /><span><strong>Ask Byte</strong><span>Coding help for this activity</span></span><ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="byte-help-content">
      <p>I can explain an idea or help you check your program. For a clue about the route, use the hints below.</p>
      <div className="byte-actions" aria-label="Ask Byte a question">{actions.map(({ action, label, icon: Icon }) => <button key={action} type="button" aria-pressed={answer?.action === action} aria-controls={id} onClick={() => choose(action)}><Icon size={17} aria-hidden="true" />{label}</button>)}</div>
      <div id={id} ref={answerRef} tabIndex={-1} className="byte-answer" role="status" aria-live="polite" aria-atomic="true">
        {answer ? <><h3><MessageCircle size={17} aria-hidden="true" />Byte says</h3><p>{answer.text}</p><ReadAloud text={answer.text} label="Listen to Byte" /></> : <p>Choose a question to get started. Byte checks your program on this device.</p>}
      </div>
      <p className="byte-help-note">Lesson help, not an AI chat. No messages or code are sent to a model.</p>
    </div>
  </details>;
}
