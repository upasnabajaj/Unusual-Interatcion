/** User-provided vacant awakened room with separate live surface lighting. */
export function createRoomMaterials(world, background) {
  const canvas = document.createElement('canvas');
  canvas.width = 1440; canvas.height = 811;
  canvas.className = 'sanctuary-materials';
  canvas.setAttribute('aria-hidden', 'true');
  world.querySelector('.sanctuary-foliage').after(canvas);
  const ctx = canvas.getContext('2d');
  const image = new Image();
  const lights = new Map();
  let surface;
  const pool=(x,y,cx,cy,rx,ry)=>Math.exp(-2*((x-cx)**2/rx**2+(y-cy)**2/ry**2));
  // Feathered lighting regions in the existing camera; no geometry or artwork changes.
  const goldSources=[[142,335,70,95],[350,240,65,100],[1200,345,80,105],[1050,220,55,100],[565,415,70,35],[1045,630,70,100],[260,610,55,90]];
  function gradeRoom() {
    const frame=ctx.getImageData(0,0,1440,811),p=frame.data;
    for(let y=0;y<811;y++)for(let x=0;x<1440;x++) {
      const i=(y*1440+x)*4,r=p[i],g=p[i+1],b=p[i+2],lum=.2126*r+.7152*g+.0722*b;
      const distant=pool(x,y,750,210,540,330);
      const floor=pool(x,y,720,615,580,200);
      const waterfall=pool(x,y,190,235,60,210);
      const foreground=Math.max(pool(x,y,70,760,310,170),pool(x,y,1370,760,310,170));
      const edges=Math.max(pool(x,y,40,150,190,250),pool(x,y,1390,140,190,250));
      const warm=Math.max(...goldSources.map(a=>pool(x,y,...a)));
      const cool=Math.min(.83,(distant*.67+floor*.52+waterfall*.8+foreground*.3+edges*.25)*(1-warm*.83));
      const exposure=(1-distant*.35-floor*.25-foreground*.5-edges*.25)*(1-warm*.25)+warm*.25;
      // Preserve original texture and selected gold highlights while cooling the reflected ambient light.
      p[i]=(r*(1-cool)+lum*.60*cool)*exposure;
      p[i+1]=(g*(1-cool)+lum*.78*cool)*exposure;
      p[i+2]=(b*(1-cool)+lum*1.13*cool)*exposure;
    }
    ctx.putImageData(frame,0,0);surface=frame;
  }
  image.onload = () => {
    ctx.drawImage(image,0,0,1440,811);
    gradeRoom();
    for(const light of lights.values()) { prepare(light); light.x=null; }
  };
  image.src='assets/screen-three/awakened-room.png';
  function prepare(light) {
    const c=light.source.getContext('2d');
    if(!surface)return;
    const frame=c.createImageData(1440,811),out=frame.data,src=surface.data;
    const rgb=light.colour.match(/[a-f0-9]{2}/gi).map(n=>parseInt(n,16)/255);
    for(let i=0;i<src.length;i+=4) {
      const luminance=(src[i]*.2126+src[i+1]*.7152+src[i+2]*.0722)/255;
      const reflected=Math.pow(luminance,.7)*220;
      out[i]=reflected*rgb[0];out[i+1]=reflected*rgb[1];out[i+2]=reflected*rgb[2];out[i+3]=255;
    }
    c.putImageData(frame,0,0);
  }
  return {
    update(f) {
      let light=lights.get(f.id);
      if(!light) {
        const el=document.createElement('canvas');el.width=1440;el.height=811;el.className='sanctuary-surface-light'+(f.stone?' engraving-surface-light':'');el.setAttribute('aria-hidden','true');
        canvas.after(el);
        const source=document.createElement('canvas');source.width=1440;source.height=811;
        light={el,source,colour:f.colour};lights.set(f.id,light);prepare(light);
      }
      if(light.colour!==f.colour){light.colour=f.colour;prepare(light);}
      if(light.x===f.x && light.y===f.y)return;
      light.x=f.x;light.y=f.y;
      const c=light.el.getContext('2d');c.clearRect(0,0,1440,811);c.globalCompositeOperation='source-over';c.drawImage(light.source,0,0);
      c.globalCompositeOperation='destination-in';
      const g=c.createRadialGradient(f.x+86,f.y+139,10,f.x+86,f.y+139,f.stone?145:175);
      g.addColorStop(0,'#ffff');g.addColorStop(.3,'#fffa');g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(0,0,1440,811);
    }
  };
}
