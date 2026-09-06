import {furniture, type Point} from './plan';
export type StyleID='base'|'style01'|'style02'|'style03';
export type DisplayMode='arctic'|'shaded'|'material';
export type Lighting={azimuth:number;elevation:number;shadow:number;ambient:number;ao:number;edges:number};
export const LIGHT_PRESETS:Record<string,Lighting>={ARCTIC:{azimuth:35,elevation:52,shadow:.68,ambient:.82,ao:1.15,edges:.18},'SOFT STUDIO':{azimuth:225,elevation:65,shadow:.38,ambient:1.15,ao:.85,edges:.12},SUNLIGHT:{azimuth:120,elevation:32,shadow:.95,ambient:.6,ao:.7,edges:.08},FLAT:{azimuth:135,elevation:60,shadow:0,ambient:1.55,ao:0,edges:.13}};
export const STYLES=[
 {id:'base' as StyleID,label:'BASE',name:'基础空间',en:'ARCHITECTURAL CLAY',colors:['#d4d7d6','#b1b8b9','#edf0ef'],reference:'',summary:'修正后的共享建筑层与基础占位。ARCTIC 模式通过柔和阴影、接触暗部和细微轮廓检查几何。',geometry:'基础占位家具；庭院、泳池和健身平台露天。',material:'统一灰白，无装修贴图。',lighting:'柔和侧向主光 + 环境光 + GTAO。'},
 {id:'style01' as StyleID,label:'STYLE 01',name:'中古现代',en:'WARM / SCULPTURAL / TIMELESS',colors:['#886044','#dbceb3','#292c28'],reference:'/references/style-01.png',summary:'胡桃木与暖白织物构成背景，低矮圆润的座具和有厚度的木作建立尺度。以纸灯、陶器、抽象艺术与植物柔化结构。',geometry:'客厅采用三座圆臂沙发、双泡单椅、木翼石面茶几；餐厅为圆桌与木质靠背椅，多功能区转为阅读与工作组合。',material:'胡桃木、浅洞石、米白织物、黑色皮革、少量黄铜。',lighting:'纸质吊灯、球形台灯、弧形落地灯；暖光与侧向自然光并置。'},
 {id:'style02' as StyleID,label:'STYLE 02',name:'包豪斯趣味现代',en:'PRIMARY / TUBULAR / PLAYFUL',colors:['#1a477f','#b93428','#eac638'],reference:'/references/style-02.png',summary:'暖白基底中插入红、蓝、黄三个明确重音，以钢管、玻璃、几何色块和模块家具体现轻盈与趣味，避免把所有表面都涂成原色。',geometry:'客厅用绗缝直排沙发、钢管单椅、双层玻璃推车与穿孔方凳；餐厅为蓝色矩形桌与悬臂/折板混搭椅；卧室为钢管床。',material:'浅橡木、镀铬钢管、透明玻璃、原色烤漆、彩色几何地毯。',lighting:'透明球罩与分层圆盘吊灯、红色壁灯、色块落地灯。'},
 {id:'style03' as StyleID,label:'STYLE 03',name:'现代简约高级',en:'LOW / QUIET / MATERIAL',colors:['#c4b9a8','#30302c','#6c262b'],reference:'/references/style-03.png',summary:'以低重心体块、留白和连续材质建立秩序。浅石、烟熏木与黑色金属构成主体，酒红单椅及少量雕塑作为集中重音。',geometry:'客厅为不对称模块沙发与三件套圆形茶几，餐厅采用黑色锥形底座椭圆桌；卧室用宽软包床头与悬浮感边柜。',material:'浅灰石材、烟熏木、细织物、黑色金属、灰白大理石、酒红绒面。',lighting:'细线吊灯、拱形多球灯、柜下灯带与克制的床头点光。'},
];
export type CameraPreset={id:string;space:string;title:string;position:[number,number,number];target:[number,number,number];fov:number;note:string};
// Plan pixels for horizontal coordinates, metres for elevation; shared by every style.
export const CAMERAS:CameraPreset[]=[
 {id:'living-a',space:'living',title:'客厅 · 主视角',position:[918,1.48,1031],target:[667,.95,870],fov:65,note:'从东南窗边斜向取景，保留沙发、茶几及多功能区的进深。'},
 {id:'living-b',space:'living',title:'客厅 · 开放关系',position:[882,1.5,751],target:[713,.95,932],fov:65,note:'从餐客厅连接处向南看，比较不同沙发组合。'},
 {id:'dining-a',space:'dining',title:'餐厅',position:[918,1.47,692],target:[803,1,540],fov:64,note:'从南侧斜看餐桌、吊灯和厨房开口。'},
 {id:'kitchen-a',space:'kitchen',title:'厨房',position:[713,1.52,559],target:[545,1.1,525],fov:71,note:'在厨房开口外侧取景，保留 U 形操作面。'},
 {id:'master-a',space:'master',title:'主卧',position:[312,1.4,1095],target:[152,.85,1027],fov:70,note:'东南侧通道斜向拍摄床头、床侧与背景板，避开窗边单椅。'},
 {id:'bed1-a',space:'bed1',title:'次卧（一）',position:[311,1.4,567],target:[186,.87,441],fov:70,note:'入口侧向西北，保留左侧床头与弧形外窗。'},
 {id:'bed2-a',space:'bed2',title:'次卧（二）',position:[1002,1.4,1025],target:[1112,.9,907],fov:72,note:'从西南角斜向床头，比较紧凑卧室家具尺度。'},
 {id:'flex-a',space:'flex',title:'多功能区',position:[533,1.45,1016],target:[460,.95,853],fov:67,note:'由南向北观察工作、阅读和展示的组合。'},
 {id:'entry-a',space:'entry',title:'玄关',position:[940,1.52,481],target:[1062,1.15,548],fov:65,note:'入户后斜看收纳与装饰，主通道保持空出。'},
 {id:'wardrobe-a',space:'wardrobe',title:'衣帽间',position:[298,1.5,899],target:[128,1.1,835],fov:75,note:'从主卧一侧看 L 形收纳和穿衣区。'},
 {id:'bath-a',space:'bath',title:'公卫与干区',position:[393,1.52,656],target:[431,1.12,504],fov:74,note:'从干区通过南侧门洞查看卫浴；门保持开启。'},
 {id:'ensuite-a',space:'ensuite',title:'主卫',position:[173,1.48,808],target:[184,1.02,684],fov:76,note:'从衣帽间门口查看台盆与淋浴。'},
 {id:'store-a',space:'store',title:'储藏间',position:[920,1.48,668],target:[1054,1.12,652],fov:66,note:'由西侧入口观察收纳组织。'},
 {id:'gym-a',space:'gym',title:'健身平台',position:[583,1.55,414],target:[785,.96,257],fov:67,note:'从住宅出口斜向露天器械与泳池，无遮挡顶面。'},
 {id:'courtyard-a',space:'courtyard',title:'庭院',position:[607,1.45,249],target:[465,.78,203],fov:69,note:'从健身平台看开放庭院、户外座具与植物。'},
 {id:'pool-a',space:'pool',title:'泳池',position:[838,1.4,181],target:[574,.3,112],fov:63,note:'沿池长方向取景，展示水面、池沿与庭院连接，机位位于器械与池沿之间。'},
];
export type Asset={id:string;room:string;kind:string;x:number;z:number;w:number;d:number;h:number;y?:number;angle?:number;variant?:string;role?:string;obstacle?:boolean};
export function layout(style:StyleID):Asset[]{
 if(style==='base')return furniture.map(f=>({...f,kind:f.kind,obstacle:!['shower','basin','rug'].includes(f.kind)}));
 const i=style==='style01'?1:style==='style02'?2:3,a:Asset[]=[];
 const put=(room:string,kind:string,x:number,z:number,w:number,d:number,h:number,extra:Partial<Asset>={})=>{a.push({id:`${style}-${room}-${kind}-${a.length}`,room,kind,x,z,w,d,h,...extra})};
 // Each scheme has an independent composition in the principal living spaces.
 if(i===1){
  put('living','sofa',659,882,73,210,.79,{angle:90,variant:'round-arm'});put('living','lounge',806,991,64,62,.82,{angle:24,variant:'bubble'});put('living','coffee',756,884,81,58,.38,{variant:'wood-wing'});put('living','side-table',824,959,31,31,.5);put('living','rug',770,903,294,263,.012);
  put('flex','desk',440,811,104,49,.75);put('flex','office-chair',463,863,42,44,.91,{angle:180});put('flex','lounge',457,978,61,61,.88,{variant:'cantilever',angle:28});put('flex','side-table',508,957,30,30,.43);put('flex','shelf',374,920,23,233,2.25,{angle:90});put('flex','floor-lamp',405,999,25,25,1.65);
  put('dining','dining-table',807,559,94,94,.75,{variant:'round'});for(let j=0;j<6;j++){const r=j*Math.PI/3;put('dining','dining-chair',807+Math.sin(r)*64,559+Math.cos(r)*64,29,31,.8,{angle:180-j*60,variant:j===2?'sculpted':'keyhole'})}
 }else if(i===2){
  put('living','sofa',714,999,182,72,.79,{variant:'tufted'});put('living','lounge',663,826,57,60,.85,{variant:'tube',angle:-40});put('living','coffee',764,906,78,46,.49,{variant:'glass-cart'});put('living','stool',846,858,35,35,.43,{variant:'perforated'});put('living','rug',765,916,289,249,.014);
  put('flex','desk',438,800,110,45,.75,{role:'blue'});put('flex','office-chair',453,848,39,42,.85,{angle:180});put('flex','shelf',373,894,23,205,2.2,{angle:90});put('flex','lounge',470,951,57,60,.85,{variant:'tube',angle:18});put('flex','side-table',523,982,30,30,.45);put('flex','floor-lamp',403,1000,24,24,1.55);
  put('dining','dining-table',807,559,62,130,.75,{variant:'rectangular',role:'blue'});[516,562,607].forEach((z,j)=>{put('dining','dining-chair',756,z,31,31,.82,{angle:90,variant:j===1?'zigzag':'cantilever'});put('dining','dining-chair',857,z,31,31,.82,{angle:-90,variant:j===1?'cutout':'cantilever'})});
 }else{
  put('living','sofa',666,890,78,213,.74,{angle:90,variant:'modular'});put('living','ottoman',735,969,78,68,.39);put('living','lounge',837,813,62,64,.8,{variant:'swivel',angle:-28});put('living','coffee',780,890,94,69,.38,{variant:'nesting'});put('living','rug',771,902,290,271,.016);
  put('flex','desk',441,810,112,48,.75);put('flex','office-chair',465,864,40,42,.85,{angle:180});put('flex','shelf',374,897,23,214,2.5,{angle:90});put('flex','lounge',465,971,62,60,.77,{variant:'sling',angle:25});put('flex','side-table',521,983,31,31,.51);put('flex','floor-lamp',407,1001,28,28,1.65);
  put('dining','dining-table',808,560,88,116,.75,{variant:'oval-cone'});[522,566,610].forEach(z=>{put('dining','dining-chair',746,z,30,33,.77,{angle:90});put('dining','dining-chair',869,z,30,33,.77,{angle:-90})});
 }
 put('living','console',938,896,20,165,.46,{angle:-90});put('living','screen',940,896,3,126,.8,{y:.77,obstacle:false});put('living','floor-lamp',902,850,28,28,1.7);put('living','pendant',758,898,45,45,.24,{y:2.35,obstacle:false});put('living','plant',891,790,30,30,1.4);put('living','art',952,893,1,90,1.05,{y:1.14,angle:-90,obstacle:false});
 put('dining','sideboard',807,665,105,45,.85);put('dining','pendant',807,557,73,73,.42,{y:1.82,obstacle:false});
 put('entry','entry-cabinet',1065,510,31,132,2.6,{angle:-90});put('entry','mirror',1048,517,1,55,1.28,{y:.8,angle:-90,obstacle:false});put('entry','bench',1018,575,65,28,.44);put('entry','rug',990,493,69,96,.01,{obstacle:false});put('entry','pendant',989,515,30,30,.24,{y:2.38,obstacle:false});
 put('store','shelf',1066,655,31,106,2.5,{angle:-90});put('store','shelf',1008,607,73,23,2.25);put('store','pendant',1007,660,24,24,.2,{y:2.43,obstacle:false});
 // Kitchen footprints and wet/service points remain fixed; joinery changes.
 put('kitchen','counter',533,560,42,212,.91,{angle:90});put('kitchen','counter',609,468,130,36,.91);put('kitchen','counter',569,647,45,43,.91);put('kitchen','fridge',632,643,70,50,2.05,{angle:180});put('kitchen','upper-cabinet',521,552,21,152,.69,{y:1.64,angle:90,obstacle:false});put('kitchen','hood',526,529,29,63,.18,{y:1.48,obstacle:false});put('kitchen','sink',638,470,56,27,.09,{y:.89,obstacle:false});put('kitchen','backsplash',511,555,1,166,.53,{y:.94,angle:-90,obstacle:false});put('kitchen','pendant',604,539,70,18,.12,{y:2.48,obstacle:false});
 const beds=[{room:'master',x:150,z:1026,w:148,d:136,cx:236,angle:-90},{room:'bed1',x:207,z:466,w:146,d:112,cx:134,angle:90},{room:'bed2',x:1120,z:933,w:147,d:130,cx:1190,angle:-90}];
 beds.forEach((b,j)=>{
  put(b.room,'bed',b.x,b.z,i===3?b.w+4:b.w,b.d,i===2?.63:.52,{angle:b.angle,variant:i===1?'leather':i===2?'tube':'wing'});
  put(b.room,'rug',b.x-8,b.z,b.w+39,b.d+61,.012,{obstacle:false});
  for(const sign of [-1,1]){const zz=b.z+sign*(b.d/2+19);put(b.room,'nightstand',b.cx+(j===1?12:-13),zz,29,29,i===3?.38:.46);put(b.room,'table-lamp',b.cx+(j===1?12:-13),zz,16,16,.34,{y:i===3?.39:.47,obstacle:false});}
  const backX=j===1?126:j===2?1190:249;
  put(b.room,'head-panel',backX,b.z,2,b.d+49,i===3?1.4:1.2,{y:.05,angle:-90,obstacle:false});
  put(b.room,'art',backX+(j===1?1:-1),b.z,1,56,.6,{y:1.52,angle:j===1?90:-90,obstacle:false});
  put(b.room,'pendant',b.x-29,b.z,32,32,.3,{y:2.32,obstacle:false});
 });
 put('master','lounge',294,1134,54,53,.8,{angle:25,variant:i===1?'bubble':i===2?'tube':'swivel'});put('master','plant',87,1156,25,25,1.3);put('master','curtain',238,1191,196,9,2.56,{y:.04,obstacle:false});
 put('bed1','wardrobe',198,585,140,41,2.57,{angle:180});put('bed1','curtain',261,347,151,8,2.56,{y:.04,obstacle:false});
 put('bed2','wardrobe',1134,791,111,35,2.57);put('bed2','curtain',1081,1060,209,9,2.56,{y:.04,obstacle:false});
 put('living','curtain',661,1061,549,9,2.56,{y:.04,obstacle:false});
 put('wardrobe','wardrobe',88,834,36,106,2.6,{angle:90});put('wardrobe','wardrobe',164,887,137,35,2.6,{angle:180});put('wardrobe','mirror',252,835,2,47,1.52,{y:.16,angle:-90,obstacle:false});put('wardrobe','pendant',201,830,48,22,.15,{y:2.43,obstacle:false});
 for(const b of [{room:'bath',x:465,z:625,w:39,d:95},{room:'ensuite',x:235,z:718,w:40,d:95}]){put(b.room,'vanity',b.x,b.z,b.w,b.d,.81,{angle:-90});put(b.room,'sink',b.x,b.z,b.w*.65,35,.13,{y:.8,obstacle:false});put(b.room,'mirror',b.x+b.w/2-2,b.z,1,b.d*.77,.92,{y:1.02,angle:-90,obstacle:false});put(b.room,'wall-lamp',b.x+b.w/2-4,b.z-b.d*.3,8,8,.38,{y:1.39,obstacle:false});put(b.room,'bath-panel',b.x+b.w/2,b.z,1,b.d,2.6,{angle:-90,obstacle:false});}
 put('bath','pendant',412,526,19,19,.15,{y:2.47,obstacle:false});put('ensuite','pendant',177,711,19,19,.15,{y:2.47,obstacle:false});
 put('hall','rug',624,727,461,49,.009,{obstacle:false});put('hall','art',557,688,93,1,.68,{y:1.18,obstacle:false});
 // Outdoor platform: equipment, furniture and planting, with no enclosure.
 put('gym','treadmill',790,222,132,55,1.1);put('gym','machine',790,338,111,57,1.45);put('gym','gym-rack',594,397,42,26,.77);put('gym','yoga-mat',666,287,44,130,.012,{obstacle:false});put('gym','plant',568,355,22,22,1.45);
 if(i===1){put('courtyard','outdoor-seat',462,157,62,48,.75,{angle:180});put('courtyard','outdoor-seat',462,235,62,45,.75);put('courtyard','outdoor-table',477,197,38,38,.4)}
 else if(i===2){put('courtyard','outdoor-seat',451,147,50,43,.74,{angle:170});put('courtyard','outdoor-seat',458,249,50,43,.74,{angle:10});put('courtyard','outdoor-table',478,199,38,38,.45)}
 else{put('courtyard','outdoor-seat',447,197,43,132,.73,{angle:-90});put('courtyard','outdoor-table',494,198,42,42,.34)}
 [[475,85,129,40],[383,204,33,145],[463,301,175,38],[530,350,36,76]].forEach(([x,z,w,d])=>put('courtyard','planter',x,z,w,d,.6));
 [[441,83],[508,85],[385,171],[384,252],[471,301],[531,351]].forEach(([x,z],j)=>put('courtyard','plant',x,z,25,25,j%2?1.5:1.1,{y:.48,obstacle:false}));
 put('pool','water',707,117,296,102,.012,{y:-.09,obstacle:false});put('pool','pool-step',852,147,13,40,.12,{y:-.75,obstacle:false});
 return a;
}

