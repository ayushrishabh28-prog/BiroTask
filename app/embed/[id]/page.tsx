import {database} from '@/lib/database';
import {EmbedChat} from './embed-chat';

export default async function EmbedPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const row:any=await database().prepare('SELECT name,data FROM businesses WHERE id=?').bind(id).first();
 if(!row)return <main className="botfoundry-embed bf-widget-error">This chatbot is unavailable.</main>;
 const data=JSON.parse(row.data);
 if(!data.trained)return <main className="botfoundry-embed bf-widget-error">This chatbot has not been trained yet.</main>;
 const suggestions=(data.trained.rules||[]).slice(0,3).map((rule:{trigger:string})=>rule.trigger);
 return <main className="botfoundry-embed"><EmbedChat businessId={id} businessName={row.name} suggestions={suggestions}/></main>;
}
