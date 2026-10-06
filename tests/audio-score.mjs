import assert from 'node:assert/strict';
import { FLOWERS, frequency } from '../js/audio/score.js';
import { music } from '../js/audio/music.js';
import { CUES,ROUND_BREAKS } from '../js/audio/cues.js';
import { roundPose } from '../js/choreography.js';
const names=Object.keys(FLOWERS),scale=new Set([2,4,6,9,11]);
assert.equal(names.length,6);
assert.equal(new Set(names.map(n=>FLOWERS[n].notes.join(','))).size,6);
for(let a=0;a<4;a++)for(let b=a+1;b<5;b++)for(let c=b+1;c<6;c++){
 for(const name of [names[a],names[b],names[c]])for(const note of FLOWERS[name].notes)assert(scale.has(note%12)&&Number.isFinite(frequency(note)));
}
assert.equal(music.placement,undefined,'No positional music remix');
assert.equal(music.queue.length,0,'No continuous score');
for(const cue of Object.values(CUES)){assert(cue.start>=0&&cue.end<=30);assert(cue.end>cue.start+cue.fadeIn+cue.fadeOut);}
assert.equal(ROUND_BREAKS.at(-1),CUES.rounds.end-CUES.rounds.start);
for(let i=0;i<3;i++)for(let round=0;round<3;round++){
 const start=roundPose(ROUND_BREAKS[round],i),end=roundPose(ROUND_BREAKS[round+1],i);
 assert(Math.abs(end.phase-start.phase-1)<1e-8,'Exactly one circuit per musical round');
 assert(Math.hypot(end.x-start.x,end.y-start.y)<1e-6);
}
console.log('PASS: 20 compatible flower trios, six distinct voices, quiet engine, bounded edits and exactly three choreography laps');
