'use client';

import {FormEvent,useEffect,useRef,useState} from 'react';
import {Bot,MessageCircle,Send,X} from 'lucide-react';

type Message={role:'bot'|'user';text:string;source?:string};

export function EmbedChat({businessId,businessName,suggestions=[]}:{businessId:string;businessName:string;suggestions?:string[]}){
 const [open,setOpen]=useState(false),[question,setQuestion]=useState(''),[sending,setSending]=useState(false),[messages,setMessages]=useState<Message[]>([{role:'bot',text:`Hi! I’m the ${businessName} assistant. How can I help?`}]);
 const historyRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{window.parent.postMessage({type:'botfoundry:resize',businessId,open},'*');},[businessId,open]);
 useEffect(()=>{historyRef.current?.scrollTo({top:historyRef.current.scrollHeight,behavior:'smooth'});},[messages,sending]);
 async function send(raw:string){const value=raw.trim();if(!value||sending)return;setSending(true);setQuestion('');setMessages(current=>[...current,{role:'user',text:value}]);try{const response=await fetch('/api/public-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId,question:value})});const result=await response.json() as {text?:string;source?:string;error?:string};setMessages(current=>[...current,{role:'bot',text:response.ok&&result.text?result.text:result.error||'I could not reply. Please try again.' ,source:result.source}]);}catch{setMessages(current=>[...current,{role:'bot',text:'I could not connect just now. Please try again.'}]);}finally{setSending(false);}}
 function submit(event:FormEvent){event.preventDefault();void send(question);}
 return <aside className="bf-widget" aria-label={`${businessName} chatbot`}>
  {open&&<section className="bf-widget-window" role="dialog" aria-label={`Chat with ${businessName}`}><header><span><Bot size={20}/></span><div><strong>{businessName}</strong><small>Online · Powered by BotFoundry</small></div><button onClick={()=>setOpen(false)} aria-label="Close chatbot"><X size={19}/></button></header><div className="bf-widget-history" aria-live="polite" aria-busy={sending} ref={historyRef}>{messages.map((message,index)=><div className={`bf-widget-message ${message.role}`} key={index}><p>{message.text}</p>{message.source&&<small>{message.source}</small>}</div>)}</div>{messages.length===1&&suggestions.length>0&&<div className="bf-widget-suggestions">{suggestions.slice(0,3).map(item=><button key={item} onClick={()=>void send(item)}>{item}</button>)}</div>}<form onSubmit={submit}><input aria-label="Message the business chatbot" maxLength={2000} onChange={event=>setQuestion(event.target.value)} placeholder="Type a question…" value={question}/><button aria-label="Send message" disabled={sending||!question.trim()}><Send size={17}/></button></form><footer>Powered by BotFoundry</footer></section>}
  <button className="bf-widget-launcher" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>{open?<X size={21}/>:<MessageCircle size={21}/>}<span>{open?'Close':'Chat with us'}</span></button>
 </aside>;
}
