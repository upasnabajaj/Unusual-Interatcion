// Original “The room remembers”: D-major pentatonic, shared cadence D–A–B–F#–E–D.
// Each identity uses the same harmonic vocabulary; selection order supplies its rhythmic role.
export const FLOWERS = {
  Lotus: { instrument:'glass', notes:[74,81,78,76], register:0 },
  Rose: { instrument:'celesta', notes:[78,81,83,81], register:0 },
  Jasmine: { instrument:'bell', notes:[81,83,86,81], register:0 },
  Daisy: { instrument:'crystal', notes:[86,83,81,78], register:0 },
  Tulip: { instrument:'harp', notes:[62,69,71,66], register:0 },
  Lily: { instrument:'wood', notes:[66,69,74,71], register:0 },
};
export const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
export function composition(selected, round=0) {
  const events=[];
  selected.forEach((name,role)=> {
    const identity=FLOWERS[name]; if(!identity)return;
    // Three answering phrases, never three simultaneous melody loops.
    const slots=[[0,2,5,9],[10,12,15,18],[20,22,25,28]][role];
    identity.notes.forEach((note,i)=>events.push({beat:slots[i],note,instrument:identity.instrument,gain:.12+round*.015,pan:(role-1)*.35}));
    if(round>0) events.push({beat:slots[0]+1,note:identity.notes[0]-12,instrument:'harp',gain:.065,pan:(role-1)*.25});
    if(round>1) events.push({beat:slots[2]+1,note:identity.notes[2]+12,instrument:'glass',gain:.045,pan:-(role-1)*.35});
  });
  if(round>0) [50,57,59,54].forEach((note,i)=>events.push({beat:i*8,note,instrument:'warm',gain:.08,pan:0}));
  events.push({beat:30,note:round===2?62:69,instrument:'warm',gain:.09,pan:0});
  return events.sort((a,b)=>a.beat-b.beat);
}

// Original eight-bar waltz, “A door made of listening”. Each bar has six
// eighth-note slots. The answering phrase keeps the opening's falling turn.
export const WALTZ = [
 [[0,74],[1,78],[2,81],[4,78]], [[0,76],[2,74],[3,71],[5,69]],
 [[0,71],[1,74],[2,78],[4,76]], [[0,73],[2,76],[4,69]],
 [[0,74],[1,78],[2,83],[4,81]], [[0,78],[2,76],[3,74],[5,71]],
 [[0,73],[1,76],[2,81],[3,79],[4,76]], [[0,78],[2,76],[3,74]],
];
export const CHORDS = [[50,57,62,66],[47,54,59,62],[43,50,55,59],[45,52,57,61],
 [50,57,62,66],[43,50,55,59],[45,52,57,61],[50,57,62,66]];
// Incoming gestures follow the current chord rather than sounding against it.
export function harmonize(note, bar=0) {
 const tones=CHORDS[((bar%8)+8)%8].map(n=>n%12);
 let best=note, distance=99;
 for(let n=note-6;n<=note+6;n++)if(tones.includes((n+120)%12)&&Math.abs(n-note)<distance){best=n;distance=Math.abs(n-note);}
 return best;
}
export function waltzBar(bar, selected=[], richness=0) {
 const b=bar%8,chord=CHORDS[b],events=[];
 const add=(beat,note,instrument,gain,flower)=>events.push({beat,note,instrument,gain,flower});
 WALTZ[b].forEach(([beat,note])=>add(beat,note,'celesta',.095+richness*.012));
 add(0,chord[0],'lowStrings',.09);
 add(0,chord[2],'strings',.045+richness*.015);
 [2,4].forEach((beat,i)=>add(beat,chord[i+1]+12,'piano',.052));
 if(b%2===0||richness>0)[1,3,5].forEach((beat,i)=>add(beat,chord[i+1]+12,'harp',.036));
 // One flower answers each bar. Other identities leave room for that phrase.
 if(selected.length){const name=selected[Math.floor(bar/2)%selected.length],f=FLOWERS[name];
 [3,4.5,5].forEach((beat,i)=>add(beat,harmonize(f.notes[(i+b)%4],b),f.instrument,.075,name));}
 if(richness>1)add(4,chord[3]+12,'choir',.035);
 return events.sort((a,b)=>a.beat-b.beat);
}
