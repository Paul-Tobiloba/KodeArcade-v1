import { describe, expect, it } from 'vitest';
import { makeBlock, missions, recommend, runProgram, type Direction } from './learning';
import { emptySave, parseSave } from './storage';
const moves = (...directions: Direction[]) => directions.map(makeBlock);
describe('Robot Rescue execution', () => {
  it('validates the first sequence and preserves each step', () => {
    const result = runProgram(missions[0], moves('right', 'right', 'right'));
    expect(result.success).toBe(true); expect(result.frames.map(f => f.x)).toEqual([1, 2, 3]);
  });
  it('does not pass merely because the robot visited the goal mid-program', () => {
    expect(runProgram(missions[0], moves('right', 'right', 'right', 'right')).success).toBe(false);
  });
  it('stops before entering a rock', () => {
    const result = runProgram(missions[1], moves('right', 'right'));
    expect(result.success).toBe(false); expect(result.frames).toHaveLength(1); expect(result.message).toContain('rock');
  });
  it('accepts different valid routes around obstacles', () => {
    expect(runProgram(missions[1], moves('up', 'up', 'right', 'right', 'right')).success).toBe(true);
    expect(runProgram(missions[1], moves('right', 'up', 'up', 'right', 'right')).success).toBe(true);
  });
  it('stops at the board edge', () => {
    expect(runProgram(missions[0], moves('left')).frames).toHaveLength(0);
  });
  it('requires a loop for the loop learning objective', () => {
    expect(runProgram(missions[2], moves('right', 'right', 'right', 'right')).success).toBe(false);
    expect(runProgram(missions[2], [{ ...makeBlock('repeat'), count: 4 }]).success).toBe(true);
  });
  it('rejects invalid or unbounded repeat counts', () => {
    for (const count of [0, -1, 1.5, 999, NaN]) expect(runProgram(missions[2], [{ ...makeBlock('repeat'), count }]).success).toBe(false);
  });
  it('does not allow loop blocks in introductory missions', () => {
    expect(runProgram(missions[0], [{ ...makeBlock('repeat'), count: 3 }]).success).toBe(false);
  });
  it('accepts the repaired debugging mission', () => {
    expect(runProgram(missions[3], moves('right', 'right', 'up', 'right')).success).toBe(false);
    expect(runProgram(missions[3], moves('right', 'right', 'up', 'up')).success).toBe(true);
  });
  it('supports two project solutions and custom destinations', () => {
    const repeatRight = { ...makeBlock('repeat'), count: 4 };
    const repeatUp = { ...makeBlock('repeat'), count: 4, direction: 'up' as const };
    expect(runProgram(missions[4], [repeatRight, repeatUp]).success).toBe(true);
    expect(runProgram(missions[4], [repeatUp, repeatRight]).success).toBe(true);
    expect(runProgram({ ...missions[4], end: { x: 1, y: 4 } }, moves('right')).success).toBe(true);
  });
  it('handles empty programs without awarding completion', () => expect(runProgram(missions[0], []).success).toBe(false));
});
describe('supportive next steps', () => {
  it('allows advancement after success regardless of attempts', () => expect(recommend(true, 20, 0).action).toBe('advance'));
  it('offers review after repeated difficulty and practice otherwise', () => {
    expect(recommend(false, 3, 1).action).toBe('review');
    expect(recommend(false, 1, 1).action).toBe('practise');
    expect(recommend(false, 8, 0).action).toBe('practise');
  });
});
describe('stored progress boundaries', () => {
  it('rejects malformed JSON and unsupported versions', () => {
    expect(() => parseSave('{')).toThrow(); expect(() => parseSave('{"version":9}')).toThrow();
  });
  it('restores valid data and limits damaged fields', () => {
    const save = emptySave();
    save.progress['first-steps'] = { blocks: moves('right'), attempts: 3, hints: 1, complete: false };
    expect(parseSave(JSON.stringify(save))).toEqual(save);
    expect(parseSave(JSON.stringify({ ...save, current: 80 })).current).toBe(0);
  });
  it('ignores invalid project destination and repeat payload', () => {
    const save = emptySave();
    save.progress['rescue-project'] = { blocks: [{ ...makeBlock('repeat'), count: 1000 }], attempts: -5, hints: 90, complete: false, end: { x: 2, y: 2 } };
    const p = parseSave(JSON.stringify(save)).progress['rescue-project'];
    expect(p.blocks).toEqual([]); expect(p.end).toBeUndefined(); expect(p.hints).toBe(4); expect(p.attempts).toBe(0);
  });
});
