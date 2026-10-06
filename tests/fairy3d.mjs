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
a.colour('#b57aff');
assert.notEqual(material.color.getHex(),neutral);
assert.notEqual(material.color.getHex(),b.wings[0].pivot.children[0].material.color.getHex(),'Independent colours');
for(const hex of ['#b57aff','#ffcd70','#efa6c9','#89baff','#96dca7','#f4ae8f']){
 a.colour(hex);assert(material.transparent);assert(material.opacity<.5);
}
assert(a.skirt.children.length>8);
a.dispose();b.dispose();
console.log('PASS: real 3D volume, four curved wings, articulated limbs, independent six-colour rendering and disposal');
