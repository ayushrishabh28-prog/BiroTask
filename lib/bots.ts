export type Source = {id:string; title:string; content:string; url?:string};
export type Rule = {id:string; trigger:string; reply:string};
export type Knowledge = {sources:Source[]; rules:Rule[]};
export type Business = {id:string; name:string; version:number; data:Knowledge & {trained?:Knowledge; trainedAt?:string}};
const normalize = (s:string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
export function answer(knowledge:Knowledge|undefined, question:string) {
 if(!knowledge) return {text:'This bot has not been trained yet. Add knowledge or a reply rule, then click Train bot.', source:'Not trained'};
 const exact=knowledge.rules.find(r=>normalize(r.trigger)===normalize(question));
 if(exact) return {text:exact.reply, source:'Reply rule · '+exact.trigger};
 const stop=new Set('what when where which does have with that this your you are the can how please tell about'.split(' '));
 const terms=[...new Set(normalize(question).split(' ').filter(t=>t.length>2&&!stop.has(t)))];
 const candidates=knowledge.sources.flatMap(s=>s.content.split(/\n+|(?<=[.!?])\s+/).filter(p=>p.trim()).map(p=>({text:p.trim(),source:s.title,score:terms.reduce((n,t)=>n+(normalize(p).split(' ').includes(t)?1:0),0)}))).sort((a,b)=>b.score-a.score);
 if(!terms.length||!candidates[0]?.score) return {text:'I don’t have that information yet. Please contact the business for help.',source:'Fallback · no matching knowledge'};
 return {text:candidates[0].text.slice(0,1800),source:'Knowledge excerpt · '+candidates[0].source};
}
