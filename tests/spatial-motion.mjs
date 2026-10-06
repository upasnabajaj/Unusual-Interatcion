import assert from 'node:assert/strict';
import {roundPose,stoneOrbitPose} from '../js/choreography.js';
import {stonePositions} from '../js/stones.js';
for(const stone of stonePositions){
 let near=Infinity;
 for(let t=0;t<4.55;t+=.005){const f=roundPose(t,0);near=Math.min(near,Math.hypot(f.x+86-stone.x,f.y+139-(stone.y-115-(630-stone.y)*.28)));}
 assert(near<2,'Route visits every actual stone top');
 const a=stoneOrbitPose(stone,0),b=stoneOrbitPose(stone,1);
 assert(Math.hypot(a.x-b.x,a.y-b.y)<1e-6,'Local orbit closes');
 for(let p=0;p<=1;p+=.01){const f=stoneOrbitPose(stone,p);assert(f.y+139<stone.y-65,'Fairy remains overhead');}
}
for(let t=0;t<19.425;t+=.02){const f=[0,1,2].map(i=>roundPose(t,i));for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert(Math.hypot(f[i].x-f[j].x,f[i].y-f[j].y)>250,'Procession stays separated across curves');}
console.log('PASS: six stone waypoints, overhead local orbits and stable procession gaps');
