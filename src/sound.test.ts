import { describe, expect, it, vi } from 'vitest';
import { ByteSound, soundProfiles, type SoundCharacter } from './sound';
import { emptySave, parseSave } from './storage';

function setup(state = 'running') {
  const param = () => ({ setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const voices: { stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  const context = {
    state, currentTime: 0, destination: {}, resume: vi.fn(async () => { context.state = 'running'; }), close: vi.fn(async () => {}),
    createOscillator: vi.fn(() => { const voice = { type: '', frequency: param(), connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null }; voices.push(voice); return voice; }),
    createGain: vi.fn(() => ({ gain: param(), connect: vi.fn(), disconnect: vi.fn() })),
  };
  const factory = vi.fn(() => context as unknown as AudioContext);
  return { sound: new ByteSound(factory), factory, context, voices };
}
describe('Byte sound effects', () => {
  it('uses six distinct character movement voices', async () => {
    const pitches: number[] = [];
    for (const character of Object.keys(soundProfiles) as SoundCharacter[]) {
      const { sound, context } = setup();
      sound.setCharacter(character); await sound.play('move');
      const voice = context.createOscillator.mock.results[0].value;
      pitches.push(voice.frequency.setValueAtTime.mock.calls[0][0]);
      expect(voice.type).toBe(soundProfiles[character].wave);
      sound.dispose();
    }
    expect(new Set(pitches).size).toBe(6);
  });
  it('keeps music opt-in, gesture-unlocked and independent of effects', async () => {
    vi.useFakeTimers();
    try {
      const { sound, factory, context } = setup();
      sound.setEnabled(false); sound.setMusic(true);
      expect(factory).not.toHaveBeenCalled();
      await sound.unlock();
      expect(context.createOscillator).toHaveBeenCalledTimes(1);
      await sound.play('move');
      expect(context.createOscillator).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(800);
      expect(context.createOscillator).toHaveBeenCalledTimes(2);
      sound.setMusic(false);
      await vi.advanceTimersByTimeAsync(5000);
      expect(context.createOscillator).toHaveBeenCalledTimes(2);
      sound.dispose(); expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
  it('changes theme without overlapping loops and disposes every timer', async () => {
    vi.useFakeTimers();
    try {
      const { sound, context } = setup(); await sound.unlock(); sound.setMusic(true);
      sound.setMusic(true); expect(vi.getTimerCount()).toBe(1);
      sound.setCharacter('Milo'); expect(vi.getTimerCount()).toBe(1);
      expect(context.createOscillator.mock.results.at(-1)!.value.type).toBe('triangle');
      sound.dispose(); expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
  it('is silent until a gesture and lazily creates one context', async () => {
    const { sound, factory, context } = setup('suspended');
    expect(factory).not.toHaveBeenCalled(); await sound.unlock(); await sound.play('move');
    expect(factory).toHaveBeenCalledTimes(1); expect(context.resume).toHaveBeenCalledTimes(1);
    expect(context.createOscillator).toHaveBeenCalledTimes(1);
  });
  it('plays distinct short melodies', async () => {
    for (const [cue, count] of [['move', 1], ['retry', 3], ['success', 4]] as const) {
      const { sound, context } = setup(); await sound.play(cue);
      expect(context.createOscillator).toHaveBeenCalledTimes(count);
    }
  });
  it('mute cancels playing and queued cues', async () => {
    const { sound, voices, context } = setup(); await sound.play('success');
    sound.setEnabled(false); await sound.play('move');
    expect(context.createOscillator).toHaveBeenCalledTimes(4);
    expect(voices.every(v => v.stop.mock.calls.length === 2 && v.disconnect.mock.calls.length === 1)).toBe(true);
    sound.setEnabled(true); const pending = sound.play('retry'); sound.stop(); await pending;
    expect(context.createOscillator).toHaveBeenCalledTimes(4);
  });
  it('unavailable audio does not interrupt the game', async () => {
    const sound = new ByteSound(() => { throw new Error('Unavailable'); });
    await expect(sound.play('retry')).resolves.toBeUndefined(); sound.dispose();
  });
  it('cleans up and can unlock again after disposal', async () => {
    const { sound, context, factory } = setup(); await sound.play('move'); sound.dispose();
    expect(context.close).toHaveBeenCalledTimes(1); await sound.unlock(); expect(factory).toHaveBeenCalledTimes(2);
  });
  it('preserves mute and migrates old saves without losing progress', () => {
    const save = emptySave(); save.soundEnabled = false;
    expect(parseSave(JSON.stringify(save)).soundEnabled).toBe(false);
    const { soundEnabled, ...legacy } = save;
    expect(parseSave(JSON.stringify(legacy))).toEqual({ ...legacy, soundEnabled: true });
  });
});
