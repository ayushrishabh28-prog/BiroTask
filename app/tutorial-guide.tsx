'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Bot, CircleHelp, Globe, MessageSquare, Sparkles, X, Zap } from 'lucide-react';

const steps = [
  { icon: Sparkles, eyebrow: 'WELCOME TO BOTFOUNDRY', title: 'One workspace. A bot for every business.', copy: 'Create a separate business folder, give its bot the right information, and test the customer experience before sharing it.' },
  { icon: Globe, eyebrow: 'STEP 1 · CHOOSE A START', title: 'Start fresh or use a demo.', copy: 'Create a business from your workspace, import a public website page, or choose one of the three complete demo businesses in the Demo gallery.' },
  { icon: BookOpen, eyebrow: 'STEP 2 · ADD KNOWLEDGE', title: 'Teach it the facts.', copy: 'Import a website URL or add text manually. Opening hours, services, locations, policies, and FAQs all belong in Knowledge.' },
  { icon: MessageSquare, eyebrow: 'STEP 3 · SHAPE REPLIES', title: 'Control the answers that matter.', copy: 'Reply rules connect a customer question to an exact answer. Add alternative phrases so greetings, reordered words, and common rephrasings are recognized.' },
  { icon: Zap, eyebrow: 'STEP 4 · TRAIN', title: 'Publish your saved changes to the bot.', copy: 'Saving edits keeps your work. Train bot creates the snapshot used by the studio tester, website preview, and installed chatbot.' },
  { icon: Bot, eyebrow: 'STEP 5 · PREVIEW & INSTALL', title: 'Try it where customers will.', copy: 'Use Install & preview to overlay the chatbot on an imported website, then copy the installation code into the real site.' },
];

export function TutorialGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (pathname !== '/' || localStorage.getItem('botfoundry-tour-seen')) return;
    const timer = window.setTimeout(() => setOpen(true), 550);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (pathname.startsWith('/templates/') || pathname.startsWith('/embed/') || pathname.startsWith('/preview/')) return null;
  const current = steps[step];
  const Icon = current.icon;
  const close = () => { localStorage.setItem('botfoundry-tour-seen', '1'); setOpen(false); };

  return <>
    <button className="tutorial-launcher" onClick={() => { setStep(0); setOpen(true); }}><CircleHelp size={16}/> How it works</button>
    {open&&<div className="tutorial-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)close();}}>
      <section className="tutorial-card" role="dialog" aria-modal="true" aria-label="How to use BotFoundry">
        <button className="tutorial-close" onClick={close} aria-label="Close tutorial"><X size={19}/></button>
        <div className="tutorial-visual"><span className="tutorial-orbit"><Icon size={34}/></span><div className="tutorial-mini-chat"><i/><i/><i/></div><strong>{String(step+1).padStart(2,'0')}</strong></div>
        <div className="tutorial-copy"><span>{current.eyebrow}</span><h2>{current.title}</h2><p>{current.copy}</p>
          <div className="tutorial-progress" aria-label={`Step ${step+1} of ${steps.length}`}>{steps.map((_,index)=><button key={index} className={index===step?'active':''} onClick={()=>setStep(index)} aria-label={`Go to step ${index+1}`}/>)}</div>
          <footer><button className="tutorial-back" disabled={step===0} onClick={()=>setStep(value=>value-1)}><ArrowLeft size={16}/> Back</button>{step===steps.length-1?<a className="tutorial-next" href="/demos" onClick={close}>Explore demos <ArrowRight size={16}/></a>:<button className="tutorial-next" onClick={()=>setStep(value=>value+1)}>Next <ArrowRight size={16}/></button>}</footer>
        </div>
      </section>
    </div>}
  </>;
}
