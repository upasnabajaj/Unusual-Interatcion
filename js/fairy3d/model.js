import * as T from '../vendor/three.module.js';

// Read the supplied texture-free GLB once. Its named mesh parts are retained,
// batched by animated group/material, and shared between character instances.
const url=new URL('../../assets/refined-fairy/fairy.glb',import.meta.url);
const bytes=typeof window==='undefined'
 ? await (await import('node:fs/promises')).readFile(url).then(b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))
 : await fetch(url).then(r=>{if(!r.ok)throw Error('Fairy asset could not load');return r.arrayBuffer();});
const view=new DataView(bytes),jsonLength=view.getUint32(12,true);
const asset=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,jsonLength)));
const binOffset=28+jsonLength;
const types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array};
function accessor(index){const a=asset.accessors[index],b=asset.bufferViews[a.bufferView],width={SCALAR:1,VEC3:3,VEC2:2,VEC4:4}[a.type];if(b.byteStride)throw Error('Unexpected interleaved fairy geometry');return new types[a.componentType](bytes,binOffset+(b.byteOffset||0)+(a.byteOffset||0),a.count*width);}
const scale=.485,offsetY=-1.94;
const pivot=(x,y,z)=>new T.Vector3(x*scale,y*scale+offsetY,z*scale);
const pivots={body:new T.Vector3(),head:pivot(0,6.6,0),skirt:pivot(0,4.45,0),leftArm:pivot(-.58,5.85,0),rightArm:pivot(.58,5.85,0),leftUpper:pivot(-.38,5.8,-.2),rightUpper:pivot(.38,5.8,-.2),leftLower:pivot(-.36,5.45,-.2),rightLower:pivot(.36,5.45,-.2)};
function part(name){
 if(/wing/i.test(name))return (name.startsWith('Left')?'left':'right')+(/upper/.test(name)?'Upper':'Lower');
 if(/^(Hair|Face|Nose|Smile|Mouth|Lips)|eye|iris|pupil|catchlight|ear\b|lash|brow|chin|cheek/i.test(name))return 'head';
 if(/^(Left|Right) (hand|finger|thumb|arm)/.test(name))return name.startsWith('Left')?'leftArm':'rightArm';
 if(/^Dress \| (tier|sheer)/.test(name))return 'skirt';
 return 'body';
}
const buckets=new Map();
for(const node of asset.nodes){if(node.mesh===undefined)continue;if(node.matrix||node.translation||node.rotation||node.scale)throw Error('Unexpected fairy node transform');
 for(const primitive of asset.meshes[node.mesh].primitives){
  const group=part(node.name),key=group+':'+primitive.material;
  if(!buckets.has(key))buckets.set(key,{group,material:primitive.material,positions:[],normals:[],indices:[],count:0});
  const b=buckets.get(key),pos=accessor(primitive.attributes.POSITION),norm=accessor(primitive.attributes.NORMAL),indices=accessor(primitive.indices),origin=pivots[group];
  for(let i=0;i<pos.length;i+=3)b.positions.push(pos[i]*scale-origin.x,pos[i+1]*scale+offsetY-origin.y,pos[i+2]*scale-origin.z);
  for(const n of norm)b.normals.push(n);for(const index of indices)b.indices.push(index+b.count);b.count+=pos.length/3;
 }
}
const meshes=[...buckets.values()].map(b=>{const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(b.positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(b.normals,3));geometry.setIndex(b.indices);geometry.computeBoundingSphere();return {group:b.group,material:b.material,geometry};});
buckets.clear();
export function buildFairy(){
 const root=new T.Group(),groups={};for(const [name,position] of Object.entries(pivots)){const g=new T.Group();g.name=name;g.position.copy(position);root.add(g);groups[name]=g;}
 const materials=asset.materials.map(source=>{
  const p=source.pbrMetallicRoughness,c=p.baseColorFactor||[1,1,1,1];
  const m=new T.MeshStandardMaterial({name:source.name,color:new T.Color().setRGB(...c.slice(0,3)),roughness:p.roughnessFactor??.65,metalness:p.metallicFactor??0,transparent:source.alphaMode==='BLEND',opacity:c[3],side:T.DoubleSide,depthWrite:source.alphaMode!=='BLEND'});
  m.userData.base=m.color.clone();return m;
 });
 for(const item of meshes)groups[item.group].add(new T.Mesh(item.geometry,materials[item.material]));
 const wings=['leftUpper','rightUpper','leftLower','rightLower'].map(name=>({pivot:groups[name],side:name.startsWith('left')?-1:1,lower:name.endsWith('Lower')}));
 return {root,head:groups.head,skirt:groups.skirt,arms:[groups.leftArm,groups.rightArm],wings,
 colour(hex,amount=1){const colour=new T.Color(hex),t=T.MathUtils.clamp(amount,0,1);for(const m of materials){
   const wing=/^Wing/.test(m.name),dress=/Ivory_silk|Petal|Sheer_petal/.test(m.name),accent=/Gold|Pearl/.test(m.name);
   m.color.copy(m.userData.base);m.emissive.set(0);m.emissiveIntensity=0;
   if(wing||dress||accent){m.color.lerp(colour,t*(wing?.68:dress?.48:.3));m.emissive.copy(colour);m.emissiveIntensity=t*(wing?.28:dress?.12:.16);}
  }},
 // Geometry is shared and stays cached for restart; materials belong to this fairy.
 dispose(){materials.forEach(m=>m.dispose());root.clear();}};
}
