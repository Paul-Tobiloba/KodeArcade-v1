/** Original short mechanical clicks; no audio is copied from the supplied recording. */
export class TypingKeySound {
  private context:AudioContext|null=null;
  private noise:AudioBuffer|null=null;
  private last=-Infinity;
  constructor(private createContext=()=>new AudioContext()){}
  play(kind:'key'|'space'|'backspace'|'error'='key'){
    try{
      const context=this.context??=this.createContext();
      if(context.state==='suspended')void context.resume().catch(()=>{});
      const now=context.currentTime;if(now-this.last<.025)return;this.last=now;
      if(!this.noise){this.noise=context.createBuffer(1,Math.ceil(context.sampleRate*.06),context.sampleRate);const samples=this.noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;}
      const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=this.noise;filter.type='bandpass';filter.frequency.value=kind==='space'?950:kind==='backspace'?1300:kind==='error'?700:2100;filter.Q.value=.65;
      gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(kind==='error'?.055:.085,now+.002);gain.gain.exponentialRampToValueAtTime(.0001,now+.047);
      source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(now);source.stop(now+.055);
    }catch{/* Audio unavailable: typing and assessment continue normally. */}
  }
  dispose(){const context=this.context;this.context=null;this.noise=null;if(context)void context.close().catch(()=>{});}
}
