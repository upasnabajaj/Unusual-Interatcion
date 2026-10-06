import * as T from '../vendor/three.module.js';
import { buildFairy } from './model.js';

const instances=new Set();let renderer,scene,camera,raf,last=0;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=T.MathUtils.clamp;
function initialise(){
  if(renderer)return;
  // One shared WebGL context. Transparent snapshots stay in each original DOM
  // layer, so scene crossfades, particles, clipping and input stacking still work.
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor(0,0);renderer.setPixelRatio(1);renderer.setSize(360,628,false);
  renderer.outputColorSpace=T.SRGBColorSpace;
  scene=new T.Scene();camera=new T.PerspectiveCamera(35,360/628,.1,30);camera.position.set(0,.15,9.4);camera.lookAt(0,.15,0);
  scene.add(new T.HemisphereLight(0xdce7ff,0x66517c,2.0));
  const key=new T.DirectionalLight(0xffeed9,2.5);key.position.set(-3,4,5);scene.add(key);
  const rim=new T.DirectionalLight(0xb6cfff,2.2);rim.position.set(3,2,-4);scene.add(rim);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame);}});
  renderer.domElement.addEventListener('webglcontextlost',e=>e.preventDefault());
  raf=requestAnimationFrame(frame);
}
function frame(now){
  raf=0;if(document.hidden)return;
  const dt=Math.min(.05,(now-(last||now))/1000);last=now;
  for(const f of instances){
    if(!f.host.isConnected){f.dispose();continue;}
    if(f.host.closest('[hidden]'))continue;
    f.update(now,dt);
    scene.add(f.model.root);renderer.render(scene,camera);scene.remove(f.model.root);
    f.context.clearRect(0,0,360,628);f.context.drawImage(renderer.domElement,0,0);
  }
  if(instances.size)raf=requestAnimationFrame(frame);
}
export class FairyCharacter {
  constructor(host,{facing=.35}={}){
    initialise();this.host=host;this.model=buildFairy();this.yaw=facing;this.facing=facing;this.state='hover';this.speed=0;this.vx=0;this.vy=0;this.phase=instances.size*1.7;this.pose={};
    this.canvas=document.createElement('canvas');this.canvas.width=360;this.canvas.height=628;this.canvas.className='fairy-3d-canvas';this.canvas.setAttribute('aria-hidden','true');
    this.context=this.canvas.getContext('2d',{alpha:true});host.replaceChildren(this.canvas);host.classList.add('fairy-3d');host.closest('.fairy-mirror')?.classList.add('fairy-3d-mirror');
    host.fairyCharacter=this;instances.add(this);if(!raf)raf=requestAnimationFrame(frame);
  }
  setColour(colour,amount=1){this.model.colour(colour,amount);}
  setState(state){this.state=state;}
  // Coordinates stay owned by the existing game. Sample actual path movement.
  moveTo(x,y,z=0){
    const now=performance.now();
    if(this.previous){const dt=Math.max(.008,(now-this.previous.time)/1000);if(dt<.3){this.vx=(x-this.previous.x)/dt;this.vy=(y-this.previous.y)/dt;this.lastMove=now;}}
    this.previous={x,y,time:now};this.depth=clamp(z,-1,1);
  }
  setPose({yaw,pitch=0,roll=0,armLeft=0,armRight=0,wingIntensity=1,depth=0}={}){this.pose={yaw,pitch,roll,armLeft,armRight,wingIntensity};this.depth=depth;}
  clearPose(){this.pose={};}
  twirl(duration=1350){
    if(this.spin)return this.spin.handle;
    let resolve;const finished=new Promise(r=>resolve=r);
    const handle={finished,cancel:()=>{this.spin=null;resolve();}};
    this.spin={start:performance.now(),duration,base:this.yaw,resolve,handle};this.state='twirl';return handle;
  }
  update(now,dt){
    const t=now/1000+this.phase, m=this.model, motion=reduced()?0:1;
    const recent=now-(this.lastMove||0)<100, vx=recent?this.vx:0,vy=recent?this.vy:0;
    const speed=clamp(Math.hypot(vx,vy)/190,0,1);this.speed+=(speed-this.speed)*(1-Math.exp(-dt*7));
    const desired=this.pose.yaw??(this.speed>.045?Math.atan2(vx,-vy*.7):this.facing+Math.sin(t*.35)*.07*motion);
    const delta=Math.atan2(Math.sin(desired-this.yaw),Math.cos(desired-this.yaw));this.yaw+=delta*(1-Math.exp(-dt*5));
    let yaw=this.yaw,lift=0;
    if(this.spin){const s=this.spin,p=clamp((now-s.start)/s.duration,0,1),e=p*p*(3-2*p);yaw=s.base+Math.PI*2*e;lift=Math.sin(p*Math.PI)*.12*motion;if(p===1){this.yaw=s.base;this.spin=null;this.state='hover';s.resolve();}}
    m.root.position.set(.24,Math.sin(t*1.4)*.028*motion+lift,this.depth||0);
    m.root.rotation.set(this.pose.pitch||-.08*this.speed,yaw,(this.pose.roll||0)+clamp(-vx/1900,-.16,.16)*motion+Math.sin(t*.8)*.012*motion);
    m.head.rotation.z=Math.sin(t*.9)*.03*motion;
    m.skirt.rotation.x=Math.sin(t*2.2)*.035*motion+this.speed*.08;
    m.skirt.rotation.y=Math.sin(t*1.1)*.045*motion;
    m.arms.forEach((a,i)=>{a.rotation.z=(i?1:-1)*(.05+this.speed*.15)+Math.sin(t*1.6+i)*.035*motion+(i?this.pose.armRight||0:this.pose.armLeft||0);});
    for(const w of m.wings)w.pivot.rotation.y=w.side*(.22+Math.sin(t*(4+this.speed*5)+(w.lower?.6:0))*(.12+this.speed*.18)*motion*(this.pose.wingIntensity??1));
    this.canvas.dataset.state=this.spin?'twirl':this.speed>.06?'fly':this.state;
  }
  dispose(){this.spin?.handle.cancel();instances.delete(this);this.model.dispose();this.host.fairyCharacter=null;}
}
export const fairyRendererStats=()=>({instances:instances.size,contexts:renderer?1:0,drawCalls:renderer?.info.render.calls,triangles:renderer?.info.render.triangles});
