import fs from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
import * as T from 'three';
import crypto from 'node:crypto';
await fs.mkdir('.validation',{recursive:true});
for(const name of ['plan','model','design-data','materials','optimize','design']){const source=await fs.readFile(`lib/spatial/${name}.ts`,'utf8');const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");await fs.writeFile(`.validation/${name}.mjs`,output);}
const p=await import('../.validation/plan.mjs'),{buildBase,pointInPolygon,segmentDistance}=await import('../.validation/model.mjs'),{buildDesign}=await import('../.validation/design.mjs'),{CAMERAS}=await import('../.validation/design-data.mjs');
const model=buildBase();assert(!model.ceiling.getObjectByName('Gym_ceiling'));assert(!p.openings.some(o=>/G-pool|G-courtyard|D10/.test(o.id)));
const fingerprint=root=>{const entries=[];root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh)entries.push([o.name,Array.from(o.geometry.attributes.position.array),o.matrixWorld.toArray()])});return crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex')};
const architectureHash=fingerprint(model.architecture),report={architectureHash,openAirCorrected:true,schemes:[],cameras:[]};
const radius=12,step=5,n=251;
for(const style of ['base','style01','style02','style03']){
 const scheme=style==='base'?null:buildDesign(style),obstacles=scheme?.colliders??model.obstacleBoxes,design=scheme?.group??model.design;
 let meshCount=0,triangles=0;design.traverse(o=>{if(o.isMesh){meshCount++;const attr=o.geometry.attributes.position;assert([...attr.array].every(Number.isFinite));triangles+=(o.geometry.index?.count??attr.count)/3;}});
 const valid=q=>{if(!pointInPolygon(q,p.footprint)||pointInPolygon(q,p.rooms.find(r=>r.id==='pool').boundary))return false;if(q[0]>1098&&q[1]>445&&q[1]<751)return false;for(const c of model.collisions)if(!c.door&&segmentDistance(q,c.a,c.b)<c.t/2+radius)return false;for(const b of obstacles)if(Math.abs(q[0]-b.x)<b.w/2+radius&&Math.abs(q[1]-b.z)<b.d/2+radius)return false;return true;};
 const visited=new Uint8Array(n*n),queue=[],start=[980,475];assert(valid(start),`${style}: blocked entry spawn`);queue.push(start);visited[start[1]/step*n+start[0]/step]=1;
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){const q=[x+dx,y+dy];if(q[0]<0||q[1]<0||q[0]>1250||q[1]>1250)continue;const ix=q[1]/step*n+q[0]/step;if(!visited[ix]&&valid(q)){visited[ix]=1;queue.push(q)}}}
 const connectivity=p.rooms.filter(r=>!['pool','stairs','lift'].includes(r.id)).map(r=>({id:r.id,reachable:queue.some(q=>pointInPolygon(q,r.boundary))}));
 const assetCoverage=scheme?p.rooms.filter(r=>!['lift','stairs','lobby'].includes(r.id)).map(r=>({id:r.id,count:scheme.assets.filter(a=>a.room===r.id).length})):[];
 const cameraObstacles=CAMERAS.map(c=>({id:c.id,blocked:obstacles.filter(b=>Math.abs(c.position[0]-b.x)<b.w/2&&Math.abs(c.position[2]-b.z)<b.d/2).map(b=>b.id)}));
 report.schemes.push({style,meshCount,triangles,assetCount:scheme?.assets.length??p.furniture.length,geometryHash:fingerprint(design),connectivity,assetCoverage,cameraObstacles});
 assert.equal(fingerprint(model.architecture),architectureHash);
 console.log(style,JSON.stringify({meshCount,triangles,unreachable:connectivity.filter(r=>!r.reachable),cameraObstacles:cameraObstacles.filter(c=>c.blocked.length)}));
}
for(const c of CAMERAS){const q=[c.position[0],c.position[2]],blocked=p.walls.filter(w=>segmentDistance(q,w.a,w.b)<w.t/2);report.cameras.push({id:c.id,inFootprint:pointInPolygon(q,p.footprint),wallBlockers:blocked.map(w=>w.id),height:c.position[1],fov:c.fov});}
await fs.writeFile('DESIGN-VALIDATION.json',JSON.stringify(report,null,2));
assert(report.schemes.every(s=>s.connectivity.every(c=>c.reachable)),'Some rooms are unreachable');assert(report.schemes.every(s=>s.assetCoverage.every(c=>c.count>0)),'Some spaces lack design');assert.equal(new Set(report.schemes.map(s=>s.geometryHash)).size,4,'Each scheme must have different geometry');assert(report.cameras.every(c=>!c.wallBlockers.length&&c.inFootprint),'Cameras must not be inside walls');
assert(report.schemes.every(s=>s.cameraObstacles.every(c=>!c.blocked.length)),'Cameras inside furniture');console.log('All schemes have distinct geometry, shared architecture and connected rooms.');
