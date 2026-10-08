export const VOICE_KEY = 'kodearcade-narration-voice';
export function localEnglishVoices(voices: SpeechSynthesisVoice[]) {
  return voices.filter(v => v.localService && /^en(?:-|$)/i.test(v.lang));
}
/** Speech synthesis exposes no age/gender field. These names are preferences, not guarantees. */
export function chooseNarrationVoice(voices: SpeechSynthesisVoice[], preferred = '') {
  const available = localEnglishVoices(voices);
  return available.find(v => v.voiceURI === preferred)
    ?? available.find(v => /\b(child|kid|girl|boy)\b/i.test(v.name))
    ?? available.find(v => /\b(Zira|Sonia|Hazel|Susan|Aria|Jenny|Natasha|Libby|Samantha|Karen|Serena|Tessa|Moira|Fiona|Veena|Victoria|Female)\b/i.test(v.name))
    ?? available[0];
}
export function savedNarrationVoice() {
  try { return localStorage.getItem(VOICE_KEY) ?? ''; } catch { return ''; }
}
