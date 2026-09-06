// Source drawing coordinates are preserved, so every boundary can be audited.
// X right; Z down the drawing; Y elevation. 1 source pixel = 0.014 m (estimated).
export type Point = [number, number];
export const SCALE = 0.014;
export const HEIGHT = 2.8;
export const SOURCE = { width:1254,height:1254,metresPerPixel:SCALE,estimated:true,wallHeight:HEIGHT,eyeHeight:1.6,doorHeight:2.15,windowSill:0.18,windowHead:2.65 };
export const world = (p:Point):Point => [(p[0]-627)*SCALE,(p[1]-627)*SCALE];
export const footprint:Point[] = [[450,54],[850,54],[850,42],[1075,42],[1075,94],[1154,94],[1154,328],[1205,328],[1205,1090],[963,1090],[963,1078],[360,1078],[360,1205],[130,1205],[104,1200],[80,1188],[61,1168],[49,1143],[48,1120],[48,617],[111,617],[111,408],[117,380],[135,354],[162,337],[185,332],[350,332],[350,144],[355,116],[370,89],[394,69],[422,57]];
export type Room = {id:string;name:string;en:string;center:Point;boundary:Point[];note:string;connects:string[];kind?:string};
const rect=(x:number,y:number,w:number,h:number):Point[]=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
export const rooms:Room[] = [
 {id:'living',name:'客厅',en:'Living room',center:[810,880],boundary:rect(613,767,334,297),note:'与多功能区、餐厅开放连通；南侧为连续窗带。',connects:['flex','dining','bed2']},
 {id:'flex',name:'多功能区',en:'Flexible space',center:[473,863],boundary:rect(364,767,249,297),note:'原图没有实体隔墙，保留与客厅的开放关系。',connects:['living','dining','master']},
 {id:'dining',name:'餐厅',en:'Dining',center:[800,552],boundary:rect(699,447,242,290),note:'六人餐桌与南侧岛台按原图占位，西侧连通厨房。',connects:['entry','kitchen','living','flex','gym']},
 {id:'entry',name:'玄关',en:'Entrance',center:[1000,518],boundary:rect(929,445,150,137),note:'主入户门位于上侧，与电梯前室相连；右侧为固定收纳。',connects:['dining','lobby','store']},
 {id:'kitchen',name:'厨房',en:'Kitchen',center:[600,545],boundary:rect(509,449,175,220),note:'U 形操作台、北侧水槽、西侧灶具与南侧冰箱；东侧开口通餐厅。',connects:['dining']},
 {id:'bed1',name:'次卧（一）',en:'Bedroom 01',center:[220,472],boundary:[[125,405],[137,370],[178,346],[346,346],[346,681],[274,681],[274,612],[125,612]],note:'西北侧弧形窗带；床、床头柜、南侧衣柜占位；东南侧门洞通中央过道。',connects:['hall']},
 {id:'bath',name:'公卫',en:'Shared bathroom',center:[414,521],boundary:rect(361,402,128,165),note:'北侧淋浴、东侧坐便器；入口位于南侧偏西，开启方式推定。南侧洗手台位于外置干区。',connects:['hall']},
 {id:'hall',name:'中央过道',en:'Circulation',center:[391,722],boundary:[[275,686],[351,686],[351,572],[436,572],[436,686],[698,686],[698,764],[275,764]],note:'连接两处卧室入口、公卫干区及公共起居区，保持原图狭长通道。',connects:['bed1','bath','master','flex','dining']},
 {id:'master',name:'主卧室',en:'Primary bedroom',center:[193,1021],boundary:[[65,917],[344,917],[344,1188],[132,1188],[94,1177],[65,1144]],note:'与上方衣帽间连通；左下弧形外边界和窗带按轮廓折线细分。',connects:['wardrobe']},
 {id:'wardrobe',name:'衣帽间',en:'Dressing',center:[180,830],boundary:rect(65,781,279,136),note:'L 形收纳占位，与主卧开放连通；北侧进入主卫，东侧门通中央过道。',connects:['master','ensuite','hall']},
 {id:'ensuite',name:'主卫',en:'En-suite',center:[175,702],boundary:rect(66,632,194,139),note:'左侧淋浴、中央坐便器、右侧洗手台；南侧出入口通衣帽间。',connects:['wardrobe']},
 {id:'bed2',name:'次卧（二）',en:'Bedroom 02',center:[1081,934],boundary:rect(970,771,223,291),note:'北侧收纳、右侧床头和南侧窗带；西北侧门洞通公共区。',connects:['living']},
 {id:'store',name:'储藏间',en:'Storage',center:[1013,659],boundary:rect(958,608,126,94),note:'北、东侧固定边界及可替换储物柜；西侧有门洞。',connects:['entry']},
 {id:'gym',name:'健身区',en:'Gym',center:[707,285],boundary:rect(554,177,310,248),note:'跑步机及训练器械占位；南侧为推定推拉门，西接庭院。北侧与泳池之间边界形式待核。',connects:['dining','courtyard']},
 {id:'courtyard',name:'庭院',en:'Courtyard',center:[479,234],boundary:rect(415,111,132,170),note:'围合座椅与中部矮桌；周边为花池。与健身区之间开启形式推定。',connects:['gym'],kind:'outdoor'},
 {id:'pool',name:'泳池',en:'Pool',center:[702,116],boundary:rect(556,63,302,108),note:'约 4.23 × 1.51 m，按原图比例；池深 1.2 m 为占位假设，不作为施工依据。',connects:[],kind:'outdoor'},
 {id:'lobby',name:'电梯前室',en:'Lift lobby',center:[1005,306],boundary:rect(888,232,253,192),note:'上侧方形井道按电梯推定；右侧设备间用途与前室门扇待确认。',connects:['entry','stairs','lift'],kind:'common'},
 {id:'lift',name:'电梯井（推定）',en:'Lift · inferred',center:[972,145],boundary:rect(889,64,170,148),note:'依据厚墙方形井道及叉线符号推定为电梯；不构造未知井道设备。',connects:['lobby'],kind:'common'},
 {id:'stairs',name:'公共楼梯',en:'Common stair',center:[1150,566],boundary:rect(1100,451,94,289),note:'按图示梯段位置构建示意踏步；上下行方向和实际层高不能由此图确定，漫游范围止于前室。',connects:['lobby'],kind:'common'},
];
export type Wall = {id:string;a:Point;b:Point;t:number;h?:number;kind?:'solid'|'parapet'};
export const walls:Wall[]=[];
const w=(id:string,a:Point,b:Point,t=16,h=HEIGHT)=>walls.push({id,a,b,t,h});
w('W01-west-suite',[55,618],[55,1142],17);w('W02-bed1-west',[118,400],[118,615],16);
w('W03-north-suite',[55,619],[125,619],16);w('W04-spine-north',[356,332],[356,685],16);
w('W05-spine-south',[356,774],[356,1197],18);w('W06-primary-bath-west',[133,625],[133,779],10);
w('W07-primary-bath-east',[265,622],[265,774],12);w('W08-primary-bath-top',[133,621],[266,621],12);
w('W09-primary-bath-bottom-a',[55,777],[140,777],10);w('W10-primary-bath-bottom-b',[207,777],[265,777],10);
w('W11-bed1-south',[125,617],[270,617],14);
w('W12-kitchen-west',[499,395],[499,679],20);w('W13-kitchen-south',[499,678],[688,678],17);
w('W14-kitchen-east-a',[688,444],[688,508],7);w('W15-kitchen-east-b',[688,610],[688,678],7);
w('W16-gym-south-west',[501,438],[696,438],18);w('W17-gym-south-east',[855,438],[928,438],18);
w('W18-bath-north',[356,397],[499,397],16);w('W19-bath-split-a',[360,479],[389,479],7);w('W20-bath-split-b',[443,479],[491,479],7);
w('W21-bath-south',[426,569],[491,569],10);
w('W41-entry-jamb',[1035,438],[1089,438],18);
w('W22-store-north',[953,594],[1089,594],19);w('W23-store-west',[955,597],[955,636],17);
w('W24-store-south',[954,718],[1090,718],15);w('W25-east-spine',[1091,438],[1091,750],18);
w('W26-bed2-north',[1092,752],[1202,752],19);w('W27-bed2-east',[1202,752],[1202,1090],17);
w('W28-bed2-west',[958,796],[958,1067],19);
w('W29-gym-east-bottom',[878,327],[878,435],17);w('W30-gym-east-top',[878,176],[878,229],17);
w('W31-lift-top',[853,50],[1070,50],18);w('W32-lift-west',[878,51],[878,224],18);
w('W33-lift-east',[1068,50],[1068,226],18);w('W34-lift-bottom-a',[880,221],[925,221],18);
w('W35-lift-bottom-b',[1020,221],[1068,221],18);
w('W36-service-top',[1078,98],[1150,98],12);w('W37-service-east',[1150,98],[1150,228],12);
w('W38-lobby-door-jamb',[1145,279],[1145,330],13);w('W39-lobby-east-low',[1085,332],[1147,332],13);
w('W40-stair-east',[1203,450],[1203,742],10,1.1);
// Low exterior garden enclosure, retaining the rounded corner.
const garden:Point[]=[[350,332],[350,146],[354,119],[370,91],[394,69],[423,57],[450,54],[850,54]];
garden.slice(1).forEach((p,i)=>w('P-garden-'+i,garden[i],p,9,0.65));
export type Opening={id:string;name:string;a:Point;b:Point;type:'door'|'sliding'|'window';sill:number;head:number;inferred:boolean;hinge?:number;swing?:number};
export const openings:Opening[]=[];
const o=(id:string,name:string,a:Point,b:Point,type:Opening['type'],inferred=false,sill=0,head=2.15,hinge=0,swing=1)=>openings.push({id,name,a,b,type,sill,head,inferred,hinge,swing});
o('D01','主入户门',[928,438],[1034,438],'door',false,0,2.2,0,-1);
o('D02','次卧（一）门',[270,682],[343,682],'door',false,0,2.15,1,1);
o('D03','主卧套区门',[270,775],[343,775],'door',false,0,2.15,1,-1);
o('D04','次卧（二）门',[958,728],[958,795],'door',false,0,2.15,1,1);
o('D05','储藏间门',[955,637],[955,702],'door',true,0,2.15,0,-1);
o('D06','公卫门',[363,569],[425,569],'sliding',true);
o('D07','主卫门',[141,777],[205,777],'sliding',true);
o('D08','淋浴门',[390,479],[442,479],'door',false,0,2.05,0,1);
o('D09','健身区推拉门',[697,438],[852,438],'sliding',true,0,2.5);
o('D10','庭院推拉门',[550,176],[550,279],'sliding',true,0,2.5);
o('D11','电梯门',[926,221],[1019,221],'sliding',true,0,2.2);
o('D12','设备间门',[1079,228],[1138,228],'door',false,0,2.1,1,-1);
o('D13','前室侧门',[1148,334],[1204,334],'door',true,0,2.2,1,-1);
const win=(id:string,a:Point,b:Point,inferred=false)=>o(id,'外窗 / 玻璃边界',a,b,'window',inferred,0.18,2.65);
const upper:Point[]=[[118,399],[122,381],[132,364],[149,349],[170,340],[193,337],[347,337]];
upper.slice(1).forEach((p,i)=>win('G-bed1-'+i,upper[i],p));
const lower:Point[]=[[55,1143],[64,1165],[80,1183],[103,1196],[130,1201],[346,1201]];
lower.slice(1).forEach((p,i)=>win('G-master-'+i,lower[i],p));
win('G-living',[368,1072],[939,1072]);win('G-bed2',[974,1072],[1193,1072]);
win('G-gym-east',[878,231],[878,324],true);win('G-pool',[555,175],[864,175],true);
win('G-courtyard-north',[414,109],[549,109],true);win('G-courtyard-west',[411,112],[411,277],true);
win('G-courtyard-south',[411,281],[549,281],true);win('G-courtyard-side',[550,110],[550,173],true);
win('G-bath',[365,391],[457,391]);win('G-primary-bath',[63,619],[108,619]);
export const columns = [rect(103,388,24,34),rect(345,325,21,82),rect(346,965,27,181),rect(38,1114,26,33),rect(934,1033,33,60),rect(948,581,37,44),rect(1081,424,20,30),rect(671,428,25,25)];
export type Item={id:string;room:string;kind:'bed'|'sofa'|'cabinet'|'table'|'chair'|'counter'|'basin'|'toilet'|'shower'|'rug'|'treadmill'|'machine'|'planter';x:number;z:number;w:number;d:number;h:number;r?:number;fixed?:boolean};
export const furniture:Item[]=[];
const f=(room:string,kind:Item['kind'],x:number,z:number,w:number,d:number,h:number,r=0,fixed=false)=>furniture.push({id:room+'-'+kind+'-'+furniture.length,room,kind,x,z,w,d,h,r,fixed});
f('master','bed',148,1028,148,136,0.52);f('master','table',87,936,32,35,.48);f('master','table',87,1116,32,35,.48);f('master','chair',294,1145,57,48,.78,25);
f('wardrobe','cabinet',88,835,36,110,2.55);f('wardrobe','cabinet',165,887,141,35,2.55);
f('bed1','bed',206,466,146,112,.52);f('bed1','table',144,389,29,28,.48);f('bed1','table',144,542,27,27,.48);f('bed1','cabinet',198,587,141,44,2.55);
f('bed2','bed',1120,933,147,130,.52);f('bed2','table',1174,853,27,28,.48);f('bed2','table',1174,1019,27,28,.48);f('bed2','cabinet',1143,792,109,38,2.55);
f('living','sofa',656,901,80,226,.82);f('living','sofa',716,979,124,58,.82,90);f('living','table',760,878,52,110,.34);f('living','table',806,993,61,64,.4);
f('flex','sofa',589,854,43,135,.72);f('flex','sofa',589,968,37,84,.48);f('flex','chair',469,812,61,55,.75,-25);f('flex','chair',457,1009,48,50,.72,35);f('flex','table',511,918,41,41,.46);f('flex','cabinet',373,911,26,286,2.5);
f('dining','table',809,562,54,137,.75);f('dining','counter',806,661,106,50,.88);
[527,570,610].forEach(z=>{f('dining','chair',760,z,29,30,.8);f('dining','chair',855,z,29,30,.8,180)});
f('entry','cabinet',1067,516,32,134,2.55);f('store','cabinet',1017,605,70,25,2.5);f('store','cabinet',1067,650,32,113,2.5);
f('kitchen','counter',531,560,40,217,.9);f('kitchen','counter',610,470,131,36,.9);f('kitchen','counter',573,646,44,44,.9);f('kitchen','cabinet',632,643,70,50,1.85);f('kitchen','basin',639,471,56,27,.94);
f('bath','shower',412,438,93,71,.08,0,true);f('bath','toilet',465,523,43,32,.43,0,true);f('bath','counter',466,625,39,98,.83);f('bath','basin',466,622,23,46,.87);
f('ensuite','shower',95,687,52,96,.08,0,true);f('ensuite','toilet',174,653,29,47,.43,90,true);f('ensuite','counter',236,718,40,99,.83);f('ensuite','basin',234,729,26,46,.87);
f('gym','treadmill',790,221,132,55,1.1);f('gym','machine',791,338,116,57,1.45);f('gym','counter',542,410,32,30,.87);f('gym','machine',610,405,39,39,.85);
f('courtyard','sofa',477,159,71,40,.65,90);f('courtyard','sofa',460,197,36,50,.65);f('courtyard','sofa',477,227,71,36,.65,90);f('courtyard','table',480,191,40,40,.35);
f('courtyard','planter',478,85,131,44,.55);f('courtyard','planter',386,204,35,147,.6);f('courtyard','planter',464,301,180,41,.6);f('courtyard','planter',530,350,41,83,.6);
export const routes:Point[][]=[[[987,402],[986,490],[923,537],[919,727],[844,731],[845,866]],[[917,728],[398,729],[308,728],[307,652],[302,529]],[[308,729],[306,820],[296,991]],[[917,730],[983,735],[1015,811],[1040,925]],[[916,535],[718,554],[660,554]],[[918,488],[746,484],[746,402],[706,287],[515,250]]];
export const assumptions=[
 '原图无尺寸、比例尺和朝向：统一按 0.014 m/像素估算，图上方不等同于正北。',
 '墙高 2.80 m、普通门高 2.15 m、窗台 0.18 m / 窗顶 2.65 m、楼板厚 0.16 m 均为暂定。',
 '深色粗线按墙体建模，局部加厚按柱/墙垛占位；不据此判定承重性质。',
 '健身区玻璃边界、部分推拉门、主卫与储藏间开启方式及电梯功能需要实测或建筑图复核。',
 '顶面为室内范围的水平占位面；梁、设备管线、外立面细节及楼梯高差缺少信息，不作精确推断。',
 '家具与窗门尺寸源于图像描摹。白模用于空间检查，不是实测模型或施工图。',
];
