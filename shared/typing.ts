import { z } from 'zod';
import { typingActivity, typingActivities } from './typingCurriculum.js';
const bounded = z.number().int().min(0).max(100000);
export const typingResult = z.object({ attempts: bounded, complete: z.literal(true), bestStars: z.number().int().min(1).max(5), bestAccuracy: z.number().min(0).max(100).optional(), bestWpm: z.number().min(0).max(500).optional(), latestAccuracy: z.number().min(0).max(100).optional(), durationMs: z.number().int().min(0).max(86400000), independent: z.boolean(), independentAccuracy: z.number().min(0).max(100).optional() }).strict();
export const typingProgress = z.object({ version: z.literal(1), currentId: z.string().max(60), results: z.record(z.string().max(60), typingResult).refine(value => Object.keys(value).length <= 120), preferences: z.object({ guide: z.boolean(), hands: z.boolean(), largeText: z.boolean(), reducedMotion: z.boolean() }).strict() }).strict();
export type TypingProgress = z.infer<typeof typingProgress>;
export type TypingResult = z.infer<typeof typingResult>;
export const typingStorageKey = (course: string) => `kodearcade-typing-v1:${course}`;
export function emptyTyping(grade: number): TypingProgress { return { version: 1, currentId: typingActivities(grade)[0].id, results: {}, preferences: { guide: true, hands: true, largeText: false, reducedMotion: false } }; }
export function validTypingGrade(grade: number, progress: TypingProgress) { return typingActivity(progress.currentId)?.grade === grade && Object.keys(progress.results).every(id => typingActivity(id)?.grade === grade); }
export function readTyping(value: unknown, grade: number) { const parsed = typingProgress.parse(value); if (!validTypingGrade(grade, parsed)) throw new Error('This typing save belongs to a different grade.'); return parsed; }
export function mergeTyping(previous: TypingProgress | undefined, next: TypingProgress): TypingProgress {
  if (!previous) return next;
  const results = { ...previous.results, ...next.results };
  for (const [id, old] of Object.entries(previous.results)) {
    const current = results[id];
    results[id] = { ...current, attempts: Math.max(old.attempts, current.attempts), bestStars: Math.max(old.bestStars, current.bestStars), independent: old.independent || current.independent, bestAccuracy: maximum(old.bestAccuracy, current.bestAccuracy), bestWpm: maximum(old.bestWpm, current.bestWpm), independentAccuracy: maximum(old.independentAccuracy, current.independentAccuracy) };
  }
  return { ...next, results };
}
function maximum(a?: number, b?: number) { return a === undefined ? b : b === undefined ? a : Math.max(a, b); }
export function typingStars(accuracy?: number) { return accuracy === undefined ? 3 : accuracy >= 98 ? 5 : accuracy >= 95 ? 4 : accuracy >= 90 ? 3 : accuracy >= 80 ? 2 : 1; }
export function insertedText(previous: string, next: string) {
  let prefix = 0, suffix = 0;
  while (prefix < previous.length && prefix < next.length && previous[prefix] === next[prefix]) prefix++;
  while (suffix < previous.length - prefix && suffix < next.length - prefix && previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]) suffix++;
  return { start: prefix, text: next.slice(prefix, next.length - suffix) };
}
export function typingAccuracy(correct: number, attempts: number) { return attempts ? Math.round(correct / attempts * 100) : undefined; }
export function typedWords(text: string) { return text.trim().split(/\s+/).filter(word => /[a-z]/i.test(word)).length; }
export function typingHint(character?: string) {
  if (!character) return null;
  if (character === ' ' || character === '\n') return { key: character === ' ' ? 'Space' : 'Enter', hand: character === ' ' ? 'either' : 'right', finger: character === ' ' ? 4 : 0, label: character === ' ' ? 'Either thumb' : 'Right little finger', shift: false };
  const shifted: Record<string, string> = { '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/', '~': '`' };
  const key = shifted[character] ?? character.toLowerCase();
  const groups: [string, 'left' | 'right', number][] = [['`1qaz', 'left', 0], ['2wsx', 'left', 1], ['3edc', 'left', 2], ['4rfv5tgb', 'left', 3], ['6yhn7ujm', 'right', 3], ['8ik,', 'right', 2], ['9ol.', 'right', 1], ["0p;/-=[]\\'", 'right', 0]];
  const found = groups.find(([keys]) => keys.includes(key));
  return found ? { key, hand: found[1], finger: found[2], label: `${found[1] === 'left' ? 'Left' : 'Right'} ${['little', 'ring', 'middle', 'index'][found[2]]} finger`, shift: Boolean(shifted[character]) || /[A-Z]/.test(character) } : null;
}
