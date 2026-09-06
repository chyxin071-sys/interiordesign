import * as T from 'three';
import type {StyleID} from './design-data';
export type Palette=ReturnType<typeof makePalette>;
const noise=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
function texture(type:'wood'|'stone'|'fabric'|'tile',base:string){
 const size=512,data=new Uint8Array(size*size*4),color=new T.Color(base);color.convertLinearToSRGB();
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const n=noise(x,y);let v=1;
  if(type==='wood'){const grain=Math.sin(x*.26+Math.sin(y*.016)*1.6+Math.sin(x*.025)*3);v=.91+.055*grain+.05*n+.025*Math.sin(x*1.2+y*.008);}
  if(type==='stone'){const veins=Math.sin(x*.021+y*.017+Math.sin(y*.010)*2+Math.sin(x*.008)*3);v=.94+.04*n-.13*Math.exp(-Math.pow(veins/.065,2));}
  if(type==='fabric')v=.91+.035*(x%2)+.025*(y%2)+n*.025;
  if(type==='tile')v=(x%128<1||y%128<1)?.78:.96+n*.025;
  const k=(y*size+x)*4;data[k]=Math.min(255,color.r*v*255);data[k+1]=Math.min(255,color.g*v*255);data[k+2]=Math.min(255,color.b*v*255);data[k+3]=255;
 }
 const tex=new T.DataTexture(data,size,size,T.RGBAFormat);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;tex.name='Procedural_'+type;return tex;
}
export function makePalette(style:StyleID){
 const s=style==='style02'?2:style==='style03'?3:1;
 const m=(name:string,color:string,roughness=.65,metalness=0,type?:Parameters<typeof texture>[0])=>{const mat=new T.MeshPhysicalMaterial({color:type?'#ffffff':color,roughness,metalness});mat.name=`${style}_${name}`;mat.userData.baseColor=color;if(type){mat.map=texture(type,color);mat.bumpMap=mat.map;mat.bumpScale=type==='fabric'?.0006:type==='wood'?.0012:.0004;if(type==='fabric'){mat.sheen=.35;mat.sheenColor.set(color);mat.sheenRoughness=.8;mat.side=T.DoubleSide;}}return mat};
 const wood=m('wood',s===1?'#876043':s===2?'#ae8961':'#605247',.52,0,'wood');
 const stone=m('stone',s===1?'#d8cbb3':s===2?'#d5d5c9':'#c8c4bd',.37,0,'stone');
 const fabric=m('fabric',s===1?'#ded3bf':s===2?'#ddd7c7':'#c4bdb1',.95,0,'fabric');
 const accent=m('accent',s===1?'#6d7454':s===2?'#173d70':'#76282f',.83,0,'fabric');
 const metal=m('metal',s===1?'#423c30':s===2?'#cbd2d4':'#242624',s===2?.17:.3,s===2?.95:.8);
 const dark=m('dark',s===1?'#292a27':s===2?'#242629':'#222422',.48);const wall=m('wall',s===1?'#e0d9c9':s===2?'#e2e2d9':'#d6d2ca',.92);
 const red=m('red',s===3?'#722832':'#b83127',.36),blue=m('blue','#184877',.35),yellow=m('yellow','#edc431',.42);
 const white=m('ceramic','#e2e3dc',.25),leather=m('leather',s===1?'#2e302b':s===2?'#b6902a':'#b6afa3',.54);
 const ground=m('floor',s===1?'#a07d5b':s===2?'#c7bfaa':'#c7c5bf',s===3?.4:.72,0,s===1?'wood':s===2?'tile':'stone');
 const outdoor=m('terrace',s===1?'#b0a591':s===2?'#bdc0b7':'#b8b6ad',.87,0,'tile');
 const pool=m('pool_tile',s===1?'#78958a':s===2?'#6b9fa5':'#8fa6a0',.31,0,'tile');
 const glass=new T.MeshPhysicalMaterial({name:`${style}_glass`,color:'#d6e3e0',metalness:0,roughness:.045,transmission:.93,thickness:.035,ior:1.45,transparent:true,opacity:.56,side:T.DoubleSide});
 const mirror=new T.MeshStandardMaterial({name:`${style}_mirror`,color:'#d3dbd9',metalness:1,roughness:.035});
 const light=new T.MeshStandardMaterial({name:`${style}_diffuser`,color:'#f0e7cd',emissive:'#ffd795',emissiveIntensity:2.3,roughness:.7});
 const green=m('plant','#506545',.85);const water=new T.MeshPhysicalMaterial({name:`${style}_water`,color:s===2?'#73a8b0':'#82aaa0',roughness:.055,metalness:.05,transmission:.45,thickness:.4,ior:1.333,transparent:true,opacity:.75,side:T.DoubleSide});
 return {wood,stone,fabric,accent,metal,dark,wall,red,blue,yellow,white,leather,ground,outdoor,pool,glass,mirror,light,green,water};
}
