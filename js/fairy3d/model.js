import * as T from '../vendor/three.module.js';

// Small articulated sculpture, built once per character; no image planes.
export function buildFairy() {
  const root=new T.Group(), body=new T.Group();root.add(body);
  const pearl=new T.MeshPhongMaterial({color:0xf3d7bf,emissive:0xc9bdd8,emissiveIntensity:.07,shininess:22,specular:0xfff5ec});
  const silk=new T.MeshPhongMaterial({color:0xe3dcea,emissive:0xbfb3df,emissiveIntensity:.19,shininess:48,side:T.DoubleSide,transparent:true,opacity:.9});
  const hair=new T.MeshPhongMaterial({color:0xd7b894,emissive:0xa99eaa,emissiveIntensity:.07,shininess:50});
  const membrane=new T.MeshPhongMaterial({color:0xc5d9ef,emissive:0x899cbd,emissiveIntensity:.28,shininess:110,specular:0xffffff,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false});
  const vein=new T.LineBasicMaterial({color:0xe6eaff,transparent:true,opacity:.64});
  const trim=new T.MeshBasicMaterial({color:0xf2e3fc,transparent:true,opacity:.75});
  const petals=new T.MeshPhongMaterial({color:0xf5eadf,emissive:0xd2c5e7,emissiveIntensity:.15,shininess:85,transparent:true,opacity:.64,side:T.DoubleSide,depthWrite:false});
  const gold=new T.LineBasicMaterial({color:0xf3d39b,transparent:true,opacity:.28});
  const glints=new T.PointsMaterial({color:0xffe8b6,size:.032,transparent:true,opacity:.75,depthWrite:false});
  const sphere=new T.SphereGeometry(1,20,16);
  const ellipsoid=(parent,pos,scale,material=pearl)=>{const m=new T.Mesh(sphere,material);m.position.set(...pos);m.scale.set(...scale);parent.add(m);return m;};
  const tube=(parent,points,r,material=pearl)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(curve,12,r,6,false),material);parent.add(m);return m;};
  const torso=new T.Mesh(new T.LatheGeometry([[.15,.0],[.13,.18],[.105,.34],[.14,.54],[.195,.69],[.18,.77],[.075,.85]].map(([x,y])=>new T.Vector2(x,y)),20),silk);body.add(torso);
  ellipsoid(body,[0,.96,0],[.065,.14,.065]);
  const head=new T.Group();head.position.set(0,1.24,.018);head.rotation.x=-.06;body.add(head);
  ellipsoid(head,[0,0,0],[.204,.249,.178]);
  // Shaped cheeks/chin, tiny features and inset almond eyes: actual geometry.
  ellipsoid(head,[0,-.125,.035],[.139,.125,.142]);
  const whites=new T.MeshPhongMaterial({color:0xfff4e5,shininess:40});
  const iris=new T.MeshPhongMaterial({color:0x706156,shininess:75});
  const dark=new T.MeshBasicMaterial({color:0x32282c});
  const lips=new T.MeshPhongMaterial({color:0xc7877f,shininess:25});
  for(const side of [-1,1]){
    const eye=ellipsoid(head,[side*.082,.015,.163],[.049,.025,.017],whites);eye.rotation.z=side*.10;
    ellipsoid(head,[side*.082,.015,.177],[.021,.022,.008],iris);
    ellipsoid(head,[side*.082,.015,.184],[.010,.014,.004],dark);
    ellipsoid(head,[side*.075,.025,.189],[.006,.007,.003],whites);
    tube(head,[[side*.035,.032,.16],[side*.08,.047,.180],[side*.133,.034,.157]],.004,dark);
    tube(head,[[side*.039,.082,.155],[side*.085,.094,.157],[side*.13,.075,.139]],.005,hair);
    ellipsoid(head,[side*.195,-.026,-.005],[.032,.061,.026]);
  }
  ellipsoid(head,[0,-.038,.18],[.025,.036,.034]);
  ellipsoid(head,[0,-.104,.161],[.033,.009,.01],lips);
  ellipsoid(head,[0,-.118,.158],[.027,.009,.012],lips);
  // Swept crown, layered chignon and curved individual locks.
  ellipsoid(head,[0,.103,-.063],[.215,.188,.158],hair);
  ellipsoid(head,[-.023,.288,-.073],[.137,.125,.119],hair);
  for(let i=0;i<17;i++){
    const a=i/16*Math.PI*1.5;
    tube(head,[[Math.cos(a)*.12,.29+Math.sin(a)*.08,-.02],[Math.cos(a+.6)*.13,.36+Math.sin(a+.6)*.055,-.08],[Math.cos(a+1.1)*.10,.27,-.145]],.010,hair);
  }
  for(let i=0;i<13;i++){
    const q=i/12;
    tube(head,[[.10+q*.04,.18-q*.012,.085],[-.035-q*.035,.145-q*.025,.186],[-.145-q*.017,.015-q*.028,.126]],.0085,hair);
  }
  // Fine curved strands follow the crown and chignon surface in every view.
  const strands=new T.MeshPhongMaterial({color:0xbca181,shininess:50});
  for(let i=0;i<24;i++){
    const a=i*Math.PI*2/24;
    const points=Array.from({length:9},(_,j)=>{const u=.12+j*.17;return [Math.sin(u)*Math.cos(a)*.218,.103+Math.cos(u)*.192,-.063+Math.sin(u)*Math.sin(a)*.162];});
    tube(head,points,.0028,strands);
  }
  for(const side of [-1,1])tube(head,[[side*.18,.10,.03],[side*.205,-.04,.065],[side*.17,-.20,.10],[side*.205,-.28,.05]],.012,hair);
  // A small bodice jewel and softly curved embroidered neckline.
  ellipsoid(body,[0,.62,.164],[.022,.040,.012],trim);
  tube(body,[[-.14,.78,.11],[-.075,.68,.17],[0,.63,.17],[.075,.68,.17],[.14,.78,.11]],.006,trim);
  const arms=[];
  for(const side of [-1,1]){
    const arm=new T.Group();arm.position.set(side*.2,.76,0);body.add(arm);
    tube(arm,[[0,0,0],[side*.22,-.30,.02],[side*.34,-.48,.16]],.039);
    tube(arm,[[side*.34,-.48,.16],[side*.50,-.54,.23],[side*.65,-.54,.20]],.029);
    ellipsoid(arm,[side*.69,-.54,.2],[.06,.026,.035]);arms.push(arm);
    const leg=new T.Group();leg.position.set(side*.09,.015,0);body.add(leg);
    const bent=side<0?.29:0;
    tube(leg,[[0,0,0],[side*.055,-.65,.04],[side*.13,-1.26+bent,-.1-bent],[side*.015,-1.79+bent,-bent*.4]],.044);
    ellipsoid(leg,[side*.015,-1.82+bent,.025-bent*.4],[.038,.12,.055]);
  }
  const skirt=new T.Group();body.add(skirt);
  const lining=new T.Mesh(new T.LatheGeometry([[.07,-.7],[.27,-.55],[.25,-.3],[.145,0]].map(([x,y])=>new T.Vector2(x,y)),20),silk);skirt.add(lining);
  for(let k=0;k<24;k++){
    const layer=Math.floor(k/8),a=(k%8)*Math.PI/4+layer*.32;
    const length=[1.03,.76,.49][layer]*(.9+.14*Math.sin(k*2.7)),startY=-.02-layer*.005;
    const point=(u,v)=>{
      const width=Math.sin(Math.PI*u)**.7*.44;
      const angle=a+v*width;
      const r=.15+u*.27+Math.sin(u*Math.PI)*(.16+layer*.016);
      return new T.Vector3(Math.sin(angle)*r,startY-u*length+v*v*.07,Math.cos(angle)*r);
    };
    const verts=[],indices=[],rows=14,cols=6;
    for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
      const q=point(i/rows,j/cols*2-1);verts.push(q.x,q.y,q.z);
      if(i<rows&&j<cols){const n=i*(cols+1)+j;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();skirt.add(new T.Mesh(geo,petals));
    const lines=[];for(const v of [-1,0,1])for(let i=1;i<=18;i++)lines.push(point((i-1)/18,v),point(i/18,v));
    skirt.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(lines),gold));
    const dots=Array.from({length:8},(_,i)=>point(.25+i*.085,Math.sin(i*7+k)*.65));
    skirt.add(new T.Points(new T.BufferGeometry().setFromPoints(dots),glints));
  }
  const wings=[];
  for(const side of [-1,1])for(const lower of [false,true]){
    const pivot=new T.Group();pivot.position.set(side*.105,.63,-.13);body.add(pivot);
    const point=(u,v)=>{
      const width=Math.sin(Math.PI*u)**.85*(lower?.32:.49);
      return new T.Vector3(side*(Math.pow(u,.86)*(lower?1.08:1.30)+v*width),u*(lower?-.56:1.50)+Math.sin(u*Math.PI)*.12+v*width*.5,-.10-Math.sin(u*Math.PI)*.19+v*v*.14);
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
    const dust=Array.from({length:24},(_,i)=>point(.12+i*.032,Math.sin(i*13.37)*.72));
    pivot.add(new T.Points(new T.BufferGeometry().setFromPoints(dust),glints));
    wings.push({pivot,side,lower});
  }
  // A low-intensity core inside the torso; geometry stays readable around it.
  ellipsoid(body,[0,.60,.11],[.024,.037,.025],new T.MeshBasicMaterial({color:0xfff9e9}));
  function colour(hex='#fff0dc',amount=1){
    const c=new T.Color('#fff0dc').lerp(new T.Color(hex),amount);
    petals.color.copy(new T.Color('#fff0db').lerp(c,.32));petals.emissive.copy(c).multiplyScalar(.35);
    gold.color.copy(new T.Color('#f3d39b').lerp(c,.28));glints.color.copy(new T.Color('#ffedcc').lerp(c,.25));
    silk.color.copy(new T.Color('#eee3db').lerp(c,.38));silk.emissive.copy(c).multiplyScalar(.48);
    membrane.color.copy(c);membrane.emissive.copy(c).multiplyScalar(.65);
    vein.color.copy(new T.Color('#fff3e1').lerp(c,.55));trim.color.copy(c);
    pearl.emissive.copy(c).multiplyScalar(.09);
  }
  colour();
  // Batch static pieces within each articulated part. Keep joints independent,
  // while hair strands, petal hems and glints share inexpensive draw calls.
  const batch=parent=>{
    for(const child of [...parent.children])if(child.isGroup)batch(child);
    const groups=new Map();
    for(const child of parent.children)if(child.isMesh||child.isLineSegments||child.isPoints){
      const key=child.type+child.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(child);
    }
    for(const pieces of groups.values())if(pieces.length>1){
      const positions=[],normals=[];
      for(const part of pieces){part.updateMatrix();const geometry=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();geometry.applyMatrix4(part.matrix);
        positions.push(...geometry.attributes.position.array);if(geometry.attributes.normal)normals.push(...geometry.attributes.normal.array);geometry.dispose();parent.remove(part);
      }
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));if(normals.length)geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
      const first=pieces[0],Combined=first.isMesh?T.Mesh:first.isPoints?T.Points:T.LineSegments;parent.add(new Combined(geo,first.material));
    }
  };
  batch(body);
  return {root,body,head,arms,skirt,wings,colour,dispose(){const geos=new Set(),mats=new Set();root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}};
}
