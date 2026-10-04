import { FLOWERS, composition, waltzBar, harmonize, CHORDS } from './score.js';
import { voice } from './instruments.js';
class FairyMusic {
  constructor(){this.musicOn=true;this.positions=new Map();this.flowerBuses=new Map();this.bar=0;this.nextBar=0;this.pulse=.30;this.unity=0;this.selected=[];this.stage='opening';this.queue=[];this.voices=[];this.round=-1;this.lastHit=-10;this.variations=new Map();this.discovered=new Set();this.events=[];this.stats={notes:0,peakVoices:0,rounds:[],areas:[]};}
  install(){
    if(this.installed||typeof document==='undefined')return;this.installed=true;
    this.installToggle();
    const unlock=()=>this.unlock().catch(()=>{});
    document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
    document.addEventListener('pointerup',unlock,{capture:true,passive:true});
    document.addEventListener('touchend',unlock,{capture:true,passive:true});
    document.addEventListener('click',unlock,{capture:true,passive:true});
    document.addEventListener('keydown',unlock,{capture:true});
    document.addEventListener('visibilitychange',()=>{
      if(!this.ctx)return;
      if(document.hidden){this.queue=[];this.voices.forEach(v=>v.stop());this.ctx.suspend().catch(()=>{});}
      else {this.nextBar=this.ctx?.currentTime||0;this.ctx.resume().catch(()=>{});}
    });
    addEventListener('pagehide',event=>{if(event.persisted)this.ctx?.suspend().catch(()=>{});else this.dispose();});
    addEventListener('pageshow',event=>{if(event.persisted){this.nextBar=this.ctx?.currentTime||0;this.ctx?.resume().catch(()=>{});}});
  }
  async unlock(){
    if(this.disposed)return;
    if(!this.ctx){
      const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;
      const c=this.ctx=new Context();this.master=c.createGain();this.master.gain.value=0;
      const limiter=c.createDynamicsCompressor();limiter.threshold.value=-15;limiter.knee.value=15;limiter.ratio.value=8;limiter.attack.value=.004;limiter.release.value=.25;
      this.bus=c.createGain();this.background=c.createGain();this.interactions=c.createGain();this.background.gain.value=this.musicOn?1:0;this.interactions.gain.value=1;this.background.connect(this.bus);this.interactions.connect(this.bus);this.bus.connect(limiter);limiter.connect(this.master).connect(c.destination);
      const reverb=c.createConvolver(),buffer=c.createBuffer(2,Math.floor(c.sampleRate*1.8),c.sampleRate);
      let seed=731;for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*Math.exp(-i/(c.sampleRate*.38))*.28;}}
      reverb.buffer=buffer;const wet=c.createGain();wet.gain.value=.17;this.bus.connect(reverb).connect(wet).connect(limiter);
      const delay=c.createDelay(1),echo=c.createGain(),feedback=c.createGain();delay.delayTime.value=.29;echo.gain.value=.1;feedback.gain.value=.16;
      this.bus.connect(delay).connect(echo).connect(limiter);delay.connect(feedback).connect(delay);
      this.nodes=[limiter,reverb,wet,delay,echo,feedback,this.bus,this.master,this.background,this.interactions];
      this.timer=setInterval(()=>this.tick(),25);this.nextBar=c.currentTime+.08;
    }
    if(this.ctx.state==='suspended'||this.ctx.state==='interrupted')await this.ctx.resume();
    if(!this.started){this.started=true;this.master.gain.setTargetAtTime(.5,this.ctx.currentTime,.8);}
  }
  play(event,delay=0){if(!this.ctx||this.ctx.state!=='running')return;if(event.channel!=='background'&&!event.exact)event={...event,note:harmonize(event.note,this.bar-1)};this.queue.push({...event,at:this.ctx.currentTime+Math.max(0,delay)});if(this.queue.length>160)this.queue.splice(0,this.queue.length-160);}
  tick(){
    const c=this.ctx;if(!c||c.state!=='running')return;const now=c.currentTime;
    if(now+.12>=this.nextBar){
      const richness=this.stage==='awakened'?2:this.discovered.size/2;
      const names=[...this.discovered];
      waltzBar(this.bar,names,richness).forEach(e=>{const arranged=this.arrange(e);this.play({...arranged,channel:'background',gain:arranged.gain*(this.stage==='rounds'?.4:1)},Math.max(0,this.nextBar-now)+e.beat*this.pulse);});
      this.bar++;this.nextBar+=6*this.pulse;
      if(this.nextBar<now)this.nextBar=now+6*this.pulse;
    }
    const ready=this.queue.filter(e=>e.at<=now+.12);this.queue=this.queue.filter(e=>e.at>now+.12);
    ready.forEach(e=>{
      if(e.at<now-.3)return;
      while(this.voices.length>=20)this.voices.shift().stop();
      let v;v=voice(c,e.channel==='background'?this.flowerDestination(e.flower):this.interactions,e,Math.max(now+.005,e.at),()=>{this.voices=this.voices.filter(x=>x!==v);});this.voices.push(v);
      this.stats.notes++;this.stats.peakVoices=Math.max(this.stats.peakVoices,this.voices.length);
    });
  }
  setStage(stage,selected){this.stage=stage;if(selected)this.selected=[...selected];if(stage==='exploring')this.bloom(this.selected[0]);}
  select(name,selected,on){this.selected=[...selected];const f=FLOWERS[name];if(!f)return;const notes=on?f.notes.slice(0,2):[f.notes[1],f.notes[0]-12];notes.forEach((note,i)=>this.play({note,instrument:f.instrument,gain:on?.11:.038,pan:(this.selected.indexOf(name)-1)*.2},this.nearPulse()+i*(on?.30:.15)));}
  motif(name){const f=FLOWERS[name];if(!f)return;this.discovered.add(name);[0,.32,.85,1.55].forEach((t,i)=>this.play({note:f.notes[i],instrument:f.instrument,gain:.15},t));}
  twirl(name){const f=FLOWERS[name]||FLOWERS.Lotus;[0,1,3].forEach((n,i)=>this.play({note:f.notes[n],instrument:'harp',gain:.07},i*.22));}
  gathering(){this.stage='gathering';this.selected.forEach((name,i)=>this.play({note:FLOWERS[name].notes[0],instrument:FLOWERS[name].instrument,gain:.08,pan:(i-1)*.35},i*.3));}
  progress(round,t){
    if(round!==this.round){this.round=round;this.stage='rounds';this.events=composition(this.selected,round).map(e=>({...e,channel:'background'}));this.cursor=0;this.sparkle=-1;this.stats.rounds.push(round+1);}
    while(this.cursor<this.events.length&&this.events[this.cursor].beat/32<=t){const e=this.events[this.cursor++];this.play({...e,note:harmonize(e.note,this.bar-1)});}
    if(round===2&&t>.45){const step=Math.floor((t-.45)*12);if(step!==this.sparkle){this.sparkle=step;const n=[81,83,86,90,93,95,98][Math.min(step,6)];this.play({note:n,instrument:'crystal',gain:.035,pan:step%2?.35:-.35});}}
    if(round===2&&t>.94&&!this.breath){this.breath=true;if(this.ctx)this.master.gain.setTargetAtTime(.19,this.ctx.currentTime,.06);}
  }
  awaken(){this.stage='awakening';if(this.ctx)this.master.gain.setTargetAtTime(.5,this.ctx.currentTime,.6);this.play({note:50,instrument:'warm',gain:.16});this.selected.forEach((name,i)=>{const f=FLOWERS[name];this.play({note:f.notes[0],instrument:f.instrument,gain:.12,pan:(i-1)*.35},.2+i*.2);this.play({note:f.notes[3],instrument:'glass',gain:.07},1+i*.25);});}
  motion(name){if(!this.ctx||this.ctx.currentTime-(this.lastMotion||0)<1.4)return;this.lastMotion=this.ctx.currentTime;const f=FLOWERS[name];if(f)this.play({note:f.notes[2]+12,instrument:'air',gain:.017});}
  interact(family,name,pan=0){
    if(!this.ctx||this.ctx.state!=='running')return;const now=this.ctx.currentTime;if(now-this.lastHit<.12)return;this.lastHit=now;
    const key=family+name,count=this.variations.get(key)||0;this.variations.set(key,count+1);
    const f=FLOWERS[name]||FLOWERS[this.selected[count%3]]||FLOWERS.Lotus;
    const families={stone:[f.instrument,0,.16],fairy:['crystal',12,.065],water:['glass',0,.12],plants:['harp',-12,.12],ruins:['wood',-24,.14],light:['crystal',12,.065]};
    const [instrument,octave,level]=families[family]||families.light;
    const note=f.notes[[0,2,1,3][count%4]]+octave;
    this.play({note,instrument,gain:level*(this.heardRoom?1:1.15),pan});
    if(family==='water')this.play({note:note+12,instrument:'glass',gain:.025,pan:-pan},.32);
    this.heardRoom=true;this.stats.areas.push(family);if(this.stats.areas.length>30)this.stats.areas.shift();
  }

  flowerDestination(name){
    if(!name)return this.background;
    if(!this.flowerBuses.has(name)){const input=this.ctx.createGain(),filter=this.ctx.createBiquadFilter(),pan=this.ctx.createStereoPanner();filter.type='lowpass';filter.frequency.value=5000;input.connect(filter).connect(pan).connect(this.background);this.flowerBuses.set(name,{input,filter,pan});this.nodes.push(input,filter,pan);}
    return this.flowerBuses.get(name).input;
  }
  nearPulse(){if(!this.ctx)return 0;return Math.min(.065,(this.pulse-this.ctx.currentTime%this.pulse)%this.pulse);}
  installToggle(){
    const button=document.createElement('button');button.id='music-toggle';button.type='button';
    button.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M9 18V5l10-2v13M9 8l10-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="16" cy="16" rx="3" ry="2"/><path class="music-off" d="M3 3l18 18"/></svg>';
    const style=document.createElement('style');style.textContent='#music-toggle{position:fixed;top:max(16px,env(safe-area-inset-top));right:max(16px,env(safe-area-inset-right));z-index:10000;width:40px;height:40px;display:grid;place-items:center;border:1px solid #e6dfcc35;border-radius:50%;background:#15151e70;color:#f0e7d9bd;cursor:pointer;touch-action:manipulation}#music-toggle:hover,#music-toggle:focus-visible{color:#fff4df;box-shadow:0 0 12px #f7deb525;outline:1px solid #f0e7d970}#music-toggle .music-off{display:none}#music-toggle[aria-pressed="false"] .music-off{display:block}';
    document.head.append(style);document.body.append(button);this.toggle=button;this.updateToggle();
    button.addEventListener('click',()=>{this.musicOn=!this.musicOn;this.updateToggle();if(this.ctx)this.background.gain.setTargetAtTime(this.musicOn?1:0,this.ctx.currentTime,.12);});
  }
  updateToggle(){this.toggle?.setAttribute('aria-pressed',String(this.musicOn));this.toggle?.setAttribute('aria-label',this.musicOn?'Turn background music off':'Turn background music on');this.toggle?.setAttribute('title',this.musicOn?'Background music on':'Background music off');}
  approach(name,distance){if(distance>240||distance<50||!this.ctx)return;const t=this.ctx.currentTime;if(t-(this.lastApproach||-10)<4)return;this.lastApproach=t;const f=FLOWERS[name];if(f)[0,1].forEach((n,i)=>this.play({note:f.notes[n],instrument:'harp',gain:.04},i*.3));}
  activation(name,t){const step=Math.floor(t*5);if(this.activationName!==name){this.activationName=name;this.activationStep=-1;}if(step<=this.activationStep)return;this.activationStep=step;const f=FLOWERS[name];this.play({note:f.notes[step%4]+(step>3?12:0),instrument:step>3?'glass':'harp',gain:.06+step*.008});}
  bloom(name){const f=FLOWERS[name];if(!f)return;[0,1,2,3].forEach((n,i)=>this.play({note:f.notes[n],instrument:'harp',gain:.075},i*.18));this.play({note:f.notes[0]-12,instrument:'strings',gain:.1},.25);this.play({note:f.notes[3],instrument:'celesta',gain:.12},.72);this.play({note:f.notes[0]+12,instrument:'choir',gain:.045},.9);}
  placement(points){
    points.forEach(p=>{const old=this.positions.get(p.name)||p;this.positions.set(p.name,{...p,x:old.x+(p.x-old.x)*.06,y:old.y+(p.y-old.y)*.06});});
    let sum=0,n=0;for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){sum+=Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y);n++;}
    const target=n?Math.max(0,1-sum/n/.48):0;this.unity+=(target-this.unity)*.04;
    if(this.ctx)for(const [name,p] of this.positions){const bus=this.flowerBuses.get(name);if(bus){bus.pan.pan.setTargetAtTime((p.x-.5)*(1.4-this.unity*.5),this.ctx.currentTime,.25);bus.filter.frequency.setTargetAtTime(6500-p.y*3700,this.ctx.currentTime,.35);}}
  }
  arrange(e){
    const p=this.positions.get(e.flower);if(!p||this.stage!=='awakened')return e;
    const octave=p.y<.25?12:p.y>.72?-12:0;
    const colour={water:'glass',plants:'harp',ruins:'piano',light:'celesta'};
    const close=[...this.positions.values()].some(q=>q.name!==p.name&&Math.hypot(p.x-q.x,p.y-q.y)<.22);
    if(close)this.play({channel:'background',note:harmonize(e.note-12,this.bar),instrument:'strings',gain:.024+this.unity*.02,pan:0},e.beat*this.pulse);
    return {...e,note:e.note+octave,instrument:colour[p.area]||e.instrument,pan:0,brightness:1.3-p.y*.6,gain:e.gain*(p.area==='stone'?1.25:1)*(1+this.unity*.25)};
  }
  dispose(){if(this.disposed)return;this.disposed=true;clearInterval(this.timer);this.queue=[];this.voices.forEach(v=>{v.stop();v.cleanup();});this.voices=[];this.nodes?.forEach(n=>n.disconnect());this.ctx?.close().catch(()=>{});}
}
export const music=new FairyMusic();
music.install();
