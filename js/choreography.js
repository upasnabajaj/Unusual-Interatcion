import { ROUND_BREAKS } from './audio/cues.js';
const TAU=Math.PI*2;
export function roundPose(time,i){
 const round=time<ROUND_BREAKS[1]?0:time<ROUND_BREAKS[2]?1:2;
 const p=Math.min(1,(time-ROUND_BREAKS[round])/(ROUND_BREAKS[round+1]-ROUND_BREAKS[round]));
 const breath=p+.025*Math.sin(TAU*p),wave=Math.sin(Math.PI*p);
 const angle=-Math.PI/2+TAU*breath+(i-1)*.13*wave;
 const radius=505+(round?Math.sin(TAU*p+i*TAU/3)*45*wave:0);
 return {round,p,x:720+Math.cos(angle)*radius-69+i*25,
 y:470+Math.sin(angle)*158-139-i*19-(round+1)*18*wave*Math.sin(TAU*p+i*2),
 depth:wave*Math.sin(TAU*p+i*2)*.12};
}
// Phrase targets are independent of the renderer, ready for a future rig.
const formations=[[[480,360],[720,300],[960,360]],[[660,250],[890,350],[510,400]],[[960,330],[510,330],[740,420]],[[520,320],[740,250],[930,320]]];
export function dancePose(t,i,origin){
 const marks=[0,4.15,8.425,12.725];let k=Math.min(2,marks.findIndex((v,n)=>n<3&&t<marks[n+1]));if(k<0)k=2;
 const u=Math.max(0,Math.min(1,(t-marks[k])/(marks[k+1]-marks[k]))),s=u*u*(3-2*u);
 const a=k?formations[k][i]:[origin.x+86,origin.y+139],b=formations[k+1][i];
 return {x:a[0]+(b[0]-a[0])*s+Math.sin(Math.PI*u)*Math.sin(i*2+u*3)*65-86,
 y:a[1]+(b[1]-a[1])*s-Math.sin(Math.PI*u)*65-139,depth:Math.sin(Math.PI*u+i)*.15};
}
