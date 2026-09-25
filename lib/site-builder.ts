import {z} from 'zod';

export const siteDraftSchema=z.object({
 name:z.string().trim().min(1).max(80),category:z.string().trim().min(1).max(80),
 headline:z.string().trim().min(1).max(140),description:z.string().trim().min(1).max(500),
 services:z.array(z.string().trim().min(1).max(80)).min(1).max(6),
 serviceDetails:z.array(z.string().trim().min(1).max(240)).min(1).max(6),
 contact:z.string().trim().min(1).max(120),color:z.string().regex(/^#[0-9a-f]{6}$/i),accent:z.string().regex(/^#[0-9a-f]{6}$/i),
 layout:z.enum(['split','centered','editorial']),heroKicker:z.string().trim().min(1).max(60),primaryCta:z.string().trim().min(1).max(40),
 servicesTitle:z.string().trim().min(1).max(110),aboutTitle:z.string().trim().min(1).max(110),aboutText:z.string().trim().min(1).max(500),
 ctaTitle:z.string().trim().min(1).max(110),ctaText:z.string().trim().min(1).max(300),ctaButton:z.string().trim().min(1).max(40),
 font:z.enum(['modern','classic','friendly','editorial']),motion:z.enum(['subtle','playful','none']),heroImage:z.string().max(1500000),
});
export type SiteDraft=z.infer<typeof siteDraftSchema>;

export const initialSiteDraft:SiteDraft={name:'Island Bloom Studio',category:'Creative studio',headline:'Ideas made clear, useful, and memorable.',description:'A thoughtful local studio helping growing businesses build a confident presence.',services:['Brand direction','Website design','Content support'],serviceDetails:['A practical identity system that makes your business recognizable.','A responsive home for your story, services, and next enquiry.','Clear words and visuals shaped for the channels your customers use.'],contact:'hello@islandbloom.example',color:'#315bea',accent:'#edf2ff',layout:'split',heroKicker:'Independent creative studio',primaryCta:'Start a project',servicesTitle:'Everything your business needs to show up clearly.',aboutTitle:'Small team. Useful ideas. Work made to last.',aboutText:'We combine clear thinking with careful craft, keeping the process collaborative from the first conversation to launch.',ctaTitle:'Have a project in mind?',ctaText:'Tell us where you want the business to go. We will help shape the clearest route there.',ctaButton:'Talk to our studio',font:'modern',motion:'subtle',heroImage:''};

const presets=[
 {match:/\b(?:dentist|dental|clinic|healthcare)\b/i,category:'Dental clinic',headline:'Care that makes every visit feel easier.',description:'Clear, considerate care for new and returning patients in a calm, welcoming space.',services:['Routine checkups','Professional cleaning','Smile consultations']},
 {match:/\b(?:cafe|café|coffee|bakery|restaurant|food)\b/i,category:'Café & food',headline:'Good food, warm service, and time well spent.',description:'Fresh flavours, familiar faces, and thoughtful service for everyday visits and special gatherings.',services:['Fresh daily menu','Group orders','Local catering']},
 {match:/\b(?:clean|cleaner|cleaning|laundry|housekeeping)\b/i,category:'Cleaning services',headline:'Come home to a space that feels cared for.',description:'Reliable cleaning for busy homes and workplaces, delivered with care and close attention to detail.',services:['Regular cleaning','Deep cleaning','Commercial cleaning']},
 {match:/\b(?:plumber|plumbing|repairs?|handyman|electrician)\b/i,category:'Home services',headline:'Reliable help for the place you call home.',description:'Practical support for repairs, maintenance, and the jobs that keep a home running well.',services:['Repairs','Maintenance','Project quotes']},
 {match:/\b(?:salon|beauty|spa|hairdresser)\b/i,category:'Beauty & wellness',headline:'Leave feeling more like yourself.',description:'Personal service and thoughtful consultations in a calm space made for you.',services:['Consultations','Signature services','Care plans']},
 {match:/\b(?:fitness|gym|coach|training)\b/i,category:'Fitness & coaching',headline:'Build strength that stays with you.',description:'Focused coaching that turns ambitious goals into a routine you can keep.',services:['Personal coaching','Group sessions','Progress plans']},
];
const palettes=[['#315bea','#edf2ff'],['#166655','#e8f4ef'],['#8b4b31','#fff0dd'],['#7a4ca0','#f3ebfa'],['#b34b63','#fff0f3'],['#1f5d75','#e9f5f8']];
const clean=(v:string)=>v.replace(/[<>]/g,'').trim();
const title=(v:string)=>clean(v).replace(/\b\w/g,l=>l.toUpperCase());
const sentence=(v:string)=>{const t=clean(v).replace(/\s+/g,' ');return t?t[0].toUpperCase()+t.slice(1).replace(/[.!?, ]+$/,'')+'.':'';};
export function createGuidedDraft(prompt:string,current:SiteDraft):SiteDraft{
 const preset=presets.find(x=>x.match.test(prompt));
 const quoted=prompt.match(/[“\"]([^”\"]{2,60})[”\"]/i)?.[1];
 const named=prompt.match(/(?:called|named|for)\s+([A-Z][\w&' -]{2,50})(?=\s+(?:that|which|with|in|is|offers|provides)|[,.]|$)/)?.[1];
 const serviceText=prompt.match(/(?:services?\s*(?:include|are|:)|offers?|provides?|speciali[sz](?:e|es) in)\s+([^.!?]+)/i)?.[1];
 const requested=serviceText?.split(/,|\s+and\s+/i).map(title).filter(x=>x.length>1).slice(0,6);
 const services=requested?.length?requested:preset?.services||current.services;
 const palette=prompt.match(/purple|violet/i)?palettes[3]:prompt.match(/green|natural|earth/i)?palettes[1]:prompt.match(/brown|coffee|warm/i)?palettes[2]:prompt.match(/pink|rose/i)?palettes[4]:prompt.match(/teal|ocean/i)?palettes[5]:palettes[0];
 const layout=prompt.match(/editorial|bold|luxury|magazine/i)?'editorial':prompt.match(/minimal|simple|calm|centered/i)?'centered':'split';
 const name=clean(quoted||named||current.name),category=preset?.category||current.category;
 const font=prompt.match(/luxury|editorial|magazine/i)?'editorial':prompt.match(/friendly|playful|children/i)?'friendly':prompt.match(/traditional|classic|elegant/i)?'classic':'modern';
 const motion=prompt.match(/playful|energetic|bold/i)?'playful':prompt.match(/no animation|static/i)?'none':'subtle';
 return {...current,name,category,headline:preset?.headline||sentence(prompt),description:preset?.description||sentence(prompt),services,serviceDetails:services.map((s,i)=>`${s} shaped around real customer needs, with clear guidance and attentive support${i===0?' from the very first step':''}.`),color:palette[0],accent:palette[1],layout,font,motion,heroKicker:`Welcome to ${name}`,primaryCta:category.includes('Café')?'View the menu':category.includes('Cleaning')?'Get a free quote':'Start a conversation',servicesTitle:`Practical ${category.toLowerCase()} support, designed around you.`,aboutTitle:`Local care, clear communication, and work we stand behind.`,aboutText:`At ${name}, every detail starts with listening. Our team keeps the experience simple, personal, and focused on results that matter.`,ctaTitle:`Ready to work with ${name}?`,ctaText:'Share what you need and our team will help you choose the right next step.',ctaButton:'Get in touch'};
}

export const siteDraftJsonSchema={type:'object',additionalProperties:false,required:Object.keys(siteDraftSchema.shape),properties:{name:{type:'string'},category:{type:'string'},headline:{type:'string'},description:{type:'string'},services:{type:'array',minItems:1,maxItems:6,items:{type:'string'}},serviceDetails:{type:'array',minItems:1,maxItems:6,items:{type:'string'}},contact:{type:'string'},color:{type:'string',pattern:'^#[0-9A-Fa-f]{6}$'},accent:{type:'string',pattern:'^#[0-9A-Fa-f]{6}$'},layout:{type:'string',enum:['split','centered','editorial']},heroKicker:{type:'string'},primaryCta:{type:'string'},servicesTitle:{type:'string'},aboutTitle:{type:'string'},aboutText:{type:'string'},ctaTitle:{type:'string'},ctaText:{type:'string'},ctaButton:{type:'string'},font:{type:'string',enum:['modern','classic','friendly','editorial']},motion:{type:'string',enum:['subtle','playful','none']},heroImage:{type:'string'}}} as const;
