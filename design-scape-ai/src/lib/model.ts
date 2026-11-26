export type ProductType = 'kitchen' | 'dressing';
export type Finish = 'oak' | 'walnut' | 'white' | 'greige' | 'black';
export type ModuleKind = 'base'|'wall'|'tall'|'wardrobe'|'counter'|'drawer'|'shelf';
export type Module = { id:string; label:string; x:number; y:number; z:number; width:number; height:number; depth:number; finish:Finish; kind:ModuleKind; quantity:number; materialCode:string };
export type Design = { id:string; name:string; description:string; modules:Module[]; accent:Finish; productType:ProductType };
export type Room = {width:number; depth:number; height:number};
export const FINISHES:Record<Finish,{label:string;color:string;pricePerM2:number}> = {
 oak:{label:'Natural Oak',color:'#b88a5a',pricePerM2:950},
 walnut:{label:'Walnut',color:'#65452f',pricePerM2:1250},
 white:{label:'Warm White',color:'#e8e5df',pricePerM2:650},
 greige:{label:'Greige',color:'#aaa094',pricePerM2:780},
 black:{label:'Graphite',color:'#343434',pricePerM2:820}
};
const names=['Warm Minimal','Soft Contemporary','Nordic Natural','Modern Contrast','Quiet Luxury'];
const descriptions=['Balanced storage with a warm, restrained palette','Bright fronts and practical everyday storage','Natural timber-led composition','High-contrast contemporary arrangement','Premium neutral palette with clean detailing'];
const mk=(id:string,label:string,x:number,width:number,height:number,depth:number,kind:ModuleKind,finish:Finish,y=0):Module=>({id,label,x,y,z:0,width,height,depth,kind,finish,quantity:1,materialCode:finish.toUpperCase()});
export function makeAlternatives(type:ProductType,room:Room):Design[]{
 return Array.from({length:5},(_,i)=>{
  const finish=(['oak','greige','white','walnut','black'] as Finish[])[i];
  const modules:Module[]=[];
  const count=type==='kitchen'?Math.max(3,Math.min(7,Math.floor(room.width/.75))):Math.max(3,Math.min(7,Math.floor(room.width/.65)));
  const unit=room.width/count;
  if(type==='kitchen'){
   const hasTall=room.width>=3.6;
   const baseCount=hasTall?count-1:count;
   for(let n=0;n<baseCount;n++) modules.push(mk(`b${i}-${n}`,['Sink base','Drawer base','Hob base','Storage base'][n%4],n*unit,unit-.012,.88,.62,'base',finish));
   const upperCount=Math.max(2,count-1);
   const upperSpan=room.width-(hasTall?.66:0);
   for(let n=0;n<upperCount;n++) modules.push(mk(`w${i}-${n}`,'Wall cabinet',n*(upperSpan/upperCount),upperSpan/upperCount-.012,.72,.35,'wall',i%2===0?'white':finish,1.48));
   if(hasTall) modules.push(mk(`t${i}`,'Tall pantry',Math.max(0,room.width-.66),.648,Math.min(2.3,room.height-.1),.62,'tall',i%2===0?'oak':finish));
  } else {
   for(let n=0;n<count;n++){
    const bay=mk(`d${i}-${n}`,n%2?'Hanging bay':'Shelving bay',n*unit,unit-.012,Math.min(2.35,room.height-.1),.6,'wardrobe',finish);
    modules.push(bay);
    if(n%2===0) modules.push(mk(`s${i}-${n}`,'Drawer module',n*unit+.03,.42,.65,.48,'drawer',i%2===0?'white':finish,.08));
   }
  }
  return {id:`${type}-${i+1}`,name:names[i],description:descriptions[i],modules,accent:finish,productType:type};
 });
}
export function validateDesign(design:Design,room:Room){
 const errors:string[]=[];
 for(const m of design.modules){
  if(m.width<=0||m.height<=0||m.depth<=0) errors.push(`${m.label}: dimensions must be positive`);
  if(m.x<0||m.x+m.width>room.width+.001) errors.push(`${m.label}: exceeds room width`);
  if(m.y<0||m.y+m.height>room.height) errors.push(`${m.label}: exceeds room height`);
  if(m.depth>room.depth) errors.push(`${m.label}: exceeds room depth`);
 }
 return {valid:errors.length===0,errors};
}
export function cutList(design:Design){
 return design.modules.flatMap(m=>[
  {moduleId:m.id,module:m.label,part:'Sides',width:m.depth*1000,height:m.height*1000,thickness:18,material:m.materialCode,qty:2*m.quantity},
  {moduleId:m.id,module:m.label,part:'Top / Bottom',width:m.width*1000-36,height:m.depth*1000,thickness:18,material:m.materialCode,qty:2*m.quantity},
  {moduleId:m.id,module:m.label,part:'Back',width:m.width*1000-36,height:m.height*1000-36,thickness:6,material:'BACK-6MM',qty:m.quantity}
 ]);
}
export function estimate(design:Design){
 const area=design.modules.reduce((s,m)=>s+2*(m.width*m.height+m.width*m.depth+m.height*m.depth),0);
 const material=design.modules.reduce((s,m)=>s+2*(m.width*m.height+m.width*m.depth+m.height*m.depth)*FINISHES[m.finish].pricePerM2,0);
 return {panelAreaM2:area,materialCost:Math.round(material),hardwareAllowance:Math.round(design.modules.length*420),total:Math.round(material+design.modules.length*420)};
}
