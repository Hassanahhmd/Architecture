'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { cutList, estimate, FINISHES, makeAlternatives, ProductType, Room, Design, Module, Finish, validateDesign } from '@/lib/model';
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

function download(name:string, content:string, type='application/json') {
 const blob = new Blob([content], {type});
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a'); a.href=url; a.download=name; a.click();
 URL.revokeObjectURL(url);
}
function mapApiDesign(d:any):Design {
 return {id:d.id,name:d.name,description:d.description,productType:d.product_type,accent:d.finish,
  modules:d.modules.map((m:any)=>({id:m.id,label:m.label,kind:m.kind,x:m.x_mm/1000,y:m.y_mm/1000,z:0,width:m.width_mm/1000,height:m.height_mm/1000,depth:m.depth_mm/1000,finish:m.finish,quantity:m.quantity,materialCode:m.finish.toUpperCase()}))};
}

export default function Home() {
 const [type,setType]=useState<ProductType>('kitchen');
 const [room,setRoom]=useState<Room>({width:4.2,depth:3.2,height:2.8});
 const [prompt,setPrompt]=useState('Modern luxury, warm neutral finishes, practical storage');
 const [reference,setReference]=useState<File|null>(null);
 const [designs,setDesigns]=useState<Design[]>(()=>makeAlternatives('kitchen',{width:4.2,depth:3.2,height:2.8}));
 const [selected,setSelected]=useState(0);
 const [active,setActive]=useState('');
 const [saved,setSaved]=useState(false);
 const [busy,setBusy]=useState(false);
 const [token,setToken]=useState('');
 const [account,setAccount]=useState<any>(null);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [authMode,setAuthMode]=useState<'login'|'register'>('register');
 const [authNotice,setAuthNotice]=useState('');
 const [projectName,setProjectName]=useState('My Design Scape Project');
 const [notice,setNotice]=useState('Five local parametric concepts are ready. Add an API key on the backend to enable AI text/image generation.');
 const current=designs[selected];
 const chosen=current?.modules.find(m=>m.id===active) ?? current?.modules[0];
 const validation=useMemo(()=>current?validateDesign(current,room):{valid:false,errors:[]},[current,room]);
 const cost=useMemo(()=>current?estimate(current):null,[current]);
 useEffect(()=>{const savedToken=localStorage.getItem('design-scape-token');if(savedToken){setToken(savedToken);fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000')+'/api/v1/auth/me',{headers:{Authorization:'Bearer '+savedToken}}).then(r=>r.ok?r.json():null).then(u=>{if(u)setAccount(u);else{localStorage.removeItem('design-scape-token');setToken('');}}).catch(()=>{});}},[]);
 function updateDesign(next:Design){setDesigns(old=>old.map((d,i)=>i===selected?next:d));setSaved(false);}
 function updateModule(patch:Partial<Module>){if(!chosen)return;updateDesign({...current,modules:current.modules.map(m=>m.id===chosen.id?{...m,...patch}:m)});}
 async function generate(){
  setBusy(true);setNotice('Generating five design alternatives…');
  const api=process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000';
  const dims={width_mm:Math.round(room.width*1000),depth_mm:Math.round(room.depth*1000),height_mm:Math.round(room.height*1000)};
  try{
   if(!token){setNotice('Sign in or create an account to use AI generation. Showing local concepts until you sign in.');throw new Error('Authentication required');}
   const form=new FormData();form.append('product_type',type);form.append('width_mm',String(dims.width_mm));form.append('depth_mm',String(dims.depth_mm));form.append('height_mm',String(dims.height_mm));form.append('prompt',prompt);
   if(reference)form.append('reference_image',reference);
   const ai=await fetch(api+'/api/v1/ai-concepts',{method:'POST',headers:{Authorization:'Bearer '+token},body:form});
   if(ai.ok){
    const payload=await ai.json();const next=(payload.designs||[]).map(mapApiDesign);
    if(next.length!==5)throw new Error('AI provider did not return exactly five designs.');
    setDesigns(next);setSelected(0);setActive(next[0]?.modules[0]?.id??'');setSaved(false);setAccount((u:any)=>u?{...u,credits:Math.max(0,u.credits-1)}:u);setNotice('Five AI-generated parametric concepts are ready. Review dimensions before using them.');return;
   }
   const aiError=await ai.json().catch(()=>({detail:'AI service unavailable'}));
   if(ai.status===401){setNotice('Please sign in to generate AI designs. Showing local concepts instead.');}
   else if(ai.status===402){setNotice('Your AI credits are exhausted. Showing local concepts instead.');}
   if(ai.status!==503) setNotice('AI generation unavailable: '+(aiError.detail||ai.statusText)+'. Loading local concepts instead.');
   else setNotice('AI key is not configured. Showing five local parametric concepts; configure OPENAI_API_KEY to enable prompt/image AI.');
  }catch(e){setNotice('AI service could not be reached. Showing local parametric concepts.');}
  try{
   const response=await fetch(api+'/api/v1/concepts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_type:type,room:dims,prompt,reference_image_present:!!reference})});
   if(response.ok){const next=(await response.json()).map(mapApiDesign);setDesigns(next);setSelected(0);setActive(next[0]?.modules[0]?.id??'');setSaved(false);return;}
  }catch{}
  const next=makeAlternatives(type,room);setDesigns(next);setSelected(0);setActive(next[0]?.modules[0]?.id??'');setSaved(false);
  setNotice(old=>old+' Local fallback is active; backend could not be reached.');
 }
 function addModule(){const id='custom-'+Date.now();const m:Module={id,label:'Custom module',x:Math.max(0,Math.min(room.width-.6,current.modules.length*.12)),y:0,z:0,width:.6,height:.88,depth:.6,finish:'oak',kind:type==='kitchen'?'base':'wardrobe',quantity:1,materialCode:'OAK'};updateDesign({...current,modules:[...current.modules,m]});setActive(id);}
 function removeModule(){if(!chosen)return;const remaining=current.modules.filter(m=>m.id!==chosen.id);updateDesign({...current,modules:remaining});setActive(remaining[0]?.id??'');}
 function saveLocal(){localStorage.setItem('design-scape-project',JSON.stringify({type,room,design:current,prompt}));setSaved(true);}
 async function authAction(){setAuthNotice('Working…');try{const api=process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000';const r=await fetch(api+'/api/v1/auth/'+authMode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const data=await r.json();if(!r.ok)throw new Error(data.detail||'Authentication failed');localStorage.setItem('design-scape-token',data.access_token);setToken(data.access_token);setAccount(data.user);setPassword('');setAuthNotice('Signed in successfully.');}catch(e:any){setAuthNotice(e.message||'Could not connect to the account service.');}}
 function logout(){localStorage.removeItem('design-scape-token');setToken('');setAccount(null);setAuthNotice('Signed out.');}
 async function saveCloud(){if(!token){setAuthNotice('Sign in before saving to cloud.');return;}try{const api=process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000';const r=await fetch(api+'/api/v1/projects',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({name:projectName,product_type:type,room,design:current})});const data=await r.json();if(!r.ok)throw new Error(data.detail||'Cloud save failed');setSaved(true);setAuthNotice('Project saved to your account.');}catch(e:any){setAuthNotice(e.message||'Cloud save failed.');}}
 async function loadLatestCloud(){if(!token){setAuthNotice('Sign in before loading cloud projects.');return;}try{const api=process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000';const r=await fetch(api+'/api/v1/projects',{headers:{Authorization:'Bearer '+token}});const data=await r.json();if(!r.ok)throw new Error(data.detail||'Could not load projects');if(!data.length){setAuthNotice('No cloud projects saved yet.');return;}const item=data[0];setType(item.product_type);setRoom(item.room);setDesigns([item.design]);setSelected(0);setActive(item.design.modules?.[0]?.id??'');setPrompt('');setAuthNotice('Loaded '+item.name+'.');}catch(e:any){setAuthNotice(e.message||'Could not load cloud projects.');}}
 function exportProject(){download('design-scape-project.json',JSON.stringify({schemaVersion:'1.0',project:'Design Scape AI',type,room,design:current,prompt,units:'meters',manufacturing:{warning:'Preliminary cut list only; verify construction rules and workshop standards before fabrication.'}},null,2));}
 function exportCut(){const rows=cutList(current);const header='Module,Part,Width_mm,Height_mm,Thickness_mm,Material,Quantity\n';download('design-scape-cut-list.csv',header+rows.map(r=>[r.module,r.part,r.width.toFixed(0),r.height.toFixed(0),r.thickness,r.material,r.qty].join(',')).join('\n'),'text/csv');}
 function exportObj(){let out='# Design Scape AI OBJ export\n',index=1;for(const m of current.modules){const {x,y,z,width:w,height:h,depth:d}=m;out+=`o ${m.id}\n`;const vertices=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];vertices.forEach(v=>out+=`v ${v.join(' ')}\n`);[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[4,0,3,7]].forEach(f=>out+=`f ${f.map(n=>n+index).join(' ')}\n`);index+=8;}download('design-scape-model.obj',out,'text/plain');}
 return <main className="shell">
  <header className="topbar"><div className="brand">DESIGN <span>SCAPE</span><small>AI STUDIO</small></div><div className="top-actions"><span className="pill">WORKSPACE / NEW PROJECT</span><span className="pill">MVP 0.4</span>{account?<button className="account-pill" onClick={logout}>{account.email} · {account.credits} AI credits · Sign out</button>:<span className="pill">Guest workspace</span>}</div></header>
  <div className="layout">
   <aside className="panel left"><div className="eyebrow">PROJECT SETUP</div><h1>Let’s design<br/>your space.</h1><p className="muted">Create editable kitchen and dressing concepts from dimensions, references and design instructions.</p>
    <section className="section"><label className="label">ACCOUNT & CLOUD PROJECTS</label>{!account?<><div className="auth-tabs"><button className={authMode==='register'?'auth-tab active':'auth-tab'} onClick={()=>setAuthMode('register')}>Create account</button><button className={authMode==='login'?'auth-tab active':'auth-tab'} onClick={()=>setAuthMode('login')}>Sign in</button></div><input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/><input className="auth-input" type="password" placeholder="Password · 10 characters minimum" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary full" onClick={authAction}>{authMode==='register'?'Create free account':'Sign in'}</button></>:<><p className="hint">Signed in as {account.email}. Free plan: {account.credits} AI credits remaining.</p><input className="auth-input" value={projectName} onChange={e=>setProjectName(e.target.value)} aria-label="Project name"/><div className="button-grid"><button onClick={saveCloud}>Save to cloud</button><button onClick={loadLatestCloud}>Load latest</button></div></>}{authNotice&&<p className="hint">{authNotice}</p>}</section>
    <section className="section"><label className="label">PROJECT TYPE</label><div className="tabs"><button className={type==='kitchen'?'tab active':'tab'} onClick={()=>setType('kitchen')}>Kitchen</button><button className={type==='dressing'?'tab active':'tab'} onClick={()=>setType('dressing')}>Dressing</button></div></section>
    <section className="section"><label className="label">ROOM DIMENSIONS · METERS</label><div className="dimensions">{(['width','depth','height'] as const).map(k=><label key={k}>{k}<input type="number" min=".5" step=".1" value={room[k]} onChange={e=>setRoom({...room,[k]:Math.max(.5,Number(e.target.value))})}/></label>)}</div></section>
    <section className="section"><label className="label">DESIGN DIRECTION</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={3}/><label className="label upload-label">REFERENCE IMAGE · OPTIONAL<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setReference(e.target.files?.[0]??null)}/></label>{reference&&<p className="hint">Selected: {reference.name} · uploaded only when AI generation is configured.</p>}<button className="primary full" disabled={busy} onClick={generate}>{busy?'Generating…':'Generate 5 concepts'}</button><p className="hint">{notice}</p></section>
    <section className="section"><label className="label">EXPORT & SAVE</label><div className="button-grid"><button onClick={saveLocal}>Save locally</button><button onClick={exportProject}>Project JSON</button><button onClick={exportObj}>3D OBJ</button><button onClick={exportCut}>Cut list CSV</button></div>{saved&&<p className="success">Saved in this browser.</p>}</section>
   </aside>
   <section className="workspace"><div className="workspace-head"><div><div className="eyebrow">DESIGN CANVAS</div><h2>{current?.name}</h2><p className="muted">{current?.description}</p></div><div className={validation.valid?'status':'status warning'}>{validation.valid?'Envelope checks passed':'Needs review'}</div></div>
    <div className="concepts">{designs.map((d,i)=><button key={d.id} className={i===selected?'concept selected':'concept'} onClick={()=>{setSelected(i);setActive(d.modules[0]?.id??'')}}><b>0{i+1}</b><span>{d.name}</span><small>{d.modules.length} modules</small></button>)}</div>
    <div className="viewport"><Scene design={current}/><div className="viewport-label">3D PREVIEW · DRAG TO ORBIT · SCROLL TO ZOOM</div></div>
    <div className="editor-grid"><section className="panel editor"><div className="row-between"><div><div className="eyebrow">MODULE EDITOR</div><h3>Components</h3></div><button className="small-button" onClick={addModule}>+ Add module</button></div><div className="module-list">{current.modules.map(m=><button key={m.id} className={chosen?.id===m.id?'module active-module':'module'} onClick={()=>setActive(m.id)}><span>{m.label}</span><small>{m.width.toFixed(2)}m × {m.height.toFixed(2)}m</small></button>)}</div>
     {chosen&&<div className="fields"><label>Label<input value={chosen.label} onChange={e=>updateModule({label:e.target.value})}/></label><label>Width (m)<input type="number" min=".05" step=".01" value={chosen.width} onChange={e=>updateModule({width:Math.max(.05,Number(e.target.value))})}/></label><label>Height (m)<input type="number" min=".05" step=".01" value={chosen.height} onChange={e=>updateModule({height:Math.max(.05,Number(e.target.value))})}/></label><label>Depth (m)<input type="number" min=".05" step=".01" value={chosen.depth} onChange={e=>updateModule({depth:Math.max(.05,Number(e.target.value))})}/></label><label>X position (m)<input type="number" min="0" step=".01" value={chosen.x} onChange={e=>updateModule({x:Math.max(0,Number(e.target.value))})}/></label><label>Finish<select value={chosen.finish} onChange={e=>updateModule({finish:e.target.value as Finish,materialCode:e.target.value.toUpperCase()})}>{Object.entries(FINISHES).map(([key,v])=><option key={key} value={key}>{v.label}</option>)}</select></label><button className="danger small-button" onClick={removeModule}>Remove selected module</button></div>}
    </section>
    <section className="panel summary"><div className="eyebrow">PROJECT SUMMARY</div><h3>Preliminary estimate</h3>{cost&&<><div className="metric"><span>Modules</span><b>{current.modules.length}</b></div><div className="metric"><span>Estimated panel area</span><b>{cost.panelAreaM2.toFixed(2)} m²</b></div><div className="metric"><span>Material allowance</span><b>{cost.materialCost.toLocaleString('en-US')} EGP</b></div><div className="metric"><span>Hardware allowance</span><b>{cost.hardwareAllowance.toLocaleString('en-US')} EGP</b></div><div className="total"><span>Indicative total</span><b>{cost.total.toLocaleString('en-US')} EGP</b></div></>}<p className="hint">Illustrative starter rates only; not a supplier quotation. Cut list is preliminary and must be checked by the workshop.</p>{!validation.valid&&<div className="errors">{validation.errors.map((e,i)=><p key={i}>{e}</p>)}</div>}</section></div>
   </section>
  </div><footer>DESIGN SCAPE AI · PARAMETRIC DESIGN WORKSPACE · DEVELOPMENT MVP</footer>
 </main>;
}
