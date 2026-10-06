import * as T from '../vendor/three.module.js';

// Small articulated sculpture, built once per character; no image planes.
export function buildFairy() {
  const root=new T.Group(), body=new T.Group();root.add(body);
  const pearl=new T.MeshPhongMaterial({color:0xf4e9d9,emissive:0xc9bdd8,emissiveIntensity:.16,shininess:32,specular:0xfff5ec});
  const silk=new T.MeshPhongMaterial({color:0xe3dcea,emissive:0xbfb3df,emissiveIntensity:.19,shininess:48,side:T.DoubleSide,transparent:true,opacity:.9});
  const hair=new T.MeshPhongMaterial({color:0xcfc3a8,emissive:0xa99eaa,emissiveIntensity:.12,shininess:90});
  const membrane=new T.MeshPhongMaterial({color:0xc5d9ef,emissive:0x899cbd,emissiveIntensity:.28,shininess:110,specular:0xffffff,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false});
  const vein=new T.LineBasicMaterial({color:0xe6eaff,transparent:true,opacity:.64});
  const trim=new T.MeshBasicMaterial({color:0xf2e3fc,transparent:true,opacity:.75});
  const sphere=new T.SphereGeometry(1,16,12);
  const ellipsoid=(parent,pos,scale,material=pearl)=>{const m=new T.Mesh(sphere,material);m.position.set(...pos);m.scale.set(...scale);parent.add(m);return m;};
  const tube=(parent,points,r,material=pearl)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(curve,12,r,6,false),material);parent.add(m);return m;};
  const torso=new T.Mesh(new T.LatheGeometry([[.13,.0],[.145,.18],[.12,.34],[.16,.54],[.22,.72],[.18,.83],[.075,.88]].map(([x,y])=>new T.Vector2(x,y)),20),silk);body.add(torso);
  ellipsoid(body,[0,.96,0],[.065,.14,.065]);
  const head=new T.Group();head.position.y=1.22;body.add(head);
  ellipsoid(head,[0,0,0],[.172,.224,.16]);
  ellipsoid(head,[0,.08,-.064],[.181,.19,.145],hair);
  ellipsoid(head,[0,.235,-.09],[.105,.10,.10],hair);
  ellipsoid(head,[0,-.005,.154],[.025,.033,.027]);
  // A few swept locks, rather than a feature-heavy face at this scale.
  for(let i=0;i<4;i++)tube(head,[[-.15+i*.085,.13,.02],[-.12+i*.07,.02,-.15],[-.08+i*.04,-.20,-.14]],.013,hair);
  ellipsoid(body,[0,.59,.157],[.048,.075,.028],trim);
  const arms=[];
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.2,.76,0);body.add(arm);
    tube(arm,[[0,0,0],[side*.22,-.30,.02],[side*.34,-.48,.16]],.039);
    tube(arm,[[side*.34,-.48,.16],[side*.53,-.46,.23],[side*.67,-.36,.20]],.029);
    ellipsoid(arm,[side*.7,-.35,.2],[.075,.029,.045]);arms.push(arm);
    const leg=new T.Group();leg.position.set(side*.09,.015,0);body.add(leg);
    const bent=side<0?.18:0;
    tube(leg,[[0,0,0],[side*.055,-.65,.04],[side*.12,-1.26+bent,-.1-bent],[side*.075,-1.79+bent,.09]],.044);
    ellipsoid(leg,[side*.075,-1.82+bent,.13],[.038,.12,.055]);
  }
  const skirt=new T.Group();body.add(skirt);
  const lining=new T.Mesh(new T.LatheGeometry([[.05,-1.0],[.20,-.85],[.27,-.6],[.22,-.25],[.145,0]].map(([x,y])=>new T.Vector2(x,y)),20),silk);skirt.add(lining);
  for(let k=0;k<8;k++){
    const vertices=[],indices=[],segments=16,cols=6,a=k*Math.PI/4;
    for(let i=0;i<=segments;i++)for(let j=0;j<=cols;j++){
      const u=i/segments,v=j/cols*2-1;
      const width=(.13+Math.sin(u*Math.PI)*.31)*(1-u*.62),angle=a+v*width*2;
      const r=.14+Math.sin(u*Math.PI*.77)*.22;
      vertices.push(Math.sin(angle)*r,-u*(1.12+(k%3)*.12),Math.cos(angle)*r);
      if(i<segments&&j<cols){const n=i*(cols+1)+j;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();skirt.add(new T.Mesh(geo,silk));
    tube(skirt,[[Math.sin(a)*.16,0,Math.cos(a)*.16],[Math.sin(a)*.38,-.65,Math.cos(a)*.38],[Math.sin(a)*.30,-1.1,Math.cos(a)*.30]],.006,trim);
  }
  const wings=[];
  for(const side of [-1,1])for(const lower of [false,true]){
    const pivot=new T.Group();pivot.position.set(side*.105,.63,-.13);body.add(pivot);
    const point=(u,v)=>{
      const width=Math.sin(Math.PI*u)**.85*(lower?.39:.48);
      return new T.Vector3(side*(Math.pow(u,.86)*(lower?1.14:1.18)+v*width),u*(lower?-.98:1.67)+Math.sin(u*Math.PI)*.12+v*width*.5,-.10-Math.sin(u*Math.PI)*.19+v*v*.14);
    };
    const vertices=[],indices=[],rows=20,cols=8;
    for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
      const p=point(i/rows,j/cols*2-1);vertices.push(p.x,p.y,p.z);
      if(i<rows&&j<cols){const n=i*(cols+1)+j;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();pivot.add(new T.Mesh(geo,membrane));
    const veinPoints=[];const line=(points)=>{for(let i=1;i<points.length;i++)veinPoints.push(points[i-1],points[i]);};
    for(const v of [-1,0,1])line(Array.from({length:35},(_,i)=>point(i/34,v)));
    for(let j=1;j<=5;j++)for(const sign of [-1,1])line(Array.from({length:15},(_,i)=>{const t=i/14;return point(j*.12+t*.21,sign*t);}));
    pivot.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(veinPoints),vein));
    wings.push({pivot,side,lower});
  }
  // A low-intensity core inside the torso; geometry stays readable around it.
  ellipsoid(body,[0,.60,.11],[.024,.037,.025],new T.MeshBasicMaterial({color:0xfff9e9}));
  function colour(hex='#f5f5ff',amount=1){
    const c=new T.Color('#f5f5ff').lerp(new T.Color(hex),amount);
    silk.color.copy(new T.Color('#eee3db').lerp(c,.38));silk.emissive.copy(c).multiplyScalar(.48);
    membrane.color.copy(c);membrane.emissive.copy(c).multiplyScalar(.65);
    vein.color.copy(new T.Color('#fff3e1').lerp(c,.55));trim.color.copy(c);
    pearl.emissive.copy(c).multiplyScalar(.22);
  }
  colour();
  return {root,body,head,arms,skirt,wings,colour,dispose(){const geos=new Set(),mats=new Set();root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}};
}
