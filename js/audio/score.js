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
