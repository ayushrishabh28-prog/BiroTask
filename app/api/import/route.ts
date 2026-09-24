import { getChatGPTUser } from '@/app/chatgpt-auth';
import { templateKnowledge } from '@/lib/templates';
function safeURL(value:string){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')||!/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(u.hostname)||/\.(localhost|local|internal|test|invalid)$/i.test(u.hostname))throw new Error('Enter a public HTTPS website URL.');return u;}
export async function POST(req:Request){
 if(!await getChatGPTUser())return Response.json({error:'Please sign in to import a website.'},{status:401});
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 try{
 const payload=await req.json() as {url?:string};
 const candidate=new URL(String(payload.url));
 if(candidate.origin===new URL(req.url).origin&&candidate.pathname.startsWith('/templates/')){const k=templateKnowledge(candidate.pathname.split('/')[2]);if(k)return Response.json({...k.sources[0],id:crypto.randomUUID(),url:candidate.href});}
 let url=safeURL(String(payload.url).slice(0,2000));let response:Response|undefined;
 for(let i=0;i<4;i++){response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'User-Agent':'BotFoundry/1.0 (website knowledge importer)'}});if(response.status>=300&&response.status<400){url=safeURL(new URL(response.headers.get('location')||'',url).href);continue;}break;}
 if(!response?.ok)throw new Error('This page could not be imported. It may block automated access. You can paste its text instead.');
 if(!response.headers.get('content-type')?.includes('text/html'))throw new Error('Use a webpage URL. Document imports are not supported yet.');
 const reader=response.body!.getReader();let html='',size=0;const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2000000){await reader.cancel();throw new Error('This page is too large. Try a smaller page.');}html+=decoder.decode(value,{stream:true});}
 const decode=(s:string)=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>Number(n)<=0x10ffff?String.fromCodePoint(Number(n)):'');
 const title=decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||url.hostname).trim().slice(0,200);
 const content=decode(html.replace(/<(script|style|noscript|svg|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<\/(p|div|h[1-6]|li|section|article)>|<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\n\s*\n/g,'\n').trim().slice(0,80000);
 if(content.length<40)throw new Error('No readable text found. This page may need JavaScript. Paste its text manually.');
 return Response.json({id:crypto.randomUUID(),title,content,url:url.href});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Import failed. Try pasting the page text.'},{status:400});}
}

