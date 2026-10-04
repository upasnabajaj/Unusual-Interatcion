import { frequency } from './score.js';
const colours={
  celesta:[[1,1],[2.01,.28],[3.98,.12]], crystal:[[1,1],[2.002,.22],[4,.09]],
  glass:[[1,1],[2.005,.2],[3,.07]], bell:[[1,1],[2,.3],[4.01,.11]],
  harp:[[1,1],[2,.32],[3,.12],[4,.04]], wood:[[1,1],[2,.22],[3,.07]], warm:[[1,1],[2,.17],[3,.04]],
};
export function voice(ctx,destination,{note,instrument='glass',gain=.1,pan=0},when,done) {
  const warm=instrument==='warm',duration=warm?6:instrument==='harp'?2.5:3.8;
  const amp=ctx.createGain(),filter=ctx.createBiquadFilter(),stereo=ctx.createStereoPanner();
  filter.type='lowpass';filter.frequency.setValueAtTime(warm?900:instrument==='wood'?2100:6500,when);
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
    partial.gain.setValueAtTime(level,when);partial.gain.exponentialRampToValueAtTime(.0001,when+duration/(ratio**.4));
    osc.connect(partial).connect(amp);nodes.push(osc,partial);oscillators.push(osc);
    osc.start(when);osc.stop(when+duration+.05);
  }
  let cleaned=false;
  const cleanup=()=>{if(cleaned)return;cleaned=true;nodes.forEach(n=>n.disconnect());done();};
  oscillators[0].onended=cleanup;
  return {stop(){if(cleaned)return;const t=ctx.currentTime;amp.gain.cancelAndHoldAtTime?.(t);amp.gain.setTargetAtTime(.00001,t,.025);oscillators.forEach(o=>{try{o.stop(t+.15);}catch{}});},cleanup};
}
