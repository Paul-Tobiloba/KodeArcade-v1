import { expect, it } from 'vitest';
import { chooseNarrationVoice } from './narration';
const voice = (name: string, localService = true, lang = 'en-GB') => ({ name, voiceURI: name, localService, lang }) as SpeechSynthesisVoice;
it('prefers a local child voice, then a recognized female name, without changing pitch', () => {
  const voices = [voice('David'), voice('Microsoft Zira'), voice('English child')];
  expect(chooseNarrationVoice(voices)?.name).toBe('English child');
  expect(chooseNarrationVoice(voices.slice(0, 2))?.name).toBe('Microsoft Zira');
  expect(chooseNarrationVoice(voices, 'David')?.name).toBe('David');
});
it('never silently sends narration to a remote voice and falls back to a local English voice', () => {
  expect(chooseNarrationVoice([voice('Child', false), voice('Samantha', true, 'fr-FR'), voice('Device voice')])?.name).toBe('Device voice');
  expect(chooseNarrationVoice([voice('Samantha', false)])).toBeUndefined();
});
