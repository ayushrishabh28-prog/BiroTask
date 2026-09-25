import {database} from '@/lib/database';
import {EmbedChat} from '@/app/embed/[id]/embed-chat';

export default async function RealSitePreview({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const row:any=await database().prepare('SELECT name,data FROM businesses WHERE id=?').bind(id).first();
 if(!row)return <main className="real-site-preview preview-empty"><h1>Preview unavailable</h1><p>This business could not be found.</p><a href="/">Back to BotFoundry</a></main>;
 const data=JSON.parse(row.data);const source=(data.sources||[]).find((item:{url?:string})=>item.url);
 let website='';try{const parsed=new URL(source?.url||'');if(parsed.protocol==='http:'||parsed.protocol==='https:')website=parsed.toString();}catch{}
 const suggestions=(data.trained?.rules||[]).slice(0,3).map((rule:{trigger:string})=>rule.trigger);
 return <main className="real-site-preview"><header><div><strong>BotFoundry website preview</strong><span>{row.name}</span></div><p>{website?'Your trained chatbot is overlaid on the live website below.':'Import a website URL to preview the bot on that site.'}</p><a href={`/?business=${encodeURIComponent(id)}`}>Back to studio ↗</a></header>{website?<iframe src={website} title={`${row.name} website preview`}/>:<section className="preview-empty"><h1>No website URL yet</h1><p>Import a public website page in Knowledge, then return here.</p></section>}{data.trained&&<EmbedChat businessId={id} businessName={row.name} suggestions={suggestions}/>}<div className="preview-note">Some websites block being displayed inside previews. The installation code still works when added directly to the website.</div></main>;
}
