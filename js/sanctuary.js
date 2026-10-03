/** Final-state appearance only. No selection, position or choreography changes. */
const NS = 'http://www.w3.org/2000/svg';
const svg = (className, content) => {
  const el = document.createElementNS(NS, 'svg');
  el.setAttribute('viewBox','0 0 1440 811');
  el.setAttribute('class',className);el.setAttribute('aria-hidden','true');
  el.innerHTML=content;return el;
};
const random = i => (Math.sin(i*127.1+311.7)*43758.5453)%1;
const seed = i => Math.abs(random(i));
function ripples(x,y,w,colour,key) {
  return `<g class="sanctuary-reflection" style="--reflection-colour:${colour};--shimmer-delay:-${key%7}s" transform="translate(${x} ${y})">${Array.from({length:25},(_,j)=>{
    const extent=(.2+seed(j+key)*.8)*w*(1-j/35);
    const dx=(seed(j*3+key)-.5)*w*.6;
    return `<path d="M${dx-extent/2} ${j*5} q${extent*.4} ${seed(j+9)*2} ${extent} 0" opacity="${(.3*(1-j/26)).toFixed(3)}"/>`;
  }).join('')}</g>`;
}
export function mountSanctuary(world, stones, background) {
  const architecture=document.createElement('img');architecture.src=background;architecture.alt='';architecture.className='exploration-background sanctuary-moonlight';
  world.querySelector('.torch-room').after(architecture);
  // Re-light the existing foliage pixels; the original architecture stays intact.
  const foliage=architecture.cloneNode();foliage.className='exploration-background sanctuary-foliage';architecture.after(foliage);
  const atmosphere=svg('sanctuary-atmosphere',`<defs><radialGradient id="sanctuary-haze"><stop stop-color="#a9b2d0" stop-opacity=".16"/><stop offset="1" stop-color="#a9b2d0" stop-opacity="0"/></radialGradient><linearGradient id="sanctuary-ray" x2=".5" y2="1"><stop stop-color="#d8ddee" stop-opacity=".1"/><stop offset="1" stop-color="#becbdc" stop-opacity="0"/></linearGradient></defs><ellipse cx="733" cy="300" rx="370" ry="180" fill="url(#sanctuary-haze)"/><path d="M343 -20 L412 -20 L777 550 L565 550Z" fill="url(#sanctuary-ray)"/><ellipse class="sanctuary-mist" cx="640" cy="415" rx="260" ry="38" fill="url(#sanctuary-haze)"/>`);
  world.querySelector('.stone-lights').before(atmosphere);
  const floor=svg('sanctuary-floor',stones.map((s,i)=>ripples(s.x,s.y+s.h*.58,s.w*.62,s.colour,i+10)).join(''));
  world.querySelector('.exploration-stones').before(floor);
  const detail=svg('sanctuary-stone-detail',stones.map((s,i)=>{
    const moss=Array.from({length:13},(_,j)=>{
      const a=.18+j*.22,x=Math.cos(a)*s.w*.49,y=Math.sin(a)*s.h*.48;
      return `<ellipse cx="${x}" cy="${y+9}" rx="${2+seed(i*17+j)*3}" ry="1.4" transform="rotate(${j*27} ${x} ${y+9})" fill="${j%2?'#56695b':'#829080'}" opacity=".65"/>`;
    }).join('');
    const blooms=[-1,1].map((side,j)=>`<g transform="translate(${side*s.w*.49} ${s.h*.3+12})" opacity=".7">${[0,72,144,216,288].map(a=>`<ellipse rx="1.7" ry="3.6" transform="rotate(${a}) translate(0 -2.3)" fill="${i%2?'#bda4b9':'#c8b6a6'}"/>`).join('')}<circle r=".9" fill="#e6dac6"/></g>`).join('');
    return `<g transform="translate(${s.x} ${s.y}) rotate(${s.angle})"><path d="M${-s.w*.46} 8 Q${-s.w*.49} ${s.h*.47} 0 ${s.h*.48} Q${s.w*.44} ${s.h*.45} ${s.w*.46} 5" fill="none" stroke="#bfc8c2" stroke-opacity=".2" stroke-width=".8" stroke-dasharray="13 4 21 8"/>${moss}${blooms}</g>`;
  }).join('')+Array.from({length:18},(_,i)=>`<ellipse cx="${190+seed(i)*1070}" cy="${560+seed(i+80)*210}" rx="${1+seed(i+20)*1.5}" ry=".9" fill="${i%2?'#ad91a3':'#c4b5b5'}" opacity=".35"/>`).join(''));
  world.querySelector('.exploration-stones').after(detail);
  const motes=svg('sanctuary-motes',Array.from({length:23},(_,i)=>`<circle class="sanctuary-mote" cx="${150+seed(i+19)*1140}" cy="${150+seed(i+65)*590}" r="${i%5===0?1.2:.65}" fill="${i%3?'#d2d4df':'#e9dcc0'}" style="--mote-delay:-${i*.7}s;--mote-duration:${7+i%6}s"/>`).join(''));
  world.querySelector('.exploration-fairies').before(motes);
  const reflections=[];
  return {
    addFairy(f) {
      const pose=f.el.querySelector('.fairy-pose');
      const pearl=document.createElement('div');pearl.className='fairy-pearl';pearl.setAttribute('aria-hidden','true');
      pearl.innerHTML='<div class="fairy-art"><img class="fairy-layer fairy-body" src="assets/fairy.png" alt="" draggable="false"><img class="fairy-layer fairy-wing" src="assets/fairy.png" alt="" draggable="false"></div>';
      pose.append(pearl);
      const reflection=svg('sanctuary-fairy-reflection',ripples(0,0,72,'#ffffff',f.id+40));
      world.querySelector('.exploration-stones').before(reflection);reflections[f.id]=reflection.querySelector('g');
    },
    update(f) {
      const reflection=reflections[f.id];if(!reflection)return;
      reflection.setAttribute('transform',`translate(${f.x+86} ${Math.max(440,Math.min(710,f.y+253))})`);
      reflection.style.setProperty('--reflection-colour',f.colour);
    }
  };
}
