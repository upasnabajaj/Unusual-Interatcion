import assert from 'node:assert/strict';
import { Box3 } from '../js/vendor/three.module.js';
import { buildFairy } from '../js/fairy3d/model.js';
const a=buildFairy(),b=buildFairy();
assert.equal(a.wings.length,4);
assert.equal(a.arms.length,2);
a.root.updateMatrixWorld(true);
const bounds=new Box3().setFromObject(a.root);
assert(bounds.max.z-bounds.min.z>.5,'Character has genuine depth');
assert(bounds.max.y-bounds.min.y>3,'Readable head-to-toe sculpture');
const material=a.wings[0].pivot.children[0].material;
const neutral=material.color.getHex();
let hair,skin;a.root.traverse(o=>{if(o.material?.name==='Hair')hair=o.material;if(o.material?.name==='Skin')skin=o.material;});
assert(hair&&skin,'Supplied fairy hair and skin materials present');const hairColour=hair.color.getHex(),skinColour=skin.color.getHex();
a.colour('#b57aff');
assert.equal(hair.color.getHex(),hairColour,'Selected magic keeps black hair');assert.equal(skin.color.getHex(),skinColour,'Selected magic keeps skin colour');
assert.notEqual(material.color.getHex(),neutral);
assert.notEqual(material.color.getHex(),b.wings[0].pivot.children[0].material.color.getHex(),'Independent colours');
for(const hex of ['#b57aff','#ffcd70','#efa6c9','#89baff','#96dca7','#f4ae8f']){
 a.colour(hex);assert(material.transparent);assert(material.opacity<.5);
}
assert(a.skirt.children.some(m=>m.isMesh&&m.geometry.attributes.position.count>1000),'Layered petal geometry retained after batching');
a.dispose();b.dispose();
console.log('PASS: real 3D volume, four curved wings, articulated limbs, independent six-colour rendering and disposal');
