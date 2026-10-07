import { useEffect, useRef, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';

/** Opt-in, device-local narration. Never silently send children's text to a remote voice. */
export default function ReadAloud({ text, label = 'Listen' }: { text: string; label?: string }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => {
    setSpeaking(false); setMessage('');
    const stop = () => { if (utterance.current && supported) { utterance.current = null; window.speechSynthesis.cancel(); } };
    const hidden = () => { if (document.hidden) { stop(); setSpeaking(false); } };
    document.addEventListener('visibilitychange', hidden);
    return () => { stop(); document.removeEventListener('visibilitychange', hidden); };
  }, [text, supported]);
  function toggle() {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); utterance.current = null; setSpeaking(false); return; }
    const voice = synth.getVoices().find(voice => voice.localService && /^en(?:-|$)/i.test(voice.lang));
    if (!voice) { setMessage('No English device voice is ready. Try again in a moment, or enable an English voice in your device settings.'); return; }
    synth.cancel(); setMessage('');
    const speech = new SpeechSynthesisUtterance(text); speech.voice = voice; speech.lang = voice.lang; speech.rate = 0.85;
    utterance.current = speech;
    speech.onend = () => { if (utterance.current === speech) { utterance.current = null; setSpeaking(false); } };
    speech.onerror = () => { if (utterance.current === speech) { utterance.current = null; setSpeaking(false); setMessage('Reading stopped. You can try Listen again.'); } };
    setSpeaking(true); synth.speak(speech);
  }
  return <div className="read-aloud"><button className="secondary" disabled={!supported} onClick={toggle}>{speaking ? <Square size={17} /> : <Volume2 size={19} />}{speaking ? 'Stop reading' : label}</button><span role="status">{!supported ? 'Read-aloud is not available in this browser.' : message}</span></div>;
}
