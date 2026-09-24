import { getChatGPTUser } from '@/app/chatgpt-auth';
import { database } from '@/lib/database';
import { answer, normalizeCommand } from '@/lib/bots';
import { templates, templateKnowledge } from '@/lib/templates';
import { z } from 'zod';
const source=z.object({id:z.string().max(100),title:z.string().trim().min(1).max(200),content:z.string().trim().min(1).max(80000),url:z.string().max(2000).optional()});
const rule=z.object({id:z.string().max(100),trigger:z.string().trim().min(1).max(500),reply:z.string().trim().min(1).max(5000),aliases:z.array(z.string().trim().min(1).max(500)).max(20).optional()});
export async function GET(){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in to load your businesses.'},{status:401});
 try{const rows=await database().prepare('SELECT id,name,data,version FROM businesses WHERE owner=? ORDER BY rowid').bind(user.userId).all();return Response.json({businesses:rows.results.map((r:any)=>({...r,data:JSON.parse(r.data)}))});}catch(e){console.error(e);return Response.json({error:'Could not load your businesses. Please try again.'},{status:503});}
}
export async function POST(req:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Please sign in to save changes.'},{status:401});
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid request origin'},{status:403});
 try{
 const text=await req.text();if(text.length>2000000)return Response.json({error:'This business has too much content.'},{status:413});
 const p=JSON.parse(text);const db=database();
 if(p.action==='template'){const t=templates.find(t=>t.slug===p.slug);if(!t)return Response.json({error:'Template not found.'},{status:404});const k=templateKnowledge(t.slug)!;const id=crypto.randomUUID();await db.prepare('INSERT INTO businesses (id,owner,name,data,version) VALUES (?,?,?,?,0)').bind(id,user.userId,t.name+' (demo)',JSON.stringify({...k,templateSlug:t.slug,trained:k,trainedAt:new Date().toISOString()})).run();return Response.json({id});}
 if(p.action==='create') {const name=z.string().trim().min(1).max(100).parse(p.name);const id=crypto.randomUUID();await db.prepare('INSERT INTO businesses (id,owner,name,data,version) VALUES (?,?,?,?,0)').bind(id,user.userId,name,JSON.stringify({sources:[],rules:[]})).run();return Response.json({id});}
 const row:any=await db.prepare('SELECT * FROM businesses WHERE id=? AND owner=?').bind(String(p.id),user.userId).first();
 if(!row)return Response.json({error:'Business not found.'},{status:404});
 const data=JSON.parse(row.data);
 if(p.action==='chat')return Response.json(answer(data.trained,z.string().trim().min(1).max(2000).parse(p.question)));
 if(p.version!==row.version)return Response.json({error:'This business changed in another window. Reload before saving.'},{status:409});
 if(p.action==='save'){const parsed=z.object({sources:z.array(source).max(100),rules:z.array(rule).max(200)}).parse(p.data);const used=new Map<string,string>();for(const r of parsed.rules){for(const phrase of [r.trigger,...(r.aliases||[])]){const key=normalizeCommand(phrase);if(!key)return Response.json({error:'A command must contain letters or numbers.'},{status:400});if(used.has(key)&&used.get(key)!==r.id)return Response.json({error:'Two rules use the same command or alternative phrase. Give each phrase one reply.'},{status:400});used.set(key,r.id);}}data.sources=parsed.sources;data.rules=parsed.rules;}
 else if(p.action==='train'){if(!data.sources.length&&!data.rules.length)return Response.json({error:'Add at least one source or reply rule first.'},{status:400});data.trained={sources:data.sources,rules:data.rules};data.trainedAt=new Date().toISOString();}
 else return Response.json({error:'Unknown action'},{status:400});
 const updated=await db.prepare('UPDATE businesses SET data=?, version=version+1 WHERE id=? AND owner=? AND version=?').bind(JSON.stringify(data),p.id,user.userId,p.version).run();
 if(!updated.meta.changes)return Response.json({error:'The business changed. Reload before saving.'},{status:409});
 return Response.json({ok:true});
 }catch(e){console.error(e);return Response.json({error:e instanceof z.ZodError?'Check the fields and content limits.':'Could not save this change. Please try again.'},{status:400});}
}
