export type Source = {id:string; title:string; content:string; url?:string};
export type Rule = {id:string; trigger:string; reply:string; aliases?:string[]};
export type Knowledge = {sources:Source[]; rules:Rule[]};
export type Business = {id:string; name:string; version:number; data:Knowledge & {trained?:Knowledge; trainedAt?:string; templateSlug?:string}};
export const normalizeCommand = (s:string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const filler = new Set('what are your the you do does is a an please me tell can could would kindly of'.split(' '));
function signature(text:string,semantic=true):string[] {
 const normal=normalizeCommand(text);
 if(semantic&&/^(hello|hi|hey|hiya|howdy|greetings|good morning|good afternoon|good evening)( there| everyone| folks| team)?$/.test(normal))return ['@greeting'];
 const words=normal.split(' ').filter(w=>w&&!filler.has(w)).map(w=>({opening:'open',opens:'open',times:'time',closing:'close',closes:'close'}[w]||w));
 const phrase=words.join(' ');
 if(semantic&&/^(open hours|business hours|working hours|hours open|when open|when close|time open|time close|open time|close time)$/.test(phrase))return ['@business-hours'];
 return words.sort();
}
const collapseStretchedLetters = (word:string) => word.replace(/(.)\1+/gu,'$1');
// A single insertion, removal, substitution, adjacent transposition, or a
// deliberately stretched letter ("yo" / "yoo"). Arbitrary short-word edits
// remain excluded so commands such as "hi" and "no" never become equivalent.
function oneTypo(a:string,b:string){
 if(a===b)return true;
 if(!a.startsWith('@')&&!b.startsWith('@')&&collapseStretchedLetters(a)===collapseStretchedLetters(b)&&collapseStretchedLetters(a).length>1)return true;
 if(Math.min(a.length,b.length)<4||a.startsWith('@')||b.startsWith('@')||Math.abs(a.length-b.length)>1)return false;
 if(a.length===b.length){const diffs=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])diffs.push(i);return diffs.length===1||(diffs.length===2&&diffs[1]===diffs[0]+1&&a[diffs[0]]===b[diffs[1]]&&a[diffs[1]]===b[diffs[0]]);}
 const shorter=a.length<b.length?a:b,longer=a.length<b.length?b:a;let i=0;while(i<shorter.length&&shorter[i]===longer[i])i++;return shorter.slice(i)===longer.slice(i+1);
}
function similarity(a:string[],b:string[]){
 if(!a.length||a.length!==b.length)return 0;
 const remaining=[...b],unmatched:string[]=[];
 for(const word of a){const i=remaining.indexOf(word);if(i>=0)remaining.splice(i,1);else unmatched.push(word);}
 if(!unmatched.length)return 2;
 return unmatched.length===1&&oneTypo(unmatched[0],remaining[0])?1:0;
}
function ruleReply(rules:Rule[],question:string){
 const normalized=normalizeCommand(question);
 const phrases=(r:Rule)=>[r.trigger,...(r.aliases||[])];
 const exact=rules.filter(r=>phrases(r).some(p=>normalizeCommand(p)===normalized));
 const q=signature(question);
 const ranked=rules.map(r=>({rule:r,score:Math.max(0,...phrases(r).map(p=>Math.max(similarity(q,signature(p)),similarity(signature(question,false),signature(p,false)))))}));
 const max=Math.max(0,...ranked.map(r=>r.score));
 const matches=exact.length?exact:max?ranked.filter(r=>r.score===max).map(r=>r.rule):[];
 if(!matches.length)return;
 if(new Set(matches.map(r=>r.reply)).size>1)return {text:'I found more than one possible reply. Could you be more specific?',source:'Clarification · overlapping reply rules'};
 return {text:matches[0].reply,source:(exact.length?'Reply rule':'Matched phrase')+' · '+matches[0].trigger};
}
export function answer(knowledge:Knowledge|undefined, question:string) {
 if(!knowledge)return {text:'This bot has not been trained yet. Add knowledge or a reply rule, then click Train bot.',source:'Not trained'};
 const match=ruleReply(knowledge.rules,question);if(match)return match;
 const stop=new Set('what when where which does have with that this your you are the can how please tell about'.split(' '));
 const terms=[...new Set(normalizeCommand(question).split(' ').filter(t=>t.length>2&&!stop.has(t)))];
 const candidates=knowledge.sources.flatMap(s=>s.content.split(/\n+|(?<=[.!?])\s+/).filter(p=>p.trim()).map(p=>({text:p.trim(),source:s.title,score:terms.reduce((n,t)=>n+(normalizeCommand(p).split(' ').includes(t)?1:0),0)}))).sort((a,b)=>b.score-a.score);
 if(!terms.length||!candidates[0]?.score)return {text:'I don’t have that information yet. Please contact the business for help.',source:'Fallback · no matching knowledge'};
 return {text:candidates[0].text.slice(0,1800),source:'Knowledge excerpt · '+candidates[0].source};
}
