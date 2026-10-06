import { FLOWERS } from './score.js';
import { voice } from './instruments.js';
import { SOURCES,CUES } from './cues.js';

class FairySound {
  constructor(){this.selected=[];this.stage='opening';this.queue=[];this.voices=[];this.sources=new Set();this.buffers={};this.generation=0;this.stats={notes:0,peakVoices:0,cues:[]};}
  install(){
    if(this.installed||typeof document==='undefined')return;this.installed=true;
    // Fetch before the gesture; decoding uses the single unlocked context.
    this.downloads=Object.fromEntries(Object.entries(SOURCES).map(([key,file])=>[key,fetch(new URL('../../assets/audio/'+file,import.meta.url)).then(r=>{if(!r.ok)throw Error('Audio source unavailable: '+file);return r.arrayBuffer();})]));
    Object.values(this.downloads).forEach(p=>p.catch(()=>{}));
    const unlock=()=>this.unlock().catch(e=>console.warn('Audio could not start',e));
    for(const type of ['pointerdown','pointerup','touchend','click','keydown'])document.addEventListener(type,unlock,{capture:true,passive:true});
    document.addEventListener('visibilitychange',()=>{if(!this.ctx)return;if(document.hidden)this.ctx.suspend().catch(()=>{});else this.ctx.resume().catch(()=>{});});
    addEventListener('pagehide',()=>this.ctx?.suspend().catch(()=>{}));
    addEventListener('pageshow',()=>this.ctx?.resume().catch(()=>{}));
  }
  async unlock(){
    if(!this.ctx){
      const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;
      const c=this.ctx=new Context();this.master=c.createGain();this.master.gain.value=.65;
      const limiter=c.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=12;limiter.ratio.value=6;
      this.bus=c.createGain();this.bus.connect(limiter).connect(this.master).connect(c.destination);
      const delay=c.createDelay(.8),wet=c.createGain(),feedback=c.createGain();delay.delayTime.value=.21;wet.gain.value=.12;feedback.gain.value=.13;
      this.bus.connect(delay).connect(wet).connect(limiter);delay.connect(feedback).connect(delay);this.nodes=[this.bus,limiter,this.master,delay,wet,feedback];
      this.ready=Promise.all(Object.entries(this.downloads).map(async([key,p])=>{this.buffers[key]=await c.decodeAudioData((await p).slice(0));}));this.ready.catch(()=>{});
      this.timer=setInterval(()=>this.tick(),25);
    }
    if(this.ctx.state!=='running')await this.ctx.resume();
    if(!this.openingStarted&&this.stage==='opening'){this.openingStarted=true;const generation=this.generation;this.ready.then(()=>{if(generation===this.generation&&this.stage==='opening')this.opening();}).catch(()=>{});}
  }
  opening(){
    let delay=0;
    for(const name of ['breath1','breath2','breath3']){const cue=CUES[name];this.segment(name,delay,'opening');delay+=cue.end-cue.start+1.25;}
  }
  segment(name,delay=0,group='cue'){
    const cue=CUES[name],c=this.ctx;if(!c||!this.buffers[cue.source])return null;
    const source=c.createBufferSource(),gain=c.createGain(),duration=cue.end-cue.start,start=c.currentTime+delay;
    source.buffer=this.buffers[cue.source];source.connect(gain).connect(this.bus);
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(cue.gain,start+cue.fadeIn);gain.gain.setValueAtTime(cue.gain,start+duration-cue.fadeOut);gain.gain.linearRampToValueAtTime(0,start+duration);
    let resolve;const finished=new Promise(r=>resolve=r);
    const item={name,group,start,duration,finished,get time(){return Math.max(0,Math.min(duration,c.currentTime-start));},stop:()=>{const t=c.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setTargetAtTime(0,t,.025);try{source.stop(t+.12);}catch{}}};
    source.onended=()=>{source.disconnect();gain.disconnect();this.sources.delete(item);resolve();};this.sources.add(item);
    source.start(start,cue.start,duration);this.stats.cues.push(name);return item;
  }
  stopGroup(group){for(const s of this.sources)if(s.group===group)s.stop();}
  async cue(name,group='cue'){
    const generation=this.generation;await this.unlock();await this.ready;if(generation!==this.generation)return;
    this.stopGroup(group);return this.segment(name,0,group);
  }
  play(event,delay=0){if(!this.ctx||this.ctx.state!=='running')return;this.queue.push({...event,at:this.ctx.currentTime+delay});if(this.queue.length>80)this.queue.splice(0,this.queue.length-80);}
  tick(){
    const c=this.ctx;if(!c||c.state!=='running')return;
    const ready=this.queue.filter(e=>e.at<=c.currentTime+.07);this.queue=this.queue.filter(e=>e.at>c.currentTime+.07);
    for(const e of ready){if(e.at<c.currentTime-.3)continue;while(this.voices.length>=16)this.voices.shift().stop();let v;v=voice(c,this.bus,e,Math.max(c.currentTime+.005,e.at),()=>{this.voices=this.voices.filter(x=>x!==v);});this.voices.push(v);this.stats.notes++;this.stats.peakVoices=Math.max(this.stats.peakVoices,this.voices.length);}
  }
  setStage(stage,selected){this.stage=stage;if(selected)this.selected=[...selected];if(stage!=='opening')this.stopGroup('opening');if(stage==='exploring')this.bloom(this.selected[0]);}
  select(name,selected,on){
    this.selected=[...selected];const f=FLOWERS[name];if(!f)return;
    if(!this.ctx||this.ctx.state!=='running'){this.unlock().then(()=>this.select(name,selected,on));return;}
    const rhythm={Lotus:[0,.22,.5],Rose:[0,.13,.38],Jasmine:[0,.28,.46],Daisy:[0,.12,.31],Tulip:[0,.19,.44],Lily:[0,.24,.52]}[name];
    (on?[0,1,3]:[1,0]).forEach((n,i)=>this.play({note:f.notes[n]-(on?0:12),instrument:f.instrument,gain:on?.22:.07,pan:(this.selected.indexOf(name)-1)*.2},on?rhythm[i]:i*.16));
    if(on)this.play({note:f.notes[0]+12,instrument:'glass',gain:.04},.1);
  }
  approach(name,distance){if(distance>60||!this.ctx)return;if(this.arrived===name)return;this.arrived=name;const f=FLOWERS[name];if(f)this.play({note:f.notes[0],instrument:'glass',gain:.10});}
  activation(name,t){const f=FLOWERS[name];if(!f)return;if(this.chargeName!==name){this.chargeName=name;this.chargeStep=-1;this.approach(name,0);}const step=Math.floor(t*4);if(step<=this.chargeStep)return;this.chargeStep=step;this.play({note:f.notes[step%4]+(step===4?12:0),instrument:step===4?'glass':'harp',gain:.065+step*.02});}
  motif(name){const f=FLOWERS[name];if(!f)return;[0,.23,.58,1.0].forEach((delay,i)=>this.play({note:f.notes[i],instrument:f.instrument,gain:.15},delay));this.play({note:f.notes[0]-12,instrument:'strings',gain:.075});}
  bloom(name){const f=FLOWERS[name];if(!f)return;[0,.16,.34,.56].forEach((delay,i)=>this.play({note:f.notes[i],instrument:'harp',gain:.12},delay));this.play({note:f.notes[0]-12,instrument:'strings',gain:.13},.3);this.play({note:f.notes[3],instrument:'celesta',gain:.17},.72);this.play({note:f.notes[0]+12,instrument:'choir',gain:.06},.9);}
  twirl(name){if(!name){this.stopGroup('opening');this.cue('transition','transition').catch(()=>{});return;}const f=FLOWERS[name];[0,1,3].forEach((n,i)=>this.play({note:f.notes[n],instrument:'harp',gain:.055},i*.2));}
  gathering(){this.queue=[];}
  awaken(){this.stopGroup('performance');}
  async perform(name,update){
    const generation=this.generation;
    let track;
    try{track=await this.cue(name,'performance');}catch(e){console.warn('Performance audio unavailable',e);}
    if(generation!==this.generation)return;
    // The same audio clock also supports an unavailable-file fallback, so the
    // experience never dead-ends or relies on unrelated timer chains.
    const wallStart=performance.now(),start=this.ctx?.currentTime||0,duration=CUES[name].end-CUES[name].start;
    return new Promise(resolve=>{const frame=()=>{if(generation!==this.generation){resolve();return;}const time=track?track.time:Math.min(duration,(this.ctx?this.ctx.currentTime-start:(performance.now()-wallStart)/1000));update(time,duration);if(time<duration)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  }
  reset(){this.generation++;this.queue=[];for(const s of [...this.sources])s.stop();for(const v of this.voices)v.stop();this.voices=[];this.selected=[];this.stage='opening';this.openingStarted=false;this.arrived=null;this.chargeName=null;this.chargeStep=-1;}
  dispose(){this.reset();clearInterval(this.timer);this.nodes?.forEach(n=>n.disconnect());this.ctx?.close().catch(()=>{});}
}
export const music=new FairySound();music.install();
