import { useEffect, useRef, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { chooseNarrationVoice, savedNarrationVoice } from './narration';

/** Opt-in, device-local narration. Never silently send children's text to a remote voice. */
export default function ReadAloud({ text, label = 'Listen' }: { text: string; label?: string }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const announce = (active: boolean) => window.dispatchEvent(new CustomEvent('kodearcade-narration', { detail: active }));
  useEffect(() => {
    setSpeaking(false); setMessage('');
    const stop = () => { if (utterance.current && supported) { utterance.current = null; window.speechSynthesis.cancel(); announce(false); } };
    const hidden = () => { if (document.hidden) { stop(); setSpeaking(false); } };
    document.addEventListener('visibilitychange', hidden);
    return () => { stop(); document.removeEventListener('visibilitychange', hidden); };
  }, [text, supported]);
  function toggle() {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); utterance.current = null; setSpeaking(false); announce(false); return; }
    const voice = chooseNarrationVoice(synth.getVoices(), savedNarrationVoice());
    if (!voice) { setMessage('No English device voice is ready. Try again in a moment, or enable an English voice in your device settings.'); return; }
    synth.cancel(); setMessage('');
    const speech = new SpeechSynthesisUtterance(text); speech.voice = voice; speech.lang = voice.lang; speech.rate = 0.85;
    utterance.current = speech;
    speech.onend = () => { if (utterance.current === speech) { utterance.current = null; setSpeaking(false); announce(false); } };
    speech.onerror = () => { if (utterance.current === speech) { utterance.current = null; setSpeaking(false); announce(false); setMessage('Reading stopped. You can try Listen again.'); } };
    setSpeaking(true); announce(true); synth.speak(speech);
  }
  return <div className="read-aloud"><button className="secondary" disabled={!supported} onClick={toggle}>{speaking ? <Square size={17} /> : <Volume2 size={19} />}{speaking ? 'Stop reading' : label}</button><span role="status">{!supported ? 'Read-aloud is not available in this browser.' : message}</span></div>;
}
