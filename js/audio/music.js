import { FLOWERS, composition } from './score.js';
import { voice } from './instruments.js';
class FairyMusic {
  constructor(){this.selected=[];this.stage='opening';this.queue=[];this.voices=[];this.round=-1;this.lastHit=-10;this.variations=new Map();this.discovered=new Set();this.events=[];this.stats={notes:0,peakVoices:0,rounds:[],areas:[]};}
  install(){
    if(this.installed||typeof document==='undefined')return;this.installed=true;
    const unlock=()=>this.unlock().catch(()=>{});
    document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
    document.addEventListener('keydown',unlock,{capture:true});
    document.addEventListener('visibilitychange',()=>{
      if(!this.ctx)return;
      if(document.hidden){this.queue=[];this.voices.forEach(v=>v.stop());this.ctx.suspend().catch(()=>{});}
      else {this.nextAmbient=0;this.nextPhrase=0;this.ctx.resume().catch(()=>{});}
    });
    addEventListener('pagehide',()=>this.dispose());
  }
  async unlock(){
    if(this.disposed)return;
    if(!this.ctx){
      const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;
      const c=this.ctx=new Context();this.master=c.createGain();this.master.gain.value=0;
      const limiter=c.createDynamicsCompressor();limiter.threshold.value=-15;limiter.knee.value=15;limiter.ratio.value=8;limiter.attack.value=.004;limiter.release.value=.25;
      this.bus=c.createGain();this.bus.connect(limiter);limiter.connect(this.master).connect(c.destination);
      const reverb=c.createConvolver(),buffer=c.createBuffer(2,Math.floor(c.sampleRate*1.8),c.sampleRate);
      let seed=731;for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*Math.exp(-i/(c.sampleRate*.38))*.28;}}
      reverb.buffer=buffer;const wet=c.createGain();wet.gain.value=.17;this.bus.connect(reverb).connect(wet).connect(limiter);
      const delay=c.createDelay(1),echo=c.createGain(),feedback=c.createGain();delay.delayTime.value=.29;echo.gain.value=.1;feedback.gain.value=.16;
      this.bus.connect(delay).connect(echo).connect(limiter);delay.connect(feedback).connect(delay);
      this.nodes=[limiter,reverb,wet,delay,echo,feedback,this.bus,this.master];
      this.timer=setInterval(()=>this.tick(),80);this.nextAmbient=0;this.nextPhrase=0;
    }
    if(this.ctx.state==='suspended')await this.ctx.resume();
    if(!this.started){this.started=true;this.master.gain.setTargetAtTime(.5,this.ctx.currentTime,.8);}
  }
  play(event,delay=0){if(!this.ctx||this.ctx.state!=='running')return;this.queue.push({...event,at:this.ctx.currentTime+Math.max(0,delay)});if(this.queue.length>160)this.queue.splice(0,this.queue.length-160);}
  tick(){
    const c=this.ctx;if(!c||c.state!=='running')return;const now=c.currentTime;
    if(now>=this.nextAmbient){this.nextAmbient=now+11;this.play({note:this.stage==='opening'?50:62,instrument:'warm',gain:this.stage==='opening'?.045:.035});this.play({note:69,instrument:'glass',gain:.018,pan:-.4},2.6);}
    if(this.stage==='awakened'&&now>=this.nextPhrase){this.nextPhrase=now+19;composition(this.selected,0).forEach(e=>this.play({...e,gain:e.gain*.33},e.beat*.38));}
    const ready=this.queue.filter(e=>e.at<=now+.12);this.queue=this.queue.filter(e=>e.at>now+.12);
    ready.forEach(e=>{
      if(e.at<now-.3)return;
      while(this.voices.length>=20)this.voices.shift().stop();
      let v;v=voice(c,this.bus,e,Math.max(now+.005,e.at),()=>{this.voices=this.voices.filter(x=>x!==v);});this.voices.push(v);
      this.stats.notes++;this.stats.peakVoices=Math.max(this.stats.peakVoices,this.voices.length);
    });
  }
  setStage(stage,selected){this.stage=stage;if(selected)this.selected=[...selected];if(stage==='awakened')this.nextPhrase=(this.ctx?.currentTime||0)+7;}
  select(name,selected,on){this.selected=[...selected];const f=FLOWERS[name];if(!f)return;const notes=on?f.notes.slice(0,2):[f.notes[1],f.notes[0]-12];notes.forEach((note,i)=>this.play({note,instrument:f.instrument,gain:on?.11:.038,pan:(this.selected.indexOf(name)-1)*.2},i*(on?.24:.19)));}
  motif(name){const f=FLOWERS[name];if(!f)return;this.discovered.add(name);[0,.32,.85,1.55].forEach((t,i)=>this.play({note:f.notes[i],instrument:f.instrument,gain:.15},t));}
  twirl(name){const f=FLOWERS[name]||FLOWERS.Lotus;[0,1,3].forEach((n,i)=>this.play({note:f.notes[n],instrument:'harp',gain:.07},i*.22));}
  gathering(){this.stage='gathering';this.selected.forEach((name,i)=>this.play({note:FLOWERS[name].notes[0],instrument:FLOWERS[name].instrument,gain:.08,pan:(i-1)*.35},i*.3));}
  progress(round,t){
    if(round!==this.round){this.round=round;this.stage='rounds';this.events=composition(this.selected,round);this.cursor=0;this.sparkle=-1;this.stats.rounds.push(round+1);}
    while(this.cursor<this.events.length&&this.events[this.cursor].beat/32<=t){this.play(this.events[this.cursor++]);}
    if(round===2&&t>.45){const step=Math.floor((t-.45)*12);if(step!==this.sparkle){this.sparkle=step;const n=[81,83,86,90,93,95,98][Math.min(step,6)];this.play({note:n,instrument:'crystal',gain:.035,pan:step%2?.35:-.35});}}
    if(round===2&&t>.94&&!this.breath){this.breath=true;this.queue=[];this.master?.gain.setTargetAtTime(.19,this.ctx.currentTime,.06);}
  }
  awaken(){this.stage='awakening';this.queue=[];if(this.ctx)this.master.gain.setTargetAtTime(.5,this.ctx.currentTime,.6);this.play({note:50,instrument:'warm',gain:.16});this.selected.forEach((name,i)=>{const f=FLOWERS[name];this.play({note:f.notes[0],instrument:f.instrument,gain:.12,pan:(i-1)*.35},.2+i*.2);this.play({note:f.notes[3],instrument:'glass',gain:.07},1+i*.25);});}
  motion(name){if(!this.ctx||this.ctx.currentTime-(this.lastMotion||0)<1.4)return;this.lastMotion=this.ctx.currentTime;const f=FLOWERS[name];if(f)this.play({note:f.notes[2]+12,instrument:'glass',gain:.017});}
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
  dispose(){if(this.disposed)return;this.disposed=true;clearInterval(this.timer);this.queue=[];this.voices.forEach(v=>v.stop());this.ctx?.close().catch(()=>{});}
}
export const music=new FairyMusic();
music.install();
