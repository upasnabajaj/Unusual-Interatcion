import assert from 'node:assert/strict';
import { FLOWERS, composition, frequency } from '../js/audio/score.js';
const names=Object.keys(FLOWERS),scale=new Set([2,4,6,9,11]);
for(let a=0;a<4;a++)for(let b=a+1;b<5;b++)for(let c=b+1;c<6;c++) {
 const trio=[names[a],names[b],names[c]];
 for(let round=0;round<3;round++) {
  const events=composition(trio,round);
  assert(events.every(e=>scale.has(e.note%12)&&Number.isFinite(frequency(e.note))));
  assert(events.every(e=>e.beat>=0&&e.beat<32));
  assert.equal(events.filter(e=>e.gain>=.12).length,12);
  assert(events.every((e,i)=>!i||e.beat>=events[i-1].beat));
 }
 assert(composition(trio,2).length>composition(trio,1).length);
}
assert.equal(new Set(names.map(n=>FLOWERS[n].notes.join(','))).size,6);
console.log('PASS: all 20 trios, shared harmonic language, six distinct motifs and progressive three-round scoring');

const { waltzBar, WALTZ, CHORDS, harmonize } = await import('../js/audio/score.js');
assert.equal(WALTZ.length,8);
const { music } = await import('../js/audio/music.js');
for(let a=0;a<4;a++)for(let b=a+1;b<5;b++)for(let c=b+1;c<6;c++){
 const trio=[names[a],names[b],names[c]];
 for(let bar=0;bar<24;bar++){
  const events=waltzBar(bar,trio,2);
  assert(events.every(e=>e.beat>=0&&e.beat<6&&Number.isFinite(e.note)));
  assert(events.filter(e=>e.flower).every(e=>trio.includes(e.flower)));
  assert(events.some(e=>e.instrument==='lowStrings'));
  for(const f of trio)assert(CHORDS[bar%8].some(n=>n%12===harmonize(FLOWERS[f].notes[0],bar)%12));
 }
}

assert.equal(music.placement,undefined,'No positional music remix');
assert.equal(music.queue.length,0,'No continuous score');
const {CUES}=await import('../js/audio/cues.js');
for(const cue of Object.values(CUES)){assert(cue.start>=0&&cue.end<=30);assert(cue.end>cue.start+cue.fadeIn+cue.fadeOut);}
const {roundPose}=await import('../js/choreography.js');
for(let i=0;i<3;i++)for(let t=0;t<19.425;t+=.1){const p=roundPose(t,i);assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert(p.round>=0&&p.round<3);}
console.log('PASS: quiet event score, bounded source excerpts and finite choreography');
