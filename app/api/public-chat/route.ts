import {database} from '@/lib/database';
import {answer} from '@/lib/bots';
import {z} from 'zod';

export async function POST(req:Request){
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid request origin.'},{status:403});
 try{
  const body=z.object({businessId:z.string().uuid(),question:z.string().trim().min(1).max(2000)}).parse(await req.json());
  const row:any=await database().prepare('SELECT data FROM businesses WHERE id=?').bind(body.businessId).first();
  if(!row)return Response.json({error:'This chatbot is unavailable.'},{status:404});
  const data=JSON.parse(row.data);
  if(!data.trained)return Response.json({error:'This chatbot has not been trained yet.'},{status:409});
  return Response.json(answer(data.trained,body.question));
 }catch(error){
  console.error(error);
  return Response.json({error:error instanceof z.ZodError?'Check your message and try again.':'The chatbot could not reply. Please try again.'},{status:400});
 }
}
