import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {world,SCALE,rooms,footprint,type Point} from './plan';
import {layout,type StyleID,type Asset} from './design-data';
import {makePalette,type Palette} from './materials';
import {batchDesign} from './optimize';

export function buildDesign(style:StyleID){
 const group=new T.Group();group.name='02_INTERIOR_DESIGN_REPLACEABLE';group.userData={style,version:2};
 const p=makePalette(style),scheme=style==='style02'?2:style==='style03'?3:1,assets=layout(style),colliders:{x:number;z:number;w:number;d:number;id:string}[]=[],lights:T.RectAreaLight[]=[];
 const baseGeo=new T.BoxGeometry(1,1,1),cylGeo=new T.CylinderGeometry(1,1,1,24),sphereGeo=new T.SphereGeometry(1,20,12);
 const edgeMat=new T.LineBasicMaterial({color:0x475359,transparent:true,opacity:.14});
 function mesh(g:T.Group,name:string,geo:T.BufferGeometry,mat:T.Material,pos:[number,number,number],scale?:[number,number,number],edges=false){const o=new T.Mesh(geo,mat);o.name=name;o.position.set(...pos);if(scale)o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;g.add(o);if(edges)o.add(new T.LineSegments(new T.EdgesGeometry(geo,28),edgeMat));return o;}
 const box=(g:T.Group,n:string,x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material=p.wood,r=0)=>mesh(g,n,r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/2-.0001,h/2-.0001,d/2-.0001)):baseGeo,mat,[x,y,z],r?undefined:[w,h,d],!r);
 const cyl=(g:T.Group,n:string,x:number,y:number,z:number,r:number,h:number,mat:T.Material=p.metal,rt?:number)=>mesh(g,n,rt!==undefined?new T.CylinderGeometry(rt,r,h,28):cylGeo,mat,[x,y,z],rt!==undefined?undefined:[r,h,r]);
 const ball=(g:T.Group,n:string,x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material=p.fabric)=>mesh(g,n,sphereGeo,mat,[x,y,z],[w/2,h/2,d/2]);
 const tube=(g:T.Group,n:string,pts:[number,number,number][],r=.014,mat:T.Material=p.metal)=>{const curve=new T.CatmullRomCurve3(pts.map(v=>new T.Vector3(...v)));return mesh(g,n,new T.TubeGeometry(curve,Math.max(12,pts.length*5),r,8,false),mat,[0,0,0]);};
 const legs=(g:T.Group,w:number,d:number,h:number,mat=p.wood,r=.022)=>{for(const x of [-w*.38,w*.38])for(const z of [-d*.36,d*.36])cyl(g,'Tapered_leg',x,h/2,z,r,h,mat,r*.64);};
 const lampLight=(g:T.Group,w:number,power=4)=>{const l=new T.RectAreaLight(0xffdfb6,power,Math.max(.12,w),Math.max(.10,w*.6));l.position.y=-.045;l.rotation.x=-Math.PI/2;g.add(l);lights.push(l);};
 // Soft goods use genuinely curved surfaces and stitched edges, retained in every display mode.
 function pillow(g:T.Group,x:number,y:number,z:number,w:number,h:number,mat:T.Material,tilt=0){
  const c=new T.Group();c.position.set(x,y,z);c.rotation.set(-.14,0,tilt);g.add(c);
  const geo=new T.SphereGeometry(1,24,16),a=geo.attributes.position;
  for(let i=0;i<a.count;i++){const u=a.getX(i),v=a.getY(i),q=a.getZ(i);a.setXYZ(i,Math.sign(u)*Math.pow(Math.abs(u),.55)*w/2,Math.sign(v)*Math.pow(Math.abs(v),.55)*h/2,q*.085*(1+.07*Math.sin(u*20+v*17)));}geo.computeVertexNormals();mesh(c,'Sewn_soft_cushion',geo,mat,[0,0,0]);
  const pts:[number,number,number][]=[];for(let i=0;i<=40;i++){const t=i*Math.PI/20;pts.push([Math.sign(Math.cos(t))*Math.pow(Math.abs(Math.cos(t)),.55)*w*.492,Math.sign(Math.sin(t))*Math.pow(Math.abs(Math.sin(t)),.55)*h*.492,0]);}tube(c,'Cushion_piping',pts,.0025,mat);
 }
 function drape(g:T.Group,x:number,y:number,z:number,w:number,d:number,drop:number,mat:T.Material){
  const geo=new T.PlaneGeometry(w,d,28,36);geo.rotateX(-Math.PI/2);const a=geo.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i),v=(a.getZ(i)+d/2)/d,bend=Math.max(0,(v-.66)/.34);a.setXYZ(i,xx,y-drop*bend*bend+.012*Math.sin(xx*43+v*9)+.005*Math.cos(v*48),z+(Math.min(v,.66)-.33)*d+.045*Math.sin(bend*Math.PI/2));}geo.computeVertexNormals();mesh(g,'Draped_woven_throw',geo,mat,[x,0,0]);
  for(let i=0;i<24;i++){const xx=x-w/2+i*w/23;tube(g,'Throw_fringe',[[xx,y-drop,z+d*.33],[xx+.006,y-drop-.045,z+d*.33+.012]],.0017,mat);}
 }
 function vessel(g:T.Group,x:number,y:number,z:number,r=.065,hh=.20,mat:T.Material=p.stone){
  const profile=[[.3,0],[.75,.02],[1,.25],[.94,.55],[.53,.82],[.49,1],[.40,1],[.40,.85],[.82,.5],[.77,.13],[0,.12]].map(([rr,yy])=>new T.Vector2(rr*r,yy*hh));mesh(g,'Hollow_ceramic_vessel',new T.LatheGeometry(profile,28),mat,[x,y,z]);
 }
 function diningSetting(g:T.Group,x:number,z:number,y:number,angle:number){const q=new T.Group();q.position.set(x,y,z);q.rotation.y=angle;g.add(q);
  cyl(q,'Linen_placemat',0,.004,0,.18,.007,p.fabric);cyl(q,'Porcelain_dinner_plate',0,.013,0,.135,.010,p.white);const rim=mesh(q,'Plate_rim',new T.TorusGeometry(.126,.007,8,28),p.white,[0,.019,0]);rim.rotation.x=Math.PI/2;
  box(q,'Folded_linen_napkin',0,.027,0,.07,.013,.18,scheme===2?p.blue:p.accent,.006);
  for(const s of [-1,1]){box(q,s<0?'Fork_handle':'Knife_handle',s*.162,.014,0,.008,.008,.16,p.metal,.002);if(s<0)for(let j=0;j<4;j++)box(q,'Fork_tine',s*.162+(j-1.5)*.003,.014,-.092,.0015,.003,.035,p.metal);}
  vessel(q,.145,.008,-.175,.029,.092,p.glass);cyl(q,'Water_in_glass',.145,.042,-.175,.021,.06,p.water);
 }
 function smallDecor(g:T.Group,w:number,d:number,y:number){for(let j=0;j<3;j++){const bw=Math.min(w*.25,.28),bd=Math.min(d*.32,.22),yy=y+.018+j*.032;box(g,'Book_pages',-w*.18,yy,d*.05,bw,.021,bd,p.fabric);for(const s of [-1,1])box(g,'Book_cover',-w*.18,yy+s*.012,d*.05,bw+.006,.002,bd+.006,j%2?p.wood:p.dark);}vessel(g,w*.21,y,0);cyl(g,'Candle_tray',w*.32,y+.008,d*.2,.061,.014,p.dark);cyl(g,'Wax_candle',w*.32,y+.04,d*.2,.034,.065,p.fabric);}
 for(const item of assets){const [wx,wz]=world([item.x,item.z]),g=new T.Group();g.name=item.id;g.userData={room:item.room,kind:item.kind,style,variant:item.variant??style};g.position.set(wx,item.y??0,wz);g.rotation.y=(item.angle??0)*Math.PI/180;group.add(g);
  const cross=Math.abs((item.angle??0)%180)===90;const w=(cross?item.d:item.w)*SCALE,d=(cross?item.w:item.d)*SCALE,h=item.h;
  const role=item.role==='blue'?p.blue:item.role==='red'?p.red:p.wood;
  switch(item.kind){
  case 'sofa':{
   if(scheme===1){legs(g,w,d,.16,p.wood,.036);box(g,'Timber_plinth',0,.18,0,w-.15,.08,d-.1,p.wood,.025);box(g,'Boucle_seat',0,.4,.02,w-.18,.34,d-.14,p.fabric,.13);box(g,'Low_continuous_back',0,.66,-d*.34,w-.22,.39,.24,p.fabric,.11);[-1,1].forEach(s=>{const arm=ball(g,'Rolled_arm',s*(w/2-.12),.5,0,.29,.43,d-.04,p.fabric);arm.rotation.z=s*.1});for(let j=0;j<2;j++)box(g,'Dark_cushion',(-.5+j)*.62,.64,-d*.18,.44,.39,.13,p.dark,.08);}
   else if(scheme===2){box(g,'Low_frame',0,.10,0,w-.1,.15,d-.05,p.dark,.04);const count=3;for(let j=0;j<count;j++){const x=-w/2+(j+.5)*w/count;box(g,'Quilted_seat_'+j,x,.34,.06,w/count-.025,.34,d-.1,p.fabric,.10);box(g,'Tufted_back_'+j,x,.63,-d*.34,w/count-.03,.4,.24,p.fabric,.10);for(const yy of [.55,.72])ball(g,'Tuft_button',x,yy,-d*.205,.024,.024,.015,p.fabric);}[-1,1].forEach(s=>box(g,'Square_soft_arm',s*(w/2-.11),.44,0,.22,.51,d,p.fabric,.09));}
   else{const count=3;for(let j=0;j<count;j++){const x=-w/2+(j+.5)*w/count;box(g,'Module_base_'+j,x,.22,0,w/count-.028,.29,d,p.fabric,.08);box(g,'Module_seat_'+j,x,.40,.06,w/count-.04,.18,d-.08,p.fabric,.085);box(g,'Floating_back_'+j,x,.62,-d*.35,w/count-.04,.29,.23,p.fabric,.10);}box(g,'Single_low_arm',-w/2+.1,.48,0,.20,.3,d,p.fabric,.075);for(const x of [-w*.22,w*.20])box(g,'Linen_cushion',x,.60,-d*.15,.42,.32,.14,p.wall,.07);}
   pillow(g,-w*.30,.69,-d*.15,.42,.40,p.accent,-.13);pillow(g,w*.28,.63,-d*.08,.46,.30,scheme===2?p.yellow:p.fabric,.14);
   drape(g,w*.22,.575,d*.12,w*.22,d*.9,.38,scheme===2?p.blue:scheme===3?p.fabric:p.accent);
   break;}
  case 'lounge':case 'office-chair':{
   const variant=item.variant??(scheme===1?'cantilever':scheme===2?'tube':'sling');
   if(variant==='bubble'){for(const x of [-w*.24,w*.24]){ball(g,'Paired_bubble_seat',x,.30,.07,w*.53,.48,d*.92);ball(g,'Paired_bubble_back',x,.66,-d*.29,w*.51,.44,.25);}cyl(g,'Hidden_base',0,.08,0,w*.23,.1,p.dark);}
   else if(variant==='swivel'){cyl(g,'Swivel_disc',0,.07,0,w*.29,.065,p.dark);cyl(g,'Swivel_stem',0,.18,0,.075,.24,p.dark);ball(g,'Sculptural_shell',0,.43,-.015,w,.56,d,p.accent);box(g,'Seat_inset',0,.49,.13,w*.64,.12,d*.58,p.accent,.06);ball(g,'Curved_back',0,.66,-d*.22,w*.83,.30,.29,p.accent);}
   else{const seatMat=scheme===2?p.accent:item.kind==='office-chair'?p.leather:p.fabric;
    for(const side of [-1,1])tube(g,'Cantilever_frame',[[side*w*.4,.08,d*.35],[side*w*.4,.08,-d*.34],[side*w*.4,.44,-d*.30],[side*w*.4,.7,-d*.40]],.019,p.metal);
    box(g,'Upholstered_seat',0,.40,.02,w*.78,.15,d*.78,seatMat,.06);const b=box(g,'Reclined_back',0,.68,-d*.35,w*.8,.32,.13,seatMat,.055);b.rotation.x=-.15;
    for(const side of [-1,1])tube(g,'Armrest',[[side*w*.43,.41,d*.12],[side*w*.43,.59,d*.18],[side*w*.43,.59,-d*.31]],.016,p.metal);
    if(item.kind==='office-chair'){cyl(g,'Office_stem',0,.17,0,.045,.28,p.metal);for(let j=0;j<5;j++){const t=j*Math.PI*2/5;tube(g,'Office_star',[[0,.10,0],[Math.sin(t)*w*.39,.06,Math.cos(t)*d*.39]],.018,p.metal);ball(g,'Caster',Math.sin(t)*w*.39,.045,Math.cos(t)*d*.39,.07,.08,.07,p.dark)}}
   }break;}
  case 'ottoman':box(g,'Modular_ottoman_base',0,.15,0,w,.24,d,p.fabric,.085);box(g,'Modular_ottoman_top',0,.32,0,w-.015,.14,d-.015,p.fabric,.07);break;
  case 'coffee':{
   if(scheme===1){box(g,'Travertine_top',0,h-.035,0,w,.075,d,p.stone,.035);for(const x of [-w*.25,w*.25]){const b=box(g,'Splayed_wood_wing',x,.16,0,.12,.32,d*.75,p.wood,.035);b.rotation.z=x>0?-.24:.24}smallDecor(g,w,d,h);}
   if(scheme===2){for(const y of [.13,h]){box(g,'Glass_shelf',0,y,0,w,.018,d,p.glass,.003);for(const x of [-w*.49,w*.49])tube(g,'Chrome_long_edge',[[x,y,-d/2],[x,y,d/2]],.012)}for(const x of [-w*.48,w*.48])for(const z of [-d*.47,d*.47]){tube(g,'Chrome_upright',[[x,.08,z],[x,h+.05,z]],.014);ball(g,'Trolley_wheel',x,.048,z,.065,.085,.055,p.dark)}smallDecor(g,w,d,h+.02);smallDecor(g,w,d,.15);}
   if(scheme===3){for(let j=0;j<3;j++){const r=w*(j===0?.25:j===1?.23:.17),x=(j===0?-.24:j===1?.16:.36)*w,z=(j===0?.1:j===1?-.21:.20)*d,hh=h+j*.075;cyl(g,'Nested_drum_'+j,x,hh/2,z,r,hh,j===1?p.stone:p.dark);cyl(g,'Inset_tray_'+j,x,hh+.012,z,r*.94,.025,j===1?p.stone:p.dark)}smallDecor(g,w*.65,d,h+.03);}
   break;}
  case 'side-table':case 'outdoor-table':{
   if(scheme===1){cyl(g,'Round_top',0,h-.026,0,w/2,.052,p.wood);legs(g,w,d,h-.052,p.wood,.036)}else if(scheme===2){cyl(g,'Coloured_disc',0,h-.022,0,w/2,.044,p.yellow);cyl(g,'Tubular_pedestal',0,h/2,0,w*.13,h-.04,p.blue);cyl(g,'Foot',0,.02,0,w*.28,.04,p.blue)}else{cyl(g,'Sculpted_top',0,h-.03,0,w*.48,.06,p.dark);for(const x of [-w*.18,w*.18])box(g,'Twin_block',x,h*.45,0,w*.20,h*.9,d*.54,p.dark,.015)}break;}
  case 'stool':{
   // Actual circular holes in the six shell plates, not painted dots.
   const side=Math.min(w,d);for(let face=0;face<4;face++){const sh=new T.Shape();sh.moveTo(-side/2,-h/2);sh.lineTo(side/2,-h/2);sh.lineTo(side/2,h/2);sh.lineTo(-side/2,h/2);sh.closePath();for(const x of [-side*.24,side*.24])for(const y of [-h*.22,h*.22]){const hole=new T.Path();hole.absarc(x,y,side*.13,0,Math.PI*2,true);sh.holes.push(hole)}const geo=new T.ExtrudeGeometry(sh,{depth:.045,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:1,steps:1,curveSegments:10});const m=mesh(g,'Perforated_shell_'+face,geo,p.yellow,[0,h/2,0]);m.rotation.y=face*Math.PI/2;m.position.x=Math.sin(face*Math.PI/2)*side/2;m.position.z=Math.cos(face*Math.PI/2)*side/2;}box(g,'Seat_top',0,h-.015,0,w,.045,d,p.yellow,.012);break;}
  case 'dining-table':{
   if(scheme===1){cyl(g,'Round_walnut_top',0,h-.035,0,w/2,.07,p.wood);cyl(g,'Fluted_base',0,(h-.07)/2,0,w*.19,h-.07,p.dark);for(let j=0;j<24;j++){const q=j*Math.PI*2/24;cyl(g,'Flute',Math.sin(q)*w*.19,(h-.07)/2,Math.cos(q)*w*.19,.015,h-.07,p.wood)}}
   else if(scheme===2){box(g,'Blue_table_top',0,h-.025,0,w,.05,d,p.blue,.012);legs(g,w,d,h-.05,p.blue,.045)}
   else{const m=cyl(g,'Oval_stone_top',0,h-.035,0,w/2,.07,p.dark);m.scale.z=d/w;cyl(g,'Conical_pedestal',0,(h-.07)/2,0,w*.31,h-.07,p.dark,w*.14)}
   if(scheme===1){for(let j=0;j<4;j++){const t=j*Math.PI/2;diningSetting(g,Math.sin(t)*(w*.5-.22),Math.cos(t)*(w*.5-.22),h,t);}}
   else if(d>w)for(const s of [-1,1])for(const z of [-d*.30,0,d*.30])diningSetting(g,s*(w/2-.21),z,h,s*Math.PI/2);
   else for(const s of [-1,1])for(const x of [-w*.24,w*.24])diningSetting(g,x,s*(d/2-.21),h,s<0?Math.PI:0);
   vessel(g,0,h,0,.065,.26,scheme===2?p.red:p.stone);for(let j=0;j<7;j++){const t=j*2.4;tube(g,'Table_foliage_stem',[[0,h+.17,0],[Math.sin(t)*.10,h+.39,Math.cos(t)*.10]],.002,p.green);ball(g,'Table_foliage_leaf',Math.sin(t)*.10,h+.39,Math.cos(t)*.10,.035,.06,.012,p.green);}break;}
  case 'dining-chair':{
   const v=item.variant??'upholstered';
   if(v==='zigzag'){const pts:[[number,number],[number,number]][]=[[[0,.015],[.22,.015]],[[.22,.015],[-.12,.43]],[[-.12,.43],[.23,.43]],[[-.12,.43],[-.20,.8]]];for(const [[z1,y1],[z2,y2]] of pts){const dd=Math.hypot(z2-z1,y2-y1),b=box(g,'Folded_plate',0,(y1+y2)/2,(z1+z2)/2,w*.92,.035,dd,p.yellow,.009);b.rotation.x=-Math.atan2(y2-y1,z2-z1)}}
   else if(v==='cantilever'){for(const x of [-w*.44,w*.44])tube(g,'Bent_steel',[[x,.04,.20],[x,.04,-.18],[x,.43,-.17],[x,.79,-.2]],.016);box(g,'Cane_seat',0,.43,0,w,.045,d,p.wood,.012);box(g,'Cane_back',0,.68,-d*.45,w*.88,.29,.035,p.wood,.02)}
   else if(v==='keyhole'){legs(g,w,d,.43,p.wood,.021);cyl(g,'Round_seat',0,.44,0,w*.50,.06,p.fabric);box(g,'Wood_back_stem',0,.62,-d*.34,.13,.37,.06,p.wood,.025);const ring=mesh(g,'Keyhole_back',new T.TorusGeometry(w*.25,.048,8,24),p.wood,[0,.77,-d*.36]);ring.scale.y=.87;}
   else if(v==='sculpted'){tube(g,'Sculpted_S_base',[[0,.025,.16],[0,.12,-.13],[0,.39,-.14],[0,.44,.12]],w*.24,p.dark);box(g,'Sculpted_seat',0,.45,0,w,.04,d,p.dark,.015);box(g,'Sculpted_back',0,.66,-d*.38,w*.94,.38,.065,p.dark,.03)}
   else{legs(g,w,d,.43,scheme===2?p.red:p.dark,.023);box(g,'Seat_pad',0,.43,0,w,.10,d,scheme===2?p.red:p.fabric,.04);const b=box(g,'Curved_back',0,.68,-d*.40,w,.24,.065,scheme===2?p.red:p.fabric,.03);b.rotation.x=-.09;if(scheme===3)for(const x of [-w*.46,w*.46])tube(g,'Open_arm',[[x,.35,0],[x,.65,.07],[x,.66,-d*.41]],.018,p.dark);if(v==='cutout')for(const x of [-w*.24,w*.24])ball(g,'Back_recess',x,.70,-d*.33,.09,.09,.014,p.dark)}break;}
  case 'bed':{
   if(scheme===2){for(const z of [-d*.48,d*.48])tube(g,'Continuous_tube_hoop',[[-w/2,.11,z],[-w/2,z<0?h+.34:.36,z],[-w*.35,z<0?h+.48:.39,z],[w*.35,z<0?h+.48:.39,z],[w/2,z<0?h+.34:.36,z],[w/2,.11,z]],.022,p.metal);box(g,'Oak_bed_rail',0,.29,0,w,.12,d,p.wood,.025);box(g,'Ochre_headboard',0,.70,-d*.47,w-.08,.53,.085,p.yellow,.04)}
   else{box(g,'Upholstered_platform',0,.20,0,w+.07,.34,d+.04,p.leather,.09);box(g,'Padded_headboard',0,.65,-d*.47,w+(scheme===3?.22:.08),.99,.14,scheme===1?p.dark:p.fabric,.075);if(scheme===3)for(const x of [-w*.53,w*.53])box(g,'Headboard_wing',x,.63,-d*.40,.075,.94,.30,p.fabric,.035)}
   box(g,'Mattress',0,.43,.015,w-.05,.25,d-.10,p.fabric,.08);box(g,'Duvet',0,.59,d*.17,w+.025,.10,d*.59,scheme===2?p.blue:scheme===3?p.dark:p.stone,.042);for(const x of [-w*.25,w*.25]){const pil=box(g,'Pillow',x,.60,-d*.31,w*.42,.16,.43,p.fabric,.073);pil.rotation.x=.12;pillow(g,x,.72,-d*.39,w*.40,.28,p.fabric,x*.1);}pillow(g,0,.69,-d*.20,w*.43,.23,p.accent,.03);drape(g,0,.659,d*.30,w*.98,d*.38,.35,scheme===2?p.fabric:p.accent);break;}
  case 'desk':box(g,'Desk_top',0,h-.03,0,w,.06,d,scheme===2?p.blue:scheme===3?p.stone:p.dark,.013);if(scheme===1||scheme===2)legs(g,w,d,h-.06,p.metal,.025);else for(const x of [-w*.40,w*.40])box(g,'Panel_leg',x,h/2,0,.07,h-.03,d*.85,p.wood);box(g,'Monitor',0,h+.25,-d*.24,.49,.30,.028,p.dark,.012);box(g,'Monitor_foot',0,h+.065,-d*.24,.035,.13,.03,p.metal);box(g,'Keyboard',0,h+.018,d*.16,.35,.019,.13,p.dark,.009);smallDecor(g,w,d,h);break;
  case 'nightstand':case 'sideboard':case 'console':case 'entry-cabinet':case 'wardrobe':case 'counter':case 'vanity':case 'upper-cabinet':case 'fridge':{
   const k=item.kind,isCounter=['counter','vanity'].includes(k),tall=['wardrobe','entry-cabinet','fridge'].includes(k),mat=scheme===2&&['sideboard','nightstand'].includes(k)?p.red:scheme===3?(isCounter?p.dark:p.wall):p.wood;
   const y0=k==='vanity'?.18:scheme===1&&!tall?.1:.055;
   box(g,'Cabinet_carcass',0,(h+y0)/2,0,w,h-y0,d,mat,scheme===3?.012:0);
   if(!tall&&scheme!==3)legs(g,w,d,y0,p.metal,.016);
   const n=Math.max(1,Math.round(w/.45));for(let j=0;j<n;j++){const x=-w/2+(j+.5)*w/n;box(g,'Joinery_front_'+j,x,h*.51,d/2+.006,w/n-.012,h-y0-.035,.018,mat,scheme===3?.008:0);if(scheme===2)cyl(g,'Round_pull',x,h*.57,d/2+.032,.025,.029,p.red).rotation.x=Math.PI/2;else if(scheme===1)box(g,'Brass_pull',x,h*.55,d/2+.027,.072,.014,.035,p.metal,.006);}
   if(isCounter||k==='nightstand')box(g,'Countertop',0,h+.016,0,w+.022,.032,d+.018,p.stone,.01);
   if(k==='vanity'){cyl(g,'Soap_dispenser',-w*.36,h+.11,0,.03,.18,p.stone);tube(g,'Soap_pump',[[-w*.36,h+.20,0],[-w*.36+.04,h+.20,0]],.004,p.metal);for(let j=0;j<2;j++)box(g,'Folded_towel',w*.34,h+.06+j*.045,0,w*.18,.04,d*.52,p.fabric,.014);}
   if(k==='counter'&&w>.8){box(g,'Chopping_board',w*.25,h+.043,0,.26,.023,.19,p.wood,.025);vessel(g,-w*.32,h+.032,0,.046,.17,p.white);for(let j=0;j<3;j++)cyl(g,'Utensil_handle',-w*.32+j*.009,h+.22,0,.003,.16,p.wood);}
   if(k==='sideboard'||k==='console')smallDecor(g,w,d,h+.01);
   if(k==='fridge'){box(g,'Appliance_front',0,h/2,d/2+.02,w-.025,h-.03,.026,p.metal,.009);box(g,'Appliance_seam',0,h*.34,d/2+.038,w-.03,.006,.006,p.dark);box(g,'Handle',w*.36,h*.62,d/2+.058,.015,.37,.035,p.dark,.006)}
   break;}
  case 'shelf':{
   const levels=scheme===1?5:scheme===2?5:6,mat=scheme===2?p.metal:scheme===3?p.dark:p.wood;
   for(const x of [-w/2,w/2])box(g,'Shelf_upright',x,h/2,0,scheme===2?.018:.033,h,d,mat);
   for(let j=0;j<=levels;j++)box(g,'Shelf_horizontal',0,j*h/levels+.02,0,w,.026,d,mat);
   if(scheme!==2)box(g,'Shelf_back',0,h/2,-d/2,w,h,.018,mat);
   for(let j=0;j<levels;j++){const yy=j*h/levels+.045;if(scheme===2&&j%2===0)box(g,'Colour_storage',w*.23,yy+.15,0,w*.40,.29,d*.92,j===0?p.yellow:j===2?p.blue:p.red);else{for(let k=0;k<4;k++)box(g,'Books',-w*.35+k*.055,yy+.12,0,.035,.24,d*.72,k%2?p.wall:p.wood);cyl(g,'Display_vessel',w*.2,yy+.10,0,.045,.20,p.stone,.025)}}break;}
  case 'sink':box(g,'Basin_bottom',0,.012,0,w,.025,d,p.white,.01);for(const x of [-w/2,w/2])box(g,'Basin_rim',x,.06,0,.025,.12,d,p.white,.009);for(const z of [-d/2,d/2])box(g,'Basin_rim',0,.06,z,w,.12,.025,p.white,.009);tube(g,'Tap',[[w*.31,.08,-d*.44],[w*.31,.27,-d*.44],[w*.12,.29,-d*.26],[w*.12,.21,-d*.20]],.012,p.metal);break;
  case 'head-panel':case 'bath-panel':case 'backsplash':box(g,'Finish_panel',0,h/2,0,w,h,d,item.kind==='head-panel'?p.wood:item.kind==='bath-panel'?p.stone:scheme===2?p.blue:p.stone);break;
  case 'mirror':box(g,'Mirror_frame',0,h/2,0,w+.025,h+.035,d+.025,p.metal,.005);box(g,'Reflective_plane',0,h/2,d/2+.015,w,h,.012,p.mirror);break;
  case 'screen':box(g,'Screen_frame',0,h/2,0,w,h,d,p.dark,.008);break;
  case 'rug':{
   const mat=scheme===1?p.fabric:scheme===2?p.wall:p.stone;box(g,'Woven_base',0,.012,0,w,.013,d,mat,.004);
   if(scheme===1){for(const z of [-d*.40,d*.40])box(g,'Linear_inlay',-w*.15,.022,z,w*.64,.002,.055,p.dark);box(g,'Offset_inlay',w*.33,.022,0,.06,.002,d*.5,p.dark)}
   else if(scheme===2){const colors=[p.blue,p.wood,p.fabric,p.red,p.yellow,p.dark];for(let row=0;row<3;row++)for(let col=0;col<4;col++){if((row+col)%3===1)continue;box(g,'Geometric_woven_block',-w/2+(col+.5)*w/4,.022,-d/2+(row+.5)*d/3,w/4-.005,.002,d/3-.005,colors[(row*4+col)%6])}}
   break;}
  case 'curtain':{
   tube(g,'Curtain_track',[[-w/2,h+.018,0],[w/2,h+.018,0]],.009,p.metal);
   // Panels park at both ends; the glazed opening remains visible.
   const panel=w*.16;for(const side of [-1,1]){const geo=new T.PlaneGeometry(panel,h,48,18),a=geo.attributes.position;for(let j=0;j<a.count;j++){const x=a.getX(j),y=a.getY(j),fall=(h/2-y)/h;a.setXYZ(j,x*(1+fall*.08),y,Math.sin((x/panel+.5)*Math.PI*16)*(.024+fall*.018)+.004*Math.sin(y*7));}geo.computeVertexNormals();mesh(g,'Continuous_pleated_drapery',geo,p.fabric,[side*(w/2-panel/2),h/2,0]);for(let j=0;j<8;j++){const x=side*(w/2-panel/2)+(j-3.5)*panel/8;const ring=mesh(g,'Curtain_ring',new T.TorusGeometry(.015,.002,6,12),p.metal,[x,h+.008,0]);ring.rotation.y=Math.PI/2;}}break;}
  case 'pendant':case 'table-lamp':case 'floor-lamp':case 'wall-lamp':{
   const floor=item.kind==='floor-lamp',table=item.kind==='table-lamp',wall=item.kind==='wall-lamp';
   if(floor){cyl(g,'Lamp_base',0,.025,0,w*.4,.05,p.dark);if(scheme===1)tube(g,'Arched_stem',[[0,.025,0],[0,h*.8,0],[w*.2,h,.04],[w*.48,h*.85,.10]],.011,p.metal);else tube(g,'Lamp_stem',[[0,.04,0],[0,h*.91,0],[w*.30,h*.99,0]],.01,p.dark);}
   if(table){cyl(g,'Lamp_foot',0,.02,0,w*.33,.04,p.dark);cyl(g,'Lamp_stem',0,h*.30,0,.022,h*.55,p.metal)}
   if(!floor&&!table&&!wall)tube(g,'Suspension',[[0,h,0],[0,Math.max(.15,2.75-(item.y??0)),0]],.003,p.dark);
   const yy=floor?h*.86:table?h*.75:wall?h*.5:h*.45,rad=floor?w*.60:table?w*.5:w*.42;
   if(scheme===1){if(table)ball(g,'Opal_globe',0,yy,0,rad*2,rad*2,rad*2,p.light);else{const shadeHeight=floor?.30:table?.20:h*.75;ball(g,'Paper_lantern',0,yy,0,rad*2,shadeHeight,rad*2,p.fabric);for(let j=0;j<10;j++){const t=j*Math.PI/5;tube(g,'Paper_rib',[[Math.sin(t)*rad*.3,yy-shadeHeight*.48,Math.cos(t)*rad*.3],[Math.sin(t)*rad,yy,Math.cos(t)*rad],[Math.sin(t)*rad*.3,yy+shadeHeight*.48,Math.cos(t)*rad*.3]],.003,p.stone)}ball(g,'Light_core',0,yy-.05,0,rad,rad,rad,p.light);}}
   else if(scheme===2){if(floor){for(let j=0;j<4;j++){box(g,'Stacked_lantern',0,.24+j*.30,0,w*.65,.21,w*.65,[p.yellow,p.wall,p.red,p.blue][j],.015);ball(g,'Opal_core',0,.24+j*.30,w*.33,.06,.06,.03,p.light)}}else{ball(g,'Transparent_globe',0,yy,0,rad*2,rad*2,rad*2,p.glass);[.7,.5,.3].forEach((r,j)=>cyl(g,'Layered_disc',0,yy+.09-j*.10,0,rad*r,.025,j===1?p.red:p.metal));ball(g,'Lamp_core',0,yy-.08,0,.085,.085,.085,p.light)}}
   else if(item.room==='dining'){box(g,'Linear_pendant',0,yy,0,w,.035,.038,p.dark,.01);box(g,'Linear_diffuser',0,yy-.02,0,w-.02,.008,.025,p.light);}
   else if(floor||table||wall){ball(g,'Smoke_glass_shade',0,yy,0,rad*1.8,rad*1.9,rad*1.8,p.glass);ball(g,'Opal_core',0,yy-.025,0,rad,rad,rad,p.light)}
   else{for(let j=0;j<3;j++){const x=(j-1)*w*.3;tube(g,'Arched_pendant',[[0,h,0],[x,h*.96,0],[x,yy,0]],.008,p.dark);ball(g,'Opal_drop',x,yy,0,w*.24,w*.24,w*.24,p.light)}}
   const lg=new T.Group();lg.position.set(0,yy-(scheme===1?.24:.12),0);g.add(lg);if(['dining','kitchen','living','master','bed1','bed2','bath','ensuite','entry','wardrobe'].includes(item.room)&&item.kind==='pendant')lampLight(lg,Math.min(w,.8),scheme===2?65:85);break;}
  case 'art':{
   box(g,'Art_frame',0,h/2,0,w+.04,h+.04,.025,p.wood);box(g,'Canvas',0,h/2,.02,w,h,.012,p.wall);if(scheme===2){const colors=[p.blue,p.red,p.yellow,p.dark];for(let j=0;j<4;j++)box(g,'Geometric_composition',(-.25+(j%2)*.5)*w,h*(j<2?.7:.28),.03,w*.40,h*.38,.006,colors[j]);}
   else{box(g,'Abstract_field',-w*.20,h*.58,.032,w*.25,h*.69,.006,scheme===1?p.wood:p.dark);const m=cyl(g,'Abstract_circle',w*.15,h*.37,.035,w*.24,.006,scheme===1?p.stone:p.fabric);m.rotation.x=Math.PI/2;}break;}
  case 'vase':cyl(g,'Ceramic_vase',0,h*.36,0,w*.40,h*.72,p.stone,w*.22);for(let j=0;j<5;j++){const t=j*1.9;tube(g,'Branch',[[0,h*.55,0],[Math.sin(t)*w*.4,h*1.3,Math.cos(t)*d*.4],[Math.sin(t)*w*.7,h*1.8,Math.cos(t)*d*.7]],.003,p.wood);ball(g,'Leaf',Math.sin(t)*w*.6,h*1.6,Math.cos(t)*d*.6,.04,.07,.02,p.green)}break;
  case 'plant':{
   cyl(g,'Planter',0,.18,0,w*.47,.36,scheme===2?p.blue:p.stone,w*.40);cyl(g,'Soil',0,.365,0,w*.37,.012,p.dark);tube(g,'Trunk',[[0,.3,0],[.02,h*.67,0],[-.01,h*.90,0]],.012,p.wood);
   for(let j=0;j<18;j++){const t=j*2.399,yy=.43+(j%6)/6*(h-.43),spread=w*(.42+(j%3)*.13),xx=Math.sin(t)*spread,zz=Math.cos(t)*spread;tube(g,'Branch',[[0,yy*.9,0],[xx*.7,yy+.07,zz*.7]],.004,p.wood);const leaf=ball(g,'Leaf',xx,yy+.10,zz,scheme===2?.16:.10,scheme===2?.34:.22,.022,p.green);leaf.rotation.set(Math.cos(t)*.7,t,Math.sin(t)*.7);}break;}
  case 'planter':box(g,'Planter_volume',0,h/2,0,w,h,d,p.outdoor);box(g,'Soil',0,h-.02,0,w-.04,.018,d-.04,p.dark);break;
  case 'outdoor-seat':{
   if(scheme===1){legs(g,w,d,.31,p.wood,.028);for(let j=0;j<7;j++)box(g,'Teak_slat',0,.34,-d/2+(j+.5)*d/7,w,.035,d/9,p.wood,.008);box(g,'Outdoor_cushion',0,.43,.03,w-.03,.14,d-.04,p.fabric,.05);box(g,'Teak_back',0,.62,-d*.4,w,.30,.045,p.wood,.015)}
   else if(scheme===2){for(const x of [-w*.44,w*.44])tube(g,'Coloured_tube',[[x,.05,d*.35],[x,.45,d*.35],[x,.45,-d*.36],[x,.72,-d*.40]],.018,p.red);for(let j=0;j<6;j++)box(g,'Slatted_seat',-w/2+(j+.5)*w/6,.44,0,w/8,.026,d,p.blue,.009);box(g,'Back_panel',0,.66,-d*.40,w,.21,.03,p.blue,.01)}
   else{box(g,'Outdoor_plinth',0,.16,0,w,.26,d,p.stone,.045);box(g,'Outdoor_pad',0,.38,.02,w-.035,.20,d-.04,p.fabric,.085);box(g,'Low_back',0,.61,-d*.39,w,.27,.15,p.fabric,.06)}break;}
  case 'treadmill':box(g,'Running_frame',0,.12,0,w,.22,d,p.dark,.065);box(g,'Running_belt',-w*.08,.24,0,w*.72,.025,d*.78,p.dark);for(const z of [-d*.41,d*.41])tube(g,'Upright_handrail',[[w*.31,.18,z],[w*.31,1.02,z],[w*.14,1.02,z]],.027,p.metal);const panel=box(g,'Fitness_console',w*.31,1.05,0,.24,.07,d*.8,p.dark,.02);panel.rotation.z=.18;box(g,'Console_display',w*.28,1.093,0,.14,.008,d*.35,p.blue);break;
  case 'machine':box(g,'Strength_machine_base',0,.06,0,w,.12,d,p.dark,.025);tube(g,'Strength_frame',[[w*.32,.06,0],[w*.32,h,0],[-w*.2,h,0]],.035,p.metal);box(g,'Seat_pad',0,.52,0,w*.25,.12,d*.53,p.dark,.045);box(g,'Back_pad',w*.12,.89,0,.10,.59,d*.45,p.dark,.04);for(const z of [-d*.4,d*.4]){tube(g,'Training_handle',[[w*.23,1.1,z],[0,1.1,z]],.026,p.metal);cyl(g,'Weight_disc',w*.27,.33,z,.14,.07,p.dark).rotation.x=Math.PI/2}break;
  case 'gym-rack':box(g,'Dumbbell_rack',0,.35,0,w,.065,d,p.dark);legs(g,w,d,.34,p.metal,.02);for(let j=0;j<3;j++){const x=-w*.3+j*w*.3;tube(g,'Dumbbell_bar',[[x,.44,-d*.3],[x,.44,d*.3]],.012,p.metal);for(const z of [-d*.25,d*.25]){const m=cyl(g,'Dumbbell_weight',x,.44,z,.06,.05,p.dark);m.rotation.x=Math.PI/2}}break;
  case 'yoga-mat':box(g,'Exercise_mat',0,.009,0,w,.018,d,scheme===2?p.blue:scheme===1?p.accent:p.dark,.007);break;
  case 'water':{const geo=new T.PlaneGeometry(w,d,36,18);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;for(let j=0;j<pos.count;j++){const x=pos.getX(j),z=pos.getZ(j);pos.setY(j,.004*Math.sin(x*16+z*8)+.003*Math.cos(z*24));}geo.computeVertexNormals();mesh(g,'Still_pool_water',geo,p.water,[0,0,0]);break;}
  case 'pool-step':box(g,'Pool_access_step',0,.06,0,w,.12,d,p.pool);break;
  case 'bench':box(g,'Entry_bench_seat',0,h-.06,0,w,.12,d,p.fabric,.05);legs(g,w,d,h-.12,p.wood,.03);break;
  case 'hood':box(g,'Extractor_hood',0,h/2,0,w,h,d,p.metal,.02);box(g,'Hood_light',0,.008,0,w*.8,.005,d*.65,p.light);break;
  }
  const elevated=(item.y??0)>.7;
  if(item.obstacle!==false&&!elevated&&!['rug','water','pool-step','art','curtain','screen','mirror','head-panel','bath-panel','backsplash','pendant','table-lamp','wall-lamp','vase','sink','yoga-mat'].includes(item.kind))colliders.push({x:item.x,z:item.z,w:item.w,d:item.d,id:item.id});
 }
 // Room-specific finish sheets sit above the shared structural floor. No boundary is moved.
 const finishes=new T.Group();finishes.name='Replaceable_surface_finishes';group.add(finishes);
 for(const room of rooms.filter(r=>!['pool','stairs','lift','lobby'].includes(r.id))){const shape=new T.Shape();room.boundary.forEach((pt,j)=>{const [x,z]=world(pt);if(j===0)shape.moveTo(x,-z);else shape.lineTo(x,-z)});shape.closePath();const geo=new T.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);const mat=room.kind==='outdoor'?p.outdoor:['bath','ensuite','kitchen','entry','store'].includes(room.id)?p.stone:p.ground;mesh(finishes,room.id+'_finish',geo,mat,[0,.004,0]);}
 group.userData.assetManifest=assets;batchDesign(group);group.updateMatrixWorld(true);return {group,palette:p,assets,colliders,lights};
}

