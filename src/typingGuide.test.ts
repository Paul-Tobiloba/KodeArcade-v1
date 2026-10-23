import {describe,it,expect,vi} from 'vitest';
import {typingHint} from '../shared/typing';
import {TypingKeySound} from './typingKeySound';
describe('keyboard finger-name guidance',()=>{
  it('names the correct hand and finger for each next key',()=>{
    for(const [next,hand,finger] of [['q','left',0],['r','left',3],['t','left',3],['y','right',3],['o','right',1]] as const)expect(typingHint(next)).toMatchObject({hand,finger,key:next});
  });
  it('allows either thumb for Space and indicates uppercase Shift',()=>{
    expect(typingHint(' ')).toMatchObject({hand:'either',finger:4,key:'Space'});
    expect(typingHint('O')).toMatchObject({hand:'right',finger:1,key:'o',shift:true});
  });
});
describe('original keyboard clicks',()=>{
  it('creates audio only on play, bounds repeated voices and disposes',()=>{
    const param=()=>({value:0,setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()});const node=()=>({connect:vi.fn(),disconnect:vi.fn(),start:vi.fn(),stop:vi.fn(),frequency:param(),Q:param(),gain:param(),onended:null});
    const context={state:'suspended',currentTime:0,sampleRate:44100,resume:vi.fn(async()=>{}),close:vi.fn(async()=>{}),createBuffer:vi.fn(()=>({getChannelData:()=>new Float32Array(2646)})),createBufferSource:vi.fn(node),createBiquadFilter:vi.fn(node),createGain:vi.fn(node),destination:{}};
    const factory=vi.fn(()=>context as unknown as AudioContext),sound=new TypingKeySound(factory);expect(factory).not.toHaveBeenCalled();sound.play();sound.play();expect(context.createBufferSource).toHaveBeenCalledTimes(1);context.currentTime=.1;sound.play('space');expect(factory).toHaveBeenCalledTimes(1);expect(context.createBufferSource).toHaveBeenCalledTimes(2);expect(context.createBuffer).toHaveBeenCalledTimes(1);sound.dispose();expect(context.close).toHaveBeenCalledTimes(1);
  });
  it('audio unavailable never prevents typing',()=>{const sound=new TypingKeySound(()=>{throw new Error('unavailable');});expect(()=>sound.play()).not.toThrow();expect(()=>sound.dispose()).not.toThrow();});
});
