import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {siteDraftJsonSchema,siteDraftSchema} from '@/lib/site-builder';
import {z} from 'zod';

export async function POST(req:Request){
 if(!await getChatGPTUser())return Response.json({error:'Please sign in to generate a website.'},{status:401});
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid request origin.'},{status:403});
 const runtime=env as unknown as {OPENAI_API_KEY?:string;OPENAI_MODEL?:string};
 if(!runtime.OPENAI_API_KEY)return Response.json({error:'AI generation is ready, but an OpenAI API key has not been connected yet.',code:'AI_NOT_CONFIGURED'},{status:503});
 try{
  const {prompt}=z.object({prompt:z.string().trim().min(20).max(4000)}).parse(await req.json());
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${runtime.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:runtime.OPENAI_MODEL||'gpt-6-luna',reasoning:{effort:'low'},input:[{role:'system',content:'You are an expert small-business web designer and conversion copywriter. Turn the brief into a complete, specific multi-section website concept. Vary layout, font and motion based on the business and tone. Use concrete, believable copy; never use filler. Keep services and serviceDetails the same length. Choose accessible brand and pale accent hex colours. Always return heroImage as an empty string because the user can upload their own image. Return only the required structured output.'},{role:'user',content:prompt}],text:{format:{type:'json_schema',name:'website_spec',strict:true,schema:siteDraftJsonSchema}}})});
  const result=await response.json() as {error?:{code?:string};output?:Array<{content?:Array<{type?:string;text?:string}>}>;model?:string;usage?:unknown};
  if(!response.ok){console.error('OpenAI generation failed',response.status,result?.error?.code);return Response.json({error:'AI generation could not complete. Please try again.'},{status:502});}
  const outputText=result.output?.flatMap(item=>item.content||[]).find(item=>item.type==='output_text')?.text;
  if(!outputText)throw new Error('The model returned no website specification.');
  const draft=siteDraftSchema.parse(JSON.parse(outputText));
  if(draft.serviceDetails.length!==draft.services.length)draft.serviceDetails=draft.services.map((service,index)=>draft.serviceDetails[index]||`${service} tailored to your needs.`);
  return Response.json({draft,model:result.model,usage:result.usage});
 }catch(error){console.error(error);return Response.json({error:error instanceof z.ZodError?'Add a little more detail to your website brief.':'AI generation could not complete. Please try again.'},{status:400});}
}
