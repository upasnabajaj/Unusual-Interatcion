import { ROUND_BREAKS } from './audio/cues.js';
import { stonePositions } from './stones.js?v=centred-patterns-13';
const TAU=Math.PI*2;
// Follow the perimeter order, avoiding diagonal cuts across the formation.
export const STONE_ROUTE=[0,1,2,5,4,3];
const hoverHeight=s=>115+(630-s.y)*.28;
export function stoneOrbitPose(stone,p){
 const a=-Math.PI/2+TAU*p,front=Math.sin(a);
 return {x:stone.x+Math.cos(a)*stone.w*.66-86,
 y:stone.y-115+front*stone.h*.48-139,depth:front*.12};
}
function spline(points,u){
 const v=((u%1)+1)%1*points.length,k=Math.floor(v),t=v-k;
 const a=points[(k+points.length-1)%points.length],b=points[k],c=points[(k+1)%points.length],d=points[(k+2)%points.length];
 const out={};for(const key of ['x','y'])out[key]=.5*((2*b[key])+(-a[key]+c[key])*t+(2*a[key]-5*b[key]+4*c[key]-d[key])*t*t+(-a[key]+3*b[key]-3*c[key]+d[key])*t*t*t);return out;
}
export function createStoneRoute(stones=stonePositions){
 const points=STONE_ROUTE.map(i=>({x:stones[i].x,y:stones[i].y-hoverHeight(stones[i])}));
 // Arc-length parameterization keeps the following gap stable on tight curves.
 const samples=[{u:0,d:0,...spline(points,0)}];let length=0;
 for(let i=1;i<=720;i++){const q=spline(points,i/720),last=samples.at(-1);length+=Math.hypot(q.x-last.x,q.y-last.y);samples.push({...q,u:i/720,d:length});}
 return {at(phase){const distance=(((phase%1)+1)%1)*length;let lo=0,hi=samples.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(samples[mid].d<distance)lo=mid;else hi=mid;}const a=samples[lo],b=samples[hi],t=(distance-a.d)/(b.d-a.d);return spline(points,a.u+(b.u-a.u)*t);}};
}
const defaultRoute=createStoneRoute();
export function roundPose(time,i,route=defaultRoute){
 const round=time<ROUND_BREAKS[1]?0:time<ROUND_BREAKS[2]?1:2;
 const p=Math.max(0,Math.min(1,(time-ROUND_BREAKS[round])/(ROUND_BREAKS[round+1]-ROUND_BREAKS[round])));
 const phase=round+p+.025*Math.sin(TAU*p)-i/3;
 const q=route.at(phase);
 return {round,p,phase,x:q.x-86,y:q.y-139,depth:(q.y-350)/1000};
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
