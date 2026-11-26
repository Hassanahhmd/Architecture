'use client';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { cutList, estimate, FINISHES, makeAlternatives, ProductType, Room, Design, Module, Finish, validateDesign } from '@/lib/model';
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

function download(name:string, content:string, type='application/json') {
 const blob = new Blob([content], {type});
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a'); a.href=url; a.download=name; a.click();
 URL.revokeObjectURL(url);
}

export default function Home() {
 const [type,setType]=useState<ProductType>('kitchen');
 const [room,setRoom]=useState<Room>({width:4.2,depth:3.2,height:2.8});
 const [prompt,setPrompt]=useState('Modern luxury, warm neutral finishes, practical storage');
 const [designs,setDesigns]=useState<Design[]>(()=>makeAlternatives('kitchen',{width:4.2,depth:3.2,height:2.8}));
 const [selected,setSelected]=useState(0);
 const [active,setActive]=useState('');
 const [saved,setSaved]=useState(false);
 const current=designs[selected];
 const chosen=current?.modules.find(m=>m.id===active) ?? current?.modules[0];
 const validation=useMemo(()=>current?validateDesign(current,room):{valid:false,errors:[]},[current,room]);
 const cost=useMemo(()=>current?estimate(current):null,[current]);
 function updateDesign(next:Design){setDesigns(old=>old.map((d,i)=>i===selected?next:d));setSaved(false);}
 function updateModule(patch:Partial<Module>){if(!chosen)return;updateDesign({...current,modules:current.modules.map(m=>m.id===chosen.id?{...m,...patch}:m)});}
 function generate(){const next=makeAlternatives(type,room);setDesigns(next);setSelected(0);setActive(next[0]?.modules[0]?.id??'');setSaved(false);}
 function addModule(){const id='custom-'+Date.now();const m:Module={id,label:'Custom module',x:Math.max(0,Math.min(room.width-.6,current.modules.length*.12)),y:0,z:0,width:.6,height:.88,depth:.6,finish:'oak',kind:type==='kitchen'?'base':'wardrobe',quantity:1,materialCode:'OAK'};updateDesign({...current,modules:[...current.modules,m]});setActive(id);}
 function removeModule(){if(!chosen)return;const remaining=current.modules.filter(m=>m.id!==chosen.id);updateDesign({...current,modules:remaining});setActive(remaining[0]?.id??'');}
 function saveLocal(){localStorage.setItem('design-scape-project',JSON.stringify({type,room,design:current,prompt}));setSaved(true);}
 function exportProject(){download('design-scape-project.json',JSON.stringify({schemaVersion:'1.0',project:'Design Scape AI',type,room,design:current,prompt,units:'meters',manufacturing:{warning:'Preliminary cut list only; verify construction rules and workshop standards before fabrication.'}},null,2));}
 function exportCut(){const rows=cutList(current);const header='Module,Part,Width_mm,Height_mm,Thickness_mm,Material,Quantity\n';download('design-scape-cut-list.csv',header+rows.map(r=>[r.module,r.part,r.width.toFixed(0),r.height.toFixed(0),r.thickness,r.material,r.qty].join(',')).join('\n'),'text/csv');}
 function exportObj(){let out='# Design Scape AI OBJ export\n',index=1;for(const m of current.modules){const {x,y,z,width:w,height:h,depth:d}=m;out+=`o ${m.id}\n`;const vertices=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];vertices.forEach(v=>out+=`v ${v.join(' ')}\n`);[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[4,0,3,7]].forEach(f=>out+=`f ${f.map(n=>n+index).join(' ')}\n`);index+=8;}download('design-scape-model.obj',out,'text/plain');}
 return <main className="shell">
  <header className="topbar"><div className="brand">DESIGN <span>SCAPE</span><small>AI STUDIO</small></div><div className="top-actions"><span className="pill">WORKSPACE / NEW PROJECT</span><span className="pill">MVP 0.2</span></div></header>
  <div className="layout">
   <aside className="panel left"><div className="eyebrow">PROJECT SETUP</div><h1>Let’s design<br/>your space.</h1><p className="muted">Create editable kitchen and dressing concepts from dimensions, references and design instructions.</p>
    <section className="section"><label className="label">PROJECT TYPE</label><div className="tabs"><button className={type==='kitchen'?'tab active':'tab'} onClick={()=>setType('kitchen')}>Kitchen</button><button className={type==='dressing'?'tab active':'tab'} onClick={()=>setType('dressing')}>Dressing</button></div></section>
    <section className="section"><label className="label">ROOM DIMENSIONS · METERS</label><div className="dimensions">{(['width','depth','height'] as const).map(k=><label key={k}>{k}<input type="number" min=".5" step=".1" value={room[k]} onChange={e=>setRoom({...room,[k]:Math.max(.5,Number(e.target.value))})}/></label>)}</div></section>
    <section className="section"><label className="label">DESIGN DIRECTION</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={3}/><button className="primary full" onClick={generate}>Generate 5 concepts</button><p className="hint">Concept generation currently uses deterministic parametric presets. AI image interpretation is not connected yet.</p></section>
    <section className="section"><label className="label">EXPORT & SAVE</label><div className="button-grid"><button onClick={saveLocal}>Save locally</button><button onClick={exportProject}>Project JSON</button><button onClick={exportObj}>3D OBJ</button><button onClick={exportCut}>Cut list CSV</button></div>{saved&&<p className="success">Saved in this browser.</p>}</section>
   </aside>
   <section className="workspace"><div className="workspace-head"><div><div className="eyebrow">DESIGN CANVAS</div><h2>{current?.name}</h2><p className="muted">{current?.description}</p></div><div className={validation.valid?'status':'status warning'}>{validation.valid?'Envelope checks passed':'Needs review'}</div></div>
    <div className="concepts">{designs.map((d,i)=><button key={d.id} className={i===selected?'concept selected':'concept'} onClick={()=>{setSelected(i);setActive(d.modules[0]?.id??'')}}><b>0{i+1}</b><span>{d.name}</span><small>{d.modules.length} modules</small></button>)}</div>
    <div className="viewport"><Scene design={current}/><div className="viewport-label">3D PREVIEW · DRAG TO ORBIT · SCROLL TO ZOOM</div></div>
    <div className="editor-grid"><section className="panel editor"><div className="row-between"><div><div className="eyebrow">MODULE EDITOR</div><h3>Components</h3></div><button className="small-button" onClick={addModule}>+ Add module</button></div><div className="module-list">{current.modules.map(m=><button key={m.id} className={chosen?.id===m.id?'module active-module':'module'} onClick={()=>setActive(m.id)}><span>{m.label}</span><small>{m.width.toFixed(2)}m × {m.height.toFixed(2)}m</small></button>)}</div>
     {chosen&&<div className="fields"><label>Label<input value={chosen.label} onChange={e=>updateModule({label:e.target.value})}/></label><label>Width (m)<input type="number" step=".01" value={chosen.width} onChange={e=>updateModule({width:Number(e.target.value)})}/></label><label>Height (m)<input type="number" step=".01" value={chosen.height} onChange={e=>updateModule({height:Number(e.target.value)})}/></label><label>Depth (m)<input type="number" step=".01" value={chosen.depth} onChange={e=>updateModule({depth:Number(e.target.value)})}/></label><label>X position (m)<input type="number" step=".01" value={chosen.x} onChange={e=>updateModule({x:Number(e.target.value)})}/></label><label>Finish<select value={chosen.finish} onChange={e=>updateModule({finish:e.target.value as Finish,materialCode:e.target.value.toUpperCase()})}>{Object.entries(FINISHES).map(([key,v])=><option key={key} value={key}>{v.label}</option>)}</select></label><button className="danger small-button" onClick={removeModule}>Remove selected module</button></div>}
    </section>
    <section className="panel summary"><div className="eyebrow">PROJECT SUMMARY</div><h3>Preliminary estimate</h3>{cost&&<><div className="metric"><span>Modules</span><b>{current.modules.length}</b></div><div className="metric"><span>Estimated panel area</span><b>{cost.panelAreaM2.toFixed(2)} m²</b></div><div className="metric"><span>Material allowance</span><b>{cost.materialCost.toLocaleString('en-US')} EGP</b></div><div className="metric"><span>Hardware allowance</span><b>{cost.hardwareAllowance.toLocaleString('en-US')} EGP</b></div><div className="total"><span>Indicative total</span><b>{cost.total.toLocaleString('en-US')} EGP</b></div></>}<p className="hint">Illustrative starter rates only; not a supplier quotation. Cut list is preliminary and must be checked by the workshop.</p>{!validation.valid&&<div className="errors">{validation.errors.map((e,i)=><p key={i}>{e}</p>)}</div>}</section></div>
   </section>
  </div><footer>DESIGN SCAPE AI · PARAMETRIC DESIGN WORKSPACE · DEVELOPMENT MVP</footer>
 </main>;
}
