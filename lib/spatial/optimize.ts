import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Bake independent design parts into material batches while retaining asset metadata.
// This is geometry batching, not geometry reuse between schemes.
export function batchDesign(root:T.Group){
 // Keep each asset group intact so the viewer can select, move and rotate it.
 // The previous global material batching made furniture fast to draw but destroyed
 // the object boundaries required for direct manipulation.
 root.userData.batchCount=0;
 root.userData.sourceMeshCount=0;
 return;
 /*
 root.updateMatrixWorld(true);const buckets=new Map<T.Material,T.BufferGeometry[]>(),lines:T.BufferGeometry[]=[],meshes:T.Mesh[]=[],lineObjects:T.LineSegments[]=[];
 root.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)){const geo=o.geometry.clone().applyMatrix4(o.matrixWorld);const normalized=geo.index?geo.toNonIndexed():geo;for(const key of Object.keys(normalized.attributes))if(!['position','normal','uv'].includes(key))normalized.deleteAttribute(key);if(!normalized.attributes.uv)normalized.setAttribute('uv',new T.BufferAttribute(new Float32Array(normalized.attributes.position.count*2),2));const list=buckets.get(o.material)??[];list.push(normalized);buckets.set(o.material,list);meshes.push(o);}else if(o instanceof T.LineSegments){lines.push(o.geometry.clone().applyMatrix4(o.matrixWorld));lineObjects.push(o)}});
 const group=new T.Group();group.name='Batched_design_geometry';
 buckets.forEach((geos,mat)=>{const merged=mergeGeometries(geos,false);if(!merged)return;const m=new T.Mesh(merged,mat);m.name='Design_batch_'+mat.name;m.castShadow=true;m.receiveShadow=true;group.add(m);geos.forEach(g=>g.dispose());});
 if(lines.length){const merged=mergeGeometries(lines,false);if(merged){const line=new T.LineSegments(merged,new T.LineBasicMaterial({color:0x475359,transparent:true,opacity:.14}));line.name='Design_subtle_edges';group.add(line)}lines.forEach(g=>g.dispose())}
 const sourceGeometry=new Set<T.BufferGeometry>();meshes.forEach(m=>{sourceGeometry.add(m.geometry);m.removeFromParent()});lineObjects.forEach(l=>{sourceGeometry.add(l.geometry);l.removeFromParent()});sourceGeometry.forEach(g=>g.dispose());root.add(group);root.userData.batchCount=buckets.size;root.userData.sourceMeshCount=meshes.length;
  */
}
