/** Spatial material lighting for the original room pixels. No replacement artwork. */
export function createRoomMaterials(world, background) {
  const canvas = document.createElement('canvas');
  canvas.width = 1440; canvas.height = 811;
  canvas.className = 'sanctuary-materials';
  canvas.setAttribute('aria-hidden', 'true');
  world.querySelector('.sanctuary-foliage').after(canvas);
  const ctx = canvas.getContext('2d');
  const image = new Image();
  const lights = new Map();
  const pool = (x,y,cx,cy,rx,ry) => Math.exp(-2*((x-cx)**2/rx**2+(y-cy)**2/ry**2));
  // The masks follow existing planting, masonry, openings and wet floor.
  const plants = [[95,370,110,280],[1340,345,110,280],[150,745,220,140],[1280,745,210,150],[690,110,90,180],[280,100,80,180],[1170,125,100,200],[425,510,100,80],[1010,510,100,85]];
  const gold = [[240,350,120,170],[1200,370,115,160],[690,245,95,160],[720,465,300,140],[415,195,105,240],[1035,205,110,240],[720,640,360,170],[370,580,180,140],[1090,575,180,140]];
  image.onload = () => {
    ctx.drawImage(image,0,0,1440,811);
    const data=ctx.getImageData(0,0,1440,811),p=data.data;
    for(let y=0;y<811;y++) for(let x=0;x<1440;x++) {
      const i=(y*1440+x)*4;
      const raw=(p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722)/255;
      const value=Math.pow(raw,.47);
      const floor=pool(x,y,720,620,590,230);
      const distance=pool(x,y,740,260,330,330);
      const foliage=Math.min(.93,plants.reduce((v,a)=>Math.max(v,pool(x,y,...a)),0));
      const warmth=Math.min(.94,gold.reduce((v,a)=>v+pool(x,y,...a)*1.05,0));
      // Reflectance, not a screen wash: original cracks and texture modulate every light.
      const base=[.57,.72,1.03];
      const stone=[1.45,.93,.50],leaf=[.52,.86,.32];
      const exposure=.88+floor*.27+warmth*.33-distance*.08;
      for(let c=0;c<3;c++) {
        let tone=base[c]*(1-warmth)+stone[c]*warmth;
        tone=tone*(1-foliage*.62)+leaf[c]*foliage*.62;
        p[i+c]=Math.min(255,255*value*tone*exposure);
      }
    }
    ctx.putImageData(data,0,0);
    for(const light of lights.values()) prepare(light);
  };
  image.src=background;
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
        const el=document.createElement('canvas');el.width=1440;el.height=811;el.className='sanctuary-surface-light';el.setAttribute('aria-hidden','true');
        canvas.after(el);
        const source=document.createElement('canvas');source.width=1440;source.height=811;
        light={el,source,colour:f.colour};lights.set(f.id,light);prepare(light);
      }
      if(light.colour!==f.colour){light.colour=f.colour;prepare(light);}
      if(light.x===f.x && light.y===f.y)return;
      light.x=f.x;light.y=f.y;
      const c=light.el.getContext('2d');c.clearRect(0,0,1440,811);c.globalCompositeOperation='source-over';c.drawImage(light.source,0,0);
      c.globalCompositeOperation='destination-in';
      const g=c.createRadialGradient(f.x+86,f.y+139,10,f.x+86,f.y+139,215);
      g.addColorStop(0,'#ffff');g.addColorStop(.3,'#fffa');g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(0,0,1440,811);
    }
  };
}
