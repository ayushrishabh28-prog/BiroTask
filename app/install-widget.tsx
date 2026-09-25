'use client';

import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {usePathname} from 'next/navigation';
import {Check,Code2,Copy,ExternalLink,MonitorUp,X} from 'lucide-react';
import type {Business} from '@/lib/bots';

export function InstallWidget({business}:{business:Business}){
 const [open,setOpen]=useState(false),[copied,setCopied]=useState(false),[origin,setOrigin]=useState('');
 useEffect(()=>setOrigin(window.location.origin),[]);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};window.addEventListener('keydown',close);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',close);};},[open]);
 const trained=Boolean(business.data.trained);const website=business.data.sources.find(source=>source.url)?.url;
 const code=`<script src="${origin}/widget.js" data-business="${business.id}" defer></script>`;
 async function copy(){await navigator.clipboard.writeText(code);setCopied(true);window.setTimeout(()=>setCopied(false),1800);}
 const modal=open&&typeof document!=='undefined'?createPortal(<div className="install-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false);}}><section className="install-card" role="dialog" aria-modal="true" aria-label="Install chatbot"><button className="install-close" onClick={()=>setOpen(false)} aria-label="Close"><X size={19}/></button><span className="install-icon"><Code2 size={24}/></span><h2>Put {business.name}’s bot on its website.</h2><p>{trained?'Preview it on the imported website, then paste one line of code into the website.':'Train this bot first. Installation becomes available after the bot has a training snapshot.'}</p><div className="install-options"><a className={!trained?'disabled':''} href={trained?`/preview/${business.id}`:undefined} target="_blank" rel="noreferrer"><MonitorUp size={20}/><span><strong>Preview on website</strong><small>{website?'Opens the imported website with your bot overlaid.':'Import a website URL to use the real-site preview.'}</small></span><ExternalLink size={16}/></a><div className={!trained?'disabled':''}><Code2 size={20}/><span><strong>Embed code</strong><small>Add this before the website’s closing &lt;/body&gt; tag.</small></span></div></div><div className="code-box"><code>{trained?code:'Train the bot to generate installation code.'}</code><button disabled={!trained||!origin} onClick={()=>void copy()}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Copied':'Copy code'}</button></div><p className="install-footnote">Works on websites where you can add custom HTML or scripts, including WordPress, Shopify, Wix, Squarespace, and custom sites.</p></section></div>,document.body):null;
 return <><button className="secondary" onClick={()=>setOpen(true)}><MonitorUp size={16}/>Install & preview</button>{modal}</>;
}

export function InstallWidgetHub(){
 const pathname=usePathname();const [businesses,setBusinesses]=useState<Business[]>([]),[selected,setSelected]=useState('');
 useEffect(()=>{if(pathname!=='/')return;let active=true;const load=()=>fetch('/api/businesses').then(response=>response.ok?response.json() as Promise<{businesses:Business[]}>:null).then(result=>{if(!active||!result?.businesses)return;setBusinesses(result.businesses);setSelected(current=>result.businesses.some(item=>item.id===current)?current:result.businesses[0]?.id||'');}).catch(()=>{});void load();window.addEventListener('focus',load);const timer=window.setInterval(load,15000);return()=>{active=false;window.removeEventListener('focus',load);window.clearInterval(timer);};},[pathname]);
 if(pathname!=='/'||!businesses.length)return null;
 const business=businesses.find(item=>item.id===selected)||businesses[0];
 return <div className="install-hub"><select aria-label="Business to install" value={business.id} onChange={event=>setSelected(event.target.value)}>{businesses.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select><InstallWidget business={business}/></div>;
}
