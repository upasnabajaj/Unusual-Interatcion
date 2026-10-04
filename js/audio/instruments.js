import { frequency } from './score.js';
const airBuffers=new WeakMap();
const colours={
  celesta:[[1,1],[2.01,.28],[3.98,.12]], crystal:[[1,1],[2.002,.22],[4,.09]],
  glass:[[1,1],[2.005,.2],[3,.07]], bell:[[1,1],[2,.3],[4.01,.11]],
  harp:[[1,1],[2,.32],[3,.12],[4,.04]], wood:[[1,1],[2,.22],[3,.07]], warm:[[1,1],[2,.17],[3,.04]],
  strings:[[.998,.42],[1.002,.42],[2,.15],[3,.065]], lowStrings:[[.999,.5],[1.001,.5],[2,.2]],
  piano:[[1,1],[2,.4],[3,.18],[4,.06]], choir:[[1,.65],[2,.22],[3,.09]],
};
export function voice(ctx,destination,{note,instrument='glass',gain=.1,pan=0,brightness=1},when,done) {
  const sustained=['warm','strings','lowStrings','choir'].includes(instrument),warm=sustained,duration=warm?4.2:instrument==='harp'?2.1:3.2;
  const amp=ctx.createGain(),filter=ctx.createBiquadFilter(),stereo=ctx.createStereoPanner();
  filter.type='lowpass';filter.frequency.setValueAtTime((warm?1800:instrument==='wood'?2100:6500)*brightness,when);
  filter.frequency.exponentialRampToValueAtTime(warm?500:1400,when+duration);
  stereo.pan.value=Math.max(-.75,Math.min(.75,pan));
  amp.gain.setValueAtTime(.00001,when);
  amp.gain.exponentialRampToValueAtTime(Math.max(.0001,gain)*.3,when+(warm?.65:.012));
  amp.gain.exponentialRampToValueAtTime(.00001,when+duration);
  amp.connect(filter).connect(stereo).connect(destination);
  const nodes=[amp,filter,stereo],oscillators=[];
  for(const [ratio,level] of colours[instrument]||colours.glass) {
    const osc=ctx.createOscillator(),partial=ctx.createGain();osc.type='sine';
    osc.frequency.value=frequency(note)*ratio;partial.gain.value=level;
    // Each partial decays independently, keeping the attack detailed and the tail warm.
    partial.gain.setValueAtTime(level,when);partial.gain.exponentialRampToValueAtTime(warm?level*.45:Math.max(.004,level*.07),when+duration/(Math.max(1,ratio)**.4));
    osc.connect(partial).connect(amp);nodes.push(osc,partial);oscillators.push(osc);
    osc.start(when);osc.stop(when+duration+.05);
  }
  if(instrument==='air') {
    let buffer=airBuffers.get(ctx);
    if(!buffer){buffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=buffer.getChannelData(0);let seed=419;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=seed/4294967296*2-1;}airBuffers.set(ctx,buffer);}
    const breath=ctx.createBufferSource(),band=ctx.createBiquadFilter(),level=ctx.createGain();breath.buffer=buffer;band.type='bandpass';band.frequency.value=frequency(note);band.Q.value=3;level.gain.value=.18;
    breath.connect(band).connect(level).connect(amp);breath.start(when);breath.stop(when+.8);nodes.push(breath,band,level);oscillators.push(breath);
  }
  let cleaned=false;
  const cleanup=()=>{if(cleaned)return;cleaned=true;nodes.forEach(n=>n.disconnect());done();};
  oscillators[0].onended=cleanup;
  return {stop(){if(cleaned)return;const t=ctx.currentTime;amp.gain.cancelAndHoldAtTime?.(t);amp.gain.setTargetAtTime(.00001,t,.025);oscillators.forEach(o=>{try{o.stop(t+.15);}catch{}});},cleanup};
}
