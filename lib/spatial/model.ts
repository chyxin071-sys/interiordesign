import * as T from 'three';
import { SCALE, HEIGHT, world, footprint, walls, openings, columns, furniture, rooms, routes, type Point, type Item } from './plan';

export function buildBase() {
 const root=new T.Group();root.name='BASE_SPATIAL_MODEL';
 const architecture=new T.Group();architecture.name='01_ARCHITECTURE_FIXED';root.add(architecture);
 const design=new T.Group();design.name='02_INTERIOR_DESIGN_REPLACEABLE';root.add(design);
 const annotations=new T.Group();annotations.name='03_REVIEW_ANNOTATIONS';root.add(annotations);
 const wallGroup=new T.Group();wallGroup.name='Walls_and_piers';architecture.add(wallGroup);
 const glazing=new T.Group();glazing.name='Windows_and_frames';architecture.add(glazing);
 const doors=new T.Group();doors.name='Door_leaves';architecture.add(doors);
 const ceiling=new T.Group();ceiling.name='Ceiling_placeholder';architecture.add(ceiling);ceiling.visible=false;
 const fixed=new T.Group();fixed.name='Fixed_sanitary_and_boundaries';architecture.add(fixed);
 const white=new T.MeshStandardMaterial({color:0xd1d5d6,roughness:.86});
 const soft=new T.MeshStandardMaterial({color:0xd9dad8,roughness:.96});
 const floorMat=new T.MeshStandardMaterial({color:0xbcc2c3,roughness:1,side:T.DoubleSide});
 const glass=new T.MeshStandardMaterial({color:0xffffff,roughness:.16,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide});
 const edgeMat=new T.LineBasicMaterial({color:0x9ca5aa,transparent:true,opacity:.27});
 const doorPivots:{pivot:T.Group;angle:number}[]=[];
 const collisions:{a:Point;b:Point;t:number;door?:boolean}[]=walls.filter(w=>(w.h??HEIGHT)>.45).map(w=>({a:w.a,b:w.b,t:w.t}));
 const obstacleBoxes:{x:number;z:number;w:number;d:number}[]=[];
 const addMesh=(g:T.Group,geo:T.BufferGeometry,mat:T.Material,name:string,edges=false)=>{const m=new T.Mesh(geo,mat);m.name=name;m.castShadow=true;m.receiveShadow=true;g.add(m);if(edges){const e=new T.LineSegments(new T.EdgesGeometry(geo,25),edgeMat);m.add(e);}return m;};
 function box(g:T.Group,name:string,x:number,z:number,w:number,d:number,h:number,y=0,mat:T.Material=white,edges=true){const [wx,wz]=world([x,z]);const m=addMesh(g,new T.BoxGeometry(w*SCALE,h,d*SCALE),mat,name,edges);m.position.set(wx,y+h/2,wz);return m;}
 function segment(g:T.Group,name:string,a:Point,b:Point,t:number,h:number,y=0,mat:T.Material=white,edges=true){const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const m=box(g,name,(a[0]+b[0])/2,(a[1]+b[1])/2,len,t,h,y,mat,edges);m.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);return m;}
 function slab(g:T.Group,name:string,points:Point[],y:number,thick:number,holes:Point[][]=[]){const shape=new T.Shape();points.forEach((p,i)=>{const [x,z]=world(p);if(i===0)shape.moveTo(x,-z);else shape.lineTo(x,-z)});shape.closePath();holes.forEach(pts=>{const pth=new T.Path();pts.forEach((p,i)=>{const [x,z]=world(p);if(i===0)pth.moveTo(x,-z);else pth.lineTo(x,-z)});pth.closePath();shape.holes.push(pth)});const geom=new T.ExtrudeGeometry(shape,{depth:thick,bevelEnabled:false});geom.rotateX(-Math.PI/2);const m=addMesh(g,geom,floorMat,name,true);m.position.y=y;return m;}
 slab(architecture,'Continuous_floor_with_pool_void',footprint,-.16,.16,[rooms.find(r=>r.id==='pool')!.boundary]);
 slab(fixed,'Pool_basin_bottom',rooms.find(r=>r.id==='pool')!.boundary,-1.36,.16);
 const pool=rooms.find(r=>r.id==='pool')!.boundary;pool.forEach((p,i)=>segment(fixed,'Pool_retaining_wall_'+i,p,pool[(i+1)%4],8,1.2,-1.2));
 // Roof is separate; open landscape and pool remain open to the sky.
 slab(ceiling,'Main_residence_ceiling',[[185,332],[351,332],[351,392],[499,392],[499,437],[928,437],[928,350],[1089,350],[1089,752],[1205,752],[1205,1090],[963,1090],[963,1078],[360,1078],[360,1205],[130,1205],[80,1188],[49,1143],[48,617],[111,617],[111,408],[135,354]],HEIGHT,.14);
 slab(ceiling,'Common_lobby_ceiling',[[886,231],[1144,231],[1144,328],[1204,328],[1204,438],[886,438]],HEIGHT,.14);
 walls.forEach(w=>segment(wallGroup,w.id,w.a,w.b,w.t,w.h??HEIGHT));
 columns.forEach((p,i)=>{box(wallGroup,'Pier_inferred_'+i,(p[0][0]+p[2][0])/2,(p[0][1]+p[2][1])/2,p[2][0]-p[0][0],p[2][1]-p[0][1],HEIGHT);collisions.push({a:[p[0][0],(p[0][1]+p[2][1])/2],b:[p[2][0],(p[0][1]+p[2][1])/2],t:p[2][1]-p[0][1]});});
 openings.forEach(o=>{
   const len=Math.hypot(o.b[0]-o.a[0],o.b[1]-o.a[1]);
   const outside=o.type==='window';const t=outside?6:10;
   if(o.sill>0)segment(wallGroup,o.id+'_sill',o.a,o.b,t,o.sill);
   segment(wallGroup,o.id+'_lintel',o.a,o.b,t,HEIGHT-o.head,o.head);
   [o.a,o.b].forEach((p,i)=>box(glazing,o.id+'_jamb_'+i,p[0],p[1],2.3,2.3,o.head-o.sill,o.sill));
   segment(glazing,o.id+'_head',o.a,o.b,2.3,.035,o.head-.035);
   if(outside){
    segment(glazing,o.id+'_glass',o.a,o.b,.65,o.head-o.sill,o.sill,glass,false);
    segment(glazing,o.id+'_bottom',o.a,o.b,2.3,.04,o.sill);
    const count=Math.max(1,Math.round(len/72));for(let i=1;i<count;i++){const u=i/count;box(glazing,o.id+'_mullion_'+i,o.a[0]+(o.b[0]-o.a[0])*u,o.a[1]+(o.b[1]-o.a[1])*u,2,2,o.head-o.sill,o.sill);}
    collisions.push({a:o.a,b:o.b,t:6});
   }else if(o.type==='door'){
    const hinge=o.hinge?o.b:o.a,end=o.hinge?o.a:o.b;const pivot=new T.Group();pivot.name=o.id;const [x,z]=world(hinge);pivot.position.set(x,0,z);doors.add(pivot);
    const leaf=addMesh(pivot,new T.BoxGeometry(len*SCALE-.04,o.head-.06,.038),white,o.name,true);leaf.position.set(len*SCALE/2,o.head/2,0);
    const angle=-Math.atan2(end[1]-hinge[1],end[0]-hinge[0]);pivot.rotation.y=angle+(o.swing??1)*Math.PI/2;doorPivots.push({pivot,angle});pivot.userData.swing=o.swing??1;
    const handle=addMesh(pivot,new T.BoxGeometry(.09,.025,.075),white,'Handle');handle.position.set(len*SCALE-.14,1.02,.045);
    collisions.push({a:o.a,b:o.b,t:5,door:true});
   }else{
    const dx=o.b[0]-o.a[0],dz=o.b[1]-o.a[1];
    // Panels are parked at jambs to leave the central passage clear.
    for(let i=0;i<2;i++){const a:Point=i===0?o.a:[o.a[0]+dx*.86,o.a[1]+dz*.86];const b:Point=i===0?[o.a[0]+dx*.14,o.a[1]+dz*.14]:o.b;segment(doors,o.id+'_parked_panel_'+i,a,b,2.2,o.head-.05,.025,o.id==='D11'?white:glass);}
    collisions.push({a:o.a,b:o.b,t:4,door:true});
   }
 });
 // Stair volume is diagrammatic and excluded from the walkable apartment.
 for(let i=0;i<15;i++)box(fixed,'Stair_tread_'+i,1150,734-i*19,95,19,.11+i*.17,0,white);
 segment(fixed,'Stair_handrail',[1195,735],[1195,450],3,.055,1.05);
 const cyl=(g:T.Group,name:string,x:number,z:number,r:number,h:number,y:number,mat:T.Material=soft)=>{const m=addMesh(g,new T.CylinderGeometry(r*SCALE,r*SCALE,h,32),mat,name);const [wx,wz]=world([x,z]);m.position.set(wx,y+h/2,wz);return m;};
 function makeItem(item:Item,g:T.Group){const {x,z,w,d,h,kind,id}=item;const unit=new T.Group();unit.name=id;unit.userData={room:item.room,kind,replaceable:!item.fixed};g.add(unit);
  if(kind==='bed'){
   box(unit,'Platform',x,z,w,d,.22,.06);box(unit,'Mattress',x-3,z,w-10,d-8,.23,.28,soft);
   const head=item.room==='bed1'?-1:1;
   box(unit,'Headboard',x+head*(w/2-3),z,7,d+5,.95,.02);
   [z-d*.24,z+d*.24].forEach(pz=>box(unit,'Pillow',x+head*w*.29,pz,27,d*.37,.13,.52,soft));
  }else if(kind==='sofa'){
   box(unit,'Sofa_base',x,z,w,d,.25,.07);box(unit,'Seat',x,z,w-5,d-5,.19,.3,soft);
   if(item.r===90){box(unit,'Back',x,z+d/2-4,w,8,h,.03);box(unit,'Arm',x-w/2+4,z,8,d,h-.12,.03)}
   else{box(unit,'Back',x-w/2+4,z,8,d,h,.03);[z-d/2+4,z+d/2-4].forEach(pz=>box(unit,'Arm',x,pz,w,8,h-.13,.03));}
  }else if(kind==='chair'){
   box(unit,'Seat',x,z,w,d,.10,.41,soft);box(unit,'Back',x+(item.r===180?1:-1)*(w/2-2),z,5,d,h-.32,.32);
   [-1,1].forEach(a=>[-1,1].forEach(b=>box(unit,'Leg',x+a*w*.33,z+b*d*.33,3,3,.41)));
  }else if(kind==='table'){
   if(Math.abs(w-d)<4){cyl(unit,'Round_top',x,z,w/2,.065,h-.065);cyl(unit,'Pedestal',x,z,w*.13,h-.065,0)}
   else{box(unit,'Table_top',x,z,w,d,.065,h-.065);[-1,1].forEach(a=>[-1,1].forEach(b=>box(unit,'Leg',x+a*w*.35,z+b*d*.35,4,4,h-.065)));}
  }else if(kind==='basin'){
   box(unit,'Basin_bottom',x,z,w,d,.025,h-.04);[-1,1].forEach(a=>{box(unit,'Basin_edge',x+a*w/2,z,2,d,.085,h-.04);box(unit,'Basin_edge',x,z+a*d/2,w,2,.085,h-.04)});cyl(unit,'Tap',x+w*.35,z-d*.3,1.3,.17,h);
  }else if(kind==='toilet'){
   const m=addMesh(unit,new T.SphereGeometry(1,24,14),soft,'Bowl');const [wx,wz]=world([x,z]);m.position.set(wx,.27,wz);m.scale.set(w*SCALE*.48,.24,d*SCALE*.48);box(unit,'Cistern',x+w*.32,z,w*.24,d*.82,.65);cyl(unit,'Seat',x-w*.12,z,Math.min(w,d)*.36,.035,.45);
  }else if(kind==='shower'){
   box(unit,'Shower_tray',x,z,w,d,.035,.005);box(unit,'Shower_screen',x+w/2,z,1.2,d,2.1,.035,glass,false);box(unit,'Shower_riser',x-w*.4,z-d*.4,1,1,1.8,.3);box(unit,'Shower_head',x-w*.32,z-d*.4,13,10,.025,2.08);
  }else if(kind==='treadmill'){
   box(unit,'Running_deck',x,z,w,d,.18);box(unit,'Belt',x-10,z,w*.7,d*.76,.035,.18);[-1,1].forEach(a=>box(unit,'Upright',x+w*.3,z+a*d*.38,4,4,1.03));box(unit,'Console',x+w*.3,z,20,d*.9,.09,1.02);
  }else if(kind==='machine'){
   box(unit,'Machine_base',x,z,w,d,.09);box(unit,'Frame',x+w*.27,z,8,8,h);box(unit,'Seat',x,z,w*.31,d*.48,.12,.47);box(unit,'Back',x+w*.12,z,5,d*.45,.6,.53);segment(unit,'Crossbar',[x-w*.25,z-d*.38],[x+w*.28,z+d*.38],4,.06,h-.18);
  }else if(kind==='planter'){
   box(unit,'Planter_volume',x,z,w,d,h);box(unit,'Planter_recess',x,z,w-7,d-7,.025,h, floorMat);
  }else{
   box(unit,kind,x,z,w,d,h);if(kind==='cabinet'){const n=Math.max(1,Math.round(Math.max(w,d)/35));for(let i=1;i<n;i++){if(w>d)box(unit,'Door_joint',x-w/2+w*i/n,z+d/2+.2,.45,.3,h-.1,.05,floorMat,false);else box(unit,'Door_joint',x-w/2-.2,z-d/2+d*i/n,.3,.45,h-.1,.05,floorMat,false)}}
  }
  if(!['rug','basin','shower'].includes(kind))obstacleBoxes.push({x,z,w,d});
 }
 furniture.forEach(item=>makeItem(item,item.fixed?fixed:design));
 // Explicit fixed cooking / wet points survive all design replacements.
 [514,547].forEach(z=>cyl(fixed,'Hob_ring',530,z,7,.015,.925));
 const routeGroup=new T.Group();routeGroup.name='Circulation';annotations.add(routeGroup);routeGroup.visible=false;
 routes.forEach((r,i)=>{const pts=r.map(p=>{const [x,z]=world(p);return new T.Vector3(x,.065,z)});const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color:0x317b75,dashSize:.12,gapSize:.065}));line.computeLineDistances();line.name='Route_'+i;routeGroup.add(line);});
 const setDoors=(open:boolean)=>{doorPivots.forEach(d=>d.pivot.rotation.y=d.angle+(open?d.pivot.userData.swing*Math.PI/2:0));};
 return {root,architecture,design,annotations,wallGroup,glazing,doors,ceiling,fixed,routeGroup,collisions,obstacleBoxes,setDoors,doorPivots};
}

// A style factory may replace the whole design group, without access to architecture.
export type DesignFactory=(context:{scale:number;rooms:typeof rooms})=>T.Group;
export function replaceDesignLayer(model:ReturnType<typeof buildBase>,factory:DesignFactory){const next=factory({scale:SCALE,rooms});next.name='02_INTERIOR_DESIGN_REPLACEABLE';model.root.remove(model.design);model.root.add(next);model.design=next;return next;}

export function pointInPolygon(p:Point,poly:Point[]){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}return inside;}
export function segmentDistance(p:Point,a:Point,b:Point){const vx=b[0]-a[0],vy=b[1]-a[1],l=vx*vx+vy*vy;const u=l?Math.max(0,Math.min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vy)/l)):0;return Math.hypot(p[0]-a[0]-u*vx,p[1]-a[1]-u*vy);}
