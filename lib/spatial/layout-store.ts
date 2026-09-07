import * as T from 'three';
export const LAYOUT_KEY='residence-layout-v1';
export const MODEL_ID='residence-1254-scale014-v1';
export const STYLE_IDS=['base','style01','style02','style03'] as const;
export type Pose={id:string;position:[number,number,number];rotation:number};
export type LayoutFile={format:'residence-layout';version:1;model:string;savedAt:string;styles:Partial<Record<typeof STYLE_IDS[number],Pose[]>>};
export function assets(root:T.Group){const result:T.Group[]=[];root.traverse(o=>{if(o instanceof T.Group&&o.userData.kind)result.push(o)});return result;}
// Normalize once before taking any snapshots. Preserve every child world transform.
export function prepareAssets(root:T.Group){root.updateMatrixWorld(true);for(const o of assets(root)){if(o.userData.layoutPrepared)continue;const bounds=new T.Box3().setFromObject(o);if(bounds.isEmpty())continue;const center=o.worldToLocal(bounds.getCenter(new T.Vector3()));const delta=center.clone().multiply(o.scale).applyQuaternion(o.quaternion);o.position.add(delta);for(const child of o.children)child.position.sub(center);o.userData.layoutPrepared=true;o.updateMatrixWorld(true);}}
export function capture(root:T.Group):Pose[]{return assets(root).map(o=>({id:o.name,position:o.position.toArray(),rotation:o.rotation.y}));}
export function applyPoses(root:T.Group,poses:Pose[]){const map=new Map(poses.map(p=>[p.id,p]));for(const o of assets(root)){const p=map.get(o.name);if(p){o.position.fromArray(p.position);o.rotation.set(0,p.rotation,0);}}root.updateMatrixWorld(true);}
export function emptyLayout():LayoutFile{return {format:'residence-layout',version:1,model:MODEL_ID,savedAt:new Date().toISOString(),styles:{}};}
export function parseLayout(raw:string):LayoutFile{
 if(raw.length>2_000_000)throw new Error('布局文件过大');
 const data=JSON.parse(raw);if(data?.format!=='residence-layout'||data.version!==1||data.model!==MODEL_ID||!data.styles||typeof data.styles!=='object'||Array.isArray(data.styles))throw new Error('不是本住宅的有效布局文件');
 const clean=emptyLayout();
 for(const [id,poses] of Object.entries(data.styles)){
  if(!STYLE_IDS.includes(id as typeof STYLE_IDS[number])||!Array.isArray(poses)||poses.length>5000)throw new Error('无效方案');
  const seen=new Set<string>();
  for(const p of poses){if(typeof p?.id!=='string'||seen.has(p.id)||!Array.isArray(p.position)||p.position.length!==3||!p.position.every((v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<1000)||typeof p.rotation!=='number'||!Number.isFinite(p.rotation))throw new Error('无效家具位置或角度');seen.add(p.id);}
  clean.styles[id as typeof STYLE_IDS[number]]=poses.map(p=>({id:p.id,position:[...p.position] as Pose['position'],rotation:p.rotation}));
 }return clean;
}
