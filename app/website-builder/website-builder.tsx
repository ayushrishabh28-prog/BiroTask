'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Check,Download,Monitor,Palette,RefreshCw,Save,Smartphone,Sparkles,WandSparkles} from 'lucide-react';

type Draft={name:string;category:string;headline:string;description:string;services:string[];contact:string;color:string;accent:string};
const initial:Draft={name:'Island Bloom Studio',category:'Creative studio',headline:'Ideas made clear, useful, and memorable.',description:'A thoughtful local studio helping growing businesses build a confident presence.',services:['Brand direction','Website design','Content support'],contact:'hello@islandbloom.example',color:'#315bea',accent:'#edf2ff'};
const presets:{match:RegExp;category:string;headline:string;description:string;services:string[]}[]=[
 {match:/dent|clinic|health/i,category:'Dental clinic',headline:'Care that makes every visit feel easier.',description:'Clear, considerate care for new and returning patients in a calm, welcoming space.',services:['Routine checkups','Professional cleaning','Smile consultations']},
 {match:/cafe|coffee|bakery|restaurant|food/i,category:'Café & food',headline:'Good food, warm service, and time well spent.',description:'Fresh flavors, familiar faces, and thoughtful service for everyday visits and special gatherings.',services:['Fresh daily menu','Group orders','Local catering']},
 {match:/plumb|repair|home|trade|electric/i,category:'Home services',headline:'Reliable help for the place you call home.',description:'Practical, dependable support for repairs, maintenance, and the jobs that keep a home running well.',services:['Repairs','Maintenance','Project quotes']},
 {match:/salon|beauty|spa|hair/i,category:'Beauty & wellness',headline:'Feel looked after from the moment you arrive.',description:'Personal service, thoughtful consultations, and a calm experience shaped around every client.',services:['Consultations','Signature services','Care plans']},
 {match:/fitness|gym|coach|training/i,category:'Fitness & coaching',headline:'A stronger routine starts with the right support.',description:'Friendly, focused coaching that helps people build confidence and make steady progress.',services:['Personal coaching','Group sessions','Progress plans']},
];
const colors=[['#315bea','#edf2ff'],['#166655','#e8f4ef'],['#8b4b31','#fff0dd'],['#7a4ca0','#f3ebfa'],['#b34b63','#fff0f3'],['#1f5d75','#e9f5f8']];
const clean=(value:string)=>value.replace(/[<>]/g,'').trim();
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));

function makeDraft(prompt:string,current:Draft):Draft{
 const preset=presets.find(item=>item.match.test(prompt));
 const quoted=prompt.match(/[“"]([^”"]{2,60})[”"]/i)?.[1];
 const named=prompt.match(/(?:called|named|for)\s+([A-Z][\w&' -]{2,50})(?=\s+(?:that|which|with|in|is|offers|provides)|[,.]|$)/)?.[1];
 const palette=prompt.match(/purple|violet/i)?colors[3]:prompt.match(/green|natural|earth/i)?colors[1]:prompt.match(/brown|coffee|warm/i)?colors[2]:prompt.match(/pink|rose/i)?colors[4]:prompt.match(/teal|ocean/i)?colors[5]:colors[0];
 return {...current,name:clean(quoted||named||current.name),category:preset?.category||current.category,headline:preset?.headline||current.headline,description:preset?.description||clean(prompt)||current.description,services:preset?.services||current.services,color:palette[0],accent:palette[1]};
}

function exportHtml(draft:Draft){
 const services=draft.services.map(service=>`<article><span>0${draft.services.indexOf(service)+1}</span><h3>${escapeHtml(service)}</h3><p>Thoughtful service shaped around your needs.</p></article>`).join('');
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(draft.name)}</title><style>*{box-sizing:border-box}body{margin:0;color:#17233a;font:16px Arial,sans-serif}nav,section,footer{padding:24px max(7vw,24px)}nav{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e8ef}nav strong{color:${draft.color};font-size:22px}.hero{padding-top:100px;padding-bottom:100px;background:${draft.accent}}.eyebrow{color:${draft.color};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase}.hero h1{max-width:850px;margin:18px 0;font:54px/1.08 Georgia,serif}.hero p{max-width:600px;line-height:1.8;color:#63708a}.hero a{display:inline-block;margin-top:20px;padding:14px 20px;border-radius:7px;background:${draft.color};color:white;text-decoration:none}.services{padding-top:75px;padding-bottom:75px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:25px;margin-top:35px}.grid article{border-top:2px solid ${draft.color};padding-top:20px}.grid span{color:${draft.color};font-size:11px}.grid h3{font-size:20px}.grid p{color:#738096;line-height:1.7}footer{display:flex;justify-content:space-between;gap:20px;background:#121b2e;color:white}@media(max-width:700px){.hero{padding-top:65px;padding-bottom:65px}.hero h1{font-size:38px}.grid{grid-template-columns:1fr}footer{flex-direction:column}}</style></head><body><nav><strong>${escapeHtml(draft.name)}</strong><span>${escapeHtml(draft.category)}</span></nav><section class="hero"><span class="eyebrow">${escapeHtml(draft.category)}</span><h1>${escapeHtml(draft.headline)}</h1><p>${escapeHtml(draft.description)}</p><a href="#services">Explore our services</a></section><section class="services" id="services"><span class="eyebrow">What we do</span><div class="grid">${services}</div></section><footer><strong>${escapeHtml(draft.name)}</strong><span>${escapeHtml(draft.contact)}</span></footer></body></html>`;
 const blob=new Blob([html],{type:'text/html'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=draft.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.html';link.click();URL.revokeObjectURL(url);
}

export function WebsiteBuilder(){
 const [draft,setDraft]=useState<Draft>(initial),[prompt,setPrompt]=useState('Create a modern, welcoming website for a local creative studio with a calm blue style.'),[device,setDevice]=useState<'desktop'|'mobile'>('desktop'),[saved,setSaved]=useState(false),[generated,setGenerated]=useState(false);
 useEffect(()=>{const raw=localStorage.getItem('botfoundry-website-draft');if(!raw)return;try{const stored=JSON.parse(raw) as Draft;queueMicrotask(()=>setDraft(stored));}catch{}},[]);
 function generate(){setDraft(current=>makeDraft(prompt,current));setGenerated(true);window.setTimeout(()=>setGenerated(false),1800);}
 function save(){localStorage.setItem('botfoundry-website-draft',JSON.stringify(draft));setSaved(true);window.setTimeout(()=>setSaved(false),1800);}
 const set=(key:keyof Draft,value:string|string[])=>setDraft(current=>({...current,[key]:value}));
 return <main className="builder-page" style={{'--site':draft.color,'--site-accent':draft.accent} as React.CSSProperties}>
  <header className="builder-topbar"><Link href="/"><ArrowLeft size={16}/>Back to BotFoundry</Link><div><span><WandSparkles size={18}/></span><strong>Website Studio</strong><small>Early access</small></div><nav><button onClick={save}><Save size={15}/>{saved?'Saved':'Save draft'}</button><button className="builder-export" onClick={()=>exportHtml(draft)}><Download size={15}/>Download website</button></nav></header>
  <section className="builder-intro"><span>NEW IN BOTFOUNDRY · GUIDED GENERATOR</span><h1>Describe the business.<br/>Shape the website.</h1><p>Create a polished first draft, edit every important detail, and preview it before publishing tools are connected.</p></section>
  <div className="builder-workspace">
   <aside className="builder-controls">
    <div className="builder-panel-title"><span><Sparkles size={17}/></span><div><strong>Website brief</strong><small>Tell us what you want to create.</small></div></div>
    <label className="builder-prompt">Describe your website<textarea rows={5} value={prompt} onChange={event=>setPrompt(event.target.value)} placeholder="A warm café website with an earthy brown style…"/></label>
    <button className="builder-generate" disabled={!prompt.trim()} onClick={generate}>{generated?<Check size={17}/>:<Sparkles size={17}/>} {generated?'Draft refreshed':'Create website draft'}</button>
    <div className="builder-divider"><span>Edit the result</span></div>
    <div className="builder-fields"><label>Business name<input value={draft.name} onChange={event=>set('name',event.target.value)}/></label><label>Business type<input value={draft.category} onChange={event=>set('category',event.target.value)}/></label><label>Headline<textarea rows={2} value={draft.headline} onChange={event=>set('headline',event.target.value)}/></label><label>Description<textarea rows={3} value={draft.description} onChange={event=>set('description',event.target.value)}/></label><label>Services <small>separate with commas</small><input value={draft.services.join(', ')} onChange={event=>set('services',event.target.value.split(',').map(item=>item.trim()).filter(Boolean).slice(0,3))}/></label><label>Contact<input value={draft.contact} onChange={event=>set('contact',event.target.value)}/></label></div>
    <div className="builder-palette"><span><Palette size={15}/>Brand color</span><div>{colors.map(([color,accent])=><button key={color} aria-label={`Use ${color}`} className={draft.color===color?'active':''} style={{background:color}} onClick={()=>setDraft(current=>({...current,color,accent}))}/>)}</div></div>
   </aside>
   <section className="builder-preview-area">
    <header><div><strong>Live preview</strong><span>Updates as you type</span></div><div className="builder-devices"><button className={device==='desktop'?'active':''} onClick={()=>setDevice('desktop')}><Monitor size={15}/>Desktop</button><button className={device==='mobile'?'active':''} onClick={()=>setDevice('mobile')}><Smartphone size={15}/>Mobile</button></div></header>
    <div className={'builder-frame '+device}>
     <div className="builder-browser"><div className="builder-browserbar"><i/><i/><i/><span>{draft.name.toLowerCase().replace(/[^a-z0-9]+/g,'')||'yourbusiness'}.com</span><RefreshCw size={11}/></div><div className="generated-site">
      <nav><strong>{draft.name||'Your business'}</strong><div><a href="#preview-services">Services</a><a href="#preview-about">About</a><a href="#preview-contact">Contact</a></div></nav>
      <section className="generated-hero"><span>{draft.category||'Local business'}</span><h2>{draft.headline||'A clear headline belongs here.'}</h2><p>{draft.description||'Describe the business and what makes it useful to customers.'}</p><button>Explore our services</button><b aria-hidden="true">{draft.name||'YOUR BUSINESS'}</b></section>
      <section className="generated-services" id="preview-services"><span>WHAT WE DO</span><h3>Made around what your customers need.</h3><div>{(draft.services.length?draft.services:['Your first service']).map((service,index)=><article key={service+index}><small>0{index+1}</small><strong>{service}</strong><p>Clear, thoughtful support from a team that cares about the details.</p></article>)}</div></section>
      <section className="generated-about" id="preview-about"><div><span>WHY CHOOSE US</span><h3>A business people can feel good about choosing.</h3></div><p>{draft.description}</p></section>
      <footer id="preview-contact"><strong>{draft.name}</strong><span>{draft.contact}</span></footer>
     </div></div>
    </div>
   </section>
  </div>
  <section className="builder-note"><Sparkles size={18}/><div><strong>This is the first website-builder foundation.</strong><p>The guided generator works now without an AI bill. The next stages can add real AI generation, multi-page websites, image creation, custom domains, publishing, and direct chatbot installation.</p></div></section>
 </main>;
}
