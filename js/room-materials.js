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
  image.onload = () => {
    ctx.drawImage(image,0,0,1440,811);
    for(const light of lights.values()) { prepare(light); light.x=null; }
  };
  image.src='assets/screen-three/awakened-room.png';
  function prepare(light) {
    const c=light.source.getContext('2d');
    c.clearRect(0,0,1440,811);c.drawImage(canvas,0,0);
    c.globalCompositeOperation='source-in';c.fillStyle=light.colour;c.fillRect(0,0,1440,811);
    c.globalCompositeOperation='multiply';c.drawImage(canvas,0,0);
    c.globalCompositeOperation='source-over';
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
      const g=c.createRadialGradient(f.x+86,f.y+139,10,f.x+86,f.y+139,f.stone?105:175);
      g.addColorStop(0,'#ffff');g.addColorStop(.3,'#fffa');g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(0,0,1440,811);
    }
  };
}
