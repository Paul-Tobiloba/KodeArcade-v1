import { useEffect, useState } from 'react';
import ReadAloud from './ReadAloud';
import { localEnglishVoices, savedNarrationVoice, VOICE_KEY } from './narration';

export default function VoiceSettings() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState(savedNarrationVoice);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const update = () => setVoices(localEnglishVoices(synth.getVoices()));
    update(); synth.addEventListener?.('voiceschanged', update);
    return () => synth.removeEventListener?.('voiceschanged', update);
  }, []);
  return <section className="voice-settings"><h3>Read-aloud voice</h3>
    <label className="nickname-label">Voice<select value={voices.some(v => v.voiceURI === selected) ? selected : ''} onChange={event => {
      setSelected(event.target.value);
      try { localStorage.setItem(VOICE_KEY, event.target.value); setError(''); } catch { setError('Your browser could not save this voice choice.'); }
    }}><option value="">Automatic — child or female voice if available</option>{voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select></label>
    <p>Uses English voices installed on this device. Child voices are uncommon; automatic selection prefers a child voice, then a known female voice name. You can listen and choose another.</p>
    {!voices.length && <p>No local English voices are ready. Enable an English voice in your device settings, then reopen Settings.</p>}
    {error && <p role="status">{error}</p>}
    <ReadAloud key={selected} label="Preview voice" text="Hello, explorer! Let's build something wonderful together. One small step at a time." />
  </section>;
}
