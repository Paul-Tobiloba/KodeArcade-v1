import { describe, expect, it } from 'vitest';
import { drawingActivities, drawingSaveKey, drawingTopic, drawingsForTopic } from './drawingActivities';
import { modulesFor } from './curriculum';
import type { GradeId } from './courses';

describe('drawing curriculum placement', () => {
  for (const [grade, activities] of Object.entries(drawingActivities)) {
    it(`${grade}: every drawing belongs to exactly one available topic, without changing save keys`, () => {
      const modules = modulesFor(grade as GradeId);
      const placed = modules.flatMap(module => drawingsForTopic(grade, module.topicId!));
      expect(placed).toHaveLength(activities.length);
      expect(new Set(placed.map(item => item.activity.id)).size).toBe(activities.length);
      for (const { activity, index } of placed) {
        expect(activities[index]).toBe(activity);
        expect(drawingSaveKey(grade, activity.id)).toBe(`kodearcade-drawing-v2-${grade}-${activity.id}`);
      }
    });
  }
  it('places sequences, turns, loops, variables and creation by the code being practised', () => {
    expect(drawingsForTopic('grade-1', 'sequences').map(item => item.activity.id)).toEqual(['trail']);
    expect(drawingsForTopic('grade-1', 'directions').map(item => item.activity.id)).toEqual(['corner','square','stairs']);
    expect(drawingsForTopic('grade-2', 'loops')).toHaveLength(4);
    expect(drawingsForTopic('grade-6', 'loops').map(item => item.activity.id)).toEqual(['octagon','double-star','dendrite','separate']);
    expect(drawingsForTopic('grade-6', 'variables').map(item => item.activity.id)).toEqual(['spiral']);
    expect(drawingTopic('grade-5', drawingActivities['grade-5'].find(item => item.id === 'branch')!)).toBe('directions');
    expect(drawingsForTopic('grade-6', 'project')[0].activity.free).toBe(true);
    expect(drawingsForTopic('words', 'loops')).toEqual([]);
  });
});
