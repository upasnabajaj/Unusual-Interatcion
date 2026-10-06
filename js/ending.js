const NS='http://www.w3.org/2000/svg';
// Single-line pen strokes: the fairies follow these same paths as they appear.
const glyphs={A:['0,40 12,0 24,40','5,26 19,26'],B:['0,40 0,0 14,0 23,7 23,13 14,20 0,20','14,20 24,27 24,34 15,40 0,40'],D:['0,40 0,0 12,0 24,10 24,30 12,40 0,40'],E:['24,0 0,0 0,40 24,40','0,20 19,20'],G:['24,7 18,0 7,0 0,10 0,30 7,40 24,40 24,22 13,22'],H:['0,0 0,40','24,0 24,40','0,20 24,20'],I:['3,0 21,0','12,0 12,40','3,40 21,40'],N:['0,40 0,0 24,40 24,0'],R:['0,40 0,0 15,0 24,7 24,14 15,21 0,21','13,21 25,40'],S:['24,5 17,0 7,0 0,7 0,14 24,27 24,34 17,40 6,40 0,35'],T:['0,0 24,0','12,0 12,40'],C:['24,5 17,0 7,0 0,10 0,30 7,40 17,40 24,35'],'.':['12,39 12,40'],'?':['0,6 6,0 18,0 24,7 24,14 12,23 12,28','12,39 12,40']};
export function mountEnding(world,colours,onRestart){
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1440 811');svg.style.cssText='position:absolute;inset:0;width:1440px;height:811px;z-index:40;pointer-events:none;overflow:visible';
 const strokes=[];let button;
 ['THE DANCE ENDS HERE.','BEGIN AGAIN?'].forEach((text,row)=>{
 const group=document.createElementNS(NS,'g');svg.append(group);const start=720-text.length*32/2,y=280+row*115;
 if(row){button=group;group.setAttribute('role','button');group.setAttribute('aria-label','Begin again');group.setAttribute('tabindex','-1');const hit=document.createElementNS(NS,'rect');Object.entries({x:start-15,y:y-15,width:text.length*32+30,height:75,fill:'transparent'}).forEach(([k,v])=>hit.setAttribute(k,v));group.append(hit);}
 [...text].forEach((char,j)=>(glyphs[char]||[]).forEach(points=>{
 const path=document.createElementNS(NS,'path');path.setAttribute('d',points.split(' ').map((pair,n)=>{const[x,yy]=pair.split(',').map(Number);return (n?'L':'M')+(start+j*32+x)+' '+(y+yy);}).join(' '));path.setAttribute('fill','none');path.setAttribute('stroke','#fff4dd');path.setAttribute('stroke-width','1.7');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');group.append(path);strokes.push(path);
 }));
 });world.append(svg);
 const teams=[[],[],[]];strokes.forEach((path,i)=>{const team=Math.min(2,Math.floor(i/strokes.length*3));const length=path.getTotalLength();path.style.strokeDasharray=length;path.style.strokeDashoffset=length;path.style.filter=`drop-shadow(0 0 3px ${colours[team]}) drop-shadow(0 0 8px ${colours[team]})`;teams[team].push({path,length});});
 let enabled=false;
 const restart=()=>{if(enabled){enabled=false;onRestart();}};button.addEventListener('click',restart);button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();restart();}});button.addEventListener('pointerenter',()=>{if(enabled)button.style.filter='brightness(1.5)';});button.addEventListener('pointerleave',()=>button.style.filter='');
 return {svg,update(p){return teams.map(team=>{let distance=team.reduce((n,s)=>n+s.length,0)*p,tip;for(const s of team){const n=Math.max(0,Math.min(s.length,distance));s.path.style.strokeDashoffset=s.length-n;if(distance>=0)tip=s.path.getPointAtLength(n);distance-=s.length;}return tip||team[0].path.getPointAtLength(0);});},finish(){enabled=true;button.style.pointerEvents='all';button.style.cursor='pointer';button.setAttribute('tabindex','0');}};
}
