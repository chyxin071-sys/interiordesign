import fs from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
await fs.mkdir('.validation',{recursive:true});
for(const name of ['plan','model']){const source=await fs.readFile(`lib/spatial/${name}.ts`,'utf8');const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replaceAll("'./plan'","'./plan.mjs'");await fs.writeFile(`.validation/${name}.mjs`,output);}
const p=await import('../.validation/plan.mjs');const {buildBase,pointInPolygon,segmentDistance,replaceDesignLayer}=await import('../.validation/model.mjs');
const model=buildBase();model.root.updateMatrixWorld(true);
const bounds=new T.Box3().setFromObject(model.root);
assert(bounds.min.y<=-1.19&&bounds.max.y>=2.8,'Pool depth and full-height architecture exist');
const ids=[...p.walls,...p.openings,...p.furniture].map(x=>x.id);assert.equal(new Set(ids).size,ids.length,'Stable IDs are unique');
for(const o of p.openings.filter(x=>x.type!=='window')){const mid=[(o.a[0]+o.b[0])/2,(o.a[1]+o.b[1])/2];const blockers=p.walls.filter(w=>segmentDistance(mid,w.a,w.b)<w.t/2);assert.equal(blockers.length,0,`${o.id} opening blocked by ${blockers.map(w=>w.id)}`);}
let meshes=0;model.root.traverse(o=>{if(o.isMesh){meshes++;assert(o.geometry.attributes.position.count>0);assert([...o.geometry.attributes.position.array].every(Number.isFinite),'No invalid vertices')}});
const radius=12,step=5;
function valid(q){if(!pointInPolygon(q,p.footprint)||pointInPolygon(q,p.rooms.find(r=>r.id==='pool').boundary))return false;if(q[0]>1098&&q[1]>445&&q[1]<751)return false;for(const c of model.collisions){if(!c.door&&segmentDistance(q,c.a,c.b)<c.t/2+radius)return false;}for(const b of model.obstacleBoxes){if(Math.abs(q[0]-b.x)<b.w/2+radius&&Math.abs(q[1]-b.z)<b.d/2+radius)return false;}return true;}
const n=251,visited=new Uint8Array(n*n),queue=[];const start=[985,485];assert(valid(start),'Entry spawn is clear');queue.push(start);visited[(start[1]/step)*n+start[0]/step]=1;
for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){const q=[x+dx,y+dy];if(q[0]<0||q[1]<0||q[0]>1250||q[1]>1250)continue;const ix=q[1]/step*n+q[0]/step;if(!visited[ix]&&valid(q)){visited[ix]=1;queue.push(q)}}}
const connectivity=p.rooms.filter(r=>!['pool','stairs','lift'].includes(r.id)).map(r=>({room:r.name,reachable:queue.some(q=>pointInPolygon(q,r.boundary))}));
assert(connectivity.every(r=>r.reachable),`Unreachable rooms: ${JSON.stringify(connectivity.filter(r=>!r.reachable))}`);
const snapshot=JSON.stringify(model.architecture.toJSON());replaceDesignLayer(model,()=>{const g=new T.Group();g.add(new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial()));return g});assert.equal(JSON.stringify(model.architecture.toJSON()),snapshot,'Replacing entire design layer cannot alter architecture');
const base=buildBase();base.ceiling.visible=true;base.annotations.visible=false;
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.({target:this})})}readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:application/octet-stream;base64,'+Buffer.from(result).toString('base64');this.onloadend?.({target:this})})}};
const data=await new GLTFExporter().parseAsync(base.root,{binary:true,onlyVisible:true});
const buf=Buffer.from(data);assert.equal(buf.toString('ascii',0,4),'glTF');const jsonLen=buf.readUInt32LE(12);const gltf=JSON.parse(buf.toString('utf8',20,20+jsonLen));assert(gltf.nodes.some(n=>n.name==='01_ARCHITECTURE_FIXED'));assert(gltf.nodes.some(n=>n.name==='02_INTERIOR_DESIGN_REPLACEABLE'));
await fs.writeFile('public/BASE-residence-layered.glb',buf);
await fs.writeFile('public/BASE-spatial-definition.json',JSON.stringify({source:p.SOURCE,rooms:p.rooms,walls:p.walls,openings:p.openings,columns:p.columns,furniture:p.furniture,footprint:p.footprint,assumptions:p.assumptions},null,2));
const report={meshCount:meshes,wallSegments:p.walls.length,openings:p.openings.length,furniture:p.furniture.length,sourceScale:p.SCALE,bounds:bounds.getSize(new T.Vector3()).toArray(),connectivity,architectureUnchangedAfterDesignReplacement:true,glbBytes:buf.length};await fs.writeFile('MODEL-VALIDATION.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
