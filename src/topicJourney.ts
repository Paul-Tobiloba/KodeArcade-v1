import type { Mission } from './learning';
import type { Save } from './storage';

export const SEQUENCE_TOPIC = 'v2.0-grade-1-sequences';
export const sequenceCore = Array.from({ length: 10 }, (_, i) => `grade-1-sequences-${i + 1}`);
export const sequenceExtras = ['g1-seq-v2-bonus-1', 'g1-seq-v2-bonus-2', 'g1-seq-v2-repair', 'g1-seq-v2-rescue-project'];
export type TopicRecord = { watched: boolean; guided: boolean; mastered: boolean; masteryAttempts: number };
export const emptyTopicRecord = (): TopicRecord => ({ watched: false, guided: false, mastered: false, masteryAttempts: 0 });
export const sequenceManifest = {
  id: SEQUENCE_TOPIC, sourceTrack: 'Little Coders · ages 6–8', objectiveIds: ['SEQ', 'MOV', 'PLN', 'DBG'],
  objective: 'Put movement instructions in order, predict where they lead, and repair an incorrect step.',
  prerequisite: 'No coding prerequisite. Computer Explorers is available for mouse/touch practice.',
  representation: 'Arrow blocks', video: '/lessons/grade-1-sequences.webm',
  core: sequenceCore, extras: sequenceExtras,
  limitation: 'The ten existing core route variants are retained for save compatibility; their challenge-specific teaching prompts are added here. Follow-up learner testing remains pending.',
};
export const corePurposes = [
  ['One instruction', 'Find Byte and the star. Add one arrow and watch one step.'],
  ['Read the direction', 'Point toward the star. Find the matching arrow before you run it.'],
  ['Put steps in order', 'Trace the vertical part and then the horizontal part of this route.'],
  ['Plan two parts', 'Say the first part of your plan, then the second. Put both parts into blocks.'],
  ['Count repeated steps', 'Count squares, not grid lines. Add one arrow for each square.'],
  ['Predict before Play', 'Point to the square where Byte will stop before running your program.'],
  ['Explain your sequence', 'Read your arrows aloud in order. Does your spoken plan reach the star?'],
  ['Try another route', 'Find a different sequence to the same star. Compare what changed.'],
  ['Check a longer plan', 'Trace every arrow with your finger. Look for an extra or missing step.'],
  ['Independent journey', 'Plan, build and test a route yourself. Then show what you know in the topic journey.'],
];
const supplemental = (id: string, title: string, goal: string, end: { x: number; y: number }, route: Mission['starter'], starter: Mission['starter'] = [], walls: Mission['walls'] = []): Mission => ({
  id, title, goal, end, start: { x: 0, y: 4 }, size: 5, walls, concept: 'Sequences', description: 'Grade 1 Sequences · V2 topic activity', loops: false, starter, solution: route,
  hints: ['Find Byte and the star.', 'Trace the route one square at a time.', 'Say the arrows aloud before pressing Play.', `One possible sequence: ${route.join(', ')}.`], reflection: 'Explain which instruction you would change and why.',
});
export const journeyMissions = [
  supplemental(sequenceExtras[0], 'Bonus: take the scenic route', 'Reach the star around the rock. Bonus stars are separate from your 50 core stars.', { x: 3, y: 2 }, ['up','up','right','right','right'], [], [{ x: 1, y: 4 }]),
  supplemental(sequenceExtras[1], 'Bonus: invent a detour', 'Find a route that passes above the two rocks.', { x: 4, y: 3 }, ['up','up','right','right','right','right','down'], [], [{ x: 1, y: 3 }, { x: 2, y: 3 }]),
  supplemental(sequenceExtras[2], 'Repair Byte’s delivery', 'Run this broken sequence. Change the wrong arrow so Byte reaches the star.', { x: 2, y: 3 }, ['right','right','up'], ['right','right','down']),
  supplemental(sequenceExtras[3], 'Create your delivery route', 'Choose a star square. Plan, build and test your own sequence.', { x: 3, y: 1 }, ['up','up','up','right','right','right'], [], [{ x: 2, y: 2 }]),
];
export function isSequenceJourney(missionId: string) { return sequenceCore.includes(missionId) || sequenceExtras.includes(missionId); }
export function sequenceEvidence(save: Save) {
  const record = save.topicRecords[SEQUENCE_TOPIC] ?? emptyTopicRecord();
  const completed = sequenceCore.filter(id => save.progress[id]?.complete).length;
  const stars = sequenceCore.reduce((n, id) => n + (save.progress[id]?.stars ?? 0), 0);
  const repaired = !!save.progress[sequenceExtras[2]]?.complete;
  const project = !!save.progress[sequenceExtras[3]]?.complete;
  return { record, completed, stars, repaired, project, badge: record.watched && record.guided && completed === 10 && repaired && record.mastered && project };
}
export const masteryMissions = [
  { prompt: 'Which sequence takes Byte two squares right?', options: [['right','right'], ['right','up'], ['left','left']], answer: 0 },
  { prompt: 'Which sequence goes one square up, then one square right?', options: [['down','right'], ['up','right'], ['right','right']], answer: 1 },
  { prompt: 'Byte needs right, right, up. Which sequence repairs a wrong final down arrow?', options: [['right','down','up'], ['right','right','down'], ['right','right','up']], answer: 2 },
] as const;
