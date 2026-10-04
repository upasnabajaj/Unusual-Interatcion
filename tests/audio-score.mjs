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
