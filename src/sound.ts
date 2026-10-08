export type SoundCue = 'move' | 'retry' | 'success' | 'star';
// Original, softly enveloped synth cues: no downloads, music loops, or harsh buzzers.
const melodies: Record<SoundCue, number[]> = {
  move: [440], retry: [392, 330, 349], success: [523.25, 659.25, 783.99, 1046.5], star: [1046.5],
};
export class ByteSound {
  private context: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  private epoch = 0;
  private enabled = true;
  constructor(private createContext = () => new AudioContext()) {}

  setEnabled(enabled: boolean) { this.enabled = enabled; if (!enabled) this.stop(); }
  // Called directly from Run's click/tap so mobile browsers can unlock audio.
  async unlock() {
    if (!this.enabled) return;
    try {
      this.context ??= this.createContext();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch { /* Audio is optional; an unsupported or blocked device can still play. */ }
  }
  async play(cue: SoundCue) {
    if (!this.enabled || (typeof document !== 'undefined' && document.hidden)) return;
    const epoch = this.epoch;
    await this.unlock();
    const context = this.context;
    if (!this.enabled || epoch !== this.epoch || context?.state !== 'running' || (typeof document !== 'undefined' && document.hidden)) return;
    try {
      const duration = cue === 'move' ? .11 : .19;
      melodies[cue].forEach((frequency, index) => {
        const start = context.currentTime + index * .13;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        if (cue === 'move') oscillator.frequency.exponentialRampToValueAtTime(620, start + duration);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(cue === 'move' ? .055 : .07, start + .012);
        gain.gain.exponentialRampToValueAtTime(.001, start + duration);
        oscillator.connect(gain); gain.connect(context.destination);
        this.voices.add(oscillator);
        oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(start); oscillator.stop(start + duration + .02);
      });
    } catch { this.stop(); }
  }
  stop() {
    this.epoch++;
    for (const voice of this.voices) { try { voice.stop(); voice.disconnect(); } catch { /* Already ended. */ } }
    this.voices.clear();
  }
  dispose() { this.stop(); void this.context?.close().catch(() => {}); this.context = null; }
}
