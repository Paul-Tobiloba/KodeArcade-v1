export type SoundCue = 'move' | 'retry' | 'success' | 'star';
export type SoundCharacter = 'Byte' | 'Dash' | 'Gigi' | 'Fix' | 'Milo' | 'Nova';
export const soundProfiles: Record<SoundCharacter, { name: string; wave: OscillatorType; pitch: number; glide: number; melody: number[] }> = {
  Byte: { name: 'Robot City · space keys', wave: 'sine', pitch: 440, glide: 620, melody: [261.63,329.63,392,329.63,293.66,349.23,440,392] },
  Dash: { name: 'Compass Canyon · bouncing plucks', wave: 'triangle', pitch: 523.25, glide: 784, melody: [329.63,392,440,392,329.63,293.66,261.63,293.66] },
  Gigi: { name: 'Looping Jungle · woodland chimes', wave: 'sine', pitch: 659.25, glide: 880, melody: [392,440,523.25,440,392,329.63,293.66,329.63] },
  Fix: { name: 'Bug Workshop · gentle wooden taps', wave: 'triangle', pitch: 293.66, glide: 220, melody: [220,261.63,329.63,261.63,246.94,293.66,349.23,293.66] },
  Milo: { name: 'Decision Jungle · playful marimba', wave: 'triangle', pitch: 392, glide: 523.25, melody: [261.63,392,329.63,392,293.66,440,349.23,293.66] },
  Nova: { name: 'Treasure Grove · acorn bells', wave: 'sine', pitch: 783.99, glide: 1046.5, melody: [329.63,493.88,440,392,329.63,392,293.66,261.63] },
};
const melodies: Record<SoundCue, number[]> = { move: [440], retry: [392,330,349], success: [523.25,659.25,783.99,1046.5], star: [1046.5] };
// Original device-local synth effects and quiet, sparse eight-note themes.
// No recordings, remote audio requests, animal impersonation or autoplay.
export class ByteSound {
  private context: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  private musicVoices = new Set<OscillatorNode>();
  private epoch = 0;
  private musicEpoch = 0;
  private enabled = true;
  private musicWanted = false;
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private character: SoundCharacter = 'Byte';
  constructor(private createContext = () => new AudioContext()) {}
  setEnabled(enabled: boolean) { this.enabled = enabled; if (!enabled) this.stop(); }
  setCharacter(character: SoundCharacter) {
    if (character === this.character) return;
    this.character = character; this.stop(); this.stopMusic(); this.startMusic();
  }
  setMusic(enabled: boolean) { this.musicWanted = enabled; if (enabled) this.startMusic(); else this.stopMusic(); }
  async unlock() {
    try {
      this.context ??= this.createContext();
      if (this.context.state === 'suspended') await this.context.resume();
      this.startMusic();
    } catch { /* Optional audio never blocks the activity. */ }
  }
  private hidden() { return typeof document !== 'undefined' && document.hidden; }
  private tone(frequency: number, start: number, duration: number, volume: number, music = false, glide?: number) {
    const context = this.context!;
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = soundProfiles[this.character].wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (glide) oscillator.frequency.exponentialRampToValueAtTime(glide, start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + .018);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    const voices = music ? this.musicVoices : this.voices; voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(start); oscillator.stop(start + duration + .02);
  }
  async play(cue: SoundCue) {
    if (!this.enabled || this.hidden()) return;
    const epoch = this.epoch; await this.unlock();
    if (!this.enabled || epoch !== this.epoch || this.context?.state !== 'running' || this.hidden()) return;
    try {
      const profile = soundProfiles[this.character], ratio = profile.pitch / 440;
      melodies[cue].forEach((frequency, i) => this.tone(frequency * ratio, this.context!.currentTime + i * .13, cue === 'move' ? .11 : .19, cue === 'move' ? .055 : .07, false, cue === 'move' ? profile.glide : undefined));
    } catch { this.stop(); }
  }
  private startMusic() {
    if (!this.musicWanted || this.musicTimer !== null || this.context?.state !== 'running' || this.hidden()) return;
    const epoch = this.musicEpoch; let step = 0;
    const tick = () => {
      if (epoch !== this.musicEpoch || !this.musicWanted || this.context?.state !== 'running' || this.hidden()) { this.stopMusic(); return; }
      try {
        const notes = soundProfiles[this.character].melody;
        this.tone(notes[step++ % notes.length], this.context.currentTime, .52, .014, true);
        this.musicTimer = setTimeout(tick, 800);
      } catch { this.stopMusic(); }
    };
    tick();
  }
  private clear(voices: Set<OscillatorNode>) { for (const voice of voices) { try { voice.stop(); voice.disconnect(); } catch { /* Already ended. */ } } voices.clear(); }
  stop() { this.epoch++; this.clear(this.voices); }
  private stopMusic() { this.musicEpoch++; if (this.musicTimer !== null) clearTimeout(this.musicTimer); this.musicTimer = null; this.clear(this.musicVoices); }
  dispose() { this.stop(); this.stopMusic(); void this.context?.close().catch(() => {}); this.context = null; }
}
