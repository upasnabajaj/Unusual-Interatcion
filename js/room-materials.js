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
  image.onload = () => {
    ctx.drawImage(image,0,0,1440,811);
    surface=ctx.getImageData(0,0,1440,811);
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
